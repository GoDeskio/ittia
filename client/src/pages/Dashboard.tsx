import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PostCreator } from '../components/PostCreator';
import { PostFeed } from '../components/PostFeed';
import { User } from '../types/User';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [refreshFeed, setRefreshFeed] = useState(0);

  const handlePostCreated = () => {
    setRefreshFeed(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* User Info Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-lg relative">
            {user?.bannerImage && (
              <img
                src={user.bannerImage}
                alt="Profile banner"
                className="w-full h-full object-cover rounded-t-lg"
              />
            )}
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-12 mb-4">
              <img
                src={user?.profilePicture || '/default-avatar.png'}
                alt={user?.name}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <div className="ml-4 mb-2">
                <h1 className="text-2xl font-bold">{user?.name}</h1>
                {user?.title && (
                  <p className="text-gray-600">{user.title}</p>
                )}
              </div>
            </div>
            {user?.bio && (
              <p className="text-gray-700">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Post Creator */}
        <PostCreator onPostCreated={handlePostCreated} />

        {/* Post Feed */}
        <PostFeed refreshTrigger={refreshFeed} />
      </div>
    </div>
  );
}; 