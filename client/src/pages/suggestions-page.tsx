import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { ThreeDCard } from '@/components/ui/3d-card';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Lightbulb, Zap, RefreshCw, CheckCircle, Calendar, Clock, Target, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedText } from '@/components/ui/animated-text';
import { fetchSuggestions, getDefaultSuggestions } from '@/lib/suggestions-ai';
import { GlowingButton } from '@/components/ui/glowing-button';
import { useToast } from '@/hooks/use-toast';
import { Suggestion } from '@shared/schema';
import { motion } from 'framer-motion';

export default function SuggestionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch suggestions
  const { data: suggestions = [], isLoading: isSuggestionsLoading, refetch: refetchSuggestions } = useQuery({
    queryKey: ['/api/suggestions'],
    queryFn: fetchSuggestions
  });

  const handleRefreshSuggestions = () => {
    refetchSuggestions();
    toast({
      title: 'Suggestions Refreshed',
      description: 'AI is generating new personalized suggestions for you.'
    });
  };

  const handleDismissSuggestion = (id: string) => {
    toast({
      title: 'Suggestion Dismissed',
      description: 'The suggestion has been removed from your list.'
    });
  };

  const handleApplySuggestion = (suggestion: Suggestion) => {
    toast({
      title: 'Suggestion Applied',
      description: `The "${suggestion.title}" suggestion has been applied.`
    });
  };

  const getInsightCategories = () => [
    { id: 'focus', label: 'Focus', icon: <Zap className="h-5 w-5" />, color: '#38b6ff' },
    { id: 'goal', label: 'Goals', icon: <Target className="h-5 w-5" />, color: '#6e47d4' },
    { id: 'habit', label: 'Habits', icon: <CheckCircle className="h-5 w-5" />, color: '#32d196' },
    { id: 'time', label: 'Time', icon: <Clock className="h-5 w-5" />, color: '#f45d96' }
  ];

  const filteredSuggestions = selectedCategory 
    ? suggestions.filter(s => s.type === selectedCategory) 
    : suggestions;

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#38b6ff';
      case 'medium': return '#6e47d4';
      case 'low': return '#32d196';
      default: return '#6e47d4';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-dark text-white">
      <Sidebar />
      
      <div className="flex-grow overflow-auto">
        <Header 
          title="AI Suggestions" 
          date={date} 
          onNewGoal={() => {}} 
        />
        
        <main className="p-4 md:p-6">
          <section className="mb-8">
            <AnimatedText
              text="Smart Insights for Your Progress"
              className="text-3xl font-display font-bold mb-4"
              variant="gradient"
            />
            <p className="text-gray-400">
              AI-powered suggestions to help you optimize your productivity and achieve your goals faster.
            </p>
          </section>
          
          <div className="flex flex-wrap gap-4 mb-8">
            <Button 
              variant={selectedCategory === null ? "default" : "outline"}
              className={selectedCategory === null ? "bg-primary" : ""}
              onClick={() => setSelectedCategory(null)}
            >
              All Suggestions
            </Button>
            
            {getInsightCategories().map(category => (
              <Button 
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={selectedCategory === category.id ? "" : ""}
                style={selectedCategory === category.id ? { backgroundColor: category.color } : {}}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.icon}
                <span className="ml-2">{category.label}</span>
              </Button>
            ))}
            
            <div className="ml-auto">
              <GlowingButton
                onClick={handleRefreshSuggestions}
                glowColor="rgba(110, 71, 212, 0.6)"
                className="btn-glow bg-primary hover:bg-primary-light"
                iconLeft={<RefreshCw className={`h-4 w-4 ${isSuggestionsLoading ? 'animate-spin' : ''}`} />}
              >
                Refresh Insights
              </GlowingButton>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ThreeDCard className="p-6">
                    <div className="flex items-center mb-4">
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center mr-3"
                        style={{ 
                          backgroundColor: `${getImpactColor(suggestion.impact)}20`, 
                          color: getImpactColor(suggestion.impact) 
                        }}
                      >
                        {suggestion.type === 'focus' && <Zap className="h-5 w-5" />}
                        {suggestion.type === 'goal' && <Target className="h-5 w-5" />}
                        {suggestion.type === 'habit' && <CheckCircle className="h-5 w-5" />}
                        {suggestion.type === 'time' && <Clock className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-medium">{suggestion.title}</h3>
                        <span 
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: `${getImpactColor(suggestion.impact)}20`, 
                            color: getImpactColor(suggestion.impact) 
                          }}
                        >
                          {suggestion.impact.charAt(0).toUpperCase() + suggestion.impact.slice(1)} Impact
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-6">{suggestion.description}</p>
                    
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDismissSuggestion(suggestion.id)}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        style={{ backgroundColor: getImpactColor(suggestion.impact) }}
                        onClick={() => handleApplySuggestion(suggestion)}
                      >
                        {suggestion.action}
                      </Button>
                    </div>
                  </ThreeDCard>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full">
                <ThreeDCard className="p-10 text-center">
                  <Lightbulb className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Suggestions Available</h3>
                  <p className="text-gray-400 mb-6">
                    {isSuggestionsLoading 
                      ? 'Generating personalized suggestions...' 
                      : 'Use the app more to get personalized AI suggestions.'}
                  </p>
                  <Button onClick={handleRefreshSuggestions} className="mx-auto">
                    <RefreshCw className={`h-4 w-4 mr-2 ${isSuggestionsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </ThreeDCard>
              </div>
            )}
          </div>
          
          <section className="mt-8">
            <ThreeDCard className="p-6 bg-gradient-to-r from-dark-secondary to-dark-tertiary relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                <div className="absolute top-10 right-10 w-20 h-20 bg-primary rounded-full blur-xl"></div>
                <div className="absolute bottom-10 right-20 w-32 h-32 bg-[#f45d96] rounded-full blur-xl"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-xl font-display font-bold mb-4">How AI Suggestions Work</h2>
                <p className="text-gray-300 mb-4">
                  Our AI analyzes your activity patterns, goals, and habits to provide personalized suggestions that can help you improve your productivity and achieve your goals more effectively.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-dark-tertiary p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <BarChart2 className="h-5 w-5 text-[#38b6ff] mr-2" />
                      <h3 className="font-medium">Data Analysis</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      We analyze your tracked time, goals, and habits to identify patterns.
                    </p>
                  </div>
                  <div className="bg-dark-tertiary p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Lightbulb className="h-5 w-5 text-[#f45d96] mr-2" />
                      <h3 className="font-medium">Smart Insights</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Our AI generates personalized suggestions based on your behaviors.
                    </p>
                  </div>
                  <div className="bg-dark-tertiary p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Target className="h-5 w-5 text-[#32d196] mr-2" />
                      <h3 className="font-medium">Continuous Learning</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      The more you use the app, the more accurate your suggestions become.
                    </p>
                  </div>
                </div>
              </div>
            </ThreeDCard>
          </section>
        </main>
      </div>
    </div>
  );
}
