import React, { useEffect } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { PlusSquare, Music, ChevronRight } from 'lucide-react';

interface LibraryViewProps {
    setCurrentView: (view: string) => void;
    currentView: string;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ setCurrentView, currentView }) => {
    const { playlists, loadPlaylists, createPlaylist } = usePlayerStore();

    useEffect(() => {
        loadPlaylists();
    }, [loadPlaylists]);

    const handleCreatePlaylist = async () => {
        const name = prompt("Enter a name for your new playlist:", "My Playlist");
        if (name && name.trim()) {
            const id = await createPlaylist(name.trim());
            setCurrentView(`playlist:${id}`);
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 pb-40">
            <h1 className="text-3xl font-black text-white mb-6 tracking-tight">Your Library</h1>

            {/* Create Playlist button */}
            <button 
                onClick={handleCreatePlaylist}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors mb-6"
            >
                <div className="w-12 h-12 bg-surfaceHover flex items-center justify-center rounded-lg">
                    <PlusSquare className="w-6 h-6 text-textSecondary" />
                </div>
                <div className="text-left">
                    <div className="text-white font-semibold text-sm">Create Playlist</div>
                    <div className="text-textSecondary text-xs">Build your collection</div>
                </div>
            </button>

            {/* Playlists */}
            {playlists.length > 0 ? (
                <div className="space-y-1">
                    <p className="text-xs font-bold text-textSecondary tracking-widest uppercase mb-3">Your Playlists</p>
                    {playlists.map(playlist => (
                        <button
                            key={playlist.id}
                            onClick={() => setCurrentView(`playlist:${playlist.id}`)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                            ${currentView === `playlist:${playlist.id}` ? 'bg-white/10 text-white' : 'text-textSecondary hover:bg-white/5 hover:text-white'}`}
                        >
                            <div className="w-10 h-10 bg-surfaceHover rounded-md flex items-center justify-center flex-shrink-0">
                                <Music className="w-5 h-5 opacity-50" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="text-sm font-medium truncate">{playlist.name}</div>
                                <div className="text-xs text-textSecondary">
                                    {playlist.trackIds?.length || 0} songs
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-textSecondary">
                    <Music className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No playlists yet</p>
                    <p className="text-xs mt-1">Create your first playlist above!</p>
                </div>
            )}
        </div>
    );
};
