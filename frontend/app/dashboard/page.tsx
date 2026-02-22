'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthGuard from '../../components/AuthGuard';
import ProfileCard from '../../components/ProfileCard';
import TaskCard from '../../components/TaskCard';
import TaskModal from '../../components/TaskModal';
import api from '../../lib/api';

interface Task {
    _id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    dueDate?: string | null;
}

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [sort, setSort] = useState('newest');
    const [activeSection, setActiveSection] = useState<'tasks' | 'profile'>('tasks');
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = { sort };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (priorityFilter) params.priority = priorityFilter;
            const res = await api.get('/tasks', { params });
            setTasks(res.data.tasks);
        } catch {
            showToast('Failed to load tasks', 'error');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, priorityFilter, sort]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleSave = async (formData: Omit<Task, '_id' | 'createdAt'>) => {
        if (editingTask?._id) {
            const res = await api.put(`/tasks/${editingTask._id}`, formData);
            setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? res.data.task : t)));
            showToast('Task updated!');
        } else {
            const res = await api.post('/tasks', formData);
            setTasks((prev) => [res.data.task, ...prev]);
            showToast('Task created!');
        }
        setEditingTask(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this task?')) return;
        await api.delete(`/tasks/${id}`);
        setTasks((prev) => prev.filter((t) => t._id !== id));
        showToast('Task deleted.');
    };

    const handleStatusChange = async (id: string, status: Task['status']) => {
        try {
            const res = await api.put(`/tasks/${id}`, { status });
            setTasks((prev) => prev.map((t) => (t._id === id ? res.data.task : t)));
            showToast(`Moved to ${status.replace('-', ' ')}`);
        } catch {
            showToast('Failed to update status', 'error');
        }
    };

    const openCreate = () => { setEditingTask(null); setModalOpen(true); };
    const openEdit = (task: Task) => { setEditingTask(task); setModalOpen(true); };

    const stats = {
        total: tasks.length,
        todo: tasks.filter((t) => t.status === 'todo').length,
        inProgress: tasks.filter((t) => t.status === 'in-progress').length,
        done: tasks.filter((t) => t.status === 'done').length,
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gray-950 text-white flex flex-col md:flex-row">

                {/* Sidebar */}
                <aside className="w-full md:w-64 md:min-h-screen bg-gray-900/60 border-b md:border-b-0 md:border-r border-white/[0.07] flex md:flex-col">
                    <div className="px-5 py-5 md:py-6 flex-shrink-0">
                        <Link href="/" className="flex items-center gap-3 mb-10 px-2 group">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform">T</div>
                            <span className="text-xl font-bold text-white tracking-tight">TaskFlow</span>
                        </Link>
                    </div>

                    <nav className="flex flex-row md:flex-col gap-1 px-3 py-2 md:py-4 flex-1 overflow-x-auto md:overflow-x-visible">
                        {[
                            { id: 'tasks', label: '📋 My Tasks' },
                            { id: 'profile', label: '👤 Profile' },
                        ].map(({ id, label }) => (
                            <button
                                key={id}
                                id={`nav-${id}`}
                                onClick={() => setActiveSection(id as 'tasks' | 'profile')}
                                className={`flex-shrink-0 md:w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${activeSection === id
                                    ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className="px-3 pb-4 hidden md:block mt-auto">
                        <button
                            id="logout-btn"
                            onClick={logout}
                            className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-left border border-transparent hover:border-red-500/20"
                        >
                            🚪 Logout
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <main className="flex-1 p-5 md:p-8 overflow-auto">
                    {/* Top bar */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-white">
                                Good day, <span className="text-violet-400">{user?.name?.split(' ')[0]}</span> 👋
                            </h1>
                            <p className="text-gray-500 text-sm mt-0.5">Here&apos;s what&apos;s on your plate today.</p>
                        </div>
                        <button
                            id="logout-btn-top"
                            onClick={logout}
                            className="md:hidden px-3 py-1.5 text-xs bg-red-500/10 text-red-400 rounded-lg border border-red-500/20"
                        >
                            Logout
                        </button>
                    </div>

                    {activeSection === 'profile' && (
                        <div className="max-w-sm">
                            <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
                            <ProfileCard />
                        </div>
                    )}

                    {activeSection === 'tasks' && (
                        <>
                            {/* Stats row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: 'Total', value: stats.total, color: 'violet' },
                                    { label: 'To Do', value: stats.todo, color: 'gray' },
                                    { label: 'In Progress', value: stats.inProgress, color: 'yellow' },
                                    { label: 'Done', value: stats.done, color: 'green' },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="p-4 bg-white/[0.04] border border-white/[0.07] rounded-xl">
                                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                                        <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Toolbar */}
                            <div className="flex flex-col md:flex-row gap-3 mb-5">
                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                                    <input
                                        id="task-search"
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search tasks..."
                                        className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 text-sm"
                                    />
                                </div>

                                <select
                                    id="filter-status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-violet-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="todo">To Do</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>

                                <select
                                    id="filter-priority"
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="px-3 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-violet-500"
                                >
                                    <option value="">All Priority</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>

                                <select
                                    id="sort-tasks"
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="px-3 py-2.5 bg-gray-800 border border-white/10 rounded-xl text-sm text-gray-300 focus:outline-none focus:border-violet-500"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="az">A → Z</option>
                                    <option value="za">Z → A</option>
                                </select>

                                <button
                                    id="create-task-btn"
                                    onClick={openCreate}
                                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
                                >
                                    + New Task
                                </button>
                            </div>

                            {/* Tasks grid */}
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="h-32 bg-white/[0.03] rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : tasks.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="text-5xl mb-4">📭</div>
                                    <h3 className="text-lg font-semibold text-white mb-2">No tasks yet</h3>
                                    <p className="text-gray-500 text-sm mb-5">Create your first task to get started.</p>
                                    <button
                                        onClick={openCreate}
                                        className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-semibold transition-colors"
                                    >
                                        + Create Task
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tasks.map((task) => (
                                        <TaskCard key={task._id} task={task} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </main>

                {/* Task modal */}
                <TaskModal
                    isOpen={modalOpen}
                    task={editingTask}
                    onClose={() => { setModalOpen(false); setEditingTask(null); }}
                    onSave={handleSave}
                />

                {/* Toast notification */}
                {toast && (
                    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl transition-all ${toast.type === 'success'
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                        : 'bg-red-500/20 border border-red-500/30 text-red-400'
                        }`}>
                        {toast.type === 'success' ? '✓ ' : '⚠ '}{toast.msg}
                    </div>
                )}
            </div>
        </AuthGuard>
    );
}
