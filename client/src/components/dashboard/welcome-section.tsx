import React from 'react';
import { Play, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeSectionProps {
  name: string;
  progress: number;
  onStartTracking: () => void;
  onViewSchedule: () => void;
}

export function WelcomeSection({ 
  name, 
  progress, 
  onStartTracking, 
  onViewSchedule 
}: WelcomeSectionProps) {
  return (
    <section className="mb-8 animate-fade-in">
      <div className="bg-gradient-to-r from-dark-secondary to-dark-tertiary rounded-xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-20 h-20 bg-[#f45d96] rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-20 w-32 h-32 bg-primary rounded-full blur-xl"></div>
        </div>
        
        <div className="relative z-10 md:w-2/3">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Welcome back, <span className="bg-gradient-to-r from-primary to-[#f45d96] bg-clip-text text-transparent">{name}</span>!
          </h1>
          <p className="text-gray-300 mb-6 text-lg">
            You've accomplished <span className="font-bold text-[#32d196]">{progress}%</span> of your weekly goals. Keep up the great work!
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={onStartTracking}
              className="bg-primary hover:bg-primary-light px-6 py-3 rounded-lg font-medium transition-all flex items-center"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Tracking
            </Button>
            <Button 
              onClick={onViewSchedule}
              variant="outline"
              className="bg-dark-tertiary hover:bg-dark-secondary border border-gray-700 px-6 py-3 rounded-lg font-medium transition-all flex items-center"
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Schedule
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
