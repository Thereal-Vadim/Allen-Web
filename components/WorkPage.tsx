import React, { useRef } from 'react';
import { ProjectList } from './ProjectList';

export const WorkPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const LOCAL_VIDEO = "/video.mp4";
  const FALLBACK_LINK = "https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-346-large.mp4";

  const handleVideoError = () => {
    // FIX: Safe logging only
    if (videoRef.current) {
      if (videoRef.current.src === FALLBACK_LINK || videoRef.current.src.includes(FALLBACK_LINK)) {
          return; // Stop loop
      }
      
      console.warn("WorkPage: Local video not found. Swapping to fallback.");
      videoRef.current.src = FALLBACK_LINK;
      videoRef.current.load();
      videoRef.current.play().catch(() => { /* silent catch */ });
    }
  };

  return (
    <div className="relative min-h-screen w-full pt-20">
      {/* Background Video */}
      <div className="fixed inset-0 w-full h-full z-0 bg-[#050505]">
        <video 
          ref={videoRef}
          autoPlay 
          muted 
          loop 
          playsInline
          onError={handleVideoError}
          className="w-full h-full object-cover opacity-20"
        >
          <source src={LOCAL_VIDEO} />
        </video>
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