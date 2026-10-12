import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import {
    LayoutDashboard, BookOpen, HardHat, Headphones,
    Bell, LogOut, Building2, User, Menu, X as XIcon
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { ClientDataProvider, useClientData } from '../../Context/ClientDataContext';
import { useDatabase } from '../../Context/DatabaseContext';
import { DEFAULT_SYSTEM_SETTINGS } from '../../config/defaultSettings';
import { showToast } from '../../Components/Toast/globalToast';

const NAV_LINKS = [
    { to: '/dashboard',            label: 'Dashboard',        icon: LayoutDashboard, end: true },
    { to: '/dashboard/financials', label: 'Financials',       icon: BookOpen },
    { to: '/dashboard/progress',   label: 'Projects',         icon: HardHat },
    { to: '/dashboard/support',    label: 'Support',          icon: Headphones },
];

const DashboardContent = () => {
    const { signOut } = useAuth();
    const { userProfile, activeClient, updateProfile, financials, siteUpdates, support } = useClientData();
    const { systemSettings } = useDatabase();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [readNotifIds, setReadNotifIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('client_read_notifs') || '[]');
        } catch(e) {
            return [];
        }
    });
    const notifRef = useRef(null);

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editEmail, setEditEmail] = useState('');

    useEffect(() => {
        if (activeClient) {
            setEditName(activeClient.name || '');
            setEditPhone(activeClient.phone || '');
            setEditEmail(activeClient.email || '');
        }
    }, [activeClient]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            await updateProfile({
                name: editName,
                phone: editPhone,
                email: editEmail
            });
            setShowProfileModal(false);
            showToast('Profile updated successfully!', 'success', 'Profile Updated');
        } catch (err) {
            showToast('Error updating profile: ' + err.message, 'error', 'Update Failed');
        }
    };

    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = async () => { await signOut(); navigate('/'); };

    const clientNotifications = [
        // 1. Admin replies to support tickets -> /dashboard/support
        ...(support?.tickets || []).filter(t => {
            try {
                if (t.message && t.message.trim().startsWith('[')) {
                    const msgs = JSON.parse(t.message);
                    return msgs.length > 0 && msgs[msgs.length - 1].sender === 'admin';
                }
            } catch(e) {}
            return t.adminReply || t.admin_reply;
        }).map(t => {
            let lastText = t.adminReply || t.admin_reply || '';
            try {
                if (t.message && t.message.trim().startsWith('[')) {
                    const msgs = JSON.parse(t.message);
                    const adminMsgs = msgs.filter(m => m.sender === 'admin');
                    if (adminMsgs.length > 0) lastText = adminMsgs[adminMsgs.length - 1].text;
                }
            } catch(e) {}
            return {
                id: `tkt-reply-${t.id}`,
                title: 'Support Ticket Reply Received',
                desc: `#${t.id}: "${lastText.slice(0, 45)}${lastText.length > 45 ? '...' : ''}"`,
                date: t.date || 'Today',
                badge: 'bg-blue-100 text-[#003178]',
                url: '/dashboard/support'
            };
        }),        
        // 2. Site broadcasts sent by admin -> /dashboard/progress
        ...(siteUpdates || []).map(u => ({
            id: `broadcast-${u.id}`,
            title: `Site Broadcast: ${u.title || 'Update'}`,
            desc: u.desc || 'New construction update posted by admin.',
            date: u.date || 'Recent',
            badge: 'bg-purple-100 text-purple-700',
            url: '/dashboard/progress'
        })),
        // 3. Payment confirmations -> /dashboard/financials
        ...(financials?.transactions || []).slice(0, 5).map(t => ({
            id: `tx-${t.id}`,
            title: 'Payment Confirmation',
            desc: `৳${t.amount} confirmed for ${t.type}`,
            date: t.date,
            badge: 'bg-emerald-100 text-emerald-700',
            url: '/dashboard/financials'
        })),
        // 4. Pending/Overdue installments -> /dashboard/financials
        ...[...(financials?.installments || [])]
            .sort((a, b) => new Date(a.dueDate || a.due_date) - new Date(b.dueDate || b.due_date))
            .filter(i => i.status === 'Pending' || i.status === 'Overdue')
            .slice(0, 5)
            .map(i => ({
                id: `inst-${i.id}`,
                title: i.status === 'Overdue' ? 'Installment Overdue' : 'Upcoming Installment Due',
                desc: `${i.installment} of ৳${i.amount} due on ${i.dueDate}`,
                date: i.dueDate,
                badge: i.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
                url: '/dashboard/financials'
            }))
    ];

    return (
        <div className="flex h-screen overflow-hidden font-sans bg-base-200 text-base-content print:block print:h-auto print:overflow-visible">
            {/* ══ MOBILE OVERLAY ════════════════════════════════ */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-[55] lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ══ SIDEBAR ══════════════════════════════════════════════════════ */}
            <aside className={`fixed lg:relative inset-y-0 left-0 z-[60] w-[280px] lg:w-[340px] flex-shrink-0 flex flex-col bg-[#003178] text-white print:hidden transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}>
                
                {/* Header Logo Area */}
                <div 
                    onClick={() => navigate('/')}
                    className="p-6 pb-8 cursor-pointer hover:bg-[#002660] transition-colors border-b border-white/10 mb-4"
                    title="Go to Home"
                >
                    <div className="flex items-center gap-3">
                        {systemSettings?.companyLogo ? (
                            <img 
                                src={systemSettings.companyLogo} 
                                alt={systemSettings?.companyName || 'Logo'} 
                                className="h-12 w-auto max-w-[200px] object-contain bg-white/10 p-1.5 rounded-lg border border-white/20" 
                            />
                        ) : (
                            <div className="w-10 h-10 bg-white text-[#003178] rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                                <Building2 size={22} />
                            </div>
                        )}
                        <div className="min-w-0">
                            <div className="text-white font-bold text-lg leading-tight truncate">
                                {systemSettings?.companyName || DEFAULT_SYSTEM_SETTINGS.companyName}
                            </div>
                            <div className="text-[#A0B2C6] text-xs mt-0.5 font-medium">Client Portal</div>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu Items */}
                <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
                    {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
                        <NavLink key={to} to={to} end={end} className="no-underline block" onClick={() => setSidebarOpen(false)}>
                            {({ isActive }) => (
                                <div className={`flex items-center gap-4 px-6 py-3 transition-colors ${
                                    isActive 
                                        ? 'bg-[#0F4C9E] text-white border-l-4 border-white' 
                                        : 'text-[#A0B2C6] border-l-4 border-transparent hover:text-white'
                                    }`}>
                                    <Icon size={20} className={isActive ? 'text-white' : 'text-[#A0B2C6]'} />
                                    <span className="text-base font-medium">{label}</span>
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Logout */}
                <div className="px-6 mb-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-[#A0B2C6] hover:text-white transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="text-base font-medium">Logout</span>
                    </button>
                </div>

                {/* User Profile Widget (Bottom Sidebar) */}
                <div className="p-4 bg-[#0A2550]">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-white text-[#0A2550] rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 border-2 border-[#A0B2C6]/30">
                            {userProfile.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <div className="text-white font-bold text-sm truncate">{userProfile.name}</div>
                            <div className="text-[#A0B2C6] text-xs mt-0.5 truncate">{userProfile.propertyDesc}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ══ MAIN AREA ════════════════════════════════════════════════════ */}
            <div className="flex-1 flex flex-col overflow-hidden print:block print:h-auto print:overflow-visible min-w-0">
                
                {/* Top Header */}
                <header className="h-[70px] flex-shrink-0 bg-base-100 border-b border-base-300 px-4 md:px-6 flex items-center justify-between z-50 relative print:hidden">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        {/* Hamburger for mobile */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-1.5 sm:p-2 rounded-lg text-base-content/80 hover:bg-base-200 transition-colors flex-shrink-0"
                            aria-label="Open Menu"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="text-base-content font-bold text-base sm:text-lg truncate">
                            <span className="hidden sm:inline">Welcome Back, </span>
                            <span className="sm:hidden">Welcome, </span>
                            {userProfile.name}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                        {/* Notification Bell */}
                        <div ref={notifRef} className="relative z-50">
                            {(() => {
                                const unreadCount = clientNotifications.filter(n => !readNotifIds.includes(n.id)).length;
                                return (
                                    <button
                                        onClick={() => setShowNotif(p => !p)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full border border-base-300 text-base-content hover:bg-base-200 transition-colors cursor-pointer relative"
                                    >
                                        <Bell size={18} />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-error-content font-bold text-[9px] flex items-center justify-center rounded-full border-2 border-base-100">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })()}
                            
                            {/* Live Notification Dropdown */}
                            {showNotif && (
                                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-base-100 border border-base-300 shadow-2xl rounded-2xl p-4 text-xs text-base-content z-50 divide-y divide-base-300">
                                    <div className="font-bold text-sm text-base-content pb-2 flex justify-between items-center">
                                        <span>Notifications</span>
                                        <button 
                                            onClick={() => {
                                                const allIds = clientNotifications.map(n => n.id);
                                                setReadNotifIds(allIds);
                                                try { localStorage.setItem('client_read_notifs', JSON.stringify(allIds)); } catch(e) {}
                                            }}
                                            className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold hover:bg-primary/20 cursor-pointer"
                                        >
                                            Mark all as read
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto divide-y divide-base-300 py-1">
                                        {clientNotifications.map(n => {
                                            const isUnread = !readNotifIds.includes(n.id);
                                            return (
                                                <div 
                                                    key={n.id} 
                                                    onClick={() => {
                                                        if (!readNotifIds.includes(n.id)) {
                                                            const updated = [...readNotifIds, n.id];
                                                            setReadNotifIds(updated);
                                                            try { localStorage.setItem('client_read_notifs', JSON.stringify(updated)); } catch(e) {}
                                                        }
                                                        if (n.url) navigate(n.url);
                                                        setShowNotif(false);
                                                    }}
                                                    className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors space-y-1 group ${
                                                        isUnread ? 'bg-base-200/80 hover:bg-base-200 font-semibold' : 'hover:bg-base-200'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-base-content text-xs group-hover:text-primary transition-colors flex items-center gap-1.5">
                                                            {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />}
                                                            {n.title}
                                                        </span>
                                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${n.badge}`}>{n.date}</span>
                                                    </div>
                                                    <p className="text-base-content/70 text-xs line-clamp-2 leading-relaxed">{n.desc}</p>
                                                </div>
                                            );
                                        })}
                                        {clientNotifications.length === 0 && (
                                            <div className="py-6 text-center text-base-content/60">No new notifications.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Icon Button */}
                        <button 
                            onClick={() => setShowProfileModal(true)}
                            className="w-10 h-10 flex items-center justify-center rounded-full border border-base-300 text-base-content hover:bg-base-200 transition-colors cursor-pointer"
                            aria-label="Edit Profile"
                        >
                            <User size={18} />
                        </button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto min-w-0 p-4 md:p-8 relative z-0">
                    <Outlet />
                </main>
            </div>

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-base-100 text-base-content rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all border border-base-300">
                        <div className="bg-primary text-primary-content p-6">
                            <h3 className="text-xl font-bold">Edit Profile Information</h3>
                            <p className="text-primary-content/80 text-sm mt-1">Update your basic details in the NexusBuild portal</p>
                        </div>
                        <form onSubmit={handleSaveProfile} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-2">Full Name</label>
                                <input 
                                    type="text" 
                                    value={editName} 
                                    onChange={(e) => setEditName(e.target.value)} 
                                    className="w-full px-4 py-2 bg-base-200 border border-base-300 text-base-content rounded-md focus:outline-none focus:border-primary"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-2">Phone Number</label>
                                <input 
                                    type="text" 
                                    value={editPhone} 
                                    onChange={(e) => setEditPhone(e.target.value)} 
                                    className="w-full px-4 py-2 bg-base-200 border border-base-300 text-base-content rounded-md focus:outline-none focus:border-primary" 
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-base-content/80 uppercase tracking-wider mb-2">Email Address</label>
                                <input 
                                    type="email" 
                                    value={editEmail} 
                                    onChange={(e) => setEditEmail(e.target.value)} 
                                    className="w-full px-4 py-2 bg-base-200 border border-base-300 text-base-content/60 rounded-md focus:outline-none focus:border-primary cursor-not-allowed" 
                                    required
                                    disabled
                                />
                            </div>
                            <div className="flex gap-4 mt-4 justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => setShowProfileModal(false)}
                                    className="px-4 py-2 border border-base-300 text-base-content/80 rounded-md hover:bg-base-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-primary hover:opacity-90 text-primary-content font-semibold rounded-md transition-opacity cursor-pointer"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    return (
        <ClientDataProvider>
            <DashboardContent />
        </ClientDataProvider>
    );
};

export default Dashboard;
