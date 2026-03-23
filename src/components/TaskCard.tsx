import { Task } from '@/types';
import { useTasks } from '@/context/TaskContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Pencil, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, isPast } from 'date-fns';

const statusConfig = {
  pending: { label: 'Pending', icon: Circle, class: 'bg-muted text-muted-foreground' },
  'in-progress': { label: 'In Progress', icon: Clock, class: 'bg-info/10 text-info' },
  completed: { label: 'Completed', icon: CheckCircle2, class: 'bg-success/10 text-success' },
};

const priorityConfig = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const { updateTask, deleteTask } = useTasks();
  const status = statusConfig[task.status];
  const StatusIcon = status.icon;
  const isOverdue = task.status !== 'completed' && isPast(new Date(task.deadline));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group rounded-xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-semibold text-card-foreground ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
              {task.title}
            </h3>
            <Badge variant="outline" className={status.class}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {status.label}
            </Badge>
            <Badge variant="outline" className={priorityConfig[task.priority]}>
              {task.priority}
            </Badge>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{task.description}</p>
          <div className={`mt-2 flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
            <Calendar className="h-3 w-3" />
            {isOverdue ? 'Overdue: ' : ''}{format(new Date(task.deadline), 'MMM d, yyyy')}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {task.status !== 'completed' && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateTask(task._id, { status: 'completed' })}>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(task)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteTask(task._id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
