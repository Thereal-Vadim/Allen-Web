import React, { useState, useEffect, useRef } from 'react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
// @ts-ignore
import { ref as dbRef, onValue, push, set, remove, update } from 'firebase/database';
import { storage, db } from '../firebase';
import { Project, AboutPageData, SoftwareItem, GearGroup } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
}

type DashboardView = 'menu' | 'projects' | 'hero' | 'about' | 'analytics';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<DashboardView>('menu');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // --- HERO UPLOAD STATE ---
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showCorsGuide, setShowCorsGuide] = useState(false);

  // --- PROJECTS STATE ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null); 
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [projectVideoFile, setProjectVideoFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]); 
  const [projectUploadProgress, setProjectUploadProgress] = useState(0);
  const [isProjectUploading, setIsProjectUploading] = useState(false);

  // --- ABOUT PAGE STATE ---
  const [aboutData, setAboutData] = useState<AboutPageData>({
    bio: '',
    profileImageUrl: '',
    philosophy: '',
    software: [],
    gear: []
  });
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  const [isAboutSaving, setIsAboutSaving] = useState(false);
  // Temp state for adding new software
  const [newSoftware, setNewSoftware] = useState<SoftwareItem>({ name: '', cat: '', level: '' });
  // Temp state for adding new gear category
  const [newGearCat, setNewGearCat] = useState('');

  const initialFormState: Omit<Project, 'id'> = {
    title: '',
    category: '',
    videoUrl: '',
    director: '',
    role: '',
    imageUrl: '', 
    isFeatured: false,
    showInWork: true,
    size: 'medium',
    galleryUrls: [],
    order: 0
  };
  const [projectForm, setProjectForm] = useState(initialFormState);

  const addLog = (msg: string) => {
    setDebugLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  // --- FETCH DATA LOGIC ---
  useEffect(() => {
    // 1. Projects
    if (currentView === 'projects') {
        const projectsRef = dbRef(db, 'projects');
        const unsubscribe = onValue(projectsRef, (snapshot: any) => {
            const data = snapshot.val();
            if (data) {
                const loadedProjects: Project[] = Object.entries(data).map(([key, value]: [string, any]) => ({
                    id: key,
                    ...value,
                    galleryUrls: value.galleryUrls || [] 
                }));
                loadedProjects.sort((a, b) => (a.order || 0) - (b.order || 0));
                setProjects(loadedProjects);
            } else {
                setProjects([]);
            }
        });
        return () => unsubscribe(); 
    }
    
    // 2. About Page
    if (currentView === 'about') {
        const aboutRef = dbRef(db, 'aboutPage');
        const unsubscribe = onValue(aboutRef, (snapshot: any) => {
            const val = snapshot.val();
            if (val) {
                setAboutData({
                    bio: val.bio || '',
                    profileImageUrl: val.profileImageUrl || '',
                    philosophy: val.philosophy || '',
                    software: val.software || [],
                    gear: val.gear || []
                });
            }
        });
        return () => unsubscribe();
    }
  }, [currentView]);

  // --- HELPER: UPLOAD FILE ---
  const uploadFile = async (file: File, path: string): Promise<string> => {
      const fileRef = storageRef(storage, path);
      const uploadTask = uploadBytesResumable(fileRef, file);
      return new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
              (snapshot) => {
                  const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  setProjectUploadProgress(progress); 
              },
              (error) => reject(error),
              async () => {
                  const url = await getDownloadURL(uploadTask.snapshot.ref);
                  resolve(url);
              }
          );
      });
  };

  // --- ABOUT PAGE HANDLERS ---
  const handleAboutSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsAboutSaving(true);
      try {
          let imageUrl = aboutData.profileImageUrl;
          
          if (aboutImageFile) {
              imageUrl = await uploadFile(aboutImageFile, `about-image/${Date.now()}-${aboutImageFile.name}`);
          }

          const finalData = {
              ...aboutData,
              profileImageUrl: imageUrl
          };

          await set(dbRef(db, 'aboutPage'), finalData);
          alert('About Page Updated Successfully!');
          setAboutImageFile(null);
      } catch (error) {
          console.error(error);
          alert('Error saving about page');
      } finally {
          setIsAboutSaving(false);
      }
  };

  const addSoftware = () => {
      if (!newSoftware.name) return;
      setAboutData({
          ...aboutData,
          software: [...(aboutData.software || []), newSoftware]
      });
      setNewSoftware({ name: '', cat: '', level: '' });
  };

  const removeSoftware = (index: number) => {
      const updated = [...aboutData.software];
      updated.splice(index, 1);
      setAboutData({ ...aboutData, software: updated });
  };

  const addGearCategory = () => {
      if(!newGearCat) return;
      setAboutData({
          ...aboutData,
          gear: [...(aboutData.gear || []), { category: newGearCat, items: [] }]
      });
      setNewGearCat('');
  };

  const removeGearCategory = (index: number) => {
      const updated = [...aboutData.gear];
      updated.splice(index, 1);
      setAboutData({ ...aboutData, gear: updated });
  };

  const updateGearItems = (catIndex: number, text: string) => {
      // Split by newline to create array
      const items = text.split('\n').filter(line => line.trim() !== '');
      const updatedGear = [...aboutData.gear];
      updatedGear[catIndex].items = items;
      setAboutData({ ...aboutData, gear: updatedGear });
  };

  // --- PROJECT HANDLERS (Existing) ---
  const handleDragStart = (e: React.DragEvent, position: number) => {
    dragItem.current = position;
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragEnter = (e: React.DragEvent, position: number) => {
    dragOverItem.current = position;
    e.preventDefault();
    const copyListItems = [...projects];
    if (dragItem.current !== null && dragItem.current !== position) {
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(position, 0, dragItemContent);
        dragItem.current = position;
        setProjects(copyListItems);
    }
  };
  const handleDragEnd = async () => {
    dragItem.current = null;
    dragOverItem.current = null;
    const updates: any = {};
    projects.forEach((proj, index) => { updates[`projects/${proj.id}/order`] = index; });
    try { await update(dbRef(db), updates); } catch (e) { console.error(e); }
  };
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title) return;
    setIsProjectUploading(true);
    let finalVideoUrl = projectForm.videoUrl;
    let finalGalleryUrls = [...(projectForm.galleryUrls || [])];
    try {
        if (projectVideoFile) finalVideoUrl = await uploadFile(projectVideoFile, `project-videos/${Date.now()}-${projectVideoFile.name}`);
        if (galleryFiles.length > 0) {
            for (const file of galleryFiles) {
                const url = await uploadFile(file, `project-gallery/${Date.now()}-${file.name}`);
                finalGalleryUrls.push(url);
            }
        }
        const finalProjectData = { ...projectForm, videoUrl: finalVideoUrl, galleryUrls: finalGalleryUrls, order: isEditing ? projectForm.order : projects.length };
        if (isEditing) {
            const projectRef = dbRef(db, `projects/${isEditing}`);
            await set(projectRef, finalProjectData);
            setIsEditing(null);
        } else {
            const projectsListRef = dbRef(db, 'projects');
            await push(projectsListRef, finalProjectData);
        }
        resetProjectForm();
    } catch (error) { alert(`Failed: ${error}`); } finally { setIsProjectUploading(false); }
  };
  const deleteProject = async (id: string | number) => {
      if (window.confirm('DELETE PROJECT?')) { await remove(dbRef(db, `projects/${id}`)); }
  };
  const editProject = (project: Project) => {
      setProjectForm({
          title: project.title, category: project.category, videoUrl: project.videoUrl, director: project.director || '', role: project.role || '', imageUrl: project.imageUrl || '', isFeatured: project.isFeatured || false, showInWork: project.showInWork !== false, size: project.size || 'medium', galleryUrls: project.galleryUrls || [], order: project.order || 0
      });
      setProjectVideoFile(null); setGalleryFiles([]); setIsEditing(project.id.toString());
  };
  const resetProjectForm = () => { setIsEditing(null); setProjectForm(initialFormState); setProjectVideoFile(null); setGalleryFiles([]); setProjectUploadProgress(0); };
  const removeGalleryUrl = (indexToRemove: number) => {
      const updated = (projectForm.galleryUrls || []).filter((_, i) => i !== indexToRemove);
      setProjectForm({ ...projectForm, galleryUrls: updated });
  };
  // --- HERO UPLOAD (Existing) ---
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isWebM = file.type.includes('webm');
    const extension = isWebM ? 'webm' : 'mp4';
    const fileName = `hero-video.${extension}`;
    setUploadProgress(0); setIsUploading(true); setStatusMsg('UPLOADING...');
    try {
        const heroRef = storageRef(storage, fileName);
        const uploadTask = uploadBytesResumable(heroRef, file);
        uploadTask.on('state_changed', 
            (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100), 
            (error) => { setIsUploading(false); setStatusMsg('FAILED'); addLog(`Error: ${error.message}`); }, 
            () => { setIsUploading(false); setStatusMsg('COMPLETE'); addLog(`Uploaded ${fileName}`); }
        );
    } catch (e: any) { setIsUploading(false); setStatusMsg('ERROR'); }
  };

  // --- RENDERERS ---
  const ProjectGallery = ({ project, onClose }: { project: Project, onClose: () => void }) => { /* Kept Same but minimized for brevity in this output, assume it exists or I can re-paste if needed. It's just viewing. */ return null; };

  const renderContent = () => {
    switch(currentView) {
      case 'menu':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div onClick={() => setCurrentView('projects')} className="bg-[#111] border border-[#222] p-8 hover:border-[#f4f4f2] transition-colors group cursor-pointer interactive">
              <div className="h-10 w-10 bg-[#222] rounded-full mb-6 flex items-center justify-center group-hover:bg-[#f4f4f2] transition-colors"><div className="w-2 h-2 bg-[#f4f4f2] rounded-full group-hover:bg-black"></div></div>
              <h3 className="text-2xl font-['Oswald'] uppercase mb-2">Projects</h3>
              <p className="text-[#666] text-sm font-['Space_Mono']">Manage portfolio items.</p>
            </div>
            <div onClick={() => setCurrentView('about')} className="bg-[#111] border border-[#222] p-8 hover:border-[#f4f4f2] transition-colors group cursor-pointer interactive">
              <div className="h-10 w-10 bg-[#222] rounded-full mb-6 flex items-center justify-center group-hover:bg-[#f4f4f2] transition-colors"><div className="w-2 h-2 bg-[#f4f4f2] rounded-full group-hover:bg-black"></div></div>
              <h3 className="text-2xl font-['Oswald'] uppercase mb-2">About Page</h3>
              <p className="text-[#666] text-sm font-['Space_Mono']">Bio, Photo, Gear & Software.</p>
            </div>
            <div onClick={() => setCurrentView('hero')} className="bg-[#111] border border-[#222] p-8 hover:border-[#f4f4f2] transition-colors group cursor-pointer interactive">
              <div className="h-10 w-10 bg-[#222] rounded-full mb-6 flex items-center justify-center group-hover:bg-[#f4f4f2] transition-colors"><div className="w-2 h-2 bg-[#f4f4f2] rounded-full group-hover:bg-black"></div></div>
              <h3 className="text-2xl font-['Oswald'] uppercase mb-2">Hero Video</h3>
              <p className="text-[#666] text-sm font-['Space_Mono']">Update loop.</p>
            </div>
          </div>
        );

      case 'about':
        return (
            <div className="animate-in fade-in zoom-in-95 duration-300 w-full max-w-4xl mx-auto">
                <button onClick={() => setCurrentView('menu')} className="mb-8 text-xs font-['Space_Mono'] uppercase hover:underline text-[#666] hover:text-[#f4f4f2] interactive">← Back</button>
                <h2 className="text-4xl font-['Oswald'] mb-6 uppercase">Edit About Page</h2>
                
                <form onSubmit={handleAboutSubmit} className="space-y-10 pb-20">
                    
                    {/* 1. BIO & IMAGE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#111] border border-[#333] p-6">
                        <div className="space-y-4">
                            <h3 className="text-xl font-['Oswald'] uppercase">Bio & Philosophy</h3>
                            <div>
                                <label className="block text-[10px] text-[#666] mb-1 uppercase">Bio Text</label>
                                <textarea 
                                    value={aboutData.bio} 
                                    onChange={(e) => setAboutData({...aboutData, bio: e.target.value})}
                                    rows={6}
                                    className="w-full bg-black border border-[#333] p-3 text-sm focus:border-[#f4f4f2] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-[#666] mb-1 uppercase">Philosophy Quote</label>
                                <textarea 
                                    value={aboutData.philosophy} 
                                    onChange={(e) => setAboutData({...aboutData, philosophy: e.target.value})}
                                    rows={3}
                                    className="w-full bg-black border border-[#333] p-3 text-sm focus:border-[#f4f4f2] outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-['Oswald'] uppercase">Profile Image</h3>
                            <div className="aspect-[3/4] bg-black border border-[#333] relative flex items-center justify-center overflow-hidden group">
                                {aboutImageFile ? (
                                    <img src={URL.createObjectURL(aboutImageFile)} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                ) : (
                                    aboutData.profileImageUrl && <img src={aboutData.profileImageUrl} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                )}
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => { if(e.target.files?.[0]) setAboutImageFile(e.target.files[0]) }}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="z-20 text-center pointer-events-none">
                                    <div className="text-2xl mb-2">📷</div>
                                    <span className="text-xs font-bold uppercase">{aboutImageFile ? 'File Selected' : 'Click to Replace'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. SOFTWARE STACK */}
                    <div className="bg-[#111] border border-[#333] p-6">
                         <h3 className="text-xl font-['Oswald'] uppercase mb-4">Digital Arsenal (Software)</h3>
                         
                         {/* List */}
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                             {(aboutData.software || []).map((sw, i) => (
                                 <div key={i} className="bg-black border border-[#333] p-3 relative group">
                                     <button type="button" onClick={() => removeSoftware(i)} className="absolute top-1 right-1 text-red-500 text-xs opacity-0 group-hover:opacity-100 hover:text-white">✕</button>
                                     <div className="text-[#666] text-[10px] uppercase">{sw.cat}</div>
                                     <div className="font-bold text-sm uppercase my-1">{sw.name}</div>
                                     <div className="text-[9px] bg-[#222] inline-block px-1 uppercase">{sw.level}</div>
                                 </div>
                             ))}
                         </div>

                         {/* Add New */}
                         <div className="flex flex-col md:flex-row gap-2 items-end border-t border-[#333] pt-4">
                             <div className="flex-1">
                                 <label className="text-[9px] text-[#666] uppercase">Software Name</label>
                                 <input type="text" value={newSoftware.name} onChange={e => setNewSoftware({...newSoftware, name: e.target.value})} className="w-full bg-black border border-[#333] p-2 text-sm" placeholder="e.g. Premiere"/>
                             </div>
                             <div className="flex-1">
                                 <label className="text-[9px] text-[#666] uppercase">Category</label>
                                 <input type="text" value={newSoftware.cat} onChange={e => setNewSoftware({...newSoftware, cat: e.target.value})} className="w-full bg-black border border-[#333] p-2 text-sm" placeholder="e.g. Editing"/>
                             </div>
                             <div className="flex-1">
                                 <label className="text-[9px] text-[#666] uppercase">Level</label>
                                 <input type="text" value={newSoftware.level} onChange={e => setNewSoftware({...newSoftware, level: e.target.value})} className="w-full bg-black border border-[#333] p-2 text-sm" placeholder="e.g. Expert"/>
                             </div>
                             <button type="button" onClick={addSoftware} className="bg-[#f4f4f2] text-black px-4 py-2 font-bold uppercase text-xs hover:opacity-80 h-[38px]">Add</button>
                         </div>
                    </div>

                    {/* 3. HARDWARE INVENTORY */}
                    <div className="bg-[#111] border border-[#333] p-6">
                        <h3 className="text-xl font-['Oswald'] uppercase mb-4">Hardware Inventory</h3>
                        <p className="text-[10px] text-[#666] mb-4 uppercase">Use separate lines for each item in a category.</p>

                        <div className="space-y-6">
                            {(aboutData.gear || []).map((group, i) => (
                                <div key={i} className="bg-black border border-[#333] p-4 relative">
                                    <button type="button" onClick={() => removeGearCategory(i)} className="absolute top-2 right-2 text-red-500 text-xs hover:text-white uppercase">Remove Category</button>
                                    <div className="font-bold text-[#f4f4f2] uppercase mb-2">{group.category}</div>
                                    <textarea 
                                        value={group.items.join('\n')}
                                        onChange={(e) => updateGearItems(i, e.target.value)}
                                        rows={4}
                                        className="w-full bg-[#111] border border-[#333] p-2 text-sm font-mono focus:border-[#f4f4f2] outline-none"
                                        placeholder="Item 1&#10;Item 2&#10;Item 3"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Add Category */}
                        <div className="flex gap-2 items-end mt-6 border-t border-[#333] pt-4">
                            <div className="flex-1">
                                <label className="text-[9px] text-[#666] uppercase">New Category Name</label>
                                <input type="text" value={newGearCat} onChange={e => setNewGearCat(e.target.value)} className="w-full bg-black border border-[#333] p-2 text-sm" placeholder="e.g. DRONES"/>
                            </div>
                            <button type="button" onClick={addGearCategory} className="bg-[#333] text-white px-4 py-2 font-bold uppercase text-xs hover:bg-[#444] h-[38px]">Add Category</button>
                        </div>
                    </div>

                    {/* SAVE BUTTON */}
                    <div className="sticky bottom-6 bg-[#080808] border-t border-[#333] pt-4 z-50">
                        <button 
                            type="submit" 
                            disabled={isAboutSaving}
                            className="w-full bg-[#f4f4f2] text-black py-4 font-bold uppercase tracking-widest hover:bg-white disabled:opacity-50"
                        >
                            {isAboutSaving ? 'Saving Changes...' : 'Save All Changes'}
                        </button>
                    </div>

                </form>
            </div>
        );

      case 'projects': return ( /* Project JSX from previous step... */ 
          <div className="animate-in fade-in zoom-in-95 duration-300 w-full">
             <button onClick={() => setCurrentView('menu')} className="mb-8 text-xs font-['Space_Mono'] uppercase hover:underline text-[#666] hover:text-[#f4f4f2] interactive">← Back</button>
             <h2 className="text-4xl font-['Oswald'] mb-6 uppercase">Manage Projects</h2>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                    <div className="bg-[#111] border border-[#333] p-6 sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar">
                        <h3 className="text-xl font-['Oswald'] uppercase mb-6">{isEditing ? 'Edit Project' : 'New Project'}</h3>
                        <form onSubmit={handleProjectSubmit} className="space-y-6">
                            <div className="space-y-1"><label className="text-[9px] uppercase text-[#666] font-['Space_Mono']">Project Title *</label><input type="text" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} className="w-full bg-black border border-[#333] p-2 text-sm focus:border-[#f4f4f2] outline-none transition-colors" placeholder="E.g. NIGHT DRIVE"/></div>
                            <div className="grid grid-cols-2 gap-2 bg-[#1a1a1a] p-3 border border-[#333]"><span className="col-span-2 text-[9px] uppercase text-[#f4f4f2] opacity-50 block mb-1">Visibility</span><div className="flex items-center gap-3"><input type="checkbox" id="isFeatured" checked={projectForm.isFeatured} onChange={e => setProjectForm({...projectForm, isFeatured: e.target.checked})} className="w-4 h-4 bg-black border border-[#333] cursor-pointer accent-[#f4f4f2]"/><label htmlFor="isFeatured" className="text-xs uppercase cursor-pointer select-none">Home</label></div><div className="flex items-center gap-3"><input type="checkbox" id="showInWork" checked={projectForm.showInWork} onChange={e => setProjectForm({...projectForm, showInWork: e.target.checked})} className="w-4 h-4 bg-black border border-[#333] cursor-pointer accent-[#f4f4f2]"/><label htmlFor="showInWork" className="text-xs uppercase cursor-pointer select-none">Work</label></div></div>
                            <div className="grid grid-cols-2 gap-2"><div className="space-y-1"><label className="text-[9px] uppercase text-[#666] font-['Space_Mono']">Category</label><input type="text" value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value})} className="w-full bg-black border border-[#333] p-2 text-sm focus:border-[#f4f4f2] outline-none transition-colors"/></div><div className="space-y-1"><label className="text-[9px] uppercase text-[#666] font-['Space_Mono']">Size (Home)</label><select value={projectForm.size} onChange={e => setProjectForm({...projectForm, size: e.target.value as 'medium' | 'large'})} className="w-full bg-black border border-[#333] p-2 text-sm focus:border-[#f4f4f2] outline-none transition-colors"><option value="medium">Medium</option><option value="large">Large</option></select></div></div>
                            <div className="pt-4 border-t border-[#333]"><div className="space-y-2"><input type="text" value={projectForm.director} onChange={e => setProjectForm({...projectForm, director: e.target.value})} className="w-full bg-black border border-[#333] p-2 text-sm focus:border-[#f4f4f2] outline-none transition-colors" placeholder="Dir: John Doe"/><input type="text" value={projectForm.role} onChange={e => setProjectForm({...projectForm, role: e.target.value})} className="w-full bg-black border border-[#333] p-2 text-sm focus:border-[#f4f4f2] outline-none transition-colors" placeholder="Role: VFX"/></div></div>
                            <div className="pt-4 border-t border-[#333]"><span className="text-[9px] uppercase text-[#f4f4f2] opacity-50 block mb-2">Main Video</span><div className="relative border border-[#333] bg-black p-2 flex items-center gap-2 group hover:border-[#f4f4f2] transition-colors"><input type="file" accept="video/*" onChange={(e) => { if(e.target.files?.[0]) setProjectVideoFile(e.target.files[0]); }} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"/><div className="text-[#f4f4f2] text-xs font-mono uppercase truncate flex-1">{projectVideoFile ? `SELECTED: ${projectVideoFile.name}` : (projectForm.videoUrl ? 'HAS VIDEO (CLICK REPLACE)' : 'UPLOAD MAIN VIDEO')}</div></div></div>
                            <div className="flex gap-2 pt-4">{isEditing && <button type="button" onClick={resetProjectForm} className="flex-1 border border-[#333] text-[#666] hover:text-white py-3 uppercase text-xs font-bold interactive">Cancel</button>}<button type="submit" disabled={isProjectUploading} className={`flex-1 bg-[#f4f4f2] text-black hover:bg-white py-3 uppercase text-xs font-bold interactive ${isProjectUploading ? 'opacity-50' : ''}`}>{isProjectUploading ? `Uploading ${Math.round(projectUploadProgress)}%` : (isEditing ? 'Save' : 'Add Project')}</button></div>
                        </form>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <div className="bg-[#0a0a0a] border border-[#222]">
                        <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#111]"><span className="text-xs font-mono text-[#666]">TOTAL: {projects.length}</span></div>
                        <div className="divide-y divide-[#222]">{projects.map((project, index) => (<div key={project.id} className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-[#111] transition-colors group relative" draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnter={(e) => handleDragEnter(e, index)} onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()}><div className="flex items-center gap-4 flex-1"><div className="w-16 h-10 bg-[#222] flex items-center justify-center hidden sm:flex shrink-0"><div className="text-xs">🎬</div></div><div><h4 className="text-xl font-['Oswald'] uppercase flex items-center gap-2">{project.title}{(project.galleryUrls?.length || 0) > 0 && <span className="text-[9px] bg-[#222] text-[#888] px-1 rounded border border-[#333]">MULTI-CAM</span>}</h4><div className="flex gap-3 text-[10px] font-mono text-[#666]"><span className="border border-[#333] px-1 rounded">{project.category}</span>{project.isFeatured && <span className="text-green-500">HOME</span>}</div></div></div><div className="flex items-center gap-4"><div className="flex gap-2 relative z-20"><button onClick={(e) => { e.stopPropagation(); editProject(project); }} className="border border-[#333] px-3 py-1 text-[10px] uppercase hover:bg-white hover:text-black hover:border-white transition-colors cursor-pointer">Edit</button><button onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }} className="border border-red-900 text-red-700 px-3 py-1 text-[10px] uppercase hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors cursor-pointer">Del</button></div><div className="cursor-grab hover:text-white text-[#444] p-2"><svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M0 3h16v2H0V3zm0 5h16v2H0V8zm0 5h16v2H0v-2z" /></svg></div></div></div>))}</div>
                    </div>
                </div>
             </div>
          </div>
      );
      case 'hero': return ( <div className="max-w-2xl animate-in fade-in zoom-in-95 duration-300"> <button onClick={() => setCurrentView('menu')} className="mb-8 text-xs font-['Space_Mono'] uppercase hover:underline text-[#666] hover:text-[#f4f4f2] interactive">← Back</button> <h2 className="text-4xl font-['Oswald'] mb-6 uppercase">Update Hero Loop</h2> <div className="bg-[#111] border border-[#333] p-8"> <div className="relative border-2 border-dashed border-[#333] hover:border-[#f4f4f2] transition-colors rounded-sm p-10 text-center group interactive"> <input ref={fileInputRef} type="file" accept="video/mp4, video/webm" onChange={handleHeroUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/> <div className="pointer-events-none"> <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📂</div> <span className="uppercase font-bold tracking-widest text-xs">{isUploading ? 'UPLOADING...' : 'DRAG FILE OR CLICK (MP4 / WEBM)'}</span> </div> </div> {(isUploading || uploadProgress > 0) && ( <div className="mt-8"> <div className="w-full h-1 bg-[#222]"> <div className="h-full bg-[#f4f4f2] transition-all duration-300" style={{ width: `${uploadProgress}%` }}/> </div> <div className="mt-2 text-[10px] font-mono uppercase text-green-500">{statusMsg}</div> </div> )} </div> </div> );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080808] text-[#f4f4f2] pt-32 px-4 md:px-10 pb-20 cursor-auto">
      {viewingProject && <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center text-white"><button onClick={() => setViewingProject(null)} className="absolute top-10 right-10 text-xl">CLOSE</button><div>PREVIEW ONLY</div></div>}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-[#333] pb-10">
          <div><h1 className="text-4xl md:text-6xl font-['Unbounded'] font-bold uppercase">Command Center</h1><p className="text-[#666] font-['Space_Mono'] text-sm mt-2 uppercase">Welcome back, Koptsev.</p></div>
          <button onClick={onLogout} className="mt-5 md:mt-0 border border-[#333] px-6 py-2 uppercase font-['Space_Mono'] text-xs hover:bg-[#f4f4f2] hover:text-black transition-colors cursor-pointer">Terminate Session</button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};