import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Task, TaskFilters, DashboardStats } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { isToday, isThisWeek, isPast } from 'date-fns';

interface TaskContextType {
  tasks: Task[];
  filters: TaskFilters;
  stats: DashboardStats;
  isLoading: boolean;
  setFilters: (f: Partial<TaskFilters>) => void;
  addTask: (task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getFilteredTasks: () => Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const STORAGE_KEY = 'focusdesk_tasks';

const defaultTasks: Task[] = [
  { _id: '1', title: 'Design landing page wireframes', description: 'Create wireframes for the new landing page including hero section, features, and CTA.', status: 'completed', priority: 'high', deadline: '2026-03-20', createdAt: '2026-03-15T10:00:00Z', updatedAt: '2026-03-24T14:00:00Z' },
  { _id: '2', title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment.', status: 'in-progress', priority: 'high', deadline: '2026-03-25', createdAt: '2026-03-18T09:00:00Z', updatedAt: '2026-03-24T11:00:00Z' },
  { _id: '3', title: 'Write API documentation', description: 'Document all REST API endpoints with request/response examples.', status: 'pending', priority: 'medium', deadline: '2026-03-28', createdAt: '2026-03-20T08:00:00Z', updatedAt: '2026-03-20T08:00:00Z' },
  { _id: '4', title: 'Fix mobile navigation bug', description: 'The hamburger menu does not close after selecting a link on mobile devices.', status: 'pending', priority: 'high', deadline: '2026-03-24', createdAt: '2026-03-21T15:00:00Z', updatedAt: '2026-03-21T15:00:00Z' },
  { _id: '5', title: 'Add unit tests for auth module', description: 'Write Jest tests covering login, register, and token refresh flows.', status: 'in-progress', priority: 'medium', deadline: '2026-03-27', createdAt: '2026-03-19T12:00:00Z', updatedAt: '2026-03-23T09:00:00Z' },
  { _id: '6', title: 'Update dependencies', description: 'Review and update all npm packages to latest stable versions.', status: 'pending', priority: 'low', deadline: '2026-04-01', createdAt: '2026-03-22T10:00:00Z', updatedAt: '2026-03-22T10:00:00Z' },
  { _id: '7', title: 'Team standup notes', description: 'Prepare agenda and notes for tomorrow\'s standup meeting.', status: 'completed', priority: 'low', deadline: '2026-03-22', createdAt: '2026-03-21T08:00:00Z', updatedAt: '2026-03-24T09:00:00Z' },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFiltersState] = useState<TaskFilters>({
    status: 'all', priority: 'all', search: '', sortBy: 'deadline', sortOrder: 'asc',
  });

  useEffect(() => {
    if (!isAuthenticated) { setTasks([]); setIsLoading(false); return; }
    const stored = localStorage.getItem(STORAGE_KEY);
    const loaded = stored ? JSON.parse(stored) : defaultTasks;
    setTimeout(() => { setTasks(loaded); setIsLoading(false); }, 400);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && tasks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isAuthenticated]);

  const stats: DashboardStats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    overdue: tasks.filter((t) => t.status !== 'completed' && isPast(new Date(t.deadline))).length,
    completedToday: tasks.filter((t) => t.status === 'completed' && isToday(new Date(t.updatedAt))).length,
    dueToday: tasks.filter((t) => t.status !== 'completed' && isToday(new Date(t.deadline))).length,
    dueThisWeek: tasks.filter((t) => t.status !== 'completed' && isThisWeek(new Date(t.deadline))).length,
    highPriority: tasks.filter((t) => t.priority === 'high' && t.status !== 'completed').length,
  }), [tasks]);

  const setFilters = useCallback((f: Partial<TaskFilters>) => setFiltersState((p) => ({ ...p, ...f })), []);

  const addTask = useCallback((task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTask: Task = { ...task, _id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    setTasks((p) => [newTask, ...p]);
    toast({ title: 'Task created', description: task.title });
  }, []);

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setTasks((p) => p.map((t) => t._id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t));
    toast({ title: 'Task updated' });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((p) => p.filter((t) => t._id !== id));
    toast({ title: 'Task deleted' });
  }, []);

  const getFilteredTasks = useCallback(() => {
    let filtered = [...tasks];
    if (filters.status !== 'all') filtered = filtered.filter((t) => t.status === filters.status);
    if (filters.priority !== 'all') filtered = filtered.filter((t) => t.priority === filters.priority);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    filtered.sort((a, b) => {
      let cmp = 0;
      if (filters.sortBy === 'deadline') cmp = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      else if (filters.sortBy === 'priority') {
        const order = { high: 3, medium: 2, low: 1 };
        cmp = order[b.priority] - order[a.priority];
      } else cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return filters.sortOrder === 'desc' ? -cmp : cmp;
    });
    return filtered;
  }, [tasks, filters]);

  return (
    <TaskContext.Provider value={{ tasks, filters, stats, isLoading, setFilters, addTask, updateTask, deleteTask, getFilteredTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used within TaskProvider');
  return ctx;
};
