import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
// @ts-ignore
import { ref as dbRef, onValue } from 'firebase/database';
import { db } from '../firebase';
import { AboutPageData, SoftwareItem, GearGroup } from '../types';

gsap.registerPlugin(ScrollTrigger);

// Default Fallback Data (used while loading or if DB is empty)
const DEFAULT_DATA: AboutPageData = {
  bio: "I am a visual architect based in Prague. My work exists at the intersection of technical precision and raw emotion. I don't just capture moments; I construct visual narratives that demand attention.",
  profileImageUrl: "", 
  philosophy: "\"Technology is just the tool. The vision is the weapon. I build worlds frame by frame.\"",
  software: [
    { name: "Premiere Pro", cat: "Editing", level: "Expert" },
    { name: "After Effects", cat: "VFX / Motion", level: "Expert" },
    { name: "DaVinci Resolve", cat: "Color", level: "Advanced" },
    { name: "Blender 3D", cat: "3D", level: "Intermediate" },
  ],
  gear: [
    { category: "CAMERA", items: ["Sony FX6 Cinema Line", "Sony A7S III"] },
    { category: "LENSES", items: ["Sigma Art 24-70mm f/2.8", "Sony GM 35mm f/1.4"] },
  ]
};

export const AboutPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<AboutPageData | null>(null);

  // 1. Fetch Data
  useEffect(() => {
    const aboutRef = dbRef(db, 'aboutPage');
    const unsubscribe = onValue(aboutRef, (snapshot: any) => {
      const val = snapshot.val();
      if (val) {
        // Ensure arrays exist even if empty in DB
        setData({
          ...val,
          software: val.software || [],
          gear: val.gear || []
        });
      } else {
        setData(DEFAULT_DATA);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Animations (Trigger only when data is loaded)
  useEffect(() => {
    if (!data) return;

    const ctx = gsap.context(() => {
      // Hero Reveal
      gsap.from(".about-hero-text", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out"
      });

      gsap.from(".about-image", {
        scale: 0.9,
        opacity: 0,
        duration: 1.2,
        delay: 0.3,
        ease: "expo.out"
      });

      // Sections Reveal
      const sections = gsap.utils.toArray('.about-section');
      sections.forEach((section: any) => {
        gsap.from(section, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
          }
        });
      });

      // Gear Items Stagger
      gsap.from(".gear-row", {
        x: -20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        scrollTrigger: {
            trigger: "#gear-grid",
            start: "top 80%"
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, [data]);

  if (!data) return <div className="min-h-screen bg-[#EAEAEA] w-full pt-32 text-center text-[#080808] font-mono animate-pulse">LOADING BIO DATA...</div>;

  return (
    <div ref={containerRef} className="min-h-screen bg-[#EAEAEA] text-[#080808] w-full pt-32 pb-20 selection:bg-black selection:text-white">
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-10">
        
        {/* --- HEADER --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-20 md:mb-32 border-b border-[#080808]/20 pb-10">
            <div className="md:col-span-8">
                <h1 className="about-hero-text text-[10vw] md:text-[8vw] leading-[0.85] font-['Unbounded'] font-bold uppercase tracking-tighter mb-8">
                    About<br/><span className="text-transparent stroke-black" style={{ WebkitTextStroke: '1px #080808' }}>Me</span>
                </h1>
                <div className="about-hero-text md:w-2/3">
                    <p className="font-['Space_Mono'] text-sm md:text-base leading-relaxed uppercase whitespace-pre-wrap">
                        {data.bio}
                    </p>
                </div>
            </div>
            <div className="md:col-span-4 about-image h-[400px] md:h-auto relative overflow-hidden bg-[#ccc]">
                {data.profileImageUrl ? (
                   <img src={data.profileImageUrl} alt="Profile" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                ) : (
                  <div className="absolute inset-0 bg-[#080808] flex items-center justify-center text-[#EAEAEA]">
                      <span className="font-['Space_Mono'] text-xs">NO IMAGE UPLOADED</span>
                  </div>
                )}
                {/* Abstract overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            </div>
        </div>

        {/* --- STATS / SOFTWARE (BENTO GRID) --- */}
        <div className="about-section mb-20 md:mb-32">
            <h2 className="text-4xl font-['Oswald'] uppercase mb-8 flex items-center gap-4">
                <span className="w-2 h-2 bg-black rounded-full"></span>
                Digital Arsenal
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {(data.software || []).map((sw, i) => (
                    <div 
                        key={i} 
                        className="bg-white border border-[#080808]/10 p-4 aspect-square flex flex-col justify-between hover:border-[#080808] transition-colors duration-300 group interactive"
                    >
                        <div className="text-xs font-['Space_Mono'] opacity-50">{sw.cat}</div>
                        <div>
                            <div className="font-bold text-lg md:text-xl uppercase leading-none mb-1 group-hover:translate-x-1 transition-transform">{sw.name}</div>
                            <div className="text-[10px] uppercase tracking-widest bg-[#080808] text-white inline-block px-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{sw.level}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- GEAR (TECHNICAL SPEC LIST) --- */}
        <div id="gear-grid" className="about-section">
             <div className="flex justify-between items-end mb-8 border-b border-[#080808] pb-2">
                <h2 className="text-4xl font-['Oswald'] uppercase flex items-center gap-4">
                    <span className="w-2 h-2 bg-black rounded-full"></span>
                    Hardware Inventory
                </h2>
                <span className="font-['Space_Mono'] text-xs hidden md:block">UPDATED: 2025</span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
                {(data.gear || []).map((group, i) => (
                    <div key={i} className="gear-group">
                        <h3 className="font-['Space_Mono'] text-xs bg-[#080808] text-white inline-block px-2 py-1 mb-4 uppercase tracking-widest">
                            {group.category}
                        </h3>
                        <ul className="space-y-3">
                            {(group.items || []).map((item, j) => (
                                <li key={j} className="gear-row flex items-baseline justify-between border-b border-[#080808]/10 pb-1 group hover:border-[#080808] transition-colors cursor-default">
                                    <span className="font-['Unbounded'] text-sm md:text-base uppercase group-hover:pl-2 transition-all">{item}</span>
                                    <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">0{j+1}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
             </div>
        </div>

        {/* --- BOTTOM MANIFESTO --- */}
        <div className="about-section mt-32 border-t border-[#080808] pt-10 grid grid-cols-1 md:grid-cols-2">
            <div className="font-['Space_Mono'] text-xs uppercase opacity-50">
                Philosophy
            </div>
            <div className="text-2xl md:text-4xl font-['Oswald'] uppercase leading-snug mt-4 md:mt-0 whitespace-pre-wrap">
                {data.philosophy}
            </div>
        </div>

      </div>
    </div>
  );
};