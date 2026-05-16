import React from 'react';
import { Play, Pause, SkipForward } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

interface MiniPlayerProps {
    onExpand: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
    const { currentTrack, isPlaying, togglePlayPause, playNext } = usePlayerStore();

    if (!currentTrack) return null;

    return (
        <div 
            className="md:hidden fixed left-2 right-2 z-[55] bg-surfaceHover rounded-lg shadow-2xl overflow-hidden"
            style={{ bottom: '68px' }}
        >
            {/* Progress bar at top */}
            <div className="h-[2px] bg-white/10 w-full">
                <div className="h-full bg-primary w-1/3 transition-all" />
            </div>

            <div 
                className="flex items-center px-3 py-2 gap-3"
                onClick={onExpand}
            >
                {/* Album Art */}
                <img 
                    src={currentTrack.thumbnail} 
                    alt={currentTrack.title}
                    className="w-10 h-10 rounded-md object-cover shadow-lg flex-shrink-0"
                />

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{currentTrack.title}</div>
                    <div className="text-textSecondary text-xs truncate">{currentTrack.artist}</div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button 
                        onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
                        className="w-9 h-9 flex items-center justify-center text-white rounded-full hover:bg-white/10 transition"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                        ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); playNext(); }}
                        className="w-9 h-9 flex items-center justify-center text-white/60 rounded-full hover:bg-white/10 transition"
                    >
                        <SkipForward className="w-4 h-4 fill-current" />
                    </button>
                </div>
            </div>
        </div>
    );
};
