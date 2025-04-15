import React, { useState } from 'react';
import { ThreeDCard } from '@/components/ui/3d-card';
import { motion } from 'framer-motion';
import { BookOpen, Briefcase, HeartPulse, Music } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface ActivitySelectorProps {
  onSelectActivity: (category: string, taskName: string) => void;
}

export function ActivitySelector({ onSelectActivity }: ActivitySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [taskName, setTaskName] = useState('');

  const categories: Category[] = [
    { 
      id: 'study', 
      name: 'Study', 
      icon: <BookOpen className="h-6 w-6" />, 
      color: '#38b6ff' 
    },
    { 
      id: 'work', 
      name: 'Work', 
      icon: <Briefcase className="h-6 w-6" />, 
      color: '#6e47d4' 
    },
    { 
      id: 'health', 
      name: 'Health', 
      icon: <HeartPulse className="h-6 w-6" />, 
      color: '#32d196' 
    },
    { 
      id: 'recreation', 
      name: 'Recreation', 
      icon: <Music className="h-6 w-6" />, 
      color: '#f45d96' 
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleStartTracking = () => {
    if (selectedCategory && taskName.trim()) {
      onSelectActivity(selectedCategory, taskName);
    }
  };

  return (
    <ThreeDCard className="p-6">
      <h3 className="text-xl font-display font-bold mb-6">What are you working on?</h3>
      
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-2">Choose a category:</div>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCategoryClick(category.id)}
              className={`p-4 rounded-lg cursor-pointer flex items-center ${
                selectedCategory === category.id 
                  ? 'border-2 border-opacity-100'
                  : 'border border-gray-700'
              }`}
              style={{ 
                backgroundColor: `${category.color}15`,
                borderColor: selectedCategory === category.id ? category.color : undefined
              }}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                style={{ backgroundColor: `${category.color}30`, color: category.color }}
              >
                {category.icon}
              </div>
              <span 
                className="font-medium"
                style={{ color: selectedCategory === category.id ? category.color : undefined }}
              >
                {category.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <div className="text-sm text-gray-400 mb-2">Task name:</div>
        <Input
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Enter task name..."
          className="bg-dark-tertiary border-gray-700"
        />
      </div>
      
      <Button
        onClick={handleStartTracking}
        className="w-full"
        disabled={!selectedCategory || !taskName.trim()}
        style={{ 
          backgroundColor: selectedCategory 
            ? categories.find(c => c.id === selectedCategory)?.color 
            : undefined 
        }}
      >
        Start Tracking
      </Button>
    </ThreeDCard>
  );
}
