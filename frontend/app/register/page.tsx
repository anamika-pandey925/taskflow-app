'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const validate = () => {
        if (!form.name.trim()) return 'Name is required.';
        if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email.';
        if (form.password.length < 6) return 'Password must be at least 6 characters.';
        if (form.password !== form.confirmPassword) return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const validationError = validate();
        if (validationError) return setError(validationError);

        setLoading(true);
        try {
            const res = await api.post('/auth/register', {
                name: form.name,
                email: form.email,
                password: form.password,
            });
            login(res.data.token, res.data.user);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-sm">T</div>
                        <span className="text-xl font-bold text-white">TaskFlow</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Create your account</h1>
                    <p className="text-gray-400 text-sm mt-1">Start managing tasks in seconds</p>
                </div>

                <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm">
                    {error && (
                        <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                            <span>⚠</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {[
                            { label: 'Full Name', id: 'name', type: 'text', placeholder: 'John Doe', field: 'name' },
                            { label: 'Email', id: 'email', type: 'email', placeholder: 'you@example.com', field: 'email' },
                            { label: 'Password', id: 'password', type: 'password', placeholder: '••••••••', field: 'password' },
                            { label: 'Confirm Password', id: 'confirmPassword', type: 'password', placeholder: '••••••••', field: 'confirmPassword' },
                        ].map(({ label, id, type, placeholder, field }) => (
                            <div key={id}>
                                <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
                                <input
                                    id={id}
                                    type={type}
                                    value={form[field as keyof typeof form]}
                                    onChange={set(field)}
                                    placeholder={placeholder}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors text-sm"
                                />
                            </div>
                        ))}

                        <button
                            type="submit"
                            id="register-submit"
                            disabled={loading}
                            className="w-full py-3 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-all transform hover:scale-[1.02] shadow-lg shadow-violet-500/20"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
