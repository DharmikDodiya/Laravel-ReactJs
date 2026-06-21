import { Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/Context/ThemeContext';

const navItems = [
    { label: 'Dashboard',  icon: 'dashboard', route: 'dashboard',        match: 'dashboard'    },
    { label: 'Contacts',   icon: 'groups',    route: 'contacts.index',   match: 'contacts.*'   },
    { label: 'Activities', icon: 'history',   route: 'activities.index', match: 'activities.*' },
    { label: 'Settings',   icon: 'settings',  route: 'settings.index', match: 'settings.*', adminOnly: true },
];

export default function AuthenticatedLayout({ children }) {
    const user = usePage().props.auth.user;

    const { theme, setTheme } = useTheme();

    const themeOptions = [
        { value: 'light',  icon: 'light_mode',        label: 'Light'  },
        { value: 'system', icon: 'brightness_auto',   label: 'System' },
        { value: 'dark',   icon: 'dark_mode',         label: 'Dark'   },
    ];
    // On large screens (≥1280px) sidebar is always visible
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const overlayRef = useRef(null);

    const initials = user.name
        ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'U';

    const handleLogout = () => router.post(route('logout'));

    // Close drawer on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [usePage().url]);

    // Close on Escape key
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    // Prevent body scroll when drawer is open on mobile
    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [sidebarOpen]);

    return (
        <div className="min-h-screen bg-background text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">

            {/* ── Sidebar ── */}
            {/*
                Breakpoints:
                - Mobile  (<768px)  : drawer, slides in from left, overlay backdrop
                - Tablet  (768–1023px): drawer, same as mobile
                - Small laptop (1024–1279px): drawer (hamburger visible in header)
                - Large laptop (≥1280px): always-visible fixed sidebar, no hamburger
            */}

            {/* Backdrop overlay — visible on mobile/tablet/small-laptop when open */}
            {sidebarOpen && (
                <div
                    ref={overlayRef}
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside
                className={[
                    // Base styles
                    'fixed top-0 left-0 h-full w-60 z-50 flex flex-col py-md px-sm',
                    'bg-surface-container-low border-r border-outline-variant',
                    'transition-transform duration-300 ease-in-out',
                    // Large laptop: always visible (translate-x-0), no transition needed
                    'xl:translate-x-0',
                    // Below xl: slide in/out
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0',
                ].join(' ')}
                aria-label="Sidebar navigation"
            >
                {/* Logo + close button (close only shown on <xl) */}
                <div className="px-md mb-xl flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                        <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
                        </div>
                        <div>
                            <h1 className="text-headline-md font-bold text-primary leading-tight">LeadGen CRM</h1>
                            <p className="text-label-md text-on-surface-variant opacity-70">Enterprise</p>
                        </div>
                    </div>
                    {/* Close button — only on smaller screens */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="xl:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors"
                        aria-label="Close sidebar"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                    </button>
                </div>

                {/* Nav links */}
                <nav className="flex-1 space-y-xs overflow-y-auto">
                    {navItems.map(item => {
                        if (item.adminOnly && user.role !== 'admin') return null;

                        let isActive = false;
                        let href = '#';
                        try {
                            if (item.match) isActive = route().current(item.match);
                            if (item.route) href = route(item.route);
                        } catch (_) {}
                        return (
                            <Link
                                key={item.label}
                                href={href}
                                className={[
                                    'flex items-center gap-md px-md py-sm rounded-lg text-body-md transition-all active:scale-95',
                                    isActive
                                        ? 'text-primary bg-secondary-container font-bold'
                                        : 'text-on-surface-variant hover:bg-surface-container-high',
                                ].join(' ')}
                            >
                                <span className="material-symbols-outlined">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Theme toggle */}
                <div className="mt-md mb-sm px-xs">
                    <p className="text-[10px] text-on-surface-variant opacity-50 uppercase tracking-widest font-bold mb-xs px-sm">Theme</p>
                    <div className="flex rounded-lg overflow-hidden border border-outline-variant bg-surface-container">
                        {themeOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setTheme(opt.value)}
                                title={opt.label}
                                className={[
                                    'flex-1 flex items-center justify-center py-sm gap-xs transition-all text-label-sm font-semibold',
                                    theme === opt.value
                                        ? 'bg-primary text-on-primary shadow-sm'
                                        : 'text-on-surface-variant hover:bg-surface-container-high',
                                ].join(' ')}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{opt.icon}</span>
                                <span className="hidden lg:inline">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* User footer */}
                <div className="mt-auto p-md rounded-xl bg-surface-container-high/50 border border-outline-variant/30">
                    <div className="flex items-center gap-sm mb-sm">
                        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                            <span className="text-on-primary text-xs font-bold">{initials}</span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-label-md font-semibold truncate">{user.name}</p>
                            <p className="text-[10px] text-on-surface-variant opacity-60 capitalize">{user.role || 'User'} Access</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full py-xs px-sm rounded-md bg-error-container text-on-error-container text-label-md flex items-center justify-center gap-xs hover:opacity-80 transition-opacity"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* ── Top Header ── */}
            {/*
                - Large laptop (xl+): offset by sidebar width (pl-60), no hamburger
                - Below xl: full width, hamburger shown on left
            */}
            <header className="fixed top-0 right-0 h-16 z-40 bg-surface border-b border-outline-variant flex items-center px-lg gap-md
                               w-full xl:w-[calc(100%-240px)]">

                {/* Hamburger — hidden on large laptop */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="xl:hidden w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors shrink-0"
                    aria-label="Open navigation"
                    aria-expanded={sidebarOpen}
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>

                {/* Spacer to push right actions to the right */}
                <div className="flex-1"></div>

                {/* Right actions */}
                <div className="flex items-center gap-sm shrink-0">
                    <div className="hidden sm:block h-8 w-px bg-outline-variant"></div>

                    <Link
                        href={route('contacts.index')}
                        className="flex items-center gap-xs bg-primary text-on-primary px-md py-2 rounded-lg text-label-md shadow-sm hover:shadow-md active:scale-95 transition-all"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                        <span className="hidden sm:inline">Quick Add</span>
                    </Link>
                </div>
            </header>

            {/* ── Main Content ── */}
            {/*
                - Large laptop (xl+): offset left by sidebar (pl-60)
                - Below xl: no left offset (sidebar is a drawer overlay)
            */}
            <main className="pt-16 min-h-screen bg-background xl:pl-60">
                {children}
            </main>
        </div>
    );
}
