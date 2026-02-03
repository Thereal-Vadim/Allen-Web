import React from 'react';

interface HeaderProps {
  currentView: 'home' | 'work' | 'test';
  onNavigate: (view: 'home' | 'work' | 'test') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-start z-[1000] mix-blend-difference text-[#f4f4f2] pointer-events-none">
      <div 
        onClick={() => onNavigate('home')}
        className="text-3xl md:text-4xl font-[900] tracking-tighter leading-[0.85] uppercase cursor-pointer interactive hover:opacity-70 transition-opacity pointer-events-auto"
      >
        Allen<br/>Koptsev
      </div>
      <nav className="font-['Space_Mono'] text-sm uppercase flex flex-col items-end gap-2 interactive pointer-events-auto">
        <button 
          onClick={() => onNavigate('work')} 
          className={`group block overflow-hidden h-5 relative text-right ${currentView === 'work' ? 'opacity-100 font-bold' : 'opacity-70'}`}
        >
          <span className="block transition-transform duration-500 group-hover:-translate-y-full">
            Work / Work
          </span>
          <span className="block absolute top-0 right-0 translate-y-full transition-transform duration-500 group-hover:translate-y-0">
            Work / Work
          </span>
        </button>

        <button 
          onClick={() => onNavigate('test')} 
          className={`group block overflow-hidden h-5 relative text-right ${currentView === 'test' ? 'opacity-100 font-bold' : 'opacity-70'}`}
        >
          <span className="block transition-transform duration-500 group-hover:-translate-y-full">
            Video Test / Video Test
          </span>
          <span className="block absolute top-0 right-0 translate-y-full transition-transform duration-500 group-hover:translate-y-0">
            Video Test / Video Test
          </span>
        </button>

        <button className="group block overflow-hidden h-5 relative text-right opacity-70 hover:opacity-100">
          <span className="block transition-transform duration-500 group-hover:-translate-y-full">
            About / About
          </span>
          <span className="block absolute top-0 right-0 translate-y-full transition-transform duration-500 group-hover:translate-y-0">
            About / About
          </span>
        </button>

        <button className="group block overflow-hidden h-5 relative text-right opacity-70 hover:opacity-100">
          <span className="block transition-transform duration-500 group-hover:-translate-y-full">
            Contact / Contact
          </span>
          <span className="block absolute top-0 right-0 translate-y-full transition-transform duration-500 group-hover:translate-y-0">
            Contact / Contact
          </span>
        </button>
      </nav>
    </header>
  );
};