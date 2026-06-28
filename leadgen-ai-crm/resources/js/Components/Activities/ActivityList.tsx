import React from 'react';
import {
    EnvelopeIcon,
    GlobeAltIcon,
    PhoneIcon,
    ChatBubbleLeftRightIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const activityConfig = {
    email_opened: { icon: EnvelopeIcon, color: 'text-blue-400', bgColor: 'bg-blue-400/10', label: 'Email Opened' },
    page_visited: { icon: GlobeAltIcon, color: 'text-green-400', bgColor: 'bg-green-400/10', label: 'Page Visited' },
    call_logged: { icon: PhoneIcon, color: 'text-amber-400', bgColor: 'bg-amber-400/10', label: 'Call Logged' },
    other: { icon: ChatBubbleLeftRightIcon, color: 'text-slate-400', bgColor: 'bg-slate-400/10', label: 'Other' },
};

export default function ActivityList({ activities, onEdit, onDelete, contactId }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-8">
                <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-slate-500" />
                <h3 className="mt-2 text-sm font-medium text-white">No activities</h3>
                <p className="mt-1 text-sm text-slate-400">
                    No activities logged for this contact yet.
                </p>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div className="space-y-3">
            {activities.map((activity) => {
                const config = activityConfig[activity.type] || activityConfig.other;
                const Icon = config.icon;

                return (
                    <div
                        key={activity.id}
                        className="relative rounded-lg border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className={clsx('flex-shrink-0 rounded-lg p-2', config.bgColor)}>
                                <Icon className={clsx('h-5 w-5', config.color)} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-white">{config.label}</h4>
                                    <div className="flex items-center gap-2">
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(activity)}
                                                className="rounded-md p-1 text-slate-400 hover:bg-slate-700 hover:text-blue-400"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(activity)}
                                                className="rounded-md p-1 text-slate-400 hover:bg-slate-700 hover:text-red-400"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                {activity.description && (
                                    <p className="mt-1 text-sm text-slate-300 line-clamp-2">
                                        {activity.description}
                                    </p>
                                )}
                                
                                <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                                    <span>{formatDate(activity.performed_at)}</span>
                                    {activity.user && (
                                        <span>by {activity.user.name}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
