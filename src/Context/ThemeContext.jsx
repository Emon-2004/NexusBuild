import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        try {
            const saved = localStorage.getItem('nexusbuild_theme');
            if (saved === 'dark' || saved === 'light') {
                return saved;
            }
            if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        } catch (e) {
            console.error('Error accessing localStorage:', e);
        }
        return 'light';
    });

    // Listen to OS / system preference changes when no explicit localStorage choice is set
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            const saved = localStorage.getItem('nexusbuild_theme');
            if (!saved) {
                setThemeState(e.matches ? 'dark' : 'light');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        try {
            document.documentElement.setAttribute('data-theme', theme);
        } catch (e) {
            console.error('Error setting theme:', e);
        }
    }, [theme]);

    const toggleTheme = () => {
        setThemeState(prev => {
            const next = prev === 'dark' ? 'light' : 'dark';
            try {
                localStorage.setItem('nexusbuild_theme', next);
            } catch (e) {
                console.error('Error writing to localStorage:', e);
            }
            return next;
        });
    };

    const setTheme = (newTheme) => {
        if (newTheme === 'dark' || newTheme === 'light') {
            setThemeState(newTheme);
            try {
                localStorage.setItem('nexusbuild_theme', newTheme);
            } catch (e) {
                console.error('Error writing to localStorage:', e);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
