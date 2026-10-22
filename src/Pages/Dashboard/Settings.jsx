import { useState } from 'react';
import {
    Settings as SettingsIcon, Bell, Moon, Sun,
    CheckCircle2, AlertTriangle, Monitor, Lock, Trash2
} from 'lucide-react';
import { useTheme } from '../../Context/ThemeContext';
import { useAuth } from '../../Context/AuthContext';
import { showToast } from '../../Components/Toast/globalToast';
import { Button, Badge, Modal } from '../../Components/UI';

const Settings = () => {
    const { theme, isDark, setTheme } = useTheme();
    const { user } = useAuth();

    // Notification preferences state (persisted to localStorage)
    const [notifSettings, setNotifSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('client_notif_prefs');
            return saved ? JSON.parse(saved) : {
                emailStatements: true,
                emailProgress: true,
                smsReminders: true,
                marketingBroadcasts: false
            };
        } catch {
            return {
                emailStatements: true,
                emailProgress: true,
                smsReminders: true,
                marketingBroadcasts: false
            };
        }
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleToggleNotif = (key) => {
        setNotifSettings(prev => {
            const next = { ...prev, [key]: !prev[key] };
            try {
                localStorage.setItem('client_notif_prefs', JSON.stringify(next));
            } catch {
                // Ignore storage write issues
            }
            showToast('Notification preference updated.', 'info', 'Preferences Saved');
            return next;
        });
    };

    const handleConfirmAccountClosure = async () => {
        if (confirmText.toLowerCase() !== 'delete') {
            showToast('Please type "DELETE" to confirm account deactivation.', 'error', 'Confirmation Required');
            return;
        }

        setIsDeleting(true);
        try {
            // Emulate account closure request
            await new Promise(r => setTimeout(r, 1000));
            showToast('Your account closure request has been submitted to the compliance officer.', 'success', 'Request Submitted');
            setIsDeleteModalOpen(false);
            setConfirmText('');
        } catch (err) {
            showToast('Failed to process request: ' + err.message, 'error', 'Error');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 text-base-content">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-base-300">
                <div>
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                        Preferences &amp; Security
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content flex items-center gap-2">
                        <SettingsIcon size={28} className="text-primary" />
                        Account Settings
                    </h1>
                    <p className="text-sm text-base-content/70 mt-1">
                        Configure application theme, communication channels, and account lifecycle preferences.
                    </p>
                </div>
                <Badge variant="neutral" size="md">
                    Version 2.4.0
                </Badge>
            </div>

            {/* 1. Theme Configuration Card */}
            <div className="bg-base-100 border border-base-300 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-base-300">
                    <div>
                        <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
                            {isDark ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
                            Theme &amp; Visual Appearance
                        </h2>
                        <p className="text-xs text-base-content/60 mt-0.5">
                            Select between Blueprint Navy (Dark) or Crisp Modern (Light) visual presentation.
                        </p>
                    </div>
                    <span className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                        Current: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Light Theme Option */}
                    <div
                        onClick={() => setTheme('light')}
                        className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                            !isDark
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-base-300 hover:border-base-content/30 bg-base-200/50'
                        }`}
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                                <Sun size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-base-content">Crisp Light Mode</h3>
                                <p className="text-xs text-base-content/60">Optimized for daytime inspection</p>
                            </div>
                        </div>
                        {!isDark && <CheckCircle2 size={18} className="text-primary flex-shrink-0" />}
                    </div>

                    {/* Dark Theme Option */}
                    <div
                        onClick={() => setTheme('dark')}
                        className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                            isDark
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-base-300 hover:border-base-content/30 bg-base-200/50'
                        }`}
                    >
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center font-bold">
                                <Moon size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-base-content">Blueprint Dark Mode</h3>
                                <p className="text-xs text-base-content/60">Architectural high-contrast palette</p>
                            </div>
                        </div>
                        {isDark && <CheckCircle2 size={18} className="text-primary flex-shrink-0" />}
                    </div>
                </div>
            </div>

            {/* 2. Notification Preferences Card */}
            <div className="bg-base-100 border border-base-300 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-base-300">
                    <div>
                        <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
                            <Bell size={18} className="text-primary" />
                            Communication &amp; Notification Channels
                        </h2>
                        <p className="text-xs text-base-content/60 mt-0.5">
                            Configure alerts for milestone completion, financial statement dispatches, and reminders.
                        </p>
                    </div>
                </div>

                <div className="divide-y divide-base-300">
                    <div className="py-4 flex items-center justify-between gap-4">
                        <div>
                            <h4 className="text-sm font-bold text-base-content">Monthly Statement Statements</h4>
                            <p className="text-xs text-base-content/60">Receive electronic PDF statements on the 1st of every month.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifSettings.emailStatements}
                            onChange={() => handleToggleNotif('emailStatements')}
                            className="toggle toggle-primary"
                        />
                    </div>

                    <div className="py-4 flex items-center justify-between gap-4">
                        <div>
                            <h4 className="text-sm font-bold text-base-content">Construction Milestone Broadcasts</h4>
                            <p className="text-xs text-base-content/60">Get photo and engineer progress notes whenever a phase is updated.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifSettings.emailProgress}
                            onChange={() => handleToggleNotif('emailProgress')}
                            className="toggle toggle-primary"
                        />
                    </div>

                    <div className="py-4 flex items-center justify-between gap-4">
                        <div>
                            <h4 className="text-sm font-bold text-base-content">SMS Due Reminders</h4>
                            <p className="text-xs text-base-content/60">Urgent SMS notifications 3 days before an installment due date.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifSettings.smsReminders}
                            onChange={() => handleToggleNotif('smsReminders')}
                            className="toggle toggle-primary"
                        />
                    </div>

                    <div className="py-4 flex items-center justify-between gap-4">
                        <div>
                            <h4 className="text-sm font-bold text-base-content">Market &amp; New Launch Updates</h4>
                            <p className="text-xs text-base-content/60">Occasional updates on upcoming NexusBuild commercial and residential towers.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={notifSettings.marketingBroadcasts}
                            onChange={() => handleToggleNotif('marketingBroadcasts')}
                            className="toggle toggle-primary"
                        />
                    </div>
                </div>
            </div>

            {/* 3. Session Security Information */}
            <div className="bg-base-100 border border-base-300 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-base-300">
                    <div>
                        <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
                            <Lock size={18} className="text-primary" />
                            Active Device &amp; Session Security
                        </h2>
                        <p className="text-xs text-base-content/60 mt-0.5">
                            Authenticated session credentials managed by Supabase Edge Auth.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-base-200/60 rounded-xl border border-base-300 gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <Monitor size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-base-content">Current Web Browser Session</h4>
                            <p className="text-xs text-base-content/60 font-mono mt-0.5">
                                User Identity: {user?.id?.slice(0, 18) || 'Authenticated'}...
                            </p>
                        </div>
                    </div>

                    <Badge variant="success" size="sm">
                        Active Now
                    </Badge>
                </div>
            </div>

            {/* 4. Danger Zone */}
            <div className="bg-error/5 border border-error/20 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-error flex items-center gap-2">
                            <AlertTriangle size={18} />
                            Deactivate Account &amp; Compliance Data Archival
                        </h2>
                        <p className="text-xs text-base-content/70 mt-1 max-w-xl leading-relaxed">
                            Requesting account deactivation will notify the compliance officer. All contractual property deeds and financial receipts will remain archived per statutory real estate regulations.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="flex-shrink-0 gap-1.5 rounded-xl"
                    >
                        <Trash2 size={15} />
                        Request Closure
                    </Button>
                </div>
            </div>

            {/* Account Deletion Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Account Closure Request"
                size="md"
                actions={
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            disabled={confirmText.toLowerCase() !== 'delete' || isDeleting}
                            onClick={handleConfirmAccountClosure}
                            className="gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <span className="loading loading-spinner loading-xs" />
                                    Processing...
                                </>
                            ) : (
                                'Confirm Deactivation'
                            )}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs leading-relaxed flex items-start gap-2">
                        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>
                            This will disable your online portal access. To re-enable, you will need to re-verify identity with the site office.
                        </span>
                    </div>

                    <p className="text-xs text-base-content/80">
                        To proceed, please type <strong className="text-error font-bold">DELETE</strong> below:
                    </p>

                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="w-full px-3 py-2 bg-base-200 border border-base-300 rounded-lg text-sm text-base-content focus:outline-none focus:border-error"
                    />
                </div>
            </Modal>

        </div>
    );
};

export default Settings;
