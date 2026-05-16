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
            <div className="bg-gradient-to-b from-indigo-700 to-surface p-6 md:p-8 flex items-end space-x-4 md:space-x-6">
                <div className="w-24 h-24 md:w-48 md:h-48 bg-gradient-to-br from-indigo-500 to-blue-300 shadow-2xl flex items-center justify-center rounded-sm flex-shrink-0">
                    <Heart className="w-10 h-10 md:w-16 md:h-16 text-white fill-white" />
                </div>
                <div className="flex flex-col text-white min-w-0">
                    <span className="text-xs md:text-sm font-bold tracking-wider mb-1 md:mb-2">Playlist</span>
                    <h1 className="text-3xl md:text-6xl font-black mb-2 md:mb-6 tracking-tighter">Liked Songs</h1>
                    <span className="text-xs md:text-sm font-medium">{likedTracks.length} songs</span>
                </div>
            </div>

            {/* Track List */}
            <div className="p-6">
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
