import React from 'react';
import {
    EnvelopeIcon,
    GlobeAltIcon,
    PhoneIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const statConfig = {
    email_opened: { icon: EnvelopeIcon, color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-500/30' },
    page_visited: { icon: GlobeAltIcon, color: 'text-green-400', bgColor: 'bg-green-400/10', borderColor: 'border-green-500/30' },
    call_logged: { icon: PhoneIcon, color: 'text-amber-400', bgColor: 'bg-amber-400/10', borderColor: 'border-amber-500/30' },
    other: { icon: ChatBubbleLeftRightIcon, color: 'text-slate-400', bgColor: 'bg-slate-400/10', borderColor: 'border-slate-500/30' },
};

export default function ActivityStats({ stats }) {
    if (!stats) return null;

    const totalActivities = Object.values(stats.by_type || {}).reduce((sum, count) => sum + count, 0);

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(statConfig).map(([type, config]) => {
                const count = stats.by_type?.[type] || 0;
                const Icon = config.icon;

                return (
                    <div
                        key={type}
                        className={clsx(
                            'rounded-lg border p-3 transition-all hover:border-opacity-50',
                            config.bgColor,
                            config.borderColor
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div className={clsx('rounded-lg p-2', config.bgColor)}>
                                <Icon className={clsx('h-4 w-4', config.color)} />
                            </div>
                            <span className={clsx('text-2xl font-bold', config.color)}>
                                {count}
                            </span>
                        </div>
                        <p className="mt-2 text-xs font-medium text-slate-400 capitalize">
                            {type.replace('_', ' ')}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
