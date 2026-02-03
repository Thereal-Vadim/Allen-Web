import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    // Center setup
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    gsap.set(follower, { xPercent: -50, yPercent: -50 });

    const xToCursor = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3" });
    const yToCursor = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3" });
    
    const xToFollower = gsap.quickTo(follower, "x", { duration: 0.4, ease: "power3" });
    const yToFollower = gsap.quickTo(follower, "y", { duration: 0.4, ease: "power3" });

    const moveCursor = (e: MouseEvent) => {
      xToCursor(e.clientX);
      yToCursor(e.clientY);
      xToFollower(e.clientX);
      yToFollower(e.clientY);
    };

    window.addEventListener('mousemove', moveCursor);

    // Hover Effects
    const handleMouseEnter = () => {
      gsap.to(cursor, { scale: 4, duration: 0.3, ease: "back.out(1.7)" });
      gsap.to(follower, { scale: 1.5, opacity: 0.5, duration: 0.3 });
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, { scale: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(follower, { scale: 1, opacity: 1, duration: 0.3 });
    };

    const interactiveElements = document.querySelectorAll('a, button, .interactive, .work-item');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-3 h-3 bg-[#f4f4f2] rounded-full pointer-events-none z-[10000] mix-blend-difference"
      />
      <div 
        ref={followerRef}
        className="fixed top-0 left-0 w-10 h-10 border border-[#f4f4f2]/30 rounded-full pointer-events-none z-[9999] mix-blend-difference"
      />
    </>
  );
};
