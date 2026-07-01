import { Head, Link } from '@inertiajs/react';

const features = [
    {
        icon: 'groups',
        title: 'Centralized Contact Management',
        text: 'Track contacts, companies, and interaction history in one unified interface built for scale.',
    },
    {
        icon: 'auto_awesome',
        title: 'AI Lead Scoring with Rationale',
        text: 'Score each lead from 0–100 and store a clear LLM-backed explanation for every score.',
    },
    {
        icon: 'admin_panel_settings',
        title: 'Role-based Access Controls',
        text: 'Protect sales actions with granular permissions for admin and sales-rep roles.',
    },
    {
        icon: 'rocket_launch',
        title: 'Fast Inertia Workflow',
        text: 'Modern Laravel routes and controllers paired with React UI for a seamless SPA experience.',
    },
];

const techStack = [
    { icon: 'dns',      label: 'Laravel'    },
    { icon: 'sync_alt', label: 'Inertia.js' },
    { icon: 'category', label: 'React'      },
    { icon: 'bolt',     label: 'LLM API'    },
];

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="LeadGen CRM | Smart AI Lead Scoring" />

            <div className="min-h-screen bg-[#0b0e14] text-white overflow-x-hidden select-none">

                {/* ── Top Navigation ── */}
                <header className="fixed top-0 left-0 right-0 z-50 h-16 flex justify-between items-center px-6 md:px-10 border-b border-white/5 bg-[#0b0e14]/80 backdrop-blur-md">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 flex items-center justify-center rounded-lg shadow-lg shrink-0">
                            <span className="text-white font-bold text-lg leading-none">LG</span>
                        </div>
                        <div>
                            <p className="font-extrabold text-[18px] text-white leading-tight">LeadGen CRM</p>
                        </div>
                    </div>

                    {/* Nav */}
                    <div className="flex items-center gap-2">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-4 py-1.5 rounded-lg text-[12px] font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg active:scale-95"
                                >
                                    Open Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white border border-white/10 hover:bg-white/5 transition-colors"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-4 py-1.5 rounded-lg text-[12px] font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg active:scale-95"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                </header>

                <main className="pt-16">

                    {/* ── Hero Section ── */}
                    <section className="relative min-h-[680px] md:min-h-[800px] flex items-center justify-center overflow-hidden px-6 py-20">
                        {/* Ambient glow blobs */}
                        <div className="pointer-events-none absolute top-0 left-0 w-[500px] h-[500px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-blue-600/10 blur-[100px]" />
                        <div className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] translate-x-1/3 translate-y-1/3 rounded-full bg-blue-600/10 blur-[100px]" />

                        <div className="relative z-10 max-w-5xl mx-auto text-center">
                            {/* Headline */}
                            <h1 className="text-[40px] sm:text-[56px] md:text-[68px] font-extrabold leading-[1.1] tracking-tight text-white mb-6 max-w-4xl mx-auto">
                                CRM focused on pipeline growth and{' '}
                                <span className="text-blue-400">AI lead scoring</span>
                            </h1>

                            {/* Subtext */}
                            <p className="text-[16px] text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Manage contacts, track activity, and generate explainable AI lead scores from one
                                dashboard designed for your sales workflow.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
                                <Link
                                    href={auth?.user ? route('dashboard') : route('register')}
                                    className="px-8 py-3.5 bg-blue-600 text-white rounded-lg text-[15px] font-semibold hover:bg-blue-500 transition-all shadow-[0_0_24px_rgba(37,99,235,0.35)] active:scale-95"
                                >
                                    Get Started Free
                                </Link>
                                <a
                                    href="#features"
                                    className="px-8 py-3.5 bg-white/5 text-white border border-white/10 rounded-lg text-[15px] font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[20px]">play_circle</span>
                                    See Features
                                </a>
                            </div>

                            {/* Feature pills */}
                            <div className="flex flex-wrap justify-center gap-3">
                                {[
                                    { icon: 'lock',         text: 'Role-based access control' },
                                    { icon: 'auto_awesome', text: 'LLM-powered scoring' },
                                ].map(pill => (
                                    <span key={pill.text} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[12px] text-slate-400">
                                        <span className="material-symbols-outlined text-blue-400 text-[14px]">{pill.icon}</span>
                                        {pill.text}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── Features Section ── */}
                    <section id="features" className="py-24 px-6 bg-white/[0.02]">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-16">
                                <p className="text-[12px] font-semibold text-blue-400 uppercase tracking-[0.2em] mb-3">What your team gets</p>
                                <h2 className="text-[32px] md:text-[40px] font-bold text-white mb-4">
                                    Enterprise-grade tools, zero complexity
                                </h2>
                                <p className="text-slate-400 max-w-xl mx-auto text-[15px]">
                                    Built on the latest tech stack for unmatched velocity and intelligence.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {features.map(feat => (
                                    <div
                                        key={feat.title}
                                        className="flex flex-col p-6 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-200 group"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-[28px]">{feat.icon}</span>
                                        </div>
                                        <h3 className="text-white font-semibold text-[15px] mb-2">{feat.title}</h3>
                                        <p className="text-slate-400 text-[13px] leading-relaxed">{feat.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── How It Works ── */}
                    <section className="py-24 px-6">
                        <div className="max-w-4xl mx-auto text-center">
                            <p className="text-[12px] font-semibold text-blue-400 uppercase tracking-[0.2em] mb-3">How it works</p>
                            <h2 className="text-[32px] md:text-[40px] font-bold text-white mb-16">
                                From contact to closed deal
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                                {/* Connector line */}
                                <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-blue-600/20 via-blue-500/40 to-blue-600/20" />
                                {[
                                    { step: '01', icon: 'person_add',  title: 'Add a Contact',        text: 'Create a lead profile with company, email, and phone details.' },
                                    { step: '02', icon: 'history',     title: 'Log Activities',       text: 'Record emails opened, calls logged, and pages visited over time.' },
                                    { step: '03', icon: 'auto_awesome',title: 'Get an AI Score',      text: 'The AI analyses engagement history and returns a score with rationale.' },
                                ].map(step => (
                                    <div key={step.step} className="flex flex-col items-center text-center relative">
                                        <div className="w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4 relative z-10">
                                            <span className="material-symbols-outlined text-blue-400 text-[28px]">{step.icon}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-blue-500/60 tracking-[0.3em] uppercase mb-1">{step.step}</span>
                                        <h3 className="text-white font-semibold text-[15px] mb-2">{step.title}</h3>
                                        <p className="text-slate-400 text-[13px] leading-relaxed">{step.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── Tech Stack ── */}
                    <section className="py-16 px-6 border-y border-white/5 bg-[#0b0e14]">
                        <div className="max-w-4xl mx-auto text-center">
                            <p className="text-[12px] font-semibold text-blue-400 uppercase tracking-[0.2em] mb-10">Built with precision</p>
                            <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 hover:opacity-100 transition-opacity duration-500">
                                {techStack.map(t => (
                                    <div key={t.label} className="flex flex-col items-center gap-2">
                                        <span className="material-symbols-outlined text-[44px] text-white">{t.icon}</span>
                                        <span className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">{t.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── Final CTA ── */}
                    <section className="py-32 px-6 relative overflow-hidden">
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="w-[600px] h-[600px] rounded-full bg-blue-600/8 blur-[120px]" />
                        </div>
                        <div className="relative z-10 max-w-3xl mx-auto text-center">
                            <div className="rounded-3xl border border-blue-500/20 bg-white/[0.03] backdrop-blur-sm p-12 md:p-16">
                                <h2 className="text-[36px] md:text-[44px] font-bold text-white mb-4 leading-tight">
                                    Ready to scale your sales pipeline?
                                </h2>
                                <p className="text-slate-400 text-[15px] mb-10 leading-relaxed">
                                    Manage contacts, score leads with AI, and close deals faster — all from one place.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link
                                        href={auth?.user ? route('dashboard') : route('register')}
                                        className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-lg text-[15px] font-semibold hover:bg-blue-500 transition-all shadow-lg active:scale-95"
                                    >
                                        {auth?.user ? 'Open Dashboard' : 'Start Free Trial'}
                                    </Link>
                                    <Link
                                        href={route('login')}
                                        className="w-full sm:w-auto px-8 py-3.5 bg-white/5 text-white border border-white/10 rounded-lg text-[15px] font-semibold hover:bg-white/10 transition-all"
                                    >
                                        {auth?.user ? 'View Contacts' : 'Log In'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                </main>

                {/* ── Footer ── */}
                <footer className="py-8 px-6 border-t border-white/5">
                    <div className="max-w-6xl mx-auto flex justify-center items-center">
                        <div className="flex items-center gap-2 text-[12px] whitespace-nowrap">
                            <span className="text-white font-bold">LeadGen CRM</span>
                            <span className="text-slate-500">© {new Date().getFullYear()} LeadGen CRM. All rights reserved.</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
