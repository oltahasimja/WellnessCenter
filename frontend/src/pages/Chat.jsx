import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

function Chat() {
  const [socket, setSocket] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);
  const API_BASE_URL = 'http://localhost:5000/api';

  // Connect to socket on component mount
  useEffect(() => {
    // Fetch user data first
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/user', {
          credentials: 'include' // Important for sending cookies
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUser(data.user);
        
        // After getting user data, initialize socket
        const newSocket = io('http://localhost:5000', {
          withCredentials: true
        });
        
        setSocket(newSocket);
        
        // Clean up socket on unmount
        return () => {
          newSocket.disconnect();
        };
      } catch (err) {
        setError('Error connecting to server: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Listen for new messages
    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    // Listen for errors
    socket.on('error', (err) => {
      setError('Socket error: ' + err);
    });
    
    // Initialize by fetching user's groups
    fetchGroups();
    
    setLoading(false);
    
    return () => {
      socket.off('newMessage');
      socket.off('error');
    };
  }, [socket]);

  // Fetch user's groups
  const fetchGroups = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/usersgroup`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch groups: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Filter the groups to only include those where the current user is a member
      const userGroups = data
        .filter(item => {
          // Check if the userId in the group matches the current user's ID
          return item.userId && 
                 (item.userId._id === user.id || 
                  item.userId.mysqlId === user.id.toString());
        })
        .map(item => ({
          id: item.groupId._id,
          mysqlId: item.groupId.mysqlId,
          name: item.groupId.name,
          createdBy: item.groupId.createdById
        }));
      
      setGroups(userGroups);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setError('Error fetching groups: ' + err.message);
    }
  };

  // Fetch messages for a specific group
  const fetchMessages = async (groupId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messagemongo/group/${groupId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError('Error fetching messages: ' + err.message);
    }
  };

  // Fetch members of a specific group
  const fetchGroupMembers = async (groupId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/usersgroup?groupId=${groupId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch group members: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract user details from the usersgroup data
      const members = data.map(item => item.userId);
      setGroupMembers(members);
    } catch (err) {
      setError('Error fetching group members: ' + err.message);
    }
  };

  // Handle group selection
  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    fetchMessages(group.id);
    fetchGroupMembers(group.id);
    
    // Join the socket room for this group
    if (socket) {
      socket.emit('joinRoom', group.id);
    }
  };

  // Send a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedGroup || !socket) return;
    
    // Emit the message to the server
    socket.emit('sendMessage', {
      groupId: selectedGroup.id,
      text: newMessage,
      userId: user.id
    });
    
    // Clear the input
    setNewMessage('');
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Re-fetch groups when user info is loaded
  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-teal-50">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 bg-teal-50">{error}</div>;
  }

  return (
    <div className="flex h-screen bg-gradient-to-r from-teal-50 to-teal-100 font-sans">
      {/* Header */}
      {/* Sidebar - Group List */}
      <div className="w-1/4 bg-white border-r border-teal-200 shadow-md">
        <div className="p-5 bg-gradient-to-r from-teal-400 to-teal-500 text-white rounded-b-2xl shadow">
          <h2 className="text-2xl font-bold">💬 Chat Groups</h2>
          {user && <p className="text-sm mt-1">👤 {user.name}</p>}
        </div>
        <div className="divide-y divide-teal-100 mt-2 overflow-y-auto">
          {groups.map(group => (
            <div 
              key={group.id}
              onClick={() => handleSelectGroup(group)}
              className={`cursor-pointer px-5 py-4 transition-all duration-200 hover:bg-teal-100 ${
                selectedGroup?.id === group.id ? 'bg-teal-200 font-semibold rounded-r-full shadow-inner' : ''
              }`}
            >
              <span className="text-teal-800  items-center gap-2">
                <span className="text-lg">#</span> {group.name}
              </span>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="p-4 text-teal-600">No groups found</div>
          )}
        </div>
      </div>
  
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-teal-400 to-teal-500 p-5 flex justify-between items-center text-white shadow-md">
              <h2 className="text-xl font-bold">{selectedGroup.name}</h2>
              <div className="relative group">
                <button className="hover:underline">👥 Members ({groupMembers.length})</button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl hidden group-hover:block z-10 border border-teal-200">
                  {groupMembers.map(member => (
                    <div key={member._id} className="px-4 py-2 text-sm text-teal-800 hover:bg-teal-50">
                      {member.name} {member.lastName}
                    </div>
                  ))}
                </div>
              </div>
            </div>
  
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-teal-50">
            {messages.map((message, index) => {
const isCurrentUser = 
(typeof message.userId === 'string' && message.userId === user.id) ||
(typeof message.userId === 'object' && (message.userId._id === user.id || message.userId.mysqlId === user.id.toString()));
return (
    <div 
      key={message._id || index} 
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
    >
      <div 
        className={`max-w-[70%] p-4 rounded-2xl shadow ${
          isCurrentUser 
            ? 'bg-teal-400 text-white text-right'
            : 'bg-white border border-teal-200 text-left'
        }`}
      >
       <div className="text-xs font-semibold text-teal-600 mb-1">
  {isCurrentUser
    ? `You (${user.name} ${user.lastName})`
    : `${message.userId?.name || 'User'} ${message.userId?.lastName || ''}`}
</div>

        <p className="leading-snug">{message.text}</p>
        <div className="text-[0.7rem] mt-1 text-right opacity-70">
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
})}

              <div ref={messagesEndRef} />
              {messages.length === 0 && (
                <div className="text-center text-teal-500 mt-10">No messages yet. Start the conversation!</div>
              )}
            </div>
  
            {/* Message Input */}
            <div className="bg-white border-t border-teal-200 px-6 py-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 rounded-full border border-teal-300 focus:ring-2 focus:ring-teal-400 focus:outline-none"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-md"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-teal-50">
            <p className="text-teal-600 text-xl">Select a group to start chatting 🗨️</p>
          </div>
        )}
      </div>
    </div>
  );
  
}

export default Chat;