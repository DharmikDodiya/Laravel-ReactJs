import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
            <div className="w-full max-w-md">
                <div className="mb-6 flex justify-center">
                    <Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2">
                        <ApplicationLogo className="h-7 w-7 fill-current text-blue-400" />
                        <span className="text-sm font-semibold text-slate-200">LeadGen CRM</span>
                    </Link>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-6 shadow-2xl">
                    {children}
                </div>
            </div>
        </div>
    );
}
