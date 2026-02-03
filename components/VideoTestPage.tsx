import React, { useEffect, useRef, useState } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export const VideoTestPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [firebaseFileName, setFirebaseFileName] = useState("hero-video.mp4");

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const LOCAL_VIDEO = "/assets/hero-video.mp4";
  const FALLBACK_LINK = "https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-346-large.mp4";

  // --- HANDLERS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const objectUrl = URL.createObjectURL(file);
        addLog(`📂 LOADED LOCAL FILE: ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`);
        if (videoRef.current) {
            videoRef.current.src = objectUrl;
            videoRef.current.load();
            videoRef.current.play().catch(e => addLog(`❌ Play Error: ${e.message}`));
        }
    }
  };

  const loadLocalPath = () => {
      addLog(`🏠 Attempting Local Path: ${LOCAL_VIDEO}`);
      if (videoRef.current) {
          videoRef.current.src = LOCAL_VIDEO;
          videoRef.current.load();
          videoRef.current.play().catch(e => addLog(`❌ Play Error: ${e.message}`));
      }
  };

  const loadFallback = () => {
      addLog(`🛡️ Loading Safe Fallback: ${FALLBACK_LINK}`);
      if (videoRef.current) {
          videoRef.current.src = FALLBACK_LINK;
          videoRef.current.load();
          videoRef.current.play().catch(e => addLog(`❌ Play Error: ${e.message}`));
      }
  };

  const loadFromFirebase = async () => {
      addLog(`🔥 Connecting to Firebase Storage...`);
      addLog(`🔍 Looking for file: '${firebaseFileName}'`);
      
      try {
          const storageRef = ref(storage, firebaseFileName);
          const url = await getDownloadURL(storageRef);
          addLog(`✅ SUCCESS: Firebase URL retrieved!`);
          addLog(`🔗 URL: ${url.substring(0, 50)}...`);
          
          if (videoRef.current) {
              videoRef.current.src = url;
              videoRef.current.load();
              videoRef.current.play().catch(e => addLog(`❌ Play Error: ${e.message}`));
          }
      } catch (error: any) {
          addLog(`❌ FIREBASE ERROR: ${error.code || 'Unknown'}`);
          addLog(`❓ Tip: Check 'firebase.ts' config or Bucket CORS rules.`);
          console.error(error);
      }
  };

  // Video Event Listeners
  useEffect(() => {
    const v = videoRef.current;
    if(!v) return;

    const onPlay = () => addLog("▶️ PLAYER STATE: PLAYING");
    
    const onError = (e: Event) => {
        const error = (e.target as HTMLVideoElement).error;
        if(error) {
             addLog(`❌ PLAYER ERROR: Code ${error.code} - ${error.message}`);
        } else {
             addLog(`❌ PLAYER ERROR: Unknown error`);
        }
    };
    
    v.addEventListener('playing', onPlay);
    v.addEventListener('error', onError);
    return () => {
        v.removeEventListener('playing', onPlay);
        v.removeEventListener('error', onError);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#050505] flex flex-col items-center pt-32 pb-20 text-white z-[60] relative font-mono">
      <h1 className="text-2xl mb-8 font-bold uppercase font-['Unbounded'] text-yellow-500 tracking-wider text-center">
        Video Diagnostic Lab v9.2 (Firebase)
      </h1>
      
      {/* TOOLBAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-6xl px-4 mb-8">
        
        {/* TEST: FIREBASE */}
        <div className="border border-orange-500/50 p-4 rounded bg-[#1a0a00]">
            <h3 className="font-bold text-xs mb-2 text-orange-500">METHOD 1: FIREBASE STORAGE</h3>
            <div className="flex gap-2 mb-2">
                <input 
                    type="text" 
                    value={firebaseFileName}
                    onChange={(e) => setFirebaseFileName(e.target.value)}
                    className="w-full bg-black border border-orange-500/30 text-[10px] px-2 py-1 text-orange-200 outline-none"
                    placeholder="filename.mp4"
                />
            </div>
            <button 
                onClick={loadFromFirebase}
                className="w-full py-2 text-xs font-bold bg-orange-900/30 border border-orange-500 text-orange-400 hover:bg-orange-600 hover:text-white transition-all"
            >
                FETCH FROM CLOUD
            </button>
        </div>

        {/* TEST: LOCAL */}
        <div className="border border-white/20 p-4 rounded bg-[#111]">
            <h3 className="font-bold text-xs mb-2 text-purple-400">METHOD 2: PROJECT FILE</h3>
            <button 
                onClick={loadLocalPath}
                className="w-full py-2 text-xs font-bold border border-purple-500 text-purple-400 hover:bg-purple-900 transition-all"
            >
                LOAD {LOCAL_VIDEO}
            </button>
            <p className="text-[10px] text-gray-500 mt-2">Requires file in /public/assets folder</p>
        </div>

        {/* TEST: FALLBACK */}
        <div className="border-2 border-green-500 p-4 rounded bg-[#0a1a0a]">
            <h3 className="font-bold text-xs mb-2 text-green-500">METHOD 3: CDN FALLBACK</h3>
            <button 
                onClick={loadFallback}
                className="w-full py-2 text-xs font-bold border border-green-500 text-green-500 hover:bg-green-900 transition-all"
            >
                LOAD EXTERNAL CDN
            </button>
        </div>

        {/* TEST: BROWSE */}
        <div className="border border-white/20 p-4 rounded bg-[#111]">
            <h3 className="font-bold text-xs mb-2 text-blue-500">METHOD 4: BROWSE FILE</h3>
            <label className="cursor-pointer w-full py-2 text-xs font-bold border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black transition-all flex justify-center items-center">
                <span>📂 BROWSE FILE</span>
                <input type="file" onChange={handleFileUpload} accept="video/*" className="hidden" />
            </label>
        </div>

      </div>

      <div className="flex flex-col md:flex-row w-full max-w-6xl px-4 gap-6 items-start h-[500px]">
        
        {/* PLAYER */}
        <div className="w-full md:w-1/2 flex flex-col gap-2 h-full">
            <div className="bg-black border border-white/10 w-full h-full relative flex items-center justify-center overflow-hidden rounded-lg shadow-2xl">
                <video 
                    ref={videoRef}
                    controls
                    playsInline
                    loop
                    className="w-full h-full object-contain"
                />
            </div>
        </div>

        {/* CONSOLE */}
        <div className="w-full md:w-1/2 bg-[#0a0a0a] border border-white/10 h-full flex flex-col rounded-lg overflow-hidden">
            <div className="bg-[#111] px-4 py-2 border-b border-white/10 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">SYSTEM LOGS</span>
                <button onClick={() => setLogs([])} className="text-[10px] text-gray-500 hover:text-white uppercase">Clear</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 custom-scrollbar">
                {logs.length === 0 && <span className="text-gray-700 italic">Ready to run diagnostics...</span>}
                {logs.map((log, i) => (
                    <div key={i} className={`${
                        log.includes("SUCCESS") || log.includes("PLAYING") ? "text-green-400 font-bold" :
                        log.includes("FAILURE") || log.includes("Error") || log.includes("CRITICAL") ? "text-red-400 font-bold" :
                        log.includes("FIREBASE") ? "text-orange-400 font-bold" :
                        log.includes("EXPLANATION") ? "text-yellow-400" :
                        "text-gray-400"
                    }`}>
                        {log}
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};