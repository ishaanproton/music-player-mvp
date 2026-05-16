import React from 'react';
import type { Track } from '../../types';
import { usePlayerStore } from '../../store/usePlayerStore';
import { Play, Pause } from 'lucide-react';
import { TrackContextMenu } from './TrackContextMenu';

interface TrackListProps {
    tracks: Track[];
    showHeaders?: boolean;
    queueBehavior?: 'list' | 'radio';
}

export const TrackList: React.FC<TrackListProps> = ({ tracks, showHeaders = true, queueBehavior = 'list' }) => {
    const { currentTrack, isPlaying, playTrack, togglePlayPause, setActiveArtistId } = usePlayerStore();

    const formatDuration = (seconds: number) => {
        if (!seconds) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (tracks.length === 0) {
        return <div className="text-textSecondary text-center py-10">No tracks found.</div>;
    }

    return (
        <div className="w-full">
            {showHeaders && (
                <div className="grid grid-cols-[auto_minmax(0,1.5fr)_100px_40px] gap-4 px-4 py-2 text-textSecondary text-sm font-medium border-b border-white/5 mb-4">
                    <div className="w-8 text-center">#</div>
                    <div>Title</div>
                    <div className="text-right pr-4">Time</div>
                    <div></div>
                </div>
            )}
            
            <div className="space-y-1">
                {tracks.map((track, index) => {
                    const isCurrent = currentTrack?.id === track.id;
                    
                    return (
                        <div 
                            key={track.id}
                            className={`group grid grid-cols-[auto_minmax(0,1.5fr)_100px_40px] gap-4 px-4 py-2 rounded-md hover:bg-white/10 transition-colors items-center
                            ${isCurrent ? 'bg-white/5' : ''}`}
                            onDoubleClick={() => playTrack(track, queueBehavior === 'radio' ? undefined : tracks)}
                        >
                            <div className="w-8 text-center flex justify-center">
                                {isCurrent && isPlaying ? (
                                    <div className="flex items-end justify-center space-x-[2px] h-4 w-4">
                                        <div className="w-1 bg-primary animate-[bounce_0.8s_infinite] h-2"></div>
                                        <div className="w-1 bg-primary animate-[bounce_1s_infinite] h-4"></div>
                                        <div className="w-1 bg-primary animate-[bounce_0.9s_infinite] h-3"></div>
                                    </div>
                                ) : (
                                    <>
                                        <span className={`text-textSecondary group-hover:hidden ${isCurrent ? 'text-primary' : ''}`}>{index + 1}</span>
                                        <button 
                                            className="hidden group-hover:block text-white"
                                            onClick={() => isCurrent ? togglePlayPause() : playTrack(track, queueBehavior === 'radio' ? undefined : tracks)}
                                        >
                                            {isCurrent && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded shadow-md object-cover bg-surface" />
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className={`block truncate font-medium text-sm ${isCurrent ? 'text-primary' : 'text-white'}`}>
                                        {track.title}
                                    </span>
                                    <span 
                                        className="block truncate text-textSecondary text-xs hover:underline hover:text-white cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (track.artistId) setActiveArtistId(track.artistId);
                                        }}
                                    >
                                        {track.artist}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="text-textSecondary text-sm text-right pr-4">
                                {formatDuration(track.duration)}
                            </div>
                            <TrackContextMenu track={track} className="opacity-60 hover:opacity-100 transition-opacity" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
