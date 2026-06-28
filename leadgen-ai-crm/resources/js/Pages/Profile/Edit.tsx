import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout>
            <Head title="Profile" />

            <div className="p-lg max-w-4xl mx-auto min-h-screen">
                <div className="mb-lg">
                    <h2 className="text-headline-md font-bold text-on-surface">Profile</h2>
                    <p className="text-body-md text-on-surface-variant mt-xs">Manage your account settings and preferences.</p>
                </div>

                <div className="space-y-lg">
                    <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden p-lg sm:p-xl">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden p-lg sm:p-xl">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-error-container/10 rounded-2xl border border-error/20 overflow-hidden p-lg sm:p-xl">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
