import React, { useEffect, useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { db } from '../../services/db';
import type { Track, Playlist } from '../../types';
import { TrackList } from '../shared/TrackList';
import { Music, Trash2, Play } from 'lucide-react';

interface PlaylistViewProps {
    playlistId: string;
    setCurrentView: (view: string) => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({ playlistId, setCurrentView }) => {
    const { deletePlaylist, playlists, playTrack } = usePlayerStore();
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);

    useEffect(() => {
        const fetchPlaylistData = async () => {
            const currentPlaylist = playlists.find(p => p.id === playlistId);
            if (currentPlaylist) {
                setPlaylist(currentPlaylist);
                
                // Fetch tracks
                const fetchedTracks: Track[] = [];
                for (const id of (currentPlaylist.trackIds || [])) {
                    const track = await db.getTrack(id);
                    if (track) fetchedTracks.push(track);
                }
                setTracks(fetchedTracks);
            } else {
                setPlaylist(null);
                setTracks([]);
            }
        };
        fetchPlaylistData();
    }, [playlistId, playlists]);

    if (!playlist) {
        return (
            <div className="h-full flex items-center justify-center text-textSecondary">
                Playlist not found or deleted.
            </div>
        );
    }

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this playlist?")) {
            await deletePlaylist(playlist.id);
            setCurrentView('home');
        }
    };

    const handlePlayAll = () => {
        if (tracks.length > 0) {
            playTrack(tracks[0], tracks);
        }
    };

    return (
        <div className="h-full flex flex-col overflow-y-auto">
            {/* Header / Hero */}
            <div className="bg-gradient-to-b from-purple-700 to-surface p-8 flex items-end space-x-6 relative">
                <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-indigo-300 shadow-2xl flex items-center justify-center rounded-sm">
                    <Music className="w-16 h-16 text-white" />
                </div>
                <div className="flex flex-col text-white flex-1">
                    <span className="text-sm font-bold tracking-wider mb-2">Playlist</span>
                    <h1 className="text-6xl font-black mb-6 tracking-tighter truncate">{playlist.name}</h1>
                    <span className="text-sm font-medium">{tracks.length} songs</span>
                </div>
                <button 
                    onClick={handleDelete}
                    className="absolute top-8 right-8 p-3 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                    title="Delete Playlist"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Actions */}
            <div className="px-8 py-6 flex items-center space-x-6">
                <button 
                    onClick={handlePlayAll}
                    disabled={tracks.length === 0}
                    className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(29,185,84,0.3)]"
                >
                    <Play className="w-6 h-6 ml-1 fill-black" />
                </button>
            </div>

            {/* Track List */}
            <div className="px-6 pb-6">
                {tracks.length > 0 ? (
                    <TrackList tracks={tracks} />
                ) : (
                    <div className="text-center text-textSecondary mt-10">
                        <h2 className="text-xl font-bold text-white mb-2">This playlist is empty</h2>
                        <p>Find songs you love and add them here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
