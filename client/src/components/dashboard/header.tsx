import React from 'react';
import { Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  title: string;
  date: string;
  onNewGoal?: () => void;
}

export function Header({ title, date, onNewGoal }: HeaderProps) {
  return (
    <header className="bg-dark-secondary sticky top-0 z-10 shadow-md p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">{title}</h2>
          <p className="text-gray-400">{date}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative p-2 rounded-full hover:bg-dark-tertiary">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-[#f45d96] rounded-full"></span>
          </Button>
          
          <div className="relative hidden md:block">
            <Input
              type="text"
              placeholder="Search..."
              className="bg-dark-tertiary rounded-full py-2 px-4 pl-10 w-64 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          </div>
          
          <Button 
            onClick={onNewGoal} 
            className="btn-glow bg-primary hover:bg-primary-light px-4 py-2 rounded-lg font-medium transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>
    </header>
  );
}
