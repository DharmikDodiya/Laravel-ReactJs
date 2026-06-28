import { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { toast } from 'sonner';

const AVATAR_BG = [
    'bg-secondary-container text-on-secondary-container',
    'bg-tertiary-fixed text-on-tertiary-fixed',
    'bg-primary-fixed text-on-primary-fixed',
    'bg-error-container text-on-error-container',
];

const initials = (name) =>
    name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

const scoreRingOffset = (score) => {
    // circumference = 2π × 70 ≈ 440
    const pct = Math.min(Math.max(score || 0, 0), 100) / 100;
    return (440 * (1 - pct)).toFixed(1);
};

const scoreColor = (score) => {
    if (!score) return '#737686';
    if (score >= 80) return '#16a34a';
    if (score >= 50) return '#ea580c';
    return '#dc2626';
};

const STATUS_COLORS = {
    Negotiation:     'bg-primary-fixed text-on-primary-fixed',
    Discovery:       'bg-secondary-container text-on-secondary-container',
    'At Risk':       'bg-error-container text-on-error-container',
    'Proposal Sent': 'bg-primary-fixed text-on-primary-fixed',
    'Closed Won':    'bg-green-100 text-green-700',
};

export default function ContactShow() {
    const { contact, activities, activeAiProvider } = usePage().props;
    const [refreshing, setRefreshing] = useState(false);
    const [score, setScore] = useState(contact?.ai_score ?? 0);

    // States for adding activities
    const [showAddForm, setShowAddForm] = useState(false);
    const [actType, setActType] = useState('email_opened');
    const [actDescription, setActDescription] = useState('');
    const [actPerformedAt, setActPerformedAt] = useState(new Date().toISOString().slice(0, 16));
    const [submittingAct, setSubmittingAct] = useState(false);

    useEffect(() => {
        if (contact?.ai_score !== undefined) {
            setScore(Number(contact.ai_score));
        }
    }, [contact?.ai_score]);

    const avatarClass = AVATAR_BG[contact?.id % AVATAR_BG.length] || AVATAR_BG[0];

    const handleRefreshScore = () => {
        setRefreshing(true);
        router.post(route('contacts.refresh-score', contact.id), {}, {
            onSuccess: () => {
                setRefreshing(false);
                toast.success('AI score recalculated successfully.');
            },
            onError: () => {
                setRefreshing(false);
                toast.error('Failed to recalculate AI score. Please try again.');
            },
            preserveScroll: true,
        });
    };

    const getActivityDetails = (activity) => {
        const type = activity.type;
        switch (type) {
            case 'email_opened':
                return {
                    icon: 'mail',
                    title: 'Email Opened',
                    color: 'bg-blue-100 text-blue-700 border border-blue-200',
                    body: activity.description || 'Email was opened by the lead.',
                };
            case 'page_visited':
                return {
                    icon: 'language',
                    title: 'Page Visited',
                    color: 'bg-green-100 text-green-700 border border-green-200',
                    body: activity.description || 'Lead visited a website page.',
                };
            case 'call_logged':
                return {
                    icon: 'call',
                    title: 'Call Logged',
                    color: 'bg-orange-100 text-orange-700 border border-orange-200',
                    body: activity.description || 'A call with the lead was logged.',
                };
            default:
                return {
                    icon: 'chat',
                    title: 'Other Activity',
                    color: 'bg-gray-100 text-gray-700 border border-gray-200',
                    body: activity.description || 'An activity was logged.',
                };
        }
    };

    const formatPerformedAt = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleAddActivity = (e) => {
        e.preventDefault();
        setSubmittingAct(true);
        router.post(route('contacts.activities.store', contact.id), {
            type: actType,
            description: actDescription,
            performed_at: actPerformedAt,
        }, {
            onSuccess: () => {
                toast.success('Activity logged successfully');
                setShowAddForm(false);
                setActDescription('');
                setActType('email_opened');
                setActPerformedAt(new Date().toISOString().slice(0, 16));
                setSubmittingAct(false);
            },
            onError: (errs) => {
                setSubmittingAct(false);
                const firstErr = Object.values(errs)[0];
                toast.error(firstErr || 'Failed to log activity.');
            },
            preserveScroll: true,
        });
    };

    const handleDeleteActivity = (activityId) => {
        toast.warning(
            <div>
                <p className="font-semibold">Delete this activity?</p>
                <p className="text-sm opacity-80 mb-2">This action cannot be undone and will recalculate the AI score.</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            router.delete(route('activities.destroy', activityId), {
                                onSuccess: () => {
                                    toast.dismiss();
                                    toast.success('Activity deleted.');
                                },
                                onError: () => toast.error('Failed to delete.'),
                                preserveScroll: true,
                            });
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >Delete</button>
                    <button onClick={() => toast.dismiss()} className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm">
                        Cancel
                    </button>
                </div>
            </div>,
            { duration: 10000 }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${contact?.name ?? 'Lead'} | Lead Details`} />

            {/* ── Secondary header bar ── */}
            <div className="sticky top-16 z-30 bg-surface border-b border-outline-variant px-lg flex items-center gap-md h-14">
                <Link
                    href={route('contacts.index')}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors shrink-0"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <div className="min-w-0">
                    <h2 className="text-headline-md font-extrabold text-on-surface leading-none truncate">{contact?.name}</h2>
                    <span className="text-label-md text-primary opacity-80 uppercase tracking-wider hidden sm:block">Lead Profile</span>
                </div>
                <div className="ml-auto flex items-center gap-sm shrink-0">
                    <span className={`hidden sm:inline-flex items-center px-sm py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[contact?.status] || 'bg-surface-container text-on-surface-variant'}`}>
                        {contact?.status || 'New'}
                    </span>
                    <button
                        onClick={() => router.visit(route('contacts.index'))}
                        className="hidden md:block px-lg py-sm border border-outline-variant rounded-lg text-label-md hover:bg-surface-container-low transition-colors"
                    >
                        Back to Leads
                    </button>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="p-lg max-w-[1440px] mx-auto">
                <div className="grid grid-cols-12 gap-lg">

                    {/* ── Left Column: Contact Info ── */}
                    <div className="col-span-12 lg:col-span-3 space-y-lg">                        {/* Profile Card */}
                        <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
                            <div className="flex flex-col items-center text-center mb-lg">
                                <div className="relative mb-md">
                                    <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold border-4 border-surface-container ${avatarClass}`}>
                                        {initials(contact?.name)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
                                </div>
                                <h3 className="text-headline-md font-semibold text-on-surface">{contact?.name}</h3>
                                <p className="text-on-surface-variant text-body-sm">{contact?.title || 'Lead Contact'}</p>
                            </div>

                            <div className="space-y-md pt-md border-t border-outline-variant">
                                <div className="flex items-center gap-md">
                                    <span className="material-symbols-outlined text-outline shrink-0">corporate_fare</span>
                                    <div>
                                        <p className="text-label-sm text-outline uppercase">Company</p>
                                        <p className="text-body-md font-semibold">{contact?.company || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-md">
                                    <span className="material-symbols-outlined text-outline shrink-0">mail</span>
                                    <div className="overflow-hidden">
                                        <p className="text-label-sm text-outline uppercase">Email</p>
                                        <p className="text-body-md font-semibold truncate">{contact?.email}</p>
                                    </div>
                                </div>
                                {contact?.phone && (
                                    <div className="flex items-center gap-md">
                                        <span className="material-symbols-outlined text-outline shrink-0">call</span>
                                        <div>
                                            <p className="text-label-sm text-outline uppercase">Phone</p>
                                            <p className="text-body-md font-semibold">{contact.phone}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Metadata Card */}
                        <div className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
                            <h4 className="text-label-md text-on-surface mb-md uppercase tracking-wider">Metadata</h4>
                            <div className="space-y-xs">
                                {[
                                    { label: 'Created By',   value: contact?.created_by_name || contact?.createdBy?.name || '—', badge: false },
                                    { label: 'Last Updated', value: contact?.updated_at ? new Date(contact.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—', badge: false },
                                    { label: 'Status',       value: contact?.status || 'New', badge: true },
                                ].map(item => (
                                    <div key={item.label} className="flex justify-between items-center py-sm border-b border-outline-variant last:border-0">
                                        <span className="text-on-surface-variant text-body-sm">{item.label}</span>
                                        {item.badge ? (
                                            <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed rounded text-label-sm uppercase font-bold">
                                                {item.value}
                                            </span>
                                        ) : (
                                            <span className="text-body-sm font-semibold">{item.value}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-sm">
                            <Link
                                href={route('contacts.index')}
                                className="flex items-center justify-center gap-sm px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md active:scale-95 transition-all shadow-sm"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                Edit Contact
                            </Link>
                        </div>
                    </div>

                    {/* ── Center Column: AI Insights + Activity ── */}
                    <div className="col-span-12 lg:col-span-9 space-y-lg">

                        {/* AI Insights */}
                        <section className="ai-glow bg-white border border-outline-variant rounded-xl p-xl overflow-hidden">
                            {/* Header: always a single row */}
                            <div className="flex items-center justify-between mb-lg gap-sm">
                                <div className="flex items-center gap-sm">
                                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                    <h3 className="text-headline-md font-semibold text-on-surface">AI Engagement Insights</h3>
                                </div>
                                <button
                                    onClick={handleRefreshScore}
                                    disabled={refreshing}
                                    title={refreshing ? 'Recalculating…' : 'Refresh Score'}
                                    className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 shrink-0"
                                >
                                    <span className={`material-symbols-outlined text-[18px] ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
                                    <span className="hidden sm:inline">{refreshing ? 'Recalculating…' : 'Refresh Score'}</span>
                                </button>
                            </div>

                            <div className="flex flex-col gap-xl items-center md:flex-row">
                                {/* Score Ring */}
                                <div className="relative w-40 h-40 shrink-0">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                                        <circle cx="80" cy="80" r="70" fill="none" stroke="#eaedff" strokeWidth="12"/>
                                        <circle
                                            cx="80" cy="80" r="70" fill="none"
                                            stroke={scoreColor(score)}
                                            strokeWidth="12"
                                            strokeLinecap="round"
                                            strokeDasharray="440"
                                            strokeDashoffset={scoreRingOffset(score)}
                                            className="score-ring transition-all duration-700"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-[44px] font-extrabold text-on-surface leading-none">
                                            {score > 0 ? Math.round(score) : '—'}
                                        </span>
                                        <span className="text-label-sm text-outline">/ 100</span>
                                    </div>
                                </div>

                                {/* Rationale + badges */}
                                <div className="flex-1">
                                    {/* Color-coded intent badge */}
                                    <div className="flex items-center gap-sm mb-md">
                                        {score === 0 || score === null ? (
                                            <span className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-gray-100 text-gray-500 text-label-md font-bold border border-gray-200">
                                                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                                Not Scored
                                            </span>
                                        ) : score >= 80 ? (
                                            <span className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-green-100 text-green-700 text-label-md font-bold border border-green-200">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                High Intent
                                            </span>
                                        ) : score >= 50 ? (
                                            <span className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-amber-100 text-amber-700 text-label-md font-bold border border-amber-200">
                                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                Moderate
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-xs px-md py-xs rounded-full bg-red-100 text-red-700 text-label-md font-bold border border-red-200">
                                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                Cold Lead
                                            </span>
                                        )}
                                        <span className="text-label-sm text-outline">AI Lead Score</span>
                                    </div>

                                    {/* Rationale */}
                                    <div className="bg-surface-container-low p-lg rounded-xl border-l-4 border-primary mb-md">
                                        <h4 className="text-label-md font-bold text-primary mb-xs uppercase tracking-widest">AI Rationale</h4>
                                        <p className="text-body-md text-on-surface leading-relaxed">
                                            {contact?.ai_rationale || 'No activities recorded yet. Log engagement activities and refresh the score to generate AI insights.'}
                                        </p>
                                    </div>

                                    {/* Stats row */}
                                    <div className="flex gap-md">
                                        <div className={`flex-1 p-md rounded-lg border ${score >= 80 ? 'bg-green-50 border-green-200' : score >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                                            <p className={`text-[20px] font-bold ${score >= 80 ? 'text-green-700' : score >= 50 ? 'text-amber-700' : 'text-red-700'}`}>
                                                {score > 0 ? Math.round(score) : '—'}
                                            </p>
                                            <p className="text-label-sm text-on-surface-variant opacity-80 uppercase">Intent Score</p>
                                        </div>
                                        <div className="flex-1 p-md bg-tertiary-fixed text-on-tertiary-fixed rounded-lg">
                                            <p className="text-[20px] font-bold">
                                                {score >= 80 ? '~3d' : score >= 60 ? '~7d' : score >= 40 ? '~14d' : '~30d'}
                                            </p>
                                            <p className="text-label-sm opacity-80 uppercase">Est. Close</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Activity Timeline */}
                        <section className="bg-white border border-outline-variant rounded-xl p-xl">
                            <div className="flex justify-between items-center mb-xl">
                                <h3 className="text-headline-md font-semibold text-on-surface">Activity Timeline</h3>
                                <div className="flex items-center gap-xs">
                                    <button 
                                        onClick={() => setShowAddForm(!showAddForm)}
                                        className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg text-label-md hover:opacity-90 active:scale-95 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">{showAddForm ? 'close' : 'add'}</span>
                                        {showAddForm ? 'Cancel' : 'Log Activity'}
                                    </button>
                                </div>
                            </div>

                            {/* Add Activity Form */}
                            {showAddForm && (
                                <form onSubmit={handleAddActivity} className="mb-xl p-lg bg-surface-container-low rounded-xl border border-outline-variant space-y-md animate-fadeIn">
                                    <div>
                                        <label className="block text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">Activity Type</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
                                            {[
                                                { id: 'email_opened', label: 'Email Opened', icon: 'mail' },
                                                { id: 'page_visited', label: 'Page Visited', icon: 'language' },
                                                { id: 'call_logged', label: 'Call Logged', icon: 'call' },
                                            ].map((type) => {
                                                const isSelected = actType === type.id;
                                                return (
                                                    <button
                                                        key={type.id}
                                                        type="button"
                                                        onClick={() => setActType(type.id)}
                                                        className={`flex flex-col items-center justify-center p-sm rounded-lg border text-center transition-all ${
                                                            isSelected 
                                                                ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm' 
                                                                : 'border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high'
                                                        }`}
                                                    >
                                                        <span className="material-symbols-outlined text-[20px] mb-xs">{type.icon}</span>
                                                        <span className="text-label-sm">{type.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">Count / Duration (Numeric)</label>
                                        <input
                                            type="number"
                                            id="description"
                                            value={actDescription}
                                            onChange={e => setActDescription(e.target.value)}
                                            required
                                            min="1"
                                            placeholder="e.g. 1, 2, 3..."
                                            className="w-full rounded-lg border border-outline-variant bg-white px-md py-sm text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                                        <div>
                                            <label htmlFor="performed_at" className="block text-label-md text-on-surface-variant uppercase tracking-wider mb-xs">Performed At</label>
                                            <input
                                                type="datetime-local"
                                                id="performed_at"
                                                value={actPerformedAt}
                                                onChange={e => setActPerformedAt(e.target.value)}
                                                className="w-full rounded-lg border border-outline-variant bg-white px-md py-sm text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                        </div>
                                        <div className="flex items-end justify-end gap-sm">
                                            <button
                                                type="submit"
                                                disabled={submittingAct}
                                                className="w-full md:w-auto flex items-center justify-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-lg text-label-md shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-60"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">save</span>
                                                {submittingAct ? 'Saving...' : 'Log Activity'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            <div className="relative space-y-xl before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-px before:bg-outline-variant">
                                {activities?.data && activities.data.length > 0 ? (
                                    activities.data.map(activity => {
                                        const details = getActivityDetails(activity);
                                        return (
                                            <div key={activity.id} className="relative flex gap-xl pl-12 group">
                                                <div className={`absolute left-0 top-0 w-10 h-10 rounded-full ${details.color} flex items-center justify-center z-10 shrink-0`}>
                                                    <span className="material-symbols-outlined text-inherit" style={{ fontSize: '20px' }}>{details.icon}</span>
                                                </div>
                                                <div className="flex-1 font-sans">
                                                    <div className="flex justify-between items-start mb-xs">
                                                        <div>
                                                            <h5 className="text-body-md font-bold text-on-surface">{details.title}</h5>
                                                            {activity.user && (
                                                                <span className="text-[10px] text-outline uppercase tracking-wider font-bold">logged by {activity.user.name}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-sm">
                                                            <span className="text-label-sm text-outline whitespace-nowrap">{formatPerformedAt(activity.performed_at)}</span>
                                                            <button 
                                                                onClick={() => handleDeleteActivity(activity.id)}
                                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-error-container hover:text-on-error-container text-outline rounded transition-all"
                                                                title="Delete Activity"
                                                            >
                                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-body-sm text-on-surface-variant leading-relaxed">{details.body}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-xl text-center">
                                        <span className="material-symbols-outlined text-4xl text-outline mb-xs block">chat</span>
                                        <p className="text-body-md text-on-surface-variant">No activities logged yet.</p>
                                        <p className="text-label-sm text-outline mt-xs">Use the button above to log the first activity for this lead.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
