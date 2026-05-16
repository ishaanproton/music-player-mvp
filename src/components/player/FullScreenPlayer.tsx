import React, { useState, useEffect } from 'react';
import { 
    Play, Pause, SkipForward, SkipBack, 
    Repeat, Shuffle, Heart, ChevronDown, Mic2
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useYouTubePlayer } from '../../services/ytPlayer';

interface FullScreenPlayerProps {
    onClose: () => void;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({ onClose }) => {
    const { 
        currentTrack, isPlaying, togglePlayPause, 
        playNext, playPrev,
        shuffle, toggleShuffle, repeat, cycleRepeat,
        likedTrackIds, toggleLike, toggleLyrics
    } = usePlayerStore();

    const { seekTo, getCurrentTime } = useYouTubePlayer();
    const [progress, setProgress] = useState(0);
    const [isScrubbing, setIsScrubbing] = useState(false);

    const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;

    useEffect(() => {
        let interval: any;
        if (isPlaying && !isScrubbing) {
            interval = setInterval(() => {
                setProgress(getCurrentTime());
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isScrubbing, getCurrentTime]);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setProgress(value);
    };

    const handleSeekEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        seekTo(value);
        setIsScrubbing(false);
    };

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    if (!currentTrack) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-gradient-to-b from-surfaceHover to-black flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-safe-top py-4 flex-shrink-0">
                <button onClick={onClose} className="text-white/70 hover:text-white p-1">
                    <ChevronDown className="w-7 h-7" />
                </button>
                <div className="text-white text-xs font-bold uppercase tracking-widest">
                    Now Playing
                </div>
                <button 
                    onClick={() => { toggleLyrics(); onClose(); }}
                    className="text-white/70 hover:text-white p-1"
                >
                    <Mic2 className="w-5 h-5" />
                </button>
            </div>

            {/* Album Art */}
            <div className="flex-1 flex items-center justify-center px-10 py-4">
                <img 
                    src={currentTrack.thumbnail} 
                    alt={currentTrack.title}
                    className="w-full max-w-[340px] aspect-square rounded-xl object-cover shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                />
            </div>

            {/* Track Info + Controls */}
            <div className="px-8 pb-10 flex-shrink-0">
                {/* Title and Like */}
                <div className="flex items-center justify-between mb-6">
                    <div className="min-w-0 flex-1 mr-4">
                        <h2 className="text-white text-xl font-bold truncate">{currentTrack.title}</h2>
                        <p className="text-textSecondary text-sm truncate">{currentTrack.artist}</p>
                    </div>
                    <button 
                        onClick={() => toggleLike(currentTrack)}
                        className="flex-shrink-0 text-textSecondary hover:text-white transition"
                    >
                        <Heart className={`w-6 h-6 ${isLiked ? 'fill-primary text-primary' : ''}`} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <input
                        type="range"
                        min="0"
                        max={currentTrack.duration || 100}
                        value={progress}
                        onChange={handleSeek}
                        onMouseDown={() => setIsScrubbing(true)}
                        onMouseUp={handleSeekEnd}
                        onTouchStart={() => setIsScrubbing(true)}
                        onTouchEnd={handleSeekEnd}
                        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-textSecondary font-medium mt-2">
                        <span>{formatTime(progress)}</span>
                        <span>{formatTime(currentTrack.duration)}</span>
                    </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-between px-4">
                    <button 
                        onClick={toggleShuffle}
                        className={`${shuffle ? 'text-primary' : 'text-white/60'} transition`}
                    >
                        <Shuffle className="w-5 h-5" />
                    </button>
                    <button onClick={playPrev} className="text-white hover:text-white/80 transition">
                        <SkipBack className="w-8 h-8 fill-current" />
                    </button>
                    <button 
                        onClick={togglePlayPause} 
                        className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg"
                    >
                        {isPlaying ? (
                            <Pause className="w-7 h-7 text-black fill-current" />
                        ) : (
                            <Play className="w-7 h-7 text-black fill-current ml-1" />
                        )}
                    </button>
                    <button onClick={playNext} className="text-white hover:text-white/80 transition">
                        <SkipForward className="w-8 h-8 fill-current" />
                    </button>
                    <button 
                        onClick={cycleRepeat}
                        className={`${repeat !== 'off' ? 'text-primary' : 'text-white/60'} transition relative`}
                    >
                        <Repeat className="w-5 h-5" />
                        {repeat === 'one' && <span className="absolute -top-1 -right-2 text-[8px] bg-black rounded-full px-1">1</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};
