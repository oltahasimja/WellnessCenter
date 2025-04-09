import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteConfirmation from "../components/DeleteConfirmation";

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [lists, setLists] = useState([]);
  const [newCardText, setNewCardText] = useState("");
  const [members, setMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showListForm, setShowListForm] = useState(false);
  const [editingListId, setEditingListId] = useState(null);
  const [editedListName, setEditedListName] = useState('');
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
const [selectedCard, setSelectedCard] = useState(null);
const [selectedListId, setSelectedListId] = useState(null);
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get("http://localhost:5000/user", { withCredentials: true });
        if (!response.data.user) {
          navigate("/login");
        } else {
          setCurrentUser(response.data.user);
        }
      } catch (error) {
        navigate("/login");
      }
    };
    checkLoginStatus();
  }, [navigate]);

  useEffect(() => {
    const fetchProgramData = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        setError(null);
        
        const userProgramsRes = await axios.get('http://localhost:5000/api/userprograms');
        
        // Check if user is a member of the program
        const isProgramMember = userProgramsRes.data.some(userProgram => {
          if (!userProgram || !userProgram.userId) return false;
          
          // Check user match
          const userMatches = 
            userProgram.userId._id === currentUser.id.toString() || 
            userProgram.userId.mysqlId === currentUser.id.toString();
          
          // Check program match (only if programId exists)
          const programMatches = userProgram.programId && (
            userProgram.programId._id === id || 
            userProgram.programId.mysqlId === id
          );
          
          return userMatches && programMatches;
        });

        if (!isProgramMember) {
          setError("You don't have access to this program");
          setLoading(false);
          return;
        }

        setIsMember(true);

        // Fetch the program details
        const programRes = await axios.get(`http://localhost:5000/api/program/${id}`);
        if (!programRes.data || programRes.data.message === "Program not found") {
          setError("Program not found");
          return;
        }
        setProgram(programRes.data);

        // Filter and map members with proper null checks
        const membersList = userProgramsRes.data
          .filter(userProgram => 
            userProgram.programId && (
              userProgram.programId._id === id || 
              userProgram.programId.mysqlId === id
            )
          )
          .map(userProgram => ({
            _id: userProgram.userId._id,
            mysqlId: userProgram.userId.mysqlId,
            name: userProgram.userId.name,
            email: userProgram.userId.email,
            role: userProgram.userId.roleId
          }));
        
        setMembers(membersList);

        // Fetch lists and cards
        const [listsRes, cardsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/list'),
          axios.get('http://localhost:5000/api/card')
        ]);

        // Process lists and cards
        const boardLists = listsRes.data
          .filter(list => 
            list.programId && (
              list.programId._id === id || 
              list.programId.mysqlId === id
            )
          )
          .map(list => {
            const listCards = cardsRes.data
              .filter(card => 
                card.listId && (
                  card.listId._id === list._id || 
                  card.listId.mysqlId === list.mysqlId
                )
              )
              .map(card => ({
                id: card.mysqlId || card._id,
                text: card.title,
                description: card.description,
                priority: card.priority,
                dueDate: card.dueDate,
                labels: card.labels || [],
                checklist: card.checklist || [],
                attachments : card.attachments || []
              }));

            return {
              id: list.mysqlId || list._id,
              title: list.name,
              cards: listCards,
              inputText: ''
            };
          });

        setLists(boardLists);
        
      } catch (error) {
        console.error("Error fetching program data:", error);
        setError(error.response?.data?.message || "Failed to load program");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProgramData();
    }
  }, [id, currentUser]);

  const fetchLists = async () => {
    try {
      const [listsRes, cardsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/list'),
        axios.get('http://localhost:5000/api/card')
      ]);
  
      const boardLists = listsRes.data
        .filter(list => list.programId && (list.programId._id === id || list.programId.mysqlId === id))
        .map(list => {
          const listCards = cardsRes.data
            .filter(card => card.listId && (card.listId._id === list._id || card.listId.mysqlId === list.mysqlId))
            .map(card => ({
              id: card.mysqlId || card._id,
              text: card.title,
              description: card.description,
              priority: card.priority,
              dueDate: card.dueDate,
              labels: card.labels || [],
              checklist: card.checklist || []
            }));
  
          return {
            id: list.mysqlId || list._id,
            title: list.name,
            cards: listCards,
            inputText: ''
          };
        });
  
      setLists(boardLists);
    } catch (error) {
      console.error("Error fetching lists:", error);
    }
  };

  const handleAddList = async () => {
    if (!newListName.trim()) {
      alert('Please enter a list name');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/list', {
        name: newListName,
        programId: id,
        createdById: currentUser.id,
      });
  
      const newList = {
        id: response.data.mysqlId || response.data._id,
        title: response.data.name,
        cards: [],
      };
  
      // Option 1: Optimistic update (preferred)
      setLists(prev => [...prev, newList]);
      setNewListName('');
      setShowListForm(false);
  
      // Option 2: Refetch lists (if you need fresh data)
      await fetchLists();
    } catch (error) {
      console.error('Error creating list:', error);
      alert('Failed to create list: ' + (error.response?.data?.message || error.message));
    }
  };
  const handleDeleteList = async (listId) => {
    try {
      await axios.delete(`http://localhost:5000/api/list/${listId}`);
      setLists(lists.filter(list => list.id !== listId));
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Failed to delete list: ' + (error.response?.data?.message || error.message));
    }
  };
  // List editing functions
const startListEdit = (list) => {
  setEditingListId(list.id);
  setEditedListName(list.title);
};

const cancelListEdit = () => {
  setEditingListId(null);
  setEditedListName('');
};

const saveListEdit = async (listId) => {
  try {
    await axios.put(`http://localhost:5000/api/list/${listId}`, {
      name: editedListName
    });
    
    // Update local state
    setLists(lists.map(list => 
      list.id === listId ? { ...list, title: editedListName } : list
    ));
    
    setEditingListId(null);
    setEditedListName('');
  } catch (error) {
    console.error('Error updating list:', error);
    alert('Failed to update list: ' + (error.response?.data?.message || error.message));
  }
};

  const handleAddMember = async (e) => {
     e.preventDefault();
     
     if (!newMemberEmail) {
       alert('Please enter a user email');
       return;
     }
   
     try {
       // Find user by email
       const usersRes = await axios.get('http://localhost:5000/api/user');
       const userToAdd = usersRes.data.find(user => user.email === newMemberEmail);
       
       if (!userToAdd) {
         throw new Error('User with this email not found');
       }
   
       // Get current program
       const programRes = await axios.get(`http://localhost:5000/api/program/${id}`);
       if (!programRes.data) {
         throw new Error('Program not found');
       }
   
       // Use the plural endpoint and consistent ID field
       await axios.post('http://localhost:5000/api/userprograms', {
         userId: userToAdd.mysqlId, // or _id depending on your backend
         programId: programRes.data.mysqlId, // or _id
         invitedById: "1" // Replace with actual logged-in user's ID
       });
       
       // Refresh members list
       const userProgramsRes = await axios.get('http://localhost:5000/api/userprograms');
       const programMembers = userProgramsRes.data.filter(
         userProgram => userProgram.programId._id === id || userProgram.programId.mysqlId === id
       );
       
       const membersList = programMembers.map(item => ({
         _id: item.userId._id,
         name: item.userId.name,
         email: item.userId.email,
         role: item.userId.roleId
       }));
       
       setMembers(membersList);
       setNewMemberEmail('');
       alert('Member added successfully');
     } catch (error) {
       console.error('Error adding member:', error);
       alert('Failed to add member. ' + (error.response?.data?.message || error.message));
     }
   };
   const [deleteModal, setDeleteModal] = useState({
     isOpen: false,
     memberId: null,
     memberName: ''
   });
   const handleRemoveClick = (memberId, memberName) => {
     setDeleteModal({
       isOpen: true,
       memberId,
       memberName
     });
   };
   
   const handleDeleteConfirm = async () => {
     if (!deleteModal.memberId) return;
   
     try {
       // First get all user programs to find the correct association
       const userProgramsRes = await axios.get('http://localhost:5000/api/userprograms');
       
       // Find the specific user-program association to delete
       const userProgramToDelete = userProgramsRes.data.find(up => 
         (up.userId._id === deleteModal.memberId || up.userId.mysqlId == deleteModal.memberId) && 
         (up.programId._id === id || up.programId.mysqlId == id)
       );
   
       if (!userProgramToDelete) {
         throw new Error('User-program association not found');
       }
   
       // Use mysqlId if available, otherwise fall back to _id
       const idToDelete = userProgramToDelete.mysqlId || userProgramToDelete._id;
       
       // Delete using the same endpoint as UserPrograms
       await axios.delete(`http://localhost:5000/api/userprograms/${idToDelete}`);
       
       // Refresh the members list by refetching data
       const updatedUserPrograms = await axios.get('http://localhost:5000/api/userprograms');
       const updatedMembers = updatedUserPrograms.data
         .filter(up => up.programId._id === id || up.programId.mysqlId == id)
         .map(up => ({
           _id: up.userId._id,
           mysqlId: up.userId.mysqlId,
           name: up.userId.name,
           email: up.userId.email,
           role: up.userId.roleId
         }));
       
       setMembers(updatedMembers);
     } catch (error) {
       console.error('Error removing member:', error);
       // You might want to add toast notification here instead of alert
     } finally {
       setDeleteModal({
         isOpen: false,
         memberId: null,
         memberName: ''
       });
     }
   };
   
   const handleDeleteCancel = () => {
     setDeleteModal({
       isOpen: false,
       memberId: null,
       memberName: ''
     });
   };

   const handleDragEnd = async (result) => {
    if (!result.destination) return;
  
    const { source, destination } = result;
    
    // Find the actual lists and card
    const sourceList = lists.find((list) => list.id === source.droppableId);
    const destList = lists.find((list) => list.id === destination.droppableId);
    const [movedCard] = sourceList.cards.splice(source.index, 1);
  
    try {
      // Get the destination list's full data to access both MongoDB and MySQL IDs
      const listRes = await axios.get(`http://localhost:5000/api/list/${destination.droppableId}`);
      
      // Update the card with both ID types
      await axios.put(`http://localhost:5000/api/card/${movedCard.id}`, {
        listId: listRes.data.mysqlId, // For MySQL
        mongoListId: listRes.data._id // For MongoDB
      });
  
      // Update local state
      if (source.droppableId === destination.droppableId) {
        sourceList.cards.splice(destination.index, 0, movedCard);
        setLists(
          lists.map((list) =>
            list.id === source.droppableId ? { ...list, cards: sourceList.cards } : list
          )
        );
      } else {
        const destCards = [...destList.cards];
        destCards.splice(destination.index, 0, movedCard);
        setLists(
          lists.map((list) => {
            if (list.id === source.droppableId) return { ...list, cards: sourceList.cards };
            if (list.id === destination.droppableId) return { ...list, cards: destCards };
            return list;
          })
        );
      }
    } catch (error) {
      console.error('Error moving card:', error);
      // Revert the change in UI if API fails
      sourceList.cards.splice(source.index, 0, movedCard);
      setLists([...lists]);
      alert('Failed to move card: ' + (error.response?.data?.message || error.message));
    }
  };

  // Add a new card to the "To Do" list
  const addCard = async (listId) => {
    const list = lists.find(l => l.id === listId);
    const cardText = list.inputText;
    
    if (!cardText || !cardText.trim()) return;
    
    try {
      const response = await axios.post('http://localhost:5000/api/card', {
        title: cardText,
        listId: listId,
        createdById: currentUser.id
      });
  
      const newCard = {
        id: response.data.mysqlId || response.data._id,
        text: response.data.title,
        description: response.data.description,
        priority: response.data.priority,
        dueDate: response.data.dueDate,
        labels: response.data.labels || [],
        checklist: response.data.checklist || []
      };
  
      const updatedLists = lists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            cards: [...list.cards, newCard],
            inputText: '' // Clear the input after adding
          };
        }
        return list;
      });
      
      setLists(updatedLists);
    } catch (error) {
      console.error('Error creating card:', error);
      alert('Failed to create card: ' + (error.response?.data?.message || error.message));
    }
  };
  const handleCardClick = (listId, card) => {
    setSelectedCard(card);
    setSelectedListId(listId);
    setIsCardModalOpen(true);
  };

  const handleEditCard = async (cardId, updates) => {
    try {
      await axios.put(`http://localhost:5000/api/card/${cardId}`, updates);
      
      // Update local state
      setLists(lists.map(list => ({
        ...list,
        cards: list.cards.map(card => 
          card.id === cardId ? { ...card, ...updates } : card
        )
      })));
    } catch (error) {
      console.error('Error updating card:', error);
      alert('Failed to update card: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const handleDeleteCard = async (listId, cardId) => {
    try {
      await axios.delete(`http://localhost:5000/api/card/${cardId}`);
      
      // Update local state
      setLists(lists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            cards: list.cards.filter(card => card.id !== cardId)
          };
        }
        return list;
      }));
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Failed to delete card: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="text-center p-8">Loading program details...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!isMember) return <div className="text-center p-8 text-red-500">Access Denied</div>;
return(
<div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{program.title}</h1>
            <p className="text-gray-600 mt-2">
              Created by: {program.createdById?.name || 'Unknown'} | 
              Created on: {new Date(program.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button 
            onClick={() => navigate('/programs')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Back to Programs
          </button>
          </div>
        
         <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700 mb-6 p-4 bg-gray-50 rounded">{program.description}</p>
          
          <h2 className="text-xl font-semibold mb-4">Program Members</h2>
          
          <form onSubmit={handleAddMember} className="mb-6 flex gap-2">
            <input
              type="email"
              placeholder="Enter user email to invite"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="flex-grow border p-2 rounded-md"
              required
            />
            <button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Add Member
            </button>
          </form>
          
          {members.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map(member => (
                    <tr key={member._id || member.mysqlId}>
                      <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.role || 'Member'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <button 
          onClick={() => handleRemoveClick(member._id || member.mysqlId, member.name)}
          className="text-red-500 hover:text-red-700"
          >
            Remove
           </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No members yet</p>
          )}
         </div>
         </div>
         <DeleteConfirmation
  isOpen={deleteModal.isOpen}
  onClose={handleDeleteCancel}
  onConfirm={handleDeleteConfirm}
  itemName={deleteModal.memberName}
/>
          
         {/* Trello-style Board */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Board</h2>
          <button 
            onClick={() => setShowListForm(!showListForm)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
          >
            {showListForm ? 'Cancel' : 'Add List'}
          </button>
        </div>

        {showListForm && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
            <input
              type="text"
              placeholder="Enter list name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full border p-2 rounded-md mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddList}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Add List
              </button>
              <button
                onClick={() => setShowListForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {lists.map((list) => (
              <Droppable key={list.id} droppableId={list.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100 rounded-lg shadow-md p-4 w-72 min-w-[18rem] flex-shrink-0 relative"
                  >
                    <div className="flex justify-between items-center mb-4">
  {editingListId === list.id ? (
    <div className="flex items-center flex-grow mr-2">
      <input
        type="text"
        value={editedListName}
        onChange={(e) => setEditedListName(e.target.value)}
        className="border p-1 rounded-md w-full"
      />
      <button 
        onClick={() => saveListEdit(list.id)}
        className="ml-2 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md text-sm"
      >
        Save
      </button>
      <button 
        onClick={cancelListEdit}
        className="ml-1 bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded-md text-sm"
      >
        Cancel
      </button>
    </div>
  ) : (
    <h2 
      className="text-lg font-semibold cursor-pointer hover:underline flex-grow"
      onClick={() => startListEdit(list)}
    >
      {list.title}
    </h2>
  )}
  <button 
    onClick={() => handleDeleteList(list.id)}
    className="text-red-500 hover:text-red-700 text-sm"
  >
    Delete
  </button>
</div>
                    
                    {list.cards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="bg-white p-3 rounded-md shadow-md mb-2 cursor-pointer"
                          onClick={() => handleCardClick(list.id, card)}
                    >
                      <div className="font-medium">{card.text}</div>
                      {card.description && (
                        <div className="text-sm text-gray-600 mt-1">{card.description}</div>
                      )}
                      {card.dueDate && (
                        <div className="text-xs text-gray-500 mt-1">
                          Due: {new Date(card.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {card.labels && card.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {card.labels.map((label, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}  {isCardModalOpen && selectedCard && (
                        <div 
                          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                          onClick={() => setIsCardModalOpen(false)}
                        >
                          <div 
                            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold">Card Details</h2>
                                <button 
                                  onClick={() => setIsCardModalOpen(false)}
                                  className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                  &times;
                                </button>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                  <input 
                                    type="text"
                                    value={selectedCard.text}
                                    onChange={(e) => setSelectedCard({...selectedCard, text: e.target.value})}
                                    className="w-full border p-2 rounded-md"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                  <textarea
                                    value={selectedCard.description || ''}
                                    onChange={(e) => setSelectedCard({...selectedCard, description: e.target.value})}
                                    className="w-full border p-2 rounded-md"
                                    rows="3"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                  <input 
                                    type="datetime-local"
                                    value={selectedCard.dueDate || ''}
                                    onChange={(e) => setSelectedCard({...selectedCard, dueDate: e.target.value})}
                                    className="w-full border p-2 rounded-md"
                                  />
                                </div>
                                
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                  <select
                                    value={selectedCard.priority || 'medium'}
                                    onChange={(e) => setSelectedCard({...selectedCard, priority: e.target.value})}
                                    className="w-full border p-2 rounded-md"
                                  >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                  </select>
                                </div>
                                
                                <div className="flex justify-end space-x-3 mt-6">
                                  <button
                                    onClick={() => setIsCardModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={async () => {
                                      try {
                                        await handleEditCard(selectedCard.id, {
                                          title: selectedCard.text,
                                          description: selectedCard.description,
                                          priority: selectedCard.priority,
                                          dueDate: selectedCard.dueDate
                                        });
                                        setIsCardModalOpen(false);
                                      } catch (error) {
                                        console.error('Error updating card:', error);
                                      }
                                    }}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                  >
                                    Save Changes
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    <div className="mt-4">
                      <input
                        type="text"
                        className="w-full border rounded-md p-2 mb-2"
                        placeholder="Add a new task..."
                        value={list.inputText || ''}
                        onChange={(e) => {
                          const updatedLists = lists.map(l => {
                            if (l.id === list.id) {
                              return { ...l, inputText: e.target.value };
                            }
                            return l;
                          });
                          setLists(updatedLists);
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && addCard(list.id)}
                      />
                     <button
  onClick={() => addCard(list.id)}
  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
>
  Add Card
</button>
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
     
      </div>
    </div>
  );
};

export default ProgramDetail;