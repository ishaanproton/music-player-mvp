import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, User, Share2, UserPlus, Slash } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

interface ArtistContextMenuProps {
    artist: { id: string, name: string };
    className?: string;
}

export const ArtistContextMenu: React.FC<ArtistContextMenuProps> = ({ artist, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const [openDirection, setOpenDirection] = useState<'up' | 'down'>('up');
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { setActiveArtistId, hideArtist } = usePlayerStore();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
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
            if (spaceAbove < 250 && spaceBelow >= spaceAbove) {
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
            className="fixed w-48 bg-surfaceHover border border-white/10 rounded-xl shadow-2xl z-[9999] py-1 overflow-hidden backdrop-blur-3xl"
            style={{
                top: openDirection === 'up' ? `${coords.top - 10}px` : `${coords.top + 32}px`,
                left: `${coords.left - 180}px`,
                transform: openDirection === 'up' ? 'translateY(-100%)' : 'none'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                onClick={(e) => handleAction(e, () => setActiveArtistId(artist.id))}
                className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
                <User className="w-4 h-4 mr-3" />
                Go to artist
            </button>
            <button
                onClick={(e) => handleAction(e, () => {
                    navigator.clipboard.writeText(window.location.origin + "?artist=" + artist.id);
                    alert("Link copied to clipboard!");
                })}
                className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
                <Share2 className="w-4 h-4 mr-3" />
                Share
            </button>
            <button
                onClick={(e) => handleAction(e, () => { })}
                className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
                <UserPlus className="w-4 h-4 mr-3" />
                Follow
            </button>
            <div className="h-[1px] bg-white/5 my-1"></div>
            <button
                onClick={(e) => handleAction(e, () => {
                    hideArtist(artist.id);
                })}
                className="w-full flex items-center px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-red-400 transition-colors"
            >
                <Slash className="w-4 h-4 mr-3" />
                Not interested
            </button>
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
