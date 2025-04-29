import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteConfirmation from "../components/DeleteConfirmation";
import { getProgramTheme } from './roleThemes';
import ThemeBackground from './ThemeBackground'
import ThemeImage from './ThemeImage';;
const ProgramDetail = () => {
  const [programTheme, setProgramTheme] = useState(null);

  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [lists, setLists] = useState([]);
  const [cardMembers, setCardMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState('');
  const [setNewCardText] = useState("");
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);
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
  const [deleteListModal, setDeleteListModal] = useState({
    isOpen: false,
    listId: null,
    listName: ''
  });

  const [newLabelText, setNewLabelText] = useState('');

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [removedAttachments, setRemovedAttachments] = useState([]);
  // const [setRoles] = useState([]);
  const [roles, setRoles] = useState([]);


  // Add this to your useEffect that fetches data
  const fetchRoles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/role');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };
  
  const findRole = (roleId) => {
    return roles.find(r => r._id === roleId || r.mysqlId === roleId.toString());
  };
  
  const getRoleName = (roleId) => {
    const role = findRole(roleId);
    return role ? role.name : 'Unknown Role';
  };


// In ProgramDetail.js
useEffect(() => {
  if (members.length > 0) {
    const theme = getProgramTheme(members, roles);
    setProgramTheme(theme);
  } else {
    setProgramTheme(getProgramTheme([], roles));
  }
}, [members, roles]);


  useEffect(() => {
    fetchRoles();
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

        // Update the members list creation to include ALL members (including current user)
        const membersList = userProgramsRes.data
          .filter(userProgram =>
            userProgram.programId && (
              userProgram.programId._id === id ||
              userProgram.programId.mysqlId.toString() === id.toString()
            )
          )
          .map(userProgram => ({
            _id: userProgram.userId._id,
            mysqlId: userProgram.userId.mysqlId,
            name: userProgram.userId.name,
            email: userProgram.userId.email,
            role: userProgram.userId.roleId
          }));

        // Include current user if they're a member
        const currentUserMember = membersList.find(m =>
          m.mysqlId.toString() === currentUser.id.toString() ||
          m._id === currentUser.id.toString()
        );

        if (!currentUserMember) {
          membersList.push({
            _id: currentUser.mongoId, // If available
            mysqlId: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role
          });
        }

        setMembers(membersList);

        const [listsRes, cardsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/list'),
          axios.get('http://localhost:5000/api/card')
        ]);
        const cardMembersRes = await axios.get('http://localhost:5000/api/cardmember');

        const boardLists = listsRes.data
          .filter(list => list.programId && (
            list.programId._id === id ||
            list.programId.mysqlId == id
          ))
          .map(list => {
            const listCards = cardsRes.data
              .filter(card => card.listId && (
                card.listId._id === list._id ||
                card.listId.mysqlId == list.mysqlId
              ))
              .map(card => {
                // Get members for this card
                const cardMembers = cardMembersRes.data
                  .filter(cm => {
                    const cmCardId = cm.cardId?.mysqlId || cm.cardId?._id?.toString();
                    const cardId = card.mysqlId || card._id?.toString();
                    return cmCardId === cardId;
                  })
                  .map(cm => {
                    const member = members.find(m =>
                      String(m.mysqlId) === String(cm.userId?.mysqlId) ||
                      String(m._id) === String(cm.userId?._id)
                    );
                    return member || null;
                  })
                  .filter(Boolean);

                return {
                  id: card.mysqlId || card._id,
                  text: card.title,
                  description: card.description,
                  priority: card.priority,
                  dueDate: card.dueDate,
                  labels: card.labels || [],
                  checklist: card.checklist || [],
                  attachments: card.attachments || [],
                  members: cardMembers
                };
              });

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

  useEffect(() => {
    if (selectedCard) {
      const currentCardMemberIds = cardMembers.map(m => m.userId.mysqlId);
      const available = members.filter(m =>
        !currentCardMemberIds.includes(m.mysqlId) &&
        m.mysqlId !== currentUser.id
      );
      setAvailableMembers(available);
    }
  }, [cardMembers, members, selectedCard, currentUser]);

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
      if (!currentUser?.id) {
        throw new Error('You must be logged in to delete lists');
      }
  
      await axios.delete(`http://localhost:5000/api/list/${listId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          userId: currentUser.id
        }
      });
      
      // Optimistically update UI
      setLists(prevLists => prevLists.filter(list => list.id !== listId));
      
      // Optional: Refresh data from server
      await fetchLists();
    } catch (error) {
      console.error('Error deleting list:', error);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to delete list';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
      
      // Rollback UI if needed
      await fetchLists();
    } finally {
      setDeleteListModal({
        isOpen: false,
        listId: null,
        listName: ''
      });
    }
  };

const handleDeleteListClick = (listId, listName) => {
  setDeleteListModal({
    isOpen: true,
    listId,
    listName
  });
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
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    const response = await axios.put(`http://localhost:5000/api/list/${listId}`, {
      name: editedListName,  // Use 'name' instead of 'title'
      updatedById: currentUser.id  // Include user ID for logging
    });

    // Update local state with the returned data from backend
    setLists(lists.map(list => 
      list.id === listId ? { 
        ...list, 
        title: response.data.name, // Use response data
        name: response.data.name   // Keep consistent naming
      } : list
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

      // Fetch detailed card data
      const cardDetails = await fetchCardDetails(card.id);
      setSelectedCard(cardDetails);

      // Fetch card members before opening the modal
      await fetchCardMembers(card.id);

      // Now open the modal
      setIsCardModalOpen(true);

      // Reset other modal-related state
      setNewCardText('');
      setNewChecklistItem('');
      setRemovedAttachments([]);
      setSelectedFiles([]);
      setSelectedMemberToAdd('');
    } catch (error) {
      console.error('Error loading card details:', error);
     // alert('Failed to load card details');
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
        attachments: response.data.attachments || [],
        members: response.data.members || [] // Add this line
      };

      return processedCard;
    } catch (error) {
      console.error('Error fetching card details:', error);
      throw error;
    }
  };

  const fetchCardMembers = async (cardId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/cardmember/by-card?cardId=${cardId}`);

      const membersData = response.data || [];

      // Process the members data
      const processedMembers = membersData.map(cm => {
        const member = members.find(m =>
          String(m.mysqlId) === String(cm.userId?.mysqlId) ||
          String(m._id) === String(cm.userId?._id)
        );
        return member ? { ...cm, userId: member } : cm;
      });

      setCardMembers(processedMembers.filter(Boolean));
      // console.log(processedMembers);

      // Update available members
      const currentMemberIds = processedMembers.map(m =>
        m.userId?.mysqlId || m.userId?._id
      ).filter(Boolean);

      setAvailableMembers(
        members.filter(m =>
          !currentMemberIds.includes(String(m.mysqlId)) &&
          !currentMemberIds.includes(String(m._id)) &&
          String(m.mysqlId) !== String(currentUser?.id)
        )
      );
    } catch (error) {
      console.error('Error fetching card members:', error);
      setCardMembers([]);
    }
  };


  const handleAddCardMember = async () => {
    if (!selectedMemberToAdd) return;

    try {
      // Find the member to add
      const memberToAdd = members.find(m =>
        String(m.mysqlId) === String(selectedMemberToAdd) ||
        String(m._id) === String(selectedMemberToAdd)
      );

      if (!memberToAdd) {
        throw new Error('Member not found');
      }

      // Make API call with proper ID
      await axios.post('http://localhost:5000/api/cardmember', {
        userId: memberToAdd.mysqlId || memberToAdd._id,
        cardId: selectedCard.id,
        invitedById: currentUser.id
      });

      // Refresh data
      await fetchCardMembers(selectedCard.id);
      setSelectedMemberToAdd('');
    } catch (error) {
      console.error('Error adding card member:', error);
      alert(error.response?.data?.message || 'Failed to add member');
    }
  };


  const handleRemoveCardMember = async (cardMemberId) => {
    // Add confirmation dialog from the new version
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      // Keep your existing delete API call
      await axios.delete(`http://localhost:5000/api/cardmember/${cardMemberId}`);

      // Keep your existing state updates
      const refreshedCard = await fetchCardDetails(selectedCard.id);
      setSelectedCard(refreshedCard);

      // Add direct state filtering from the new version
      setCardMembers(prev => prev.filter(m => m.mysqlId !== cardMemberId));

      // Keep your available members update
      setAvailableMembers(members.filter(m =>
        !refreshedCard.members?.includes(m.mysqlId) &&
        m.mysqlId !== currentUser.id
      ));
    } catch (error) {
      console.error('Error removing card member:', error);
      alert(error.response?.data?.message || 'Failed to remove member');
    }
  };
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
    <ThemeBackground theme={programTheme}>
      {/* Banner Section   */}
      
      <div className={`${programTheme?.bannerClass || 'bg-teal-600'} text-white py-8 px-4 sm:px-6 lg:px-8`}>
  <div className="max-w-7xl mx-auto">

    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div className="mb-6 md:mb-0">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{program.title}</h1>
        <div className="flex flex-wrap items-center text-white text-opacity-90">
          <span className="flex items-center mr-4">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Created by: {program.createdById?.name || 'Unknown'}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Created on: {new Date(program.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <button
        onClick={() => navigate('/programs')}
        className={`${programTheme?.buttonClass || 'bg-teal-600'} text-white hover:bg-opacity-90 px-4 py-2 rounded-md font-medium flex items-center`}
      >
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Programs
      </button>
    </div>
  </div>
</div>

      {/* Program Description */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div className={`relative rounded-xl shadow-md overflow-hidden mb-8 ${programTheme?.lightColor ? `border-${programTheme.primaryColor.split('-')[1]}-200` : 'border-gray-200'}`}>
    
    {/* Background Image - More Visible */}
    <div className="absolute inset-0">
      <ThemeImage 
        theme={programTheme} 
        className="w-full h-full object-cover"
      />
      {/* Reduced overlay opacity */}
      <div className="absolute inset-10 bg-white bg-opacity-0"></div>
    </div>
    
    {/* Content with Less Transparency */}
    <div className="relative z-10 p-6 bg-white bg-opacity-65 rounded-xl">
      <h2 className={`text-xl font-semibold ${programTheme?.textClass || 'text-teal-800'} mb-4 flex items-center`}>
        <svg className={`w-5 h-5 mr-2 ${programTheme?.textClass || 'text-teal-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
        Program Description
      </h2>
      <div className={`p-4 rounded-lg ${programTheme?.lightColor ? `bg-${programTheme.primaryColor.split('-')[1]}-50` : 'bg-teal-50'} bg-opacity-70`}>
        <p className="text-gray-700 whitespace-pre-line">
          {program.description || 'No description provided'}
        </p>
      </div>
    </div>
  </div>



        {/* Members Section */}
        {/* Members Section - Right Side Panel */}
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40"
  style={{ transform: isMembersExpanded ? 'translateX(0)' : 'translateX(100%)' }}>
  <div className="h-full flex flex-col">
            {/* Header */}
            <div className={`p-4 border-b border-gray-200 flex justify-between items-center ${programTheme?.lightColor ? `bg-${programTheme.primaryColor.split('-')[1]}-50` : ''}`}>
      <h2 className={`text-xl font-semibold ${programTheme?.textClass || 'text-teal-800'} flex items-center`}>
        <svg className={`w-5 h-5 mr-2 ${programTheme?.textClass || 'text-teal-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
        </svg>
        Program Members
      </h2>
      <button
        onClick={() => setIsMembersExpanded(false)}
        className="text-gray-500 hover:text-gray-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-4">
      <form onSubmit={handleAddMember} className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <input
            type="email"
            placeholder="Enter user email to invite"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${programTheme?.buttonClass || 'bg-teal-600 hover:bg-teal-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add
        </button>
      </form>

              {members.length > 0 ? (
                <div className="overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-teal-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {members.map(member => (
                        <tr key={member._id || member.mysqlId} className="hover:bg-teal-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-medium">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                    
<span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
  ${member.role === '1' || member.role === '680034bf14e38db2e7703fa6' ? 'bg-purple-100 text-purple-800' :
    member.role === '2' || member.role === '680034bf14e38db2e7703fa8' ? 'bg-blue-100 text-blue-800' :
      member.role === '3' || member.role === '680034bf14e38db2e7703faa' ? 'bg-yellow-100 text-yellow-800' :
        member.role === '4' || member.role === '680034bf14e38db2e7703fac' ? 'bg-green-100 text-green-800' :
          member.role === '5' || member.role === '680034bf14e38db2e7703fae' ? 'bg-gray-100 text-gray-800' :
            'bg-gray-100 text-gray-800'}`}>
  {getRoleName(member.role)} {programTheme?.icon || '👤'}
</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {!(member._id === currentUser?.id || member.mysqlId === currentUser?.id) && (
                              <button
                                onClick={() => handleRemoveClick(member._id || member.mysqlId, member.name)}
                                className="text-red-600 hover:text-red-900 transition-colors duration-150"
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-teal-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No members yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding members to this program.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Members Toggle Button - Fixed position */}
        <button
  onClick={() => setIsMembersExpanded(!isMembersExpanded)}
  className={`fixed right-4 top-24 ${programTheme?.buttonClass || 'bg-teal-600'} text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-colors duration-200 z-30`}
>
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
  </svg>
</button>

        {/* Board Section */}
        <div className="mb-8">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
    <h2 className={`text-2xl font-bold ${programTheme?.textClass || 'text-teal-800'} mb-4 sm:mb-0 flex items-center`}>
      <svg className={`w-6 h-6 mr-2 ${programTheme?.textClass || 'text-teal-600'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
      </svg>
      Program Board
    </h2>
    <button
      onClick={() => setShowListForm(!showListForm)}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${programTheme?.buttonClass || 'bg-teal-600 hover:bg-teal-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
    >
      <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
      </svg>
      {showListForm ? 'Cancel' : 'Add List'}
    </button>
  </div>

  {showListForm && (
    <div className={`mb-6 p-4 rounded-lg shadow-md ${programTheme?.lightColor ? `bg-${programTheme.primaryColor.split('-')[1]}-50` : 'bg-white'}`}>
      <input
        type="text"
        placeholder="Enter list name"
        value={newListName}
        onChange={(e) => setNewListName(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
      />
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleAddList}
          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white ${programTheme?.buttonClass || 'bg-teal-600 hover:bg-teal-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
        >
          Add List
        </button>
        <button
          onClick={() => setShowListForm(false)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
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
            className={`relative rounded-xl shadow-md overflow-hidden w-72 min-w-[18rem] flex-shrink-0`}
          >
            {/* Background Image - Same as program description */}
            <div className="absolute inset-0">
              <ThemeImage 
                theme={programTheme} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-white bg-opacity-20"></div>
            </div>
            
            {/* List Content */}
            <div className="relative z-10 h-full flex flex-col bg-white bg-opacity-70 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                {editingListId === list.id ? (
                  <div className="flex items-center flex-grow mr-2">
                    <input
                      type="text"
                      value={editedListName}
                      onChange={(e) => setEditedListName(e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 bg-white bg-opacity-90"
                    />
                    <button
                      onClick={() => saveListEdit(list.id)}
                      className={`ml-2 ${programTheme?.buttonClass || 'bg-teal-600 hover:bg-teal-700'} text-white px-2 py-1 rounded-md text-sm`}
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelListEdit}
                      className="ml-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <h2
                    className={`text-lg font-semibold ${programTheme?.textClass || 'text-teal-800'} cursor-pointer hover:underline flex-grow`}
                    onClick={() => startListEdit(list)}
                  >
                    {list.title}
                  </h2>
                )}
                 <button
    onClick={() => handleDeleteListClick(list.id, list.title)}
    className="text-red-500 hover:text-red-700 text-sm"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  </button>
</div>

              {/* Cards */}
              <div className="flex-grow overflow-y-auto">
                {list.cards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-3 rounded-md shadow-sm border border-gray-200 mb-2 cursor-pointer hover:shadow-md transition-all duration-150 bg-white bg-opacity-90 ${programTheme?.lightColor ? `hover:border-${programTheme.primaryColor.split('-')[1]}-300` : 'hover:border-teal-300'}`}
                        onClick={() => handleCardClick(list.id, card)}
                      >
                        <div className="font-medium text-gray-800">{card.text}</div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>

              {/* Add Card Section */}
              <div className="mt-4">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 bg-white bg-opacity-90"
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
                  className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${programTheme?.buttonClass || 'bg-teal-600 hover:bg-teal-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Card
                </button>
              </div>
            </div>
          </div>
        )}
      </Droppable>
    ))}
  </div>
</DragDropContext>
        </div>
      </div>

      {/* Card Modal */}
      {isCardModalOpen && selectedCard && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className={`bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto ${programTheme?.lightColor ? `border-t-4 border-${programTheme.primaryColor.split('-')[1]}-500` : ''}`}>
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
          onChange={(e) => setSelectedCard({ ...selectedCard, text: e.target.value })}
          className={`w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-offset-2 ${programTheme?.primaryColor ? `focus:ring-${programTheme.primaryColor.split('-')[1]}-500` : 'focus:ring-teal-500'}`}
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
                className="w-full border border-gray-300 rounded-md p-2 min-h-[100px] focus:ring-teal-500 focus:border-teal-500"
                placeholder="Add a description..."
              />
            </div>

            {/* Card Members Section */}
            <div className="mb-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-3">Card Members</h3>

                {cardMembers.length > 0 ? (
                  <div className="space-y-2">
                    {cardMembers.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                        <div>
                          <span className="font-medium">
                            {member.userId?.name || 'Unknown Member'}
                          </span>
                          <span className="text-sm text-gray-600 ml-2">
                            ({member.userId?.email || 'No email'})
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveCardMember(member.mysqlId)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No members assigned to this card</p>
                )}
              </div>

              {/* Add Member Section */}
              <div className="flex gap-2">
                <select
                  value={selectedMemberToAdd}
                  onChange={(e) => setSelectedMemberToAdd(e.target.value)}
                  className="flex-grow border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select member to add</option>
                  {availableMembers.map(member => (
                    <option
                      key={member.mysqlId || member._id}
                      value={member.mysqlId || member._id}
                    >
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddCardMember}
                  className={`${programTheme?.buttonClass || 'bg-teal-600 hover:bg-teal-700'} text-white px-4 py-2 rounded-md`}
                  disabled={!selectedMemberToAdd}
                >
                  Add Member
                </button>
              </div>
            </div>

            {/* Due Date */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Due Date</label>
              <input
                type="date"
                value={selectedCard.dueDate ? new Date(selectedCard.dueDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setSelectedCard({ ...selectedCard, dueDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Priority */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Priority</label>
              <select
                value={selectedCard.priority || 'medium'}
                onChange={(e) => setSelectedCard({ ...selectedCard, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
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
                  <div key={index} className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full flex items-center">
                    <span>{label}</span>
                    <button
                      onClick={() => removeLabel(label)}
                      className="ml-1 text-teal-800 hover:text-teal-600"
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
                  className="flex-grow border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  onClick={() => {
                    if (newLabelText.trim()) {
                      addLabel(newLabelText);
                      setNewLabelText('');
                    }
                  }}
                  className={`${programTheme?.buttonClass || 'bg-teal-600 hover:bg-teal-700'} text-white px-4 py-2 rounded-md`}
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
                        className={`${programTheme?.buttonClass || 'bg-teal-600 hover:bg-teal-700'} text-white px-4 py-2 rounded-md`}
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
                  className="flex-grow border border-gray-300 rounded-md p-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  onClick={addChecklistItem}
                  className={`${programTheme?.buttonClass || 'bg-teal-600 hover:bg-teal-700'} text-white px-4 py-2 rounded-md`}
                >
                  Add
                </button>
              </div>
            </div>

            {/* Attachments */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Attachments</label>

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

              <div className="mt-2">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-teal-50 file:text-teal-700
                    hover:file:bg-teal-100"
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
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
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
                      const processedAttachments = await uploadFiles();

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

                      await handleEditCard(selectedCard.id, updates);

                      setIsCardModalOpen(false);
                      setSelectedFiles([]);
                      setRemovedAttachments([]);

                      const refreshedCard = await fetchCardDetails(selectedCard.id);
                      setSelectedCard(refreshedCard);

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
                                    attachments: refreshedCard.attachments || [],
                                    members: refreshedCard.members || []
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
                  className={`${programTheme?.buttonClass || 'bg-teal-600 hover:bg-teal-700'} text-white px-4 py-2 rounded-md`}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <DeleteConfirmation
  isOpen={deleteListModal.isOpen}
  onClose={() => setDeleteListModal({
    isOpen: false,
    listId: null,
    listName: ''
  })}
  onConfirm={() => handleDeleteList(deleteListModal.listId)}
  itemName={deleteListModal.listName}
/>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.memberName}
      />
  </ThemeBackground>
  );
};

export default ProgramDetail;