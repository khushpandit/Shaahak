import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { FriendCard } from '@/components/friends/friend-card';
import { FriendRequest } from '@/components/friends/friend-request';
import { Users, Search, UserX, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AnimatedText } from '@/components/ui/animated-text';
import { Friend, FriendActivity, User } from '@shared/schema';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { ThreeDCard } from '@/components/ui/3d-card';

export default function FriendsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));
  
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch friend activities
  const { data: friendActivities = [] } = useQuery({
    queryKey: ['/api/friend-activities'],
    queryFn: async () => {
      const res = await fetch('/api/friend-activities');
      if (!res.ok) throw new Error('Failed to fetch friend activities');
      return res.json();
    }
  });

  // Fetch pending friend requests
  const { data: friends = [] } = useQuery({
    queryKey: ['/api/friends'],
    queryFn: async () => {
      const res = await fetch('/api/friends');
      if (!res.ok) throw new Error('Failed to fetch friends');
      return res.json();
    }
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (friendUsername: string) => {
      // In a real app, we would first get the user ID from the username
      // For this demo, we'll simulate it
      const res = await apiRequest('POST', '/api/friends', {
        friendId: Math.floor(Math.random() * 1000) + 100, // Simulate a user ID
        status: 'pending'
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      toast({
        title: 'Friend request sent',
        description: 'The friend request has been sent successfully.'
      });
    }
  });

  // Update friend request mutation
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest('PUT', `/api/friends/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friend-activities'] });
      toast({
        title: 'Friend request updated',
        description: 'The friend request has been updated.'
      });
    }
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/friends/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friend-activities'] });
      toast({
        title: 'Friend removed',
        description: 'The friend has been removed from your connections.'
      });
    }
  });

  const handleSendRequest = (username: string) => {
    sendRequestMutation.mutate(username);
  };

  const handleAcceptRequest = (id: number) => {
    updateRequestMutation.mutate({ id, status: 'accepted' });
  };

  const handleRejectRequest = (id: number) => {
    updateRequestMutation.mutate({ id, status: 'rejected' });
  };

  const handleRemoveFriend = (id: number) => {
    removeFriendMutation.mutate(id);
  };

  const handleViewProfile = (id: number) => {
    toast({
      title: 'View Profile',
      description: 'Profile viewing is coming soon!'
    });
  };

  // Get user by ID - Simulated function for this demo
  const getUserById = async (id: number): Promise<User | undefined> => {
    // In a real app, this would make an API call
    return {
      id,
      username: `user${id}`,
      displayName: `User ${id}`,
      email: `user${id}@example.com`,
      password: '',
      avatar: ''
    };
  };

  // Filter friends by search query
  const filteredFriends = friendActivities.filter((friend: FriendActivity) => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get pending friend requests (those where current user is the friend, not the requester)
  const pendingRequests = friends.filter((friend: Friend) => 
    friend.status === 'pending' && friend.friendId === user?.id
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-dark text-white">
      <Sidebar />
      
      <div className="flex-grow overflow-auto">
        <Header 
          title="Friends" 
          date={date} 
          onNewGoal={() => {}} 
        />
        
        <main className="p-4 md:p-6">
          <section className="mb-8">
            <AnimatedText
              text="Connect and Compare"
              className="text-3xl font-display font-bold mb-4"
              variant="gradient"
            />
            <p className="text-gray-400">
              Connect with friends, see their progress, and motivate each other.
            </p>
          </section>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-1">
              <FriendRequest 
                pendingRequests={pendingRequests}
                onAcceptRequest={handleAcceptRequest}
                onRejectRequest={handleRejectRequest}
                onSendRequest={handleSendRequest}
                getUser={getUserById}
              />
            </div>
            
            <div className="lg:col-span-2">
              <ThreeDCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-display font-bold">Your Connections</h3>
                  <div className="relative">
                    <Input 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search friends..."
                      className="pl-9 bg-dark-tertiary border-gray-700"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                {filteredFriends.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFriends.map((friend: FriendActivity, index) => (
                      <motion.div
                        key={friend.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <FriendCard 
                          friend={friend}
                          onRemoveFriend={handleRemoveFriend}
                          onViewProfile={handleViewProfile}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto text-gray-500 mb-4" />
                    {searchQuery ? (
                      <>
                        <h3 className="text-xl font-medium mb-2">No Matching Friends</h3>
                        <p className="text-gray-400">
                          No friends match your search query
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-medium mb-2">No Friends Yet</h3>
                        <p className="text-gray-400 mb-6">
                          Connect with friends to compare progress and stay motivated together
                        </p>
                        <Button className="bg-primary hover:bg-primary-light">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Find Friends
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </ThreeDCard>
            </div>
          </div>
          
          <section className="mb-8">
            <div className="bg-gradient-to-r from-dark-secondary to-dark-tertiary rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
                <div className="absolute top-10 right-10 w-20 h-20 bg-primary rounded-full blur-xl"></div>
                <div className="absolute bottom-10 right-20 w-32 h-32 bg-[#f45d96] rounded-full blur-xl"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-xl font-display font-bold mb-4">Benefits of Social Productivity</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-dark-tertiary p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Accountability</h3>
                    <p className="text-sm text-gray-400">
                      When others can see your progress, you're more likely to stay committed.
                    </p>
                  </div>
                  <div className="bg-dark-tertiary p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Friendly Competition</h3>
                    <p className="text-sm text-gray-400">
                      A little competition can boost motivation and productivity.
                    </p>
                  </div>
                  <div className="bg-dark-tertiary p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Support System</h3>
                    <p className="text-sm text-gray-400">
                      Friends can offer encouragement and advice when you face challenges.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
