import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const works = [
  {
    id: 1,
    title: "Dark Matter",
    director: "Dir: Alex Vargas / 2024",
    role: "Post-Production",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=2000",
    size: "large" // spans more columns
  },
  {
    id: 2,
    title: "Kinetics",
    director: "Commercial / 2023",
    role: "Cinematography",
    image: "https://images.unsplash.com/photo-1492691523567-62791245f6a9?auto=format&fit=crop&q=80&w=1000",
    size: "medium"
  },
  {
    id: 3,
    title: "Void",
    director: "Music Video / 2024",
    role: "Creative Direction",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000",
    size: "medium",
    marginTop: true
  },
  {
    id: 4,
    title: "Neon Genesis",
    director: "Feature / 2025",
    role: "VFX Supervisor",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1000",
    size: "medium"
  }
];

export const WorkSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
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
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 md:px-10 border-t border-[#f4f4f2]/10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-x-5 md:gap-y-32">
        {works.map((work) => (
          <div 
            key={work.id}
            className={`work-item relative group cursor-none ${
              work.size === 'large' ? 'md:col-start-2 md:col-span-10' : 'md:col-span-6'
            } ${work.marginTop ? 'md:mt-32' : ''}`}
          >
            {/* Image Wrapper */}
            <div className="w-full aspect-video bg-[#111] overflow-hidden mb-5">
              <img 
                src={work.image} 
                alt={work.title}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]"
              />
            </div>

            {/* Info */}
            <div className="flex justify-between items-end border-t border-[#f4f4f2]/20 pt-4">
              <h3 className="text-3xl md:text-5xl uppercase font-[400]">{work.title}</h3>
              <div className="text-right font-['Space_Mono'] text-xs md:text-sm opacity-60 uppercase leading-relaxed">
                {work.director}<br/>
                {work.role}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
