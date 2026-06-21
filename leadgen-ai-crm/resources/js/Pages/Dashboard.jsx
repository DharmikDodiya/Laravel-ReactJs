import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';

const STATUS_COLORS = {
    Negotiation:     'bg-primary-fixed text-on-primary-fixed',
    Discovery:       'bg-secondary-container text-on-secondary-container',
    'At Risk':       'bg-error-container text-on-error-container',
    'Proposal Sent': 'bg-primary-fixed text-on-primary-fixed',
    'Closed Won':    'bg-green-100 text-green-700',
};

const SCORE_STYLE = (score) => {
    if (!score) return 'bg-gray-100 text-gray-600 border-gray-200';
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 50) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-red-100 text-red-700 border-red-200';
};

const DOT_COLOR = (score) => {
    if (!score) return 'bg-gray-400';
    if (score >= 80) return 'bg-green-600 pulse-dot';
    if (score >= 50) return 'bg-orange-600';
    return 'bg-red-600';
};

const AVATAR_BG = [
    'bg-secondary-container text-on-secondary-container',
    'bg-tertiary-fixed text-on-tertiary-fixed',
    'bg-primary-fixed text-on-primary-fixed',
    'bg-error-container text-on-error-container',
    'bg-surface-container-high text-on-surface-variant',
];

const initials = (name) =>
    name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

const timeAgo = (dateStr) => {
    if (!dateStr) return '—';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
};

export default function Dashboard() {
    const { auth, contacts, stats } = usePage().props;
    const user = auth.user;

    const leads     = contacts?.data ?? [];
    const paginator = contacts;

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="p-lg max-w-[1440px] mx-auto">

                {/* ── Bento Header ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-md mb-lg">

                    {/* Welcome hero card */}
                    <div className="sm:col-span-2 p-xl rounded-xl bg-primary text-on-primary flex flex-col justify-between relative overflow-hidden min-h-[180px]">
                        <div className="relative z-10">
                            <h2 className="text-headline-lg font-semibold mb-xs">
                                Welcome back, {user.name.split(' ')[0]}.
                            </h2>
                            <p className="text-body-md opacity-80 max-w-xs">
                                {stats?.high_priority > 0
                                    ? `You have ${stats.high_priority} high-priority lead${stats.high_priority !== 1 ? 's' : ''} waiting for follow-up today.`
                                    : 'No high-priority leads right now. Keep up the great work!'}
                            </p>
                        </div>
                        <div className="mt-lg flex items-center gap-xl relative z-10">
                            <div>
                                <p className="text-label-sm opacity-60 uppercase tracking-widest">Total Leads</p>
                                <p className="text-[24px] font-bold leading-tight">{stats?.total_contacts ?? 0}</p>
                            </div>
                            <div className="h-10 w-px bg-white/20"></div>
                            <div>
                                <p className="text-label-sm opacity-60 uppercase tracking-widest">Closed Won</p>
                                <p className="text-[24px] font-bold leading-tight">{stats?.closed_won ?? 0}</p>
                            </div>
                        </div>
                        {/* Abstract blob */}
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -top-8 -left-8 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                    </div>

                    {/* High Priority Leads */}
                    <div className="p-lg rounded-xl glass-card flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-sm">
                            <span className="material-symbols-outlined text-tertiary-container bg-tertiary-fixed p-2 rounded-lg" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                            <span className="text-tertiary text-label-md font-semibold">Score ≥ 70</span>
                        </div>
                        <p className="text-label-md text-on-surface-variant">High Priority</p>
                        <p className="text-headline-lg mt-xs font-semibold">{stats?.high_priority ?? 0}</p>
                    </div>

                    {/* Total Contacts */}
                    <div className="p-lg rounded-xl glass-card flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-sm">
                            <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg">groups</span>
                            <span className="text-primary text-label-md font-semibold">All Time</span>
                        </div>
                        <p className="text-label-md text-on-surface-variant">Total Contacts</p>
                        <p className="text-headline-lg mt-xs font-semibold">{stats?.total_contacts ?? 0}</p>
                    </div>
                </div>

                {/* ── Active Leads Table ── */}
                <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">

                    {/* Table header */}
                    <div className="p-lg border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-md">
                        <div>
                            <h3 className="text-headline-md font-semibold text-on-surface">Active Leads</h3>
                            <p className="text-body-sm text-on-surface-variant">
                                Managing {paginator?.total ?? 0} record{paginator?.total !== 1 ? 's' : ''} in current view
                            </p>
                        </div>
                        <div className="flex items-center gap-sm">
                            <Link
                                href={route('contacts.index')}
                                className="px-md py-sm rounded-lg border border-outline-variant text-label-md flex items-center gap-xs hover:bg-surface-container-low transition-colors"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
                                View All
                            </Link>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low/50">
                                    <th className="px-lg py-md text-label-md text-on-surface-variant border-b border-outline-variant">LEAD NAME</th>
                                    <th className="hidden md:table-cell px-lg py-md text-label-md text-on-surface-variant border-b border-outline-variant">COMPANY</th>
                                    <th className="hidden sm:table-cell px-lg py-md text-label-md text-on-surface-variant border-b border-outline-variant">STATUS</th>
                                    <th className="px-lg py-md text-label-md text-on-surface-variant border-b border-outline-variant text-center">AI SCORE</th>
                                    <th className="hidden lg:table-cell px-lg py-md text-label-md text-on-surface-variant border-b border-outline-variant">LAST UPDATED</th>
                                    <th className="px-lg py-md border-b border-outline-variant w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/30">
                                {leads.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-lg py-xl text-center text-on-surface-variant text-body-md">
                                            No leads yet.{' '}
                                            <Link href={route('contacts.index')} className="text-primary underline">
                                                Add your first contact
                                            </Link>
                                        </td>
                                    </tr>
                                ) : (
                                    leads.map((lead, idx) => (
                                        <tr key={lead.id} className="hover:bg-surface-container-low/30 transition-colors group">
                                            {/* Name */}
                                            <td className="px-lg py-md">
                                                <div className="flex items-center gap-md">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 ${AVATAR_BG[lead.id % AVATAR_BG.length]}`}>
                                                        {initials(lead.name)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-body-md font-semibold text-on-surface truncate">{lead.name}</p>
                                                        <p className="text-label-sm text-on-surface-variant truncate">{lead.email}</p>
                                                        {/* Show company inline on mobile */}
                                                        <p className="md:hidden text-label-sm text-on-surface-variant truncate">{lead.company || ''}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Company — hidden on mobile */}
                                            <td className="hidden md:table-cell px-lg py-md text-body-sm text-on-surface-variant">{lead.company || '—'}</td>

                                            {/* Status — hidden on mobile */}
                                            <td className="hidden sm:table-cell px-lg py-md">
                                                <span className={`inline-flex items-center px-sm py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[lead.status] || 'bg-surface-container text-on-surface-variant'}`}>
                                                    {lead.status || 'New'}
                                                </span>
                                            </td>

                                            {/* Score */}
                                            <td className="px-lg py-md text-center">
                                                <span className={`inline-flex items-center gap-xs px-md py-1 rounded-full text-label-md border ${SCORE_STYLE(lead.ai_score)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLOR(lead.ai_score)}`}></span>
                                                    {lead.ai_score ? Math.round(lead.ai_score) : '—'}
                                                </span>
                                            </td>

                                            {/* Last updated — hidden on small laptop */}
                                            <td className="hidden lg:table-cell px-lg py-md text-body-sm text-on-surface-variant">
                                                {timeAgo(lead.updated_at)}
                                            </td>

                                            {/* Action */}
                                            <td className="px-lg py-md text-right">
                                                <Link
                                                    href={route('contacts.show', lead.id)}
                                                    className="row-action p-sm rounded-lg hover:bg-surface-container-high text-on-surface-variant inline-flex"
                                                >
                                                    <span className="material-symbols-outlined">chevron_right</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {paginator && paginator.last_page > 1 && (
                        <div className="p-lg border-t border-outline-variant flex items-center justify-between">
                            <p className="text-body-sm text-on-surface-variant">
                                Showing {paginator.from ?? 0} to {paginator.to ?? 0} of {paginator.total} leads
                            </p>
                            <div className="flex items-center gap-xs">
                                <button
                                    disabled={!paginator.prev_page_url}
                                    onClick={() => paginator.prev_page_url && router.get(paginator.prev_page_url)}
                                    className="p-sm rounded-md border border-outline-variant disabled:opacity-30 hover:bg-surface-container-low transition-colors"
                                >
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                {Array.from({ length: paginator.last_page }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === paginator.last_page || Math.abs(p - paginator.current_page) <= 1)
                                    .reduce((acc, p, i, arr) => {
                                        if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, i) =>
                                        p === '...' ? (
                                            <span key={`ellipsis-${i}`} className="px-sm text-on-surface-variant">...</span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => router.get(paginator.path + '?page=' + p)}
                                                className={`px-md py-sm rounded-md text-label-md transition-colors ${
                                                    p === paginator.current_page
                                                        ? 'bg-primary-container text-on-primary-container'
                                                        : 'hover:bg-surface-container-low'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}
                                <button
                                    disabled={!paginator.next_page_url}
                                    onClick={() => paginator.next_page_url && router.get(paginator.next_page_url)}
                                    className="p-sm rounded-md border border-outline-variant disabled:opacity-30 hover:bg-surface-container-low transition-colors"
                                >
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Quick Actions ── */}
                <div className="mt-lg flex flex-wrap gap-md">
                    <Link
                        href={route('contacts.index')}
                        className="flex items-center gap-sm px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>groups</span>
                        Open Contacts
                    </Link>
                    <Link
                        href={route('profile.edit')}
                        className="flex items-center gap-sm px-lg py-sm border border-outline-variant rounded-lg text-label-md hover:bg-surface-container-low transition-colors"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>manage_accounts</span>
                        Manage Profile
                    </Link>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
