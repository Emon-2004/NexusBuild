import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import {
    LayoutDashboard, Users, BookOpen, HardHat,
    Bell, LogOut, Building2, Search, UserPlus, FileText, Calendar, Settings, Grid, X, Check, Globe, MessageSquare, Menu
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { AdminDataProvider, useAdminData } from '../../Context/AdminDataContext';
import { useDatabase } from '../../Context/DatabaseContext';
import { DEFAULT_SYSTEM_SETTINGS } from '../../config/defaultSettings';

const NAV_LINKS = [
    { to: '/admin',            label: 'Dashboard',        icon: LayoutDashboard, end: true },
    { to: '/admin/project-details', label: 'Project Details', icon: Building2 },
    { to: '/admin/leads',      label: 'Leads',            icon: UserPlus },
    { to: '/admin/onboarding', label: 'Onboarding',       icon: FileText },
    { to: '/admin/management',  label: 'Client Management', icon: Users },
    { to: '/admin/financials', label: 'Financial Ledgers',icon: BookOpen },
    { to: '/admin/installments',label: 'Installments',     icon: Calendar },
    { to: '/admin/progress',   label: 'Site Progress',    icon: HardHat },
    { to: '/admin/website-projects', label: 'Website Projects', icon: Globe },
    { to: '/admin/tickets',     label: 'Support Tickets',  icon: MessageSquare },
];

const AdminLayoutContent = () => {
    const { signOut } = useAuth();
    const { systemSettings } = useDatabase();
    const { projects, activeProject, setActiveProject, addProject, leads, applications, transactions, clients, properties, tickets } = useAdminData();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [readAdminNotifIds, setReadAdminNotifIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('admin_read_notifs') || '[]');
        } catch(e) {
            return [];
        }
    });
    const [isProjectSwitcherOpen, setIsProjectSwitcherOpen] = useState(false);
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
    const [newProjectForm, setNewProjectForm] = useState({ id: '', name: '', totalUnits: '' });
    
    const notifRef = useRef(null);
    const searchRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const term = searchTerm.trim().toLowerCase();
    const searchResults = term.length > 0 ? [
        ...clients.filter(c => (c.name && c.name.toLowerCase().includes(term)) || (c.phone && c.phone.includes(term)) || (c.email && c.email.toLowerCase().includes(term))).map(c => ({
            id: `client-${c.id}`,
            title: c.name,
            subtitle: `Client • Phone: ${c.phone || 'N/A'}`,
            type: 'Client',
            badge: 'bg-blue-100 text-blue-700',
            url: '/admin/management'
        })),
        ...properties.filter(p => p.unitName && p.unitName.toLowerCase().includes(term)).map(p => ({
            id: `prop-${p.id}`,
            title: p.unitName,
            subtitle: `Unit • Due Balance: ৳${p.dueBalance}`,
            type: 'Unit',
            badge: 'bg-purple-100 text-purple-700',
            url: '/admin/financials'
        })),
        ...projects.filter(pr => pr.name && pr.name.toLowerCase().includes(term)).map(pr => ({
            id: `proj-${pr.id}`,
            title: pr.name,
            subtitle: `Project • ${pr.totalUnits || pr.total_units || 0} Total Units`,
            type: 'Project',
            badge: 'bg-[#1A4B9C] text-white',
            url: '/admin/website-projects'
        })),
        ...leads.filter(l => (l.name && l.name.toLowerCase().includes(term)) || (l.phone && l.phone.includes(term))).map(l => ({
            id: `lead-${l.id}`,
            title: l.name,
            subtitle: `Lead • Status: ${l.status}`,
            type: 'Lead',
            badge: 'bg-emerald-100 text-emerald-700',
            url: '/admin/leads'
        }))
    ] : [];

    const adminNotifications = [
        // 1. Pending Support Tickets / Client Replies -> /admin/tickets
        ...(tickets || []).filter(t => {
            try {
                if (t.message && t.message.trim().startsWith('[')) {
                    const msgs = JSON.parse(t.message);
                    return msgs.length > 0 && msgs[msgs.length - 1].sender === 'client';
                }
            } catch(e) {}
            return t.status !== 'Resolved';
        }).map(t => {
            const client = clients.find(c => c.id === t.clientId);
            let lastText = t.message || '';
            try {
                if (t.message && t.message.trim().startsWith('[')) {
                    const msgs = JSON.parse(t.message);
                    const clientMsgs = msgs.filter(m => m.sender === 'client');
                    if (clientMsgs.length > 0) lastText = clientMsgs[clientMsgs.length - 1].text;
                }
            } catch(e) {}

            return {
                id: `admin-tkt-${t.id}`,
                title: `Client Message: ${t.subject || 'Inquiry'}`,
                desc: `From ${client?.name || 'Client'}: "${lastText.slice(0, 45)}${lastText.length > 45 ? '...' : ''}"`,
                date: t.date || 'Today',
                badge: 'bg-blue-100 text-blue-700',
                url: '/admin/tickets'
            };
        }),
        // 2. Pending Applications / Onboarding -> /admin/onboarding
        ...(applications || []).filter(a => a.status === 'Pending').map(a => ({
            id: `admin-app-${a.id}`,
            title: 'New Client Application',
            desc: `Application for ${a.unit || 'Unit'} - Status: ${a.stage || 'Pending'}`,
            date: a.date || 'Recent',
            badge: 'bg-purple-100 text-purple-700',
            url: '/admin/onboarding'
        })),
        // 3. New Public Leads -> /admin/leads
        ...(leads || []).filter(l => l.status === 'New').map(l => ({
            id: `admin-lead-${l.id}`,
            title: `New Lead: ${l.name || 'Inquiry'}`,
            desc: `Phone: ${l.phone || 'N/A'} - Interest: ${l.interest || 'Property'}`,
            date: l.date || 'Recent',
            badge: 'bg-emerald-100 text-emerald-700',
            url: '/admin/leads'
        })),
        // 4. Property Due Balances -> /admin/financials
        ...(properties || []).filter(p => p.dueBalance && p.dueBalance !== '0').slice(0, 4).map(p => ({
            id: `admin-due-${p.id}`,
            title: `Due Balance Alert: ${p.unitName}`,
            desc: `Outstanding Net Due: ৳${p.dueBalance}`,
            date: 'Financials',
            badge: 'bg-amber-100 text-amber-700',
            url: '/admin/financials'
        }))
    ];

    const handleLogout = async () => { await signOut(); navigate('/admin/login'); };

    const handleAddProjectSubmit = async (e) => {
        e.preventDefault();
        try {
            const success = await addProject(newProjectForm);
            if (success) {
                setIsAddProjectOpen(false);
                setNewProjectForm({ id: '', name: '', totalUnits: '' });
                setActiveProject(newProjectForm.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Auto-close sidebar on navigation (mobile/tablet sizes)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsSidebarOpen(false);
    }, [navigate]);

    return (
        <div className="flex h-screen overflow-hidden font-sans bg-[#F3F4F6] print:block print:h-auto print:overflow-visible relative">
            
            {/* Mobile Sidebar Overlay Backdrop */}
            {isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)} 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[55] lg:hidden"
                />
            )}

            {/* ══ SIDEBAR (260px) ══════════════════════════════════════════════ */}
            <aside 
                style={{ backgroundColor: systemSettings?.primaryColor || '#1A4B9C' }}
                className={`
                    fixed inset-y-0 left-0 z-[60] w-[260px] flex-shrink-0 flex flex-col text-white print:hidden transition-all duration-300 ease-in-out
                    lg:static lg:translate-x-0
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                
                {/* Header Logo Area */}
                <div className="p-6 pb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#1A4B9C] flex-shrink-0 overflow-hidden shadow-xs">
                            {systemSettings?.companyLogo ? (
                                <img src={systemSettings.companyLogo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Building2 size={26} />
                            )}
                        </div>
                        <div>
                            <div className="text-white font-bold text-sm sm:text-base leading-none">{systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName}</div>
                            <div className="text-blue-200 text-[10px] mt-0.5 uppercase tracking-wider">Admin Panel</div>
                        </div>
                        <button 
                            onClick={() => setIsSidebarOpen(false)} 
                            className="lg:hidden text-blue-200 hover:text-white p-1 ml-auto cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Navigation Menu Items */}
                <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
                    {NAV_LINKS.map(({ to, label, icon: Icon, end }) => {
                        const displayLabel = (label === 'Project Details' && activeProject !== 'all')
                            ? `Project Details`
                            : label;
                        const subTag = (label === 'Project Details' && activeProject !== 'all')
                            ? projects.find(p => p.id === activeProject)?.name
                            : null;

                        return (
                            <NavLink key={to} to={to} end={end} className="no-underline block">
                                {({ isActive }) => (
                                    <div className={`flex items-center justify-between px-6 py-2.5 transition-colors ${
                                        isActive && to !== '#'
                                            ? 'bg-[#153B7C] text-white border-l-4 border-white' 
                                            : 'text-blue-100 border-l-4 border-transparent hover:bg-[#153B7C] hover:text-white'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            <Icon size={18} className={isActive && to !== '#' ? 'text-white' : 'text-blue-200'} />
                                            <span className="text-sm font-medium">{displayLabel}</span>
                                        </div>
                                        {subTag && (
                                            <span className="text-[9px] bg-blue-900/60 text-blue-200 px-1.5 py-0.5 rounded font-bold max-w-[80px] truncate">
                                                {subTag}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="mt-auto">
                    <div className="px-4 mb-2">
                        <button onClick={() => setIsProjectSwitcherOpen(true)} className="w-full flex flex-col items-center justify-center py-2 px-3 bg-[#153B7C] text-white rounded text-xs font-medium hover:bg-[#0E2856] transition-colors shadow-sm border border-[#1A4B9C] cursor-pointer">
                            <div className="flex items-center gap-1.5 font-bold">
                                <Grid size={14} /> 
                                <span>{activeProject === 'all' ? 'All Projects Overview' : (projects.find(p => p.id === activeProject)?.name || 'Switch Project')}</span>
                            </div>
                            <span className="text-[9px] text-blue-200 mt-0.5 font-medium">Click to switch scope</span>
                        </button>
                    </div>
                    <div className="flex items-center justify-between px-6 py-4 bg-[#113166] text-blue-200 text-sm">
                        <NavLink to="/admin/settings" className="flex items-center gap-2 hover:text-white transition-colors">
                            <Settings size={16} /> Settings
                        </NavLink>
                        <button onClick={handleLogout} className="flex items-center gap-2 hover:text-white transition-colors">
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* ══ MAIN AREA ════════════════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col overflow-hidden print:block print:h-auto print:overflow-visible">
                
                {/* Top Header (70px) */}
                <header className="h-[70px] flex-shrink-0 bg-white border-b border-[#E2E8F0] px-4 lg:px-8 flex items-center justify-between z-40 relative print:hidden">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsSidebarOpen(true)} 
                            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer flex-shrink-0"
                        >
                            <Menu size={20} />
                        </button>
                        <div ref={searchRef} className="relative w-[150px] sm:w-[280px] md:w-[350px] lg:w-[450px]">
                            <div className="flex items-center gap-2 sm:gap-3 bg-[#F3F4F6] rounded-lg px-3 sm:px-4 py-2 w-full">
                            <Search size={18} className="text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search clients, unit, projects..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowSearchDropdown(true);
                                }}
                                onFocus={() => setShowSearchDropdown(true)}
                                className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
                            />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Live Search Results Dropdown */}
                        {showSearchDropdown && searchTerm.trim().length > 0 && (
                            <div className="absolute left-0 top-12 w-full bg-white border border-[#E2E8F0] shadow-2xl rounded-xl p-3 text-xs z-50 max-h-80 overflow-y-auto divide-y divide-slate-100">
                                <div className="font-bold text-[11px] text-slate-400 uppercase tracking-wider pb-2 px-1">
                                    Search Results ({searchResults.length})
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {searchResults.map(res => (
                                        <div 
                                            key={res.id} 
                                            onClick={() => {
                                                navigate(res.url);
                                                setShowSearchDropdown(false);
                                                setSearchTerm('');
                                            }}
                                            className="py-2.5 px-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors flex items-center justify-between group"
                                        >
                                            <div>
                                                <div className="font-bold text-slate-800 text-sm group-hover:text-[#1A4B9C] transition-colors">{res.title}</div>
                                                <div className="text-slate-500 text-xs mt-0.5">{res.subtitle}</div>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${res.badge}`}>
                                                {res.type}
                                            </span>
                                        </div>
                                    ))}
                                    {searchResults.length === 0 && (
                                        <div className="py-6 text-center text-slate-400">
                                            No results matching "{searchTerm}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notification Bell */}
                        <div ref={notifRef} className="relative">
                            {(() => {
                                const unreadAdminCount = adminNotifications.filter(n => !readAdminNotifIds.includes(n.id)).length;
                                return (
                                    <button
                                        onClick={() => setShowNotif(p => !p)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full border border-[#1A4B9C] text-[#1A4B9C] hover:bg-blue-50 transition-colors cursor-pointer relative"
                                    >
                                        <Bell size={18} />
                                        {unreadAdminCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-bold text-[9px] flex items-center justify-center rounded-full border-2 border-white">
                                                {unreadAdminCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })()}
                            
                            {/* Live Notification Dropdown */}
                            {showNotif && (
                                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-[#E2E8F0] shadow-2xl rounded-2xl p-4 text-xs text-slate-700 z-50 divide-y divide-slate-100">
                                    <div className="font-bold text-sm text-[#1A4B9C] pb-2 flex justify-between items-center">
                                        <span>Notifications</span>
                                        <button 
                                            onClick={() => {
                                                const allIds = adminNotifications.map(n => n.id);
                                                setReadAdminNotifIds(allIds);
                                                try { localStorage.setItem('admin_read_notifs', JSON.stringify(allIds)); } catch(e) {}
                                            }}
                                            className="text-[10px] bg-blue-100 text-[#1A4B9C] px-2 py-0.5 rounded-full font-bold hover:bg-blue-200 cursor-pointer"
                                        >
                                            Mark all as read
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 py-1">
                                        {adminNotifications.map(n => {
                                            const isUnread = !readAdminNotifIds.includes(n.id);
                                            return (
                                                <div 
                                                    key={n.id} 
                                                    onClick={() => {
                                                        if (!readAdminNotifIds.includes(n.id)) {
                                                            const updated = [...readAdminNotifIds, n.id];
                                                            setReadAdminNotifIds(updated);
                                                            try { localStorage.setItem('admin_read_notifs', JSON.stringify(updated)); } catch(e) {}
                                                        }
                                                        if (n.url) navigate(n.url);
                                                        setShowNotif(false);
                                                    }}
                                                    className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors space-y-1 group ${
                                                        isUnread ? 'bg-blue-50/70 hover:bg-blue-100/70 font-semibold' : 'hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-slate-800 text-xs group-hover:text-[#1A4B9C] transition-colors flex items-center gap-1.5">
                                                            {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />}
                                                            {n.title}
                                                        </span>
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${n.badge}`}>{n.date}</span>
                                                    </div>
                                                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{n.desc}</p>
                                                </div>
                                            );
                                        })}
                                        {adminNotifications.length === 0 && (
                                            <div className="py-6 text-center text-slate-400">No new notifications.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Icon */}
                        <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-slate-800">Admin (MD)</div>
                                <div className="text-xs text-slate-500">{systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName}</div>
                            </div>
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                                <img src={`https://ui-avatars.com/api/?name=Admin&background=1A4B9C&color=fff`} alt="Profile" className="w-10 h-10 rounded-full" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 relative">
                    <Outlet />
                </main>
            </div>

            {/* Project Switcher Modal */}
            {isProjectSwitcherOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100]">
                    <div className="bg-white rounded-xl shadow-xl w-[450px] overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-slate-800">Select Project Environment</h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">Choose a project to manage its specific data.</p>
                            </div>
                            <button onClick={() => setIsProjectSwitcherOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        
                        {!isAddProjectOpen ? (
                            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                                <button 
                                    onClick={() => { setActiveProject('all'); setIsProjectSwitcherOpen(false); }}
                                    className={`w-full text-left p-4 rounded-lg border transition-colors flex justify-between items-center ${activeProject === 'all' ? 'border-[#1A4B9C] bg-[#E1EFFE]' : 'border-[#E2E8F0] hover:border-[#1A4B9C]'}`}
                                >
                                    <div>
                                        <div className={`font-bold text-sm ${activeProject === 'all' ? 'text-[#1A4B9C]' : 'text-slate-800'}`}>All Projects Overview</div>
                                        <div className="text-xs text-slate-500 mt-0.5">Master view for Super Admins</div>
                                    </div>
                                    {activeProject === 'all' && <Check size={18} className="text-[#1A4B9C]" />}
                                </button>

                                {projects?.map(proj => (
                                    <button 
                                        key={proj.id}
                                        onClick={() => { setActiveProject(proj.id); setIsProjectSwitcherOpen(false); }}
                                        className={`w-full text-left p-4 rounded-lg border transition-colors flex justify-between items-center ${activeProject === proj.id ? 'border-[#1A4B9C] bg-[#E1EFFE]' : 'border-[#E2E8F0] hover:border-[#1A4B9C]'}`}
                                    >
                                        <div>
                                            <div className={`font-bold text-sm ${activeProject === proj.id ? 'text-[#1A4B9C]' : 'text-slate-800'}`}>{proj.name}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">ID: {proj.id} • {proj.totalUnits || 0} Units</div>
                                        </div>
                                        {activeProject === proj.id && <Check size={18} className="text-[#1A4B9C]" />}
                                    </button>
                                ))}
                                
                                <div className="pt-4 mt-2 border-t border-[#E2E8F0]">
                                    <button onClick={() => setIsAddProjectOpen(true)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                                        <Building2 size={16} /> Add New Project
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleAddProjectSubmit} className="p-6 space-y-4">
                                <h4 className="text-sm font-bold text-[#1A4B9C] border-b border-[#E2E8F0] pb-2 mb-4">Create New Project</h4>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Project ID (Optional)</label>
                                    <input 
                                        type="text" 
                                        placeholder={`e.g. p${projects.length + 1}`} 
                                        value={newProjectForm.id} 
                                        onChange={e => setNewProjectForm({...newProjectForm, id: e.target.value})} 
                                        className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4B9C]" 
                                    />
                                    <div className="text-[10px] text-slate-400 mt-1">Leave empty to auto-generate (e.g. p{projects.length + 1}).</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Project Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Skyline Heights" 
                                        required 
                                        value={newProjectForm.name} 
                                        onChange={e => setNewProjectForm({...newProjectForm, name: e.target.value})} 
                                        className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4B9C]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Units Billed</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g. 50" 
                                        required 
                                        value={newProjectForm.totalUnits} 
                                        onChange={e => setNewProjectForm({...newProjectForm, totalUnits: e.target.value})} 
                                        className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4B9C]" 
                                    />
                                </div>
                                <div className="pt-4 flex justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAddProjectOpen(false)} 
                                        className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg text-sm font-bold hover:bg-slate-200 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-4 py-2 bg-[#1A4B9C] text-white rounded-lg text-sm font-bold hover:bg-[#153B7C] cursor-pointer"
                                    >
                                        Save Project
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminLayout = () => {
    return (
        <AdminDataProvider>
            <AdminLayoutContent />
        </AdminDataProvider>
    );
};

export default AdminLayout;
