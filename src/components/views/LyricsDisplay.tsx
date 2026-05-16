import React, { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '../../services/api';
import type { LrcLine } from '../../services/api';
import { usePlayerStore } from '../../store/usePlayerStore';
import { useYouTubePlayer } from '../../services/ytPlayer';
import { Loader2, Minus, Plus } from 'lucide-react';

export const LyricsDisplay = () => {
    const { currentTrack, isPlaying } = usePlayerStore();
    const { getCurrentTime, seekTo } = useYouTubePlayer();

    const [lines, setLines] = useState<LrcLine[]>([]);
    const [isSynced, setIsSynced] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState(0);
    // Manual sync offset in seconds (user can nudge +/- 5s)
    const [offset, setOffset] = useState(0);
    const [activeLineIdx, setActiveLineIdx] = useState(-1);

    const scrollRef = useRef<HTMLDivElement>(null);
    const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Fetch synced lyrics whenever track changes
    useEffect(() => {
        if (!currentTrack) return;

        setLines([]);
        setIsSynced(false);
        setError('');
        setOffset(0);
        setActiveLineIdx(-1);

        const fetchLyrics = async () => {
            setIsLoading(true);
            try {
                const data = await api.getLrcLyrics(currentTrack.title, currentTrack.artist, currentTrack.id);
                if (data.lines && data.lines.length > 0) {
                    setLines(data.lines);
                    setIsSynced(data.synced);
                } else {
                    setError('No lyrics found for this track.');
                }
            } catch (err) {
                setError('Could not fetch lyrics. Check your connection.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLyrics();
    }, [currentTrack]);

    // Poll YouTube player time every 250ms for responsive sync
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isPlaying && isSynced) {
            interval = setInterval(() => {
                setCurrentTime(getCurrentTime());
            }, 250);
        }
        return () => clearInterval(interval);
    }, [isPlaying, isSynced, getCurrentTime]);

    // Calculate active line index from currentTime + offset
    useEffect(() => {
        if (!isSynced || lines.length === 0) return;
        const adjustedTime = currentTime + offset;
        let idx = -1;
        for (let i = 0; i < lines.length; i++) {
            const lineTime = lines[i].time;
            if (lineTime !== null && adjustedTime >= lineTime) {
                idx = i;
            }
        }
        setActiveLineIdx(idx);
    }, [currentTime, offset, lines, isSynced]);

    // Auto-scroll active line to center of lyrics panel
    useEffect(() => {
        if (activeLineIdx < 0) return;
        const el = lineRefs.current[activeLineIdx];
        if (el && scrollRef.current) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [activeLineIdx]);

    // --- Render States ---
    if (!currentTrack) {
        return (
            <div className="h-full flex items-center justify-center text-textSecondary">
                Select a track to view lyrics
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-textSecondary">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                <p>Fetching synced lyrics...</p>
            </div>
        );
    }

    if (error || lines.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-textSecondary">
                {error || 'No lyrics available for this track.'}
            </div>
        );
    }

    // --- Helpers ---
    // For word-level highlight within the active line, spread words across
    // the window between this line's start time and the next line's start time.
    const getWordHighlight = (lineIdx: number, wordIdx: number, totalWords: number): boolean => {
        if (!isSynced || lineIdx !== activeLineIdx) return false;
        const lineTime = lines[lineIdx].time;
        const nextLineTime = lines[lineIdx + 1]?.time ?? (lineTime! + 10);
        if (lineTime === null || nextLineTime === null) return true;

        const lineDuration = (nextLineTime as number) - (lineTime as number);
        const wordTime = (lineTime as number) + (lineDuration / totalWords) * wordIdx;
        return (currentTime + offset) >= wordTime;
    };

    const handleLineClick = (time: number | null) => {
        if (time === null || !isSynced) return;
        seekTo(time - offset); // account for any manual sync offset
    };

    return (
        <div className="h-full flex flex-col">
            {/* Sync offset toolbar */}
            <div className="flex items-center justify-center gap-3 py-3 border-b border-white/5 flex-shrink-0">
                <span className="text-xs text-textSecondary font-medium">Sync offset:</span>
                <button
                    onClick={() => setOffset(o => Math.max(-5, +(o - 0.5).toFixed(1)))}
                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white transition"
                >
                    <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm text-white font-bold w-14 text-center">
                    {offset >= 0 ? '+' : ''}{offset.toFixed(1)}s
                </span>
                <button
                    onClick={() => setOffset(o => Math.min(5, +(o + 0.5).toFixed(1)))}
                    className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white transition"
                >
                    <Plus className="w-3 h-3" />
                </button>
                {!isSynced && (
                    <span className="ml-2 text-xs text-yellow-400/70 font-medium">
                        ⚠ No timestamps — plain text
                    </span>
                )}
            </div>

            {/* Lyrics scroll area */}
            <div className="flex-1 overflow-y-auto" ref={scrollRef}>
                <div className="max-w-2xl mx-auto text-center space-y-10 pt-24 pb-48 px-8">
                    {lines.map((line, lineIdx) => {
                        const words = line.text.split(' ');
                        const isActive = lineIdx === activeLineIdx;
                        const isPast = isSynced && lineIdx < activeLineIdx;

                        return (
                            <div
                                key={lineIdx}
                                ref={el => { lineRefs.current[lineIdx] = el; }}
                                onClick={() => handleLineClick(line.time)}
                                title={isSynced && line.time !== null ? 'Click to jump to this line' : undefined}
                                className={`flex flex-wrap justify-center gap-x-2 gap-y-1 transition-all duration-500
                                    ${isSynced && line.time !== null ? 'cursor-pointer hover:opacity-80' : ''}
                                    ${isActive
                                        ? 'scale-110 opacity-100'
                                        : isPast
                                        ? 'opacity-25 scale-100'
                                        : 'opacity-20 scale-95'
                                    }`}
                            >
                                {words.map((word, wordIdx) => {
                                    const wordLit = isSynced
                                        ? getWordHighlight(lineIdx, wordIdx, words.length)
                                        : isActive; // plain text: whole line highlights

                                    return (
                                        <span
                                            key={wordIdx}
                                            className={`text-3xl sm:text-4xl font-black tracking-tight transition-colors duration-200
                                                ${wordLit
                                                    ? 'text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]'
                                                    : isActive
                                                    ? 'text-white/30'
                                                    : 'text-white/10'
                                                }`}
                                        >
                                            {word}
                                        </span>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
