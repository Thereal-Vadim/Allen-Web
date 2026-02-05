import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

interface VideoMetrics {
  fileName: string;
  fileSizeMB: number;
  resolution: string;
  loadTimeMs: number; // Time to 'loadeddata'
  renderTimeMs: number; // Time to 'canplay'
  duration: number;
  score: 'PERFECT' | 'GOOD' | 'HEAVY' | 'CRITICAL';
}

export const VideoTestPage: React.FC = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<VideoMetrics | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isHeroMode, setIsHeroMode] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const startTimeRef = useRef<number>(0);

  const addLog = (msg: string) => setLogs(prev => [`> ${msg}`, ...prev]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    runTest(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
        runTest(file);
    }
  };

  const runTest = (file: File) => {
      // Reset
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      setMetrics(null);
      setLogs([]);
      setIsTesting(true);
      setIsHeroMode(false);

      const sizeMB = file.size / (1024 * 1024);
      addLog(`Initializing test for: ${file.name}`);
      addLog(`File Size: ${sizeMB.toFixed(2)} MB`);

      // Create Object URL
      const url = URL.createObjectURL(file);
      startTimeRef.current = performance.now();
      setVideoSrc(url);
      
      // Store temp metrics
      setMetrics({
          fileName: file.name,
          fileSizeMB: parseFloat(sizeMB.toFixed(2)),
          resolution: 'Analyzing...',
          loadTimeMs: 0,
          renderTimeMs: 0,
          duration: 0,
          score: 'GOOD' // default
      });
  };

  const handleLoadedData = () => {
     const now = performance.now();
     const loadTime = Math.round(now - startTimeRef.current);
     addLog(`Data Loaded in: ${loadTime}ms`);
     
     if (videoRef.current && metrics) {
         setMetrics(prev => prev ? ({
             ...prev,
             loadTimeMs: loadTime,
             resolution: `${videoRef.current!.videoWidth} x ${videoRef.current!.videoHeight}`,
             duration: videoRef.current!.duration
         }) : null);
     }
  };

  const handleCanPlay = () => {
      const now = performance.now();
      const totalTime = Math.round(now - startTimeRef.current);
      addLog(`Ready to Play (TTFF) in: ${totalTime}ms`);
      setIsTesting(false);

      if (metrics) {
          // Calculate Score
          let score: VideoMetrics['score'] = 'PERFECT';
          const size = metrics.fileSizeMB;
          
          if (size > 30 || totalTime > 200) score = 'CRITICAL';
          else if (size > 15 || totalTime > 100) score = 'HEAVY';
          else if (size > 5) score = 'GOOD';
          
          addLog(`BENCHMARK COMPLETE. SCORE: ${score}`);

          setMetrics(prev => prev ? ({
              ...prev,
              renderTimeMs: totalTime,
              score: score
          }) : null);
      }
  };

  // Color helpers
  const getScoreColor = (score: string) => {
      switch(score) {
          case 'PERFECT': return 'text-[#28C840] border-[#28C840]';
          case 'GOOD': return 'text-[#FEBC2E] border-[#FEBC2E]';
          case 'HEAVY': return 'text-orange-500 border-orange-500';
          case 'CRITICAL': return 'text-[#FF5F57] border-[#FF5F57]';
          default: return 'text-white border-white';
      }
  };

  return (
    <div className={`w-full min-h-screen bg-[#050505] flex flex-col pt-24 pb-20 font-mono transition-colors duration-500 ${isHeroMode ? 'bg-black' : ''}`}>
      
      {/* HEADER */}
      {!isHeroMode && (
          <div className="px-4 md:px-10 mb-10 flex flex-col md:flex-row justify-between items-end border-b border-[#222] pb-6">
            <div>
                <h1 className="text-3xl md:text-5xl font-['Unbounded'] font-bold uppercase text-[#f4f4f2]">Performance Lab</h1>
                <p className="text-[#666] text-xs uppercase mt-2 tracking-widest">Video Benchmark & Optimization Tool</p>
            </div>
            <div className="text-right mt-4 md:mt-0">
                <div className="text-[10px] text-[#444] uppercase mb-1">Target Metrics (Hero)</div>
                <div className="flex gap-4 text-xs font-bold text-[#666]">
                    <span>SIZE: &lt; 15MB</span>
                    <span>TTFF: &lt; 100ms</span>
                    <span>RES: 1080p</span>
                </div>
            </div>
          </div>
      )}

      {/* MAIN LAYOUT */}
      <div className={`flex flex-col lg:flex-row gap-10 px-4 md:px-10 flex-1 ${isHeroMode ? 'fixed inset-0 z-[2000] bg-black p-0 gap-0' : ''}`}>
        
        {/* LEFT: DROP ZONE / PLAYER */}
        <div className={`relative transition-all duration-500 ${isHeroMode ? 'w-full h-full' : 'w-full lg:w-2/3 aspect-video bg-[#111] border border-[#333] rounded-sm overflow-hidden group'}`}>
            
            {/* HERO MODE TOGGLE (Only visible if video loaded and NOT in hero mode already) */}
            {videoSrc && !isHeroMode && (
                <button 
                    onClick={() => setIsHeroMode(true)}
                    className="absolute top-4 right-4 z-30 bg-black/80 backdrop-blur border border-[#333] text-[#f4f4f2] text-[10px] uppercase px-3 py-2 hover:bg-[#f4f4f2] hover:text-black transition-all"
                >
                    Simulate Hero View ↗
                </button>
            )}

            {/* EXIT HERO MODE */}
            {isHeroMode && (
                <div className="absolute top-10 right-10 z-[3000]">
                    <button 
                        onClick={() => setIsHeroMode(false)}
                        className="bg-white text-black font-bold uppercase text-xs px-6 py-3 rounded-full hover:scale-105 transition-transform"
                    >
                        Close Preview
                    </button>
                </div>
            )}

            {/* DROP ZONE (Hidden if Playing) */}
            {!videoSrc && (
                <div 
                    className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-[#333] m-4 hover:border-[#f4f4f2] hover:bg-[#1a1a1a] transition-all cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <input 
                        type="file" 
                        accept="video/*" 
                        onChange={handleFileUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-4xl mb-4 opacity-50">📥</div>
                    <div className="font-['Unbounded'] font-bold text-xl uppercase text-[#f4f4f2]">Drop Video Here</div>
                    <div className="font-mono text-xs text-[#666] mt-2 uppercase">or click to browse</div>
                </div>
            )}

            {/* VIDEO PLAYER */}
            {videoSrc && (
                <>
                    <video
                        ref={videoRef}
                        src={videoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        onLoadedData={handleLoadedData}
                        onCanPlay={handleCanPlay}
                        className={`w-full h-full object-cover ${isTesting ? 'opacity-50 blur-sm' : 'opacity-100'} transition-all duration-300`}
                    />
                    
                    {/* HERO OVERLAY SIMULATION */}
                    {isHeroMode && (
                        <div className="absolute inset-0 pointer-events-none z-10">
                            {/* Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-90" />
                            {/* Text */}
                            <div className="absolute bottom-0 left-0 p-4 md:p-10 w-full">
                                <h1 className="text-[11vw] leading-[0.8] font-[900] uppercase text-[#f4f4f2] mix-blend-difference mb-10">
                                    VIDEO<br/>PRODUCER
                                </h1>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>

        {/* RIGHT: METRICS PANEL (Hidden in Hero Mode) */}
        {!isHeroMode && (
            <div className="w-full lg:w-1/3 flex flex-col gap-6">
                
                {/* 1. SCORECARD */}
                <div className={`bg-[#111] border p-6 flex flex-col items-center justify-center min-h-[200px] transition-colors duration-500 ${metrics ? getScoreColor(metrics.score) : 'border-[#333]'}`}>
                    {!metrics ? (
                        <div className="text-[#333] text-sm uppercase animate-pulse">Waiting for Input...</div>
                    ) : (
                        <>
                            <div className="text-[100px] leading-none font-['Unbounded'] font-bold tracking-tighter">
                                {metrics.renderTimeMs}<span className="text-2xl">ms</span>
                            </div>
                            <div className="text-xl font-bold uppercase tracking-widest mt-2">{metrics.score}</div>
                            {metrics.score === 'CRITICAL' && <div className="text-[10px] mt-2 bg-[#FF5F57] text-black px-2 py-1 uppercase font-bold">Recommended: Handbrake Compression</div>}
                            {metrics.score === 'PERFECT' && <div className="text-[10px] mt-2 bg-[#28C840] text-black px-2 py-1 uppercase font-bold">Ready for Production</div>}
                        </>
                    )}
                </div>

                {/* 2. DETAILS GRID */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0a0a0a] border border-[#222] p-4">
                        <div className="text-[10px] text-[#666] uppercase mb-1">File Size</div>
                        <div className="text-xl font-['Space_Mono']">{metrics ? `${metrics.fileSizeMB} MB` : '--'}</div>
                    </div>
                    <div className="bg-[#0a0a0a] border border-[#222] p-4">
                         <div className="text-[10px] text-[#666] uppercase mb-1">Resolution</div>
                         <div className="text-xl font-['Space_Mono']">{metrics ? metrics.resolution : '--'}</div>
                    </div>
                    <div className="bg-[#0a0a0a] border border-[#222] p-4">
                         <div className="text-[10px] text-[#666] uppercase mb-1">Load Time</div>
                         <div className="text-xl font-['Space_Mono']">{metrics ? `${metrics.loadTimeMs}ms` : '--'}</div>
                    </div>
                    <div className="bg-[#0a0a0a] border border-[#222] p-4">
                         <div className="text-[10px] text-[#666] uppercase mb-1">Duration</div>
                         <div className="text-xl font-['Space_Mono']">{metrics ? `${metrics.duration.toFixed(1)}s` : '--'}</div>
                    </div>
                </div>

                {/* 3. LOGS CONSOLE */}
                <div className="flex-1 bg-[#0a0a0a] border border-[#222] p-4 font-mono text-[10px] text-[#666] overflow-y-auto max-h-[300px] custom-scrollbar">
                    <div className="sticky top-0 bg-[#0a0a0a] border-b border-[#222] pb-2 mb-2 uppercase font-bold text-[#444]">System Log</div>
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1">{log}</div>
                    ))}
                    {logs.length === 0 && <div>System Ready. Drop file to begin benchmark.</div>}
                </div>

            </div>
        )}

      </div>
    </div>
  );
};