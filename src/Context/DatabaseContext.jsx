import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { PROJECTS } from '../data/projectsData';
import { showToast } from '../Components/Toast/globalToast';
import DEFAULT_SYSTEM_SETTINGS from '../config/defaultSettings';

const DatabaseContext = createContext(null);

const DEFAULT_PHASES = [
    { id: 1, name: 'Piling & Foundation', date: 'Completed Dec 23', progress: 100 },
    { id: 2, name: 'Structural Basement & Columns', date: 'Target: Feb 24', progress: 0 },
    { id: 3, name: 'Slabs Casting & Brickwork', date: 'Target: May 26', progress: 0 },
    { id: 4, name: 'Finishing & Handover', date: 'Target: Dec 26', progress: 0 },
];

// Map a raw project row from the DB into the shape used across the app.
const mapRawProject = (p) => {
    const catalogMatch = PROJECTS.find(c => c.id === p.id || c.slug === p.slug) || {};
    const localMilestones = (() => {
        try {
            const stored = localStorage.getItem(`project_milestones_${p.id}`);
            return stored ? JSON.parse(stored) : null;
        } catch(e) { return null; }
    })();
    const savedPhase = (() => {
        try {
            const phaseStored = localStorage.getItem(`project_phase_${p.id}`);
            return phaseStored ? parseInt(phaseStored) : null;
        } catch(e) { return null; }
    })();

    const defaultPhases = DEFAULT_PHASES;

    // DB is the source of truth; localStorage is only a fallback when the DB has no phases
    const dbPhases = (typeof p.phases === 'string' ? JSON.parse(p.phases || 'null') : p.phases) || localMilestones || defaultPhases;
    const dbPhase = p.progress_phase || p.progressPhase;

    const firstIncomplete = dbPhases.find(ph => ph.progress < 100);
    const derivedPhase = firstIncomplete ? firstIncomplete.id : (dbPhases.length || 1);
    const finalPhase = (dbPhase && !isNaN(parseInt(dbPhase)) && parseInt(dbPhase) > 0)
        ? parseInt(dbPhase)
        : (savedPhase !== null && !isNaN(savedPhase) && savedPhase > 0)
            ? savedPhase
            : derivedPhase;

    return { 
        ...catalogMatch,
        ...p, 
        name: p.name || catalogMatch.name || 'Sardar Tower – Block A',
        location: p.location || catalogMatch.location || 'Narayanganj',
        image: p.image || catalogMatch.image || '/Frontend/Projects/Reliance_Zenith_Towers.svg',
        area: p.area || catalogMatch.area || '1,850 sq. ft',
        handoverDate: p.handoverDate || p.handover_date || catalogMatch.handoverDate || 'Dec 2026',
        progressPhase: finalPhase, 
        progress_phase: finalPhase, 
        totalUnits: p.total_units || p.totalUnits || catalogMatch.totalUnits || 32,
        phases: dbPhases
    };
};

export const DatabaseProvider = ({ children }) => {
    const [clients, setClients] = useState([]);
    const [leads, setLeads] = useState([]);
    const [applications, setApplications] = useState([]);
    const [projects, setProjects] = useState([]);
    const [properties, setProperties] = useState([]);
    const [installments, setInstallments] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [siteUpdates, setSiteUpdates] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [projectPhotos, setProjectPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock public projects (use saved localStorage or static PROJECTS list as default)
    const [publicProjects, setPublicProjects] = useState(() => {
        try {
            const savedSettings = JSON.parse(localStorage.getItem('system_settings') || '{}');
            const metaObj = savedSettings.projectsMeta || {};
            const savedLocal = JSON.parse(localStorage.getItem('all_public_projects') || '[]');
            const mergedMap = new Map();

            // 1. Load default PROJECTS
            PROJECTS.forEach(proj => mergedMap.set(proj.id, proj));

            // 2. Merge saved local projects (includes newly added custom projects)
            savedLocal.forEach(proj => {
                if (proj && proj.id) {
                    const defaultProj = mergedMap.get(proj.id) || {};
                    mergedMap.set(proj.id, { ...defaultProj, ...proj });
                }
            });

            return Array.from(mergedMap.values()).map(proj => {
                const meta = metaObj[proj.id] || {};
                const rawStatus = (proj.status || 'AVAILABLE').toUpperCase();
                const cleanStatus = rawStatus.includes('READY') ? 'AVAILABLE' : rawStatus;
                return {
                    ...proj,
                    status: cleanStatus,
                    statusBg: cleanStatus === 'AVAILABLE' ? '#a14000' : (proj.statusBg || '#000f22'),
                    image: meta.image !== undefined ? meta.image : proj.image,
                    gallery: meta.gallery !== undefined ? meta.gallery : proj.gallery,
                    mapLink: meta.mapLink || proj.mapLink,
                    nearbyHospitals: meta.nearbyHospitals || proj.nearbyHospitals,
                    nearbySchools: meta.nearbySchools || proj.nearbySchools,
                    nearbyColleges: meta.nearbyColleges || proj.nearbyColleges,
                    nearbyMarkets: meta.nearbyMarkets || proj.nearbyMarkets
                };
            });
        } catch(e) {}
        return PROJECTS;
    });

    // Global System Settings State (defaults configured in src/config/defaultSettings.js)
    const [systemSettings, setSystemSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('system_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...DEFAULT_SYSTEM_SETTINGS, ...parsed };
            }
        } catch(e) {}
        return DEFAULT_SYSTEM_SETTINGS;
    });

    const updateSystemSettings = async (newSettings) => {
        setSystemSettings(newSettings);
        localStorage.setItem('system_settings', JSON.stringify(newSettings));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('settings_updated', { detail: newSettings }));

        try {
            await supabase.from('system_settings').upsert({ 
                id: 'global', 
                settings: newSettings, 
                updated_at: new Date().toISOString() 
            });
        } catch(e) {
            console.error("Failed to sync settings to Supabase:", e);
        }
    };

    useEffect(() => {
        if (systemSettings?.primaryColor) {
            document.documentElement.style.setProperty('--primary-color', systemSettings.primaryColor);
        }
    }, [systemSettings?.primaryColor]);

    useEffect(() => {
        const handleSync = () => {
            try {
                const saved = localStorage.getItem('system_settings');
                if (saved) setSystemSettings(JSON.parse(saved));
            } catch(e) {}
        };
        window.addEventListener('storage', handleSync);
        window.addEventListener('settings_updated', handleSync);
        return () => {
            window.removeEventListener('storage', handleSync);
            window.removeEventListener('settings_updated', handleSync);
        };
    }, []);

    // Fetch everything on mount
    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [
                    resClients, resLeads, resApps, resProjects,
                    resProps, resInsts, resTrans, resUpdates, resTickets, resPublicProjects, resPhotos, resSettings
                ] = await Promise.all([
                    supabase.from('clients').select('*'),
                    supabase.from('leads').select('*'),
                    supabase.from('applications').select('*'),
                    supabase.from('projects').select('*'),
                    supabase.from('properties').select('*'),
                    supabase.from('installments').select('*'),
                    supabase.from('transactions').select('*'),
                    supabase.from('site_updates').select('*'),
                    supabase.from('tickets').select('*'),
                    supabase.from('public_projects').select('*'),
                    supabase.from('project_photos').select('*'),
                    supabase.from('system_settings').select('*').eq('id', 'global').maybeSingle()
                ]);

                if (resSettings?.data?.settings) {
                    setSystemSettings(resSettings.data.settings);
                    localStorage.setItem('system_settings', JSON.stringify(resSettings.data.settings));
                }

                if (resPhotos.data && resPhotos.data.length > 0) {
                    setProjectPhotos(resPhotos.data.map(p => ({
                        id: p.id,
                        projectId: p.project_id,
                        url: p.url,
                        caption: p.caption,
                        date: p.date
                    })));
                } else {
                    try {
                        const local = JSON.parse(localStorage.getItem('all_project_photos') || '[]');
                        if (local.length > 0) setProjectPhotos(local);
                    } catch(e) {}
                }

                if (resClients.data) setClients(resClients.data);
                if (resLeads.data) setLeads(resLeads.data);
                if (resApps.data) {
                    setApplications(resApps.data.map(app => {
                        try {
                            if (app.unit && app.unit.startsWith('{')) {
                                const parsed = JSON.parse(app.unit);
                                return {
                                    ...app,
                                    email: parsed.email,
                                    phone: parsed.phone,
                                    unit: parsed.unit || 'Not specified'
                                };
                            }
                        } catch(e) {}
                        return app;
                    }));
                }
                const defaultProjectsList = PROJECTS.map(p => ({
                    id: p.id,
                    slug: p.slug,
                    name: p.name,
                    location: p.location || 'Narayanganj',
                    image: p.image || '/Frontend/Projects/Reliance_Zenith_Towers.svg',
                    area: '1,850 sq. ft',
                    handoverDate: 'Dec 2026',
                    totalUnits: p.totalUnits || 32,
                    progressPhase: 2
                }));

                const rawProjects = (resProjects.data && resProjects.data.length > 0) ? resProjects.data : defaultProjectsList;

                setProjects(rawProjects.map(mapRawProject));
                if (resProps.data) setProperties(resProps.data.map(p => ({ ...p, clientId: p.client_id, projectId: p.project_id, unitName: p.unit_name, handoverDate: p.handover_date, totalValuation: p.total_valuation, totalPaid: p.total_paid, otherCharges: p.other_charges, dueBalance: p.due_balance })));
                if (resInsts.data) setInstallments(resInsts.data.map(i => ({ ...i, propertyId: i.property_id, dueDate: i.due_date, statusPill: i.status_pill })));
                if (resTrans.data) setTransactions(resTrans.data.map(t => ({ ...t, propertyId: t.property_id })));
                const defaultSiteUpdates = [
                    {
                        id: 'u1',
                        projectId: 'p1',
                        project_id: 'p1',
                        date: '10 Feb 2026',
                        title: 'Slab 6 Casting Completed',
                        type: 'Announcement',
                        desc: 'Concrete casting for Slab Level 6 on Sardar Tower – Block A was successfully completed with structural inspection approval.'
                    },
                    {
                        id: 'u2',
                        projectId: 'p2',
                        project_id: 'p2',
                        date: '08 Feb 2026',
                        title: 'Piling & Foundation Milestone Completed',
                        type: 'Announcement',
                        desc: 'Subterranean piling and foundation reinforced casting for Green Valley Residency has reached 100% completion.'
                    }
                ];

                if (resUpdates.data && resUpdates.data.length > 0) {
                    const mappedUpdates = resUpdates.data.map(u => ({
                        ...u,
                        projectId: u.project_id || u.projectId
                    }));
                    setSiteUpdates(mappedUpdates);
                } else {
                    try {
                        const local = JSON.parse(localStorage.getItem('all_site_updates') || '[]');
                        if (local.length > 0) {
                            setSiteUpdates(local);
                        } else {
                            setSiteUpdates(defaultSiteUpdates);
                        }
                    } catch(e) {
                        setSiteUpdates(defaultSiteUpdates);
                    }
                }
                if (resTickets.data && resTickets.data.length > 0) {
                    setTickets(resTickets.data.map(t => {
                        let parsedReply = null;
                        try {
                            if (t.message && t.message.trim().startsWith('[')) {
                                const msgs = JSON.parse(t.message);
                                const adminMsgs = msgs.filter(m => m.sender === 'admin');
                                if (adminMsgs.length > 0) {
                                    parsedReply = adminMsgs[adminMsgs.length - 1].text;
                                }
                            }
                        } catch(e) {}

                        return {
                            ...t,
                            clientId: t.client_id || t.clientId,
                            adminReply: parsedReply || t.admin_reply || t.adminReply,
                            admin_reply: parsedReply || t.admin_reply || t.adminReply
                        };
                    }));
                } else {
                    try {
                        const local = JSON.parse(localStorage.getItem('all_tickets') || '[]');
                        if (local.length > 0) setTickets(local);
                    } catch(e) {}
                }
                let publicProjectsLoaded = false;
                if (resPublicProjects && resPublicProjects.data && resPublicProjects.data.length > 0) {
                    const validPublicProjects = resPublicProjects.data
                        .filter(p => p.id !== '1' && p.id !== '2' && p.id !== '3')
                        .map(p => {
                            const obj = {
                                id: p.id,
                                name: p.name,
                                status: p.status,
                                statusBg: p.status_bg,
                                location: p.location,
                                type: p.type,
                                image: p.image,
                                description: p.description,
                                price: p.price,
                                area: p.area
                            };
                            if (p.map_link || p.mapLink) obj.mapLink = p.map_link || p.mapLink;
                            if (p.nearby_hospitals || p.nearbyHospitals) obj.nearbyHospitals = p.nearby_hospitals || p.nearbyHospitals;
                            if (p.nearby_schools || p.nearbySchools) obj.nearbySchools = p.nearby_schools || p.nearbySchools;
                            if (p.nearby_colleges || p.nearbyColleges) obj.nearbyColleges = p.nearby_colleges || p.nearbyColleges;
                            if (p.nearby_markets || p.nearbyMarkets) obj.nearbyMarkets = p.nearby_markets || p.nearbyMarkets;
                            return obj;
                        });
                    
                    const savedSettings = resSettings?.data?.settings || {};
                    const metaObj = savedSettings.projectsMeta || {};

                    if (validPublicProjects.length > 0) {
                        const mergedMap = new Map();
                        PROJECTS.forEach(proj => mergedMap.set(proj.id, proj));
                        validPublicProjects.forEach(proj => {
                            const meta = metaObj[proj.id] || {};
                            const defaultProj = mergedMap.get(proj.id) || {};
                            mergedMap.set(proj.id, { 
                                ...defaultProj, 
                                ...proj,
                                image: meta.image !== undefined ? meta.image : (proj.image || defaultProj.image),
                                gallery: meta.gallery !== undefined ? meta.gallery : (proj.gallery || defaultProj.gallery),
                                mapLink: meta.mapLink || proj.mapLink || defaultProj.mapLink,
                                nearbyHospitals: meta.nearbyHospitals || proj.nearbyHospitals,
                                nearbySchools: meta.nearbySchools || proj.nearbySchools,
                                nearbyColleges: meta.nearbyColleges || proj.nearbyColleges,
                                nearbyMarkets: meta.nearbyMarkets || proj.nearbyMarkets
                            });
                        });
                        setPublicProjects(Array.from(mergedMap.values()));
                        publicProjectsLoaded = true;
                    }
                }

                if (!publicProjectsLoaded) {
                    try {
                        const local = JSON.parse(localStorage.getItem('all_public_projects') || '[]');
                        const savedSettings = JSON.parse(localStorage.getItem('system_settings') || '{}');
                        const metaObj = savedSettings.projectsMeta || {};
                        const mergedMap = new Map();
                        
                        PROJECTS.forEach(proj => {
                            const meta = metaObj[proj.id] || {};
                            mergedMap.set(proj.id, {
                                ...proj,
                                image: meta.image !== undefined ? meta.image : proj.image,
                                gallery: meta.gallery !== undefined ? meta.gallery : proj.gallery,
                                mapLink: meta.mapLink || proj.mapLink,
                                nearbyHospitals: meta.nearbyHospitals || proj.nearbyHospitals,
                                nearbySchools: meta.nearbySchools || proj.nearbySchools,
                                nearbyColleges: meta.nearbyColleges || proj.nearbyColleges,
                                nearbyMarkets: meta.nearbyMarkets || proj.nearbyMarkets
                            });
                        });

                        if (local.length > 0) {
                            local.forEach(proj => {
                                const meta = metaObj[proj.id] || {};
                                const defaultProj = mergedMap.get(proj.id) || {};
                                mergedMap.set(proj.id, { 
                                    ...defaultProj, 
                                    ...proj,
                                    image: meta.image !== undefined ? meta.image : (proj.image || defaultProj.image),
                                    gallery: meta.gallery !== undefined ? meta.gallery : (proj.gallery || defaultProj.gallery),
                                    mapLink: meta.mapLink || proj.mapLink || defaultProj.mapLink,
                                    nearbyHospitals: meta.nearbyHospitals || proj.nearbyHospitals,
                                    nearbySchools: meta.nearbySchools || proj.nearbySchools,
                                    nearbyColleges: meta.nearbyColleges || proj.nearbyColleges,
                                    nearbyMarkets: meta.nearbyMarkets || proj.nearbyMarkets
                                });
                            });
                        }
                        setPublicProjects(Array.from(mergedMap.values()));
                    } catch(e) {
                        setPublicProjects(PROJECTS);
                    }
                }

            } catch (err) {
                console.error("Error fetching data from Supabase:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();

        const handleStorageChange = (e) => {
            if (e.key && (e.key.startsWith('project_') || e.key.startsWith('all_'))) {
                fetchAllData();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', fetchAllData);

        // ── Live sync: refetch when the projects table changes (Supabase Realtime) ──
        const refreshProjectsOnly = async () => {
            const { data } = await supabase.from('projects').select('*');
            if (data && data.length > 0) {
                setProjects(data.map(mapRawProject));
            }
        };
        const refreshSiteUpdatesOnly = async () => {
            const { data } = await supabase.from('site_updates').select('*');
            if (data && data.length > 0) setSiteUpdates(data);
        };
        const channel = supabase
            .channel('db_projects_sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                refreshProjectsOnly();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'site_updates' }, (payload) => {
                refreshSiteUpdatesOnly();
            })
            .subscribe();

        // Fallback: silent poll every 15s so changes appear without a manual refresh
        const pollInterval = setInterval(() => {
            refreshProjectsOnly();
            refreshSiteUpdatesOnly();
        }, 15000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', fetchAllData);
            supabase.removeChannel(channel);
            clearInterval(pollInterval);
        };
    }, []);

    // ─── Global Action Methods (Writes to Supabase) ─────────

    const updateProjectPhase = async (projectId, newPhase) => {
        const numericPhase = parseInt(newPhase) || 1;
        let calculatedPhases = null;

        setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            const currentPhases = p.phases || [
                { id: 1, name: 'Piling & Foundation', date: 'Completed Dec 23', progress: 100 },
                { id: 2, name: 'Structural Basement & Columns', date: 'Target: Feb 24', progress: 0 },
                { id: 3, name: 'Slabs Casting & Brickwork', date: 'Target: May 26', progress: 0 },
                { id: 4, name: 'Finishing & Handover', date: 'Target: Dec 26', progress: 0 },
            ];

            calculatedPhases = currentPhases.map(ph => {
                if (ph.id < numericPhase) return { ...ph, progress: 100 };
                if (ph.id === numericPhase) return { ...ph, progress: ph.progress >= 100 ? 0 : ph.progress };
                return { ...ph, progress: 0 };
            });

            try {
                localStorage.setItem(`project_phase_${projectId}`, String(numericPhase));
                localStorage.setItem(`project_milestones_${projectId}`, JSON.stringify(calculatedPhases));
            } catch (e) {}

            return {
                ...p,
                progressPhase: numericPhase,
                progress_phase: numericPhase,
                phases: calculatedPhases
            };
        }));

        try {
            await supabase.from('projects').update({ progress_phase: numericPhase, phases: calculatedPhases }).eq('id', projectId);
        } catch (err) {
            console.warn("Supabase progress_phase update note:", err);
        }
    };

    const updateProjectMilestones = async (projectId, updatedPhases) => {
        const firstIncomplete = (updatedPhases || []).find(ph => ph.progress < 100);
        const derivedPhase = firstIncomplete ? firstIncomplete.id : ((updatedPhases && updatedPhases.length) ? updatedPhases.length + 1 : 1);

        setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            return {
                ...p,
                phases: updatedPhases,
                progressPhase: derivedPhase,
                progress_phase: derivedPhase
            };
        }));
        
        try {
            localStorage.setItem(`project_milestones_${projectId}`, JSON.stringify(updatedPhases));
            localStorage.setItem(`project_phase_${projectId}`, String(derivedPhase));
        } catch (e) {
            console.error("Error saving milestones to localStorage:", e);
        }

        try {
            await supabase.from('projects').update({ phases: updatedPhases, progress_phase: derivedPhase }).eq('id', projectId);
        } catch (err) {
            console.warn("Supabase phase update note:", err);
        }
    };

    const resolveTicket = async (id) => {
        setTickets(prev => {
            const updated = prev.map(t => t.id === id ? { ...t, status: 'Resolved' } : t);
            try { localStorage.setItem('all_tickets', JSON.stringify(updated)); } catch(e) {}
            return updated;
        });
        try {
            await supabase.from('tickets').update({ status: 'Resolved' }).eq('id', id);
        } catch(err) {}
    };

    const deleteTicket = async (id) => {
        setTickets(prev => {
            const updated = prev.filter(t => t.id !== id);
            try { localStorage.setItem('all_tickets', JSON.stringify(updated)); } catch(e) {}
            return updated;
        });
        try {
            await supabase.from('tickets').delete().eq('id', id);
        } catch(err) {
            console.warn("Supabase ticket delete note:", err);
        }
    };

    const replyToTicket = async (ticketId, replyMsg, resolve = true, sender = 'admin') => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        let msgs = [];
        try {
            if (ticket.message && ticket.message.trim().startsWith('[')) {
                msgs = JSON.parse(ticket.message);
            } else {
                msgs = [
                    { sender: 'client', text: ticket.message || 'Support inquiry', date: ticket.date }
                ];
                if (ticket.adminReply || ticket.admin_reply) {
                    msgs.push({ sender: 'admin', text: ticket.adminReply || ticket.admin_reply, date: ticket.date });
                }
            }
        } catch (e) {
            msgs = [{ sender: 'client', text: ticket.message || '', date: ticket.date }];
        }

        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        msgs.push({ sender, text: replyMsg, date: dateStr });

        const updatedStatus = resolve ? 'Resolved' : 'In Review';
        const serialized = JSON.stringify(msgs);

        setTickets(prev => {
            const updated = prev.map(t => t.id === ticketId ? { 
                ...t, 
                message: serialized, 
                adminReply: sender === 'admin' ? replyMsg : t.adminReply,
                admin_reply: sender === 'admin' ? replyMsg : t.admin_reply,
                status: updatedStatus 
            } : t);
            try { localStorage.setItem('all_tickets', JSON.stringify(updated)); } catch(e) {}
            return updated;
        });

        try {
            const dbPayload = {
                message: serialized,
                status: updatedStatus
            };
            
            const { error } = await supabase.from('tickets').update(dbPayload).eq('id', ticketId);
            if (error) console.warn("[DatabaseContext] Supabase ticket reply note:", error.message);
        } catch(err) {
            console.warn("[DatabaseContext] Supabase ticket reply error:", err.message);
        }
    };

    const addProject = async (newProject) => {
        return await addPublicProject({
            id: newProject.id,
            name: newProject.name,
            totalUnits: newProject.totalUnits,
            status: 'AVAILABLE',
            statusBg: '#a14000',
            location: 'Narayanganj',
            type: 'Residential'
        });
    };

    const addClientTicket = async (clientId, type, subject, message) => {
        const ticketId = `TKT-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;
        const newTicket = {
            id: ticketId,
            client_id: clientId,
            clientId,
            subject: subject || `${type} Inquiry`,
            status: 'Pending',
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            message,
            adminReply: null,
            admin_reply: null
        };
        
        // 1. Optimistic state update
        setTickets(prev => {
            const updated = [newTicket, ...prev];
            try { localStorage.setItem('all_tickets', JSON.stringify(updated)); } catch(e) {}
            return updated;
        });

        // 2. Supabase insert
        try {
            const { data, error } = await supabase.from('tickets').insert([{
                id: ticketId,
                client_id: clientId,
                subject: newTicket.subject,
                status: 'Pending',
                date: newTicket.date,
                message: message
            }]).select();
            
            if (!error && data && data.length > 0) {
                const mapped = {
                    ...data[0],
                    clientId: data[0].client_id || data[0].clientId,
                    adminReply: data[0].admin_reply || data[0].adminReply
                };
                setTickets(prev => prev.map(t => t.id === ticketId ? mapped : t));
            }
        } catch(err) {
            console.warn("Supabase ticket insertion error:", err.message);
        }
    };

    const addSiteUpdate = async (projectId, subject, message) => {
        const updateId = 'upd_' + Date.now();
        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        const formatted = {
            id: updateId,
            projectId: projectId,
            project_id: projectId,
            date: dateStr,
            title: subject,
            type: 'Announcement',
            desc: message
        };

        setSiteUpdates(prev => {
            const updated = [formatted, ...prev];
            try { localStorage.setItem('all_site_updates', JSON.stringify(updated)); } catch(e) {}
            return updated;
        });

        try {
            const dbPayload = {
                id: updateId,
                project_id: projectId,
                date: dateStr,
                title: subject,
                type: 'Announcement',
                "desc": message
            };
            const { error } = await supabase.from('site_updates').insert([dbPayload]);
            if (error) console.warn("[DatabaseContext] Supabase addSiteUpdate note:", error.message);
        } catch(err) {
            console.warn("[DatabaseContext] Supabase addSiteUpdate error:", err.message);
        }
    };

    const addLead = async (lead) => {
        const newLead = {
            ...lead,
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };
        const { data, error } = await supabase.from('leads').insert([newLead]).select();
        if (!error && data) setLeads(prev => [data[0], ...prev]);
    };

    const updateLeadStatus = async (id, newStatus) => {
        const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
            
            if (newStatus === 'Converted') {
                const lead = leads.find(l => l.id === id);
                if (lead) {
                    const newApp = {
                        name: lead.name,
                        unit: lead.interest || 'Pending Unit Assignment',
                        stage: 'KYC Verification',
                        status: 'Pending',
                        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    };
                    const { data: appData, error: appErr } = await supabase.from('applications').insert([newApp]).select();
                    if (!appErr && appData) {
                        setApplications(prev => [appData[0], ...prev]);
                    }
                }
            }
        }
    };

    const updateLead = async (id, updates) => {
        const { error } = await supabase.from('leads').update(updates).eq('id', id);
        if (!error) {
            setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
            return true;
        }
        return false;
    };

    const addClient = async (client, projectId = null) => {
        const { data, error } = await supabase.from('clients').insert([client]).select();
        if (!error && data) {
            setClients(prev => [data[0], ...prev]);
            
            if (projectId && projectId !== 'all') {
                const newProperty = {
                    client_id: data[0].id,
                    project_id: projectId,
                    unit_name: 'Pending Assignment',
                    location: 'TBD',
                    area: '0 sqft',
                    handover_date: 'TBD',
                    total_valuation: '0',
                    total_paid: '0',
                    other_charges: '0',
                    due_balance: '0'
                };
                const { data: propData, error: propError } = await supabase.from('properties').insert([newProperty]).select();
                if (!propError && propData) {
                    setProperties(prev => [...prev, {
                        ...propData[0],
                        clientId: propData[0].client_id,
                        projectId: propData[0].project_id,
                        unitName: propData[0].unit_name,
                        handoverDate: propData[0].handover_date,
                        totalValuation: propData[0].total_valuation,
                        totalPaid: propData[0].total_paid,
                        otherCharges: propData[0].other_charges,
                        dueBalance: propData[0].due_balance
                    }]);
                }
            }
        }
    };

    const updateClient = async (id, updatedClient) => {
        const { error } = await supabase.from('clients').update(updatedClient).eq('id', id);
        if (!error) setClients(prev => prev.map(c => c.id === id ? { ...c, ...updatedClient } : c));
    };

    const updateProperty = async (id, updatedProperty) => {
        // Map back to snake_case
        const dbPayload = {
            ...(updatedProperty.unitName && { unit_name: updatedProperty.unitName }),
            ...(updatedProperty.location && { location: updatedProperty.location }),
            ...(updatedProperty.area && { area: updatedProperty.area }),
            ...(updatedProperty.handoverDate && { handover_date: updatedProperty.handoverDate }),
            ...(updatedProperty.totalValuation && { total_valuation: updatedProperty.totalValuation }),
            ...(updatedProperty.totalPaid && { total_paid: updatedProperty.totalPaid }),
            ...(updatedProperty.otherCharges && { other_charges: updatedProperty.otherCharges }),
            ...(updatedProperty.dueBalance && { due_balance: updatedProperty.dueBalance }),
        };
        const { error } = await supabase.from('properties').update(dbPayload).eq('id', id);
        if (!error) setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updatedProperty } : p));
    };

    const addInstallment = async (installmentData) => {
        const dbPayload = {
            property_id: installmentData.propertyId,
            installment: installmentData.installment,
            due_date: installmentData.dueDate,
            amount: installmentData.amount,
            status: installmentData.status,
            status_pill: installmentData.statusPill,
            active: installmentData.active
        };
        const { data, error } = await supabase.from('installments').insert([dbPayload]).select();
        if (!error && data) setInstallments(prev => [...prev, { ...data[0], propertyId: data[0].property_id, dueDate: data[0].due_date, statusPill: data[0].status_pill }]);
    };

    const updateInstallment = async (id, updatedInstallment) => {
        const dbPayload = {
            ...(updatedInstallment.installment && { installment: updatedInstallment.installment }),
            ...(updatedInstallment.dueDate && { due_date: updatedInstallment.dueDate }),
            ...(updatedInstallment.amount && { amount: updatedInstallment.amount }),
            ...(updatedInstallment.status && { status: updatedInstallment.status }),
            ...(updatedInstallment.statusPill && { status_pill: updatedInstallment.statusPill }),
            ...(updatedInstallment.active !== undefined && { active: updatedInstallment.active }),
        };
        const { error } = await supabase.from('installments').update(dbPayload).eq('id', id);
        if (!error) {
            setInstallments(prev => prev.map(i => i.id === id ? { ...i, ...updatedInstallment } : i));

            // If marked Paid, auto update property totalPaid and dueBalance, and insert transaction record
            if (updatedInstallment.status === 'Paid') {
                const instObj = installments.find(i => i.id === id);
                if (instObj && instObj.propertyId) {
                    const prop = properties.find(p => p.id === instObj.propertyId);
                    if (prop) {
                        const cleanFloat = (val) => {
                            if (!val) return 0;
                            const clean = String(val).replace(/[^0-9.]/g, '');
                            const parsed = parseFloat(clean);
                            return isNaN(parsed) ? 0 : parsed;
                        };

                        const numericPayment = cleanFloat(updatedInstallment.amount || instObj.amount);
                        const currentPaid = cleanFloat(prop.totalPaid);
                        const currentDue = cleanFloat(prop.dueBalance);

                        const newPaid = (currentPaid + numericPayment).toLocaleString('en-IN');
                        const newDue = Math.max(0, currentDue - numericPayment).toLocaleString('en-IN');

                        // 1. Update Property
                        const propPayload = {
                            total_paid: newPaid,
                            due_balance: newDue
                        };
                        await supabase.from('properties').update(propPayload).eq('id', prop.id);
                        setProperties(prev => prev.map(p => p.id === prop.id ? { ...p, totalPaid: newPaid, dueBalance: newDue } : p));

                        // 2. Add Transaction Record
                        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                        await addTransaction({
                            propertyId: prop.id,
                            date: dateStr,
                            type: `Bank Transfer (${updatedInstallment.installment || instObj.installment || 'Installment'} Payment)`,
                            amount: (updatedInstallment.amount || instObj.amount)
                        });
                    }
                }
            }
        }
    };

    const deleteInstallment = async (id) => {
        const { error } = await supabase.from('installments').delete().eq('id', id);
        if (!error) setInstallments(prev => prev.filter(i => i.id !== id));
    };

    const addTransaction = async (transactionData) => {
        const dbPayload = {
            property_id: transactionData.propertyId,
            date: transactionData.date,
            type: transactionData.type,
            amount: transactionData.amount
        };
        const { data, error } = await supabase.from('transactions').insert([dbPayload]).select();
        if (!error && data) setTransactions(prev => [{ ...data[0], propertyId: data[0].property_id }, ...prev]);
    };

    const addPublicProject = async (newProj) => {
        const id = newProj.id || `p_${Date.now()}`;
        const formatted = {
            id,
            name: newProj.name,
            status: newProj.status || 'AVAILABLE',
            statusBg: newProj.statusBg || '#a14000',
            location: newProj.location || 'Narayanganj',
            type: newProj.type || 'Residential',
            image: newProj.image || '/Frontend/Projects/Reliance_Zenith_Towers.svg',
            gallery: newProj.gallery || [newProj.image || '/Frontend/Projects/Reliance_Zenith_Towers.svg'],
            description: newProj.description || '',
            price: newProj.price || 'Contact for Price',
            area: newProj.area || '1,200 - 2,500 sqft',
            mapLink: newProj.mapLink || newProj.map_link || '',
            nearbyHospitals: newProj.nearbyHospitals || '',
            nearbySchools: newProj.nearbySchools || '',
            nearbyColleges: newProj.nearbyColleges || '',
            nearbyMarkets: newProj.nearbyMarkets || ''
        };

        // 1. Update publicProjects state and localStorage
        setPublicProjects(prev => {
            const updated = [...prev.filter(p => p.id !== id), formatted];
            try { localStorage.setItem('all_public_projects', JSON.stringify(updated)); } catch(e) {}
            return updated;
        });

        // 2. Update projects state (for admin management)
        setProjects(prev => {
            if (prev.some(p => p.id === id)) return prev.map(p => p.id === id ? { ...p, name: newProj.name } : p);
            return [...prev, {
                id,
                name: newProj.name,
                progressPhase: 1,
                totalUnits: parseInt(newProj.totalUnits) || 20,
                phases: [
                    { id: 1, name: 'Piling & Foundation', date: 'Target: Q1 2026', progress: 0 },
                    { id: 2, name: 'Structural Basement & Columns', date: 'Target: Q2 2026', progress: 0 },
                    { id: 3, name: 'Slabs Casting & Brickwork', date: 'Target: Q3 2026', progress: 0 },
                    { id: 4, name: 'Finishing & Handover', date: 'Target: Q4 2026', progress: 0 },
                ]
            }];
        });

        // 3. Update systemSettings projectsMeta
        const updatedMeta = {
            ...(systemSettings?.projectsMeta || {}),
            [id]: {
                image: formatted.image,
                gallery: formatted.gallery,
                mapLink: formatted.mapLink,
                nearbyHospitals: formatted.nearbyHospitals,
                nearbySchools: formatted.nearbySchools,
                nearbyColleges: formatted.nearbyColleges,
                nearbyMarkets: formatted.nearbyMarkets
            }
        };
        const updatedSettings = { ...(systemSettings || {}), projectsMeta: updatedMeta };
        setSystemSettings(updatedSettings);
        try { localStorage.setItem('system_settings', JSON.stringify(updatedSettings)); } catch(e) {}

        // 4. Save into Supabase tables `projects`, `public_projects`, and `system_settings`
        try {
            const projectsPayload = {
                id,
                name: newProj.name,
                progress_phase: 1,
                phases: [
                    { id: 1, name: 'Piling & Foundation', date: 'Target: Q1 2026', progress: 0 },
                    { id: 2, name: 'Structural Basement & Columns', date: 'Target: Q2 2026', progress: 0 },
                    { id: 3, name: 'Slabs Casting & Brickwork', date: 'Target: Q3 2026', progress: 0 },
                    { id: 4, name: 'Finishing & Handover', date: 'Target: Q4 2026', progress: 0 },
                ]
            };
            const { error: projErr } = await supabase.from('projects').upsert([projectsPayload]);
            if (projErr) console.warn("[DatabaseContext] Supabase projects upsert note:", projErr.message);

            const publicPayload = {
                id,
                name: newProj.name,
                status: newProj.status || 'AVAILABLE',
                status_bg: newProj.statusBg || '#a14000',
                location: newProj.location || 'Narayanganj',
                type: newProj.type || 'Residential',
                image: newProj.image || '/Frontend/Projects/Reliance_Zenith_Towers.svg',
                description: newProj.description || '',
                price: newProj.price || 'Contact for Price',
                area: newProj.area || '1,200 - 2,500 sqft',
                map_link: newProj.mapLink || newProj.map_link || '',
                nearby_hospitals: newProj.nearbyHospitals || '',
                nearby_schools: newProj.nearbySchools || '',
                nearby_colleges: newProj.nearbyColleges || '',
                nearby_markets: newProj.nearbyMarkets || ''
            };
            const { error: pubErr } = await supabase.from('public_projects').upsert([publicPayload]);
            if (pubErr) console.warn("[DatabaseContext] Supabase public_projects upsert note:", pubErr.message);

            await supabase.from('system_settings').upsert([{ id: 'global', settings: updatedSettings }]);
        } catch (err) {
            console.error("[DatabaseContext] Error inserting new project to Supabase:", err);
        }

        return true;
    };

    const updatePublicProject = async (id, updatedProj) => {
        // Update public projects state
        setPublicProjects(prev => {
            const updated = prev.map(p => p.id === id ? { 
                ...p, 
                ...updatedProj, 
                map_link: updatedProj.mapLink || updatedProj.map_link,
                mapLink: updatedProj.mapLink || updatedProj.map_link
            } : p);
            try { localStorage.setItem('all_public_projects', JSON.stringify(updated)); } catch(e) {}
            return updated;
        });

        // Update projects state
        setProjects(prev => prev.map(p => p.id === id ? { ...p, name: updatedProj.name || p.name } : p));

        // Save image, gallery, map link and nearby amenities metadata inside system_settings
        const currentMeta = systemSettings?.projectsMeta || {};
        const updatedSettings = {
            ...systemSettings,
            projectsMeta: {
                ...currentMeta,
                [id]: {
                    ...(currentMeta[id] || {}),
                    image: updatedProj.image,
                    gallery: updatedProj.gallery,
                    mapLink: updatedProj.mapLink || updatedProj.map_link,
                    nearbyHospitals: updatedProj.nearbyHospitals,
                    nearbySchools: updatedProj.nearbySchools,
                    nearbyColleges: updatedProj.nearbyColleges,
                    nearbyMarkets: updatedProj.nearbyMarkets
                }
            }
        };
        await updateSystemSettings(updatedSettings);

        // Standard save (upsert) to public_projects (safely excludes non-existent columns)
        try {
            const dbPayload = {
                id: id,
                name: updatedProj.name,
                status: updatedProj.status,
                status_bg: updatedProj.statusBg,
                location: updatedProj.location,
                type: updatedProj.type,
                image: updatedProj.image,
                description: updatedProj.description,
                price: updatedProj.price,
                area: updatedProj.area
            };
            const { error } = await supabase.from('public_projects').upsert([dbPayload]);
            if (error) console.warn("[DatabaseContext] Supabase upsert note:", error.message);
        } catch (err) {
            console.warn("[DatabaseContext] Supabase update error:", err.message);
        }
    };

    const advanceApplicationStage = async (id) => {
        const app = applications.find(a => a.id === id);
        if (!app) return;
        
        const stages = ['KYC Verification', 'Financial Review', 'Management Approval', 'Completed'];
        const statuses = ['Pending', 'In Progress', 'Action Required', 'Approved'];
        const currentIndex = stages.indexOf(app.stage);
        
        if (currentIndex < stages.length - 1) {
            const newStage = stages[currentIndex + 1];
            const newStatus = statuses[currentIndex + 1];
            
            const { error } = await supabase.from('applications').update({ stage: newStage, status: newStatus }).eq('id', id);
            if (!error) {
                setApplications(prev => prev.map(a => a.id === id ? { ...a, stage: newStage, status: newStatus } : a));
            }
        }
    };

    const approveAllApplications = async () => {
        // Simplified for bulk update
        const { error } = await supabase.from('applications').update({ stage: 'Completed', status: 'Approved' }).neq('status', 'Approved');
        if (!error) {
            setApplications(prev => prev.map(app => ({ ...app, stage: 'Completed', status: 'Approved' })));
        }
    };

    const parsePriceToValueString = (priceStr) => {
        if (!priceStr) return '0';
        let clean = priceStr.replace(/[৳\s,]/g, '');
        if (clean.toLowerCase().includes('cr')) {
            const val = parseFloat(clean.toLowerCase().replace('cr', '')) * 10000000;
            return String(val);
        } else if (clean.toLowerCase().includes('lakh') || clean.toLowerCase().includes('lk')) {
            const val = parseFloat(clean.toLowerCase().replace(/lakh|lk/g, '')) * 100000;
            return String(val);
        }
        return clean;
    };

    const onboardClient = async (applicationId, projectId = 'p1', installmentConfig = null, unitName = null) => {
        const app = applications.find(a => a.id === applicationId);
        if (!app) return;

        // Fetch lead detail matching by name to fetch real email and phone credentials if they aren't parsed on app
        const { data: leadData } = await supabase.from('leads').select('*').eq('name', app.name).maybeSingle();

        const newClient = {
            name: app.name,
            email: app.email || leadData?.email || `${app.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            phone: app.phone || leadData?.phone || '+880 1800-000000',
            status: 'Active'
        };

        const { data: clientData, error: clientError } = await supabase.from('clients').insert([newClient]).select();
        if (clientError || !clientData) return;

        const newClientId = clientData[0].id;

        // Look up flat size and price to auto-populate property details, mark flat as SOLD
        let flatSize = '1,500 sqft';
        let flatPrice = '0';
        try {
            const storedFlats = localStorage.getItem('flats_project_' + projectId);
            if (storedFlats) {
                const flats = JSON.parse(storedFlats);
                const updatedFlats = flats.map(f => {
                    if (f.unit === unitName) {
                        flatSize = f.size || '1,500 sqft';
                        flatPrice = parsePriceToValueString(f.price);
                        return { ...f, status: 'SOLD' };
                    }
                    return f;
                });
                localStorage.setItem('flats_project_' + projectId, JSON.stringify(updatedFlats));
            }
        } catch(e) {
            console.warn("Error marking flat sold in onboardClient:", e);
        }
        
        const newProperty = {
            client_id: newClientId,
            project_id: projectId,
            unit_name: unitName || app.unit || 'Not specified',
            location: 'Main Block',
            area: flatSize,
            handover_date: 'Dec 2026',
            total_valuation: flatPrice,
            total_paid: '0',
            other_charges: '0',
            due_balance: flatPrice
        };

        const { data: propData, error: propErr } = await supabase.from('properties').insert([newProperty]).select();
        if (propErr || !propData) return;

        const insertedProperty = propData[0];

        // Generate installments if config is present and totalAmount > 0
        if (installmentConfig && installmentConfig.numInstallments && installmentConfig.totalAmount) {
            const { numInstallments, freq, startDate, totalAmount } = installmentConfig;
            const valuation = parseFloat(String(totalAmount).replace(/,/g, '')) || 0;
            if (valuation > 0) {
                const installmentAmount = Math.round(valuation / numInstallments);
                let currentD = new Date(startDate);
                
                const listToInsert = [];
                for (let i = 1; i <= numInstallments; i++) {
                    const installmentName = `${i}${i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th'} Installment`;
                    const dateStr = currentD.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                    
                    listToInsert.push({
                        property_id: insertedProperty.id,
                        installment: installmentName,
                        due_date: dateStr,
                        amount: installmentAmount.toLocaleString('en-IN'),
                        status: 'Pending',
                        status_pill: 'bg-amber-100 text-amber-700',
                        active: i === 1
                    });

                    if (freq === 'Monthly') {
                        currentD.setMonth(currentD.getMonth() + 1);
                    } else if (freq === 'Quarterly') {
                        currentD.setMonth(currentD.getMonth() + 3);
                    } else if (freq === 'Semi-Annually') {
                        currentD.setMonth(currentD.getMonth() + 6);
                    }
                }
                const { data: instData } = await supabase.from('installments').insert(listToInsert).select();
                if (instData) {
                    setInstallments(prev => [...prev, ...instData.map(i => ({ ...i, propertyId: i.property_id, dueDate: i.due_date, statusPill: i.status_pill }))]);
                }
            }
        }

        await supabase.from('applications').delete().eq('id', applicationId);
        
        setClients(prev => [clientData[0], ...prev]);
        setProperties(prev => [...prev, {
            ...insertedProperty,
            clientId: insertedProperty.client_id,
            projectId: insertedProperty.project_id,
            unitName: insertedProperty.unit_name,
            handoverDate: insertedProperty.handover_date,
            totalValuation: insertedProperty.total_valuation,
            totalPaid: insertedProperty.total_paid,
            otherCharges: insertedProperty.other_charges,
            dueBalance: insertedProperty.due_balance
        }]);
        setApplications(prev => prev.filter(a => a.id !== applicationId));
    };

    const addApplication = async (newApp) => {
        const { data, error } = await supabase.from('applications').insert([newApp]).select();
        if (!error && data) {
            const app = data[0];
            let parsedApp = app;
            try {
                if (app.unit && app.unit.startsWith('{')) {
                    const parsed = JSON.parse(app.unit);
                    parsedApp = {
                        ...app,
                        email: parsed.email,
                        phone: parsed.phone,
                        unit: parsed.unit || 'Not specified'
                    };
                }
            } catch(e) {}
            setApplications(prev => [parsedApp, ...prev]);
        } else if (error) {
            console.error("Error adding application:", error.message);
        }
    };

    const rejectApplication = async (applicationId) => {
        const { error } = await supabase.from('applications').delete().eq('id', applicationId);
        if (!error) {
            setApplications(prev => prev.filter(a => a.id !== applicationId));
        } else {
            console.error("Error rejecting application:", error.message);
            showToast("Error rejecting client request: " + error.message, "error");
        }
    };

    const deleteClient = async (id) => {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (!error) {
            setClients(prev => prev.filter(c => c.id !== id));
            setProperties(prev => prev.filter(p => p.clientId !== id));
            setTickets(prev => prev.filter(t => t.clientId !== id));
        } else {
            console.error("Error deleting client:", error.message);
            showToast("Error deleting client: " + error.message, "error");
        }
    };

    const deleteLead = async (id) => {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (!error) {
            setLeads(prev => prev.filter(l => l.id !== id));
        } else {
            console.error("Error deleting lead:", error.message);
            showToast("Error deleting lead: " + error.message, "error");
        }
    };

    const deletePublicProject = async (id) => {
        setPublicProjects(prev => {
            const updated = prev.filter(p => p.id !== id);
            try { localStorage.setItem('all_public_projects', JSON.stringify(updated)); } catch(e) {}
            return updated;
        });

        setProjects(prev => prev.filter(p => p.id !== id));

        try {
            await supabase.from('public_projects').delete().eq('id', id);
            await supabase.from('projects').delete().eq('id', id);
        } catch (err) {
            console.warn("[DatabaseContext] Supabase delete error:", err.message);
        }
    };

    const addProjectPhoto = async (projectId, dataUrl, caption = '') => {
        const photoId = 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        
        const newPhoto = {
            id: photoId,
            project_id: projectId,
            url: dataUrl,
            caption: caption || 'Project Photo',
            date: dateStr
        };

        const formatted = {
            id: photoId,
            projectId: projectId,
            url: dataUrl,
            caption: caption || 'Project Photo',
            date: dateStr
        };

        setProjectPhotos(prev => {
            const updated = [formatted, ...prev];
            try { localStorage.setItem('all_project_photos', JSON.stringify(updated)); } catch(e) {}
            return updated;
        });

        try {
            await supabase.from('project_photos').insert([newPhoto]);
        } catch(err) {
            console.warn("Supabase photo insert note:", err);
        }
    };

    const deleteProjectPhoto = async (photoId) => {
        setProjectPhotos(prev => {
            const updated = prev.filter(p => p.id !== photoId);
            try { localStorage.setItem('all_project_photos', JSON.stringify(updated)); } catch(e) {}
            return updated;
        });

        try {
            await supabase.from('project_photos').delete().eq('id', photoId);
        } catch(err) {
            console.warn("Supabase photo delete note:", err);
        }
    };

    const value = useMemo(() => ({
        deleteClient,
        deleteLead,
        deletePublicProject,
        deleteInstallment,
        projectPhotos,
        addProjectPhoto,
        deleteProjectPhoto,
        clients,
        leads,
        applications,
        projects,
        properties,
        installments,
        transactions,
        siteUpdates,
        tickets,
        updateProjectPhase,
        updateProjectMilestones,
        resolveTicket,
        deleteTicket,
        replyToTicket,
        addClientTicket,
        addSiteUpdate,
        addLead,
        updateLeadStatus,
        updateLead,
        addClient,
        updateClient,
        updateProperty,
        addInstallment,
        updateInstallment,
        addTransaction,
        addProject,
        publicProjects,
        addPublicProject,
        updatePublicProject,
        advanceApplicationStage,
        approveAllApplications,
        onboardClient,
        addApplication,
        rejectApplication,
        systemSettings,
        updateSystemSettings,
        loading
    }), [
        clients, leads, applications, projects, properties,
        installments, transactions, siteUpdates, tickets,
        projectPhotos, publicProjects, systemSettings, loading
    ]);

    return (
        <DatabaseContext.Provider value={value}>
            {children}
        </DatabaseContext.Provider>
    );
};

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if (!context) throw new Error("useDatabase must be used within a DatabaseProvider");
    return context;
};
