import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { Calendar, Tag, Layers, FileText, Bell } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string | null;
    reminderEnabled?: boolean;
  }) => Promise<void>;
  taskToEdit?: Task | null;
  isLoading?: boolean;
}

export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  taskToEdit,
  isLoading = false,
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setDueDate(
        taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : ''
      );
      setReminderEnabled(taskToEdit.reminderEnabled !== false);
    } else {
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setDueDate('');
      setReminderEnabled(true);
    }
    setErrors({});
  }, [taskToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { title?: string; description?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    if (description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        reminderEnabled,
      });
    } catch (err) {
      // Error handled in parent hook via toast
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Task' : 'Create New Task'}
      description={
        taskToEdit
          ? 'Update the details, due date, and email reminder configuration for your task.'
          : 'Add a new task with automated email reminders to your workspace.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="e.g., Complete Figma design system review"
            maxLength={100}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              errors.title
                ? 'border-rose-500 dark:border-rose-500'
                : 'border-zinc-200 dark:border-zinc-700'
            }`}
            autoFocus
            id="task-form-title-input"
          />
          {errors.title && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              Description (Optional)
            </span>
            <span className="text-[11px] font-normal text-zinc-400">
              {description.length}/1000
            </span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide additional details or sub-notes for this task..."
            rows={3}
            maxLength={1000}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none"
            id="task-form-desc-input"
          />
        </div>

        {/* Status & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status Select */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              id="task-form-status-select"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Priority Select */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-zinc-400" />
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              id="task-form-priority-select"
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
            </select>
          </div>
        </div>

        {/* Due Date & Email Reminders */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              id="task-form-date-input"
            />
          </div>

          {dueDate && (
            <div className="p-3.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Automated Email Reminders
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                    Receive 1-day before and due-today email reminders (Timezone: Asia/Kolkata).
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                  id="task-form-reminder-toggle"
                />
                <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-zinc-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-6">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
            id="task-form-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            id="task-form-submit-btn"
          >
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
