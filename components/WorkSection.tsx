import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// @ts-ignore
import { ref as dbRef, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Project } from '../types';
import { ProjectGallery } from './ProjectGallery';

gsap.registerPlugin(ScrollTrigger);

// --- FALLBACK DATA ---
const FALLBACK_WORKS: Project[] = [
  { 
    id: 'demo-1', 
    title: 'Dark Matter', 
    category: 'SCI-FI', 
    director: 'Dir: Alex Vargas / 2024', 
    role: 'Post-Production', 
    imageUrl: '', 
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-346-large.mp4', 
    size: 'large', 
    isFeatured: true 
  },
  { 
    id: 'demo-2', 
    title: 'Kinetics', 
    category: 'AUTOMOTIVE', 
    director: 'Commercial / 2023', 
    role: 'Cinematography', 
    imageUrl: '', 
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4', 
    size: 'medium', 
    isFeatured: true 
  },
  { 
    id: 'demo-3', 
    title: 'Void', 
    category: 'MUSIC', 
    director: 'Music Video / 2024', 
    role: 'Creative Direction', 
    imageUrl: '', 
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-video-of-ink-in-water-2368-large.mp4', 
    size: 'medium', 
    isFeatured: true 
  },
  { 
    id: 'demo-4', 
    title: 'Neon Genesis', 
    category: 'NARRATIVE', 
    director: 'Feature / 2025', 
    role: 'VFX Supervisor', 
    imageUrl: '', 
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-glitch-effect-2968-large.mp4', 
    size: 'medium', 
    isFeatured: true 
  }
];

// --- OPTIMIZED VIDEO COMPONENT (B&W PREVIEW) ---
const VideoPreviewItem: React.FC<{ project: Project }> = ({ project }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isPlayingFrames, setIsPlayingFrames] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  // 1. Intersection Observer: Only allow loading if nearby
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
            setShouldLoad(true);
        }
      },
      { rootMargin: '200px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Hover Logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHovered) {
      // Ensure video is ready to play
      if (video.readyState === 0) {
          video.load(); 
      }
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
            console.debug("Video play prevent:", e);
        });
      }
    } else {
      video.pause();
      // Only reset frame check if we have an image cover to show again.
      // If we are just showing the video (which paused), we keep isPlayingFrames true so it doesn't flicker?
      // Actually, if we pause, we just revert to grayscale. 
      // isPlayingFrames is mainly for the imageUrl overlay fade.
      setIsPlayingFrames(false); 
    }
  }, [isHovered]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-[#111] overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* 
        VIDEO LAYER 
        - Default: Grayscale, Scale 100%
        - Hover: Color, Scale 105%
        - We append #t=0.1 to src to force the first frame to render even if not playing.
      */}
      {project.videoUrl && (
        <video 
          ref={videoRef}
          src={`${project.videoUrl}#t=0.1`}
          muted 
          loop 
          playsInline 
          preload={shouldLoad ? "auto" : "none"} // Auto preload ensures the frame is visible
          onTimeUpdate={() => {
              // Mark as playing once it moves
              if (videoRef.current && videoRef.current.currentTime > 0.1) {
                  setIsPlayingFrames(true);
              }
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${isHovered ? 'grayscale-0 scale-105' : 'grayscale scale-100'}`} 
        />
      )}

      {/* 
        OPTIONAL POSTER IMAGE
        - Only renders if imageUrl is present.
        - Also Grayscale by default.
        - Fades out ONLY when video starts moving (isPlayingFrames) to prevent black flash.
      */}
      {project.imageUrl && (
        <div 
          className={`absolute inset-0 w-full h-full transition-opacity duration-500 z-10 bg-[#111] pointer-events-none ${isPlayingFrames && isHovered ? 'opacity-0' : 'opacity-100'}`}
        >
            <img 
              src={project.imageUrl} 
              alt={project.title}
              className="w-full h-full object-cover grayscale"
            />
        </div>
      )}

    </div>
  );
};

export const WorkSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [works, setWorks] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    // Connect to Firebase
    const projectsRef = dbRef(db, 'projects');
    const unsubscribe = onValue(projectsRef, (snapshot: any) => {
        const data = snapshot.val();
        if (data) {
            const allProjects: Project[] = Object.entries(data).map(([key, value]: [string, any]) => ({
                id: key,
                ...value
            }));
            const featuredProjects = allProjects.filter(p => p.isFeatured);
            setWorks(featuredProjects);
        } else {
            setWorks(FALLBACK_WORKS);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // GSAP Animation
  useEffect(() => {
    if (works.length === 0) return;

    const ctx = gsap.context(() => {
        const items = sectionRef.current?.querySelectorAll('.work-item');
        items?.forEach((item) => {
          gsap.fromTo(item, 
            { y: 100, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: item,
                start: "top 85%",
              }
            }
          );
        });
    }, sectionRef);

    return () => ctx.revert();
  }, [works]);

  if (loading) return null; 
  if (works.length === 0) return null; 

  return (
    <section ref={sectionRef} className="py-24 px-4 md:px-10 border-t border-[#f4f4f2]/10">
      
      {selectedProject && (
          <ProjectGallery project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-x-5 md:gap-y-32">
        {works.map((work, index) => (
          <div 
            key={work.id}
            onClick={() => setSelectedProject(work)}
            className={`work-item relative group cursor-none interactive ${
              work.size === 'large' ? 'md:col-start-2 md:col-span-10' : 'md:col-span-6'
            } ${index % 2 !== 0 && work.size !== 'large' ? 'md:mt-32' : ''}`}
          >
            {/* Video/Image Container */}
            <div className="w-full aspect-video mb-5 relative bg-[#111]">
               <VideoPreviewItem project={work} />
               
               {/* View Indicator Overlay */}
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                   <div className="bg-[#f4f4f2] text-black px-4 py-2 font-['Space_Mono'] uppercase text-xs font-bold tracking-widest rounded-full scale-90 group-hover:scale-100 transition-transform">
                       View Project
                   </div>
               </div>
            </div>

            {/* Info */}
            <div className="flex justify-between items-end border-t border-[#f4f4f2]/20 pt-4 group-hover:border-[#f4f4f2] transition-colors duration-500">
              <h3 className="text-3xl md:text-5xl uppercase font-[400] transition-transform duration-500 group-hover:translate-x-2">{work.title}</h3>
              <div className="text-right font-['Space_Mono'] text-xs md:text-sm opacity-60 uppercase leading-relaxed group-hover:opacity-100 transition-opacity">
                {work.director || 'N/A'}<br/>
                {work.role || 'N/A'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};