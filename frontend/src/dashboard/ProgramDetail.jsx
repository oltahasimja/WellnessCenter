import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  
        // If you have a separate endpoint for members
        const membersRes = await axios.get(`http://localhost:5000/api/program/${id}/members`);
        console.log('Members data:', membersRes.data); // Debug log
        
        setProgram(programRes.data);
        setMembers(membersRes.data || []);
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
    try {
      const response = await axios.post(
        `http://localhost:5000/api/program/${id}/members`,
        { email: newMemberEmail }
      );
      setMembers([...members, response.data]);
      setNewMemberEmail('');
    } catch (error) {
      console.error('Error adding member:', error);
      alert(error.response?.data?.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await axios.delete(`http://localhost:5000/api/program/${id}/members/${memberId}`);
      setMembers(members.filter(member => member.id !== memberId));
    } catch (error) {
      console.error('Error removing member:', error);
      alert("Failed to remove member");
    }
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
                    <tr key={member._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{member.role || 'Member'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleRemoveMember(member._id)}
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
    </div>
  );
};

export default ProgramDetail;