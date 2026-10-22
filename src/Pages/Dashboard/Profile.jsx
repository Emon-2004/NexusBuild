import { useState, useRef } from 'react';
import {
    User, Mail, Phone, MapPin, Lock, Camera,
    ShieldCheck, Sparkles, Building2, KeyRound, Save
} from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useClientData } from '../../Context/ClientDataContext';
import { supabase } from '../../lib/supabaseClient';
import { showToast } from '../../Components/Toast/globalToast';
import { Button, Badge } from '../../Components/UI';

const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
];

const Profile = () => {
    const { user } = useAuth();
    const { activeClient, userProfile, updateProfile } = useClientData();

    // Profile form state
    const [name, setName] = useState(() => activeClient?.name || user?.name || userProfile?.name || '');
    const [phone, setPhone] = useState(() => activeClient?.phone || user?.phone || userProfile?.phone || '');
    const [email, setEmail] = useState(() => user?.email || activeClient?.email || '');
    const [address, setAddress] = useState(() => activeClient?.address || userProfile?.propertyLoc || '');
    const [bio, setBio] = useState(() => activeClient?.bio || '');
    const [prevLoadedId, setPrevLoadedId] = useState(() => activeClient?.id || user?.id);

    // Synchronize form when underlying client/user data loads asynchronously
    const currentId = activeClient?.id || user?.id;
    if (currentId && currentId !== prevLoadedId) {
        setPrevLoadedId(currentId);
        setName(activeClient?.name || user?.name || userProfile?.name || '');
        setPhone(activeClient?.phone || user?.phone || userProfile?.phone || '');
        setEmail(user?.email || activeClient?.email || '');
        setAddress(activeClient?.address || userProfile?.propertyLoc || '');
        setBio(activeClient?.bio || '');
    }

    const [avatarPreview, setAvatarPreview] = useState(() => {
        try {
            return localStorage.getItem(`client_avatar_${user?.id}`) || '';
        } catch {
            return '';
        }
    });

    const [savingProfile, setSavingProfile] = useState(false);
    const fileInputRef = useRef(null);

    // Password change state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    const handleAvatarFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showToast('Image file size must be under 2MB', 'error', 'File Too Large');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            setAvatarPreview(result);
            try {
                if (user?.id) {
                    localStorage.setItem(`client_avatar_${user.id}`, result);
                }
            } catch {
                // Ignore storage errors
            }
            showToast('Avatar image loaded successfully!', 'success', 'Photo Updated');
        };
        reader.readAsDataURL(file);
    };

    const handleSelectPreset = (url) => {
        setAvatarPreview(url);
        try {
            if (user?.id) {
                localStorage.setItem(`client_avatar_${user.id}`, url);
            }
        } catch {
            // Ignore storage errors
        }
        showToast('Preset avatar selected', 'info', 'Avatar Changed');
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            if (updateProfile) {
                await updateProfile({
                    name: name.trim(),
                    phone: phone.trim(),
                    email: email.trim(),
                    address: address.trim()
                });
            }

            // Also sync to Supabase clients table if matching record exists
            if (activeClient?.id || user?.email) {
                await supabase
                    .from('clients')
                    .update({
                        name: name.trim(),
                        phone: phone.trim()
                    })
                    .eq('email', user?.email || email);
            }

            showToast('Profile information saved successfully!', 'success', 'Profile Saved');
        } catch (err) {
            console.error('[Profile] Save failed:', err);
            showToast('Error saving profile: ' + err.message, 'error', 'Update Failed');
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            showToast('Password must be at least 6 characters long.', 'error', 'Weak Password');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match. Please verify.', 'error', 'Mismatch');
            return;
        }

        setChangingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            showToast('Password updated successfully via Supabase Auth!', 'success', 'Security Updated');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('[Profile] Password change failed:', err);
            showToast('Failed to update password: ' + err.message, 'error', 'Security Error');
        } finally {
            setChangingPassword(false);
        }
    };

    const userInitials = (name || user?.email || 'Client')
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 text-base-content">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-base-300">
                <div>
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                        Client Account
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content flex items-center gap-2">
                        <User size={28} className="text-primary" />
                        My Profile &amp; Security
                    </h1>
                    <p className="text-sm text-base-content/70 mt-1">
                        Manage your personal contact details, resident verification, and account password.
                    </p>
                </div>
                <Badge variant="primary" size="md">
                    Verified Resident
                </Badge>
            </div>

            {/* Top Row: Avatar & Property Context Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Avatar Preview & Upload (5 cols) */}
                <div className="md:col-span-5 bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center justify-between">
                    <div className="w-full flex flex-col items-center">
                        <div className="relative group mb-4">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg bg-base-200 flex items-center justify-center">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl sm:text-4xl font-extrabold text-primary">
                                        {userInitials}
                                    </span>
                                )}
                            </div>

                            {/* Camera overlay button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-1 right-1 p-2.5 rounded-full bg-primary text-primary-content shadow-md hover:scale-110 transition-transform cursor-pointer"
                                title="Upload new photo"
                                aria-label="Upload new photo"
                            >
                                <Camera size={16} />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarFileChange}
                                className="hidden"
                            />
                        </div>

                        <h3 className="font-bold text-lg text-base-content">{name || 'Client'}</h3>
                        <p className="text-xs text-base-content/60 mt-0.5">{email || 'Registered Investor'}</p>
                        
                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                            <ShieldCheck size={14} />
                            KYC Level 2 Verified
                        </div>
                    </div>

                    {/* Presets */}
                    <div className="mt-6 pt-4 border-t border-base-300 w-full">
                        <span className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider block mb-2.5">
                            Quick Avatar Presets
                        </span>
                        <div className="flex items-center justify-center gap-2">
                            {AVATAR_PRESETS.map((preset, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelectPreset(preset)}
                                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                                        avatarPreview === preset ? 'border-primary ring-2 ring-primary/30' : 'border-base-300 opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    <img src={preset} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Assigned Property Snapshot (7 cols) */}
                <div className="md:col-span-7 bg-base-100 border border-base-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-base-300">
                            <div className="flex items-center gap-2">
                                <Building2 size={18} className="text-primary" />
                                <h3 className="font-bold text-base text-base-content">Assigned Property Snapshot</h3>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                                Active Ownership
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="p-3 bg-base-200/70 rounded-xl border border-base-300/80">
                                <span className="text-[10px] font-semibold text-base-content/60 uppercase tracking-wider block">Unit Name</span>
                                <span className="font-extrabold text-sm sm:text-base text-base-content mt-0.5 block truncate">
                                    {userProfile?.propertyName || 'Unit 4B'}
                                </span>
                            </div>

                            <div className="p-3 bg-base-200/70 rounded-xl border border-base-300/80">
                                <span className="text-[10px] font-semibold text-base-content/60 uppercase tracking-wider block">Project Name</span>
                                <span className="font-extrabold text-sm sm:text-base text-base-content mt-0.5 block truncate">
                                    {userProfile?.projectName || 'Sardar Tower – Block A'}
                                </span>
                            </div>

                            <div className="p-3 bg-base-200/70 rounded-xl border border-base-300/80">
                                <span className="text-[10px] font-semibold text-base-content/60 uppercase tracking-wider block">Total Space</span>
                                <span className="font-extrabold text-sm sm:text-base text-base-content mt-0.5 block">
                                    {userProfile?.area || '1,850 sq. ft'}
                                </span>
                            </div>

                            <div className="p-3 bg-base-200/70 rounded-xl border border-base-300/80">
                                <span className="text-[10px] font-semibold text-base-content/60 uppercase tracking-wider block">Handover Date</span>
                                <span className="font-extrabold text-sm sm:text-base text-base-content mt-0.5 block">
                                    {userProfile?.handoverDate || 'Dec 2026'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-start gap-2.5">
                            <MapPin size={16} className="text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-base-content/80 leading-relaxed">
                                <span className="font-bold text-base-content">Registered Location: </span>
                                {userProfile?.propertyLoc || 'Plot 12-15, Sardar Tower Corridor, Narayanganj'}
                            </div>
                        </div>
                    </div>

                    <div className="text-[11px] text-base-content/50 mt-4 italic">
                        Property allocation is managed by NexusBuild Registry Services. Contact support for deed transfers.
                    </div>
                </div>

            </div>

            {/* Editable Profile Information Form */}
            <div className="bg-base-100 border border-base-300 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-base-300">
                    <div>
                        <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
                            <Sparkles size={18} className="text-primary" />
                            Personal &amp; Contact Information
                        </h2>
                        <p className="text-xs text-base-content/60 mt-0.5">
                            Update your official contact credentials used for statement delivery and site notifications.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-base-content/70 uppercase tracking-wider mb-1.5">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Full Name"
                                    className="w-full pl-10 pr-4 py-2.5 bg-base-200 border border-base-300 rounded-xl text-sm text-base-content focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-base-content/70 uppercase tracking-wider mb-1.5">
                                Phone Number *
                            </label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+880 1XXXXXXXXX"
                                    className="w-full pl-10 pr-4 py-2.5 bg-base-200 border border-base-300 rounded-xl text-sm text-base-content focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-base-content/70 uppercase tracking-wider mb-1.5">
                                Account Email (Primary Login)
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                                <input
                                    type="email"
                                    disabled
                                    value={email}
                                    className="w-full pl-10 pr-4 py-2.5 bg-base-200/50 border border-base-300 rounded-xl text-sm text-base-content/60 cursor-not-allowed"
                                    title="Contact administrator to change registered email"
                                />
                            </div>
                            <span className="text-[11px] text-base-content/50 mt-1 block">
                                Managed via Supabase Authentication identity.
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-base-content/70 uppercase tracking-wider mb-1.5">
                                Mailing / Permanent Address
                            </label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Apartment, Street, City"
                                    className="w-full pl-10 pr-4 py-2.5 bg-base-200 border border-base-300 rounded-xl text-sm text-base-content focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-base-content/70 uppercase tracking-wider mb-1.5">
                                Notes &amp; Personal Bio
                            </label>
                            <textarea
                                rows={3}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Preferred communication times, property instructions, or notes..."
                                className="w-full p-3 bg-base-200 border border-base-300 rounded-xl text-sm text-base-content focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-3">
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            disabled={savingProfile}
                            className="gap-2 rounded-xl"
                        >
                            {savingProfile ? (
                                <>
                                    <span className="loading loading-spinner loading-xs" />
                                    Saving Profile...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Password Change Section (Supabase Auth) */}
            <div className="bg-base-100 border border-base-300 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-base-300">
                    <div>
                        <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
                            <KeyRound size={18} className="text-primary" />
                            Change Account Password
                        </h2>
                        <p className="text-xs text-base-content/60 mt-0.5">
                            Update your password securely using Supabase Auth encrypted credential hashing.
                        </p>
                    </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-5 max-w-xl">
                    <div>
                        <label className="block text-xs font-bold text-base-content/70 uppercase tracking-wider mb-1.5">
                            New Password *
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Minimum 6 characters"
                                className="w-full pl-10 pr-4 py-2.5 bg-base-200 border border-base-300 rounded-xl text-sm text-base-content focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-base-content/70 uppercase tracking-wider mb-1.5">
                            Confirm New Password *
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                                className="w-full pl-10 pr-4 py-2.5 bg-base-200 border border-base-300 rounded-xl text-sm text-base-content focus:outline-none focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            disabled={changingPassword || !newPassword}
                            className="gap-2 rounded-xl"
                        >
                            {changingPassword ? (
                                <>
                                    <span className="loading loading-spinner loading-xs" />
                                    Updating Security...
                                </>
                            ) : (
                                <>
                                    <KeyRound size={16} />
                                    Update Password
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

        </div>
    );
};

export default Profile;
