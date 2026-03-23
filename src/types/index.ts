export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  token: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  inProgress: number;
}

export interface TaskFilters {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  search: string;
  sortBy: 'deadline' | 'priority' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}
