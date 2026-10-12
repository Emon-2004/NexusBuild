import { useState } from 'react';
import { 
    CheckCircle2, Circle, Lock, 
    Camera, FileText, Wrench, Clock, Download
} from 'lucide-react';
import { useClientData } from '../../Context/ClientDataContext';
import { useDatabase } from '../../Context/DatabaseContext';

const ICONS = {
    'Site Photo': Camera,
    'Document': FileText,
    'Logistics': Wrench,
};

const ProjectProgress = () => {
    const { loading, projects, activeProject: currentClientProject, siteUpdates, downloadStatement } = useClientData();
    const { projectPhotos } = useDatabase();
    const [activeProjectId, setActiveProjectId] = useState(currentClientProject?.id || projects[0]?.id);
    const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null);

    const activeProject = projects.find(p => p.id === activeProjectId) || currentClientProject || projects[0];
    const clientPhases = activeProject?.phases || [];
    const phase = activeProject?.progressPhase || activeProject?.progress_phase || 1;

    if (loading) {
        return (
            <div className="flex flex-col gap-6 max-w-5xl animate-pulse">
                <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm p-6 pb-8 flex flex-col gap-4">
                    <div className="skeleton h-6 w-64 rounded bg-base-300" />
                    <div className="skeleton h-20 w-full rounded-lg bg-base-200" />
                </div>
                <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-6 flex flex-col gap-4">
                    <div className="skeleton h-6 w-48 rounded bg-base-300" />
                    <div className="skeleton h-48 w-full rounded bg-base-200" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl">
            
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                <div>
                    <h1 className="font-bold text-2xl text-base-content">Project Progress</h1>
                    <p className="text-sm text-base-content/70 mt-1">Track construction milestones and site updates.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 bg-base-100 border border-base-300 p-1 rounded-sm shadow-sm w-full sm:w-auto">
                    {projects.map(p => (
                        <button
                            key={p.id}
                            onClick={() => setActiveProjectId(p.id)}
                            className={`flex-1 sm:flex-none px-4 py-2 text-[10px] font-bold tracking-wider uppercase rounded-sm transition-all ${
                                activeProjectId === p.id
                                    ? 'bg-primary text-primary-content shadow-sm'
                                    : 'text-base-content/70 hover:bg-base-200'
                            }`}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* 1. Construction Progress Card (Matched to Overview Figma style) */}
            <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm p-4 sm:p-6 pb-8">
                <h2 className="text-primary font-bold text-base sm:text-[18px] mb-6 sm:mb-10">Overall Construction Progress</h2>
                
                <div className="relative mt-8 sm:mt-12 pb-4">
                    {/* Mobile Vertical Line */}
                    <div className="absolute left-[17px] top-[24px] bottom-[24px] w-1 bg-base-300 z-0 rounded-full overflow-hidden sm:hidden">
                        <div className={`w-full bg-[#006E1C] transition-all duration-500 ease-out`} style={{ height: `${Math.min(100, (Math.max(0, phase - 1) / (clientPhases.length - 1 || 3)) * 100)}%` }} />
                    </div>
                    
                    {/* Desktop Horizontal Line */}
                    <div className="absolute top-4 left-[12.5%] right-[12.5%] h-1 bg-base-300 z-0 rounded-full overflow-hidden hidden sm:block">
                        <div className={`h-full bg-[#006E1C] transition-all duration-500 ease-out`} style={{ width: `${Math.min(100, (Math.max(0, phase - 1) / (clientPhases.length - 1 || 3)) * 100)}%` }} />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start relative z-10 gap-8 sm:gap-0">
                        {(activeProject?.phases || [
                            { id: 1, name: 'Piling & Foundation', date: 'Completed Dec 23', progress: 100 },
                            { id: 2, name: 'Structural Basement & Columns', date: 'Target: Feb 24', progress: 50 },
                            { id: 3, name: 'Slabs Casting & Brickwork', date: 'Target: May 26', progress: 0 },
                            { id: 4, name: 'Finishing & Handover', date: 'Target: Dec 26', progress: 0 }
                        ]).map(step => {
                            const isCurrent = step.id === phase;
                            const isCompleted = step.id < phase;
                            return (
                                <div key={step.id} className="flex flex-row sm:flex-col items-center sm:flex-1 gap-4 sm:gap-0 w-full sm:w-auto text-left sm:text-center">
                                    <div className="flex-shrink-0 flex justify-center w-9">
                                        {isCompleted ? (
                                            <div className="w-9 h-9 rounded-full bg-[#006E1C] border-2 border-[#006E1C] flex items-center justify-center text-white z-10 relative shadow-sm">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        ) : isCurrent ? (
                                            <div className="w-9 h-9 rounded-full bg-base-100 border-4 border-primary flex items-center justify-center z-10 relative shadow-md">
                                                <div className="w-3.5 h-3.5 rounded-full bg-primary animate-pulse" />
                                            </div>
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-base-100 border-2 border-base-300 flex items-center justify-center text-base-content/40 font-bold text-xs z-10 relative">
                                                {step.id}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col sm:items-center flex-1">
                                        <div className={`text-[11px] uppercase tracking-wider sm:mt-4 whitespace-pre-line ${
                                            isCurrent 
                                                ? 'font-bold text-primary' 
                                                : isCompleted 
                                                ? 'font-semibold text-[#006E1C]' 
                                                : 'font-medium text-base-content/50'
                                        }`}>
                                            {step.name}
                                        </div>
                                        {step.date && (
                                            <div className={`text-[10px] mt-0.5 sm:mt-1 font-medium ${isCurrent ? 'text-primary font-bold' : 'text-base-content/50'}`}>
                                                {step.date}
                                            </div>
                                        )}
                                        {step.progress > 0 && step.progress < 100 && (
                                            <div className="mt-1.5 sm:mt-2">
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary font-extrabold text-[9px] rounded-full border border-primary/20">
                                                    {step.progress}% COMPLETE
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Milestone Detailed Progress Breakdown */}
                <div className="mt-8 pt-6 border-t border-base-300 space-y-4">
                    <h3 className="text-xs font-bold text-base-content/80 uppercase tracking-wider mb-4">Milestone Progress Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(activeProject?.phases || []).map(p => {
                            const isComp = p.id < phase || p.progress >= 100;
                            const isCurr = p.id === phase;
                            return (
                                <div key={p.id} className="p-4 bg-base-200/50 border border-base-300 rounded-xl flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-bold text-xs text-base-content">{p.name}</div>
                                            <div className="text-[10px] text-base-content/60 mt-0.5">{p.date}</div>
                                        </div>
                                        <div>
                                            {isComp ? (
                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[9px] rounded border border-emerald-500/20">COMPLETED</span>
                                            ) : isCurr ? (
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary font-extrabold text-[9px] rounded border border-primary/20 animate-pulse">IN PROGRESS</span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-base-200 text-base-content/50 font-bold text-[9px] rounded border border-base-300">UPCOMING</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1 mt-2">
                                        <div className="flex justify-between text-[10px] font-bold text-base-content/70">
                                            <span>Progress</span>
                                            <span>{isComp ? 100 : p.progress}%</span>
                                        </div>
                                        <div className="w-full bg-base-300 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${isComp ? 'bg-[#006E1C]' : 'bg-primary'} transition-all duration-500`}
                                                style={{ width: `${isComp ? 100 : p.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 2. Site Updates */}
            <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm">
                <div className="p-6 border-b border-base-300 flex justify-between items-center">
                    <h2 className="text-primary font-bold text-[18px]">Latest Site Updates</h2>
                </div>
                
                <div className="divide-y divide-base-300">
                    {siteUpdates.filter(u => {
                        const pId = u.projectId || u.project_id;
                        return !activeProjectId || !pId || pId === activeProjectId;
                    }).map((u) => {
                        const IconComponent = ICONS[u.type] || Clock;
                        return (
                            <div key={u.id} className="p-6 hover:bg-base-200/50 transition-colors flex gap-5">
                                <div className="w-12 h-12 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <IconComponent size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-bold text-base text-base-content">{u.title}</h4>
                                        <div className="flex items-center gap-2 text-base-content/60 font-mono text-[11px] uppercase tracking-wider">
                                            <Clock size={12} /> {u.date}
                                        </div>
                                    </div>
                                    <div className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full mb-3">
                                        {u.type || 'Announcement'}
                                    </div>
                                    <p className="text-sm text-base-content/75 leading-relaxed max-w-3xl">
                                        {u.desc}
                                    </p>
                                    
                                    {(u.type === 'Document' || u.type === 'Site Photo') && (
                                        <button onClick={downloadStatement} className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-full transition-colors border border-transparent hover:border-primary/20">
                                            <Download size={14} /> Download Asset
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    {siteUpdates.filter(u => {
                        const pId = u.projectId || u.project_id;
                        return !activeProjectId || !pId || pId === activeProjectId;
                    }).length === 0 && (
                        <div className="p-8 text-center text-base-content/50 text-sm italic">
                            No broadcast site updates recorded for {activeProject?.name || 'this project'} yet.
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Project Photo Gallery */}
            <div className="bg-base-100 rounded-lg border border-base-300 shadow-sm p-6 mb-8">
                <h2 className="text-primary font-bold text-[18px] mb-6">Site Photo Gallery</h2>
                {(() => {
                    const currentPhotos = (projectPhotos || []).filter(photo => photo.projectId === activeProjectId || photo.project_id === activeProjectId);
                    if (currentPhotos.length > 0) {
                        return (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {currentPhotos.map(photo => (
                                    <div 
                                        key={photo.id} 
                                        className="group relative border border-base-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-base-200 aspect-video cursor-pointer"
                                        onClick={() => setSelectedPhotoUrl(photo.url)}
                                    >
                                        <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                                            <p className="text-[11px] font-bold truncate">{photo.caption || 'Site Photo'}</p>
                                            <p className="text-[9px] text-slate-300 font-mono mt-0.5">{photo.date || 'Recent'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    }
                    return (
                        <div className="p-8 text-center text-base-content/50 text-sm italic border border-base-300 border-dashed rounded-lg">
                            No site progress photos uploaded for {activeProject?.name || 'this project'} yet.
                        </div>
                    );
                })()}
            </div>

            {/* Lightbox Modal */}
            {selectedPhotoUrl && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 cursor-pointer" onClick={() => setSelectedPhotoUrl(null)}>
                    <div className="relative max-w-4xl max-h-full">
                        <img src={selectedPhotoUrl} alt="Preview" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-white/10" />
                        <button onClick={() => setSelectedPhotoUrl(null)} className="absolute -top-10 right-0 text-white hover:text-slate-350 font-bold text-sm bg-white/10 px-3 py-1 rounded-full cursor-pointer">
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ProjectProgress;
