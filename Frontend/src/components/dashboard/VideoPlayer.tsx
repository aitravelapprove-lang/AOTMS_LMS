import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { fetchWithAuth } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  videoId: string;
  courseId: string;
  onComplete?: () => void;
}

interface ProgressData {
  last_watched_time?: number;
  watched_percentage?: number;
  completed?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, videoId, courseId, onComplete }) => {
  const playerRef = useRef<ReactPlayer | HTMLVideoElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSavedProgress, setLastSavedProgress] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);
  const [pendingSeek, setPendingSeek] = useState<number | null>(null);

  // Refs for sync access in beforeunload
  const progressRef = useRef(0);
  const timeRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);

  // 1. Fetch saved progress on mount
  const [hasFetchedProgress, setHasFetchedProgress] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetchWithAuth<ProgressData>(`/progress/${videoId}`);
        if (data && data.last_watched_time) {
          setLastSavedProgress(data.watched_percentage || 0);
          setPendingSeek(data.last_watched_time);
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
      } finally {
        setHasFetchedProgress(true);
      }
    };
    init();
  }, [videoId]);

  const saveProgress = useCallback(async (percentage: number, currentTime: number, isCompleted: boolean = false) => {
    try {
      if (!videoId || !courseId) return;
      await fetchWithAuth('/progress/save', {
        method: 'POST',
        body: JSON.stringify({
          videoId,
          courseId,
          watchedPercentage: percentage,
          lastWatchedTime: currentTime,
          completed: isCompleted
        })
      });
      setLastSavedProgress(percentage);
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  }, [videoId, courseId]);

  // Handle native video events
  const onNativeTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    const progress = (video.currentTime / video.duration) * 100;
    const percentage = Math.floor(progress);
    setCurrentProgress(percentage);
    progressRef.current = percentage;
    timeRef.current = video.currentTime;

    if (percentage >= lastSavedProgress + 5) {
      saveProgress(percentage, video.currentTime, percentage >= 95);
    }
  };

  const onNativeLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    setDuration(video.duration);
    if (!hasResumed && pendingSeek !== null) {
      video.currentTime = pendingSeek;
      setHasResumed(true);
      setPendingSeek(null);
    }
  };

  // 4. Handle Tab Close / Unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const body = JSON.stringify({
        videoId,
        courseId,
        watchedPercentage: progressRef.current,
        lastWatchedTime: timeRef.current,
        completed: progressRef.current >= 95
      });
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const token = localStorage.getItem('access_token');
      if (token) {
          fetch(`${API_BASE}/progress/save`, { method: 'POST', body, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, keepalive: true });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [videoId, courseId]);

  const isS3 = url.includes('/api/s3/public/') || url.includes('.amazonaws.com');

  return (
    <div className="relative group w-full h-full min-h-[400px] bg-black rounded-2xl overflow-hidden shadow-2xl">
      {/* Percentage Overlay */}
      <div className="absolute top-4 left-4 z-20 transition-opacity opacity-0 group-hover:opacity-100">
         <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${currentProgress >= 95 ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`} />
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
              {currentProgress}% {currentProgress >= 95 ? 'Completed' : 'Watched'}
            </span>
         </div>
      </div>

      {isS3 ? (
        <video
          ref={playerRef as React.RefObject<HTMLVideoElement>}
          src={url}
          className="w-full h-full object-contain"
          controls
          autoPlay
          onTimeUpdate={onNativeTimeUpdate}
          onLoadedMetadata={onNativeLoadedMetadata}
          onEnded={() => saveProgress(100, duration, true)}
          onPause={() => saveProgress(progressRef.current, timeRef.current, progressRef.current >= 95)}
          controlsList="nodownload"
        />
      ) : (
        <ReactPlayer
          ref={playerRef as React.RefObject<ReactPlayer>}
          url={url}
          width="100%"
          height="100%"
          controls
          playing={true}
          onProgress={(state: { played: number; playedSeconds: number }) => {
            const pct = Math.floor(state.played * 100);
            setCurrentProgress(pct);
            progressRef.current = pct;
            timeRef.current = state.playedSeconds;
            if (pct >= lastSavedProgress + 5) saveProgress(pct, state.playedSeconds, pct >= 95);
          }}
          onReady={() => {
            if (playerRef.current && 'getDuration' in playerRef.current) {
               setDuration(playerRef.current.getDuration());
               if (!hasResumed && pendingSeek !== null) {
                 playerRef.current.seekTo(pendingSeek, 'seconds');
                 setHasResumed(true);
                 setPendingSeek(null);
               }
            }
          }}
          onEnded={() => saveProgress(100, duration, true)}
          onPause={() => saveProgress(progressRef.current, timeRef.current, progressRef.current >= 95)}
          config={{ file: { attributes: { controlsList: 'nodownload', style: { width: '100%', height: '100%' } } } }}
        />
      )}

      {/* Persistent Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-10">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${currentProgress}%` }} />
      </div>
    </div>
  );
};
