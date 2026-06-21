import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const getActivityIcon = (type) => {
    switch (type) {
        case 'email_opened':
        case 'email':
            return { icon: 'mail', color: 'bg-blue-100 text-blue-700' };
        case 'page_visited':
            return { icon: 'language', color: 'bg-purple-100 text-purple-700' };
        case 'call_logged':
        case 'call':
            return { icon: 'call', color: 'bg-green-100 text-green-700' };
        default:
            return { icon: 'history', color: 'bg-gray-100 text-gray-700' };
    }
};

const formatType = (type) => {
    if (!type) return 'Activity';
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

export default function ActivitiesIndex({ activities, contacts = [], filters = {} }) {
    const data = activities?.data || [];
    const [contactId, setContactId] = useState(filters.contact_id || '');
    const [type, setType] = useState(filters.type || '');

    const applyFilters = (newContactId, newType) => {
        router.get('/activities', { contact_id: newContactId, type: newType }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleContactChange = (e) => {
        setContactId(e.target.value);
        applyFilters(e.target.value, type);
    };

    const handleTypeChange = (e) => {
        setType(e.target.value);
        applyFilters(contactId, e.target.value);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Global Activities" />

            <div className="p-lg max-w-[1000px] mx-auto">
                <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden mb-lg">
                    <div className="p-lg border-b border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-md bg-surface-container-low/30">
                        <div>
                            <h3 className="text-headline-md font-semibold text-on-surface">Global Activity Feed</h3>
                            <p className="text-body-sm text-on-surface-variant">
                                Tracking the latest interactions and events across all leads.
                            </p>
                        </div>
                        <div className="flex items-center gap-sm w-full sm:w-auto">
                            <div className="relative flex-1 sm:flex-none">
                                <select
                                    value={contactId}
                                    onChange={handleContactChange}
                                    className="appearance-none w-full sm:w-[200px] px-md py-sm pl-9 pr-8 rounded-lg border border-outline-variant text-label-md hover:bg-surface-container-low transition-colors outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface cursor-pointer"
                                >
                                    <option value="">All Contacts</option>
                                    {contacts.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ fontSize: '18px' }}>person</span>
                                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ fontSize: '18px' }}>arrow_drop_down</span>
                            </div>
                            <div className="relative flex-1 sm:flex-none">
                                <select
                                    value={type}
                                    onChange={handleTypeChange}
                                    className="appearance-none w-full sm:w-[150px] px-md py-sm pl-9 pr-8 rounded-lg border border-outline-variant text-label-md hover:bg-surface-container-low transition-colors outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-surface cursor-pointer"
                                >
                                    <option value="">All Types</option>
                                    <option value="email_opened">Email</option>
                                    <option value="call_logged">Call</option>
                                    <option value="page_visited">Page Visit</option>
                                </select>
                                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ fontSize: '18px' }}>filter_list</span>
                                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ fontSize: '18px' }}>arrow_drop_down</span>
                            </div>
                        </div>
                    </div>

                    {data.length === 0 ? (
                        <div className="p-xl text-center">
                            <span className="material-symbols-outlined text-5xl text-outline mb-md block">history</span>
                            <h4 className="text-title-lg font-semibold text-on-surface mb-xs">No Recent Activities</h4>
                            <p className="text-body-md text-on-surface-variant">
                                When you or your leads perform activities, they will show up here.
                            </p>
                        </div>
                    ) : (
                        <div className="p-lg">
                            <div className="relative border-l-2 border-outline-variant/50 ml-4 space-y-8 pb-4">
                                {data.map((activity, index) => {
                                    const { icon, color } = getActivityIcon(activity.type);
                                    return (
                                        <div key={activity.id} className="relative pl-8 sm:pl-10 group">
                                            {/* Timeline dot */}
                                            <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-transform group-hover:scale-110 ${color}`}>
                                                <span className="material-symbols-outlined text-[16px]">{icon}</span>
                                            </div>

                                            <div className="bg-surface-container-low/30 p-md rounded-lg border border-outline-variant/50 hover:bg-surface-container-low transition-colors">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-xs mb-sm">
                                                    <div className="flex items-center gap-xs flex-wrap">
                                                        <span className="text-label-md font-semibold bg-surface-container-highest px-2 py-0.5 rounded text-on-surface">
                                                            {formatType(activity.type)}
                                                        </span>
                                                        <span className="text-body-sm text-on-surface-variant">
                                                            logged by <span className="font-medium text-on-surface">{activity.user?.name || 'System'}</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-xs text-on-surface-variant text-label-sm">
                                                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                        <span title={dayjs(activity.performed_at).format('MMM D, YYYY h:mm A')}>
                                                            {dayjs(activity.performed_at).fromNow()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mb-sm text-body-md text-on-surface">
                                                    {activity.description ? (
                                                        <p>{activity.description}</p>
                                                    ) : (
                                                        <p className="text-on-surface-variant italic">No description provided.</p>
                                                    )}
                                                </div>

                                                {activity.contact && (
                                                    <div className="mt-md pt-sm border-t border-outline-variant/30 flex items-center gap-sm">
                                                        <span className="text-label-sm text-on-surface-variant uppercase tracking-wide">Related Lead:</span>
                                                        <Link 
                                                            href={route('contacts.show', activity.contact.id)}
                                                            className="flex items-center gap-xs text-primary hover:text-primary-container-highest font-medium text-body-sm transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-[16px]">person</span>
                                                            {activity.contact.name}
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {activities?.last_page > 1 && (
                        <div className="p-lg border-t border-outline-variant flex items-center justify-between bg-surface-container-low/30">
                            <p className="text-body-sm text-on-surface-variant">
                                Showing {activities.from}–{activities.to} of {activities.total} activities
                            </p>
                            <div className="flex items-center gap-xs">
                                {activities.links?.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`px-md py-sm rounded-md text-label-md transition-colors disabled:opacity-30 ${
                                            link.active
                                                ? 'bg-primary-container text-on-primary-container'
                                                : 'hover:bg-surface-container-low border border-outline-variant'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
