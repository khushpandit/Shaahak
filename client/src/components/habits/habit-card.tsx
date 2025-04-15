import React from 'react';
import { ThreeDCard } from '@/components/ui/3d-card';
import { CheckSquare, MoreHorizontal, Flame, Award, TrendingUp } from 'lucide-react';
import { ProgressCircle } from '@/components/ui/progress-circle';
import { Button } from '@/components/ui/button';
import { Habit } from '@shared/schema';
import { motion } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HabitCardProps {
  habit: Habit;
  onDeleteHabit: (id: number) => void;
  onCompleteToday: (id: number) => void;
}

export function HabitCard({ habit, onDeleteHabit, onCompleteToday }: HabitCardProps) {
  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'health': return '#32d196';
      case 'study': return '#38b6ff';
      case 'work': return '#6e47d4';
      case 'personal': case 'recreation': return '#f45d96';
      default: return '#6e47d4';
    }
  };
  
  const color = getCategoryColor(habit.category);
  
  // Calculate progress percentage
  const progress = Math.min(100, Math.round((habit.streakCount / habit.targetDays) * 100));

  return (
    <ThreeDCard className="p-6 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: `${color}20`, color }}
          >
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-lg">{habit.title}</h3>
            <div className="flex items-center mt-1">
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {habit.category}
              </span>
              <div className="flex items-center ml-2 text-xs text-gray-400">
                <Flame className="h-3 w-3 mr-1" />
                <span>{habit.streakCount} day streak</span>
              </div>
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
            <DropdownMenuItem onClick={() => onDeleteHabit(habit.id)}>
              <span className="text-destructive">Delete Habit</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex-grow">
        {habit.description && (
          <p className="text-sm text-gray-400 mb-4">{habit.description}</p>
        )}
        
        <div className="flex justify-center my-4">
          <div className="text-center">
            <ProgressCircle
              value={progress}
              max={100}
              color={color}
              size={100}
              strokeWidth={8}
              label={
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {progress >= 100 ? (
                    <Award className="h-8 w-8 text-yellow-400" />
                  ) : (
                    <span className="text-xl font-bold">{progress}%</span>
                  )}
                </motion.div>
              }
            />
            <div className="mt-2 text-sm text-gray-400">
              {habit.streakCount} / {habit.targetDays} days
            </div>
          </div>
        </div>
        
        {progress < 100 && progress > 0 && (
          <div className="my-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">Progress</span>
              <span 
                className="font-medium"
                style={{ color }}
              >
                {progress}%
              </span>
            </div>
            <div className="w-full h-2 bg-dark-tertiary rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-800">
        <Button
          onClick={() => onCompleteToday(habit.id)}
          className="w-full"
          style={{ backgroundColor: color }}
        >
          <CheckSquare className="mr-2 h-4 w-4" />
          Complete Today
        </Button>
      </div>
    </ThreeDCard>
  );
}
