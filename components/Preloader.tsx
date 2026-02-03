import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Counter animation
    const counter = { val: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        // Exit animation
        gsap.to(containerRef.current, {
          yPercent: -100,
          duration: 1.2,
          ease: "power4.inOut",
          onComplete: onComplete
        });
      }
    });

    tl.to(counter, {
      val: 100,
      duration: 2,
      ease: "power2.inOut",
      onUpdate: () => {
        setCount(Math.round(counter.val));
      }
    });

    // Slight parallax on the text during load
    gsap.fromTo(textRef.current, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, delay: 0.2 }
    );

  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-[#050505] flex items-center justify-center text-[#EAEAEA]"
    >
      <div className="text-center">
        <h1 ref={textRef} className="text-[15vw] font-['Oswald'] font-bold leading-none tracking-tighter">
          {count}%
        </h1>
        <p className="font-['Inter'] text-sm uppercase tracking-[0.5em] mt-4 opacity-50">
          Loading Experience
        </p>
      </div>
    </div>
  );
};
