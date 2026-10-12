import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUserRole = async (sessionUser) => {
        const { data: clientData, error } = await supabase
            .from('clients')
            .select('*')
            .eq('email', sessionUser.email)
            .maybeSingle();

        if (clientData && clientData.status === 'Active') {
            return {
                id: sessionUser.id,
                email: sessionUser.email,
                role: clientData.role || 'client',
                clientId: clientData.id,
                name: clientData.name,
                phone: clientData.phone
            };
        } else if (clientData && clientData.role === 'admin') {
             return {
                id: sessionUser.id,
                email: sessionUser.email,
                role: 'admin',
                clientId: clientData.id,
                name: clientData.name,
                phone: clientData.phone
            };
        }

        // ── Fallback when approval is commented out (so users without active approval can still log in) ──
        return {
            id: sessionUser.id,
            email: sessionUser.email,
            role: clientData?.role || (sessionUser.email === 'admin@example.com' ? 'admin' : 'client'),
            clientId: clientData?.id || sessionUser.id,
            name: clientData?.name || sessionUser.user_metadata?.full_name || sessionUser.email.split('@')[0],
            phone: clientData?.phone || sessionUser.user_metadata?.phone || ''
        };
        // return null; // Uncomment when restoring mandatory admin approval
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const userData = await loadUserRole(session.user);
                setUser(userData);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const userData = await loadUserRole(session.user);
                if (userData) {
                    setUser(userData);
                } else {
                    // ── Unapproved or invalid -> sign out immediately (commented out for future use) ──
                    // await supabase.auth.signOut();
                    // setUser(null);
                }
                setLoading(false);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email, password) => {
        const { data: clientData, error: clientErr } = await supabase
            .from('clients')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        // ── Admin Approval Check (Temporarily commented out for future use) ──
        // if (clientErr || !clientData) {
        //     throw new Error("Your account is pending admin approval or does not exist. Our team will contact you soon.");
        // }
        // if (clientData.status !== 'Active' && clientData.role !== 'admin') {
        //     throw new Error("Your account is not active. Please contact support.");
        // }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Record login log
        supabase.rpc('record_login_log', {
            p_user_agent: navigator.userAgent ?? null,
            p_ip_address: null,
            p_login_method: 'email_password',
        }).then(({ error: logErr }) => {
            if (logErr) console.warn('[Login Log] Failed to record login:', logErr.message);
        });

        return data;
    };

    const signOut = async () => {
        try {
            await supabase.rpc('record_auth_log', {
                p_event_type: 'LOGOUT',
                p_user_agent: navigator.userAgent ?? null,
            });
        } catch (err) {
            console.warn('[Logout Log] Failed to record logout:', err.message);
        }
        
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};

export default AuthContext;
