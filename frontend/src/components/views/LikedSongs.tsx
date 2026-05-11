import React, { useEffect, useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { db } from '../../services/db';
import type { Track } from '../../types';
import { TrackList } from '../shared/TrackList';
import { Heart } from 'lucide-react';

export const LikedSongs = () => {
    const { likedTrackIds } = usePlayerStore();
    const [likedTracks, setLikedTracks] = useState<Track[]>([]);

    useEffect(() => {
        const fetchTracks = async () => {
            const tracks: Track[] = [];
            for (const id of likedTrackIds) {
                const track = await db.getTrack(id);
                if (track) tracks.push(track);
            }
            setLikedTracks(tracks);
        };
        fetchTracks();
    }, [likedTrackIds]);

    return (
        <div className="h-full flex flex-col overflow-y-auto">
            {/* Header / Hero */}
            <div className="bg-gradient-to-b from-indigo-700 to-surface p-4 sm:p-8 flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-indigo-500 to-blue-300 shadow-2xl flex items-center justify-center rounded-sm">
                    <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-white fill-white" />
                </div>
                <div className="flex flex-col text-white text-center sm:text-left">
                    <span className="text-sm font-bold tracking-wider mb-2">Playlist</span>
                    <h1 className="text-3xl sm:text-6xl font-black mb-4 sm:mb-6 tracking-tighter">Liked Songs</h1>
                    <span className="text-sm font-medium">{likedTracks.length} songs</span>
                </div>
            </div>

            {/* Track List */}
            <div className="p-3 sm:p-6">
                {likedTracks.length > 0 ? (
                    <TrackList tracks={likedTracks} />
                ) : (
                    <div className="text-center text-textSecondary mt-10">
                        <h2 className="text-xl font-bold text-white mb-2">Songs you like will appear here</h2>
                        <p>Save songs by tapping the heart icon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
