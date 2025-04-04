import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteConfirmation from "../components/DeleteConfirmation";

const TrainingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState(null);
  const [members, setMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    duration: '',
    max_participants: ''
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    memberId: null,
    memberName: ''
  });

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
    const fetchTrainingData = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        setError(null);
        
        // Check if user is a member of this training
        const trainingApplicationRes = await axios.get('http://localhost:5000/api/trainingapplication');
        
        // Debug: Log the current user and training applications
        console.log("Current User:", currentUser);
        console.log("Training Applications:", trainingApplicationRes.data);
        
        const isTrainingMember = trainingApplicationRes.data.some(ta => {
          // Compare training ID (handle both string and number comparisons)
          const trainingMatch = ta.trainingId._id === id || 
                               ta.trainingId.mysqlId === id || 
                               ta.trainingId.mysqlId === String(id);
          
          // Compare user ID (handle both string and number comparisons)
          const userMatch = ta.userId._id === currentUser._id || 
                           String(ta.userId.mysqlId) === String(currentUser.id) ||
                           ta.userId.mysqlId === currentUser.id;
          
          // Optional: Check if status is approved if needed
          // const statusMatch = ta.status === 'approved';
          
          return trainingMatch && userMatch; // && statusMatch if using status check
        });
        
        console.log("Is member:", isTrainingMember); // Debug log
    
        if (!isTrainingMember) {
          setError("You don't have access to this training");
          setLoading(false);
          return;
        }
    
        setIsMember(true);

        // Fetch training details
        const trainingRes = await axios.get(`http://localhost:5000/api/training/${id}`);
        if (!trainingRes.data) {
          setError("Training not found");
          return;
        }
        setTraining(trainingRes.data);
        setFormData({
          title: trainingRes.data.title,
          category: trainingRes.data.category,
          description: trainingRes.data.description,
          duration: trainingRes.data.duration,
          max_participants: trainingRes.data.max_participants
        });

        // Fetch members
        const trainingMembers = trainingApplicationRes.data.filter(ta => 
          ta.trainingId._id === id || ta.trainingId.mysqlId === id
        );
        
        const membersList = trainingMembers.map(item => ({
          _id: item.userId._id,
          mysqlId: item.userId.mysqlId,
          name: item.userId.name,
          email: item.userId.email,
          role: item.userId.roleId
        }));
        
        setMembers(membersList);

      } catch (error) {
        console.error("Error fetching training data:", error);
        setError(error.response?.data?.message || "Failed to load training");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchTrainingData();
    }
  }, [id, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/training/${id}`, formData);
      const response = await axios.get(`http://localhost:5000/api/training/${id}`);
      setTraining(response.data);
      alert('Training updated successfully!');
    } catch (error) {
      console.error('Error updating training:', error);
      alert('Failed to update training: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_participants' ? Number(value) : value
    }));
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
  
      // Add to training application
      await axios.post('http://localhost:5000/api/trainingapplication', {
        userId: userToAdd.mysqlId || userToAdd._id,
        trainingId: training.mysqlId || training._id,
        invitedById: currentUser.id
      });
      
      // Refresh members list
      const trainingApplicationRes = await axios.get('http://localhost:5000/api/trainingapplication');
      const trainingMembers = trainingApplicationRes.data.filter(ta => 
        ta.trainingId._id === id || ta.trainingId.mysqlId === id
      );
      
      const membersList = trainingMembers.map(item => ({
        _id: item.userId._id,
        mysqlId: item.userId.mysqlId,
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
      memberName: memberName || 'this member'
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.memberId) return;
  
    try {
      const trainingApplicationRes = await axios.get('http://localhost:5000/api/trainingapplication');
      
      // Find the specific training application to delete
      const taToDelete = trainingApplicationRes.data.find(ta => 
        (ta.userId._id === deleteModal.memberId || ta.userId.mysqlId === deleteModal.memberId) && 
        (ta.trainingId._id === id || ta.trainingId.mysqlId === id)
      );
  
      if (!taToDelete) {
        throw new Error('Training application not found');
      }
  
      const idToDelete = taToDelete.mysqlId || taToDelete._id;
      await axios.delete(`http://localhost:5000/api/trainingapplication/${idToDelete}`);
      
      // Refresh members list
      const updatedTA = await axios.get('http://localhost:5000/api/trainingapplication');
      const updatedMembers = updatedTA.data
        .filter(ta => ta.trainingId._id === id || ta.trainingId.mysqlId === id)
        .map(ta => ({
          _id: ta.userId._id,
          mysqlId: ta.userId.mysqlId,
          name: ta.userId.name,
          email: ta.userId.email,
          role: ta.userId.roleId
        }));
      
      setMembers(updatedMembers);
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member: ' + (error.response?.data?.message || error.message));
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

  if (loading) return <div className="text-center p-8">Loading training details...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!isMember) return <div className="text-center p-8 text-red-500">Access Denied</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{training.title}</h1>
            <p className="text-gray-600 mt-2">
              Category: {training.category} | Duration: {training.duration} | 
              Max Participants: {training.max_participants}
            </p>
            <p className="text-gray-600 mt-1">
              Created by: {training.createdById?.name || 'Unknown'} | 
              Created on: {new Date(training.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button 
            onClick={() => navigate('/trainings')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Back to Trainings
          </button>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700 mb-6 p-4 bg-gray-50 rounded">{training.description}</p>
          
          <h2 className="text-xl font-semibold mb-4">Training Members</h2>
          
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

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Edit Training</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="border p-2 rounded-md w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="border p-2 rounded-md w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="border p-2 rounded-md w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Max Participants</label>
                <input
                  type="number"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleChange}
                  className="border p-2 rounded-md w-full"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="border p-2 rounded-md w-full h-32"
                required
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Update Training
              </button>
            </div>
          </form>
        </div>
      </div>

      <DeleteConfirmation
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.memberName}
      />
    </div>
  );
};

export default TrainingDetail;