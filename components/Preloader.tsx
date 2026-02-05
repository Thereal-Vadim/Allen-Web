import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const boardWrapperRef = useRef<HTMLDivElement>(null);
  const armRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable scroll
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        onComplete();
      }
    });

    // 1. INTRO: Board floats in from darkness with 3D tilt
    tl.set(containerRef.current, { opacity: 1 });
    tl.fromTo(boardWrapperRef.current, 
      { 
        y: 100, 
        opacity: 0, 
        rotateX: 20, 
        rotateY: -10, 
        scale: 0.9 
      },
      { 
        y: 0, 
        opacity: 1, 
        rotateX: 0, 
        rotateY: 0, 
        scale: 1, 
        duration: 1.2, 
        ease: "power3.out" 
      }
    );

    // 2. LOADING: Animate Text & Progress
    // Typewriter effect for metadata
    textRefs.current.forEach((el, index) => {
        if(!el) return;
        tl.fromTo(el, 
            { opacity: 0, x: -10 }, 
            { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }, 
            `-=${0.2}` // overlap
        );
    });

    // Arm Lift (Anticipation) - SPEED UP: Changed from 6s to 2.5s
    tl.to(armRef.current, { 
        rotation: -35, 
        duration: 2.5, 
        ease: "power1.inOut" 
    }, "<"); // Start with text

    // Count up 0-100 - SPEED UP: Changed from 6s to 2.5s
    const counter = { val: 0 };
    tl.to(counter, {
        val: 100,
        duration: 2.5,
        ease: "power1.inOut", 
        onUpdate: () => setProgress(Math.round(counter.val))
    }, "<");

    // 3. THE CLAP (Action!)
    tl.to(armRef.current, {
        rotation: 0,
        duration: 0.08,
        ease: "power4.in", // Hard impact
    });

    // 4. IMPACT (Flash & Shake)
    tl.add(() => {
        // Flash White
        if (flashRef.current) {
            gsap.fromTo(flashRef.current, 
                { opacity: 1 }, 
                { opacity: 0, duration: 0.3 }
            );
        }
    }, "<"); // Sync with clap end

    tl.to(boardWrapperRef.current, {
        y: 10,
        rotateX: -5,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "bounce.out"
    }, "<");

    // 5. EXIT (Shutter open effect)
    tl.to(boardWrapperRef.current, {
        scale: 1.1,
        opacity: 0,
        duration: 0.4,
        delay: 0.3,
        ease: "power2.in"
    });

    tl.to(containerRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: "expo.inOut"
    }, "-=0.2");

    return () => {
        tl.kill();
        document.body.style.overflow = '';
    };
  }, [onComplete]);

  // Visual Helper for Stripes
  const StripeBar = () => (
      <div className="absolute inset-0 flex">
          {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-1 bg-white" style={{ 
                  transform: 'skewX(-25deg) scaleX(1.5)', 
                  marginRight: i % 2 === 0 ? '0' : '0',
                  background: i % 2 === 0 ? '#f4f4f2' : '#080808'
              }} />
          ))}
      </div>
  );

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-[#050505] flex items-center justify-center perspective-[1000px]"
    >
      {/* FLASH BANG OVERLAY */}
      <div ref={flashRef} className="absolute inset-0 bg-white pointer-events-none opacity-0 z-50 mix-blend-overlay"></div>

      <div 
        ref={boardWrapperRef} 
        className="relative w-[340px] md:w-[480px] select-none"
        style={{ transformStyle: 'preserve-3d' }}
      >
        
        {/* --- CLAPPER ARM --- */}
        <div className="relative h-[60px] md:h-[80px] w-full z-20 origin-bottom-left" style={{ transformOrigin: '2px 100%' }}>
            
            {/* Moving Arm */}
            <div 
                ref={armRef}
                className="absolute bottom-0 left-0 w-full h-full bg-[#080808] border-2 border-[#f4f4f2] overflow-hidden origin-bottom-left shadow-2xl"
                style={{ borderRadius: '4px 4px 0 0' }}
            >
                <StripeBar />
            </div>

            {/* Hinge Bolt (Visual Detail) */}
            <div className="absolute bottom-1 left-2 w-4 h-4 md:w-6 md:h-6 bg-[#cfcfcf] rounded-full z-30 shadow-md border border-[#555] flex items-center justify-center">
                <div className="w-2 h-[2px] bg-[#555] rotate-45"></div>
            </div>
        </div>

        {/* --- MAIN BOARD BODY --- */}
        <div className="relative bg-[#080808] w-full border-x-2 border-b-2 border-[#f4f4f2] text-[#f4f4f2] shadow-2xl" style={{ borderRadius: '0 0 4px 4px' }}>
            
            {/* Top Static Stripes (Matching Arm when closed) */}
            <div className="h-[20px] w-full overflow-hidden border-b-2 border-[#f4f4f2] opacity-20 absolute top-0 left-0 -z-10">
                <StripeBar />
            </div>

            <div className="p-5 md:p-6 flex flex-col gap-4">
                
                {/* HEADERS */}
                <div className="w-full border-2 border-[#f4f4f2] p-2 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[#f4f4f2] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <h2 className="font-['Unbounded'] font-bold text-2xl md:text-4xl tracking-tighter uppercase relative z-10">
                        KOPTSEV <span className="text-stroke text-transparent stroke-white" style={{ WebkitTextStroke: '1px #f4f4f2' }}>STUDIO</span>
                    </h2>
                </div>

                {/* GRID INFO */}
                <div className="grid grid-cols-3 gap-0 border-2 border-[#f4f4f2]">
                    {/* SCENE */}
                    <div className="border-r-2 border-[#f4f4f2] p-2 flex flex-col items-center justify-between min-h-[80px]">
                        <span className="font-['Space_Mono'] text-[10px] md:text-xs opacity-60">SCENE</span>
                        <div className="font-['Unbounded'] text-2xl md:text-4xl font-bold mt-1 tabular-nums">
                            {progress < 10 ? `0${progress}` : progress}
                        </div>
                    </div>
                    {/* TAKE */}
                    <div className="border-r-2 border-[#f4f4f2] p-2 flex flex-col items-center justify-between min-h-[80px]">
                        <span className="font-['Space_Mono'] text-[10px] md:text-xs opacity-60">TAKE</span>
                        <div className="font-['Unbounded'] text-2xl md:text-4xl font-bold mt-1">1</div>
                    </div>
                    {/* ROLL */}
                    <div className="p-2 flex flex-col items-center justify-between min-h-[80px]">
                        <span className="font-['Space_Mono'] text-[10px] md:text-xs opacity-60">ROLL</span>
                        <div className="font-['Unbounded'] text-2xl md:text-4xl font-bold mt-1 tracking-tighter">A001</div>
                    </div>
                </div>

                {/* METADATA FIELDS (Handwritten look) */}
                <div className="flex flex-col gap-1 font-['Space_Mono'] text-xs md:text-sm uppercase pt-1">
                    {/* PROD */}
                    <div className="flex items-end gap-2 border-b border-[#333] pb-1">
                        <span className="opacity-40 w-16">PROD.</span>
                        <span ref={(el) => { textRefs.current[0] = el; }} className="font-bold text-[#f4f4f2] tracking-wider">ALLEN KOPTSEV</span>
                    </div>
                    
                    {/* DIRECTOR */}
                    <div className="flex items-end gap-2 border-b border-[#333] pb-1">
                        <span className="opacity-40 w-16">DESIGN</span>
                        <span ref={(el) => { textRefs.current[1] = el; }} className="font-bold text-[#f4f4f2] tracking-wider">VADIM FILATOV</span>
                    </div>

                    <div className="flex w-full gap-4 pt-1">
                        {/* DATE */}
                        <div className="flex items-end gap-2 border-b border-[#333] pb-1 flex-1">
                            <span className="opacity-40">DATE</span>
                            <span ref={(el) => { textRefs.current[2] = el; }} className="font-bold text-[#f4f4f2] tracking-wider">1.02.2026</span>
                        </div>
                        {/* SOUND */}
                        <div className="flex items-end gap-2 border-b border-[#333] pb-1 flex-1">
                            <span className="opacity-40">SOUND</span>
                            <span className="font-bold text-[#f4f4f2] tracking-wider animate-pulse">SYNC</span>
                        </div>
                    </div>
                </div>
                
                {/* FOOTER */}
                <div className="flex justify-between items-end mt-1">
                    <div className="text-[10px] opacity-30 font-mono">CAM: ARRI ALEXA 35</div>
                    <div className="text-[10px] opacity-30 font-mono">LUT: KODAK 2383</div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};