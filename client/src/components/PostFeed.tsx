import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import {
  Grid,
  Typography,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  FavoriteOutlined as LikeIcon,
  ChatBubbleOutline as CommentIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import {
  StyledCard,
  CommentBox,
  EnhancedButton,
  FeedContainer,
} from './shared/StyledComponents';

interface Comment {
  _id: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
}

interface Post {
  _id: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  mediaUrls: string[];
  mediaTypes: ('image' | 'video' | 'audio' | 'file')[];
  likes: string[];
  comments: Comment[];
  shares: number;
  createdAt: string;
}

interface PostFeedProps {
  refreshTrigger?: number;
}

export const PostFeed: React.FC<PostFeedProps> = ({ refreshTrigger }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`/api/posts/feed?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      if (page === 1) {
        setPosts(response.data);
      } else {
        setPosts(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.data.length === 10);
      setError('');
    } catch (err) {
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchPosts();
  }, [refreshTrigger]);

  const handleLike = async (postId: string) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likes: response.data.userLiked 
              ? [...post.likes, user!._id || user!.id]
              : post.likes.filter(id => id !== (user!._id || user!.id))
          };
        }
        return post;
      }));
    } catch (err) {
      setError('Failed to update like');
    }
  };

  const handleComment = async (postId: string, content: string) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/comments`, 
        { content },
        { headers: { Authorization: `Bearer ${user?.token}` }}
      );
      
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            comments: [...post.comments, response.data]
          };
        }
        return post;
      }));
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  const handleShare = async (postId: string) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/share`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            shares: response.data.shares
          };
        }
        return post;
      }));
    } catch (err) {
      setError('Failed to share post');
    }
  };

  const renderMedia = (url: string, type: string) => {
    if (type === 'image') {
      return (
        <img 
          src={url} 
          alt="Post media" 
          className="w-full h-auto rounded-lg"
          loading="lazy"
        />
      );
    } else if (type === 'video') {
      return (
        <video 
          src={url} 
          controls 
          className="w-full h-auto rounded-lg"
          preload="metadata"
        />
      );
    } else if (type === 'audio') {
      return (
        <audio 
          src={url} 
          controls 
          className="w-full"
          preload="metadata"
        />
      );
    }
    return null;
  };

  return (
    <FeedContainer>
      {/* New Post Creation */}
      <StyledCard>
        <Grid container spacing={2} p={2}>
          <Grid item>
            <Avatar />
          </Grid>
          <Grid item xs>
            <CommentBox
              fullWidth
              placeholder="What's on your mind?"
              multiline
              variant="outlined"
            />
          </Grid>
          <Grid item>
            <EnhancedButton variant="contained" color="primary">
              Post
            </EnhancedButton>
          </Grid>
        </Grid>
      </StyledCard>

      {/* Posts Feed */}
      {posts.map(post => (
        <StyledCard key={post._id}>
          <Grid container spacing={2} p={2}>
            <Grid item>
              <Avatar
                src={post.author.profilePicture || '/default-avatar.png'}
                alt={post.author.name}
              />
            </Grid>
            <Grid item xs>
              <Typography variant="subtitle1" fontWeight="bold">
                {post.author.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {format(new Date(post.createdAt), 'MMM d, yyyy h:mm a')}
              </Typography>
            </Grid>
          </Grid>
          
          <Typography variant="body1" px={2} pb={2}>
            {post.content}
          </Typography>

          {/* Media */}
          {post.mediaUrls.length > 0 && (
            <div className="mb-4 grid gap-2">
              {post.mediaUrls.map((url, index) => (
                <div key={url}>
                  {renderMedia(url, post.mediaTypes[index])}
                </div>
              ))}
            </div>
          )}

          {/* Interaction Stats */}
          <Grid container px={2} pb={1} spacing={1}>
            <Grid item>
              <IconButton onClick={() => handleLike(post._id)}>
                <LikeIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton onClick={() => {
                const comment = prompt('Add a comment:');
                if (comment) handleComment(post._id, comment);
              }}>
                <CommentIcon />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton onClick={() => handleShare(post._id)}>
                <ShareIcon />
              </IconButton>
            </Grid>
          </Grid>

          {/* Comments Section */}
          <Grid container px={2} pb={2}>
            <Grid item xs={12}>
              <CommentBox
                fullWidth
                placeholder="Write a comment..."
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </StyledCard>
      ))}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      )}

      {!loading && hasMore && (
        <button
          onClick={() => {
            setPage(prev => prev + 1);
            fetchPosts();
          }}
          className="w-full py-2 text-blue-600 hover:bg-gray-50 rounded-lg"
        >
          Load More
        </button>
      )}
    </FeedContainer>
  );
};

export default PostFeed; 