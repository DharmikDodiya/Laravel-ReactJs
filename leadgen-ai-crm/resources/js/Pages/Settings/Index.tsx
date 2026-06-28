import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/* ── Role metadata for badge styling ── */
const ROLE_CONFIG = {
    admin: {
        label: 'Admin',
        icon: 'shield_person',
        bgClass: 'bg-blue-50 dark:bg-blue-950/40',
        textClass: 'text-blue-700 dark:text-blue-300',
        borderClass: 'border-blue-200 dark:border-blue-800',
        iconBg: 'bg-blue-100 dark:bg-blue-900/60',
        hoverClass: 'hover:bg-blue-100/80 dark:hover:bg-blue-900/40',
    },
    sales_rep: {
        label: 'Sales Rep',
        icon: 'person',
        bgClass: 'bg-amber-50 dark:bg-amber-950/40',
        textClass: 'text-amber-700 dark:text-amber-300',
        borderClass: 'border-amber-200 dark:border-amber-800',
        iconBg: 'bg-amber-100 dark:bg-amber-900/60',
        hoverClass: 'hover:bg-amber-100/80 dark:hover:bg-amber-900/40',
    },
};

/* ── Custom Role Dropdown Component ── */
function RoleDropdown({ value, roles, disabled, onChange }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const current = ROLE_CONFIG[value] || ROLE_CONFIG.sales_rep;

    // Reposition popover relative to trigger
    const reposition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;

        let left = rect.left + scrollX;
        if (left + 200 > window.innerWidth) {
            left = rect.right + scrollX - 200;
        }

        setPos({
            top: rect.bottom + scrollY + 6,
            left: Math.max(8, left),
        });
    }, []);

    const handleOpen = () => {
        reposition();
        setOpen(prev => !prev);
    };

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target) &&
                popoverRef.current && !popoverRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    // Reposition on scroll/resize
    useEffect(() => {
        if (!open) return;
        const handler = () => reposition();
        window.addEventListener('scroll', handler, true);
        window.addEventListener('resize', handler);
        return () => {
            window.removeEventListener('scroll', handler, true);
            window.removeEventListener('resize', handler);
        };
    }, [open, reposition]);

    const select = (role) => {
        if (role !== value) onChange(role);
        setOpen(false);
    };

    return (
        <div className="relative inline-block">
            {/* Trigger button */}
            <button
                ref={triggerRef}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && handleOpen()}
                className={`
                    inline-flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-2.5 pr-2.5 sm:pr-3 py-1.5 rounded-xl
                    border text-body-sm font-semibold transition-all duration-200
                    ${current.bgClass} ${current.textClass} ${current.borderClass}
                    ${disabled
                        ? 'opacity-60 cursor-not-allowed'
                        : `cursor-pointer ${current.hoverClass} shadow-sm hover:shadow-md`
                    }
                `}
            >
                <span
                    className={`w-6 h-6 rounded-lg ${current.iconBg} flex items-center justify-center`}
                >
                    <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}
                    >
                        {current.icon}
                    </span>
                </span>
                <span className="hidden xs:inline">{current.label}</span>
                <span className="xs:hidden">{current.label}</span>
                {!disabled && (
                    <span
                        className={`material-symbols-outlined transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                        style={{ fontSize: '16px' }}
                    >
                        expand_more
                    </span>
                )}
            </button>

            {/* Portal-rendered popover */}
            {open && createPortal(
                <div
                    ref={popoverRef}
                    className="w-[200px] animate-dropdown-in"
                    style={{
                        position: 'absolute',
                        top: `${pos.top}px`,
                        left: `${pos.left}px`,
                        zIndex: 9999,
                    }}
                >
                    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xl overflow-hidden">
                        <div className="px-3 py-2 border-b border-outline-variant/30">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                                Assign Role
                            </p>
                        </div>
                        <div className="py-1">
                            {roles.map((role) => {
                                const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.sales_rep;
                                const isSelected = role === value;
                                return (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => select(role)}
                                        className={`
                                            w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all duration-150
                                            ${isSelected
                                                ? `${cfg.bgClass} ${cfg.textClass} font-semibold`
                                                : 'text-on-surface hover:bg-surface-container-low'
                                            }
                                        `}
                                    >
                                        <span
                                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                                isSelected ? cfg.iconBg : 'bg-surface-container'
                                            }`}
                                        >
                                            <span
                                                className={`material-symbols-outlined ${isSelected ? cfg.textClass : 'text-on-surface-variant'}`}
                                                style={{ fontSize: '16px', fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                                            >
                                                {cfg.icon}
                                            </span>
                                        </span>
                                        <span className="flex-1 text-body-sm">{cfg.label}</span>
                                        {isSelected && (
                                            <span
                                                className={`material-symbols-outlined ${cfg.textClass}`}
                                                style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}
                                            >
                                                check_circle
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export default function SettingsIndex({ users, roles, currentUserId }) {
    const flash = usePage().props.flash || {};
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = (users || []).filter(user => {
        const query = searchQuery.toLowerCase();
        return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
    });

    const updateRole = (userId, role) => {
        router.patch(
            route('users.update-role', userId),
            { role },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Project Settings" />

            <div className="p-lg max-w-[1440px] mx-auto min-h-screen flex flex-col md:flex-row gap-lg">
                
                {/* ── Settings Sidebar ── */}
                <div className="w-full md:w-64 shrink-0">
                    <h2 className="text-headline-md font-bold mb-md px-sm text-on-surface">Settings</h2>
                    <nav className="flex md:flex-col gap-xs overflow-x-auto pb-sm md:pb-0">
                        <button
                            className="flex items-center gap-md px-md py-sm rounded-xl text-label-md transition-all whitespace-nowrap font-bold bg-primary text-on-primary shadow-sm"
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>
                                shield_person
                            </span>
                            Team Access
                        </button>
                    </nav>
                </div>

                {/* ── Settings Content ── */}
                <div className="flex-1 max-w-4xl">
                    <div className="animate-fade-in space-y-md">
                        <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                            <div className="p-lg border-b border-outline-variant bg-surface-container-low/30">
                                <h3 className="text-title-lg font-semibold text-on-surface">
                                    Team Access
                                </h3>
                                <p className="text-body-sm text-on-surface-variant mt-xs">
                                    Manage roles and permissions across your workspace.
                                </p>
                            </div>

                            <div className="p-md sm:p-lg">
                                {flash.success && (
                                    <div className="mb-md rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600 font-medium">
                                        {flash.success}
                                    </div>
                                )}
                                {flash.error && (
                                    <div className="mb-md rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error font-medium">
                                        {flash.error}
                                    </div>
                                )}

                                <div className="mb-md flex justify-end">
                                    <div className="relative w-full sm:max-w-xs">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '20px' }}>search</span>
                                        <input
                                            type="text"
                                            placeholder="Search name or email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary transition-all outline-none text-on-surface"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-outline-variant/50">
                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                        <thead className="bg-surface-container-low/50">
                                            <tr className="border-b border-outline-variant/50 text-label-sm uppercase tracking-wider text-on-surface-variant">
                                                <th className="py-sm px-md font-semibold">Name</th>
                                                <th className="py-sm px-md font-semibold">Email</th>
                                                <th className="py-sm px-md font-semibold">Role</th>
                                                <th className="py-sm px-md font-semibold">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-outline-variant/30">
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors group">
                                                    <td className="py-md px-md">
                                                        <div className="flex items-center gap-sm">
                                                            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs shrink-0">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="text-body-md font-medium text-on-surface">{user.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-md px-md text-body-md text-on-surface-variant">
                                                        {user.email}
                                                    </td>
                                                    <td className="py-md px-md">
                                                        <RoleDropdown
                                                            value={user.role}
                                                            roles={roles || []}
                                                            disabled={user.id === currentUserId && user.role === 'admin'}
                                                            onChange={(role) => updateRole(user.id, role)}
                                                        />
                                                    </td>
                                                    <td className="py-md px-md text-body-sm text-on-surface-variant">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="py-xl text-center text-on-surface-variant">
                                                        No users found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Custom animations */}
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-dropdown-in {
                    animation: dropdownIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes dropdownIn {
                    from { opacity: 0; transform: translateY(-4px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}
            </style>
        </AuthenticatedLayout>
    );
}
