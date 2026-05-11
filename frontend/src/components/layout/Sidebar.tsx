import React, { useEffect } from 'react';
import { Home, Search, Library, PlusSquare, Heart, ListMusic, Music, X } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

interface SidebarProps {
    currentView: string;
    setCurrentView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
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
    
    const NavItem = ({ icon: Icon, label, viewId }: { icon: any, label: string, viewId: string }) => {
        const isActive = currentView === viewId;
        return (
            <button 
                onClick={() => setCurrentView(viewId)}
                className={`flex items-center space-x-4 px-4 py-3 w-full rounded-md transition-colors font-medium text-sm
                ${isActive ? 'bg-surfaceHover text-white' : 'text-textSecondary hover:text-white'}`}
            >
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-textSecondary'}`} />
                <span>{label}</span>
            </button>
        );
    };

    return (
        <div className="w-72 lg:w-64 bg-black h-full flex flex-col pt-6 pb-24">
            {/* Logo — hidden on mobile since App.tsx has a header */}
            <div className="px-6 mb-8 text-white font-bold text-2xl tracking-tighter flex items-center">
                <div className="w-8 h-8 bg-primary rounded-full mr-2 flex items-center justify-center shadow-[0_0_15px_rgba(29,185,84,0.4)]">
                    <div className="w-3 h-3 bg-black rounded-full" />
                </div>
                SoundFlow
            </div>

            <nav className="px-2 space-y-1">
                <NavItem icon={Home} label="Home" viewId="home" />
                <NavItem icon={Search} label="Search" viewId="search" />
                <NavItem icon={Library} label="Your Library" viewId="library" />
                <NavItem icon={ListMusic} label="Playing Next" viewId="queue" />
            </nav>

            <div className="mt-8 px-2 space-y-1">
                <button 
                    onClick={handleCreatePlaylist}
                    className="flex items-center space-x-4 px-4 py-3 w-full rounded-md transition-colors font-medium text-sm text-textSecondary hover:text-white"
                >
                    <div className="w-6 h-6 bg-textSecondary flex items-center justify-center rounded-sm text-black">
                        <PlusSquare className="w-4 h-4" />
                    </div>
                    <span>Create Playlist</span>
                </button>
                <button 
                    onClick={() => setCurrentView('liked')}
                    className={`flex items-center space-x-4 px-4 py-3 w-full rounded-md transition-colors font-medium text-sm
                    ${currentView === 'liked' ? 'bg-surfaceHover text-white' : 'text-textSecondary hover:text-white'}`}
                >
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-blue-300 flex items-center justify-center rounded-sm">
                        <Heart className="w-3 h-3 fill-white text-white" />
                    </div>
                    <span>Liked Songs</span>
                </button>
            </div>

            <div className="mt-6 px-6 pt-4 border-t border-white/10 flex-1 overflow-y-auto">
                <p className="text-xs font-semibold text-textSecondary mb-4 tracking-widest uppercase">Playlists</p>
                <div className="space-y-2">
                    {playlists.map(playlist => (
                        <button
                            key={playlist.id}
                            onClick={() => setCurrentView(`playlist:${playlist.id}`)}
                            className={`w-full text-left truncate text-sm transition-colors flex items-center
                            ${currentView === `playlist:${playlist.id}` ? 'text-white' : 'text-textSecondary hover:text-white'}`}
                        >
                            <Music className="w-4 h-4 mr-3 opacity-50" />
                            {playlist.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
