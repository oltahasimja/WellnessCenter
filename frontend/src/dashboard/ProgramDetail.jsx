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
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    memberId: null,
    memberName: ''
  });

  const [newLabelText, setNewLabelText] = useState('');

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [removedAttachments, setRemovedAttachments] = useState([]);

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
        
        const isProgramMember = userProgramsRes.data.some(userProgram => {
          if (!userProgram || !userProgram.userId) return false;
          
          const userMatches = 
            userProgram.userId._id === currentUser.id.toString() || 
            userProgram.userId.mysqlId === currentUser.id.toString();
          
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

        const programRes = await axios.get(`http://localhost:5000/api/program/${id}`);
        if (!programRes.data || programRes.data.message === "Program not found") {
          setError("Program not found");
          return;
        }
        setProgram(programRes.data);

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

        const [listsRes, cardsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/list'),
          axios.get('http://localhost:5000/api/card')
        ]);

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
                attachments: card.attachments || []
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
  
      setLists(prev => [...prev, newList]);
      setNewListName('');
      setShowListForm(false);
  
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
      const usersRes = await axios.get('http://localhost:5000/api/user');
      const userToAdd = usersRes.data.find(user => user.email === newMemberEmail);
      
      if (!userToAdd) {
        throw new Error('User with this email not found');
      }
  
      const programRes = await axios.get(`http://localhost:5000/api/program/${id}`);
      if (!programRes.data) {
        throw new Error('Program not found');
      }
  
      await axios.post('http://localhost:5000/api/userprograms', {
        userId: userToAdd.mysqlId,
        programId: programRes.data.mysqlId,
        invitedById: "1"
      });
      
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
      const userProgramsRes = await axios.get('http://localhost:5000/api/userprograms');
      
      const userProgramToDelete = userProgramsRes.data.find(up => 
        (up.userId._id === deleteModal.memberId || up.userId.mysqlId == deleteModal.memberId) && 
        (up.programId._id === id || up.programId.mysqlId == id)
      );
  
      if (!userProgramToDelete) {
        throw new Error('User-program association not found');
      }
  
      const idToDelete = userProgramToDelete.mysqlId || userProgramToDelete._id;
      
      await axios.delete(`http://localhost:5000/api/userprograms/${idToDelete}`);
      
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
    
    const sourceList = lists.find((list) => list.id === source.droppableId);
    const destList = lists.find((list) => list.id === destination.droppableId);
    const [movedCard] = sourceList.cards.splice(source.index, 1);
  
    try {
      const listRes = await axios.get(`http://localhost:5000/api/list/${destination.droppableId}`);
      
      await axios.put(`http://localhost:5000/api/card/${movedCard.id}`, {
        listId: listRes.data.mysqlId,
        mongoListId: listRes.data._id
      });
  
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
      sourceList.cards.splice(source.index, 0, movedCard);
      setLists([...lists]);
      alert('Failed to move card: ' + (error.response?.data?.message || error.message));
    }
  };

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
        id: response.data.id || response.data.mysqlId || response.data._id,
        mysqlId: response.data.id || response.data.mysqlId,
        mongoId: response.data._id,
        text: response.data.title,
        description: response.data.description,
        priority: response.data.priority,
        dueDate: response.data.dueDate,
        labels: response.data.labels || [],
        checklist: response.data.checklist || [],
        attachments: response.data.attachments || []
      };
      
      const updatedLists = lists.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            cards: [...list.cards, newCard],
            inputText: ''
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

  const handleCardClick = async (listId, card) => {
    try {
      setSelectedListId(listId);
      
      // Show loading state if needed
      // setIsLoading(true);
      
      // Fetch detailed card data including attachments
      const cardDetails = await fetchCardDetails(card.id);
      
      setSelectedCard(cardDetails);
      setIsCardModalOpen(true);
      
      // Initialize state for existing attachments
      if (cardDetails.attachments && cardDetails.attachments.length > 0) {
        // No need to set selectedFiles for existing attachments
        // They will be shown directly from selectedCard.attachments
      }
      
      // Reset other modal-related state
      setNewCardText('');
      setNewChecklistItem('');
      setRemovedAttachments([]);
      setSelectedFiles([]);
      
      // setIsLoading(false);
    } catch (error) {
      console.error('Error loading card details:', error);
      alert('Failed to load card details');
      // setIsLoading(false);
    }
  };

  const handleEditCard = async (cardId, updates) => {
    try {
      // Prepare the complete update data
      const updateData = {
        title: updates.title,
        description: updates.description,
        dueDate: updates.dueDate,
        priority: updates.priority,
        labels: updates.labels || [],
        checklist: updates.checklist || [],
        // Include attachments data
        attachments: updates.attachments || [],
        removedAttachments: updates.removedAttachments || []
      };
  
      // Make the API call
      const response = await axios.put(`http://localhost:5000/api/card/${cardId}`, updateData);
      
      return response.data;
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
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

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      file: file, // Keep reference to the actual file object
      isNew: true  // Flag to indicate this is a new file
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const uploadFiles = async () => {
    try {
      // Filter out removed attachments from existing ones
      const keptAttachments = selectedCard.attachments 
        ? selectedCard.attachments
            .filter(att => !removedAttachments.includes(att._id))
            .map(att => ({
              _id: att._id,
              name: att.name,
              type: att.type,
              size: att.size,
              data: att.data
            }))
        : [];
      
      // Process new files
      const newAttachments = await Promise.all(
        selectedFiles
          .filter(file => file.isNew)
          .map(async file => {
            if (file.size > 5 * 1024 * 1024) {
              throw new Error(`File ${file.name} is too large (max 5MB)`);
            }
            
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
              reader.onload = () => resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                data: reader.result.split(',')[1] // Get base64 data without prefix
              });
              reader.onerror = () => reject(new Error(`Failed to read file ${file.name}`));
              reader.readAsDataURL(file.file);
            });
          })
      );
      
      // Combine kept attachments with new ones
      return [...keptAttachments, ...newAttachments.filter(Boolean)];
    } catch (error) {
      console.error("Error processing files:", error);
      throw error;
    }
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setSelectedCard({
        ...selectedCard,
        checklist: [...(selectedCard.checklist || []), { text: newChecklistItem, completed: false }]
      });
      setNewChecklistItem('');
    }
  };
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fetchCardDetails = async (cardId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/card/${cardId}`);
      
      // Process attachments to make them easier to handle in the UI
      const processedCard = {
        ...response.data,
        id: response.data.mysqlId || response.data._id,
        text: response.data.title,
        labels: response.data.labels || [],
        checklist: response.data.checklist || [],
        attachments: response.data.attachments || []
      };
      
      return processedCard;
    } catch (error) {
      console.error('Error fetching card details:', error);
      throw error;
    }
  };

  // const removeFile = (index) => {
  //   const file = selectedFiles[index];
    
  //   if (file.isExisting && file._id) {
  //     setRemovedAttachments(prev => [...prev, file._id]);
  //   }
    
  //   setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    
  //   if (selectedCard.attachments && selectedCard.attachments.length > 0) {
  //     setSelectedCard(prev => ({
  //       ...prev,
  //       attachments: prev.attachments.filter(att => {
  //         if (file._id && att._id) {
  //           return att._id.toString() !== file._id.toString();
  //         }
  //         return att.name !== file.name;
  //       })
  //     }));
  //   }
  // };

  const toggleChecklistItem = (index) => {
    const updatedChecklist = [...selectedCard.checklist];
    updatedChecklist[index].completed = !updatedChecklist[index].completed;
    setSelectedCard({
      ...selectedCard,
      checklist: updatedChecklist
    });
  };

  const removeChecklistItem = (index) => {
    setSelectedCard({
      ...selectedCard,
      checklist: selectedCard.checklist.filter((_, i) => i !== index)
    });
  };

  const addLabel = (label) => {
    if (!selectedCard.labels.includes(label)) {
      setSelectedCard({
        ...selectedCard,
        labels: [...selectedCard.labels, label]
      });
    }
  };

  const removeLabel = (labelToRemove) => {
    setSelectedCard({
      ...selectedCard,
      labels: selectedCard.labels.filter(label => label !== labelToRemove)
    });
  };

  if (loading) return <div className="text-center p-8">Loading program details...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!isMember) return <div className="text-center p-8 text-red-500">Access Denied</div>;

  return (
    <div className="container mx-auto p-6">


{/* Add this modal component right before the closing tag of your component return statement */}
{isCardModalOpen && selectedCard && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Card Details</h2>
        <button
          onClick={() => setIsCardModalOpen(false)}
          className="text-gray-600 hover:text-gray-800"
        >
          <span className="text-2xl">×</span>
        </button>
      </div>

      {/* Card Title */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Title</label>
        <input
          type="text"
          value={selectedCard.text}
          onChange={(e) => setSelectedCard({...selectedCard, text: e.target.value})}
          className="w-full border rounded-md p-2"
        />
      </div>

      {/* Card Description */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Description</label>
        <textarea
  value={selectedCard.description || ''}
  onChange={(e) => setSelectedCard({
    ...selectedCard, 
    description: e.target.value
  })}
  className="w-full border rounded-md p-2 min-h-[100px]"
  placeholder="Add a description..."
/>
      </div>

      {/* Due Date */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Due Date</label>
        <input
          type="date"
          value={selectedCard.dueDate ? new Date(selectedCard.dueDate).toISOString().split('T')[0] : ''}
          onChange={(e) => setSelectedCard({...selectedCard, dueDate: e.target.value})}
          className="w-full border rounded-md p-2"
        />
      </div>

      {/* Priority */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Priority</label>
        <select
          value={selectedCard.priority || 'medium'}
          onChange={(e) => setSelectedCard({...selectedCard, priority: e.target.value})}
          className="w-full border rounded-md p-2"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Labels */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Labels</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedCard.labels && selectedCard.labels.map((label, index) => (
            <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
              <span>{label}</span>
              <button 
                onClick={() => removeLabel(label)}
                className="ml-1 text-blue-800 hover:text-blue-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">

<input
  type="text"
  placeholder="Add new label"
  value={newLabelText}
  onChange={(e) => setNewLabelText(e.target.value)}
  className="flex-grow border rounded-md p-2"
/>
<button
  onClick={() => {
    if (newLabelText.trim()) {
      addLabel(newLabelText);
      setNewLabelText('');
    }
  }}
  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md"
>
  Add
</button>
        
        </div>
      </div>

      {/* Checklist */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Checklist</label>
        {selectedCard.checklist && selectedCard.checklist.length > 0 ? (
          <div className="mb-3">
            {selectedCard.checklist.map((item, index) => (
              <div key={index} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem(index)}
                  className="mr-2"
                />
                <span className={item.completed ? 'line-through text-gray-500' : ''}>
                  {item.text}
                </span>
                <button
                  onClick={() => removeChecklistItem(index)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-2">No checklist items yet</p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add checklist item"
            value={newChecklistItem}
            onChange={(e) => setNewChecklistItem(e.target.value)}
            className="flex-grow border rounded-md p-2"
          />
          <button
            onClick={addChecklistItem}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md"
          >
            Add
          </button>
        </div>
      </div>
    {/* Attachments */}
<div className="mb-6">
  <label className="block text-gray-700 font-medium mb-2">Attachments</label>
  
  {/* Display existing attachments from the card */}
  {selectedCard.attachments && selectedCard.attachments.length > 0 && (
    <div className="space-y-2 mb-3">
      <h4 className="font-medium text-sm text-gray-600">Current Files:</h4>
      {selectedCard.attachments.map((attachment, index) => (
        <div key={index} className="p-2 border rounded-md">
          <div className="flex items-center">
            <span className="flex-grow truncate">{attachment.name}</span>
            <button
              onClick={() => {
                setRemovedAttachments(prev => [...prev, attachment._id]);
                setSelectedCard({
                  ...selectedCard,
                  attachments: selectedCard.attachments.filter((_, i) => i !== index)
                });
              }}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
          
          {/* Display image if attachment is an image */}
          {attachment.type.startsWith('image/') && (
            <div className="mt-2">
              <img 
                src={`data:${attachment.type};base64,${attachment.data}`} 
                alt={attachment.name}
                className="max-w-full h-auto max-h-40 rounded-md"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )}
  
  {/* Display new files selected for upload */}
  {selectedFiles.length > 0 && (
    <div className="space-y-2 mb-3">
      <h4 className="font-medium text-sm text-gray-600">New Files:</h4>
      {selectedFiles.map((file, index) => (
        <div key={index} className="flex items-center p-2 border rounded-md">
          <span className="flex-grow truncate">{file.name}</span>
          <button
            onClick={() => removeFile(index)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )}
  
  {/* File upload input */}
  <div className="mt-2">
    <input
      type="file"
      onChange={handleFileChange}
      className="block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-md file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-50 file:text-blue-700
        hover:file:bg-blue-100"
      multiple
    />
  </div>
</div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => {
            handleDeleteCard(selectedListId, selectedCard.id);
            setIsCardModalOpen(false);
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
        >
          Delete Card
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setIsCardModalOpen(false)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Cancel
          </button>
          <button
  onClick={async () => {
    try {
      // Process attachments
      const processedAttachments = await uploadFiles();
      
      // Prepare complete update data
      const updates = {
        title: selectedCard.text,
        description: selectedCard.description,
        dueDate: selectedCard.dueDate,
        priority: selectedCard.priority,
        labels: selectedCard.labels || [],
        checklist: selectedCard.checklist || [],
        attachments: processedAttachments,
        removedAttachments: removedAttachments
      };
      
      // Call API to update card
      await handleEditCard(selectedCard.id, updates);
      
      // Close modal and reset state
      setIsCardModalOpen(false);
      setSelectedFiles([]);
      setRemovedAttachments([]);
      
      // Refresh the card data
      const refreshedCard = await fetchCardDetails(selectedCard.id);
      setSelectedCard(refreshedCard);
      
      // Update lists state
      setLists(prevLists => 
        prevLists.map(list => {
          if (list.id === selectedListId) {
            return {
              ...list,
              cards: list.cards.map(card => 
                card.id === selectedCard.id 
                  ? { 
                      ...card, 
                      text: selectedCard.text,
                      description: selectedCard.description,
                      dueDate: selectedCard.dueDate,
                      priority: selectedCard.priority,
                      labels: selectedCard.labels || [],
                      checklist: selectedCard.checklist || [],
                      attachments: refreshedCard.attachments || []
                    } 
                  : card
              )
            };
          }
          return list;
        })
      );
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Failed to save card: ' + error.message);
    }
  }}
  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
>
  Save
</button>
        </div>
      </div>
    </div>
  </div>
)}

      
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