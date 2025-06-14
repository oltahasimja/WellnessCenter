const mongoose = require('mongoose');
const { UserMongo, MessageMongo, GroupMongo, UsersGroupMongo } = require('../domain/database/models/indexMongo');
const { UsersGroup } = require('../domain/database/models');

function socketHandler(io) {
  global.onlineUsers = {};
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Objekti për ruajtjen e përdoruesve aktivë
  // Nëse nuk ekziston tashmë në nivel global, krijo një
  if (!global.onlineUsers) {
    global.onlineUsers = {};
  }
  
  // Auth middleware
  const isAuthenticated = async (next) => {
    try {
      const userId = socket.handshake.auth.userId || socket.request.session?.passport?.user;
      
      if (!userId) {
        return next(new Error('Not authenticated'));
      }
      
      const user = await UserMongo.findOne({ mysqlId: userId });
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  };

  // Kur një përdorues lidhet, regjistro ID-në e tij si online
  socket.on('userConnected', async (userData) => {
  try {
    const userId = userData.userId;
    if (!userId) return;

    const user = await UserMongo.findOne({ mysqlId: userId });
    if (!user) return;

    if (!global.onlineUsers) {
      global.onlineUsers = {};
    }

    if (!global.onlineUsers[userId]) {
      global.onlineUsers[userId] = [];
    }

    global.onlineUsers[userId].push({
      socketId: socket.id,
      lastActive: new Date(),
    });

    io.emit('userOnlineStatus', {
      userId,
      isOnline: true,
      onlineUsers: Object.keys(global.onlineUsers).map((id) => ({
        userId: id,
      })),
    });

    // KJO PJESË E SHTUAR: Emito direkt tek të gjithë listën e plotë
  io.emit('onlineUsersList', Object.keys(global.onlineUsers).map((id) => ({ userId: id })));


  } catch (error) {
    console.error('Error in userConnected:', error);
  }
});



  // Join a chat room (group)
 socket.on('joinRoom', (groupId) => {
  socket.join(groupId);
  console.log(`User ${socket.id} joined room ${groupId}`);

  io.to(groupId).emit('onlineUsersList', Object.keys(global.onlineUsers).map((id) => ({ userId: id })));
});


  // Leave a chat room
  socket.on('leaveRoom', (groupId) => {
    socket.leave(groupId);
    console.log(`User ${socket.id} left room ${groupId}`);
  });

  

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { groupId, userId, userName } = data;
    
    if (!groupId || !userId || !userName) {
      socket.emit('error', 'Missing required fields for typing');
      return;
    }
    
    // Broadcast to all users in the group except the sender
    socket.to(groupId).emit('userTyping', { userId, userName, groupId });
  });

  // Handle stopped typing
  socket.on('stoppedTyping', (data) => {
    const { groupId, userId } = data;
    
    if (!groupId || !userId) {
      socket.emit('error', 'Missing required fields for stopped typing');
      return;
    }
    
    // Broadcast to all users in the group except the sender
    socket.to(groupId).emit('userStoppedTyping', { userId, groupId });
  });

socket.on('leaveGroup', async (data) => {
  try {
    const { groupId, userId, userName, lastName } = data;

    if (!groupId || !userId || !userName) {
      socket.emit('error', 'Missing required fields for leaving group');
      return;
    }

    const user = await UserMongo.findOne({ mysqlId: userId });
    if (!user) {
      socket.emit('error', 'User not found');
      return;
    }

    let group;
    if (mongoose.Types.ObjectId.isValid(groupId)) {
      group = await GroupMongo.findById(groupId);
    } else {
      group = await GroupMongo.findOne({ mysqlId: groupId });
    }

    if (!group) {
      socket.emit('error', 'Group not found');
      return;
    }

    socket.leave(groupId);

    const systemMessage = new MessageMongo({
      text: `${user.name} ${user.lastName || ''} left the group`,
      systemMessage: true,
      groupId: group._id,
      createdAt: new Date()
    });

    await systemMessage.save();
    const populatedMessage = await MessageMongo.findById(systemMessage._id).exec();

    io.to(group._id.toString()).emit('newMessage', populatedMessage);

    // ✅ Emit event që një anëtar është larguar
    io.to(group._id.toString()).emit('memberLeft', {
      groupId: group._id.toString(),
      userId: userId
    });

  } catch (error) {
    console.error('Error handling group leave:', error);
    socket.emit('error', 'Failed to process leaving group');
  }
});



  // Handle new message
socket.on('sendMessage', async (data) => {
  try {
    const { groupId, text, userId } = data;

    if (!groupId || !text || !userId) {
      socket.emit('error', 'Missing required fields');
      return;
    }

    const user = await UserMongo.findOne({ mysqlId: userId });
    if (!user) {
      socket.emit('error', 'User not found');
      return;
    }

    const groupIdForMongo = mongoose.Types.ObjectId.isValid(groupId)
      ? new mongoose.Types.ObjectId(groupId)
      : null;

    if (!groupIdForMongo) {
      socket.emit('error', 'Invalid groupId for Mongo');
      return;
    }

    const newMessage = new MessageMongo({
      text,
      userId: user._id,
      groupId: groupIdForMongo,
      createdAt: new Date()
    });

    await newMessage.save();

    const populatedMessage = await MessageMongo.findById(newMessage._id)
        .populate({
          path: 'userId',
          select: 'name lastName mysqlId profileImageId',
          populate: {
            path: 'profileImageId',
            select: 'name data'
          }
        })
        .exec()

    // Dërgo mesazhin në grup
    io.to(groupId).emit('newMessage', populatedMessage);

    // 🆕 PJESA E RE: Gjej të gjithë anëtarët e grupit dhe numëro mesazhet e palexuara
    const groupMembers = await UsersGroupMongo.find({ groupId: groupIdForMongo })
   .populate({
  path: 'userId',
  select: 'name lastName mysqlId profileImageId',
  populate: {
    path: 'profileImageId',
    select: 'name'
  }
})

    // Për çdo anëtar të grupit (përveç dërguesit)
    for (const member of groupMembers) {
      if (member.userId.mysqlId !== userId) {
        // Numëro mesazhet e palexuara për këtë user
        const unreadCount = await MessageMongo.countDocuments({
          groupId: groupIdForMongo,
          'seenBy.userId': { $ne: member.userId._id },
          systemMessage: { $ne: true }, // Mos numëro mesazhet sistemore
          userId: { $ne: member.userId._id } // Mos numëro mesazhet e veta
        });

        // Dërgo tek user-i specifik numrin e mesazheve të palexuara
        const userSockets = global.onlineUsers[member.userId.mysqlId?.toString()];
        if (userSockets && userSockets.length > 0) {
          userSockets.forEach(({ socketId }) => {
            io.to(socketId).emit('unreadMessagesUpdate', {
              groupId: groupId,
              unreadCount: unreadCount
            });
          });
        }
      }
    }

    console.log(`Message sent to group ${groupId} by user ${userId}`);
  } catch (error) {
    console.error('Error sending message:', error);
    socket.emit('error', 'Failed to send message');
  }
});

socket.on('getTotalUnreadCount', async (data) => {
  try {
    const { userId } = data;
    
    if (!userId) {
      socket.emit('error', 'Missing userId');
      return;
    }

    const user = await UserMongo.findOne({ mysqlId: userId });
    if (!user) {
      socket.emit('error', 'User not found');
      return;
    }

    // Gjej të gjitha grupet ku është anëtar user-i
    const userGroups = await UsersGroupMongo.find({ userId: user._id })
      .populate('groupId')
      .exec();

    let totalUnreadCount = 0;

    // Për çdo grup, numëro mesazhet e palexuara
    for (const userGroup of userGroups) {
      const unreadCount = await MessageMongo.countDocuments({
        groupId: userGroup.groupId._id,
        'seenBy.userId': { $ne: user._id },
        systemMessage: { $ne: true },
        userId: { $ne: user._id }
      });
      totalUnreadCount += unreadCount;
    }

    // Dërgo numrin total tek user-i
    socket.emit('totalUnreadCount', { totalUnreadCount });

  } catch (error) {
    console.error('Error getting total unread count:', error);
    socket.emit('error', 'Failed to get unread count');
  }
});


  // Add this event handler in the existing socket.io connection handler
socket.on('messageRead', async (data) => {
  try {
    const { messageId, userId, groupId } = data;

    if (!messageId || !userId || !groupId) {
      socket.emit('error', 'Missing required fields for message read');
      return;
    }

    const user = await UserMongo.findOne({ mysqlId: userId });

    if (!user) {
      socket.emit('error', 'User not found');
      return;
    }

    const message = await MessageMongo.findById(messageId);

    if (!message) {
      socket.emit('error', 'Message not found');
      return;
    }

    // Kontrollo nëse useri e ka parë tashmë mesazhin
    const alreadySeen = message.seenBy.some(
      (entry) => entry.userId.toString() === user._id.toString()
    );

    if (!alreadySeen) {
      message.seenBy.push({
        userId: user._id,
        seenAt: new Date()
      });

      await message.save();
    }

    // Popullo të dhënat për dërgim te klienti
    const populatedMessage = await MessageMongo.findById(messageId)
      .populate('seenBy.userId', 'name lastName mysqlId');

    io.to(groupId).emit('messageSeenUpdate', {
      messageId,
      groupId,
      seenBy: populatedMessage.seenBy
    });

    // Rifresko unread count për përdoruesin që pa mesazhin
    const groupIdForMongo = mongoose.Types.ObjectId.isValid(groupId)
      ? new mongoose.Types.ObjectId(groupId)
      : await GroupMongo.findOne({ mysqlId: groupId }).then(g => g?._id);

    if (groupIdForMongo) {
      const unreadCount = await MessageMongo.countDocuments({
        groupId: groupIdForMongo,
        'seenBy.userId': { $ne: user._id },
        systemMessage: { $ne: true },
        userId: { $ne: user._id }
      });

      socket.emit('unreadMessagesUpdate', {
        groupId: groupId,
        unreadCount: unreadCount
      });
    }

  } catch (error) {
    console.error('Error processing message read:', error);
    socket.emit('error', 'Failed to process message read');
  }
});



// Add this event handler in the existing socket.io connection handler
socket.on('removeMemberFromGroup', async (data) => {
  try {
    const { groupId, adminUserId, memberToRemoveId } = data;

    if (!groupId || !adminUserId || !memberToRemoveId) {
      socket.emit('error', 'Missing required fields for removing member');
      return;
    }

    // Gjej adminin (personin që heq tjetrin)
    const adminUser = await UserMongo.findOne({ mysqlId: adminUserId });
    if (!adminUser) {
      socket.emit('error', 'Admin user not found');
      return;
    }

    // Gjej grupin
    const group = await GroupMongo.findOne({
      $or: [{ _id: groupId }, { mysqlId: groupId }]
    });
    if (!group) {
      socket.emit('error', 'Group not found');
      return;
    }

    // Verifiko që adminUser është krijuesi i grupit
    if (group.createdById.toString() !== adminUser._id.toString()) {
      socket.emit('error', 'Only group creator can remove members');
      return;
    }

    // Gjej anëtarin që do largohet
    const memberToRemove = await UserMongo.findOne({
      $or: [{ _id: memberToRemoveId }, { mysqlId: memberToRemoveId }]
    });
    if (!memberToRemove) {
      socket.emit('error', 'Member to remove not found');
      return;
    }

    // Fshi nga MySQL
    await UsersGroup.destroy({
      where: {
        userId: memberToRemove.mysqlId,
        groupId: group.mysqlId
      }
    });

    // Fshi nga MongoDB
    await UsersGroupMongo.deleteOne({
      userId: memberToRemove._id,
      groupId: group._id
    });

    // ✅ Krijo mesazh sistemor (pa userId)
    const systemMessage = new MessageMongo({
      text: `${adminUser.name} ${adminUser.lastName || ''} removed ${memberToRemove.name} ${memberToRemove.lastName || ''} from the group`,
      systemMessage: true,
      groupId: group._id,
      createdAt: new Date()
    });

    await systemMessage.save();

    const populatedMessage = await MessageMongo.findById(systemMessage._id).exec();

    // Dërgo mesazhin në grup
    io.to(groupId.toString()).emit('newMessage', populatedMessage);

    const userSockets = global.onlineUsers[memberToRemove.mysqlId?.toString()];
if (userSockets && userSockets.length > 0) {
  userSockets.forEach(({ socketId }) => {
    io.to(socketId).emit('removedFromGroup', {
      groupId: group._id.toString(),
      message: `You were removed from ${group.name}`
    });
  });
}

    // Dërgo sinjal që useri është hequr
    io.to(groupId.toString()).emit('memberRemoved', {
      groupId: groupId,
      memberId: memberToRemove._id,
      memberName: `${memberToRemove.name} ${memberToRemove.lastName || ''}`
    });

    console.log(`✅ Member ${memberToRemove.name} removed from group ${group.name} by ${adminUser.name}`);

  } catch (error) {
    console.error('❌ Error removing member from group:', error);
    socket.emit('error', 'Failed to remove member from group');
  }
});

// Add this to your socket.io server code

socket.on('membersAdded', async ({ groupId, addedUserIds, addedBy }) => {
  try {
    // ✅ Zgjidhja e saktë për addedBy
    let admin;
    // Kontrollo nëse është ObjectId i vërtetë (24 karaktere hex string)
    if (typeof addedBy === 'string' && addedBy.length === 24 && /^[0-9a-fA-F]{24}$/.test(addedBy)) {
      admin = await UserMongo.findById(addedBy);
    } else {
      // Përndryshe, përdore si mysqlId
      admin = await UserMongo.findOne({ mysqlId: parseInt(addedBy, 10) });
    }

    if (!admin) {
      socket.emit('error', 'Admin user not found');
      return;
    }

    // ✅ Përgatis query të sigurt për addedUserIds
    const userOrQueries = addedUserIds.map(id => {
      // Kontrollo nëse është ObjectId i vërtetë
      if (typeof id === 'string' && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
        return { _id: new mongoose.Types.ObjectId(id) };
      } else {
        return { mysqlId: parseInt(id, 10) };
      }
    });

    const addedUsers = await UserMongo.find({ $or: userOrQueries });

    if (addedUsers.length === 0) {
      socket.emit('error', 'No users found to add');
      return;
    }

    // ✅ Gjej grupin në mënyrë të sigurt
    let group;
    if (typeof groupId === 'string' && groupId.length === 24 && /^[0-9a-fA-F]{24}$/.test(groupId)) {
      group = await GroupMongo.findById(groupId);
    } else {
      group = await GroupMongo.findOne({ mysqlId: parseInt(groupId, 10) });
    }

    if (!group) {
      socket.emit('error', 'Group not found');
      return;
    }

    // ✅ Krijo system message
    const addedNames = addedUsers.map(u => `${u.name} ${u.lastName || ''}`).join(', ');

    const systemMessage = new MessageMongo({
      text: `${admin.name} ${admin.lastName || ''} added to the group: ${addedNames}`,
      systemMessage: true,
      groupId: group._id,
      createdAt: new Date()
    });

    await systemMessage.save();

    const populatedMessage = await MessageMongo.findById(systemMessage._id).exec();
    io.to(group._id.toString()).emit('newMessage', populatedMessage);
    io.to(group._id.toString()).emit('membersAdded', {
      groupId: group._id.toString(),
      addedUserIds: addedUserIds.map(id => id.toString())
    });

    console.log(`✅ System message sent for added users: ${addedNames}`);
    
  } catch (error) {
    console.error("❌ Error sending system message for added users:", error);
    socket.emit('error', 'Failed to add member system message');
  }
});





  // Handle disconnection
socket.on('disconnect', () => {
  console.log('User disconnected:', socket.id);

  if (!global.onlineUsers) return;

  const userId = Object.keys(global.onlineUsers).find((key) =>
    global.onlineUsers[key].some((entry) => entry.socketId === socket.id)
  );

  if (userId) {
    // Fshi socketId që u shkyç
    global.onlineUsers[userId] = global.onlineUsers[userId].filter(
      (entry) => entry.socketId !== socket.id
    );

    // Nëse s'ka më lidhje, fshi userin
    if (global.onlineUsers[userId].length === 0) {
      delete global.onlineUsers[userId];
    }

    // 🟢 Emit gjithmonë, jo vetëm nëse user u fshi
    io.emit(
      'onlineUsersList',
      Object.keys(global.onlineUsers).map((id) => ({ userId: id }))
    );
  }
}



);
setInterval(() => {
  if (global.onlineUsers) {
    const now = new Date();
    const inactiveThreshold = 10 * 60 * 1000; // 10 minuta
    
    Object.keys(global.onlineUsers).forEach(userId => {
      const user = global.onlineUsers[userId];
      if (now - user.lastActive > inactiveThreshold) {
        delete global.onlineUsers[userId];
        
        // Njofto të gjithë që përdoruesi është offline për shkak të joaktivitetit
        io.emit('userOnlineStatus', { 
          userId: userId, 
          isOnline: false,
          onlineUsers: Object.values(global.onlineUsers) 
        });
      }
    });
  }
}, 60000); 



});


}

module.exports = socketHandler;

