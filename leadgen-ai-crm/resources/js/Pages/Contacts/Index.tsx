import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Head, router, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FilterDropdown from '@/Components/FilterDropdown';
import { toast } from 'sonner';

const STATUS_OPTIONS = ['Discovery', 'Negotiation', 'Proposal Sent', 'At Risk', 'Closed Won'];

const STATUS_COLORS = {
    Negotiation:     'bg-primary-fixed text-on-primary-fixed',
    Discovery:       'bg-secondary-container text-on-secondary-container',
    'At Risk':       'bg-error-container text-on-error-container',
    'Proposal Sent': 'bg-primary-fixed text-on-primary-fixed',
    'Closed Won':    'bg-green-100 text-green-700',
};

const scoreStyle = (score) => {
    if (!score) return 'bg-gray-100 text-gray-500 border-gray-200';
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 50) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-red-100 text-red-700 border-red-200';
};

const dotColor = (score) => {
    if (!score) return 'bg-gray-400';
    if (score >= 80) return 'bg-green-600 pulse-dot';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
};

const initials = (name) =>
    name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

const AVATAR_COLORS = [
    'bg-secondary-container text-on-secondary-container',
    'bg-tertiary-fixed text-on-tertiary-fixed',
    'bg-error-container text-on-error-container',
    'bg-surface-container-high text-on-surface-variant',
    'bg-primary-fixed text-on-primary-fixed',
];

export default function Contacts() {
    const { contacts, filters = {}, errors = {} } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [showModal, setShowModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', company: '', phone: '', status: 'New' });
    const [processing, setProcessing] = useState(false);

    const data = contacts?.data || [];

    // Local filter is no longer needed if backend filtering is applied, but keep it for immediate UI update or if we're not sending requests yet.
    // For proper backend filtering, we'll send a request when filters change.
    const filtered = data;

    // Fetch filtered data from backend
    const applyFilters = (search, status) => {
        router.get('/contacts', { search, status }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        applyFilters(e.target.value, statusFilter);
    };

    const handleStatusChange = (val) => {
        setStatusFilter(val);
        applyFilters(searchTerm, val);
    };

    // Build status filter options with colored dots
    const statusFilterOptions = [
        { value: '', label: 'All Statuses', icon: 'label' },
        { value: 'New', label: 'New', dot: 'bg-gray-400' },
        { value: 'Discovery', label: 'Discovery', dot: 'bg-blue-400' },
        { value: 'Negotiation', label: 'Negotiation', dot: 'bg-indigo-500' },
        { value: 'Proposal Sent', label: 'Proposal Sent', dot: 'bg-violet-500' },
        { value: 'At Risk', label: 'At Risk', dot: 'bg-red-500' },
        { value: 'Closed Won', label: 'Closed Won', dot: 'bg-green-500' },
    ];

    const openCreate = () => {
        setSelectedContact(null);
        setFormData({ name: '', email: '', company: '', phone: '', status: 'New' });
        setShowModal(true);
    };

    const openEdit = (contact) => {
        setSelectedContact(contact);
        setFormData({ name: contact.name, email: contact.email, company: contact.company || '', phone: contact.phone || '', status: contact.status || 'New' });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedContact(null);
        setFormData({ name: '', email: '', company: '', phone: '', status: 'New' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        const opts = {
            onSuccess: () => {
                toast.success(`${formData.name} has been ${selectedContact ? 'updated' : 'created'}.`);
                closeModal();
                setProcessing(false);
            },
            onError: () => {
                toast.error('Failed to save contact. Please try again.');
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        };
        if (selectedContact) {
            router.put(`/contacts/${selectedContact.id}`, formData, opts);
        } else {
            router.post('/contacts', formData, opts);
        }
    };

    const handleDelete = (contact) => {
        toast.warning(
            <div>
                <p className="font-semibold">Delete {contact.name}?</p>
                <p className="text-sm opacity-80 mb-2">This action cannot be undone.</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            router.delete(`/contacts/${contact.id}`, {
                                onSuccess: () => toast.success(`${contact.name} deleted.`),
                                onError: () => toast.error('Failed to delete.'),
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
            <Head title="Contacts" />

            <div className="p-lg max-w-[1440px] mx-auto">

                {/* ── Page Header ── */}
                <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden mb-lg">
                    <div className="p-lg border-b border-outline-variant flex flex-col gap-md">
                        {/* Row 1: title + add button */}
                        <div className="flex items-center justify-between gap-md">
                            <div>
                                <h3 className="text-headline-md font-semibold text-on-surface">Active Leads</h3>
                                <p className="text-body-sm text-on-surface-variant">
                                    Managing {contacts?.total ?? data.length} records in current view
                                </p>
                            </div>
                            <button
                                onClick={openCreate}
                                className="flex items-center gap-xs bg-primary text-on-primary px-lg py-sm rounded-lg text-label-md shadow-sm hover:shadow-md active:scale-95 transition-all shrink-0"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                                <span className="hidden sm:inline">Add Contact</span>
                            </button>
                        </div>
                        {/* Row 2: search + filter/export */}
                        <div className="flex flex-wrap items-center gap-sm">
                            <div className="relative flex-1 min-w-[180px]">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: '18px' }}>search</span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Search leads..."
                                    className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary transition-all outline-none"
                                />
                            </div>
                            <FilterDropdown
                                value={statusFilter}
                                onChange={handleStatusChange}
                                options={statusFilterOptions}
                                icon="filter_list"
                                placeholder="All Statuses"
                                popoverWidth="w-[190px]"
                            />
                        </div>
                    </div>

                    {/* ── Table ── */}
                    <div className="overflow-x-auto">
                        {filtered.length === 0 ? (
                            <div className="py-20 flex flex-col items-center text-center">
                                <span className="material-symbols-outlined text-5xl text-outline mb-md">group_off</span>
                                <p className="text-headline-md text-on-surface font-semibold">No contacts found</p>
                                <p className="text-body-sm text-on-surface-variant mt-xs">
                                    {searchTerm ? 'Try a different search term.' : 'Add your first contact to get started.'}
                                </p>
                                {!searchTerm && (
                                    <button onClick={openCreate} className="mt-lg flex items-center gap-sm bg-primary text-on-primary px-lg py-sm rounded-lg text-label-md">
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                                        Add Contact
                                    </button>
                                )}
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-surface-container-low/50">
                                        <th className="px-lg py-md text-label-md text-on-surface-variant border-b border-outline-variant">LEAD NAME</th>
                                        <th className="hidden md:table-cell px-lg py-md text-label-md text-on-surface-variant border-b border-outline-variant">COMPANY</th>
                                        <th className="hidden sm:table-cell px-lg py-md text-label-md text-on-surface-variant border-b border-outline-variant">STATUS</th>
                                        <th className="px-lg py-md text-label-md text-on-surface-variant border-b border-outline-variant text-center">AI SCORE</th>
                                        <th className="hidden lg:table-cell px-lg py-md text-label-md text-on-surface-variant border-b border-outline-variant">PHONE</th>
                                        <th className="px-lg py-md border-b border-outline-variant w-28"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/30">
                                    {filtered.map((contact, idx) => (
                                        <tr key={contact.id} className="hover:bg-surface-container-low/30 transition-colors group">
                                            {/* Name + email */}
                                            <td className="px-lg py-md">
                                                <div className="flex items-center gap-md">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                                                        {initials(contact.name)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={route('contacts.show', contact.id)}
                                                            className="text-body-md font-semibold text-on-surface hover:text-primary transition-colors block truncate"
                                                        >
                                                            {contact.name}
                                                        </Link>
                                                        <p className="text-label-sm text-on-surface-variant truncate">{contact.email}</p>
                                                        {/* Show company inline on mobile when column is hidden */}
                                                        <p className="md:hidden text-label-sm text-on-surface-variant truncate">{contact.company || ''}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Company — hidden on mobile */}
                                            <td className="hidden md:table-cell px-lg py-md text-body-sm text-on-surface-variant">
                                                {contact.company || '—'}
                                            </td>

                                            {/* Status — hidden on mobile */}
                                            <td className="hidden sm:table-cell px-lg py-md">
                                                <span className={`inline-flex items-center px-sm py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[contact.status] || 'bg-surface-container text-on-surface-variant'}`}>
                                                    {contact.status || 'New'}
                                                </span>
                                            </td>

                                            {/* AI Score */}
                                            <td className="px-lg py-md text-center">
                                                <span className={`inline-flex items-center gap-xs px-md py-1 rounded-full text-label-md border ${scoreStyle(contact.ai_score)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor(contact.ai_score)}`}></span>
                                                    {contact.ai_score ?? '—'}
                                                </span>
                                            </td>

                                            {/* Phone — hidden on small laptop and below */}
                                            <td className="hidden lg:table-cell px-lg py-md text-body-sm text-on-surface-variant">
                                                {contact.phone || '—'}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-lg py-md text-right">
                                                <div className="row-action flex items-center justify-end gap-xs">
                                                    <Link
                                                        href={route('contacts.show', contact.id)}
                                                        className="p-sm rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
                                                        title="View Details"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
                                                    </Link>
                                                    <button
                                                        onClick={() => openEdit(contact)}
                                                        className="p-sm rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
                                                        title="Edit"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(contact)}
                                                        className="p-sm rounded-lg hover:bg-error-container text-on-surface-variant hover:text-on-error-container transition-colors"
                                                        title="Delete"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* ── Pagination ── */}
                    {contacts?.last_page > 1 && (
                        <div className="p-lg border-t border-outline-variant flex items-center justify-between">
                            <p className="text-body-sm text-on-surface-variant">
                                Showing {contacts.from}–{contacts.to} of {contacts.total} leads
                            </p>
                            <div className="flex items-center gap-xs">
                                {contacts.links?.map((link, i) => (
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

            {/* ── Create / Edit Modal ── */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative w-full max-w-md z-10">
                        <div className="overflow-hidden rounded-xl border border-outline-variant bg-white shadow-2xl">

                            {/* Modal header */}
                            <div className="relative bg-primary px-lg pt-lg pb-10">
                                <button onClick={closeModal} className="absolute right-md top-md rounded-lg p-1.5 text-on-primary/60 hover:bg-white/10 hover:text-on-primary transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                                <div className="flex items-center gap-md">
                                    <div className="w-14 h-14 rounded-xl bg-white/15 ring-2 ring-white/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-on-primary text-3xl">
                                            {selectedContact ? 'edit' : 'person_add'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-headline-md font-bold text-on-primary">
                                            {selectedContact ? 'Edit Contact' : 'New Contact'}
                                        </h3>
                                        <p className="text-body-sm text-on-primary/70">
                                            {selectedContact ? 'Update the contact details' : 'Fill in the details to add a lead'}
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="px-lg py-lg space-y-md">
                                    {[
                                        { label: 'Full Name',     key: 'name',    type: 'text',  required: true,  placeholder: 'e.g. Sarah Jenkins',      icon: 'person'         },
                                        { label: 'Email Address', key: 'email',   type: 'email', required: true,  placeholder: 'sarah@company.com',        icon: 'mail'           },
                                        { label: 'Company',       key: 'company', type: 'text',  required: false, placeholder: 'e.g. TechFlow Solutions',  icon: 'corporate_fare' },
                                        { label: 'Phone',         key: 'phone',   type: 'tel',   required: false, placeholder: '+1 555 000 0000',          icon: 'call'           },
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label className="flex items-center gap-xs mb-xs text-label-md text-on-surface-variant uppercase tracking-wider">
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{field.icon}</span>
                                                {field.label}
                                                {field.required && <span className="text-error">*</span>}
                                            </label>
                                            <input
                                                type={field.type}
                                                required={field.required}
                                                placeholder={field.placeholder}
                                                value={formData[field.key]}
                                                onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                className={`w-full rounded-lg border bg-surface-container-low px-md py-sm text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 transition-all ${
                                                    errors[field.key] 
                                                        ? 'border-error focus:border-error focus:ring-error/20' 
                                                        : 'border-outline-variant focus:border-primary focus:ring-primary/20'
                                                }`}
                                            />
                                            {errors[field.key] && (
                                                <p className="mt-1 text-label-sm text-error">{errors[field.key]}</p>
                                            )}
                                        </div>
                                    ))}
                                    {/* Status Select */}
                                    <div>
                                        <label className="flex items-center gap-xs mb-xs text-label-md text-on-surface-variant uppercase tracking-wider">
                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>label</span>
                                            Status
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.status}
                                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-low px-md py-sm pr-10 text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                            >
                                                <option value="New">New</option>
                                                {STATUS_OPTIONS.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" style={{ fontSize: '18px' }}>arrow_drop_down</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-end gap-sm border-t border-outline-variant px-lg py-md bg-surface-container-low/50">
                                    <button type="button" onClick={closeModal} className="px-lg py-sm rounded-lg border border-outline-variant text-label-md hover:bg-surface-container-high transition-colors">
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex items-center gap-xs px-lg py-sm rounded-lg bg-primary text-on-primary text-label-md shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-60"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                                    {selectedContact ? 'save' : 'add'}
                                                </span>
                                                {selectedContact ? 'Save Changes' : 'Add Contact'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </AuthenticatedLayout>
    );
}
