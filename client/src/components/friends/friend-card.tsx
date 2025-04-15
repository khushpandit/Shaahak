import React from 'react';
import { ThreeDCard } from '@/components/ui/3d-card';
import { UserPlus, MoreHorizontal, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FriendActivity } from '@shared/schema';

interface FriendCardProps {
  friend: FriendActivity;
  onRemoveFriend: (id: number) => void;
  onViewProfile: (id: number) => void;
}

export function FriendCard({ friend, onRemoveFriend, onViewProfile }: FriendCardProps) {
  const getProgressColor = (progress: number): string => {
    if (progress > 80) return '#32d196';
    if (progress > 60) return '#38b6ff';
    if (progress > 40) return '#6e47d4';
    return '#f45d96';
  };

  const progressColor = getProgressColor(friend.progress);

  return (
    <ThreeDCard className="p-4 h-full">
      <div className="flex items-start">
        <div className="h-12 w-12 rounded-full bg-gray-600 mr-3 overflow-hidden">
          {friend.avatar ? (
            <img 
              src={friend.avatar} 
              alt={`${friend.name}'s profile`} 
              className="h-full w-full object-cover" 
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary/20 text-primary text-lg font-medium">
              {friend.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h4 className="font-medium">{friend.name}</h4>
          <p className="text-sm text-gray-400">{friend.hoursThisWeek} hours this week</p>
          <div className="mt-2 flex items-center">
            <div className="w-24 h-2 bg-dark-tertiary rounded-full overflow-hidden">
              <div 
                className="h-full" 
                style={{ 
                  width: `${friend.progress}%`,
                  backgroundColor: progressColor
                }}
              ></div>
            </div>
            <span className="ml-2 text-xs text-gray-400">{friend.progress}%</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto h-8 w-8 rounded-full"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewProfile(friend.id)}>
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => onRemoveFriend(friend.id)}
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Remove Friend
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-800">
        <p className="text-sm text-gray-400">Recently completed:</p>
        <p className="text-sm mt-1">{friend.recentActivity}</p>
      </div>
    </ThreeDCard>
  );
}
