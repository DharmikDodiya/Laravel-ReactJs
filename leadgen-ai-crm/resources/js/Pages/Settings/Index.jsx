import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function SettingsIndex({ users, roles, currentUserId, aiSettings }) {
    const flash = usePage().props.flash || {};
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('team');

    const { data, setData, post, processing, errors } = useForm({
        active_ai_provider: aiSettings?.active_ai_provider || 'groq',
        anthropic_api_key: aiSettings?.anthropic_api_key || '',
        anthropic_model: aiSettings?.anthropic_model || 'claude-3-haiku-20240307',
        groq_api_key: aiSettings?.groq_api_key || '',
        groq_model: aiSettings?.groq_model || 'llama-3.3-70b-versatile',
    });

    const submitAiSettings = (e) => {
        e.preventDefault();
        post(route('settings.ai.update'), { preserveScroll: true });
    };

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
                            onClick={() => setActiveTab('team')}
                            className={`flex items-center gap-md px-md py-sm rounded-xl text-label-md transition-all whitespace-nowrap font-bold ${
                                activeTab === 'team' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'
                            }`}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: activeTab === 'team' ? "'FILL' 1" : "'FILL' 0" }}>
                                shield_person
                            </span>
                            Team Access
                        </button>
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`flex items-center gap-md px-md py-sm rounded-xl text-label-md transition-all whitespace-nowrap font-bold ${
                                activeTab === 'ai' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'
                            }`}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: activeTab === 'ai' ? "'FILL' 1" : "'FILL' 0" }}>
                                robot_2
                            </span>
                            AI Configuration
                        </button>
                    </nav>
                </div>

                {/* ── Settings Content ── */}
                <div className="flex-1 max-w-4xl">
                    <div className="animate-fade-in space-y-md">
                        <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                            <div className="p-lg border-b border-outline-variant bg-surface-container-low/30">
                                <h3 className="text-title-lg font-semibold text-on-surface">
                                    {activeTab === 'team' ? 'Team Access' : 'AI Configuration'}
                                </h3>
                                <p className="text-body-sm text-on-surface-variant mt-xs">
                                    {activeTab === 'team' ? 'Manage roles and permissions across your workspace.' : 'Configure the AI models and API keys used for lead scoring.'}
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

                                {activeTab === 'team' ? (
                                    <>
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
                                                                <select
                                                                    value={user.role}
                                                                    disabled={user.id === currentUserId && user.role === 'admin'}
                                                                    onChange={(e) => updateRole(user.id, e.target.value)}
                                                                    className="bg-surface-container border border-outline-variant rounded-lg px-sm py-1.5 focus:ring-2 focus:ring-primary outline-none transition-all text-body-sm text-on-surface disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                                >
                                                                    {roles && roles.map((role) => (
                                                                        <option key={role} value={role}>
                                                                            {role === 'admin' ? 'Admin' : (role === 'sales_rep' ? 'Sales Rep' : role)}
                                                                        </option>
                                                                    ))}
                                                                </select>
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
                                    </>
                                ) : (
                                    <form onSubmit={submitAiSettings} className="space-y-lg max-w-2xl">
                                        <div className="space-y-sm">
                                            <label className="block text-label-md font-semibold text-on-surface">Active AI Provider</label>
                                            <p className="text-body-sm text-on-surface-variant">Select which AI should be used to score leads.</p>
                                            <div className="flex items-center gap-md">
                                                <label className="flex items-center gap-xs cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="active_ai_provider" 
                                                        value="groq" 
                                                        checked={data.active_ai_provider === 'groq'}
                                                        onChange={e => setData('active_ai_provider', e.target.value)}
                                                        className="w-4 h-4 text-primary bg-surface border-outline-variant focus:ring-primary"
                                                    />
                                                    <span className="text-body-md text-on-surface font-semibold">Groq <span className="text-label-sm font-normal text-on-surface-variant">(Free, Recommended)</span></span>
                                                </label>
                                                <label className="flex items-center gap-xs cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="active_ai_provider" 
                                                        value="anthropic" 
                                                        checked={data.active_ai_provider === 'anthropic'}
                                                        onChange={e => setData('active_ai_provider', e.target.value)}
                                                        className="w-4 h-4 text-primary bg-surface border-outline-variant focus:ring-primary"
                                                    />
                                                    <span className="text-body-md text-on-surface font-semibold">Anthropic Claude</span>
                                                </label>
                                            </div>
                                        </div>

                                        <hr className="border-outline-variant/30" />

                                        <div className={`space-y-md ${data.active_ai_provider !== 'groq' ? 'opacity-50 pointer-events-none' : ''} transition-opacity`}>
                                            <h4 className="text-title-md font-bold text-on-surface">Groq Settings</h4>
                                            
                                            <div>
                                                <label className="block text-label-sm font-semibold text-on-surface mb-xs">Groq API Key</label>
                                                <input 
                                                    type="password"
                                                    value={data.groq_api_key}
                                                    onChange={e => setData('groq_api_key', e.target.value)}
                                                    placeholder="gsk_..."
                                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-label-sm font-semibold text-on-surface mb-xs">Groq Model</label>
                                                <input 
                                                    type="text"
                                                    value={data.groq_model}
                                                    onChange={e => setData('groq_model', e.target.value)}
                                                    placeholder="llama-3.3-70b-versatile"
                                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <hr className="border-outline-variant/30" />

                                        <div className={`space-y-md ${data.active_ai_provider !== 'anthropic' ? 'opacity-50 pointer-events-none' : ''} transition-opacity`}>
                                            <h4 className="text-title-md font-bold text-on-surface">Anthropic Settings</h4>
                                            
                                            <div>
                                                <label className="block text-label-sm font-semibold text-on-surface mb-xs">Anthropic API Key</label>
                                                <input 
                                                    type="password"
                                                    value={data.anthropic_api_key}
                                                    onChange={e => setData('anthropic_api_key', e.target.value)}
                                                    placeholder="sk-ant-..."
                                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-label-sm font-semibold text-on-surface mb-xs">Anthropic Model</label>
                                                <input 
                                                    type="text"
                                                    value={data.anthropic_model}
                                                    onChange={e => setData('anthropic_model', e.target.value)}
                                                    placeholder="claude-3-haiku-20240307"
                                                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-sm">
                                            <button 
                                                type="submit" 
                                                disabled={processing}
                                                className="px-lg py-sm bg-primary text-on-primary rounded-lg shadow-sm font-bold disabled:opacity-60 hover:shadow-md transition-all"
                                            >
                                                {processing ? 'Saving...' : 'Save AI Settings'}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Custom Animation for tabs */}
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
