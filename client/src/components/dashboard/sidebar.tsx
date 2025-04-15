import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Settings } from 'lucide-react';
import { 
  Home, 
  Target, 
  Clock, 
  BarChart2, 
  Lightbulb, 
  CheckSquare, 
  Users 
} from 'lucide-react';

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Target, label: 'Goals', path: '/goals' },
    { icon: Clock, label: 'Time Tracking', path: '/time-tracking' },
    { icon: BarChart2, label: 'Progress', path: '/progress' },
    { icon: Lightbulb, label: 'AI Suggestions', path: '/suggestions' },
    { icon: CheckSquare, label: 'Habits', path: '/habits' },
    { icon: Users, label: 'Friends', path: '/friends' },
  ];

  return (
    <div className="w-full lg:w-64 bg-dark-secondary border-r border-gray-800 flex flex-col z-10 min-h-screen">
      <div className="p-4 flex items-center justify-center lg:justify-start border-b border-gray-800">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center animate-pulse">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <h1 className="ml-3 text-xl font-display font-bold bg-gradient-to-r from-primary to-[#f45d96] bg-clip-text text-transparent">
            TimeMaster
          </h1>
        </div>
      </div>
      
      <nav className="p-4 flex-grow">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link href={item.path}>
                <a 
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-all", 
                    location === item.path 
                      ? "bg-primary/10 text-primary-light" 
                      : "hover:bg-dark-tertiary"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {user && (
        <div className="p-4 mt-auto border-t border-gray-800">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-600 flex-shrink-0 overflow-hidden">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={`${user.displayName}'s profile`} 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/20 text-primary">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="font-medium">{user.displayName}</p>
              <p className="text-sm text-gray-400">{user.email || user.username}</p>
            </div>
            <button 
              onClick={() => logoutMutation.mutate()}
              className="ml-auto text-gray-400 hover:text-white"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
