import { create } from 'zustand';
import type { UserState, Track } from '../types';
import { storage } from '../services/storage';
import { db } from '../services/db';

interface PlayerStore extends UserState {
    currentTrack: Track | null;
    queue: Track[];
    setVolume: (volume: number) => void;
    togglePlayPause: () => void;
    setPlayState: (isPlaying: boolean) => void;
    toggleShuffle: () => void;
    cycleRepeat: () => void;
    playTrack: (track: Track, queue?: Track[]) => void;
    playNext: () => void;
    playPrev: () => void;
    toggleLike: (track: Track) => void;
    showLyrics: boolean;
    toggleLyrics: () => void;
    setActiveArtistId: (id: string | null) => void;
    removeFromQueue: (trackId: string) => void;
    reorderQueue: (startIndex: number, endIndex: number) => void;
    addToQueue: (track: Track) => void;
    addToQueueNext: (track: Track) => void;
    
    // Playlists
    playlists: import('../types').Playlist[];
    loadPlaylists: () => Promise<void>;
    createPlaylist: (name: string) => Promise<string>;
    addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
    removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
    deletePlaylist: (playlistId: string) => Promise<void>;

    // Hidden items (Not interested)
    hiddenTrackIds: string[];
    hiddenArtistIds: string[];
    hideTrack: (trackId: string) => void;
    hideArtist: (artistId: string) => void;
}

const initialState = storage.load();

export const usePlayerStore = create<PlayerStore>((set, get) => ({
    ...initialState,
    currentTrack: null,
    queue: [],
    showLyrics: false,
    playlists: [],
    hiddenTrackIds: [],
    hiddenArtistIds: [],

    loadPlaylists: async () => {
        const playlists = await db.getAllPlaylists();
        set({ playlists });
    },

    createPlaylist: async (name: string) => {
        const newPlaylist = {
            id: Date.now().toString(),
            name,
            trackIds: [],
            createdAt: Date.now()
        };
        await db.savePlaylist(newPlaylist);
        get().loadPlaylists();
        return newPlaylist.id;
    },

    addTrackToPlaylist: async (playlistId: string, track: Track) => {
        await db.saveTrack(track); // Ensure track is in DB
        const playlist = await db.getPlaylist(playlistId);
        if (playlist && (!playlist.trackIds || !playlist.trackIds.includes(track.id))) {
            playlist.trackIds = [...(playlist.trackIds || []), track.id];
            await db.savePlaylist(playlist);
            get().loadPlaylists();
        }
    },

    removeTrackFromPlaylist: async (playlistId: string, trackId: string) => {
        const playlist = await db.getPlaylist(playlistId);
        if (playlist && playlist.trackIds) {
            playlist.trackIds = playlist.trackIds.filter(id => id !== trackId);
            await db.savePlaylist(playlist);
            get().loadPlaylists();
        }
    },

    deletePlaylist: async (playlistId: string) => {
        await db.deletePlaylist(playlistId);
        get().loadPlaylists();
    },

    hideTrack: (trackId: string) => {
        set(state => {
            const hiddenTrackIds = [...state.hiddenTrackIds, trackId];
            storage.save({ ...get(), hiddenTrackIds });
            return { hiddenTrackIds };
        });
    },

    hideArtist: (artistId: string) => {
        set(state => {
            const hiddenArtistIds = [...state.hiddenArtistIds, artistId];
            storage.save({ ...get(), hiddenArtistIds });
            return { hiddenArtistIds };
        });
    },

    setVolume: (volume) => {
        set({ volume });
        storage.save(get());
    },
    
    togglePlayPause: () => {
        set(state => {
            const isPlaying = !state.isPlaying;
            storage.save({ ...get(), isPlaying });
            return { isPlaying };
        });
    },

    setPlayState: (isPlaying) => {
        set({ isPlaying });
        storage.save({ ...get(), isPlaying });
    },

    toggleShuffle: () => {
        set(state => {
            const shuffle = !state.shuffle;
            storage.save({ ...get(), shuffle });
            return { shuffle };
        });
    },

    cycleRepeat: () => {
        set(state => {
            const nextRepeat = state.repeat === 'off' ? 'all' : state.repeat === 'all' ? 'one' : 'off';
            storage.save({ ...get(), repeat: nextRepeat });
            return { repeat: nextRepeat };
        });
    },

    playTrack: async (track, newQueue) => {
        await db.saveTrack(track); // cache it

        // Start playback immediately with whatever queue we have
        const queueToSet = newQueue ? newQueue : [track];

        set(state => {
            const recentlyPlayedIds = [track.id, ...state.recentlyPlayedIds.filter(id => id !== track.id)].slice(0, 10);
            const newState = {
                currentTrackId: track.id,
                currentTrack: track,
                isPlaying: true,
                queue: queueToSet,
                recentlyPlayedIds
            };
            storage.save({ ...get(), currentTrackId: track.id, isPlaying: true, recentlyPlayedIds });
            return newState;
        });

        // If no explicit queue was provided (e.g. playing from search with no context),
        // silently fetch a radio of similar/same-artist songs in the background.
        if (!newQueue) {
            try {
                const { api } = await import('../services/api');
                const radioTracks = await api.getRadio(track);
                if (radioTracks.length > 0) {
                    // Put current track first, radio follows — seamless autoplay
                    set({ queue: [track, ...radioTracks] });
                }
            } catch {
                // Radio load failed silently — current track still plays fine
            }
        }
    },

    playNext: () => {
        const { queue, currentTrackId, repeat, shuffle } = get();
        if (queue.length === 0) return;
        
        let nextIndex = 0;
        const currentIndex = queue.findIndex(t => t.id === currentTrackId);
        
        if (shuffle) {
            nextIndex = Math.floor(Math.random() * queue.length);
        } else {
            nextIndex = currentIndex + 1;
        }

        if (nextIndex >= queue.length) {
            if (repeat === 'all') nextIndex = 0;
            else return; // Stop playing
        }
        
        get().playTrack(queue[nextIndex]);
    },

    playPrev: () => {
        const { queue, currentTrackId } = get();
        if (queue.length === 0) return;
        
        const currentIndex = queue.findIndex(t => t.id === currentTrackId);
        const prevIndex = currentIndex - 1;
        
        if (prevIndex >= 0) {
            get().playTrack(queue[prevIndex]);
        } else {
            get().playTrack(queue[0]); // Restart first
        }
    },

    toggleLike: async (track) => {
        await db.saveTrack(track);
        set(state => {
            const isLiked = state.likedTrackIds.includes(track.id);
            const likedTrackIds = isLiked 
                ? state.likedTrackIds.filter(id => id !== track.id)
                : [...state.likedTrackIds, track.id];
            
            const newState = { likedTrackIds };
            storage.save({ ...get(), ...newState });
            return newState;
        });
    },

    toggleLyrics: () => {
        set(state => ({ showLyrics: !state.showLyrics }));
    },

    setActiveArtistId: (id) => {
        set({ activeArtistId: id });
        storage.save(get());
    },

    removeFromQueue: (trackId) => {
        set(state => ({
            queue: state.queue.filter(t => t.id !== trackId)
        }));
    },

    reorderQueue: (startIndex, endIndex) => {
        set(state => {
            const newQueue = [...state.queue];
            const [removed] = newQueue.splice(startIndex, 1);
            newQueue.splice(endIndex, 0, removed);
            return { queue: newQueue };
        });
    },

    addToQueue: (track) => {
        set(state => ({
            queue: [...state.queue.filter(t => t.id !== track.id), track]
        }));
    },

    addToQueueNext: (track) => {
        set(state => {
            const newQueue = state.queue.filter(t => t.id !== track.id);
            const currentIndex = newQueue.findIndex(t => t.id === state.currentTrackId);
            
            // Insert at index 0 if nothing is playing, or at currentIndex + 1
            const insertIndex = currentIndex === -1 ? 0 : currentIndex + 1;
            newQueue.splice(insertIndex, 0, track);
            
            return { queue: newQueue };
        });
    }
}));
