import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { CustomCursor } from './components/CustomCursor';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { WorkSection } from './components/WorkSection';
import { WorkPage } from './components/WorkPage';
import { VideoTestPage } from './components/VideoTestPage';
import { Preloader } from './components/Preloader';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'work' | 'test'>('home');

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#f4f4f2] selection:bg-[#ff3c00] selection:text-white">
      {/* Noise Texture Overlay - Z-index lowered in CSS, but structure maintained */}
      <div className="noise-overlay" />
      
      {/* Preloader - only show on initial load */}
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      
      {/* Global Components */}
      <CustomCursor />
      <Header currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content Router - Z-index increased to sit above noise */}
      <main className="relative z-10">
        {currentView === 'home' && (
          <>
            <Hero />
            <WorkSection />
            
            {/* Mid-page Impact Text */}
            <section className="h-[50vh] flex items-center justify-center">
                 <h2 className="text-[8vw] text-center leading-tight font-[900] uppercase mix-blend-difference">
                   I Create<br/>Visual Impact
                 </h2>
            </section>

            {/* Footer */}
            <footer className="min-h-[90vh] bg-[#f4f4f2] text-[#080808] flex flex-col justify-between p-4 md:p-10 mt-20 relative overflow-hidden">
              <div className="flex flex-col lg:flex-row w-full h-full lg:gap-20 z-10">
                {/* Left/Top: Title */}
                <div className="flex-1">
                     <div className="text-[13vw] leading-[0.8] font-[900] tracking-tighter uppercase mt-10 md:mt-20">
                        Lets Talk<br/>About It.
                      </div>
                </div>
                
                {/* Right/Bottom: Form */}
                <div className="flex-1 lg:pt-32 lg:pr-20 w-full max-w-2xl mt-10 lg:mt-0">
                     <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
                        <div className="relative border-b border-[#080808]/20 focus-within:border-[#080808] transition-colors duration-500">
                            <input 
                              type="text" 
                              placeholder="NAME" 
                              className="w-full bg-transparent py-4 text-xl md:text-2xl font-['Space_Mono'] uppercase placeholder:text-[#080808]/40 outline-none interactive" 
                            />
                        </div>
                        <div className="relative border-b border-[#080808]/20 focus-within:border-[#080808] transition-colors duration-500">
                            <input 
                              type="email" 
                              placeholder="EMAIL" 
                              className="w-full bg-transparent py-4 text-xl md:text-2xl font-['Space_Mono'] uppercase placeholder:text-[#080808]/40 outline-none interactive" 
                            />
                        </div>
                         <div className="relative border-b border-[#080808]/20 focus-within:border-[#080808] transition-colors duration-500">
                            <textarea 
                              rows={3} 
                              placeholder="TELL ME ABOUT YOUR PROJECT" 
                              className="w-full bg-transparent py-4 text-xl md:text-2xl font-['Space_Mono'] uppercase placeholder:text-[#080808]/40 outline-none resize-none interactive" 
                            />
                        </div>
                        <button 
                          type="submit" 
                          className="group flex items-center gap-4 text-xl md:text-2xl font-bold uppercase tracking-wider hover:opacity-50 transition-opacity interactive pt-4"
                        >
                            <span>Send Message</span>
                            <span className="group-hover:translate-x-4 transition-transform duration-300">→</span>
                        </button>
                     </form>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between font-['Space_Mono'] text-sm uppercase pt-10 border-t border-[#080808]/10 gap-5 mt-20 z-10">
                <div>©2025 Design by Vadim Filatov — Est. 2023</div>
                <div>Prague</div>
                <a href="mailto:koptsev.cooperation@gmail.com" className="hover:underline interactive">koptsev.cooperation@gmail.com</a>
              </div>
            </footer>
          </>
        )}
        
        {currentView === 'work' && <WorkPage />}
        
        {currentView === 'test' && <VideoTestPage />}
      </main>
    </div>
  );
};

export default App;