'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

export default function ProfileCard() {
    const { user, updateUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    const handleSave = async () => {
        if (!form.name.trim()) return setError('Name cannot be empty.');
        setLoading(true);
        setError('');
        try {
            const res = await api.put('/profile', { name: form.name, bio: form.bio });
            updateUser(res.data.user);
            setEditing(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                </div>
                {!editing && (
                    <button
                        id="edit-profile-btn"
                        onClick={() => { setForm({ name: user?.name || '', bio: user?.bio || '' }); setEditing(true); }}
                        className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        Edit
                    </button>
                )}
            </div>

            {success && (
                <div className="mb-4 p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs">
                    ✓ Profile updated successfully
                </div>
            )}
            {error && (
                <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">{error}</div>
            )}

            {editing ? (
                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Name</label>
                        <input
                            id="profile-name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Bio</label>
                        <textarea
                            id="profile-bio"
                            value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            rows={2}
                            placeholder="Tell us about yourself..."
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500 resize-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setEditing(false)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-400">Cancel</button>
                        <button
                            id="save-profile-btn"
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-xs font-medium disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <p className="text-xs text-gray-500 mb-1">Bio</p>
                    <p className="text-sm text-gray-300">{user?.bio || <span className="text-gray-600 italic">No bio yet. Click Edit to add one.</span>}</p>
                    <p className="text-xs text-gray-600 mt-3">
                        Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                    </p>
                </div>
            )}
        </div>
    );
}
