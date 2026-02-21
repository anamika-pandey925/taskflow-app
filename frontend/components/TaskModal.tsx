'use client';

import { useState, useEffect } from 'react';

interface Task {
    _id?: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    dueDate?: string | null;
}

interface TaskModalProps {
    isOpen: boolean;
    task: Task | null;
    onClose: () => void;
    onSave: (task: Task) => Promise<void>;
}

export default function TaskModal({ isOpen, task, onClose, onSave }: TaskModalProps) {
    const [form, setForm] = useState<Task>({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (task) {
            setForm({ title: task.title, description: task.description, status: task.status, priority: task.priority, dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '' });
        } else {
            setForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' });
        }
        setError('');
    }, [task, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return setError('Title is required.');
        setLoading(true);
        try {
            await onSave(form);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save task.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white">{task?._id ? 'Edit Task' : 'New Task'}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">✕</button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Title *</label>
                        <input
                            id="task-title"
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Task title"
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
                        <textarea
                            id="task-description"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Optional description..."
                            rows={3}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5">Due Date <span className="text-gray-600 font-normal">(optional)</span></label>
                        <input
                            id="task-duedate"
                            type="date"
                            value={form.dueDate || ''}
                            onChange={(e) => setForm({ ...form, dueDate: e.target.value || null })}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm [color-scheme:dark]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
                            <select
                                id="task-status"
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value as Task['status'] })}
                                className="w-full px-3 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-sm"
                            >
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">Priority</label>
                            <select
                                id="task-priority"
                                value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}
                                className="w-full px-3 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500 text-sm"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            id="save-task-btn"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Saving...' : task?._id ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
