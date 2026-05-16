import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Track, Playlist } from '../types';

interface MusicDB extends DBSchema {
  tracks: {
    key: string;
    value: Track;
  };
  playlists: {
    key: string;
    value: Playlist;
  };
}

let dbPromise: Promise<IDBPDatabase<MusicDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<MusicDB>('music-player-db', 1, {
      upgrade(db) {
        db.createObjectStore('tracks', { keyPath: 'id' });
        db.createObjectStore('playlists', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
};

export const db = {
  async saveTrack(track: Track) {
    const database = await getDB();
    await database.put('tracks', track);
  },
  async getTrack(id: string) {
    const database = await getDB();
    return await database.get('tracks', id);
  },
  async savePlaylist(playlist: Playlist) {
    const database = await getDB();
    await database.put('playlists', playlist);
  },
  async getPlaylist(id: string) {
    const database = await getDB();
    return await database.get('playlists', id);
  },
  async getAllPlaylists() {
    const database = await getDB();
    return await database.getAll('playlists');
  },
  async deletePlaylist(id: string) {
    const database = await getDB();
    await database.delete('playlists', id);
  }
};
