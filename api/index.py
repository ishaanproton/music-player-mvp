from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ytmusicapi import YTMusic
import httpx
import re

app = FastAPI(title="Music Player MVP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

yt = YTMusic()

def format_track(result):
    thumbnails = result.get('thumbnails', [])
    thumbnail_url = thumbnails[-1]['url'] if thumbnails else ""
    artists = result.get('artists', [])
    artist_name = ", ".join([a['name'] for a in artists]) if artists else "Unknown Artist"
    artist_id = artists[0].get('id') if artists else None
    
    album = result.get('album')
    album_name = ""
    album_id = None
    if isinstance(album, dict):
        album_name = album.get('name', "")
        album_id = album.get('id')
    elif isinstance(album, str):
        album_name = album
        
    duration_seconds = result.get('duration_seconds', 0)
    return {
        "id": result.get('videoId'),
        "title": result.get('title'),
        "artist": artist_name,
        "artistId": artist_id,
        "album": album_name,
        "albumId": album_id,
        "duration": duration_seconds,
        "thumbnail": thumbnail_url,
        "ytmusicUrl": f"https://music.youtube.com/watch?v={result.get('videoId')}"
    }

@app.get("/search")
async def search_tracks(q: str):
    try:
        results = yt.search(q, filter="songs", limit=20)
        return {"tracks": [format_track(r) for r in results]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/home")
async def get_home():
    try:
        # Since get_charts can be flaky depending on region/version, 
        # we will fetch top hits and trending via standard queries
        trending_results = yt.search("Trending Songs", filter="songs", limit=10)
        top_hits_results = yt.search("Global Top Hits", filter="songs", limit=10)
        quick_picks_results = yt.search("Top Pop Hits Quick Picks", filter="songs", limit=10)
        albums_results = yt.search("Top Popular Albums", filter="albums", limit=10)

        def format_albums(results):
            formatted = []
            for result in results:
                thumbnails = result.get('thumbnails', [])
                thumbnail_url = thumbnails[-1]['url'] if thumbnails else ""
                artists = result.get('artists', [])
                artist_name = ", ".join([a['name'] for a in artists if a['name'] != 'Album']) if artists else "Unknown Artist"
                artist_id = artists[0].get('id') if artists else None
                formatted.append({
                    "id": result.get('browseId'),
                    "title": result.get('title'),
                    "artist": artist_name,
                    "artistId": artist_id,
                    "thumbnail": thumbnail_url,
                    "type": "album"
                })
            return formatted

        return {
            "trending": [format_track(r) for r in trending_results],
            "topHits": [format_track(r) for r in top_hits_results],
            "quickPicks": [format_track(r) for r in quick_picks_results],
            "albums": format_albums(albums_results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/artist")
async def get_artist(id: str):
    try:
        artist_info = yt.get_artist(id)
        
        # Format top songs
        songs = artist_info.get("songs", {}).get("results", [])
        formatted_songs = [format_track(s) for s in songs]
        
        # Format albums
        albums = artist_info.get("albums", {}).get("results", [])
        formatted_albums = []
        for a in albums:
            thumbnails = a.get('thumbnails', [])
            thumbnail_url = thumbnails[-1]['url'] if thumbnails else ""
            formatted_albums.append({
                "id": a.get('browseId'),
                "title": a.get('title'),
                "artist": artist_info.get('name'),
                "artistId": id,
                "thumbnail": thumbnail_url,
                "type": "album",
                "year": a.get('year')
            })
            
        # Format related artists
        related = artist_info.get("related", {}).get("results", [])
        formatted_related = []
        for r in related:
            thumbnails = r.get('thumbnails', [])
            thumbnail_url = thumbnails[-1]['url'] if thumbnails else ""
            formatted_related.append({
                "id": r.get('browseId'),
                "name": r.get('title'),
                "thumbnail": thumbnail_url
            })

        return {
            "name": artist_info.get("name"),
            "description": artist_info.get("description"),
            "thumbnails": artist_info.get("thumbnails"),
            "songs": formatted_songs,
            "albums": formatted_albums,
            "related": formatted_related,
            "subscribers": artist_info.get("subscribers")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/album")
async def get_album(id: str):
    try:
        album_info = yt.get_album(id)
        tracks = album_info.get("tracks", [])
        formatted_tracks = []
        for track in tracks:
            artists = track.get('artists', [])
            artist_name = ", ".join([a['name'] for a in artists]) if artists else "Unknown Artist"
            duration_seconds = track.get('duration_seconds', 0)
            thumbnail = album_info.get('thumbnails', [{}])[-1].get('url', '')
            if not thumbnail and track.get('thumbnails'):
                thumbnail = track.get('thumbnails')[-1]['url']
            
            formatted_tracks.append({
                "id": track.get('videoId'),
                "title": track.get('title'),
                "artist": artist_name,
                "album": album_info.get('title', ''),
                "duration": duration_seconds,
                "thumbnail": thumbnail,
                "ytmusicUrl": f"https://music.youtube.com/watch?v={track.get('videoId')}" if track.get('videoId') else ""
            })
        return {"tracks": [t for t in formatted_tracks if t['id']]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/radio")
async def get_radio(id: str):
    """
    Get YouTube Music's 'Up Next' recommendations for a given track.
    This uses YTMusic's own recommendation engine — the same one that powers
    the radio/autoplay feature, giving genuinely related songs.
    """
    try:
        # get_watch_playlist returns the 'Up Next' queue YouTube Music builds
        # for any given track. limit controls how many related tracks to return.
        watch_playlist = yt.get_watch_playlist(videoId=id, limit=25)
        tracks_raw = watch_playlist.get("tracks", [])
        
        formatted = []
        for t in tracks_raw:
            vid = t.get("videoId")
            if not vid or vid == id:  # skip the current track itself
                continue
            thumbnails = t.get("thumbnail", [])
            if isinstance(thumbnails, list) and thumbnails:
                thumb_url = thumbnails[-1].get("url", "")
            else:
                thumb_url = ""
            artists = t.get("artists") or []
            artist_name = ", ".join([a["name"] for a in artists if a.get("name")]) or "Unknown Artist"
            artist_id = artists[0].get("id") if artists else None
            album = t.get("album")
            album_name = album.get("name", "") if isinstance(album, dict) else ""
            
            formatted.append({
                "id": vid,
                "title": t.get("title", ""),
                "artist": artist_name,
                "artistId": artist_id,
                "album": album_name,
                "albumId": None,
                "duration": t.get("duration_seconds", 0),
                "thumbnail": thumb_url,
                "ytmusicUrl": f"https://music.youtube.com/watch?v={vid}"
            })
        
        return {"tracks": formatted}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/lyrics")
async def get_lyrics(id: str):
    try:
        watch_playlist = yt.get_watch_playlist(videoId=id)
        lyrics_id = watch_playlist.get("lyrics")
        if not lyrics_id:
            return {"text": "No lyrics available for this track.", "source": ""}
        lyrics_data = yt.get_lyrics(lyrics_id)
        return {
            "text": lyrics_data.get("lyrics", ""),
            "source": lyrics_data.get("source", "Unknown")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def parse_lrc(lrc_text: str):
    """Parse LRC format into list of {time (seconds), text} dicts."""
    lines = []
    pattern = re.compile(r'\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)')
    for line in lrc_text.split('\n'):
        match = pattern.match(line.strip())
        if match:
            minutes = int(match.group(1))
            seconds = int(match.group(2))
            centiseconds = int(match.group(3))
            if len(match.group(3)) == 2:
                frac = centiseconds / 100.0
            else:
                frac = centiseconds / 1000.0
            time_s = minutes * 60 + seconds + frac
            text = match.group(4).strip()
            if text:
                lines.append({"time": round(time_s, 2), "text": text})
    return lines

@app.get("/lrclyrics")
async def get_lrc_lyrics(title: str, artist: str, track_id: str = None):
    """
    Fetch synced (timestamped) lyrics from LrcLib.
    Returns list of { time: float (seconds), text: str } objects.
    """
    error_msg = ""
    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(
                "https://lrclib.net/api/search",
                params={"track_name": title, "artist_name": artist},
                headers={"User-Agent": "MusicPlayerMVP/1.0 (https://github.com/example/music-player-mvp)"}
            )
            if resp.status_code == 200:
                results = resp.json()
                if results:
                    # Prefer a result with syncedLyrics (timestamped LRC)
                    best = None
                    for r in results:
                        if r.get("syncedLyrics"):
                            best = r
                            break

                    if best and best.get("syncedLyrics"):
                        lines = parse_lrc(best["syncedLyrics"])
                        return {"lines": lines, "synced": True}

                    # Fallback: return plain text with no timestamps
                    plain = results[0].get("plainLyrics", "")
                    if plain:
                        plain_lines = [{"time": None, "text": l} for l in plain.split('\n') if l.strip()]
                        return {"lines": plain_lines, "synced": False}
            else:
                error_msg = f"LrcLib returned {resp.status_code}"
    except Exception as e:
        error_msg = str(e)
        
    # Fallback to ytmusicapi if lrclib fails or returns no lyrics
    if track_id:
        try:
            watch_playlist = yt.get_watch_playlist(videoId=track_id)
            lyrics_id = watch_playlist.get("lyrics")
            if lyrics_id:
                lyrics_data = yt.get_lyrics(lyrics_id)
                plain = lyrics_data.get("lyrics", "")
                if plain:
                    plain_lines = [{"time": None, "text": l} for l in plain.split('\n') if l.strip()]
                    return {"lines": plain_lines, "synced": False}
        except Exception as e:
            error_msg += f" | YTMusic error: {str(e)}"

    return {"lines": [], "synced": False, "error": error_msg or "No lyrics found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
