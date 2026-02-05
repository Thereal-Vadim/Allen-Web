import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Project } from '../types';

interface ProjectGalleryProps {
  project: Project;
  onClose: () => void;
}

export const ProjectGallery: React.FC<ProjectGalleryProps> = ({ project, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Combine main video and extra gallery videos
  const allVideos = [project.videoUrl, ...(project.galleryUrls || [])].filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track which videos have actually started playing to handle the fade-in
  const [playingStates, setPlayingStates] = useState<{[key: number]: boolean}>({});

  const handleVideoTimeUpdate = (index: number, currentTime: number) => {
      // If video has advanced past 0.1s, mark it as playing
      if (currentTime > 0.1 && !playingStates[index]) {
          setPlayingStates(prev => ({...prev, [index]: true}));
      }
  };

  // Animation on Mount
  useEffect(() => {
    const ctx = gsap.context(() => {
        // Backdrop fade in
        gsap.fromTo(containerRef.current, 
            { opacity: 0 },
            { opacity: 1, duration: 0.5, ease: "power2.out" }
        );
        // Content Zoom In
        gsap.fromTo(contentRef.current,
            { scale: 0.8, opacity: 0, y: 30 },
            { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "expo.out", delay: 0.1 }
        );
    });

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    return () => {
        ctx.revert();
        document.body.style.overflow = '';
    };
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') handleClose();
        if (e.key === 'ArrowRight') setActiveIndex(prev => (prev + 1) % allVideos.length);
        if (e.key === 'ArrowLeft') setActiveIndex(prev => (prev - 1 + allVideos.length) % allVideos.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [allVideos.length]);

  const handleClose = () => {
      // Animate out
      if (containerRef.current && contentRef.current) {
          gsap.to(contentRef.current, { scale: 0.9, opacity: 0, duration: 0.3, ease: "power2.in" });
          gsap.to(containerRef.current, { opacity: 0, duration: 0.3, delay: 0.1, onComplete: onClose });
      } else {
          onClose();
      }
  };

  return (
    <div 
        ref={containerRef}
        className="fixed inset-0 z-[9999] bg-[#050505]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-10"
        onClick={handleClose}
    >
        <div 
            ref={contentRef} 
            className="relative w-full max-w-6xl flex flex-col pointer-events-auto h-full md:h-auto max-h-screen"
            onClick={(e) => e.stopPropagation()}
        >
            
            {/* Header / Controls */}
            <div className="flex justify-between items-center mb-4 px-1 shrink-0">
                <div className="flex gap-2 group cursor-pointer" onClick={handleClose}>
                    <button className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-110 flex items-center justify-center text-[8px] text-black font-bold opacity-80 hover:opacity-100 transition-opacity"></button>
                    <button className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:brightness-110 opacity-80 cursor-default"></button>
                    <button className="w-3 h-3 rounded-full bg-[#28C840] hover:brightness-110 opacity-80 cursor-default"></button>
                </div>
                <div className="text-[#666] font-mono text-[10px] uppercase tracking-widest">
                    {activeIndex + 1} / {allVideos.length}
                </div>
            </div>

            {/* Video Player Container */}
            <div className="relative w-full aspect-video bg-black border border-[#222] overflow-hidden shadow-2xl rounded-sm group shrink-0">
                
                {allVideos.map((url, idx) => {
                    // PERFORMANCE: Only render active or adjacent videos
                    if (Math.abs(activeIndex - idx) > 1) return null;

                    const isPlaying = playingStates[idx];
                    const isActive = idx === activeIndex;

                    return (
                        <div 
                            key={idx}
                            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isActive ? 'opacity-100 z-20' : 'opacity-0 z-0'}`}
                        >
                            {/* 
                                COVER IMAGE LAYER (PHANTOM SWAP)
                                Only for the main video (idx 0) since we have the image.
                                For others, we assume standard loading behavior or we could map gallery images if we had them.
                            */}
                            {idx === 0 && project.imageUrl && (
                                <img 
                                    src={project.imageUrl} 
                                    alt="Cover"
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none z-30 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
                                />
                            )}

                            <video 
                                src={url} 
                                controls={isActive} 
                                className="w-full h-full object-contain"
                                autoPlay={isActive}
                                playsInline
                                onTimeUpdate={(e) => handleVideoTimeUpdate(idx, e.currentTarget.currentTime)}
                                ref={(el) => {
                                    if(el) {
                                        if (isActive) {
                                            const p = el.play();
                                            if(p !== undefined) p.catch(() => {});
                                        } else {
                                            el.pause();
                                            el.currentTime = 0;
                                        }
                                    }
                                }}
                            />
                        </div>
                    );
                })}

                {/* Filmstrip Overlay */}
                {allVideos.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-50 bg-black/50 p-3 rounded-full backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        {allVideos.map((_, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === activeIndex ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/80'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Metadata */}
            <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-end shrink-0">
                <div>
                    <h1 className="text-2xl md:text-5xl font-['Unbounded'] font-bold uppercase text-[#f4f4f2] leading-none tracking-tight">
                        {project.title}
                    </h1>
                    <div className="text-[#666] font-['Space_Mono'] text-[10px] uppercase mt-2 border border-[#333] inline-block px-2 py-1 rounded">
                        {project.category}
                    </div>
                </div>

                <div className="text-right font-['Space_Mono'] text-[10px] md:text-xs uppercase text-[#888] mt-4 md:mt-0 flex flex-col gap-1 border-l border-[#333] pl-4">
                    {project.director && (
                        <div className="flex gap-4 justify-between md:justify-end">
                            <span className="opacity-40">DIR:</span>
                            <span className="text-[#f4f4f2] font-bold">{project.director}</span>
                        </div>
                    )}
                    {project.role && (
                        <div className="flex gap-4 justify-between md:justify-end">
                            <span className="opacity-40">ROLE:</span>
                            <span className="text-[#f4f4f2] font-bold">{project.role}</span>
                        </div>
                    )}
                </div>
            </div>

        </div>
    </div>
  );
};