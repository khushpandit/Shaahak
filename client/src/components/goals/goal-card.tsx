import React from 'react';
import { ThreeDCard } from '@/components/ui/3d-card';
import { Target, Clock, Calendar, MoreHorizontal, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProgressCircle } from '@/components/ui/progress-circle';
import { Goal } from '@shared/schema';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

interface GoalCardProps {
  goal: Goal;
  onDeleteGoal: (id: number) => void;
  onMarkComplete: (id: number) => void;
  onAddHours: (id: number, hours: number) => void;
}

export function GoalCard({ goal, onDeleteGoal, onMarkComplete, onAddHours }: GoalCardProps) {
  const progressPercentage = Math.min(100, Math.round((goal.actualHours / goal.targetHours) * 100));
  
  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'study': return '#38b6ff';
      case 'work': return '#6e47d4';
      case 'health': return '#32d196';
      case 'recreation': return '#f45d96';
      default: return '#6e47d4';
    }
  };
  
  const color = getCategoryColor(goal.category);
  
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const daysLeft = () => {
    const today = new Date();
    const endDate = new Date(goal.endDate);
    const diffTime = Math.abs(endDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (today > endDate) return 'Overdue';
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
  };

  return (
    <ThreeDCard className="p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-lg">{goal.title}</h3>
            <div className="flex items-center mt-1">
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {goal.category}
              </span>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddHours(goal.id, 1)}>
              Add 1 Hour
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onMarkComplete(goal.id)}>
              Mark as Complete
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => onDeleteGoal(goal.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex-grow">
        {goal.description && (
          <p className="text-sm text-gray-400 mb-4">{goal.description}</p>
        )}
        
        <div className="flex items-center space-x-6 mb-6">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm">
              {goal.actualHours} / {goal.targetHours} hours
            </span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm">{daysLeft()}</span>
          </div>
        </div>
        
        <div className="flex justify-center my-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ProgressCircle
              value={progressPercentage}
              max={100}
              color={color}
              size={120}
              strokeWidth={8}
              label={
                goal.isCompleted ? (
                  <CheckCircle className="h-10 w-10 text-green-400" />
                ) : (
                  <div className="text-center">
                    <div className="text-2xl font-bold">{progressPercentage}%</div>
                    <div className="text-xs text-gray-400">completed</div>
                  </div>
                )
              }
            />
          </motion.div>
        </div>
        
        <div className="mt-3 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Start: {formatDate(goal.startDate)}</span>
            <span>End: {formatDate(goal.endDate)}</span>
          </div>
        </div>
      </div>
      
      {!goal.isCompleted && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <Button
            onClick={() => onMarkComplete(goal.id)}
            className="w-full"
            style={{ backgroundColor: color }}
            disabled={goal.isCompleted}
          >
            {progressPercentage >= 100 ? 'Mark Complete' : 'Add Progress'}
          </Button>
        </div>
      )}
      
      {goal.isCompleted && (
        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-center">
          <div className="flex items-center text-green-400">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Completed</span>
          </div>
        </div>
      )}
    </ThreeDCard>
  );
}
