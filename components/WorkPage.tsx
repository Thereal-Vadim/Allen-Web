import React, { useRef, useState, useEffect } from 'react';
import { ProjectList } from './ProjectList';
import { getCachedVideoUrl } from '../firebase';

export const WorkPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  const FALLBACK_LINK = "https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-346-large.mp4";

  useEffect(() => {
    let active = true;
    const loadVideo = async () => {
      try {
        // 1. Try MP4
        const url = await getCachedVideoUrl("hero-video.mp4");
        if(active) setVideoSrc(url);
      } catch (error) {
        // 2. Try WebM
        try {
            const webmUrl = await getCachedVideoUrl("hero-video.webm");
            if (active) setVideoSrc(webmUrl);
        } catch (webmError) {
             console.warn("WorkPage: Firebase Load Failed, using fallback.");
             if (active) setVideoSrc(FALLBACK_LINK);
        }
      }
    };
    loadVideo();
    return () => { active = false; };
  }, []);

  const handleVideoError = () => {
    if (videoRef.current) {
      if (videoRef.current.src === FALLBACK_LINK || videoRef.current.src.includes("mixkit")) {
          return; // Stop loop
      }
      console.warn(`WorkPage: Video failed. Swapping to fallback.`);
      setVideoSrc(FALLBACK_LINK);
      videoRef.current.load();
    }
  };

  return (
    <div className="relative min-h-screen w-full pt-20">
      {/* Background Video */}
      <div className="fixed inset-0 w-full h-full z-0 bg-[#050505]">
        {/* Placeholder Gradient to hide black screen if needed */}
        <div className={`absolute inset-0 bg-gradient-to-b from-[#050505] to-[#080808] transition-opacity duration-1000 ${isVideoReady ? 'opacity-0' : 'opacity-100'}`} />

        {videoSrc && (
          <video 
            ref={videoRef}
            src={videoSrc}
            autoPlay 
            muted 
            loop 
            playsInline
            onError={handleVideoError}
            // Optimization: Fade in only when frame data is available
            onCanPlay={() => setIsVideoReady(true)}
            onLoadedData={() => setIsVideoReady(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${isVideoReady ? 'opacity-20' : 'opacity-0'}`}
          />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-[#050505] opacity-80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <ProjectList />
      </div>
    </div>
  );
};