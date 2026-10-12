import { useState, useRef } from 'react';
import { Save, Building2, Palette, Settings, CheckCircle, Upload, Trash2, Layout, Image, Users, Plus, Mail, Phone, MapPin, Globe, MessageSquare, Compass } from 'lucide-react';
import { useDatabase } from '../../Context/DatabaseContext';
import { DEFAULT_SYSTEM_SETTINGS } from '../../config/defaultSettings';
import { showToast } from '../../Components/Toast/globalToast';

const PRESET_COLORS = [
    { name: 'Deep Blue', hex: '#1A4B9C' },
    { name: 'Emerald Green', hex: '#03543F' },
    { name: 'Royal Indigo', hex: '#4F46E5' },
    { name: 'Slate Dark', hex: '#0F172A' },
    { name: 'Crimson Red', hex: '#991B1B' },
    { name: 'Warm Amber', hex: '#D97706' },
];

const DEFAULT_TEAM_MEMBERS = [
    {
        name: 'Mohammed A. Rahman',
        role: 'Chief Executive Officer',
        badge: 'CEO',
        bg: '#000f22',
        text: '#ffffff',
        bio: 'Over 25 years leading landmark infrastructure projects across Bangladesh.'
    },
    {
        name: 'Nasreen Hossain',
        role: 'Director of Engineering',
        badge: 'ENG',
        bg: '#a14000',
        text: '#ffffff',
        bio: 'Structural engineer with international credentials and 18 years of field leadership.'
    },
    {
        name: 'Tanvir Islam',
        role: 'GIS Specialist',
        badge: 'GIS',
        bg: '#0a3d2e',
        text: '#ffffff',
        bio: 'Pioneer in applying geospatial intelligence to urban real estate development.'
    },
    {
        name: 'Fatima Begum',
        role: 'Client Relations Manager',
        badge: 'CRM',
        bg: '#5e2200',
        text: '#ffffff',
        bio: 'Dedicated to delivering exceptional client experiences throughout every project lifecycle.'
    }
];

const AdminSettings = () => {
    const { systemSettings, updateSystemSettings } = useDatabase();
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState(() => ({
        ...systemSettings,
        aboutTeamMembers: systemSettings?.aboutTeamMembers?.length ? systemSettings.aboutTeamMembers : DEFAULT_TEAM_MEMBERS
    }));
    const [prevSystemSettings, setPrevSystemSettings] = useState(systemSettings);
    const fileInputRef = useRef(null);
    const heroFileInputRef = useRef(null);

    if (systemSettings !== prevSystemSettings) {
        setPrevSystemSettings(systemSettings);
        setSettings({
            ...systemSettings,
            aboutTeamMembers: systemSettings?.aboutTeamMembers?.length ? systemSettings.aboutTeamMembers : DEFAULT_TEAM_MEMBERS
        });
    }

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showToast('Logo file size must be under 2MB', 'error', 'File Too Large');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setSettings(prev => ({ ...prev, companyLogo: event.target.result }));
            showToast('Logo selected! Click Save Changes to apply globally.', 'info', 'Logo Uploaded');
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        setSettings(prev => ({ ...prev, companyLogo: null }));
    };

    const handleHeroImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast('Hero image file size must be under 5MB', 'error', 'File Too Large');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setSettings(prev => ({ ...prev, heroImage: event.target.result }));
            showToast('Hero background selected! Click Save Changes to apply.', 'info', 'Hero Image Uploaded');
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveHeroImage = () => {
        setSettings(prev => ({ ...prev, heroImage: null }));
    };

    const handleAddTeamMember = () => {
        const newMember = {
            name: 'New Team Member',
            role: 'Position Title',
            badge: 'TEAM',
            bg: '#000f22',
            text: '#ffffff',
            bio: 'Professional background description...'
        };
        setSettings(prev => {
            const current = prev.aboutTeamMembers?.length ? prev.aboutTeamMembers : DEFAULT_TEAM_MEMBERS;
            return {
                ...prev,
                aboutTeamMembers: [...current, newMember]
            };
        });
        showToast('Team member draft added! Fill details and click Save.', 'info', 'Member Added');
    };

    const handleUpdateTeamMember = (index, field, value) => {
        setSettings(prev => {
            const current = prev.aboutTeamMembers?.length ? prev.aboutTeamMembers : DEFAULT_TEAM_MEMBERS;
            const updated = [...current];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, aboutTeamMembers: updated };
        });
    };

    const handleRemoveTeamMember = (index) => {
        setSettings(prev => {
            const current = prev.aboutTeamMembers?.length ? prev.aboutTeamMembers : DEFAULT_TEAM_MEMBERS;
            return {
                ...prev,
                aboutTeamMembers: current.filter((_, i) => i !== index)
            };
        });
        showToast('Team member removed.', 'info', 'Member Removed');
    };

    const handleSave = (e) => {
        e.preventDefault();
        updateSystemSettings(settings);
        showToast('Settings saved successfully! System configurations have been updated globally.', 'success', 'Settings Saved');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Header */}
            <div>
                <div className="text-[10px] font-bold text-[#1A4B9C] uppercase tracking-wider mb-1">Configuration</div>
                <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Manage global platform configurations and preferences.</p>
            </div>

            <div className="flex gap-6 items-start">
                
                {/* Sidebar Navigation */}
                <div className="w-[240px] bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden flex-shrink-0">
                    <div className="p-4 border-b border-[#E2E8F0] bg-slate-50">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Settings Menu</div>
                    </div>
                    <nav className="p-2 space-y-1">
                        <button 
                            onClick={() => setActiveTab('general')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-[#E1EFFE] text-[#1A4B9C]' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Settings size={16} className={activeTab === 'general' ? 'text-[#1A4B9C]' : 'text-slate-400'} /> General Info
                        </button>
                        <button 
                            onClick={() => setActiveTab('branding')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'branding' ? 'bg-[#E1EFFE] text-[#1A4B9C]' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Palette size={16} className={activeTab === 'branding' ? 'text-[#1A4B9C]' : 'text-slate-400'} /> Branding & Colors
                        </button>
                        <button 
                            onClick={() => setActiveTab('hero')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'hero' ? 'bg-[#E1EFFE] text-[#1A4B9C]' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Layout size={16} className={activeTab === 'hero' ? 'text-[#1A4B9C]' : 'text-slate-400'} /> Hero Section
                        </button>
                        <button 
                            onClick={() => setActiveTab('about')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'about' ? 'bg-[#E1EFFE] text-[#1A4B9C]' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Users size={16} className={activeTab === 'about' ? 'text-[#1A4B9C]' : 'text-slate-400'} /> About Page &amp; People
                        </button>
                        <button 
                            onClick={() => setActiveTab('contact')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'contact' ? 'bg-[#E1EFFE] text-[#1A4B9C]' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Mail size={16} className={activeTab === 'contact' ? 'text-[#1A4B9C]' : 'text-slate-400'} /> Contact Settings
                        </button>
                    </nav>
                </div>

                {/* Settings Content Area */}
                <div className="flex-1 bg-white border border-[#E2E8F0] rounded-xl shadow-sm">
                    <div className="px-6 py-4 border-b border-[#E2E8F0] bg-slate-50 flex justify-between items-center">
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            {activeTab === 'general' && <><Settings size={16} className="text-[#1A4B9C]"/> General Information</>}
                            {activeTab === 'branding' && <><Palette size={16} className="text-[#1A4B9C]"/> Branding & Colors</>}
                            {activeTab === 'hero' && <><Layout size={16} className="text-[#1A4B9C]"/> Hero Section Content</>}
                            {activeTab === 'about' && <><Users size={16} className="text-[#1A4B9C]"/> About Page &amp; Our People</>}
                            {activeTab === 'contact' && <><Mail size={16} className="text-[#1A4B9C]"/> Public Contact Page Settings</>}
                        </h2>
                    </div>

                    <form onSubmit={handleSave} className="p-6">
                        
                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Company Name</label>
                                        <input 
                                            type="text" 
                                            value={settings?.companyName || ''} 
                                            onChange={e => setSettings({...settings, companyName: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Registration Number</label>
                                        <input 
                                            type="text" 
                                            value={settings?.regNumber || ''} 
                                            onChange={e => setSettings({...settings, regNumber: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Head Office Address</label>
                                    <input 
                                        type="text" 
                                        value={settings?.headOfficeAddress || ''} 
                                        onChange={e => setSettings({...settings, headOfficeAddress: e.target.value})}
                                        className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Support Email</label>
                                        <input 
                                            type="email" 
                                            value={settings?.supportEmail || ''} 
                                            onChange={e => setSettings({...settings, supportEmail: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Support Phone</label>
                                        <input 
                                            type="text" 
                                            value={settings?.supportPhone || ''} 
                                            onChange={e => setSettings({...settings, supportPhone: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BRANDING TAB */}
                        {activeTab === 'branding' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Company Logo</label>
                                    <div className="flex items-center gap-5">
                                        <div className="w-24 h-24 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-center text-[#1A4B9C] overflow-hidden shadow-inner flex-shrink-0">
                                            {settings?.companyLogo ? (
                                                <img src={settings.companyLogo} alt="Company Logo" className="w-full h-full object-contain p-1" />
                                            ) : (
                                                <Building2 size={36} />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                onChange={handleLogoUpload} 
                                                accept="image/*" 
                                                className="hidden" 
                                            />
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    type="button" 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                                                >
                                                    <Upload size={14} /> Upload New Logo
                                                </button>
                                                {settings?.companyLogo && (
                                                    <button 
                                                        type="button" 
                                                        onClick={handleRemoveLogo}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 size={14} /> Remove Logo
                                                    </button>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-slate-400">Supported formats: PNG, SVG, JPG (Max 2MB).</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <hr className="border-[#E2E8F0]" />
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Theme Color</label>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        {PRESET_COLORS.map(preset => {
                                            const isSelected = (settings?.primaryColor || '#1A4B9C').toUpperCase() === preset.hex.toUpperCase();
                                            return (
                                                <button 
                                                    key={preset.hex}
                                                    type="button"
                                                    title={preset.name}
                                                    onClick={() => setSettings({ ...settings, primaryColor: preset.hex })}
                                                    style={{ backgroundColor: preset.hex }}
                                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-transform cursor-pointer ${
                                                        isSelected ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                                                    }`}
                                                >
                                                    {isSelected && <CheckCircle size={16} />}
                                                </button>
                                            );
                                        })}
                                        <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-200">
                                            <label className="text-xs font-bold text-slate-600">Custom:</label>
                                            <input 
                                                type="color" 
                                                value={settings?.primaryColor || '#1A4B9C'}
                                                onChange={e => setSettings({ ...settings, primaryColor: e.target.value })}
                                                className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                                            />
                                            <span className="text-xs font-mono text-slate-500 uppercase font-bold">{settings?.primaryColor || '#1A4B9C'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* HERO TAB */}
                        {activeTab === 'hero' && (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Hero Pill Badge / Tagline</label>
                                    <input 
                                        type="text" 
                                        value={settings?.heroTagline || ''} 
                                        onChange={e => setSettings({...settings, heroTagline: e.target.value})}
                                        className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                        placeholder={`e.g. ${DEFAULT_SYSTEM_SETTINGS.heroTagline}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Main Headline Title</label>
                                    <textarea 
                                        rows={2}
                                        value={settings?.heroHeadline || ''} 
                                        onChange={e => setSettings({...settings, heroHeadline: e.target.value})}
                                        className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                        placeholder="e.g. Building Narayanganj's Future Architecture."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subtitle / Description</label>
                                    <textarea 
                                        rows={3}
                                        value={settings?.heroSubtitle || ''} 
                                        onChange={e => setSettings({...settings, heroSubtitle: e.target.value})}
                                        className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white leading-relaxed" 
                                        placeholder="Detail the value proposition shown on the homepage..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5 pt-2 border-t border-slate-100">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Button Label</label>
                                        <input 
                                            type="text" 
                                            value={settings?.heroCta1Text || ''} 
                                            onChange={e => setSettings({...settings, heroCta1Text: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                            placeholder="e.g. Explore All Projects"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Button Link</label>
                                        <input 
                                            type="text" 
                                            value={settings?.heroCta1Link || ''} 
                                            onChange={e => setSettings({...settings, heroCta1Link: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                            placeholder="e.g. /projects"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Secondary Button Label</label>
                                        <input 
                                            type="text" 
                                            value={settings?.heroCta2Text || ''} 
                                            onChange={e => setSettings({...settings, heroCta2Text: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                            placeholder="e.g. Interactive GIS Map"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Secondary Button Link</label>
                                        <input 
                                            type="text" 
                                            value={settings?.heroCta2Link || ''} 
                                            onChange={e => setSettings({...settings, heroCta2Link: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                            placeholder="e.g. /gismap"
                                        />
                                    </div>
                                </div>

                                <hr className="border-[#E2E8F0]" />

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Hero Background Image</label>
                                    <div className="flex items-center gap-5">
                                        <div className="w-32 h-20 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-center text-[#1A4B9C] overflow-hidden shadow-inner flex-shrink-0 relative">
                                            {settings?.heroImage ? (
                                                <img src={settings.heroImage} alt="Hero Background" className="w-full h-full object-cover" />
                                            ) : (
                                                <Image size={28} className="text-slate-400" />
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <input 
                                                type="file" 
                                                ref={heroFileInputRef} 
                                                onChange={handleHeroImageUpload} 
                                                accept="image/*" 
                                                className="hidden" 
                                            />
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    type="button" 
                                                    onClick={() => heroFileInputRef.current?.click()}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                                                >
                                                    <Upload size={14} /> Upload Custom Hero Background
                                                </button>
                                                {settings?.heroImage && (
                                                    <button 
                                                        type="button" 
                                                        onClick={handleRemoveHeroImage}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 size={14} /> Reset Default
                                                    </button>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-slate-400">Supported formats: JPG, PNG, SVG (Max 5MB).</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ABOUT TAB */}
                        {activeTab === 'about' && (
                            <div className="space-y-6">
                                {/* About Hero Settings */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-[#1A4B9C] uppercase tracking-wider border-b border-slate-100 pb-2">About Page Hero Section</h3>
                                    
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Eyebrow / Sub-tagline</label>
                                        <input 
                                            type="text" 
                                            value={settings?.aboutHeroEyebrow || ''} 
                                            onChange={e => setSettings({...settings, aboutHeroEyebrow: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                            placeholder="e.g. Est. 2003 · Narayanganj, Bangladesh"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Headline Title</label>
                                        <input 
                                            type="text" 
                                            value={settings?.aboutHeroHeadline || ''} 
                                            onChange={e => setSettings({...settings, aboutHeroHeadline: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white font-bold" 
                                            placeholder="e.g. Decades of Trust in Narayanganj."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subtitle Story</label>
                                        <textarea 
                                            rows={3}
                                            value={settings?.aboutHeroSubtitle || ''} 
                                            onChange={e => setSettings({...settings, aboutHeroSubtitle: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white leading-relaxed" 
                                            placeholder="Describe company origins and promise..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Button Text &amp; Link</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input 
                                                    type="text" 
                                                    value={settings?.aboutHeroCta1Text || ''} 
                                                    onChange={e => setSettings({...settings, aboutHeroCta1Text: e.target.value})}
                                                    className="w-full border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-slate-800" 
                                                    placeholder="Explore Heritage"
                                                />
                                                <input 
                                                    type="text" 
                                                    value={settings?.aboutHeroCta1Link || ''} 
                                                    onChange={e => setSettings({...settings, aboutHeroCta1Link: e.target.value})}
                                                    className="w-full border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-slate-800" 
                                                    placeholder="/"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Secondary Button Text &amp; Link</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input 
                                                    type="text" 
                                                    value={settings?.aboutHeroCta2Text || ''} 
                                                    onChange={e => setSettings({...settings, aboutHeroCta2Text: e.target.value})}
                                                    className="w-full border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-slate-800" 
                                                    placeholder="View on Map"
                                                />
                                                <input 
                                                    type="text" 
                                                    value={settings?.aboutHeroCta2Link || ''} 
                                                    onChange={e => setSettings({...settings, aboutHeroCta2Link: e.target.value})}
                                                    className="w-full border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs text-slate-800" 
                                                    placeholder="/gismap"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-[#E2E8F0]" />

                                {/* Our People / Team Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <h3 className="text-xs font-bold text-[#1A4B9C] uppercase tracking-wider">Our People &amp; Leadership Team</h3>
                                        <button 
                                            type="button" 
                                            onClick={handleAddTeamMember}
                                            className="flex items-center gap-1 px-3 py-1 bg-[#1A4B9C] text-white rounded text-xs font-bold hover:bg-[#153B7C] transition-colors cursor-pointer"
                                        >
                                            <Plus size={14} /> Add Team Member
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Section Eyebrow</label>
                                            <input 
                                                type="text" 
                                                value={settings?.aboutPeopleEyebrow || ''} 
                                                onChange={e => setSettings({...settings, aboutPeopleEyebrow: e.target.value})}
                                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-slate-800" 
                                                placeholder="Our People"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Section Title</label>
                                            <input 
                                                type="text" 
                                                value={settings?.aboutPeopleTitle || ''} 
                                                onChange={e => setSettings({...settings, aboutPeopleTitle: e.target.value})}
                                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-slate-800" 
                                                placeholder="The Visionaries..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Section Subtitle</label>
                                            <input 
                                                type="text" 
                                                value={settings?.aboutPeopleSubtitle || ''} 
                                                onChange={e => setSettings({...settings, aboutPeopleSubtitle: e.target.value})}
                                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-slate-800" 
                                                placeholder="Sub-caption text..."
                                            />
                                        </div>
                                    </div>

                                    {/* Team Members Cards List */}
                                    <div className="space-y-3 pt-2">
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Team Members List ({(settings?.aboutTeamMembers?.length ? settings.aboutTeamMembers : DEFAULT_TEAM_MEMBERS).length})</label>
                                        
                                        {(settings?.aboutTeamMembers?.length ? settings.aboutTeamMembers : DEFAULT_TEAM_MEMBERS).map((member, index) => (
                                            <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-xs font-bold text-[#1A4B9C] flex items-center gap-1.5">
                                                        <span className="w-5 h-5 rounded-full bg-[#1A4B9C] text-white text-[10px] flex items-center justify-center font-bold">
                                                            {index + 1}
                                                        </span>
                                                        {member.name || `Member #${index + 1}`}
                                                    </span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveTeamMember(index)}
                                                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                                        title="Remove Member"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-4 gap-3">
                                                    <div className="col-span-2">
                                                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                                        <input 
                                                            type="text" 
                                                            value={member.name || ''} 
                                                            onChange={e => handleUpdateTeamMember(index, 'name', e.target.value)}
                                                            className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Job Title / Role</label>
                                                        <input 
                                                            type="text" 
                                                            value={member.role || ''} 
                                                            onChange={e => handleUpdateTeamMember(index, 'role', e.target.value)}
                                                            className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Badge Code</label>
                                                        <input 
                                                            type="text" 
                                                            value={member.badge || ''} 
                                                            onChange={e => handleUpdateTeamMember(index, 'badge', e.target.value)}
                                                            className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white font-mono uppercase" 
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Short Biography</label>
                                                    <textarea 
                                                        rows={2}
                                                        value={member.bio || ''} 
                                                        onChange={e => handleUpdateTeamMember(index, 'bio', e.target.value)}
                                                        className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white leading-relaxed" 
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CONTACT TAB */}
                        {activeTab === 'contact' && (
                            <div className="space-y-6">
                                {/* Banner Header Section */}
                                <div className="border border-[#E2E8F0] rounded-xl p-5 space-y-4 bg-slate-50/50">
                                    <h3 className="text-xs font-bold text-[#1A4B9C] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2">
                                        <Globe size={14} /> Contact Page Hero Banner
                                    </h3>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Banner Title</label>
                                        <input 
                                            type="text" 
                                            value={settings?.contactHeroTitle || ''} 
                                            onChange={e => setSettings({...settings, contactHeroTitle: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                            placeholder="Get In Touch"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Banner Subtitle</label>
                                        <textarea 
                                            rows={2}
                                            value={settings?.contactHeroSubtitle || ''} 
                                            onChange={e => setSettings({...settings, contactHeroSubtitle: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white resize-none" 
                                            placeholder="Subtitle narrative text..."
                                        />
                                    </div>
                                </div>

                                {/* Information Cards */}
                                <div className="border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                                    <h3 className="text-xs font-bold text-[#1A4B9C] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2">
                                        <Mail size={14} /> Contact Information Cards
                                    </h3>
                                    
                                    {/* Card 1: General */}
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                            <MessageSquare size={13} className="text-[#1A4B9C]" /> General Inquiries Card
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Card Title</label>
                                                <input 
                                                    type="text" 
                                                    value={settings?.contactGeneralTitle || ''} 
                                                    onChange={e => setSettings({...settings, contactGeneralTitle: e.target.value})}
                                                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Email</label>
                                                <input 
                                                    type="email" 
                                                    value={settings?.contactGeneralEmail || ''} 
                                                    onChange={e => setSettings({...settings, contactGeneralEmail: e.target.value})}
                                                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Phone</label>
                                                <input 
                                                    type="text" 
                                                    value={settings?.contactGeneralPhone || ''} 
                                                    onChange={e => setSettings({...settings, contactGeneralPhone: e.target.value})}
                                                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 2: Sales */}
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                            <Compass size={13} className="text-[#fe762a]" /> Sales &amp; Investment Card
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Card Title</label>
                                                <input 
                                                    type="text" 
                                                    value={settings?.contactSalesTitle || ''} 
                                                    onChange={e => setSettings({...settings, contactSalesTitle: e.target.value})}
                                                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Email</label>
                                                <input 
                                                    type="email" 
                                                    value={settings?.contactSalesEmail || ''} 
                                                    onChange={e => setSettings({...settings, contactSalesEmail: e.target.value})}
                                                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Hours Note</label>
                                                <input 
                                                    type="text" 
                                                    value={settings?.contactSalesHours || ''} 
                                                    onChange={e => setSettings({...settings, contactSalesHours: e.target.value})}
                                                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white" 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 3: Support */}
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                            <Phone size={13} className="text-slate-700" /> Customer Support Card
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Card Title</label>
                                                <input 
                                                    type="text" 
                                                    value={settings?.contactSupportTitle || ''} 
                                                    onChange={e => setSettings({...settings, contactSupportTitle: e.target.value})}
                                                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Email</label>
                                                <input 
                                                    type="email" 
                                                    value={settings?.contactSupportEmail || ''} 
                                                    onChange={e => setSettings({...settings, contactSupportEmail: e.target.value})}
                                                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Support Hours Note</label>
                                                <input 
                                                    type="text" 
                                                    value={settings?.contactSupportHours || ''} 
                                                    onChange={e => setSettings({...settings, contactSupportHours: e.target.value})}
                                                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 bg-white" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Physical Office & Coordinates */}
                                <div className="border border-[#E2E8F0] rounded-xl p-5 space-y-4">
                                    <h3 className="text-xs font-bold text-[#1A4B9C] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2">
                                        <MapPin size={14} /> Physical Address &amp; Coordinates
                                    </h3>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Head Office Address</label>
                                        <input 
                                            type="text" 
                                            value={settings?.headOfficeAddress || ''} 
                                            onChange={e => setSettings({...settings, headOfficeAddress: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Map Latitude</label>
                                            <input 
                                                type="text" 
                                                value={settings?.contactMapLat || ''} 
                                                onChange={e => setSettings({...settings, contactMapLat: e.target.value})}
                                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Map Longitude</label>
                                            <input 
                                                type="text" 
                                                value={settings?.contactMapLng || ''} 
                                                onChange={e => setSettings({...settings, contactMapLng: e.target.value})}
                                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Head Office Working Hours</label>
                                        <textarea 
                                            rows={3}
                                            value={settings?.contactOfficeHours || ''} 
                                            onChange={e => setSettings({...settings, contactOfficeHours: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white resize-none" 
                                        />
                                    </div>
                                </div>

                                {/* Dedicated Account Executive (Client Portal Support) */}
                                <div className="border border-[#E2E8F0] rounded-xl p-5 space-y-4 bg-slate-50/50">
                                    <h3 className="text-xs font-bold text-[#1A4B9C] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2">
                                        <Users size={14} /> Dedicated Account Executive (Client Portal Support)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Executive Name</label>
                                            <input 
                                                type="text" 
                                                value={settings?.accountExecName || ''} 
                                                onChange={e => setSettings({...settings, accountExecName: e.target.value})}
                                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                                placeholder="Farhana Islam"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role Title</label>
                                            <input 
                                                type="text" 
                                                value={settings?.accountExecRole || ''} 
                                                onChange={e => setSettings({...settings, accountExecRole: e.target.value})}
                                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                                placeholder="Dedicated Account Exec"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Direct Email</label>
                                            <input 
                                                type="email" 
                                                value={settings?.accountExecEmail || ''} 
                                                onChange={e => setSettings({...settings, accountExecEmail: e.target.value})}
                                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                                placeholder={DEFAULT_SYSTEM_SETTINGS.accountExecEmail}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Direct Phone</label>
                                            <input 
                                                type="text" 
                                                value={settings?.accountExecPhone || ''} 
                                                onChange={e => setSettings({...settings, accountExecPhone: e.target.value})}
                                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                                placeholder={DEFAULT_SYSTEM_SETTINGS.accountExecPhone}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-[#E2E8F0] flex justify-end gap-3">
                            <button type="button" className="px-4 py-2 bg-white border border-[#E2E8F0] text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
                                Cancel
                            </button>
                            <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-[#1A4B9C] text-white rounded-lg text-sm font-bold hover:bg-[#153B7C] transition-colors shadow-sm cursor-pointer">
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
