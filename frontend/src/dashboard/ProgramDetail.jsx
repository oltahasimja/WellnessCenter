import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteConfirmation from "../components/DeleteConfirmation"; // Adjust the path as needed
const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [members, setMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgramData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const programRes = await axios.get(`http://localhost:5000/api/program/${id}`);
        console.log('Program data:', programRes.data); // Debug log
        
        if (!programRes.data || programRes.data.message === "Program not found") {
          setError("Program not found");
          return;
        }
        
        setProgram(programRes.data);
        
        // Fetch all user programs
        const userProgramsRes = await axios.get('http://localhost:5000/api/userprograms');
        
        // Filter only members for this specific program
        const programMembers = userProgramsRes.data.filter(
          userProgram => userProgram.programId._id === id || userProgram.programId.mysqlId === id
        );
        
        // Extract user data from the filtered members
        const membersList = programMembers.map(item => ({
          _id: item.userId._id,  // Changed *id to _id
          name: item.userId.name,
          email: item.userId.email,
          role: item.userId.roleId
        }));
        
        setMembers(membersList);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || "Failed to load program");
      } finally {
        setLoading(false);
      }
    };
  
    fetchProgramData();
  }, [id]);

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
  if (loading) return <div className="text-center p-8">Loading program details...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  if (!program) return <div className="text-center p-8">No program data available</div>;

  return (
    
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
          </div>
  );
};

export default ProgramDetail;