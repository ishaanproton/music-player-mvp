export type Track = {
    id: string;
    title: string;
    artist: string;
    artistId?: string;
    album: string;
    albumId?: string;
    duration: number;
    thumbnail: string;
    ytmusicUrl: string;
};

export type Album = {
    id: string;
    title: string;
    artist: string;
    artistId?: string;
    thumbnail: string;
    type: "album";
    year?: string;
};

export type ArtistProfile = {
    name: string;
    description: string | null;
    subscribers: string | null;
    thumbnails: { url: string; width: number; height: number }[];
    songs: Track[];
    albums: Album[];
    related: { id: string; name: string; thumbnail: string }[];
};

export type Playlist = {
    id: string;
    name: string;
    trackIds: string[];
    createdAt: number;
};

export type UserState = {
    currentTrackId: string | null;
    isPlaying: boolean;
    volume: number;
    repeat: "off" | "one" | "all";
    shuffle: boolean;
    likedTrackIds: string[];
    playlistIds: string[];
    recentlyPlayedIds: string[];
    activeArtistId: string | null;
};
