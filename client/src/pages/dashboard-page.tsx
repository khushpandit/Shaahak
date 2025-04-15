import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { WelcomeSection } from '@/components/dashboard/welcome-section';
import { ProgressSummary } from '@/components/dashboard/progress-summary';
import { WeeklyActivity } from '@/components/dashboard/weekly-activity';
import { AISuggestions } from '@/components/dashboard/ai-suggestions';
import { TodayTasks } from '@/components/dashboard/today-tasks';
import { FriendsActivity } from '@/components/dashboard/friends-activity';
import { BarChart2, Clock, CheckSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchSuggestions } from '@/lib/suggestions-ai';
import { FriendActivity, Task, Suggestion } from '@shared/schema';

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    }
  });

  // Fetch suggestions
  const { data: suggestions = [], isLoading: isSuggestionsLoading, refetch: refetchSuggestions } = useQuery({
    queryKey: ['/api/suggestions'],
    queryFn: fetchSuggestions
  });

  // Fetch friend activities
  const { data: friendActivities = [] } = useQuery({
    queryKey: ['/api/friend-activities'],
    queryFn: async () => {
      const res = await fetch('/api/friend-activities');
      if (!res.ok) throw new Error('Failed to fetch friend activities');
      return res.json();
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (task: Task) => {
      const res = await apiRequest('PUT', `/api/tasks/${task.id}`, {
        ...task,
        isCompleted: !task.isCompleted
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: 'Task updated',
        description: 'Task status has been updated successfully.'
      });
    }
  });

  const pendingTasks = tasks.filter((task: Task) => !task.isCompleted);
  const completedTasks = tasks.filter((task: Task) => task.isCompleted);

  // Weekly activity data
  const weeklyActivityData = [
    { day: 'Monday', shortDay: 'Mon', hours: 2.5, color: '#6e47d4' },
    { day: 'Tuesday', shortDay: 'Tue', hours: 4.2, color: '#6e47d4' },
    { day: 'Wednesday', shortDay: 'Wed', hours: 4.8, color: '#6e47d4' },
    { day: 'Thursday', shortDay: 'Thu', hours: 5.5, color: '#6e47d4' },
    { day: 'Friday', shortDay: 'Fri', hours: 3.5, color: '#6e47d4' },
    { day: 'Saturday', shortDay: 'Sat', hours: 1.5, color: '#f45d96' },
    { day: 'Sunday', shortDay: 'Sun', hours: 0.5, color: '#f45d96' }
  ];

  // Activity breakdown data
  const activityBreakdown = [
    { category: 'Study', percentage: 65, color: '#38b6ff' },
    { category: 'Work', percentage: 25, color: '#6e47d4' },
    { category: 'Recreation', percentage: 10, color: '#f45d96' }
  ];

  // Progress summary data
  const progressItems = [
    {
      title: 'Productivity Score',
      icon: <BarChart2 className="h-5 w-5" />,
      value: '70%',
      max: 100,
      trend: 'up' as const,
      trendValue: '+15%',
      color: '#38b6ff',
      subText: 'Compared to last week'
    },
    {
      title: 'Focus Time',
      icon: <Clock className="h-5 w-5" />,
      value: '16h',
      max: 25,
      trend: 'down' as const,
      trendValue: '9h left',
      color: '#6e47d4',
      subText: 'Target: 25h'
    },
    {
      title: 'Completed Tasks',
      icon: <CheckSquare className="h-5 w-5" />,
      value: completedTasks.length,
      max: completedTasks.length + pendingTasks.length,
      trend: 'up' as const,
      trendValue: `${Math.round((completedTasks.length / (completedTasks.length + pendingTasks.length || 1)) * 100)}% done`,
      color: '#32d196',
      subText: `Out of ${completedTasks.length + pendingTasks.length} tasks`
    }
  ];

  const handleToggleTask = (task: Task) => {
    updateTaskMutation.mutate(task);
  };

  const handleNewGoal = () => {
    toast({
      title: 'Coming Soon',
      description: 'The goal creation feature is coming soon.'
    });
  };

  const handleRefreshSuggestions = () => {
    refetchSuggestions();
  };

  const handleSuggestionAction = (suggestion: Suggestion) => {
    toast({
      title: 'Action Triggered',
      description: `${suggestion.action} for "${suggestion.title}" suggestion`
    });
  };

  const handleDismissSuggestion = (id: string) => {
    toast({
      title: 'Suggestion Dismissed',
      description: 'The suggestion has been dismissed.'
    });
  };

  const handleAddTask = () => {
    toast({
      title: 'Coming Soon',
      description: 'The task creation feature is coming soon.'
    });
  };

  const handleViewAllFriends = () => {
    window.location.href = '/friends';
  };

  const handleAddFriend = (friendId: number) => {
    toast({
      title: 'Friend Request',
      description: 'Friend request functionality is coming soon.'
    });
  };

  const handleStartTracking = () => {
    window.location.href = '/time-tracking';
  };

  const handleViewSchedule = () => {
    toast({
      title: 'Coming Soon',
      description: 'Schedule view is coming soon.'
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-dark text-white">
      <Sidebar />
      
      <div className="flex-grow overflow-auto">
        <Header 
          title="Dashboard" 
          date={date} 
          onNewGoal={handleNewGoal} 
        />
        
        <main className="p-4 md:p-6">
          <WelcomeSection 
            name={user?.displayName || user?.username || 'User'} 
            progress={68} 
            onStartTracking={handleStartTracking}
            onViewSchedule={handleViewSchedule}
          />
          
          <ProgressSummary 
            items={progressItems} 
            title="Weekly Progress"
            onViewReport={() => window.location.href = '/progress'} 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <WeeklyActivity 
                dailyActivities={weeklyActivityData}
                activityBreakdown={activityBreakdown}
                onPeriodChange={(period) => console.log('Period changed:', period)}
              />
            </div>
            
            <div className="lg:col-span-1">
              <AISuggestions 
                suggestions={suggestions}
                isLoading={isSuggestionsLoading}
                onRefresh={handleRefreshSuggestions}
                onDismiss={handleDismissSuggestion}
                onAction={handleSuggestionAction}
              />
            </div>
          </div>
          
          <TodayTasks 
            pendingTasks={pendingTasks}
            completedTasks={completedTasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
          />
          
          <FriendsActivity 
            friends={friendActivities as FriendActivity[]}
            onViewAll={handleViewAllFriends}
            onAddFriend={handleAddFriend}
          />
        </main>
      </div>
    </div>
  );
}
