import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteConfirmation from "../components/DeleteConfirmation";
import { generateCertificate } from './utils/certificateGenerator';

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
  const [isCreator, setIsCreator] = useState(false); // Shtojmë këtë për të kontrolluar nëse është krijuesi
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
        
        const trainingApplicationRes = await axios.get('http://localhost:5000/api/trainingapplication');
        
        // Filter out applications with null userId or trainingId
        const validApplications = trainingApplicationRes.data.filter(ta => 
          ta.userId !== null && 
          ta.trainingId !== null && 
          (ta.userId._id || ta.userId.mysqlId) && 
          (ta.trainingId._id || ta.trainingId.mysqlId)
        );
        
        const isTrainingMember = validApplications.some(ta => {
          // Additional null checks
          if (!ta.trainingId || !ta.userId) return false;
          
          const trainingMatch = ta.trainingId._id === id || 
                               ta.trainingId.mysqlId === id || 
                               ta.trainingId.mysqlId === String(id);
          const userMatch = ta.userId._id === currentUser._id || 
                           String(ta.userId.mysqlId) === String(currentUser.id) ||
                           ta.userId.mysqlId === currentUser.id;
          
          return trainingMatch && userMatch;
        });
        
        if (!isTrainingMember) {
          setError("You don't have access to this training");
          setLoading(false);
          return;
        }
    
        setIsMember(true);
    
        const trainingRes = await axios.get(`http://localhost:5000/api/training/${id}`);
        if (!trainingRes.data) {
          setError("Training not found");
          return;
        }
        setTraining(trainingRes.data);
    
        const fetchedTraining = trainingRes.data;
        const isCurrentUserCreator = fetchedTraining.createdById && (
          (fetchedTraining.createdById.mysqlId && String(fetchedTraining.createdById.mysqlId) === String(currentUser.id)) || 
          (fetchedTraining.createdById._id && String(fetchedTraining.createdById._id) === String(currentUser._id))
        );
    
        setIsCreator(isCurrentUserCreator);
        
        // Filter again for members list
        const trainingMembers = validApplications.filter(ta => 
          (ta.trainingId._id === id || ta.trainingId.mysqlId === id)
        );
        
        const membersList = trainingMembers.map(item => ({
          _id: item.userId._id,
          mysqlId: item.userId.mysqlId,
          name: item.userId.name,
          lastName: item.userId.lastName,
          email: item.userId.email,
          role: item.userId.roleId,
          status: item.status || 'në pritje'
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

  const handleCompleteTraining = async (memberId) => {
    try {
      // First find the member details
      const member = members.find(m => (m._id === memberId || m.mysqlId == memberId));
      if (!member) {
        throw new Error('Member not found');
      }
  
      const trainingApplicationRes = await axios.get('http://localhost:5000/api/trainingapplication');
      
      // Filter out applications with proper userId and trainingId
      const validApplications = trainingApplicationRes.data.filter(ta => 
        ta.userId !== null && 
        ta.trainingId !== null && 
        (ta.userId._id || ta.userId.mysqlId) && 
        (ta.trainingId._id || ta.trainingId.mysqlId)
      );
      
      const taToUpdate = validApplications.find(ta => 
        (ta.userId._id === memberId || ta.userId.mysqlId == memberId) && 
        (ta.trainingId._id === id || ta.trainingId.mysqlId == id)
      );
  
      if (!taToUpdate) {
        throw new Error('Training application not found');
      }
  
      const idToUpdate = taToUpdate.mysqlId || taToUpdate._id;
      
      // Prepare the update data
      const updateData = {
        status: 'miratuar'
      };
  
      if (taToUpdate.userId && (taToUpdate.userId._id || taToUpdate.userId.mysqlId)) {
        updateData.userId = taToUpdate.userId.mysqlId || taToUpdate.userId._id;
      }
  
      if (taToUpdate.trainingId && (taToUpdate.trainingId._id || taToUpdate.trainingId.mysqlId)) {
        updateData.trainingId = taToUpdate.trainingId.mysqlId || taToUpdate.trainingId._id;
      }
  
      await axios.put(`http://localhost:5000/api/trainingapplication/${idToUpdate}`, updateData);
  
      // Generate the certificate
      const certificate = generateCertificate(member, training);
      
      // Convert PDF to base64 for email attachment
      const pdfOutput = certificate.output('datauristring');
      const pdfBase64 = pdfOutput.split(',')[1];
      
      // Prepare email data
      const emailData = {
        to: member.email,
        subject: `Your Certificate for ${training.title}`,
        text: `Dear ${member.name} ${member.lastName},\n\nCongratulations on completing the ${training.title} training!\n\nPlease find your certificate attached.\n\nBest regards,\nWellness Center`,
        attachments: [{
          filename: `Certificate_${training.title}_${member.name}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf'
        }]
      };
  
      // Send email with certificate
      await axios.post('http://localhost:5000/api/send-email', emailData);
  
      // Refresh members list with proper filtering
      const updatedTA = await axios.get('http://localhost:5000/api/trainingapplication');
      const updatedMembers = updatedTA.data
        .filter(ta => 
          ta.userId !== null && 
          ta.trainingId !== null && 
          (ta.userId._id || ta.userId.mysqlId) && 
          (ta.trainingId._id || ta.trainingId.mysqlId) &&
          (ta.trainingId._id === id || ta.trainingId.mysqlId == id)
        )
        .map(ta => ({
          _id: ta.userId._id || null,
          mysqlId: ta.userId.mysqlId || null,
          name: ta.userId.name || 'Unknown',
          lastName: ta.userId.lastName || 'Unknown',
          email: ta.userId.email || 'No email',
          role: ta.userId.roleId || 'member',
          status: ta.status || 'në pritje'
        }));
      
      setMembers(updatedMembers);
      
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!newMemberEmail) {
      alert('Ju lutem shkruani emailin e përdoruesit');
      return;
    }
  
    try {
      // 1. First verify the training exists
      if (!training) {
        throw new Error('Trajnimi nuk u gjet');
      }
  
      // 2. Find user by email (case insensitive)
      const usersRes = await axios.get('http://localhost:5000/api/user');
      const userToAdd = usersRes.data.find(user => 
        user.email && user.email.toLowerCase() === newMemberEmail.toLowerCase()
      );
      
      if (!userToAdd) {
        throw new Error(`Përdoruesi me email ${newMemberEmail} nuk u gjet`);
      }
  
      // 3. Check if user is already a member
      const isAlreadyMember = members.some(member => 
        member.email && member.email.toLowerCase() === newMemberEmail.toLowerCase()
      );
      
      if (isAlreadyMember) {
        throw new Error('Ky përdorues është tashmë pjesë e këtij trajnimi');
      }
  
      // 4. Prepare the data for the API call
      const postData = {
        userId: userToAdd.mysqlId || userToAdd._id,
        trainingId: training.mysqlId || training._id,
        status: 'në pritje'
      };
  
      // Add invitedById only if currentUser exists
      if (currentUser) {
        postData.invitedById = currentUser.mysqlId || currentUser._id;
      }
  
      // 5. Make the API call to add the member
      await axios.post('http://localhost:5000/api/trainingapplication', postData);
  
      // 6. Refresh the members list
      const trainingApplicationRes = await axios.get('http://localhost:5000/api/trainingapplication');
      
      // Filter applications with proper userId and trainingId
      const trainingMembers = trainingApplicationRes.data.filter(ta => 
        ta.userId !== null && 
        ta.trainingId !== null && 
        (ta.userId._id || ta.userId.mysqlId) && 
        (ta.trainingId._id || ta.trainingId.mysqlId) &&
        (ta.trainingId._id === id || ta.trainingId.mysqlId == id)
      );
      
      const updatedMembers = trainingMembers.map(item => ({
        _id: item.userId._id || null,
        mysqlId: item.userId.mysqlId || null,
        name: item.userId.name || 'Unknown',
        lastName: item.userId.lastName || 'Unknown',
        email: item.userId.email || 'No email',
        role: item.userId.roleId || 'member',
        status: item.status || 'në pritje'
      }));
      
      setMembers(updatedMembers);
      setNewMemberEmail('');
      alert('Përdoruesi u shtua me sukses!');
    } catch (error) {
      console.error('Gabim gjatë shtimit të anëtarit:', error);
      alert('Gabim: ' + (error.response?.data?.message || error.message));
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
      
      // Filter out invalid applications first
      const validApplications = trainingApplicationRes.data.filter(ta => 
        ta.userId !== null && 
        ta.trainingId !== null && 
        (ta.userId._id || ta.userId.mysqlId) && 
        (ta.trainingId._id || ta.trainingId.mysqlId)
      );
      
      const taToDelete = validApplications.find(ta => 
        (ta.userId._id === deleteModal.memberId || ta.userId.mysqlId === deleteModal.memberId) && 
        (ta.trainingId._id === id || ta.trainingId.mysqlId === id)
      );
  
      if (!taToDelete) {
        throw new Error('Training application not found');
      }
  
      const idToDelete = taToDelete.mysqlId || taToDelete._id;
      await axios.delete(`http://localhost:5000/api/trainingapplication/${idToDelete}`);
      
      // Get updated list with proper filtering
      const updatedTA = await axios.get('http://localhost:5000/api/trainingapplication');
      const updatedMembers = updatedTA.data
        .filter(ta => 
          ta.userId !== null && 
          ta.trainingId !== null && 
          (ta.userId._id || ta.userId.mysqlId) && 
          (ta.trainingId._id || ta.trainingId.mysqlId) &&
          (ta.trainingId._id === id || ta.trainingId.mysqlId === id)
        )
        .map(ta => ({
          _id: ta.userId._id || null,
          mysqlId: ta.userId.mysqlId || null,
          name: ta.userId.name || 'Unknown',
          lastName: ta.userId.lastName || 'Unknown',
          email: ta.userId.email || 'No email',
          role: ta.userId.roleId || 'member',
          status: ta.status || 'në pritje'
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

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-teal-400">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-700">Loading training details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen bg-teal-400">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => navigate('/trainings')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Back to Trainings
        </button>
      </div>
    </div>
  );

  if (!isMember) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <div className="text-red-500 text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-4">You don't have permission to view this training.</p>
        <button 
          onClick={() => navigate('/trainings')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Back to Trainings
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-teal-400 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-10xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Training Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{training.title}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm md:text-base">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {training.category}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {training.duration}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Max: {training.max_participants}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/trainings')}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md flex items-center transition-all"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Trainings
              </button>
            </div>
          </div>

          {/* Training Content */}
          <div className="p-6">
            {/* Description Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2">Description</h2>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-gray-700">{training.description}</p>
              </div>
            </div>

            {/* Members Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2">Training Members</h2>
              
              {/* Add Member Form - vetëm për krijuesin */}
              {isCreator && (
                <form onSubmit={handleAddMember} className="mb-6 flex flex-col sm:flex-row gap-3">
                  <div className="flex-grow relative">
                    <input
                      type="email"
                      placeholder="Enter user email to invite"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="w-full border border-gray-300 p-2 pl-10 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Add Member
                  </button>
                </form>
              )}
              
              {/* Members Table */}
              {members.length > 0 ? (
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statusi Certifikimit</th>
                                        {isCreator && (

                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        )}
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {members.map(member => (
                          <tr key={member._id || member.mysqlId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{member.name} {member.lastName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${member.status === 'miratuar' ? 'bg-green-100 text-green-800' : 
                                  'bg-yellow-100 text-yellow-800'}`}>
                                {member.status || 'në pritje'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap space-x-2">
                              {/* Butoni Complete - vetëm për krijuesin */}
                              {isCreator && (
                                <button 
                                  onClick={() => handleCompleteTraining(member._id || member.mysqlId)}
                                  className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium 
                                    ${member.status === 'miratuar' ? 
                                      'bg-gray-200 text-gray-600 cursor-not-allowed' : 
                                      'bg-green-600 hover:bg-green-700 text-white'}`}
                                  disabled={member.status === 'miratuar'}
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {member.status === 'miratuar' ? 'Completed' : 'Complete'}
                                </button>
                              )}
                              {/* Butoni Remove - vetëm për krijuesin */}
                              {isCreator && (
                                <button 
                                  onClick={() => handleRemoveClick(member._id || member.mysqlId, member.name)}
                                  className="inline-flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No members yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Invite members by entering their email above.</p>
                </div>
              )}
            </div>
          </div>
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