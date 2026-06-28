import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    EnvelopeIcon,
    GlobeAltIcon,
    PhoneIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const activityTypes = [
    { id: 'email_opened', name: 'Email Opened', icon: EnvelopeIcon, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
    { id: 'page_visited', name: 'Page Visited', icon: GlobeAltIcon, color: 'text-green-400', bgColor: 'bg-green-400/10' },
    { id: 'call_logged', name: 'Call Logged', icon: PhoneIcon, color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
    { id: 'other', name: 'Other', icon: ChatBubbleLeftRightIcon, color: 'text-slate-400', bgColor: 'bg-slate-400/10' },
];

export default function AddActivityForm({ contactId, onSuccess }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        type: 'email_opened',
        description: '',
        performed_at: new Date().toISOString().slice(0, 16),
        metadata: {},
    });

    const [showMetadataFields, setShowMetadataFields] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/api/contacts/${contactId}/activities`, {
            onSuccess: () => {
                toast.success('Activity logged successfully');
                reset();
                if (onSuccess) onSuccess();
            },
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Activity Type</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {activityTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = data.type === type.id;
                        return (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setData('type', type.id)}
                                className={clsx(
                                    'flex flex-col items-center justify-center p-3 rounded-xl border transition-all',
                                    isSelected
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                                )}
                            >
                                <Icon className={clsx('h-6 w-6 mb-1', type.color)} />
                                <span className={clsx('text-xs font-medium', isSelected ? 'text-blue-400' : 'text-slate-400')}>
                                    {type.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description / Notes</label>
                <textarea
                    id="description"
                    rows={3}
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    placeholder="Provide details about this activity..."
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="performed_at" className="block text-sm font-medium text-slate-300">Date & Time</label>
                    <input
                        type="datetime-local"
                        id="performed_at"
                        value={data.performed_at}
                        onChange={e => setData('performed_at', e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full inline-flex justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                >
                    {processing ? 'Logging...' : 'Log Activity'}
                </button>
            </div>
        </form>
    );
}
