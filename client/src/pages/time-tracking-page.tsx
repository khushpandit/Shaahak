import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { Timer } from '@/components/time-tracking/timer';
import { ActivitySelector } from '@/components/time-tracking/activity-selector';
import { TimeHistory } from '@/components/time-tracking/time-history';
import { useToast } from '@/hooks/use-toast';
import { AnimatedText } from '@/components/ui/animated-text';
import { Plus } from 'lucide-react';
import { TimeEntry } from '@shared/schema';

export default function TimeTrackingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));
  
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentTaskName, setCurrentTaskName] = useState('');

  // Fetch time entries
  const { data: timeEntries = [] } = useQuery({
    queryKey: ['/api/time-entries'],
    queryFn: async () => {
      const res = await fetch('/api/time-entries');
      if (!res.ok) throw new Error('Failed to fetch time entries');
      return res.json();
    }
  });

  // Create time entry mutation
  const createTimeEntryMutation = useMutation({
    mutationFn: async (entryData: {
      startTime: Date;
      endTime: Date;
      category: string;
      duration: number;
      date: Date;
    }) => {
      const res = await apiRequest('POST', '/api/time-entries', entryData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
      toast({
        title: 'Time tracked successfully',
        description: `Added ${currentCategory} activity to your log.`
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to save time entry',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Delete time entry mutation
  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/time-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
      toast({
        title: 'Time entry deleted',
        description: 'The time entry has been removed from your log.'
      });
    }
  });

  const handleSelectActivity = (category: string, taskName: string) => {
    setCurrentCategory(category);
    setCurrentTaskName(taskName);
    setIsTimerActive(true);
  };

  const handleTimerComplete = (timeInSeconds: number) => {
    const now = new Date();
    const startTime = new Date(now.getTime() - (timeInSeconds * 1000));
    
    createTimeEntryMutation.mutate({
      startTime,
      endTime: now,
      category: currentCategory,
      duration: Math.round(timeInSeconds / 60), // Convert to minutes
      date: now
    });
    
    setIsTimerActive(false);
  };

  const handleDeleteTimeEntry = (id: number) => {
    deleteTimeEntryMutation.mutate(id);
  };

  const handleNewTimeEntry = () => {
    setIsTimerActive(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-dark text-white">
      <Sidebar />
      
      <div className="flex-grow overflow-auto">
        <Header 
          title="Time Tracking" 
          date={date} 
          onNewGoal={handleNewTimeEntry} 
        />
        
        <main className="p-4 md:p-6">
          <section className="mb-8">
            <AnimatedText
              text="Track Your Time"
              className="text-3xl font-display font-bold mb-4"
              variant="gradient"
            />
            <p className="text-gray-400">
              Monitor how you spend your time on different activities and build better habits.
            </p>
          </section>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {isTimerActive ? (
              <Timer 
                onTimerComplete={handleTimerComplete}
                category={currentCategory}
                taskName={currentTaskName}
              />
            ) : (
              <ActivitySelector onSelectActivity={handleSelectActivity} />
            )}
            
            <TimeHistory 
              entries={timeEntries}
              onDeleteEntry={handleDeleteTimeEntry}
            />
          </div>
          
          <section className="mb-8">
            <div className="bg-gradient-to-r from-dark-secondary to-dark-tertiary rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                <div className="absolute top-10 right-10 w-20 h-20 bg-primary rounded-full blur-xl"></div>
                <div className="absolute bottom-10 right-20 w-32 h-32 bg-[#f45d96] rounded-full blur-xl"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-xl font-display font-bold mb-4">Time Tracking Tips</h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center mt-0.5 mr-2">
                      <Plus className="h-4 w-4" />
                    </div>
                    <p className="text-gray-300">Use the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center mt-0.5 mr-2">
                      <Plus className="h-4 w-4" />
                    </div>
                    <p className="text-gray-300">Group similar tasks together to minimize context switching and maximize efficiency.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center mt-0.5 mr-2">
                      <Plus className="h-4 w-4" />
                    </div>
                    <p className="text-gray-300">Review your time log weekly to identify patterns and areas for improvement.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
