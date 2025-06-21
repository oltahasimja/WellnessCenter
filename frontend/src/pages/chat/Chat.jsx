import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

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
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
const [availableUsers, setAvailableUsers] = useState([]);
const [selectedUsersToAdd, setSelectedUsersToAdd] = useState([]);
const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
const [newGroupName, setNewGroupName] = useState('');
const [seenMessagesOnce, setSeenMessagesOnce] = useState(new Set());


const [newMemberUsername, setNewMemberUsername] = useState('');
const [isCheckingUser, setIsCheckingUser] = useState(false);
const [userCheckError, setUserCheckError] = useState(null);

  
  const [messageSeenStatus, setMessageSeenStatus] = useState({});
  const typingTimeoutRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const API_BASE_URL = 'http://localhost:5001/api';
  const navigate = useNavigate();
  const location = useLocation();
  
  // Connect to socket on component mount
  useEffect(() => {
    // Fetch user data first
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5001/user', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          navigate('/login'); // Redirect to login if not authenticated
        }
        
        const data = await response.json();
        setUser(data.user);
        
        // After getting user data, initialize socket
        const newSocket = io('http://localhost:5001', {
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

  useEffect(() => {
  if (!socket || !user) return;

  socket.on('onlineUsersList', (usersList) => {
    const newOnlineUsers = {};
    usersList.forEach(user => {
      if (user && user.userId) {
        newOnlineUsers[user.userId.toString()] = true;
      }
    });
    // console.log("MORRA onlineUsersList:", newOnlineUsers); 
    setOnlineUsers(newOnlineUsers);
  });

  return () => {
    socket.off('onlineUsersList');
  };
}, [socket, user]);

  
  // Set up socket event listeners
  useEffect(() => {
  if (!socket || !user) return;
  
  // Inform server that user is connected
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

  socket.on('memberLeft', ({ groupId, userId }) => {
  if (selectedGroup && selectedGroup.id === groupId) {
    fetchGroupMembers(groupId); // rifresko listen
  }
});

  socket.on('membersAdded', ({ addedUserIds }) => {
    if (addedUserIds.includes(user.id?.toString())) {
      fetchGroups(); 
    }
  });

  
  // Listen for online status of users
  socket.on('userOnlineStatus', ({ userId, isOnline, onlineUsers: usersList }) => {
    setOnlineUsers(prev => {
      const newOnlineUsers = {...prev};
      
      // Update online users list based on what we get from the server
      if (usersList && Array.isArray(usersList)) {
        // Clear previous online users to avoid stale data
        Object.keys(newOnlineUsers).forEach(key => {
          delete newOnlineUsers[key];
        });
        
        // Add new online users
        usersList.forEach(user => {
          if (user && user.userId) {
            newOnlineUsers[user.userId] = true;
          }
        });
      }
      
      // Update status for this specific user
      if (userId) {
        if (isOnline) {
          newOnlineUsers[userId] = true;
        } else {
          delete newOnlineUsers[userId];
        }
      }
      
      return newOnlineUsers;
    });
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

  socket.on('messageSeenUpdate', ({ messageId, groupId, seenBy }) => {
  if (selectedGroup && selectedGroup.id === groupId) {
    setMessageSeenStatus(prev => ({
      ...prev,
      [messageId]: seenBy
    }));
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
      socket.off('memberLeft');
      socket.off('membersAdded');
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

 useEffect(() => {
  if (!socket || !user || !selectedGroup || messages.length === 0) return;

  const unseenMessages = messages.filter(msg => {
    if (isUserMessage(msg)) return false;

    const seenArray = messageSeenStatus[msg._id] || [];
    return !seenArray.some(
      seen =>
        seen.userId._id === user.id || seen.userId.mysqlId === user.id.toString()
    );
  });

  unseenMessages.forEach((msg) => {
    socket.emit('messageRead', {
      messageId: msg._id,
      userId: user.id,
      groupId: selectedGroup.id
    });
  });
}, [messages, selectedGroup, user, socket, messageSeenStatus]);

useEffect(() => {
  if (!socket) return;

  socket.on('removedFromGroup', ({ groupId, message }) => {
    // Nese je ne ate grup aktualisht
    if (selectedGroup && selectedGroup.id === groupId) {
      // alert(message); 
       navigate('/');  
    }
  });

  return () => {
    socket.off('removedFromGroup');
  };
}, [socket, selectedGroup]);


const getLastSeenMessageForUsers = () => {
  const userLastSeenMessages = {};

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];

    const seenArray = messageSeenStatus[msg._id] || [];

    seenArray.forEach(seen => {
      const userId = seen.userId._id || seen.userId.mysqlId;

      // Mos perfshi veten (nese nuk do)
      if (userId === user.id || userId === user.id.toString()) return;

      if (!userLastSeenMessages[userId]) {
        userLastSeenMessages[userId] = {
          messageId: msg._id,
          userData: seen.userId
        };
      }
    });
  }

  return userLastSeenMessages;
};


// Render i ri qe tregon "Seen by" per secilin mesazh sipas logjikes se re
const renderMessageSeenBy = (message) => {
  const userLastSeenMessages = getLastSeenMessageForUsers();
  
  // Gjej cilet users kane kete mesazh si te fundit qe kane lexuar
  const usersWhoLastSeenThisMessage = [];
  
  Object.entries(userLastSeenMessages).forEach(([userId, data]) => {
    if (data.messageId === message._id) {
if (
  (data.userData._id?.toString() !== user.id?.toString()) &&
  (data.userData.mysqlId?.toString() !== user.id?.toString())
) {
  usersWhoLastSeenThisMessage.push(data.userData);
}    }
  });
  
  if (usersWhoLastSeenThisMessage.length === 0) return null;
  
  // Hiq duplikatet
  const uniqueUsers = Array.from(
    new Set(usersWhoLastSeenThisMessage.map(user => user._id || user.mysqlId))
  ).map(userId =>
    usersWhoLastSeenThisMessage.find(user => 
      (user._id || user.mysqlId) === userId
    )
  );
  
  return (
    <div className="text-xs text-red-600 text-right mt-1 opacity-70">
      Seen by: {uniqueUsers.map(user =>
        `${user.name} ${user.lastName}`
      ).join(', ')}
    </div>
  );
};


  
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
    
    const data = await response.json();
    setMessages(data);
    
    // Rifillo messageSeenStatus nga mesazhet e marra
    const seenStatusObj = {};
    data.forEach(message => {
      if (message.seenBy && message.seenBy.length > 0) {
        seenStatusObj[message._id] = message.seenBy;
      }
    });
    
    setMessageSeenStatus(seenStatusObj);
    
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
      // console.log("Group Members:", members);

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

  useEffect(() => {
  // console.log('Online Users:', onlineUsers);
}, [onlineUsers]);

  
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
  
  // Kontrollo nese nje perdorues eshte online
const isUserOnline = (userId) => {
  if (!userId || !onlineUsers) return false;

  let stringUserId = typeof userId === 'string' ? userId : null;
  let mysqlId = null;
  let mongoId = null;

  if (typeof userId === 'object') {
    mysqlId = userId.mysqlId?.toString();
    mongoId = userId._id?.toString();
  } else {
    stringUserId = userId.toString();
  }

  return Boolean(
    (stringUserId && onlineUsers[stringUserId]) || 
    (mysqlId && onlineUsers[mysqlId]) || 
    (mongoId && onlineUsers[mongoId])
  );
};



  

  
  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-teal-50">Loading...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 p-4 bg-teal-50">{error}</div>;
  }






const getUserProfileImageUniversal = (userObj) => {
  const user = userObj?.userId || userObj;

  if (!user) return null;

  const imageData = user.profileImage || user.profileImageId?.name;

  if (imageData) {
    return (
      <img 
        src={`data:image/jpeg;base64,${imageData}`} 
        alt="Profile" 
        className="w-8 h-8 rounded-full object-cover mt-1"
      />
    );
  } else {
    return (
      <div className="w-8 h-8 rounded-full bg-teal-300 flex items-center justify-center text-white font-bold mt-1">
        {user.name?.charAt(0) || '?'}
      </div>
    );
  }
};






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

// Handle removing a member from the group
const handleRemoveMember = (memberToRemove) => {
  if (!socket || !selectedGroup || !user) return;

  // console.log('Current User:', user);
  // console.log('Selected Group Created By:', selectedGroup.createdBy);
  // console.log('Current User ID:', user.id);
  // console.log('Current User _id:', user._id);
  // console.log('Selected Group Created By Type:', typeof selectedGroup.createdBy);
  // console.log('Current User ID Type:', typeof user.id);

  // More flexible creator check
const isCreator = 
  selectedGroup.createdById === user._id ||
  selectedGroup.createdById === user._id?.toString() ||
  selectedGroup.createdById === user.mongoId ||
  selectedGroup.createdById === user.mongoId?.toString();


  // console.log('Is Creator:', isCreator);

  if (!isCreator) {
    setError('Only the group creator can remove members');
    return;
  }

  // Confirm before removing
  const confirmRemove = window.confirm(`Are you sure you want to remove ${memberToRemove.name} ${memberToRemove.lastName} from the group?`);
  
  if (confirmRemove) {
    socket.emit('removeMemberFromGroup', {
      groupId: selectedGroup.id,
      adminUserId: user.id,
      memberToRemoveId: memberToRemove._id || memberToRemove.mysqlId
    });
  }
};


// Add members
const fetchAvailableUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const data = await response.json();
    
    // Filtro perdoruesit qe nuk jane tashme ne grup
    const usersNotInGroup = data.filter(user => 
      !groupMembers.some(member => 
        member._id === user._id || 
        member.mysqlId === user.mysqlId
      )
    );
    
    setAvailableUsers(usersNotInGroup);
  } catch (err) {
    setError('Error fetching users: ' + err.message);
  }
};



const openAddMembersModal = async () => {
  await fetchAvailableUsers();
  setShowAddMembersModal(true);
};

// Funksioni per te mbyllur modalin
const closeAddMembersModal = () => {
  setShowAddMembersModal(false);
  setSelectedUsersToAdd([]);
};








const handleCreateGroup = async () => {
  if (!newGroupName.trim()) {
    setError('Group name cannot be empty');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        name: newGroupName,
        createdById: user.id
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create group');
    }

    const data = await response.json();
    
    // Add the new group to the current user's groups
    const newGroup = {
      id: data._id || data.id,
      mysqlId: data.mysqlId || data.id,
      name: data.name,
      createdBy: data.createdById || user.id
    };

    setGroups([...groups, newGroup]);
    setShowCreateGroupModal(false);
    setNewGroupName('');

    // Notify via socket if needed
    if (socket) {
      socket.emit('groupCreated', {
        groupId: newGroup.id,
        createdBy: user.id
      });
    }

  } catch (err) {
    console.error("Error creating group:", err);
    setError('Error creating group: ' + err.message);
  }
};



// Funksioni per te shtuar perdorues me username
const handleAddMemberByUsername = async () => {
  if (!newMemberUsername.trim() || !selectedGroup || !socket) return;
  
  try {
    setIsCheckingUser(true);
    setUserCheckError(null);
    
    // 1. Check if user exists
    const checkResponse = await fetch(`${API_BASE_URL}/login/check/${encodeURIComponent(newMemberUsername)}`, {
      credentials: 'include'
    });
    
    if (!checkResponse.ok) {
      throw new Error(`User check failed with status ${checkResponse.status}`);
    }
    
    const checkData = await checkResponse.json();
    
    if (!checkData.exists) {
      throw new Error('User not found');
    }
    
    // 2. Get full user details
    const userResponse = await fetch(`${API_BASE_URL}/login/identifier/${encodeURIComponent(newMemberUsername)}`, {
      credentials: 'include'
    });
    
    if (!userResponse.ok) {
      const errorData = await userResponse.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch user details (${userResponse.status})`);
    }
    
    const userToAdd = await userResponse.json();
    // console.log('User data received:', userToAdd); // Debug log
    
    if (!userToAdd.id && !userToAdd.mysqlId && !userToAdd._id) {
      throw new Error('User data is missing ID field');
    }
    
    // 3. Check if already in group
    const isAlreadyMember = groupMembers.some(member => 
      member.id === userToAdd.id || 
      member.mysqlId === userToAdd.mysqlId ||
      member._id === userToAdd._id
    );
    
    if (isAlreadyMember) {
      throw new Error('User is already in the group');
    }
    
    // 4. Prepare request body
    const requestBody = {
      groupId: selectedGroup.mysqlId || selectedGroup.id
    };
    
    // Add the correct user ID field based on what's available
    if (userToAdd.id) requestBody.userId = userToAdd.id;
    else if (userToAdd.mysqlId) requestBody.userId = userToAdd.mysqlId;
    else if (userToAdd._id) requestBody.userId = userToAdd._id;
    
    // console.log('Creating UsersGroup with:', requestBody); // Debug log
    
    // 5. Add user to group
    const addResponse = await fetch(`${API_BASE_URL}/usersgroup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(requestBody)
    });
    
    if (!addResponse.ok) {
      const errorData = await addResponse.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to add member (${addResponse.status})`);
    }
    
    // 6. Notify via socket
    socket.emit('membersAdded', {
      groupId: selectedGroup.id,
      addedUserIds: [userToAdd.id || userToAdd.mysqlId || userToAdd._id],
      addedBy: user.id
    });
    
    // 7. Refresh group members
    await fetchGroupMembers(selectedGroup.id);
    
    // 8. Reset input
    setNewMemberUsername('');
    
  } catch (err) {
    console.error("Error adding member:", err);
    setUserCheckError(err.message);
  } finally {
    setIsCheckingUser(false);
  }
};






  
  
return (
  <div className="flex h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 font-sans">
    {/* Sidebar - Group List */}
    <div className="w-1/4 bg-white border-r border-teal-200 shadow-lg overflow-hidden">
     <div className="p-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-b-3xl shadow">
  <div className="flex justify-between items-center">
    <h2 className="text-2xl font-bold flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
      Chat Groups
    </h2>
  <div className="flex items-center gap-2">
      <button 
        onClick={() => setShowCreateGroupModal(true)}
        className="text-sm hover:underline flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Create Group
      </button>
   
    </div>
 



    <button 
      onClick={() => navigate('/')} 
      className="text-sm hover:underline flex items-center gap-1"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      Back to Home
    </button>
  </div>
  {user && (
    <div className="flex items-center gap-2 mt-3 p-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
      <div className="w-8 h-8 rounded-full bg-teal-200 text-teal-700 flex items-center justify-center font-bold">
        {/* {user.name?.charAt(0) || '?'} */}
{getUserProfileImageUniversal(user)}

      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{user.name} {user.lastName}</p>
        <div className="flex items-center text-xs">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></span>
          <span>Online</span>
        </div>
      </div>
    </div>
  )}
</div>
      
      <div className="p-3 overflow-y-auto max-h-[calc(100%-130px)]">
        <h3 className="text-xs uppercase tracking-wider text-teal-600 font-semibold mb-2 px-2">Your Groups</h3>
        <div className="space-y-1">
          {groups.map(group => (
            <div 
              key={group.id}
              onClick={() => handleSelectGroup(group)}
              className={`cursor-pointer p-3 transition-all duration-200 rounded-xl flex items-center ${
                selectedGroup?.id === group.id 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md transform scale-105' 
                  : 'hover:bg-teal-50'
              }`}
            >
              <div className={`w-9 h-9 mr-3 rounded-full flex items-center justify-center ${
                selectedGroup?.id === group.id ? 'bg-white text-teal-600' : 'bg-teal-100 text-teal-700'
              }`}>
                <span className="text-lg">#</span>
              </div>
              <span className={`font-medium ${selectedGroup?.id === group.id ? 'text-white' : 'text-teal-800'}`}>
                {group.name}
              </span>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="p-4 text-center text-teal-600 bg-teal-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-teal-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No groups found</p>
              <p className="text-xs mt-1 text-teal-500">You haven't joined any chat groups yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Main Chat Area */}
    <div className="flex-1 flex flex-col">
      {selectedGroup ? (
        <>
          {/* Chat Header */}
          <div className="bg-white p-4 flex justify-between items-center shadow-md border-b border-teal-100">
            <div className="flex items-center">
              <div className="p-2 mr-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg shadow text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-teal-800">{selectedGroup.name}</h2>
                <p className="text-xs text-teal-500">{groupMembers.length} members</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative group/add">
                <button 
                  onClick={openAddMembersModal}
                  className="flex items-center gap-1 text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors p-2 rounded-lg text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Members
                </button>
              </div>
              
              <div className="relative group/members">
                <button className="flex items-center gap-1 text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors p-2 rounded-lg text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Members ({groupMembers.length})
                </button>
                
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl 
                  opacity-0 invisible group-hover/members:visible group-hover/members:opacity-100 
                  transition-all duration-300 ease-in-out z-10 border border-teal-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-3 text-center text-sm font-medium">
                    Group Members
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto">
                    {groupMembers.map(member => (
                      <div 
                        key={member._id} 
                        className="px-4 py-2 text-sm text-teal-800 hover:bg-teal-50 flex items-center justify-between border-b border-teal-50 last:border-b-0"
                      >
                        <div className="flex items-center gap-2">

                       <div className="relative">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center font-medium text-teal-700">
                  {/* {member.name?.charAt(0) || '?'} */}
{getUserProfileImageUniversal({ userId: member })}

                </div>
                {isUserOnline(member.mysqlId?.toString()) && (
  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
)}
              </div>


                          <div>
                            <p>{member.name} {member.lastName}</p>
                            {selectedGroup.createdBy === (member._id || member.mysqlId) && (
                              <span 
                                className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full"
                                title="Group Admin"
                              >
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                        
                <div className="flex items-center gap-2">
  {isUserOnline(member._id || member.mysqlId) && (
    <span className="inline-flex items-center">
      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
      <span className="text-xs text-green-600">online</span>
    </span>
  )}

{selectedGroup.createdBy !== (member._id || member.mysqlId) && (

    <button
      onClick={(e) => {
        e.stopPropagation();
        handleRemoveMember(member);
      }}
      className="text-xs text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-full"
      title="Remove member"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
                            )}






</div>

                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleLeaveGroup}
                className="flex items-center gap-1 text-red-600 hover:text-white border border-red-200 hover:bg-red-500 transition-all p-2 rounded-lg text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Leave
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
            {messages.length === 0 && !Object.keys(typingUsers).length && (
              <div className="flex flex-col items-center justify-center h-full text-center text-teal-500">
                <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-xl font-medium">No messages yet</p>
                <p className="text-teal-400 mt-2">Start the conversation to connect with your group!</p>
              </div>
            )}
            
            {messages.map((message, index) => {
              if (message.systemMessage) {
    return (
      <div key={message._id || index} className="text-center text-sm text-red-600 italic my-4">
        {message.text}
      </div>
    );
  }

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
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-start gap-3 animate-fade-in transition-all duration-300 ease-in-out`}
                >
                  
                  {/* Profile image on left for received messages */}
              {!isCurrentUser && (
                  <div className="relative">
                    {getUserProfileImageUniversal(messageUser)}

                    {isUserOnline(
                      messageUser?._id?.toString() ||
                      messageUser?.mysqlId?.toString() ||
                      messageUser?.id?.toString()
                    ) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                )}

                  
                  <div 
                    className={`max-w-[90%] p-4 rounded-2xl shadow-md ${
                      isCurrentUser 
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-tr-none'
                        : 'bg-white border border-teal-100 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      
                      <span className={`text-xs font-semibold ${isCurrentUser ? 'text-teal-100' : 'text-teal-600'} flex items-center gap-1`}>
                        {isCurrentUser
                          ? `You (${user.name} ${user.lastName})`
                          : messageUser 
                            ? `${messageUser.name} ${messageUser.lastName}`
                            : 'Unknown User'}
                        
                        {/* {userIsOnline && (
                          <span className="w-2 h-2 bg-green-500 rounded-full" title="Online"></span>
                        )} */}
                      </span>
                      
                    </div>
                    
                    <p className="leading-relaxed">{message.text}</p>
                    <div className={`text-[0.7rem] mt-1 text-right ${isCurrentUser ? 'text-teal-100 opacity-80' : 'text-teal-500 opacity-70'}`}>
                      {formatTime(message.createdAt)}
                    </div>
                    {renderMessageSeenBy(message)}
                    
                  </div>
                  
                  {/* Profile image on right for sent messages */}
                    {isCurrentUser && (
                    <div className="relative">
                      {getUserProfileImageUniversal(user)}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                  )}
                
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {Object.keys(typingUsers).length > 0 && (
              <div className="px-4 py-2 text-sm text-teal-700 italic flex items-center">
                <div className="flex space-x-1 mr-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
                {Object.values(typingUsers).length === 1 ? (
                  <span>{Object.values(typingUsers)[0].name} is typing...</span>
                ) : Object.values(typingUsers).length === 2 ? (
                  <span>{Object.values(typingUsers)[0].name} and {Object.values(typingUsers)[1].name} are typing...</span>
                ) : (
                  <span>Multiple people are typing...</span>
                )}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-teal-100 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2 bg-teal-50 rounded-full p-1 shadow-inner">
              <input
                type="text"
                className="flex-1 px-5 py-3 rounded-full border-none focus:ring-2 focus:ring-teal-400 focus:outline-none bg-transparent"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white p-3 rounded-full font-semibold transition-all shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
          <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-2xl font-medium text-teal-800 mb-2">Welcome to Chat</p>
          <p className="text-teal-600 text-center max-w-md px-4">
            Select a group from the sidebar to start chatting with your team members
          </p>
          <div className="mt-6 flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
          </div>
        </div>
      )}
    </div>

    {showCreateGroupModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-teal-700">Create New Group</h3>
        <button 
          onClick={() => {
            setShowCreateGroupModal(false);
            setNewGroupName('');
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-teal-700 mb-1">Group Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
          placeholder="Enter group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <button 
          onClick={() => {
            setShowCreateGroupModal(false);
            setNewGroupName('');
          }}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={handleCreateGroup}
          disabled={!newGroupName.trim()}
          className={`px-4 py-2 rounded-lg transition-colors ${
            newGroupName.trim() 
              ? 'bg-teal-500 hover:bg-teal-600 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Create Group
        </button>
      </div>
    </div>
  </div>
)}
    
    {/* Add Members Modal */}
   {showAddMembersModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-white rounded-xl p-6 w-96 shadow-2xl transform transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-teal-700">Add Members to Group</h3>
        <button 
          onClick={closeAddMembersModal} 
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-teal-700 mb-1">Username or Email</label>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
            placeholder="Enter username or email"
            value={newMemberUsername}
            onChange={(e) => setNewMemberUsername(e.target.value)}
          />
          <button
            onClick={handleAddMemberByUsername}
            disabled={isCheckingUser || !newMemberUsername.trim()}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isCheckingUser || !newMemberUsername.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-teal-500 text-white hover:bg-teal-600'
            }`}
          >
            {isCheckingUser ? 'Adding...' : 'Add'}
          </button>
        </div>
        {userCheckError && (
          <p className="text-red-500 text-sm mt-1">{userCheckError}</p>
        )}
      </div>
      
      <div className="flex justify-end gap-2">
        <button 
          onClick={closeAddMembersModal}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
  </div>
);
}

export default Chat;