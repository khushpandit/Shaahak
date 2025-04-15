import React from 'react';
import { ThreeDCard } from '@/components/ui/3d-card';
import { Plus, MoreHorizontal, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Task } from '@shared/schema';

interface TodayTasksProps {
  pendingTasks: Task[];
  completedTasks: Task[];
  onAddTask: () => void;
  onToggleTask: (task: Task) => void;
}

export function TodayTasks({ 
  pendingTasks, 
  completedTasks, 
  onAddTask, 
  onToggleTask 
}: TodayTasksProps) {
  const formatTimeRange = (start?: Date, end?: Date) => {
    if (!start && !end) return 'No time set';
    
    const formatTime = (date?: Date) => {
      if (!date) return '';
      return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };
    
    return `${formatTime(start)} - ${formatTime(end)}`;
  };
  
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'study': return 'bg-[#38b6ff]/20 text-[#38b6ff]';
      case 'work': return 'bg-primary/20 text-primary-light';
      case 'health': return 'bg-[#32d196]/20 text-[#32d196]';
      case 'communication': return 'bg-[#f45d96]/20 text-[#f45d96]';
      default: return 'bg-primary/20 text-primary-light';
    }
  };
  
  const getCategoryBorderColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'study': return 'bg-[#38b6ff]';
      case 'work': return 'bg-primary';
      case 'health': return 'bg-[#32d196]';
      case 'communication': return 'bg-[#f45d96]';
      default: return 'bg-primary';
    }
  };

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold">Today's Tasks</h2>
        <Button 
          onClick={onAddTask}
          className="bg-dark-tertiary hover:bg-dark-secondary px-4 py-2 rounded-lg flex items-center font-medium transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ThreeDCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-xl">Pending ({pendingTasks.length})</h3>
            <button className="text-gray-400 hover:text-white">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No pending tasks for today</p>
                <p className="text-sm mt-2">Add a task to get started</p>
              </div>
            ) : (
              pendingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="bg-dark-tertiary p-4 rounded-lg border border-gray-700 flex items-center"
                  onClick={() => onToggleTask(task)}
                >
                  <div className="h-6 w-6 rounded-full border-2 border-gray-500 mr-3 flex-shrink-0 cursor-pointer hover:border-primary"></div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{task.title}</h4>
                    <div className="flex items-center mt-1 text-sm text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatTimeRange(task.startTime, task.endTime)}</span>
                      <span className="mx-2">•</span>
                      <span className={cn("px-2 py-0.5 rounded", getCategoryColor(task.category))}>
                        {task.category}
                      </span>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <div className={cn("w-2 h-10 rounded-full", getCategoryBorderColor(task.category))}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ThreeDCard>
        
        <ThreeDCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-xl">Completed ({completedTasks.length})</h3>
            <button className="text-gray-400 hover:text-white">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            {completedTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No completed tasks yet</p>
                <p className="text-sm mt-2">Completed tasks will appear here</p>
              </div>
            ) : (
              completedTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="bg-dark-tertiary p-4 rounded-lg border border-gray-700 flex items-center opacity-70"
                  onClick={() => onToggleTask(task)}
                >
                  <div className="h-6 w-6 rounded-full bg-[#32d196] flex items-center justify-center text-dark mr-3 flex-shrink-0 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium line-through">{task.title}</h4>
                    <div className="flex items-center mt-1 text-sm text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{formatTimeRange(task.startTime, task.endTime)}</span>
                      <span className="mx-2">•</span>
                      <span className={cn("px-2 py-0.5 rounded", getCategoryColor(task.category))}>
                        {task.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ThreeDCard>
      </div>
    </section>
  );
}
