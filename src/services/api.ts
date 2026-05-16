import type { Track } from '../types';

const API_BASE = '/api';
const API_SECRET = import.meta.env.VITE_API_SECRET || 'soundflow_secret_key_123';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    return await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'x-api-key': API_SECRET
        }
    });
};

export type LrcLine = { time: number | null; text: string };

export const api = {
    async searchTracks(query: string): Promise<Track[]> {
        const res = await fetchWithAuth(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        return data.tracks || [];
    },

    async getHomeData(): Promise<{trending: Track[], topHits: Track[], quickPicks: Track[], albums: import('../types').Album[]}> {
        const res = await fetchWithAuth(`${API_BASE}/home`);
        if (!res.ok) throw new Error('Failed to fetch home data');
        return await res.json();
    },

    async getAlbumTracks(albumId: string): Promise<Track[]> {
        const res = await fetchWithAuth(`${API_BASE}/album?id=${encodeURIComponent(albumId)}`);
        if (!res.ok) throw new Error('Failed to fetch album tracks');
        const data = await res.json();
        return data.tracks || [];
    },

    async getArtistProfile(artistId: string): Promise<import('../types').ArtistProfile> {
        const res = await fetchWithAuth(`${API_BASE}/artist?id=${encodeURIComponent(artistId)}`);
        if (!res.ok) throw new Error('Failed to fetch artist profile');
        return await res.json();
    },

    async getLyrics(trackId: string): Promise<{text: string, source: string}> {
        const res = await fetchWithAuth(`${API_BASE}/lyrics?id=${encodeURIComponent(trackId)}`);
        if (!res.ok) throw new Error('Failed to fetch lyrics');
        return await res.json();
    },

    async getRadio(track: Track): Promise<Track[]> {
        // Uses YouTube Music's own "Up Next" recommendation engine via the backend.
        // This gives genuinely related tracks, not just a keyword search.
        try {
            const res = await fetchWithAuth(`${API_BASE}/radio?id=${encodeURIComponent(track.id)}`);
            if (!res.ok) return [];
            const data = await res.json();
            const results: Track[] = data.tracks || [];
            return results.filter(t => t.id !== track.id);
        } catch {
            return [];
        }
    },

    async getLrcLyrics(title: string, artist: string, trackId?: string): Promise<{lines: LrcLine[], synced: boolean}> {
        const url = new URL(`${API_BASE}/lrclyrics`);
        url.searchParams.append('title', title);
        url.searchParams.append('artist', artist);
        if (trackId) url.searchParams.append('track_id', trackId);
        
        const res = await fetchWithAuth(url.toString());
        if (!res.ok) throw new Error('Failed to fetch synced lyrics');
        return await res.json();
    }
};
