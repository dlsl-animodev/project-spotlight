"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  ArrowLeft,
  Settings,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  title: string;
  onBack: () => void;
  poster?: string;
  videoKey?: string; // R2 key for refreshing signed URL on error
}

export default function VideoPlayer({
  src,
  title,
  onBack,
  poster,
  videoKey,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src);
  const maxRetries = 3;

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Refresh signed URL from the server
  const refreshSignedUrl = useCallback(async (): Promise<string | null> => {
    if (!videoKey) return null;
    try {
      const res = await fetch(
        `/api/signed-url?key=${encodeURIComponent(videoKey)}`
      );
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch (err) {
      console.error("Failed to refresh signed URL:", err);
    }
    return null;
  }, [videoKey]);

  // Handle video error - refresh URL and retry
  const handleVideoError = useCallback(async () => {
    console.error("Video error occurred, retry count:", retryCount);
    if (retryCount < maxRetries) {
      setIsLoading(true);
      setHasError(false);

      // Wait with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * (retryCount + 1))
      );

      // Try to get a fresh signed URL if we have the key
      let newSrc = currentSrc;
      if (videoKey) {
        const freshUrl = await refreshSignedUrl();
        if (freshUrl) {
          newSrc = freshUrl;
          setCurrentSrc(freshUrl);
        }
      }

      // Retry with fresh or cache-busted URL
      if (videoRef.current) {
        const separator = newSrc.includes("?") ? "&" : "?";
        videoRef.current.src = `${newSrc}${separator}_retry=${Date.now()}`;
        videoRef.current.load();
        setRetryCount((prev) => prev + 1);
      }
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  }, [retryCount, maxRetries, currentSrc, videoKey, refreshSignedUrl]);

  // Manual retry button handler
  const handleManualRetry = useCallback(async () => {
    setRetryCount(0);
    setHasError(false);
    setIsLoading(true);

    // Try to get a fresh signed URL
    let newSrc = currentSrc;
    if (videoKey) {
      const freshUrl = await refreshSignedUrl();
      if (freshUrl) {
        newSrc = freshUrl;
        setCurrentSrc(freshUrl);
      }
    }

    if (videoRef.current) {
      const separator = newSrc.includes("?") ? "&" : "?";
      videoRef.current.src = `${newSrc}${separator}_retry=${Date.now()}`;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentSrc, videoKey, refreshSignedUrl]);

  // Hide controls after inactivity
  const resetHideControlsTimer = useCallback(() => {
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    setShowControls(true);

    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Mouse move handler
  const handleMouseMove = () => {
    resetHideControlsTimer();
  };

  // Touch handler for mobile - tap to show/hide controls
  const handleTouchStart = useCallback(() => {
    resetHideControlsTimer();
  }, [resetHideControlsTimer]);

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, []);

  // Mute toggle
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, []);

  // Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Skip forward/back
  const skip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    const newTime = videoRef.current.currentTime + seconds;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 0, newTime)
    );
  }, []);

  // Fullscreen toggle - works on both desktop and mobile
  const toggleFullscreen = useCallback(async () => {
    const video = videoRef.current;
    const container = containerRef.current;

    if (!video || !container) return;

    try {
      // Check if we're currently in fullscreen (including iOS video fullscreen)
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement ||
        (video as any).webkitDisplayingFullscreen
      );

      if (!isCurrentlyFullscreen) {
        // Detect if mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isIOS && (video as any).webkitEnterFullscreen) {
          // iOS Safari - must use webkitEnterFullscreen on the video element
          // This is the ONLY way fullscreen works on iOS
          (video as any).webkitEnterFullscreen();
        } else if (isIOS && (video as any).webkitSupportsFullscreen) {
          // Fallback for older iOS
          (video as any).webkitEnterFullscreen();
        } else if (isMobile && container.requestFullscreen) {
          // Android Chrome - use container fullscreen
          await container.requestFullscreen();
        } else if (container.requestFullscreen) {
          // Desktop Chrome/Firefox/Edge
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          // Desktop Safari
          await (container as any).webkitRequestFullscreen();
        } else if ((container as any).mozRequestFullScreen) {
          // Firefox legacy
          await (container as any).mozRequestFullScreen();
        } else if ((container as any).msRequestFullscreen) {
          // IE/Edge legacy
          await (container as any).msRequestFullscreen();
        } else if ((video as any).webkitEnterFullscreen) {
          // Final fallback for iOS-like devices
          (video as any).webkitEnterFullscreen();
        }
      } else {
        // Exit fullscreen
        if (
          (video as any).webkitDisplayingFullscreen &&
          (video as any).webkitExitFullscreen
        ) {
          // iOS Safari - exit video fullscreen
          (video as any).webkitExitFullscreen();
        } else if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
      // If standard fullscreen fails on mobile, try native video fullscreen as last resort
      const video = videoRef.current;
      if (video && (video as any).webkitEnterFullscreen) {
        try {
          (video as any).webkitEnterFullscreen();
        } catch (e) {
          console.error("Native fullscreen also failed:", e);
        }
      }
    }
  }, []);

  // Seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  // Progress hover for preview time
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setHoverTime(pos * duration);
    setHoverPosition(e.clientX - rect.left);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.min(1, videoRef.current.volume + 0.1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (videoRef.current) {
            const newVol = Math.max(0, videoRef.current.volume - 0.1);
            videoRef.current.volume = newVol;
            setVolume(newVol);
          }
          break;
        case "m":
          toggleMute();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "Escape":
          if (!document.fullscreenElement) {
            onBack();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleMute, toggleFullscreen, skip, onBack]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      setHasError(false);
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
    };
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
    };
    const onError = () => {
      handleVideoError();
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("progress", onProgress);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
    };
  }, [handleVideoError]);

  // Auto-play on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked, user needs to interact
        setIsPlaying(false);
      });
    }
  }, []);

  // Fullscreen change listener - handles all browser prefixes
  useEffect(() => {
    const onFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    // Listen for fullscreen changes on video element too (for iOS)
    const video = videoRef.current;
    const onVideoFullscreenChange = () => {
      setIsFullscreen(!!(video as any)?.webkitDisplayingFullscreen);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("MSFullscreenChange", onFullscreenChange);

    // iOS Safari specific
    if (video) {
      video.addEventListener("webkitbeginfullscreen", () =>
        setIsFullscreen(true)
      );
      video.addEventListener("webkitendfullscreen", () =>
        setIsFullscreen(false)
      );
    }

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        onFullscreenChange
      );
      document.removeEventListener("mozfullscreenchange", onFullscreenChange);
      document.removeEventListener("MSFullscreenChange", onFullscreenChange);

      if (video) {
        video.removeEventListener("webkitbeginfullscreen", () =>
          setIsFullscreen(true)
        );
        video.removeEventListener("webkitendfullscreen", () =>
          setIsFullscreen(false)
        );
      }
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={handleTouchStart}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={currentSrc}
        poster={poster}
        className="h-full w-full cursor-pointer object-contain"
        onClick={togglePlay}
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        x-webkit-airplay="allow"
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        // Enable native fullscreen support on iOS
        onDoubleClick={toggleFullscreen}
      />

      {/* Loading Spinner */}
      <AnimatePresence>
        {isLoading && !hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Loader2 className="h-16 w-16 animate-spin text-red-600" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80"
          >
            <AlertCircle className="h-16 w-16 text-red-500" />
            <p className="text-lg text-white">Failed to load video</p>
            <button
              onClick={handleManualRetry}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition hover:bg-red-700"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </button>
            <button
              onClick={onBack}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              Go Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Play Button (when paused) */}
      <AnimatePresence>
        {!isPlaying && !isLoading && !hasError && showControls && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={togglePlay}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 p-6 backdrop-blur-sm transition hover:bg-white/30"
          >
            <Play className="h-16 w-16 fill-white text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/50"
            onClick={togglePlay}
          >
            {/* Top Bar */}
            <div
              className="absolute left-0 right-0 top-0 flex items-center justify-center p-4 md:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onBack}
                className="absolute left-4 flex items-center gap-2 rounded-lg bg-black/30 px-4 py-2 text-white backdrop-blur-sm transition hover:bg-black/50 md:left-6"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back</span>
              </button>

              <h1 className="max-w-md truncate text-lg font-semibold text-white md:text-xl">
                {title}
              </h1>
            </div>

            {/* Bottom Controls */}
            <div
              className="absolute bottom-0 left-0 right-0 p-4 md:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Progress Bar */}
              <div
                ref={progressRef}
                className="group relative mb-4 h-1 cursor-pointer rounded-full bg-white/30 transition-all hover:h-2"
                onClick={handleSeek}
                onMouseMove={handleProgressHover}
                onMouseLeave={() => setHoverTime(null)}
              >
                {/* Buffered */}
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-white/50"
                  style={{ width: `${bufferedProgress}%` }}
                />
                {/* Progress */}
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-red-600"
                  style={{ width: `${progress}%` }}
                />
                {/* Scrubber */}
                <div
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 opacity-0 shadow-lg transition group-hover:opacity-100"
                  style={{ left: `${progress}%` }}
                />
                {/* Hover Time Preview */}
                {hoverTime !== null && (
                  <div
                    className="absolute -top-10 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-xs text-white"
                    style={{ left: hoverPosition }}
                  >
                    {formatTime(hoverTime)}
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="rounded-lg p-2 text-white transition hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6 fill-white md:h-8 md:w-8" />
                    ) : (
                      <Play className="h-6 w-6 fill-white md:h-8 md:w-8" />
                    )}
                  </button>

                  {/* Skip Back */}
                  <button
                    onClick={() => skip(-10)}
                    className="hidden rounded-lg p-2 text-white transition hover:bg-white/20 sm:block"
                  >
                    <SkipBack className="h-5 w-5 md:h-6 md:w-6" />
                  </button>

                  {/* Skip Forward */}
                  <button
                    onClick={() => skip(10)}
                    className="hidden rounded-lg p-2 text-white transition hover:bg-white/20 sm:block"
                  >
                    <SkipForward className="h-5 w-5 md:h-6 md:w-6" />
                  </button>

                  {/* Volume */}
                  <div
                    className="relative flex items-center"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <button
                      onClick={toggleMute}
                      className="rounded-lg p-2 text-white transition hover:bg-white/20"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-5 w-5 md:h-6 md:w-6" />
                      ) : (
                        <Volume2 className="h-5 w-5 md:h-6 md:w-6" />
                      )}
                    </button>
                    <AnimatePresence>
                      {showVolumeSlider && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "80px" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="overflow-hidden"
                        >
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="ml-2 h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30 accent-red-600"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Time */}
                  <span className="ml-2 text-sm text-white md:text-base">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="rounded-lg p-2 text-white transition hover:bg-white/20"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-5 w-5 md:h-6 md:w-6" />
                    ) : (
                      <Maximize className="h-5 w-5 md:h-6 md:w-6" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
