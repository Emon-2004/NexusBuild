import { createContext, useContext } from 'react';
import { useDatabase } from './DatabaseContext';
import { useAuth } from './AuthContext';
import { DEFAULT_SYSTEM_SETTINGS } from '../config/defaultSettings';
import { showToast } from '../Components/Toast/globalToast';

const ClientDataContext = createContext(null);

export const ClientDataProvider = ({ children }) => {
    const db = useDatabase();
    const { user } = useAuth();
    const loading = db.loading;

    // Find the client record using the authenticated user's email.
    // This connects their Supabase Auth account to their NexusBuild Client record.
    const activeClient = db.clients.find(c => c.email === user?.email);
    const activeClientId = activeClient?.id || 'client_1'; // fallback just in case
    
    // Derived state from global database
    const activeProperty = db.properties.find(p => p.clientId === activeClientId);
    const activeProject = db.projects.find(p => p.id === activeProperty?.projectId) || db.projects[0];

    const userProfile = {
        name: activeClient?.name || user?.email?.split('@')[0] || 'Client',
        email: activeClient?.email || user?.email || '',
        phone: activeClient?.phone || '',
        propertyDesc: (activeProperty?.unitName && activeProperty.unitName !== 'Not specified')
            ? `${activeProperty.unitName} - ${activeProject?.name || 'Sardar Tower – Block A'}`
            : (activeProject?.name || 'Sardar Tower – Block A'),
        propertyName: (activeProperty?.unitName && activeProperty.unitName !== 'Not specified')
            ? activeProperty.unitName
            : (activeProject?.name || 'Sardar Tower – Block A'),
        propertyLoc: activeProperty?.location || activeProject?.location || 'Plot 12-15, Sardar Tower Corridor, Narayanganj',
        area: activeProperty?.area || activeProject?.area || '1,850 sq. ft',
        handoverDate: activeProperty?.handoverDate || activeProperty?.handover_date || activeProject?.handoverDate || 'Dec 2026',
        projectImage: activeProject?.image || activeProperty?.image || '/Frontend/Projects/Reliance_Zenith_Towers.svg',
        projectName: activeProject?.name || 'Sardar Tower – Block A'
    };

    const financials = {
        propertyId: activeProperty?.id,
        totalValuation: activeProperty?.totalValuation,
        totalPaid: activeProperty?.totalPaid,
        otherCharges: activeProperty?.otherCharges,
        dueBalance: activeProperty?.dueBalance,
        installments: db.installments.filter(i => i.propertyId === activeProperty?.id),
        transactions: db.transactions.filter(t => t.propertyId === activeProperty?.id)
    };

    // Client sees only projects they have properties in (or all projects as fallback)
    const clientProjectIds = [...new Set(db.properties.filter(p => p.clientId === activeClientId).map(p => p.projectId))];
    const projects = db.projects.length > 0 ? (clientProjectIds.length > 0 ? db.projects.filter(p => clientProjectIds.includes(p.id)) : db.projects) : [];

    // Client sees updates for their assigned projects (or all updates if fallback)
    const siteUpdates = db.siteUpdates ? db.siteUpdates.filter(u => {
        const pId = u.projectId || u.project_id;
        return clientProjectIds.length === 0 || clientProjectIds.includes(pId);
    }) : [];

    const support = {
        exec: {
            name: db.systemSettings?.accountExecName || DEFAULT_SYSTEM_SETTINGS.accountExecName,
            role: db.systemSettings?.accountExecRole || DEFAULT_SYSTEM_SETTINGS.accountExecRole,
            email: db.systemSettings?.accountExecEmail || DEFAULT_SYSTEM_SETTINGS.accountExecEmail,
            phone: db.systemSettings?.accountExecPhone || DEFAULT_SYSTEM_SETTINGS.accountExecPhone
        },
        faqs: [
            { q: 'How do I submit a variation order request?', a: 'All variation order requests must be submitted through your assigned Project Manager via this portal. Navigate to the "Submit Request" form on the left, select "Change Order", and attach any relevant architectural sketches or vendor quotes.' },
            { q: 'When will I receive the final handover schedule?', a: 'The tentative handover date is listed under the "Project Progress" tab. A finalized, confirmed date will be issued in writing 30 days prior to the substantial completion milestone.' },
        ],
        tickets: db.tickets.filter(t => t.clientId === activeClientId)
    };

    const submitTicket = async (type, subject, message) => {
        await db.addClientTicket(activeClientId, type, subject, message);
        showToast('Ticket submitted successfully! We will get back to you shortly.');
    };

    const downloadStatement = () => {
        window.print();
    };

    const updateProfile = async (updatedData) => {
        await db.updateClient(activeClientId, updatedData);
    };

    const value = {
        loading,
        userProfile,
        activeClient,
        activeClientId,
        activeProject,
        financials,
        projects,
        siteUpdates,
        support,
        submitTicket,
        deleteTicket: db.deleteTicket,
        downloadStatement,
        updateProfile,
        addInstallment: db.addInstallment
    };

    return (
        <ClientDataContext.Provider value={value}>
            {children}
        </ClientDataContext.Provider>
    );
};

export const useClientData = () => {
    const context = useContext(ClientDataContext);
    if (!context) throw new Error("useClientData must be used within a ClientDataProvider");
    return context;
};
