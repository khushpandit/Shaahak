import React from 'react';
import { ThreeDCard } from '@/components/ui/3d-card';
import { UserPlus, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Friend, User } from '@shared/schema';

interface FriendRequestProps {
  pendingRequests: Friend[];
  onAcceptRequest: (id: number) => void;
  onRejectRequest: (id: number) => void;
  onSendRequest: (username: string) => void;
  getUser: (id: number) => Promise<User | undefined>;
}

export function FriendRequest({ 
  pendingRequests, 
  onAcceptRequest, 
  onRejectRequest, 
  onSendRequest,
  getUser
}: FriendRequestProps) {
  const [username, setUsername] = React.useState('');
  const [requestUsers, setRequestUsers] = React.useState<Record<number, User>>({});
  
  React.useEffect(() => {
    // Load user details for pending requests
    const loadUsers = async () => {
      const users: Record<number, User> = {};
      
      for (const request of pendingRequests) {
        // Only load the other user (not current user)
        const userId = request.userId;
        if (!users[userId]) {
          const user = await getUser(userId);
          if (user) {
            users[userId] = user;
          }
        }
      }
      
      setRequestUsers(users);
    };
    
    if (pendingRequests.length > 0) {
      loadUsers();
    }
  }, [pendingRequests, getUser]);

  const handleSendRequest = () => {
    if (username.trim()) {
      onSendRequest(username.trim());
      setUsername('');
    }
  };

  return (
    <ThreeDCard className="p-6">
      <h3 className="text-xl font-display font-bold mb-6">Connect with Friends</h3>
      
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username to add"
            className="bg-dark-tertiary border-gray-700"
          />
          <Button 
            onClick={handleSendRequest}
            disabled={!username.trim()}
            className="shrink-0"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Connect with friends to compare progress and stay motivated together
        </p>
      </div>
      
      {pendingRequests.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-300 mb-3">Pending Requests</h4>
          <div className="space-y-3">
            {pendingRequests.map((request) => {
              const requestUser = requestUsers[request.userId];
              
              return (
                <div 
                  key={request.id}
                  className="bg-dark-tertiary p-4 rounded-lg border border-gray-700 flex items-center"
                >
                  <div className="h-10 w-10 rounded-full bg-gray-600 mr-3 overflow-hidden">
                    {requestUser?.avatar ? (
                      <img 
                        src={requestUser.avatar} 
                        alt={`${requestUser.username}'s profile`} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary/20 text-primary">
                        {requestUser?.displayName?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <p className="font-medium">
                      {requestUser?.displayName || requestUser?.username || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Wants to connect with you
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-9 border-destructive hover:bg-destructive/10"
                      onClick={() => onRejectRequest(request.id)}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      className="h-9 bg-primary hover:bg-primary-light"
                      onClick={() => onAcceptRequest(request.id)}
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {pendingRequests.length === 0 && (
        <div className="text-center py-4 text-gray-400">
          <p>No pending friend requests</p>
        </div>
      )}
    </ThreeDCard>
  );
}
