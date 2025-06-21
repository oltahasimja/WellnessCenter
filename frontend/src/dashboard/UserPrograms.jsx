import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../components/ThemeContext';
import { FaSearch } from 'react-icons/fa';

const UserPrograms = () => {
  const [formData, setFormData] = useState({
    userId: "",
    programId: "",
  });
  const [loading, setLoading] = useState(true);
  const [userprogramsList, setUserProgramsList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [programSearch, setProgramSearch] = useState("");
  const [tableSearch, setTableSearch] = useState("");
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    fetchUserPrograms();
    fetchUsers();
    fetchPrograms();
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5001/user', { withCredentials: true });
        if (!response.data.user) {
          navigate('/login');
        } else {
          const userResponse = await axios.get(`http://localhost:5001/api/user/${response.data.user.id}`);
          const userRole = userResponse.data.roleId?.name;
          
          setCurrentUser({
            id: response.data.user.id,
            role: userRole
          });
  
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        navigate('/login');
      }
    };
    checkLoginStatus();
  }, [navigate]);

  const fetchUserPrograms = async () => {
    const response = await axios.get("http://localhost:5001/api/userprograms");
    setUserProgramsList(response.data);
  };

  const fetchUsers = async () => {
    const response = await axios.get("http://localhost:5001/api/user");
    setUserList(response.data);
  };

  const fetchPrograms = async () => {
    const response = await axios.get("http://localhost:5001/api/program");
    setProgramList(response.data);
  };

  // Filtered lists for dropdowns
  const filteredUsers = userList.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase())
  );
  
  const filteredPrograms = programList.filter(program => 
    program.title.toLowerCase().includes(programSearch.toLowerCase())
  );

  // Pagination logic - FIXED SYNTAX ERROR HERE
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = userprogramsList
    .filter(item => 
      item.userId?.name?.toLowerCase().includes(tableSearch.toLowerCase()) ||
      item.programId?.title?.toLowerCase().includes(tableSearch.toLowerCase()) ||
      item.invitedById?.name?.toLowerCase().includes(tableSearch.toLowerCase())
    )
    .slice(indexOfFirstItem, indexOfLastItem);
  
  const totalPages = Math.ceil(userprogramsList.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('You must be logged in to perform this action');
      return;
    }
  
    try {
      const submissionData = {
        userId: formData.userId,
        programId: formData.programId,
        invitedById: currentUser.id
      };
  
      if (formData.id) {
        submissionData.id = formData.id;
        await axios.put(
          `http://localhost:5001/api/userprograms/${formData.id}`,
          submissionData
        );
      } else {
        try {
          await axios.post("http://localhost:5001/api/userprograms", submissionData);
        } catch (error) {
          if (error.response?.data?.message?.includes("already exists")) {
            alert('This user is already in the program');
            return;
          }
          throw error;
        }
  
        if (formData.userId !== currentUser.id) {
          try {
            await axios.post("http://localhost:5001/api/userprograms", {
              userId: currentUser.id,
              programId: formData.programId,
              invitedById: currentUser.id
            });
          } catch (inviterError) {
            if (!inviterError.response?.data?.message?.includes("already exists")) {
              throw inviterError;
            }
          }
        }
      }
  
      fetchUserPrograms();
      setFormData({ userId: "", programId: "" });
      setUserSearch("");
      setProgramSearch("");
      setCurrentPage(1);
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Error saving user program");
    }
  };

  const handleEdit = (item) => {
    const editData = { ...item };
    if (item.mysqlId) {
      editData.id = item.mysqlId;
    }
    setFormData({
      id: editData.id,
      userId: editData.userId?.mysqlId || editData.userId || "",
      programId: editData.programId?.mysqlId || editData.programId || "",
    });
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5001/api/userprograms/${id}`);
    fetchUserPrograms();
  };

  const getInviterName = (invitedById) => {
    const inviter = userList.find((user) => user.mysqlId === invitedById);
    return inviter ? inviter.name : "Unknown";
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="flex justify-center items-center pt-10 pb-10">
        <div className={`${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700'} shadow-lg rounded-lg p-6 w-full max-w-3xl`}>
          <h1 className={`text-3xl font-bold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
            UserPrograms Management
          </h1>

          {/* Table Search */}
          <div className="mb-6 relative">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search user programs..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className={`border p-3 rounded-l-md w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''
                }`}
              />
              <div className={`p-3 rounded-r-md ${
                theme === 'dark' ? 'bg-gray-700 border border-gray-600' : 'bg-gray-200 border'
              }`}>
                <FaSearch className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mb-6 space-y-4">
            <div className="w-full">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                User
              </label>
              
              {/* User Search */}
              <div className="mb-2 relative">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className={`border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''
                    }`}
                  />
                  <div className={`absolute right-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FaSearch />
                  </div>
                </div>
              </div>
              
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className={`border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''
                }`}
              >
                <option value="" disabled>
                  Select User
                </option>
                {filteredUsers.map((item) => (
                  <option key={item.mysqlId} value={item.mysqlId}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Program
              </label>
              
              {/* Program Search */}
              <div className="mb-2 relative">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={programSearch}
                    onChange={(e) => setProgramSearch(e.target.value)}
                    className={`border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''
                    }`}
                  />
                  <div className={`absolute right-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FaSearch />
                  </div>
                </div>
              </div>
              
              <select
                value={formData.programId}
                onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                className={`border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : ''
                }`}
              >
                <option value="" disabled>
                  Select Program
                </option>
                {filteredPrograms.map((item) => (
                  <option key={item.mysqlId} value={item.mysqlId}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg"
            >
              {formData.id ? "Përditëso" : "Shto"}
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className={`w-full border-collapse shadow-md rounded-md ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-white'
            }`}>
              <thead>
                <tr className={`${
                  theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-600'
                } uppercase text-sm leading-normal`}>
                  <th className="py-3 px-6 text-left">User</th>
                  <th className="py-3 px-6 text-left">Program</th>
                  <th className="py-3 px-6 text-left">Invited By</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className={`text-sm font-light ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr
                      key={item.mysqlId}
                      className={`border-b ${
                        theme === 'dark' ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <td className="py-3 px-6 text-left">
                        {item.userId?.name || ""}
                      </td>
                      <td className="py-3 px-6 text-left">
                        {item.programId?.title || ""}
                      </td>
                      <td className="py-3 px-6 text-left">
                        {getInviterName(item.invitedById)}
                      </td>
                      <td className="py-3 px-6 flex justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.mysqlId)}
                          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={`text-center py-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {tableSearch ? 'No matching user programs found' : 'Nuk ka të dhëna'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {userprogramsList.length > itemsPerPage && (
            <div className={`flex justify-center items-center mt-4 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <button 
                onClick={() => paginate(Math.max(1, currentPage - 1))} 
                disabled={currentPage === 1}
                className={`mx-1 px-3 py-1 rounded-md ${
                  currentPage === 1 
                    ? (theme === 'dark' ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed') 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`mx-1 px-3 py-1 rounded-md ${
                    currentPage === number
                      ? 'bg-blue-500 text-white'
                      : theme === 'dark' 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {number}
                </button>
              ))}
              
              <button 
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))} 
                disabled={currentPage === totalPages}
                className={`mx-1 px-3 py-1 rounded-md ${
                  currentPage === totalPages 
                    ? (theme === 'dark' ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed') 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPrograms;