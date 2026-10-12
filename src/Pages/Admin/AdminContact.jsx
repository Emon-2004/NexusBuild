import React, { useState, useEffect } from 'react';
import { Save, Mail, Phone, Clock, MapPin, Globe, Compass, MessageSquare } from 'lucide-react';
import { useDatabase } from '../../Context/DatabaseContext';
import { DEFAULT_SYSTEM_SETTINGS } from '../../config/defaultSettings';
import { showToast } from '../../Components/Toast/globalToast';

const AdminContact = () => {
    const { systemSettings, updateSystemSettings } = useDatabase();
    const [activeTab, setActiveTab] = useState('hero');
    const [settings, setSettings] = useState(() => ({
        ...DEFAULT_SYSTEM_SETTINGS,
        ...(systemSettings || {})
    }));

    useEffect(() => {
        if (systemSettings) {
            setSettings(prev => ({
                ...prev,
                ...systemSettings
            }));
        }
    }, [systemSettings]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await updateSystemSettings(settings);
            showToast('Contact Settings saved successfully! The changes are now live on the public contact page.', 'success', 'Settings Saved');
        } catch (err) {
            console.error(err);
            showToast('Failed to save settings: ' + err.message, 'error', 'Save Failed');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 text-slate-800 font-[Inter,sans-serif]">
            
            {/* Header */}
            <div>
                <div className="text-[10px] font-bold text-[#1A4B9C] uppercase tracking-wider mb-1">Configuration</div>
                <h1 className="text-2xl font-bold text-slate-800">Contact Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Manage public contact details, banner titles, cards, and office location coordinates.</p>
            </div>

            <div className="flex gap-6 items-start">
                
                {/* Navigation Sidebar */}
                <div className="w-[240px] bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden flex-shrink-0">
                    <div className="p-4 border-b border-[#E2E8F0] bg-slate-50">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact Sections</div>
                    </div>
                    <nav className="p-2 space-y-1">
                        <button 
                            onClick={() => setActiveTab('hero')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'hero' ? 'bg-[#E1EFFE] text-[#1A4B9C]' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Globe size={16} className={activeTab === 'hero' ? 'text-[#1A4B9C]' : 'text-slate-400'} /> Hero Banner
                        </button>
                        <button 
                            onClick={() => setActiveTab('cards')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'cards' ? 'bg-[#E1EFFE] text-[#1A4B9C]' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Mail size={16} className={activeTab === 'cards' ? 'text-[#1A4B9C]' : 'text-slate-400'} /> Info Cards
                        </button>
                        <button 
                            onClick={() => setActiveTab('office')}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'office' ? 'bg-[#E1EFFE] text-[#1A4B9C]' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <MapPin size={16} className={activeTab === 'office' ? 'text-[#1A4B9C]' : 'text-slate-400'} /> Office & Hours
                        </button>
                    </nav>
                </div>

                {/* Settings Editor Panel */}
                <div className="flex-1 bg-white border border-[#E2E8F0] rounded-xl shadow-sm">
                    <div className="px-6 py-4 border-b border-[#E2E8F0] bg-slate-50 flex justify-between items-center">
                        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            {activeTab === 'hero' && <><Globe size={16} className="text-[#1A4B9C]"/> Banner Header Settings</>}
                            {activeTab === 'cards' && <><Mail size={16} className="text-[#1A4B9C]"/> Contact Information Cards</>}
                            {activeTab === 'office' && <><MapPin size={16} className="text-[#1A4B9C]"/> Physical Address & Hours</>}
                        </h2>
                    </div>

                    <form onSubmit={handleSave} className="p-6 space-y-6">
                        
                        {/* HERO TAB */}
                        {activeTab === 'hero' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Page Hero Title</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={settings.contactHeroTitle || ''} 
                                        onChange={e => setSettings({...settings, contactHeroTitle: e.target.value})}
                                        className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Page Hero Subtitle</label>
                                    <textarea 
                                        required
                                        rows={3}
                                        value={settings.contactHeroSubtitle || ''} 
                                        onChange={e => setSettings({...settings, contactHeroSubtitle: e.target.value})}
                                        className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white resize-none" 
                                    />
                                </div>
                            </div>
                        )}

                        {/* CARDS TAB */}
                        {activeTab === 'cards' && (
                            <div className="space-y-6">
                                {/* CARD 1: General */}
                                <div className="border border-[#E2E8F0] rounded-lg p-4 space-y-4">
                                    <h4 className="text-xs font-bold text-[#1A4B9C] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2">
                                        <MessageSquare size={14} /> General Inquiries Card
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Card Title</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={settings.contactGeneralTitle || ''} 
                                                onChange={e => setSettings({...settings, contactGeneralTitle: e.target.value})}
                                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Email</label>
                                            <input 
                                                type="email" 
                                                required
                                                value={settings.contactGeneralEmail || ''} 
                                                onChange={e => setSettings({...settings, contactGeneralEmail: e.target.value})}
                                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Phone</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={settings.contactGeneralPhone || ''} 
                                            onChange={e => setSettings({...settings, contactGeneralPhone: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                        />
                                    </div>
                                </div>

                                {/* CARD 2: Sales */}
                                <div className="border border-[#E2E8F0] rounded-lg p-4 space-y-4">
                                    <h4 className="text-xs font-bold text-[#fe762a] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2">
                                        <Compass size={14} /> Sales &amp; Investment Card
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Card Title</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={settings.contactSalesTitle || ''} 
                                                onChange={e => setSettings({...settings, contactSalesTitle: e.target.value})}
                                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Email</label>
                                            <input 
                                                type="email" 
                                                required
                                                value={settings.contactSalesEmail || ''} 
                                                onChange={e => setSettings({...settings, contactSalesEmail: e.target.value})}
                                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Office Hours Description</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={settings.contactSalesHours || ''} 
                                            onChange={e => setSettings({...settings, contactSalesHours: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                        />
                                    </div>
                                </div>

                                {/* CARD 3: Support */}
                                <div className="border border-[#E2E8F0] rounded-lg p-4 space-y-4">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-[#E2E8F0] pb-2">
                                        <Phone size={14} /> Customer Support Card
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Card Title</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={settings.contactSupportTitle || ''} 
                                                onChange={e => setSettings({...settings, contactSupportTitle: e.target.value})}
                                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Email</label>
                                            <input 
                                                type="email" 
                                                required
                                                value={settings.contactSupportEmail || ''} 
                                                onChange={e => setSettings({...settings, contactSupportEmail: e.target.value})}
                                                className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Support Hours Description</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={settings.contactSupportHours || ''} 
                                            onChange={e => setSettings({...settings, contactSupportHours: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* OFFICE TAB */}
                        {activeTab === 'office' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Office Physical Address</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={settings.headOfficeAddress || ''} 
                                        onChange={e => setSettings({...settings, headOfficeAddress: e.target.value})}
                                        className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Office Google Map Latitude</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={settings.contactMapLat || ''} 
                                            onChange={e => setSettings({...settings, contactMapLat: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Office Google Map Longitude</label>
                                        <input 
                                            type="text" 
                                            required
                                            value={settings.contactMapLng || ''} 
                                            onChange={e => setSettings({...settings, contactMapLng: e.target.value})}
                                            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white" 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Head Office Working Hours</label>
                                    <textarea 
                                        required
                                        rows={4}
                                        value={settings.contactOfficeHours || ''} 
                                        onChange={e => setSettings({...settings, contactOfficeHours: e.target.value})}
                                        className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#1A4B9C] text-slate-800 bg-white resize-none" 
                                    />
                                </div>
                            </div>
                        )}

                        {/* Save Action Row */}
                        <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                            <button 
                                type="submit" 
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#1A4B9C] hover:bg-[#153B7C] text-white text-xs font-bold uppercase rounded-lg shadow-sm transition-colors cursor-pointer"
                            >
                                <Save size={14} /> Save Contact Configurations
                            </button>
                        </div>

                    </form>
                </div>

            </div>

        </div>
    );
};

export default AdminContact;
