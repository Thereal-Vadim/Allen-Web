import React from 'react';
import { NavView } from '../types';

interface HeaderProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate }) => {
  // Determine text color based on view (About page is Light theme, others are Dark)
  const isLightPage = currentView === 'about';
  const textColorClass = isLightPage ? 'text-[#080808] mix-blend-normal' : 'text-[#f4f4f2] mix-blend-difference';

  return (
    <header className={`fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-start z-[1000] pointer-events-none ${textColorClass} transition-colors duration-500`}>
      <div 
        onClick={() => onNavigate('home')}
        className="text-3xl md:text-4xl font-[900] tracking-tighter leading-[0.85] uppercase cursor-pointer interactive hover:opacity-70 transition-opacity pointer-events-auto"
      >
        Allen<br/>Koptsev
      </div>
      <nav className="font-['Space_Mono'] text-sm uppercase flex flex-col items-end gap-2 interactive pointer-events-auto">
        
        {/* WORK LINK */}
        <button 
          onClick={() => onNavigate('work')} 
          className={`group block overflow-hidden h-5 relative text-right ${currentView === 'work' ? 'font-bold' : 'opacity-70 hover:opacity-100'}`}
        >
          <span className="block transition-transform duration-500 group-hover:-translate-y-full">
            Work / Work
          </span>
          <span className="block absolute top-0 right-0 translate-y-full transition-transform duration-500 group-hover:translate-y-0">
            Work / Work
          </span>
        </button>

        {/* PRICES LINK */}
        <button 
          onClick={() => onNavigate('prices')} 
          className={`group block overflow-hidden h-5 relative text-right ${currentView === 'prices' ? 'font-bold' : 'opacity-70 hover:opacity-100'}`}
        >
          <span className="block transition-transform duration-500 group-hover:-translate-y-full">
            Services / Prices
          </span>
          <span className="block absolute top-0 right-0 translate-y-full transition-transform duration-500 group-hover:translate-y-0">
            Services / Prices
          </span>
        </button>

        {/* ABOUT LINK */}
        <button 
          onClick={() => onNavigate('about')} 
          className={`group block overflow-hidden h-5 relative text-right ${currentView === 'about' ? 'font-bold' : 'opacity-70 hover:opacity-100'}`}
        >
          <span className="block transition-transform duration-500 group-hover:-translate-y-full">
            About / About
          </span>
          <span className="block absolute top-0 right-0 translate-y-full transition-transform duration-500 group-hover:translate-y-0">
            About / About
          </span>
        </button>

        {/* CONTACT LINK */}
        <button 
           onClick={() => onNavigate('contact')}
           className={`group block overflow-hidden h-5 relative text-right ${currentView === 'contact' ? 'font-bold' : 'opacity-70 hover:opacity-100'}`}
        >
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