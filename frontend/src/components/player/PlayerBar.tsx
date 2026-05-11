import React, { useState, useEffect } from 'react';
import { 
    Play, Pause, SkipForward, SkipBack, 
    Volume2, VolumeX, Repeat, Shuffle, Heart, Mic2
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useYouTubePlayer } from '../../services/ytPlayer';

export const PlayerBar = () => {
    const { 
        currentTrack, isPlaying, togglePlayPause, 
        volume, setVolume, playNext, playPrev,
        shuffle, toggleShuffle, repeat, cycleRepeat,
        likedTrackIds, toggleLike, showLyrics, toggleLyrics,
        setActiveArtistId
    } = usePlayerStore();
    
    const { playerRef, seekTo, getCurrentTime } = useYouTubePlayer();
    const [progress, setProgress] = useState(0);
    const [isScrubbing, setIsScrubbing] = useState(false);

    const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;

    useEffect(() => {
        let interval: any;
        if (isPlaying && !isScrubbing) {
            interval = setInterval(() => {
                setProgress(getCurrentTime());
            }, 1000);
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

    if (!currentTrack) {
        return <div ref={playerRef} className="hidden" />;
    }

    return (
        <>
            {/* Desktop Player Bar */}
            <div className="hidden sm:flex h-24 bg-surface border-t border-white/5 items-center justify-between px-4 sm:px-6 absolute bottom-0 left-0 right-0 z-50">
                <div ref={playerRef} className="hidden" />
                
                {/* Track Info */}
                <div className="flex items-center w-1/3 min-w-[200px]">
                    <img 
                        src={currentTrack.thumbnail} 
                        alt={currentTrack.title} 
                        className="w-14 h-14 rounded-md object-cover shadow-lg"
                    />
                    <div className="ml-4 flex flex-col justify-center min-w-0 flex-1">
                        <span 
                            className="block text-white font-semibold text-sm truncate hover:underline cursor-pointer"
                            onClick={toggleLyrics}
                        >
                            {currentTrack.title}
                        </span>
                        <span 
                            className="block text-textSecondary text-xs truncate hover:underline cursor-pointer"
                            onClick={() => {
                                if (currentTrack.artistId) setActiveArtistId(currentTrack.artistId);
                            }}
                        >
                            {currentTrack.artist}
                        </span>
                    </div>
                    <button onClick={() => toggleLike(currentTrack)} className="ml-4 text-textSecondary hover:text-white transition">
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary text-primary hover:text-primary' : ''}`} />
                    </button>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center justify-center w-1/3 max-w-[500px]">
                    <div className="flex items-center space-x-6 mb-2">
                        <button onClick={toggleShuffle} className={`${shuffle ? 'text-primary' : 'text-textSecondary'} hover:text-white transition`}>
                            <Shuffle className="w-4 h-4" />
                        </button>
                        <button onClick={playPrev} className="text-textSecondary hover:text-white transition">
                            <SkipBack className="w-5 h-5 fill-current" />
                        </button>
                        <button 
                            onClick={togglePlayPause} 
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
                        >
                            {isPlaying ? (
                                <Pause className="w-4 h-4 text-black fill-current" />
                            ) : (
                                <Play className="w-4 h-4 text-black fill-current ml-1" />
                            )}
                        </button>
                        <button onClick={playNext} className="text-textSecondary hover:text-white transition">
                            <SkipForward className="w-5 h-5 fill-current" />
                        </button>
                        <button onClick={cycleRepeat} className={`${repeat !== 'off' ? 'text-primary' : 'text-textSecondary'} hover:text-white transition relative`}>
                            <Repeat className="w-4 h-4" />
                            {repeat === 'one' && <span className="absolute -top-1 -right-2 text-[8px] bg-background rounded-full px-1">1</span>}
                        </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="flex items-center w-full space-x-3 text-xs text-textSecondary font-medium">
                        <span>{formatTime(progress)}</span>
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
                            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary/80"
                        />
                        <span>{formatTime(currentTrack.duration)}</span>
                    </div>
                </div>

                {/* Extra Controls */}
                <div className="flex items-center justify-end w-1/3 space-x-4">

                    <button onClick={() => setVolume(volume === 0 ? 50 : 0)} className="text-textSecondary hover:text-white transition">
                        {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(parseInt(e.target.value))}
                        className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:accent-primary"
                    />
                </div>
            </div>

            {/* Mobile Player Bar — compact */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
                <div ref={playerRef} className="hidden" />
                
                {/* Progress bar on top edge */}
                <div className="w-full h-[3px] bg-white/10 relative">
                    <div 
                        className="h-full bg-primary transition-all" 
                        style={{ width: `${currentTrack.duration ? (progress / currentTrack.duration) * 100 : 0}%` }}
                    />
                </div>

                <div className="bg-surface/95 backdrop-blur-xl border-t border-white/5 px-3 py-2 flex items-center space-x-3">
                    {/* Track info */}
                    <img 
                        src={currentTrack.thumbnail} 
                        alt={currentTrack.title}
                        className="w-11 h-11 rounded-md object-cover shadow-lg flex-shrink-0"
                        onClick={toggleLyrics}
                    />
                    <div className="flex-1 min-w-0" onClick={toggleLyrics}>
                        <div className="text-white font-semibold text-sm truncate">{currentTrack.title}</div>
                        <div className="text-textSecondary text-xs truncate">{currentTrack.artist}</div>
                    </div>

                    {/* Like */}
                    <button onClick={() => toggleLike(currentTrack)} className="text-textSecondary hover:text-white flex-shrink-0">
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-primary text-primary' : ''}`} />
                    </button>

                    {/* Play/Pause */}
                    <button 
                        onClick={togglePlayPause} 
                        className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0"
                    >
                        {isPlaying ? (
                            <Pause className="w-4 h-4 text-black fill-current" />
                        ) : (
                            <Play className="w-4 h-4 text-black fill-current ml-0.5" />
                        )}
                    </button>

                    {/* Skip */}
                    <button onClick={playNext} className="text-textSecondary hover:text-white flex-shrink-0">
                        <SkipForward className="w-5 h-5 fill-current" />
                    </button>
                </div>
            </div>
        </>
    );
};
