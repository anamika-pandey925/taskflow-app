'use client';

interface Task {
    _id: string;
    title: string;
    description: string;
    status: 'todo' | 'in-progress' | 'done';
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    dueDate?: string | null;
}

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusChange?: (id: string, status: Task['status']) => void;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
    todo: { label: 'To Do', classes: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    'in-progress': { label: 'In Progress', classes: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    done: { label: 'Done', classes: 'bg-green-500/20 text-green-400 border-green-500/30' },
};

const priorityConfig: Record<string, { label: string; classes: string; dot: string }> = {
    low: { label: 'Low', classes: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' },
    medium: { label: 'Medium', classes: 'bg-orange-500/20 text-orange-400 border-orange-500/30', dot: 'bg-orange-400' },
    high: { label: 'High', classes: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400' },
};

const nextStatus: Record<Task['status'], Task['status']> = {
    'todo': 'in-progress',
    'in-progress': 'done',
    'done': 'todo',
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
    const status = statusConfig[task.status];
    const priority = priorityConfig[task.priority];
    const date = new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const isOverdue = task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();
    const dueDateLabel = task.dueDate
        ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : null;

    return (
        <div className="group p-5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] hover:border-violet-500/30 rounded-xl transition-all">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm mb-1 truncate">{task.title}</h3>
                    {task.description && (
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{task.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {onStatusChange && (
                        <button
                            onClick={() => onStatusChange(task._id, nextStatus[task.status])}
                            id={`cycle-status-${task._id}`}
                            className="p-1.5 rounded-lg hover:bg-violet-500/20 text-gray-400 hover:text-violet-400 transition-colors text-xs"
                            title={`Mark as ${nextStatus[task.status]}`}
                        >
                            ⟳
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(task)}
                        id={`edit-task-${task._id}`}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-xs"
                        title="Edit"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => onDelete(task._id)}
                        id={`delete-task-${task._id}`}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors text-xs"
                        title="Delete"
                    >
                        🗑️
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${status.classes}`}>
                    {status.label}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${priority.classes}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                    {priority.label}
                </span>
                {dueDateLabel && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${isOverdue ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 text-gray-500 border-white/10'
                        }`}>
                        {isOverdue ? '⚠' : '📅'} {dueDateLabel}
                    </span>
                )}
                <span className="text-[11px] text-gray-600 ml-auto">{date}</span>
            </div>
        </div>
    );
}
