import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { PlayerBar } from './components/player/PlayerBar';
import { MiniPlayer } from './components/player/MiniPlayer';
import { FullScreenPlayer } from './components/player/FullScreenPlayer';
import { Search } from './components/views/Search';
import { LikedSongs } from './components/views/LikedSongs';
import { Home } from './components/views/Home';
import { LyricsDisplay } from './components/views/LyricsDisplay';
import { ArtistProfile } from './components/views/ArtistProfile';
import { QueueView } from './components/views/QueueView';
import { PlaylistView } from './components/views/PlaylistView';
import { LibraryView } from './components/views/LibraryView';

import { usePlayerStore } from './store/usePlayerStore';

function App() {
  const [currentView, setCurrentView] = useState('search');
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const { showLyrics, activeArtistId, setActiveArtistId, showQueue } = usePlayerStore();

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setActiveArtistId(null);
    if (showLyrics) {
      usePlayerStore.setState({ showLyrics: false });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - desktop only */}
      <div className="hidden md:block">
        <Sidebar currentView={currentView} setCurrentView={handleViewChange} />
      </div>

      {/* Main Content Area */}
      <main className={`flex-1 bg-surface md:rounded-tl-lg overflow-hidden flex flex-col relative 
        pb-[140px] md:pb-24
        ${!showQueue ? 'md:rounded-tr-lg' : ''}`}
      >
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
                    {currentView === 'library' && <LibraryView setCurrentView={handleViewChange} currentView={currentView} />}
                    {currentView === 'liked' && <LikedSongs />}
                    {currentView === 'queue' && (
                      <div className="md:hidden h-full">
                        <QueueView />
                      </div>
                    )}
                    {currentView.startsWith('playlist:') && <PlaylistView playlistId={currentView.split(':')[1]} setCurrentView={handleViewChange} />}
                </>
            )}
          </div>
        </div>
        
        {/* Gradient fade at bottom to hide scrolling behind player */}
        <div className="absolute bottom-24 left-0 right-0 h-16 bg-gradient-to-t from-surface to-transparent pointer-events-none z-10 hidden md:block" />
      </main>

      {/* Persistent Queue Panel - desktop only */}
      {showQueue && (
        <aside className="hidden md:block w-[350px] bg-surface overflow-hidden rounded-tr-lg border-l border-white/5 pb-24 relative z-0">
          <QueueView />
        </aside>
      )}

      {/* Player Bar - always rendered (contains YouTube iframe), UI hidden on mobile */}
      <PlayerBar />

      {/* Mobile Mini Player */}
      <MiniPlayer onExpand={() => setShowFullPlayer(true)} />

      {/* Mobile Full Screen Player */}
      {showFullPlayer && (
        <FullScreenPlayer onClose={() => setShowFullPlayer(false)} />
      )}

      {/* Mobile Bottom Nav */}
      <MobileNav currentView={currentView} setCurrentView={handleViewChange} />
    </div>
  );
}

export default App;
