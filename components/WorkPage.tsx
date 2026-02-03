import React, { useRef, useState, useEffect } from 'react';
import { ProjectList } from './ProjectList';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export const WorkPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>("");
  
  // CONFIG: Name of file in Firebase Storage Bucket
  const FIREBASE_FILE_NAME = "hero-video.mp4";
  const FALLBACK_LINK = "https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-346-large.mp4";

  useEffect(() => {
    const loadVideo = async () => {
      try {
        const storageRef = ref(storage, FIREBASE_FILE_NAME);
        const url = await getDownloadURL(storageRef);
        setVideoSrc(url);
      } catch (error) {
        console.warn("WorkPage: Firebase Load Failed, using fallback.", error);
        setVideoSrc(FALLBACK_LINK);
      }
    };
    loadVideo();
  }, []);

  const handleVideoError = () => {
    if (videoRef.current) {
      if (videoRef.current.src === FALLBACK_LINK || videoRef.current.src.includes(FALLBACK_LINK)) {
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
        {videoSrc && (
          <video 
            ref={videoRef}
            src={videoSrc}
            autoPlay 
            muted 
            loop 
            playsInline
            onError={handleVideoError}
            className="w-full h-full object-cover opacity-20 transition-opacity duration-1000"
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