import React from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { ThreeDCard } from '@/components/ui/3d-card';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Target, Clock, BarChart2 } from 'lucide-react';

export default function GoalsPage() {
  const { user } = useAuth();
  const [date] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));

  // Fetch goals
  const { data: goals, isLoading } = useQuery({
    queryKey: ['/api/goals'],
    queryFn: async () => {
      const res = await fetch('/api/goals');
      if (!res.ok) throw new Error('Failed to fetch goals');
      return res.json();
    }
  });

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-dark text-white">
      <Sidebar />
      
      <div className="flex-grow overflow-auto">
        <Header 
          title="Goals" 
          date={date} 
          onNewGoal={() => {}} 
        />
        
        <main className="p-4 md:p-6">
          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold mb-6">Your Goals</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : goals?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Render goals here */}
                <ThreeDCard className="p-6">
                  <div className="mb-4 flex items-center">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/20 text-primary-light mr-3">
                      <Target className="h-5 w-5" />
                    </div>
                    <h3 className="font-medium text-xl">Coming Soon</h3>
                  </div>
                  <p className="text-gray-400">The goals feature is under development. Check back soon!</p>
                </ThreeDCard>
              </div>
            ) : (
              <ThreeDCard className="p-6 text-center">
                <div className="py-8">
                  <Target className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Goals Yet</h3>
                  <p className="text-gray-400 mb-6">Set your first goal to start tracking your progress</p>
                  <button className="bg-primary hover:bg-primary-light px-4 py-2 rounded-lg inline-flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Set a New Goal
                  </button>
                </div>
              </ThreeDCard>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
