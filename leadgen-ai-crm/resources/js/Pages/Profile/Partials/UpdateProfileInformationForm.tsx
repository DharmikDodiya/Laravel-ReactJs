import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-title-lg font-semibold text-on-surface">
                    Profile Information
                </h2>
                <p className="mt-xs text-body-sm text-on-surface-variant">
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-lg space-y-md">
                <div className="flex flex-col gap-xs">
                    <label htmlFor="name" className="text-label-sm font-semibold text-on-surface-variant">Name</label>
                    <input
                        id="name"
                        type="text"
                        className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary outline-none transition-all text-body-md text-on-surface"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />
                    <InputError className="mt-1" message={errors.name} />
                </div>

                <div className="flex flex-col gap-xs">
                    <label htmlFor="email" className="text-label-sm font-semibold text-on-surface-variant">Email</label>
                    <input
                        id="email"
                        type="email"
                        className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary outline-none transition-all text-body-md text-on-surface"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    <InputError className="mt-1" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-on-surface">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-1 rounded-md text-sm text-primary underline hover:opacity-80 focus:outline-none"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-md pt-sm">
                    <button
                        className="bg-primary text-on-primary px-lg py-sm rounded-lg text-label-md font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                        disabled={processing}
                    >
                        Save Changes
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
