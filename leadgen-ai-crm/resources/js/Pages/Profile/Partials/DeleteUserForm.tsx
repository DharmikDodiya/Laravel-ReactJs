import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-title-lg font-semibold text-error">Delete Account</h2>
                <p className="mt-xs text-body-sm text-error/80">
                    Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.
                </p>
            </header>

            <button 
                onClick={confirmUserDeletion}
                className="bg-error text-on-error px-lg py-sm rounded-lg text-label-md font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
                Delete Account
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal} panelClassName="!bg-surface border border-outline-variant rounded-2xl shadow-xl">
                <form onSubmit={deleteUser} className="p-lg">
                    <h2 className="text-title-md font-bold text-on-surface">
                        Are you sure you want to delete your account?
                    </h2>
                    <p className="mt-xs text-body-sm text-on-surface-variant">
                        Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.
                    </p>

                    <div className="mt-md flex flex-col gap-xs">
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-error outline-none transition-all text-body-md text-on-surface"
                            isFocused
                            placeholder="Password"
                        />
                        <InputError message={errors.password} className="mt-1 text-error" />
                    </div>

                    <div className="mt-lg flex justify-end gap-sm">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-md py-sm border border-outline-variant rounded-lg text-label-md font-semibold hover:bg-surface-container-high transition-colors text-on-surface"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="bg-error text-on-error px-md py-sm rounded-lg text-label-md font-semibold hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
                            disabled={processing}
                        >
                            Delete Account
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
