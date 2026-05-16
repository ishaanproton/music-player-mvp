import type { UserState } from '../types';

const STORAGE_KEY = 'music_player_user_state';

const defaultState: UserState = {
    currentTrackId: null,
    isPlaying: false,
    volume: 50,
    repeat: 'off',
    shuffle: false,
    likedTrackIds: [],
    playlistIds: [],
    recentlyPlayedIds: [],
    activeArtistId: null,
};

export const storage = {
    load(): UserState {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return { ...defaultState, ...JSON.parse(data) };
            }
        } catch (e) {
            console.error('Error parsing UserState from localStorage', e);
        }
        return defaultState;
    },
    save(state: UserState) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
};
