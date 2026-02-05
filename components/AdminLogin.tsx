import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hardcoded credentials as requested
    if (username === 'Koptsevadmin' && password === '1337') {
      onLogin();
    } else {
      setError('ACCESS DENIED // INVALID CREDENTIALS');
      // Shake effect or clear password could go here
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] text-[#f4f4f2] p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl md:text-5xl font-['Oswald'] font-bold uppercase mb-12 tracking-tighter mix-blend-difference">
          System<br/>Override
        </h1>

        <form onSubmit={handleLogin} className="space-y-8 font-['Space_Mono']">
          <div className="relative group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="IDENTITY"
              className="w-full bg-transparent border-b border-[#333] py-4 text-xl outline-none focus:border-[#f4f4f2] transition-colors uppercase placeholder:text-[#333]"
            />
          </div>

          <div className="relative group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="KEY"
              className="w-full bg-transparent border-b border-[#333] py-4 text-xl outline-none focus:border-[#f4f4f2] transition-colors uppercase placeholder:text-[#333]"
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs uppercase tracking-widest animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#f4f4f2] text-[#050505] py-4 font-bold uppercase tracking-widest hover:bg-[#333] hover:text-[#f4f4f2] transition-all duration-300 mt-8"
          >
            Authenticate
          </button>
        </form>
        
        <div className="mt-12 text-[#333] text-[10px] uppercase tracking-[0.2em]">
          Restricted Area /// Authorized Personnel Only
        </div>
      </div>
    </div>
  );
};