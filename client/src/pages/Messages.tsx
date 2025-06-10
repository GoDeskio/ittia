import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Box, Container, Grid, Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Badge, TextField, IconButton, CircularProgress } from '@mui/material';
import { Send as SendIcon, Search as SearchIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  _id: string;
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  recipient: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  content: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  otherUser: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    read: boolean;
  };
  unreadCount: number;
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch recent conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get('/api/messages/recent');
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
    // Set up polling for new messages
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/messages/conversation/${selectedConversation}?page=${page}`);
        if (page === 1) {
          setMessages(response.data.messages);
        } else {
          setMessages(prev => [...prev, ...response.data.messages]);
        }
        setHasMore(response.data.currentPage < response.data.totalPages);
        
        // Mark messages as read
        const unreadMessages = response.data.messages
          .filter((msg: Message) => !msg.read && msg.sender._id === selectedConversation)
          .map((msg: Message) => msg._id);
        
        if (unreadMessages.length > 0) {
          await axios.post('/api/messages/mark-read', { messageIds: unreadMessages });
          // Update conversations to reflect read status
          setConversations(prevConversations =>
            prevConversations.map(conv =>
              conv.otherUser._id === selectedConversation
                ? { ...conv, unreadCount: 0 }
                : conv
            )
          );
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    // Set up polling for new messages in conversation
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [selectedConversation, page]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      const response = await axios.post('/api/messages', {
        recipientId: selectedConversation,
        content: newMessage.trim()
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');

      // Update conversations list
      setConversations(prev =>
        prev.map(conv =>
          conv.otherUser._id === selectedConversation
            ? {
                ...conv,
                lastMessage: {
                  content: newMessage.trim(),
                  createdAt: new Date().toISOString(),
                  read: false
                }
              }
            : conv
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
            <Typography variant="h6" gutterBottom>
              Conversations
            </Typography>
            <List sx={{ overflow: 'auto', flex: 1 }}>
              {conversations.map((conversation) => (
                <ListItem
                  key={conversation.otherUser._id}
                  button
                  selected={selectedConversation === conversation.otherUser._id}
                  onClick={() => {
                    setSelectedConversation(conversation.otherUser._id);
                    setPage(1);
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={conversation.unreadCount}
                      color="primary"
                      invisible={conversation.unreadCount === 0}
                    >
                      <Avatar src={conversation.otherUser.profilePicture} alt={conversation.otherUser.name}>
                        {conversation.otherUser.name[0]}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conversation.otherUser.name}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{
                            display: 'inline',
                            fontWeight: conversation.unreadCount > 0 ? 'bold' : 'normal'
                          }}
                        >
                          {conversation.lastMessage.content}
                        </Typography>
                        {' · '}
                        {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Messages */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)' }}>
            {selectedConversation ? (
              <>
                <Box sx={{ overflow: 'auto', flex: 1, mb: 2 }}>
                  {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
                  {messages.map((message) => (
                    <Box
                      key={message._id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender._id === user?._id ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          p: 2,
                          borderRadius: 2,
                          bgcolor: message.sender._id === user?._id ? 'primary.main' : 'grey.200',
                          color: message.sender._id === user?._id ? 'white' : 'text.primary'
                        }}
                      >
                        <Typography variant="body1">{message.content}</Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.8 }}>
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    size="small"
                  />
                  <IconButton type="submit" color="primary" disabled={!newMessage.trim()}>
                    <SendIcon />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
                Select a conversation to start messaging
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Messages; 