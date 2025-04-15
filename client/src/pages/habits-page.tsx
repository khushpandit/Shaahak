import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { HabitCard } from '@/components/habits/habit-card';
import { HabitForm } from '@/components/habits/habit-form';
import { Plus, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AnimatedText } from '@/components/ui/animated-text';
import { Habit, insertHabitSchema } from '@shared/schema';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export default function HabitsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Fetch habits
  const { data: habits = [], isLoading } = useQuery({
    queryKey: ['/api/habits'],
    queryFn: async () => {
      const res = await fetch('/api/habits');
      if (!res.ok) throw new Error('Failed to fetch habits');
      return res.json();
    }
  });

  // Create habit mutation
  const createHabitMutation = useMutation({
    mutationFn: async (habit: z.infer<typeof insertHabitSchema>) => {
      const res = await apiRequest('POST', '/api/habits', {
        ...habit,
        userId: user?.id
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: 'Habit created',
        description: 'Your new habit has been created successfully.'
      });
      setIsFormOpen(false);
    }
  });

  // Update habit mutation (for completing)
  const updateHabitMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<Habit> }) => {
      const res = await apiRequest('PUT', `/api/habits/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: 'Habit updated',
        description: 'Your habit has been updated successfully.'
      });
    }
  });

  // Delete habit mutation
  const deleteHabitMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/habits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      toast({
        title: 'Habit deleted',
        description: 'The habit has been deleted.'
      });
    }
  });

  const handleCreateHabit = (data: z.infer<typeof insertHabitSchema>) => {
    createHabitMutation.mutate(data);
  };

  const handleCompleteToday = (id: number) => {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      updateHabitMutation.mutate({
        id,
        data: { streakCount: habit.streakCount + 1 }
      });
    }
  };

  const handleDeleteHabit = (id: number) => {
    deleteHabitMutation.mutate(id);
  };

  const filteredHabits = habits.filter(habit => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'active') return habit.isActive;
    return !habit.isActive;
  });

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-dark text-white">
      <Sidebar />
      
      <div className="flex-grow overflow-auto">
        <Header 
          title="Habits" 
          date={date} 
          onNewGoal={() => setIsFormOpen(true)} 
        />
        
        <main className="p-4 md:p-6">
          <section className="mb-8">
            <AnimatedText
              text="Build Lasting Habits"
              className="text-3xl font-display font-bold mb-4"
              variant="gradient"
            />
            <p className="text-gray-400">
              Track and maintain positive habits with our 21-day habit formation system.
            </p>
          </section>
          
          <div className="flex flex-wrap gap-4 mb-8">
            <Button 
              variant={activeFilter === 'all' ? "default" : "outline"}
              onClick={() => setActiveFilter('all')}
            >
              All Habits
            </Button>
            <Button 
              variant={activeFilter === 'active' ? "default" : "outline"}
              onClick={() => setActiveFilter('active')}
            >
              Active
            </Button>
            <Button 
              variant={activeFilter === 'completed' ? "default" : "outline"}
              onClick={() => setActiveFilter('completed')}
            >
              Completed
            </Button>
            
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="ml-auto bg-primary hover:bg-primary-light">
                  <Plus className="h-4 w-4 mr-2" />
                  New Habit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-transparent border-0 p-0">
                <HabitForm 
                  onSubmit={handleCreateHabit} 
                  onCancel={() => setIsFormOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your habits...</p>
            </div>
          ) : filteredHabits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHabits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <HabitCard 
                    habit={habit}
                    onDeleteHabit={handleDeleteHabit}
                    onCompleteToday={handleCompleteToday}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-dark-secondary rounded-xl p-8">
              <CheckSquare className="h-16 w-16 mx-auto text-gray-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">No Habits Yet</h3>
              <p className="text-gray-400 mb-6">
                Create your first habit to start building positive routines
              </p>
              <Button onClick={() => setIsFormOpen(true)} className="bg-primary hover:bg-primary-light">
                <Plus className="h-4 w-4 mr-2" />
                Create First Habit
              </Button>
            </div>
          )}
          
          <section className="mt-12">
            <div className="bg-gradient-to-r from-dark-secondary to-dark-tertiary rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                <div className="absolute top-10 right-10 w-20 h-20 bg-primary rounded-full blur-xl"></div>
                <div className="absolute bottom-10 right-20 w-32 h-32 bg-[#f45d96] rounded-full blur-xl"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-xl font-display font-bold mb-4">Habit Building Tips</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-dark-tertiary p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Start Small</h3>
                    <p className="text-sm text-gray-400">
                      Begin with tiny habits that take less than two minutes to complete.
                    </p>
                  </div>
                  <div className="bg-dark-tertiary p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Be Consistent</h3>
                    <p className="text-sm text-gray-400">
                      Perform your habit at the same time every day to build routine.
                    </p>
                  </div>
                  <div className="bg-dark-tertiary p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Track Progress</h3>
                    <p className="text-sm text-gray-400">
                      Seeing your streak grow is a powerful motivator to continue.
                    </p>
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
