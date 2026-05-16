import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    MoreVertical, ListMusic, PlusSquare, 
    Heart, User, Slash, Play, Music, ArrowLeft
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import type { Track } from '../../types';

interface TrackContextMenuProps {
    track: Track;
    className?: string;
}

export const TrackContextMenu: React.FC<TrackContextMenuProps> = ({ track, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [openDirection, setOpenDirection] = useState<'up' | 'down'>('up');
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    
    const { 
        addToQueue, addToQueueNext, toggleLike, 
        likedTrackIds, setActiveArtistId, playTrack,
        playlists, addTrackToPlaylist, createPlaylist,
        hideTrack
    } = usePlayerStore();

    const [menuView, setMenuView] = useState<'main' | 'playlists'>('main');

    const isLiked = likedTrackIds.includes(track.id);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setTimeout(() => setMenuView('main'), 200); // reset after animation
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', () => setIsOpen(false), true);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', () => setIsOpen(false), true);
        };
    }, [isOpen]);

    const handleAction = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
        setIsOpen(false);
        setTimeout(() => setMenuView('main'), 200);
    };

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top,
                left: rect.left
            });
            
            const spaceAbove = rect.top;
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceAbove < 350 && spaceBelow >= spaceAbove) {
                setOpenDirection('down');
            } else {
                setOpenDirection('up');
            }
        }
        setIsOpen(!isOpen);
    };

    const menuContent = (
        <div 
            ref={menuRef}
            className="fixed w-56 bg-surfaceHover border border-white/10 rounded-xl shadow-2xl z-[9999] py-1 overflow-hidden backdrop-blur-3xl"
            style={{ 
                top: openDirection === 'up' ? `${coords.top - 10}px` : `${coords.top + 32}px`, 
                left: `${coords.left - 220}px`,
                transform: openDirection === 'up' ? 'translateY(-100%)' : 'none'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {menuView === 'main' ? (
                <>
                    <button 
                        onClick={(e) => handleAction(e, () => playTrack(track))}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <Play className="w-4 h-4 mr-3" />
                        Play now
                    </button>
                    <button 
                        onClick={(e) => handleAction(e, () => addToQueueNext(track))}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <ListMusic className="w-4 h-4 mr-3" />
                        Play next
                    </button>
                    <button 
                        onClick={(e) => handleAction(e, () => addToQueue(track))}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <PlusSquare className="w-4 h-4 mr-3" />
                        Add to queue
                    </button>
                    <div className="h-[1px] bg-white/5 my-1"></div>
                    <button 
                        onClick={(e) => handleAction(e, () => toggleLike(track))}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <Heart className={`w-4 h-4 mr-3 ${isLiked ? 'fill-primary text-primary' : ''}`} />
                        {isLiked ? 'Remove from Liked' : 'Add to Liked'}
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuView('playlists');
                        }}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <Music className="w-4 h-4 mr-3" />
                        Save to playlist
                    </button>
                    <div className="h-[1px] bg-white/5 my-1"></div>
                    <button 
                        onClick={(e) => handleAction(e, () => {
                            if (track.artistId) setActiveArtistId(track.artistId);
                        })}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <User className="w-4 h-4 mr-3" />
                        Go to artist
                    </button>
                    <button 
                        onClick={(e) => handleAction(e, () => {
                            hideTrack(track.id);
                        })}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-red-400 transition-colors"
                    >
                        <Slash className="w-4 h-4 mr-3" />
                        Not interested
                    </button>
                </>
            ) : (
                <>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuView('main');
                        }}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors font-semibold"
                    >
                        <ArrowLeft className="w-4 h-4 mr-3" />
                        Back
                    </button>
                    <div className="h-[1px] bg-white/5 my-1"></div>
                    <button 
                        onClick={(e) => handleAction(e, async () => {
                            const name = prompt("Enter a name for your new playlist:", "My Playlist");
                            if (name && name.trim()) {
                                const id = await createPlaylist(name.trim());
                                await addTrackToPlaylist(id, track);
                            }
                        })}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <PlusSquare className="w-4 h-4 mr-3" />
                        New Playlist
                    </button>
                    {playlists.length > 0 && <div className="h-[1px] bg-white/5 my-1"></div>}
                    <div className="max-h-48 overflow-y-auto">
                        {playlists.map(playlist => (
                            <button 
                                key={playlist.id}
                                onClick={(e) => handleAction(e, () => addTrackToPlaylist(playlist.id, track))}
                                className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors truncate"
                            >
                                <Music className="w-4 h-4 mr-3 opacity-50 flex-shrink-0" />
                                <span className="truncate">{playlist.name}</span>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className={`relative ${className}`}>
            <button 
                ref={buttonRef}
                onClick={toggleMenu}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
            >
                <MoreVertical className="w-5 h-5" />
            </button>

            {isOpen && createPortal(menuContent, document.body)}
        </div>
    );
};
