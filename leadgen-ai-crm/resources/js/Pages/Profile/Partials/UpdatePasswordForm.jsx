import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-title-lg font-semibold text-on-surface">Update Password</h2>
                <p className="mt-xs text-body-sm text-on-surface-variant">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-lg space-y-md">
                <div className="flex flex-col gap-xs">
                    <label htmlFor="current_password" className="text-label-sm font-semibold text-on-surface-variant">Current Password</label>
                    <input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary outline-none transition-all text-body-md text-on-surface"
                        autoComplete="current-password"
                    />
                    <InputError message={errors.current_password} className="mt-1" />
                </div>

                <div className="flex flex-col gap-xs">
                    <label htmlFor="password" className="text-label-sm font-semibold text-on-surface-variant">New Password</label>
                    <input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary outline-none transition-all text-body-md text-on-surface"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div className="flex flex-col gap-xs">
                    <label htmlFor="password_confirmation" className="text-label-sm font-semibold text-on-surface-variant">Confirm Password</label>
                    <input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary outline-none transition-all text-body-md text-on-surface"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                <div className="flex items-center gap-md pt-sm">
                    <button
                        className="bg-primary text-on-primary px-lg py-sm rounded-lg text-label-md font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                        disabled={processing}
                    >
                        Save Password
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-medium text-green-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
