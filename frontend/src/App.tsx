import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { PlayerBar } from './components/player/PlayerBar';
import { Search } from './components/views/Search';
import { LikedSongs } from './components/views/LikedSongs';
import { Home } from './components/views/Home';
import { LyricsDisplay } from './components/views/LyricsDisplay';
import { ArtistProfile } from './components/views/ArtistProfile';
import { QueueView } from './components/views/QueueView';
import { PlaylistView } from './components/views/PlaylistView';
import { Menu } from 'lucide-react';

import { usePlayerStore } from './store/usePlayerStore';

function App() {
  const [currentView, setCurrentView] = useState('search');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { showLyrics, activeArtistId, setActiveArtistId } = usePlayerStore();

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setActiveArtistId(null);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
    if (showLyrics) {
      usePlayerStore.setState({ showLyrics: false });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - always visible on desktop, slide-in drawer on mobile */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <Sidebar currentView={currentView} setCurrentView={handleViewChange} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 bg-surface rounded-tl-lg rounded-tr-lg overflow-hidden flex flex-col relative pb-24 sm:pb-24 min-w-0">
        {/* Mobile Header with hamburger */}
        <div className="lg:hidden flex items-center px-4 py-3 bg-surface border-b border-white/5 flex-shrink-0 z-10">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="ml-3 flex items-center">
            <div className="w-6 h-6 bg-primary rounded-full mr-2 flex items-center justify-center shadow-[0_0_10px_rgba(29,185,84,0.4)]">
              <div className="w-2 h-2 bg-black rounded-full" />
            </div>
            <span className="text-white font-bold text-lg tracking-tighter">SoundFlow</span>
          </div>
        </div>

        {/* Dynamic View rendering */}
        <div className="flex-1 overflow-hidden h-full relative">
          {showLyrics ? (
              <div className="absolute inset-0 bg-surface/95 z-20 backdrop-blur-xl">
                  <LyricsDisplay />
              </div>
          ) : null}

          <div className="h-full">
            {activeArtistId ? (
                <ArtistProfile artistId={activeArtistId} />
            ) : (
                <>
                    {currentView === 'search' && <Search />}
                    {currentView === 'home' && <Home />}
                    {currentView === 'library' && <div className="p-4 sm:p-8 text-white"><h1 className="text-2xl sm:text-3xl font-bold">Your Library</h1></div>}
                    {currentView === 'liked' && <LikedSongs />}
                    {currentView === 'queue' && <QueueView />}
                    {currentView.startsWith('playlist:') && <PlaylistView playlistId={currentView.split(':')[1]} setCurrentView={handleViewChange} />}
                </>
            )}
          </div>
        </div>
        
        {/* Gradient fade at bottom to hide scrolling behind player */}
        <div className="absolute bottom-24 left-0 right-0 h-16 bg-gradient-to-t from-surface to-transparent pointer-events-none z-10" />
      </main>

      {/* Bottom Player Bar */}
      <PlayerBar />
    </div>
  );
}

export default App;
