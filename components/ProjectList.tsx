import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
// @ts-ignore
import { ref as dbRef, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Project } from '../types';
import { ProjectGallery } from './ProjectGallery';

// --- FALLBACK LIST (Used when DB is empty) ---
const FALLBACK_LIST: Project[] = [
    { id: 'list-1', title: "NIGHT DRIVE", category: "AUTOMOTIVE", videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4", director: "Dir: Self", role: "Edit" },
    { id: 'list-2', title: "CYBERPUNK CITY", category: "VFX / 3D", videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-glitch-effect-2968-large.mp4", director: "Dir: Unknown", role: "VFX" },
    { id: 'list-3', title: "DEEP OCEAN", category: "DOCUMENTARY", videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-346-large.mp4", director: "NatGeo", role: "Color" },
    { id: 'list-4', title: "URBAN RHYTHM", category: "LIFESTYLE", videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-urban-traffic-at-night-2020-large.mp4", director: "Adidas", role: "DOP" },
    { id: 'list-5', title: "ABSTRACT MIND", category: "EXPERIMENTAL", videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-abstract-video-of-ink-in-water-2368-large.mp4", director: "Self", role: "All" },
];

export const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  
  // Track if the video inside the hover preview has started playing
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // --- FETCH FROM FIREBASE ---
  useEffect(() => {
    const projectsRef = dbRef(db, 'projects');
    const unsubscribe = onValue(projectsRef, (snapshot: any) => {
        const data = snapshot.val();
        if (data) {
            const allProjects: Project[] = Object.entries(data).map(([key, value]: [string, any]) => ({
                id: key,
                ...value
            }));
            const visibleProjects = allProjects.filter(p => p.showInWork !== false);
            setProjects(visibleProjects);
        } else {
            setProjects(FALLBACK_LIST);
        }
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- MOUSE FOLLOW LOGIC ---
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    const xTo = gsap.quickTo(preview, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(preview, "y", { duration: 0.5, ease: "power3" });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX + 20);
      yTo(e.clientY - 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // --- PREVIEW ANIMATION ---
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    if (activeProject) {
      // Reset playing state when switching projects
      setIsPreviewPlaying(false);
      
      gsap.to(preview, { 
        scale: 1, 
        opacity: 1, 
        duration: 0.4, 
        ease: "power2.out" 
      });
    } else {
      gsap.to(preview, { 
        scale: 0.8, 
        opacity: 0, 
        duration: 0.3, 
        ease: "power2.in" 
      });
      setIsPreviewPlaying(false);
    }
  }, [activeProject]);

  return (
    <section className="relative py-32 px-4 md:px-20 z-20 w-full min-h-screen">
      
      {/* FULLSCREEN GALLERY */}
      {viewingProject && (
          <ProjectGallery project={viewingProject} onClose={() => setViewingProject(null)} />
      )}

      <div className="mb-20">
        <p className="text-[#EAEAEA] opacity-50 font-['Inter'] uppercase tracking-widest text-xs mb-4">Selected Works</p>
        <div className="w-full h-[1px] bg-[#f4f4f2]/20"></div>
      </div>

      {/* Floating Video Preview */}
      <div 
        ref={previewRef}
        className="fixed top-0 left-0 w-[400px] h-[250px] pointer-events-none z-30 hidden md:block overflow-hidden rounded-sm bg-[#111] shadow-2xl border border-[#333]"
        style={{ opacity: 0, transform: 'scale(0.8)' }}
      >
        {activeProject && (
          <div className="relative w-full h-full">
            {/* 1. COVER IMAGE (Always Visible Initially) */}
            {activeProject.imageUrl && (
              <img 
                src={activeProject.imageUrl} 
                alt="preview"
                className="absolute inset-0 w-full h-full object-cover z-10"
              />
            )}

            {/* 2. VIDEO (Fades in on top) */}
            <video 
              key={activeProject.id}
              src={activeProject.videoUrl} 
              autoPlay 
              muted 
              loop 
              playsInline
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-20 ${isPreviewPlaying ? 'opacity-100' : 'opacity-0'}`}
              onTimeUpdate={(e) => {
                  if (e.currentTarget.currentTime > 0.1 && !isPreviewPlaying) {
                      setIsPreviewPlaying(true);
                  }
              }}
            />
          </div>
        )}
      </div>

      {/* Project List */}
      <ul ref={listRef} className="flex flex-col space-y-4">
        {loading ? (
             <li className="py-10 text-center font-['Space_Mono'] uppercase animate-pulse text-[#666]">
                 Loading Projects from Database...
             </li>
        ) : projects.length === 0 ? (
            <li className="py-10 text-center font-['Space_Mono'] uppercase text-[#666]">
                 No projects found.
            </li>
        ) : (
            projects.map((project) => (
            <li 
                key={project.id}
                className="group relative border-b border-[#f4f4f2]/10 hover:border-[#EAEAEA] transition-colors duration-500 py-10 cursor-pointer interactive"
                onMouseEnter={() => setActiveProject(project)}
                onMouseLeave={() => setActiveProject(null)}
                onClick={() => setViewingProject(project)}
            >
                <div className="flex justify-between items-baseline mix-blend-difference group-hover:opacity-100 transition-opacity duration-300">
                <h2 className={`text-[#EAEAEA] text-4xl md:text-7xl font-['Oswald'] font-bold uppercase transition-all duration-300 ${activeProject && activeProject.id !== project.id ? 'opacity-30 blur-[2px]' : 'opacity-100 group-hover:translate-x-4'}`}>
                    {project.title}
                </h2>
                <div className="flex gap-4 items-center">
                    {(project.galleryUrls?.length || 0) > 0 && (
                        <span className="hidden md:inline-block text-[10px] bg-[#222] px-2 py-1 rounded text-[#888] font-mono uppercase">Multi-Cam</span>
                    )}
                    <span className={`text-[#EAEAEA] font-['Inter'] uppercase tracking-widest text-sm transition-all duration-300 ${activeProject && activeProject.id !== project.id ? 'opacity-30' : 'opacity-100'}`}>
                        {project.category}
                    </span>
                </div>
                </div>
            </li>
            ))
        )}
      </ul>
      
      <div className="mt-32 w-full h-[1px] bg-[#f4f4f2]/20"></div>
    </section>
  );
};