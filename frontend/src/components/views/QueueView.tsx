import React, { useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { GripVertical, X, Play, Music } from 'lucide-react';

export const QueueView = () => {
    const { 
        queue, currentTrack, currentTrackId, 
        playTrack, removeFromQueue, reorderQueue 
    } = usePlayerStore();
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Add a ghost image or styling if needed
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        // Visual feedback could be added here
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        reorderQueue(draggedIndex, index);
        setDraggedIndex(null);
    };

    if (!currentTrack && queue.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-textSecondary p-8">
                <Music className="w-16 h-16 mb-4 opacity-20" />
                <h2 className="text-xl font-bold text-white mb-2">Your queue is empty</h2>
                <p>Start playing some music to see what's next!</p>
            </div>
        );
    }

    const currentIndex = queue.findIndex(t => t.id === currentTrackId);
    const upNext = queue.slice(currentIndex + 1);
    const history = queue.slice(0, currentIndex);

    return (
        <div className="h-full overflow-y-auto p-4 sm:p-8 bg-gradient-to-b from-surfaceHover/20 to-surface pb-32 scrollbar-hide">
            <h1 className="text-2xl sm:text-4xl font-black text-white mb-6 sm:mb-8 tracking-tighter">Queue</h1>

            {/* Now Playing Section */}
            {currentTrack && (
                <section className="mb-10">
                    <h2 className="text-textSecondary text-sm font-bold uppercase tracking-widest mb-4">Now Playing</h2>
                    <div className="flex items-center p-4 bg-white/10 rounded-xl group relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img src={currentTrack.thumbnail} className="w-16 h-16 rounded-md shadow-2xl z-10" alt="" />
                        <div className="ml-4 flex-1 z-10">
                            <div className="text-primary font-bold text-lg leading-tight">{currentTrack.title}</div>
                            <div className="text-white/60 text-sm">{currentTrack.artist}</div>
                        </div>
                        <div className="flex items-center space-x-[2px] h-4 mr-4">
                            <div className="w-[3px] bg-primary animate-[bounce_0.8s_infinite] h-2"></div>
                            <div className="w-[3px] bg-primary animate-[bounce_1s_infinite] h-4"></div>
                            <div className="w-[3px] bg-primary animate-[bounce_0.9s_infinite] h-2.5"></div>
                        </div>
                    </div>
                </section>
            )}

            {/* Up Next Section */}
            <section>
                <h2 className="text-textSecondary text-sm font-bold uppercase tracking-widest mb-4">Up Next</h2>
                <div className="space-y-1">
                    {upNext.length > 0 ? (
                        upNext.map((track, i) => {
                            const actualIndex = currentIndex + 1 + i;
                            return (
                                <div 
                                    key={`${track.id}-${actualIndex}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, actualIndex)}
                                    onDragOver={(e) => handleDragOver(e, actualIndex)}
                                    onDrop={(e) => handleDrop(e, actualIndex)}
                                    className={`group flex items-center p-3 rounded-lg hover:bg-white/5 transition-all cursor-move border border-transparent
                                    ${draggedIndex === actualIndex ? 'opacity-40 bg-white/10 border-primary/20' : ''}`}
                                >
                                    <div className="w-8 flex items-center justify-center text-white/20 group-hover:text-white/60 transition-colors">
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                    <img src={track.thumbnail} className="w-12 h-12 rounded shadow-lg mx-3" alt="" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-semibold truncate text-sm">{track.title}</div>
                                        <div className="text-white/40 text-xs truncate">{track.artist}</div>
                                    </div>
                                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => playTrack(track, queue)}
                                            className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                        </button>
                                        <button 
                                            onClick={() => removeFromQueue(track.id)}
                                            className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-red-400"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-12 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-white/20">
                            <p className="text-sm">No songs in queue</p>
                        </div>
                    )}
                </div>
            </section>

            {/* History (Optional but nice) */}
            {history.length > 0 && (
                <section className="mt-12 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                    <h2 className="text-textSecondary text-sm font-bold uppercase tracking-widest mb-4">Played</h2>
                    <div className="space-y-1">
                        {history.map((track, i) => (
                            <div key={`${track.id}-hist-${i}`} className="flex items-center p-3 rounded-lg hover:bg-white/5">
                                <span className="w-8 text-center text-xs text-white/20">{i + 1}</span>
                                <img src={track.thumbnail} className="w-10 h-10 rounded shadow-lg mx-3" alt="" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-medium truncate text-sm">{track.title}</div>
                                    <div className="text-white/40 text-xs truncate">{track.artist}</div>
                                </div>
                                <button 
                                    onClick={() => playTrack(track, queue)}
                                    className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white"
                                >
                                    <Play className="w-4 h-4 fill-current" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
