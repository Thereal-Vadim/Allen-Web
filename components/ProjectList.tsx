import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Project } from '../types';

const projects: Project[] = [
  { 
    id: 1, 
    title: "Midnight Tokyo", 
    category: "Commercial", 
    videoUrl: "https://cdn.coverr.co/videos/coverr-walking-in-a-city-at-night-4286/1080p.mp4" 
  },
  { 
    id: 2, 
    title: "Porsche 911 GT", 
    category: "Automotive", 
    videoUrl: "https://cdn.coverr.co/videos/coverr-driving-during-sunset-5426/1080p.mp4" 
  },
  { 
    id: 3, 
    title: "Vogue: Ethereal", 
    category: "Fashion", 
    videoUrl: "https://cdn.coverr.co/videos/coverr-model-posing-in-neon-lights-2847/1080p.mp4" 
  },
  { 
    id: 4, 
    title: "Nike: Run Fast", 
    category: "Sports", 
    videoUrl: "https://cdn.coverr.co/videos/coverr-runners-training-outdoors-4632/1080p.mp4" 
  },
  { 
    id: 5, 
    title: "Atlantic Deep", 
    category: "Documentary", 
    videoUrl: "https://cdn.coverr.co/videos/coverr-walking-near-the-ocean-4367/1080p.mp4" 
  },
];

export const ProjectList: React.FC = () => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    // Logic to move the video preview near the cursor
    const preview = previewRef.current;
    if (!preview) return;

    // Use GSAP quickTo for high performance mouse tracking
    const xTo = gsap.quickTo(preview, "x", { duration: 0.5, ease: "power3" });
    const yTo = gsap.quickTo(preview, "y", { duration: 0.5, ease: "power3" });

    const handleMouseMove = (e: MouseEvent) => {
      // Offset slightly so it doesn't block the text completely
      xTo(e.clientX + 20);
      yTo(e.clientY - 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Animate preview visibility
    const preview = previewRef.current;
    if (!preview) return;

    if (activeProject) {
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
    }
  }, [activeProject]);

  return (
    <section className="relative py-32 px-4 md:px-20 z-20 w-full min-h-screen">
      <div className="mb-20">
        <p className="text-[#EAEAEA] opacity-50 font-['Inter'] uppercase tracking-widest text-xs mb-4">Selected Works</p>
        <div className="w-full h-[1px] bg-[#f4f4f2]/20"></div>
      </div>

      {/* Floating Video Preview */}
      <div 
        ref={previewRef}
        className="fixed top-0 left-0 w-[400px] h-[250px] pointer-events-none z-30 hidden md:block overflow-hidden rounded-sm bg-black"
        style={{ opacity: 0, transform: 'scale(0.8)' }}
      >
        {activeProject && (
          <video 
            key={activeProject.id} // key forces reload on change
            src={activeProject.videoUrl} 
            autoPlay 
            muted 
            loop 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Project List */}
      <ul ref={listRef} className="flex flex-col space-y-4">
        {projects.map((project) => (
          <li 
            key={project.id}
            className="group relative border-b border-[#f4f4f2]/10 hover:border-[#EAEAEA] transition-colors duration-500 py-10 cursor-pointer"
            onMouseEnter={() => setActiveProject(project)}
            onMouseLeave={() => setActiveProject(null)}
          >
            <div className="flex justify-between items-baseline mix-blend-difference group-hover:opacity-100 transition-opacity duration-300 interactive">
              <h2 className={`text-[#EAEAEA] text-4xl md:text-7xl font-['Oswald'] font-bold uppercase transition-all duration-300 ${activeProject && activeProject.id !== project.id ? 'opacity-30 blur-[2px]' : 'opacity-100'}`}>
                {project.title}
              </h2>
              <span className={`text-[#EAEAEA] font-['Inter'] uppercase tracking-widest text-sm transition-all duration-300 ${activeProject && activeProject.id !== project.id ? 'opacity-30' : 'opacity-100'}`}>
                {project.category}
              </span>
            </div>
          </li>
        ))}
      </ul>
      
      <div className="mt-32 w-full h-[1px] bg-[#f4f4f2]/20"></div>
    </section>
  );
};