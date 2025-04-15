import React from 'react';
import { ThreeDCard } from '@/components/ui/3d-card';
import { UserPlus, ChevronRight } from 'lucide-react';
import { FriendActivity } from '@shared/schema';

interface FriendsActivityProps {
  friends: FriendActivity[];
  onViewAll: () => void;
  onAddFriend: (friendId: number) => void;
}

export function FriendsActivity({ friends, onViewAll, onAddFriend }: FriendsActivityProps) {
  return (
    <section className="mt-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold">Friends Activity</h2>
        <button 
          onClick={onViewAll}
          className="text-primary hover:text-primary-light flex items-center"
        >
          <span>View All</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {friends.length === 0 ? (
          <ThreeDCard className="p-6 col-span-3 text-center">
            <h3 className="font-medium text-xl mb-4">No Friends Yet</h3>
            <p className="text-gray-400 mb-6">Connect with friends to see their activity and compare progress</p>
            <button 
              onClick={() => onViewAll()}
              className="inline-flex items-center justify-center bg-primary hover:bg-primary-light px-4 py-2 rounded-lg text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Find Friends
            </button>
          </ThreeDCard>
        ) : (
          friends.map((friend) => (
            <ThreeDCard key={friend.id} className="p-4">
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
                          backgroundColor: friend.progress > 80 ? '#32d196' : 
                                          friend.progress > 60 ? '#38b6ff' : 
                                          friend.progress > 40 ? '#6e47d4' : '#f45d96'
                        }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-400">{friend.progress}%</span>
                  </div>
                </div>
                <button 
                  onClick={() => onAddFriend(friend.id)}
                  className="ml-auto bg-dark-tertiary hover:bg-gray-700 h-8 w-8 rounded-full flex items-center justify-center"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">Recently completed:</p>
                <p className="text-sm mt-1">{friend.recentActivity}</p>
              </div>
            </ThreeDCard>
          ))
        )}
      </div>
    </section>
  );
}
