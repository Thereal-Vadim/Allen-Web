import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const SOCIAL_LINKS = [
  { name: 'Instagram', url: 'https://instagram.com', handle: '@allen.koptsev', color: '#E1306C' },
  { name: 'Telegram', url: 'https://t.me', handle: 't.me/allenk', color: '#0088cc' },
  { name: 'YouTube', url: 'https://youtube.com', handle: 'Allen Koptsev', color: '#FF0000' },
  { name: 'X / Twitter', url: 'https://x.com', handle: '@allen_visuals', color: '#1DA1F2' },
];

export const ContactPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Title Reveal
      gsap.from(".contact-title-char", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.05,
        ease: "power3.out"
      });

      // 2. Email Reveal
      gsap.from(".contact-email", {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: "power3.out"
      });

      // 3. Socials Stagger
      gsap.from(".social-item", {
        x: -50,
        opacity: 0,
        duration: 0.8,
        delay: 0.8,
        stagger: 0.1,
        ease: "power2.out"
      });

      // 4. Footer info
      gsap.from(".contact-footer", {
        opacity: 0,
        duration: 1,
        delay: 1.5
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("koptsev.cooperation@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-[#f4f4f2] w-full pt-32 pb-20 flex flex-col justify-between">
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-10 w-full flex-1 flex flex-col justify-center">
        
        {/* --- MAIN TITLE --- */}
        <div className="overflow-hidden mb-10">
            <h1 className="text-[12vw] leading-[0.8] font-['Unbounded'] font-bold uppercase tracking-tighter mix-blend-difference">
                {/* Splitting text for animation */}
                {"CONTACT".split("").map((char, i) => (
                    <span key={i} className="contact-title-char inline-block">{char}</span>
                ))}
            </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            
            {/* --- LEFT: EMAIL ACTION --- */}
            <div className="contact-email">
                <p className="font-['Space_Mono'] text-xs md:text-sm text-[#666] uppercase mb-4 tracking-widest">
                    Inquiries & Collaboration
                </p>
                
                <div 
                    onClick={handleCopyEmail}
                    className="group relative cursor-pointer interactive inline-block"
                >
                    <h2 className="text-3xl md:text-5xl font-['Unbounded'] uppercase border-b border-[#333] pb-2 group-hover:text-[#f4f4f2] group-hover:border-[#f4f4f2] transition-colors duration-300">
                        koptsev.cooperation<br/>@gmail.com
                    </h2>
                    
                    {/* Hover Effect / Copied State */}
                    <div className="absolute -top-8 left-0 text-xs font-['Space_Mono'] bg-[#f4f4f2] text-black px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none uppercase font-bold">
                        {copied ? "Copied to Clipboard!" : "Click to Copy"}
                    </div>
                </div>

                <div className="mt-10 font-['Space_Mono'] text-[#444] text-sm max-w-md">
                    Based in Prague, available worldwide. <br/>
                    Response time: 24-48 hours.
                </div>
            </div>

            {/* --- RIGHT: SOCIAL LINKS --- */}
            <div className="flex flex-col justify-end">
                <p className="font-['Space_Mono'] text-xs md:text-sm text-[#666] uppercase mb-6 tracking-widest border-b border-[#333] pb-2">
                    Connect
                </p>
                <ul className="space-y-4">
                    {SOCIAL_LINKS.map((social, i) => (
                        <li key={i} className="social-item">
                            <a 
                                href={social.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between py-4 border-b border-[#333] hover:border-[#f4f4f2] hover:bg-[#111] hover:px-4 transition-all duration-300 interactive cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-xl md:text-2xl font-['Oswald'] uppercase">{social.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-['Space_Mono'] text-xs text-[#666] group-hover:text-[#f4f4f2] transition-colors">{social.handle}</span>
                                    <span className="text-xs transform -rotate-45 group-hover:rotate-0 transition-transform duration-300">→</span>
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

      </div>

      {/* --- FOOTER DECORATION --- */}
      <div className="contact-footer px-4 md:px-10 mt-20 flex justify-between items-end opacity-30">
          <div className="font-['Unbounded'] text-[10vw] leading-none text-[#111] select-none pointer-events-none">
              2025
          </div>
          <div className="text-right font-['Space_Mono'] text-xs hidden md:block">
              ALL RIGHTS RESERVED<br/>
              KOPTSEV PRODUCTION
          </div>
      </div>

    </div>
  );
};