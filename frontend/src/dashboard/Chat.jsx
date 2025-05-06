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
    try {
      const response = await fetch(`${API_BASE_URL}/usersgroup`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      const userGroups = data.map(item => ({
        id: item.groupId._id,
        mysqlId: item.groupId.mysqlId,
        name: item.groupId.name,
        createdBy: item.groupId.createdById
      }));
      
      setGroups(userGroups);
    } catch (err) {
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
      // This should match the endpoint pattern in your Express router
      // Use the correct query parameter to fetch users in a specific group
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

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Group List */}
      <div className="w-1/4 bg-white border-r border-gray-300 overflow-y-auto">
        <div className="p-4 border-b border-gray-300">
          <h2 className="text-xl font-semibold">Groups</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {groups.map(group => (
            <div 
              key={group.id} 
              className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedGroup?.id === group.id ? 'bg-blue-50' : ''}`}
              onClick={() => handleSelectGroup(group)}
            >
              <h3 className="font-medium">{group.name}</h3>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="p-4 text-gray-500">No groups found</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedGroup ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b border-gray-300 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{selectedGroup.name}</h2>
              </div>
              <div className="relative group">
                <button className="text-gray-600 hover:text-gray-800 focus:outline-none">
                  Members ({groupMembers.length})
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                  <div className="py-1">
                    {groupMembers.map(member => (
                      <div key={member._id} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        {member.name} {member.lastName}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message, index) => {
                const isCurrentUser = message.userId?._id === user.id || message.userId === user.id;
                
                return (
                  <div 
                    key={message._id || index} 
                    className={`mb-4 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                        className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                            isCurrentUser 
                            ? 'bg-blue-500 text-white ml-auto text-right' 
                            : 'bg-white border border-gray-300 mr-auto text-left'
                        }`}
                        >

                      {!isCurrentUser && (
                        <div className="font-medium text-xs mb-1">
                          {message.userId?.name || 'User'} {message.userId?.lastName || ''}
                        </div>
                      )}
                      <p>{message.text}</p>
                      <div className={`text-xs mt-1 text-right ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
              
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-10">
                  No messages yet. Start the conversation!
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-300 p-4">
              <form onSubmit={handleSendMessage} className="flex">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <p className="text-xl">Select a group to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;