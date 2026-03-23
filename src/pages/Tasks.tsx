import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/context/TaskContext';
import TaskCard from '@/components/TaskCard';
import TaskForm from '@/components/TaskForm';
import TaskFilters from '@/components/TaskFilters';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import type { Task } from '@/types';
import { AnimatePresence } from 'framer-motion';

const Tasks = () => {
  const { isAuthenticated } = useAuth();
  const { getFilteredTasks, isLoading } = useTasks();
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  if (!isAuthenticated) return <Navigate to="/login" />;

  const filtered = getFilteredTasks();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => { setEditTask(null); setFormOpen(true); }} className="gradient-primary text-primary-foreground gap-2">
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      <TaskFilters />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((task) => (
              <TaskCard key={task._id} task={task} onEdit={(t) => { setEditTask(t); setFormOpen(true); }} />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <p className="py-16 text-center text-muted-foreground">No tasks match your filters.</p>
          )}
        </div>
      )}

      <TaskForm open={formOpen} onClose={() => { setFormOpen(false); setEditTask(null); }} editTask={editTask} />
    </div>
  );
};

export default Tasks;
