import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

gsap.registerPlugin(ScrollTrigger);

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // CONFIG: Name of file in Firebase Storage Bucket
  const FIREBASE_FILE_NAME = "hero-video.mp4";
  
  // FALLBACK: Reliable CDN link if Firebase fails or is not configured
  const FALLBACK_LINK = "https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-346-large.mp4";

  useEffect(() => {
    const loadVideo = async () => {
      try {
        // Attempt to get the URL from Firebase
        const storageRef = ref(storage, FIREBASE_FILE_NAME);
        const url = await getDownloadURL(storageRef);
        setVideoSrc(url);
      } catch (error) {
        console.warn("Firebase Load Failed (Check firebase.ts config):", error);
        // On error, use fallback
        setVideoSrc(FALLBACK_LINK);
      }
    };

    loadVideo();
  }, []);

  useGSAP(() => {
    // Parallax Effect
    if (titleRef.current && containerRef.current) {
      gsap.to(titleRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }
  }, { scope: containerRef });

  const handleVideoError = () => {
    console.warn(`⚠️ Video source '${videoSrc}' failed to load. Switching to safety fallback.`);
    
    // Prevent infinite loop
    if (videoRef.current && videoRef.current.src !== FALLBACK_LINK) {
        setVideoSrc(FALLBACK_LINK);
        videoRef.current.load();
    }
  };

  return (
    <section 
      ref={containerRef} 
      className="relative h-screen w-full flex flex-col justify-end p-4 md:p-10 overflow-hidden bg-[#050505]"
    >
      {/* FULLSCREEN BACKGROUND VIDEO */}
      <div className="absolute inset-0 w-full h-full z-0">
        {videoSrc && (
          <video 
            ref={videoRef}
            src={videoSrc}
            autoPlay 
            muted 
            loop 
            playsInline
            onError={handleVideoError}
            onLoadedData={() => setIsVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-50' : 'opacity-0'}`} 
          >
            Your browser does not support the video tag.
          </video>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90"></div>
      </div>

      {/* Hero Typography */}
      <h1 ref={titleRef} className="relative z-10 text-[11vw] leading-[0.8] font-[900] uppercase text-[#f4f4f2] mix-blend-difference pointer-events-none mb-10 md:mb-0">
        VIDEO<br/>PRODUCER
      </h1>

      {/* Interactive CTA Button */}
      <div className="absolute bottom-10 right-5 md:right-10 z-20">
        <a href="mailto:koptsev.cooperation@gmail.com" className="group relative flex items-center gap-2 px-4 py-2 bg-[#080808] border border-[#333] rounded-full hover:border-[#f4f4f2] transition-colors duration-500 cursor-none interactive">
          {/* Icon Container */}
          <div className="relative w-3 h-3 flex items-center justify-center">
            <div className="absolute w-1.5 h-1.5 bg-[#f4f4f2] rounded-full transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-0" />
            <svg 
              className="absolute w-2.5 h-2.5 text-[#f4f4f2] opacity-0 -rotate-90 scale-50 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:opacity-100 group-hover:rotate-0 group-hover:scale-100" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="4"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          {/* Text Container */}
          <div className="relative h-3.5 w-[135px] overflow-hidden">
            <div className="absolute inset-0 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full">
              <span className="font-['Unbounded'] font-bold text-[10px] tracking-wide text-[#f4f4f2] h-full flex items-center whitespace-nowrap">
                LET'S COLLABORATE
              </span>
              <span className="font-['Unbounded'] font-bold text-[10px] tracking-wide text-[#f4f4f2] h-full flex items-center whitespace-nowrap">
                LET'S GO!
              </span>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
};