import React from 'react';
import { Home, Search, Library, Heart, ListMusic } from 'lucide-react';

interface MobileNavProps {
    currentView: string;
    setCurrentView: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, setCurrentView }) => {
    const tabs = [
        { icon: Home, label: 'Home', viewId: 'home' },
        { icon: Search, label: 'Search', viewId: 'search' },
        { icon: Library, label: 'Library', viewId: 'library' },
        { icon: Heart, label: 'Liked', viewId: 'liked' },
        { icon: ListMusic, label: 'Queue', viewId: 'queue' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-black/95 backdrop-blur-lg border-t border-white/10">
            <div className="flex items-center justify-around h-16">
                {tabs.map(({ icon: Icon, label, viewId }) => {
                    const isActive = currentView === viewId;
                    return (
                        <button
                            key={viewId}
                            onClick={() => setCurrentView(viewId)}
                            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors
                            ${isActive ? 'text-primary' : 'text-textSecondary'}`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium">{label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
