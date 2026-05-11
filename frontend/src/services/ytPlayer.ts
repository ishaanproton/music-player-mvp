import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

let player: any = null;
let interval: any = null;

export const useYouTubePlayer = () => {
  const { currentTrack, setPlayState, isPlaying, playNext, volume, setVolume } = usePlayerStore();
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load YouTube API script
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
    }

    const initPlayer = () => {
      if (playerRef.current && !player) {
        player = new window.YT.Player(playerRef.current, {
          height: '0',
          width: '0',
          videoId: currentTrack?.id || '',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            playsinline: 1,
          },
          events: {
            onReady: (e: any) => {
              e.target.setVolume(volume);
              if (isPlaying && currentTrack) {
                e.target.playVideo();
              }
            },
            onStateChange: (e: any) => {
              if (e.data === window.YT.PlayerState.PLAYING) {
                setPlayState(true);
              } else if (e.data === window.YT.PlayerState.PAUSED) {
                setPlayState(false);
              } else if (e.data === window.YT.PlayerState.ENDED) {
                playNext();
              }
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  useEffect(() => {
    if (player && player.loadVideoById) {
      if (currentTrack) {
        player.loadVideoById(currentTrack.id);
        if (!isPlaying) {
          player.pauseVideo();
        }
      }
    }
  }, [currentTrack]);

  useEffect(() => {
    if (player && player.playVideo) {
      if (isPlaying) {
        player.playVideo();
      } else {
        player.pauseVideo();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (player && player.setVolume) {
      player.setVolume(volume);
    }
  }, [volume]);

  const seekTo = (seconds: number) => {
    if (player && player.seekTo) {
      player.seekTo(seconds, true);
    }
  };

  const getCurrentTime = () => {
    if (player && player.getCurrentTime) {
      return player.getCurrentTime();
    }
    return 0;
  };

  return { playerRef, seekTo, getCurrentTime };
};

// Add to global window for TS
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
