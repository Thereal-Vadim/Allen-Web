import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ServiceTier {
  id: string;
  title: string;
  category: string;
  description: string;
  deliverables: string[];
  priceRange: string;
  isPopular?: boolean;
}

const SERVICES: ServiceTier[] = [
  {
    id: '01',
    title: 'Music Video',
    category: 'PRODUCTION',
    description: 'Full-scale creative direction and production for artists who need to make a statement. From concept to final master.',
    deliverables: ['Creative Direction', '4K Cinema Camera', 'Professional Lighting', 'Edit & Color Grade', 'VFX Integration'],
    priceRange: '€2,500 — €8,000+',
    isPopular: true
  },
  {
    id: '02',
    title: 'Brand Campaign',
    category: 'COMMERCIAL',
    description: 'High-impact visual storytelling for fashion, automotive, and tech brands. Designed for social retention and TVC.',
    deliverables: ['Storyboarding', 'Studio or Location', 'Sound Design', 'Social Cutdowns (9:16)', 'Licensing Rights'],
    priceRange: '€4,000 — €15,000+',
  },
  {
    id: '03',
    title: 'Post-Production',
    category: 'REMOTE',
    description: 'Technical enhancement for existing footage. I take your raw dailies and turn them into a polished film.',
    deliverables: ['Advanced Editing', 'Color Grading (Davinci)', 'Motion Graphics', 'Cleanup / VFX', 'DCP Export'],
    priceRange: '€500 / Day',
  },
  {
    id: '04',
    title: 'Event / Recap',
    category: 'LIFESTYLE',
    description: 'Dynamic, fast-paced coverage for nightlife, festivals, and exclusive launch events.',
    deliverables: ['Run & Gun Setup', 'Same-Day Edit Available', 'High Energy Edit', 'Vertical & Horizontal'],
    priceRange: 'Starting at €1,200',
  }
];

export const PricesPage: React.FC<{ onNavigate: (view: any) => void }> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from(".prices-header-char", {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.03,
        ease: "power3.out"
      });

      gsap.from(".prices-intro", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: "power2.out"
      });

      // List Animation
      const items = gsap.utils.toArray('.service-item');
      items.forEach((item: any, i) => {
        gsap.from(item, {
          y: 50,
          opacity: 0,
          duration: 0.6,
          delay: 0.2 + (i * 0.1),
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
          }
        });
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-[#f4f4f2] w-full pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 md:mb-32 border-b border-[#333] pb-10">
            <div>
                <h1 className="text-[10vw] leading-[0.8] font-['Unbounded'] font-bold uppercase tracking-tighter mix-blend-difference overflow-hidden">
                    {"SERVICES".split("").map((char, i) => (
                        <span key={i} className="prices-header-char inline-block">{char}</span>
                    ))}
                </h1>
            </div>
            <div className="prices-intro md:w-1/3 text-right mt-10 md:mt-0">
                <p className="font-['Space_Mono'] text-xs text-[#888] uppercase tracking-widest leading-relaxed">
                    Quality is not negotiable. <br/>
                    Below is a baseline for investment. <br/>
                    Every project is bespoke.
                </p>
            </div>
        </div>

        {/* SERVICES GRID */}
        <div className="flex flex-col gap-px bg-[#333] border border-[#333]">
            {SERVICES.map((service) => (
                <div 
                    key={service.id} 
                    className="service-item bg-[#050505] group relative overflow-hidden interactive"
                >
                    {/* Hover Background Fill */}
                    <div className="absolute inset-0 bg-[#f4f4f2] transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] z-0"></div>

                    <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-10 md:gap-20 transition-colors duration-300 group-hover:text-[#080808]">
                        
                        {/* Column 1: ID & Category */}
                        <div className="flex flex-row md:flex-col justify-between md:justify-start md:w-1/6 border-b md:border-b-0 md:border-r border-[#333] group-hover:border-[#080808]/20 pb-4 md:pb-0">
                            <span className="font-['Space_Mono'] text-xs opacity-50">/{service.id}</span>
                            <span className="font-['Space_Mono'] text-xs font-bold uppercase tracking-widest mt-0 md:mt-10">{service.category}</span>
                        </div>

                        {/* Column 2: Main Info */}
                        <div className="flex-1">
                            <h2 className="text-3xl md:text-5xl font-['Unbounded'] uppercase mb-4 group-hover:translate-x-2 transition-transform duration-300">
                                {service.title}
                            </h2>
                            <p className="font-['Space_Mono'] text-sm md:text-base leading-relaxed opacity-70 max-w-xl">
                                {service.description}
                            </p>
                            
                            {/* Deliverables List */}
                            <ul className="mt-6 flex flex-wrap gap-2">
                                {service.deliverables.map((item, i) => (
                                    <li key={i} className="text-[10px] uppercase border border-[#333] px-2 py-1 rounded-full group-hover:border-[#080808]/40">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Price & Action */}
                        <div className="md:w-1/4 flex flex-col justify-between items-start md:items-end mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-[#333] group-hover:border-[#080808]/20 md:pl-10">
                            <div className="text-right">
                                <span className="block font-['Space_Mono'] text-[10px] opacity-50 mb-1 uppercase text-left md:text-right">Investment</span>
                                <span className="font-['Unbounded'] text-xl md:text-2xl">{service.priceRange}</span>
                            </div>
                            
                            <button 
                                onClick={() => onNavigate('contact')}
                                className="mt-8 md:mt-0 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                            >
                                <span>Book Now</span>
                                <span>→</span>
                            </button>
                        </div>

                    </div>
                </div>
            ))}
        </div>

        {/* FOOTER CTA */}
        <div className="mt-20 md:mt-32 text-center">
            <h3 className="text-xl md:text-2xl font-['Unbounded'] uppercase mb-6">Need something specific?</h3>
            <button 
                onClick={() => onNavigate('contact')}
                className="group relative px-8 py-4 bg-[#f4f4f2] text-[#050505] font-bold uppercase tracking-widest overflow-hidden hover:bg-white transition-colors interactive"
            >
                <span className="relative z-10 group-hover:hidden">Get Custom Quote</span>
                <span className="relative z-10 hidden group-hover:inline">Let's Talk</span>
            </button>
        </div>

      </div>
    </div>
  );
};