import React, { useState, useEffect } from 'react';
import { ThreeDCard } from '@/components/ui/3d-card';
import { Button } from '@/components/ui/button';
import { ProgressCircle } from '@/components/ui/progress-circle';
import { Play, Pause, StopCircle, TimerReset } from 'lucide-react';
import { AnimatedText } from '@/components/ui/animated-text';
import { motion } from 'framer-motion';

interface TimerProps {
  onTimerComplete: (timeInSeconds: number) => void;
  category: string;
  taskName: string;
}

export function Timer({ onTimerComplete, category, taskName }: TimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeDisplay, setTimeDisplay] = useState('00:00:00');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  useEffect(() => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    setTimeDisplay(
      `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    );
  }, [seconds]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSeconds(0);
  };

  const completeTimer = () => {
    setIsActive(false);
    onTimerComplete(seconds);
    setSeconds(0);
  };

  // Get the category color
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'study': return '#38b6ff';
      case 'work': return '#6e47d4';
      case 'health': return '#32d196';
      case 'recreation': return '#f45d96';
      default: return '#6e47d4';
    }
  };

  const color = getCategoryColor(category);

  return (
    <ThreeDCard className="p-6 relative overflow-hidden">
      <div className="mb-6 text-center">
        <AnimatedText
          text={taskName || 'Time Tracking'}
          className="text-2xl font-display font-bold"
          variant="gradient"
        />
        <p className="text-gray-400 mt-2">
          <span 
            className="inline-block px-2 py-1 rounded-full text-sm" 
            style={{ 
              backgroundColor: `${color}20`, 
              color: color 
            }}
          >
            {category}
          </span>
        </p>
      </div>
      
      <div className="flex justify-center my-8">
        <motion.div 
          animate={isActive ? { scale: [1, 1.02, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ProgressCircle
            value={seconds % 60}
            max={60}
            size={220}
            strokeWidth={8}
            color={color}
            label={
              <div className="text-center">
                <div className="text-4xl font-bold font-mono">{timeDisplay}</div>
                <div className="text-sm mt-2 text-gray-400">
                  {isActive ? 'Recording...' : 'Paused'}
                </div>
              </div>
            }
          />
        </motion.div>
      </div>
      
      <div className="flex justify-center space-x-4 mt-8">
        <Button
          onClick={toggleTimer}
          className="w-12 h-12 rounded-full"
          style={{ backgroundColor: color }}
        >
          {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        
        <Button
          onClick={resetTimer}
          variant="outline"
          className="w-12 h-12 rounded-full border-gray-600"
          disabled={seconds === 0}
        >
          <TimerReset className="h-5 w-5" />
        </Button>
        
        <Button
          onClick={completeTimer}
          variant="destructive"
          className="w-12 h-12 rounded-full"
          disabled={seconds === 0}
        >
          <StopCircle className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: color }}></div>
      <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: color }}></div>
    </ThreeDCard>
  );
}
