import { createContext, useContext, useEffect, useState } from 'react';

// Three modes: 'light' | 'dark' | 'system'
const ThemeContext = createContext(null);

const STORAGE_KEY = 'crm-theme';

function getSystemPreference() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(mode) {
    const resolved = mode === 'system' ? getSystemPreference() : mode;
    const html = document.documentElement;
    if (resolved === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        return localStorage.getItem(STORAGE_KEY) || 'system';
    });

    // Apply on mount and whenever theme changes
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    // Listen for OS preference changes when in 'system' mode
    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if (theme === 'system') applyTheme('system');
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);

    const setTheme = (mode) => {
        localStorage.setItem(STORAGE_KEY, mode);
        setThemeState(mode);
    };

    const resolvedTheme = theme === 'system' ? getSystemPreference() : theme;

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
}
