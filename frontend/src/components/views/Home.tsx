import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { db } from '../../services/db';
import { usePlayerStore } from '../../store/usePlayerStore';
import type { Track, Album } from '../../types';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { TrackContextMenu } from '../shared/TrackContextMenu';

const GENRES = [
    { name: 'Pop', color: 'from-pink-500 to-purple-600', image: '/genres/pop.png' },
    { name: 'Rock', color: 'from-red-600 to-black', image: '/genres/rock.png' },
    { name: 'Hip-Hop', color: 'from-blue-600 to-indigo-900', image: '/genres/hiphop.png' },
    { name: 'Electronic', color: 'from-cyan-500 to-blue-500', image: '/genres/electronic.png' },
    { name: 'Jazz', color: 'from-yellow-600 to-orange-800', image: '/genres/pop.png' },
    { name: 'Classical', color: 'from-emerald-500 to-teal-700', image: '/genres/electronic.png' },
];

const TrackCard = ({ track, tracks }: { track: Track, tracks: Track[] }) => {
    const { playTrack, currentTrack, isPlaying, togglePlayPause, setActiveArtistId } = usePlayerStore();
    const isCurrent = currentTrack?.id === track.id;

    return (
        <div 
            className="group flex-shrink-0 w-48 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer relative"
            onDoubleClick={() => playTrack(track, tracks)}
        >
            <div className="relative w-full aspect-square mb-3 shadow-lg rounded-md overflow-hidden">
                <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        isCurrent ? togglePlayPause() : playTrack(track, tracks);
                    }}
                    className={`absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-xl 
                    translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all z-10
                    ${isCurrent ? 'opacity-100 translate-y-0' : ''}`}
                >
                    {isCurrent && isPlaying ? (
                        <div className="flex items-end justify-center space-x-[2px] h-4 w-4">
                            <div className="w-1 bg-black animate-[bounce_0.8s_infinite] h-2"></div>
                            <div className="w-1 bg-black animate-[bounce_1s_infinite] h-4"></div>
                            <div className="w-1 bg-black animate-[bounce_0.9s_infinite] h-3"></div>
                        </div>
                    ) : (
                        <Play className="w-5 h-5 fill-black text-black ml-1" />
                    )}
                </button>
            </div>
            <div className="text-white font-semibold truncate text-sm w-full">{track.title}</div>
            <div 
                className="text-textSecondary text-xs truncate mt-1 hover:underline hover:text-white w-full"
                onClick={(e) => {
                    e.stopPropagation();
                    if (track.artistId) setActiveArtistId(track.artistId);
                }}
            >
                {track.artist}
            </div>
            <div className="absolute top-2 right-2">
                <TrackContextMenu track={track} className="opacity-60 hover:opacity-100 transition-opacity" />
            </div>
        </div>
    );
};

const AlbumCard = ({ album, onPlay }: { album: Album, onPlay: (album: Album) => void }) => {
    const { setActiveArtistId } = usePlayerStore();
    return (
        <div 
            className="group flex-shrink-0 w-48 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer relative"
            onDoubleClick={() => onPlay(album)}
        >
            <div className="relative w-full aspect-square mb-3 shadow-lg rounded-md overflow-hidden">
                <img src={album.thumbnail} alt={album.title} className="w-full h-full object-cover" />
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onPlay(album);
                    }}
                    className={`absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-xl 
                    translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all z-10`}
                >
                    <Play className="w-5 h-5 fill-black text-black ml-1" />
                </button>
            </div>
            <div className="text-white font-semibold truncate text-sm w-full">{album.title}</div>
            <div 
                className="text-textSecondary text-xs truncate mt-1 hover:underline hover:text-white w-full"
                onClick={(e) => {
                    e.stopPropagation();
                    if (album.artistId) setActiveArtistId(album.artistId);
                }}
            >
                {album.artist}
            </div>
        </div>
    );
};

const QuickPickItem = ({ track, tracks }: { track: Track, tracks: Track[] }) => {
    const { playTrack, currentTrack, isPlaying, togglePlayPause, setActiveArtistId } = usePlayerStore();
    const isCurrent = currentTrack?.id === track.id;

    return (
        <div 
            className="grid grid-cols-[48px_1fr_40px] items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors cursor-pointer group w-full relative group-hover:z-20"
            onClick={() => playTrack(track, tracks)}
        >
            <div className="relative w-12 h-12 flex-shrink-0">
                <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover rounded shadow-md" />
                <div className={`absolute inset-0 bg-black/40 items-center justify-center rounded hidden group-hover:flex ${isCurrent ? 'flex' : ''}`}>
                    {isCurrent && isPlaying ? (
                        <div className="flex items-end space-x-[2px] h-3">
                            <div className="w-[3px] bg-white animate-[bounce_0.8s_infinite] h-2"></div>
                            <div className="w-[3px] bg-white animate-[bounce_1s_infinite] h-3"></div>
                            <div className="w-[3px] bg-white animate-[bounce_0.9s_infinite] h-2.5"></div>
                        </div>
                    ) : (
                        <Play className="w-5 h-5 fill-white text-white" />
                    )}
                </div>
            </div>
            
            <div className="flex flex-col min-w-0 overflow-hidden">
                <span className={`block text-sm font-semibold truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>
                    {track.title}
                </span>
                <span 
                    className="block text-xs text-textSecondary truncate hover:underline hover:text-white"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (track.artistId) setActiveArtistId(track.artistId);
                    }}
                >
                    {track.artist} {track.album ? `• ${track.album}` : ''}
                </span>
            </div>

            <div className="flex justify-end">
                <TrackContextMenu track={track} className="opacity-60 hover:opacity-100 transition-opacity" />
            </div>
        </div>
    );
};

export const Home = () => {
    const [trending, setTrending] = useState<Track[]>([]);
    const [topHits, setTopHits] = useState<Track[]>([]);
    const [quickPicks, setQuickPicks] = useState<Track[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [recentTracks, setRecentTracks] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    
    const { recentlyPlayedIds, playTrack, hiddenTrackIds, hiddenArtistIds } = usePlayerStore();

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await api.getHomeData();
                
                const filterTracks = (items: Track[]) => 
                    items.filter(i => !hiddenTrackIds.includes(i.id) && (!i.artistId || !hiddenArtistIds.includes(i.artistId)));
                
                const filterAlbums = (items: Album[]) => 
                    items.filter(i => (!i.artistId || !hiddenArtistIds.includes(i.artistId)));

                setTrending(filterTracks(data.trending || []));
                setTopHits(filterTracks(data.topHits || []));
                setQuickPicks(filterTracks(data.quickPicks || []));
                setAlbums(filterAlbums(data.albums || []));
            } catch (e) {
                console.error("Failed to load home data", e);
            }

            try {
                // Load recently played tracks
                const tracks = await Promise.all(
                    recentlyPlayedIds.map(id => db.getTrack(id))
                );
                const validTracks = tracks.filter((t): t is Track => 
                    t !== undefined && 
                    !hiddenTrackIds.includes(t.id) && 
                    (!t.artistId || !hiddenArtistIds.includes(t.artistId))
                );
                setRecentTracks(validTracks);
            } catch (e) {
                console.error("Failed to load recent tracks", e);
            }
            
            setIsLoading(false);
        };
        loadData();
    }, [recentlyPlayedIds]);

    const playGenre = async (genreName: string) => {
        setLoadingAction(genreName);
        try {
            const tracks = await api.searchTracks(`${genreName} hits`);
            if (tracks.length > 0) {
                playTrack(tracks[0], tracks);
            }
        } catch (e) {
            console.error("Failed to play genre", e);
        }
        setLoadingAction(null);
    };

    const playAlbum = async (album: Album) => {
        setLoadingAction(`album-${album.id}`);
        try {
            const tracks = await api.getAlbumTracks(album.id);
            if (tracks.length > 0) {
                playTrack(tracks[0], tracks);
            }
        } catch (e) {
            console.error("Failed to play album", e);
        }
        setLoadingAction(null);
    };

    const playAllQuickPicks = () => {
        if (quickPicks.length > 0) {
            playTrack(quickPicks[0], quickPicks);
        }
    };

    const hours = new Date().getHours();
    const greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';

    if (isLoading) {
        return (
            <div className="h-full p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4 sm:p-8 bg-gradient-to-b from-surfaceHover/30 to-surface pb-32">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-6 sm:mb-8 tracking-tight">{greeting}</h1>
            
            {quickPicks.length > 0 && (
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                            <span className="text-textSecondary text-xs uppercase font-bold tracking-widest mb-1">Start radio from a song</span>
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Quick picks</h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={playAllQuickPicks}
                                className="px-4 py-1.5 rounded-full border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-colors"
                            >
                                Play all
                            </button>
                            <div className="flex space-x-2">
                                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors border border-white/10">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors border border-white/10">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex overflow-x-auto pb-4 scrollbar-hide space-x-8">
                        {Array.from({ length: Math.ceil(quickPicks.length / 4) }).map((_, colIndex) => (
                            <div key={colIndex} className="flex-shrink-0 w-full max-w-[500px] grid grid-rows-4 gap-y-1">
                                {quickPicks.slice(colIndex * 4, colIndex * 4 + 4).map(track => (
                                    <QuickPickItem key={track.id} track={track} tracks={quickPicks} />
                                ))}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {recentTracks.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Recently Played</h2>
                    <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                        {recentTracks.map(track => (
                            <TrackCard key={`recent-${track.id}`} track={track} tracks={recentTracks} />
                        ))}
                    </div>
                </section>
            )}

            {trending.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Trending Now</h2>
                    <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                        {trending.map(track => (
                            <TrackCard key={`trend-${track.id}`} track={track} tracks={trending} />
                        ))}
                    </div>
                </section>
            )}

            {topHits.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Global Top Hits</h2>
                    <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                        {topHits.map(track => (
                            <TrackCard key={`top-${track.id}`} track={track} tracks={topHits} />
                        ))}
                    </div>
                </section>
            )}

            {albums.length > 0 && (
                <section className="mb-10 relative">
                    <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Top Albums</h2>
                    <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                        {albums.map(album => (
                            <div key={`album-${album.id}`} className="relative">
                                <AlbumCard album={album} onPlay={playAlbum} />
                                {loadingAction === `album-${album.id}` && (
                                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 rounded-lg">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Browse Genres</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
                    {GENRES.map((genre, i) => (
                        <div 
                            key={i} 
                            onClick={() => playGenre(genre.name)}
                            className={`aspect-square rounded-xl p-3 sm:p-4 font-bold text-lg sm:text-2xl relative overflow-hidden shadow-2xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-all bg-gradient-to-br ${genre.color} ${loadingAction === genre.name ? 'opacity-50' : ''}`}
                        >
                            <span className="relative z-10 text-white drop-shadow-lg">{genre.name}</span>
                            {loadingAction === genre.name && (
                                <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
                                </div>
                            )}
                            <img 
                                src={genre.image} 
                                alt="" 
                                className="absolute -bottom-2 -right-4 w-28 h-28 object-cover rotate-[25deg] rounded-md shadow-2xl opacity-90 group-hover:rotate-[20deg] transition-transform"
                            />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
