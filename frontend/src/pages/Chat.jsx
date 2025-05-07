import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

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
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({}); 
  const typingTimeoutRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const API_BASE_URL = 'http://localhost:5000/api';
  const navigate = useNavigate();
  const location = useLocation();
  
  // Connect to socket on component mount
  useEffect(() => {
    // Fetch user data first
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/user', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          navigate('/login'); // Redirect to login if not authenticated
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
    if (!socket || !user) return;
    
    // Informo serverin që përdoruesi është i lidhur
    socket.emit('userConnected', { userId: user.id });
    
    // Listen for new messages
    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Clear typing indicator when message is received from that user
      if (message.userId && selectedGroup) {
        setTypingUsers(prev => {
          const newTypingUsers = {...prev};
          if (typeof message.userId === 'object') {
            delete newTypingUsers[message.userId._id];
          } else {
            delete newTypingUsers[message.userId];
          }
          return newTypingUsers;
        });
      }
    });
    
    // Dëgjo për statusin online të përdoruesve
    socket.on('userOnlineStatus', ({ userId, isOnline, onlineUsers: usersList }) => {
      setOnlineUsers(prev => {
        const newOnlineUsers = {...prev};
        
        // Përditëso listën e përdoruesve online bazuar në listën e marrë nga serveri
        if (usersList && Array.isArray(usersList)) {
          usersList.forEach(user => {
            newOnlineUsers[user.userId] = true;
          });
        }
        
        // Përditëso statusin e këtij përdoruesi specifik
        if (isOnline) {
          newOnlineUsers[userId] = true;
        } else {
          delete newOnlineUsers[userId];
        }
        
        return newOnlineUsers;
      });
    });
    
    // Merr listën fillestare të përdoruesve online
    socket.on('onlineUsersList', (usersList) => {
      if (usersList && Array.isArray(usersList)) {
        const newOnlineUsers = {};
        usersList.forEach(user => {
          newOnlineUsers[user.userId] = true;
        });
        setOnlineUsers(newOnlineUsers);
      }
    });
    
    // Listen for typing events
    socket.on('userTyping', ({ userId, userName, groupId }) => {
      if (selectedGroup && selectedGroup.id === groupId) {
        setTypingUsers(prev => ({
          ...prev,
          [userId]: { name: userName, timestamp: Date.now() }
        }));
      }
    });
    
    // Listen for stopped typing events
    socket.on('userStoppedTyping', ({ userId, groupId }) => {
      if (selectedGroup && selectedGroup.id === groupId) {
        setTypingUsers(prev => {
          const newTypingUsers = {...prev};
          delete newTypingUsers[userId];
          return newTypingUsers;
        });
      }
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
      socket.off('userTyping');
      socket.off('userStoppedTyping');
      socket.off('userOnlineStatus');
      socket.off('onlineUsersList');
      socket.off('error');
    };
  }, [socket, user, selectedGroup]);
  
  // Handle user typing detection
  useEffect(() => {
    if (!socket || !user || !selectedGroup || newMessage.length === 0) return;
    
    // Emit typing event
    socket.emit('typing', {
      userId: user.id,
      userName: `${user.name} ${user.lastName}`,
      groupId: selectedGroup.id
    });
    
    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set a timeout to emit stopped typing event
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stoppedTyping', {
        userId: user.id,
        groupId: selectedGroup.id
      });
    }, 3000); // 3 seconds after last keystroke
    
    // Clean up timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage, socket, user, selectedGroup]);
  
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
    
    // Reset typing users when changing groups
    setTypingUsers({});
    
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
    
    // Emit stopped typing when sending a message
    socket.emit('stoppedTyping', {
      userId: user.id,
      groupId: selectedGroup.id
    });
    
    // Clear the input
    setNewMessage('');
  };
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);
  
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
  
  // Helper function to check if a message is from the current user
  const isUserMessage = (message) => {
    if (!user || !message || !message.userId) return false;
    
    // Convert all IDs to strings for consistent comparison
    const currentUserId = user.id?.toString();
    
    // Handle cases where userId might be an object or string
    if (typeof message.userId === 'string') {
      return message.userId === currentUserId;
    }
    
    // Handle case where userId is an object with _id or mysqlId
    if (typeof message.userId === 'object') {
      const messageUserId = message.userId._id?.toString();
      const messageMysqlId = message.userId.mysqlId?.toString();
      
      return messageUserId === currentUserId || messageMysqlId === currentUserId;
    }
    
    return false;
  };
  
  // Kontrollo nëse një përdorues është online
  const isUserOnline = (userId) => {
    if (!userId || !onlineUsers) return false;

    
    
    // Konverto ID-në në string për krahasim konsistent
    const stringUserId = userId.toString();
    const mysqlId = typeof userId === 'object' ? userId.mysqlId?.toString() : null;
    const mongoId = typeof userId === 'object' ? userId._id?.toString() : null;
    
    return Boolean(
      onlineUsers[stringUserId] || 
      (mysqlId && onlineUsers[mysqlId]) || 
      (mongoId && onlineUsers[mongoId])
    );
  };
  
  // Render typing indicators
  const renderTypingIndicators = () => {
    const typingUsersArray = Object.values(typingUsers);
    
    if (typingUsersArray.length === 0) return null;
    
    return (
      <div className="px-4 py-2 text-sm text-teal-700 italic animate-pulse">
        {typingUsersArray.length === 1 ? (
          <span>{typingUsersArray[0].name} is typing...</span>
        ) : typingUsersArray.length === 2 ? (
          <span>{typingUsersArray[0].name} and {typingUsersArray[1].name} are typing...</span>
        ) : (
          <span>Multiple people are typing...</span>
        )}
      </div>
    );
  };
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-teal-50">Loading...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 p-4 bg-teal-50">{error}</div>;
  }

  // Helper function to get profile image for any user (including current user)
  const getUserProfileImage = (userObj) => {
    if (!userObj) return null;
    
    // Check if user has a profile image
    if (userObj.profileImageId && userObj.profileImageId.name) {
      return (
        <img 
          src={`data:image/jpeg;base64,${userObj.profileImageId.name}`} 
          alt="Profile" 
          className="w-8 h-8 rounded-full object-cover mt-1"
        />
      );
    } else {
      // Fallback to initials avatar
      return (
        <div className="w-8 h-8 rounded-full bg-teal-300 flex items-center justify-center text-white font-bold mt-1">
          {userObj.name?.charAt(0) || '?'}
        </div>
      );
    }
  };



// Leave group function
const handleLeaveGroup = async () => {
  if (!selectedGroup || !socket || !user) return;
  
  try {
    // First, find the UsersGroup document ID that connects this user to this group
    let usersGroupId = null;
    
    // Fetch all UsersGroup entries for this group
    const groupMembersResponse = await fetch(`${API_BASE_URL}/usersgroup?groupId=${selectedGroup.mysqlId || selectedGroup.id}`, {
      credentials: 'include'
    });
    
    if (!groupMembersResponse.ok) {
      throw new Error(`Failed to fetch group members: ${groupMembersResponse.status}`);
    }
    
    const groupMembersData = await groupMembersResponse.json();
    
    // Find the entry for the current user
    const userGroupEntry = groupMembersData.find(entry => {
      if (!entry.userId) return false;
      
      const entryUserId = entry.userId.mysqlId || entry.userId._id;
      return entryUserId === user.id || entryUserId === user.id.toString();
    });
    
    if (!userGroupEntry) {
      throw new Error("Could not find your membership in this group");
    }
    
    usersGroupId = userGroupEntry.mysqlId || userGroupEntry._id;
    
    // Emit the leave group event via socket
    socket.emit('leaveGroup', {
      groupId: selectedGroup.id,
      userId: user.id,
      userName: user.name,
      lastName: user.lastName
    });
    
    // Leave the socket room
    socket.emit('leaveRoom', selectedGroup.id);
    
    // Delete the UsersGroup entry to remove the user from the group
    const response = await fetch(`${API_BASE_URL}/usersgroup/${usersGroupId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (!response.ok) {
      // throw new Error(`Failed to leave group: ${response.status} ${response.statusText}`);
    }
    
    // Update local groups list
    setGroups(groups.filter(group => group.id !== selectedGroup.id));
    
    // Reset the selected group
    setSelectedGroup(null);
    setMessages([]);
    setGroupMembers([]);
    
  } catch (err) {
    console.error("Error leaving group:", err);
    setError('Error leaving group: ' + err.message);
  }
};
  
  return (
    <div className="flex h-screen bg-gradient-to-r from-teal-50 to-teal-100 font-sans">
      {/* Sidebar - Group List */}
      <div className="w-1/4 bg-white border-r border-teal-200 shadow-md">
        <div className="p-5 bg-gradient-to-r from-teal-400 to-teal-500 text-white rounded-b-2xl shadow">
          <h2 className="text-2xl font-bold">💬 Chat Groups</h2>
          {user && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">👤 {user.name}</span>
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" 
                    title="You are online"></span>
            </div>
          )}
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
              <span className="text-teal-800 items-center gap-2">
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
  <div className="flex items-center gap-4">
    <div className="relative group">
      <button className="hover:underline">👥 Members ({groupMembers.length})</button>
      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl hidden group-hover:block z-10 border border-teal-200">
        {groupMembers.map(member => (
          <div key={member._id} className="px-4 py-2 text-sm text-teal-800 hover:bg-teal-50 flex items-center justify-between">
            <span>{member.name} {member.lastName}</span>
            {isUserOnline(member._id || member.mysqlId) && (
              <span className="inline-flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                <span className="text-xs text-green-600">online</span>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
    <button 
      onClick={handleLeaveGroup}
      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm transition-colors"
    >
      Leave Group
    </button>
  </div>
</div>
  
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-teal-50">
              {messages.map((message, index) => {
                const isCurrentUser = 
                  (typeof message.userId === 'string' && message.userId === user.id) ||
                  (typeof message.userId === 'object' && (
                    message.userId._id === user.id || 
                    message.userId.mysqlId === user.id.toString()
                  ));
                  
                const messageUser = isCurrentUser 
                  ? user 
                  : (typeof message.userId === 'object' ? message.userId : null);
                
                // Check if this user is online
                const userIsOnline = messageUser ? isUserOnline(messageUser._id || messageUser.id || messageUser.mysqlId) : false;
                
                return (
                  <div 
                    key={message._id || index} 
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-start gap-3 animate-fade-in`}
                  >
                    {/* Profile image on left for received messages */}
                    {!isCurrentUser && (
                      <div className="relative">
                        {getUserProfileImage(messageUser)}
                        {userIsOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                    )}
                    
                    <div 
                      className={`max-w-[70%] p-4 rounded-2xl shadow ${
                        isCurrentUser 
                          ? 'bg-teal-400 text-white text-right'
                          : 'bg-white border border-teal-200 text-left'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-teal-600 flex items-center gap-1">
                          {isCurrentUser
                            ? `You (${user.name} ${user.lastName})`
                            : messageUser 
                              ? `${messageUser.name} ${messageUser.lastName}`
                              : 'Unknown User'}
                          
                          {userIsOnline && (
                            <span className="w-2 h-2 bg-green-500 rounded-full" title="Online"></span>
                          )}
                        </span>
                      </div>
                      
                      <p className="leading-snug">{message.text}</p>
                      <div className="text-[0.7rem] mt-1 text-right opacity-70">
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                    
                    {/* Profile image on right for sent messages */}
                    {isCurrentUser && (
                      <div className="relative">
                        {/* {getUserProfileImage(user)} */}
                        {/* <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span> */}
                      </div>
                    )}
                  </div>
                );
              })}
              {renderTypingIndicators()}
              <div ref={messagesEndRef} />
              {messages.length === 0 && !Object.keys(typingUsers).length && (
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