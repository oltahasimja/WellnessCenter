import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { Link } from "react-router-dom";
import { useTheme } from "../../components/ThemeContext";
import DeleteConfirmation from "../../components/DeleteConfirmation";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import useAuthCheck from "../../hook/useAuthCheck";

const User = ({ setActiveComponent }) => {
  const { theme } = useTheme();
  const [userList, setUserList] = useState([]);
  const [roleList, setRoleList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemNameToDelete, setItemNameToDelete] = useState("");
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const { isChecking, isAuthenticated, user } = useAuthCheck();

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async (roleId = "all", search = "") => {
    let url = "http://localhost:5001/api/user";
    
    if (roleId === "specialists") {
      const response = await axios.get(url);
      const filteredUsers = response.data.filter(user => 
        user.roleId?.name !== 'Client' && 
        (!search || user.username.toLowerCase().includes(search.toLowerCase()))
      );
      setUserList(filteredUsers);
      return;
    } else if (roleId !== "all") {
      url = `http://localhost:5001/api/user/role/${roleId}`;
    }
    
    try {
      const response = await axios.get(url);
      
      if (search) {
        const filteredUsers = response.data.filter(user => 
          user.username.toLowerCase().includes(search.toLowerCase())
        );
        setUserList(filteredUsers);
      } else {
        setUserList(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchRoles = async () => {
    const response = await axios.get("http://localhost:5001/api/role");
    setRoleList(response.data);
  };

  const isOwner = user?.dashboardRole === 'Owner';

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(selectedRole, searchTerm);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (e) => {
    const roleId = e.target.value;
    setSelectedRole(roleId);
    fetchUsers(roleId, searchTerm);
    setCurrentPage(1); 
  };

  const handleDeleteClick = (id, name) => {
    setItemToDelete(id);
    setItemNameToDelete(name);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await axios.delete(`http://localhost:5001/api/user/${itemToDelete}`);
      fetchUsers();
      setDeleteModalOpen(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleEditClick = (user) => {
    setEditingId(user.mysqlId || user.id);
    setEditFormData({
      name: user.name,
      lastName: user.lastName,
      number: user.number,
      email: user.email,
      username: user.username,
      country: user.country,
      city: user.city,
      birthday: user.birthday,
      gender: user.gender,
      roleId: user.roleId?.mysqlId || user.roleId
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const handleSaveClick = async (id) => {
    try {
      await axios.put(`http://localhost:5001/api/user/${id}`, editFormData);
      setEditingId(null);
      fetchUsers();
      navigate('/dashboard/users');
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Get current users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = userList.slice(indexOfFirstUser, indexOfLastUser);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < Math.ceil(userList.length / usersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Export functions
  const exportToExcel = () => {
    if (userList.length === 0) return;
  
    const filteredUserList = userList.map(({ password, dashboardRoleId, profileImage, __v, roleId, countryId, cityId, ...rest }) => ({
      ...rest,
      role: roleId && roleId.name ? roleId.name : "No Role Assigned",
      country: countryId && countryId.name ? countryId.name : "No Country",
      city: cityId && cityId.name ? cityId.name : "No City"
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(filteredUserList);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.xlsx");
    setShowDownloadDropdown(false);
  };
  
  const exportToJSON = () => {
    if (userList.length === 0) return;
  
    const filteredUserList = userList.map(({ password, profileImage, dashboardRoleId, __v, roleId, countryId, cityId, ...rest }) => ({
      ...rest,
      role: roleId && roleId.name ? roleId.name : "No Role Assigned",
      country: countryId && countryId.name ? countryId.name : "No Country",
      city: cityId && cityId.name ? cityId.name : "No City"
    }));
  
    const jsonContent = JSON.stringify(filteredUserList, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    saveAs(blob, "users.json");
    setShowDownloadDropdown(false);
  };

  // Funksioni për të përcaktuar ngjyrën e badges bazuar në rolin
  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'nutricionist':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'fizioterapeut':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'trajner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'psikolog':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'specialist':
        return 'bg-green-200 text-green-800 border-green-200';
      case 'client':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Funksioni për formatimin e datës
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 mb-[2rem]">
        <div className={`flex-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className={`flex justify-center items-center min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
            <div className={`shadow-2xl rounded-2xl p-6 w-full max-w-7xl ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100'}`}>
              
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
                <div>
                  <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>
                    User Management
                  </h1>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage users, roles, and permissions
                  </p>
                </div>
                
                {/* Controls Section */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        fetchUsers(selectedRole, e.target.value);
                        setCurrentPage(1);
                      }}
                      className={`pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                          : 'bg-white border-gray-300 placeholder-gray-500'
                      }`}
                    />
                  </div>

                  {/* Role Filter */}
                  <select
                    value={selectedRole}
                    onChange={handleRoleFilterChange}
                    className={`px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="all">All Roles</option>
                    <option value="specialists">Only Specialists</option>
                    {roleList.map((role) => (
                      <option key={role.mysqlId || role.id} value={role.mysqlId || role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>

                  {/* Download Dropdown */}
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                      className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        theme === 'dark' 
                          ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showDownloadDropdown && (
                      <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg z-10 border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-white border-gray-200'
                      }`}>
                        <div className="py-2">
                          <button
                            onClick={exportToExcel}
                            className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${
                              theme === 'dark' 
                                ? 'text-white hover:bg-gray-600' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-4 h-4 mr-3 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                            </svg>
                            Export to Excel
                          </button>
                          <button
                            onClick={exportToJSON}
                            className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${
                              theme === 'dark' 
                                ? 'text-white hover:bg-gray-600' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <svg className="w-4 h-4 mr-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M5,3C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H5M5,5H19V19H5V5Z" />
                            </svg>
                            Export to JSON
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add User Button */}
                  <Link
                    to="/dashboard/createuser"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add User
                  </Link>
                </div>
              </div>

              {/* Table Section */}
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className={`w-full ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <thead>
                      <tr className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          User
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          Contact
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          Details
                        </th>
                        <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          Role
                        </th>
                        <th className={`px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {currentUsers.length > 0 ? (
                        currentUsers.map((item) => (
                          <tr 
                            key={item.mysqlId || item.id} 
                            className={`transition-colors duration-150 ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-700/50' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            {/* User Column */}
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                {/* <div className={`flex-shrink-0 h-12 w-12 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                                  <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {item.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                </div> */}
                                <div className={`flex-shrink-0 h-12 w-12 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center overflow-hidden`}>
                                {item.profileImageId?.name ? (
                                  <img 
                                    src={`data:image/jpeg;base64,${item.profileImageId.name}`} 
                                    alt={`${item.name} ${item.lastName}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {item.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                )}
                              </div>
                                <div className="ml-4">
                                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {item.name} {item.lastName}
                                  </div>
                                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    @{item.username}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Contact Column */}
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'} mb-1`}>
                                  {item.email}
                                </div>
                                <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {item.number}
                                </div>
                              </div>
                            </td>

                            {/* Details Column */}
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'} mb-1`}>
                                  <span className="font-medium">Birth:</span> {formatDate(item.birthday)}
                                </div>
                                <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  <span className="font-medium">Gender:</span> {item.gender}
                                </div>
                              </div>
                            </td>

                            {/* Role Column */}
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                                theme === 'dark' 
                                  ? 'bg-gray-700 text-gray-300 border-gray-600' 
                                  : getRoleBadgeColor(item.roleId?.name)
                              }`}>
                                {item.roleId?.name || 'No Role'}
                              </span>
                            </td>

                            {/* Actions Column */}
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => {
                                    const userId = item.mysqlId || item.id;
                                    navigate(`/dashboard/edituser/${userId}`);
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>

                                {isOwner ? (
                                  <button
                                    onClick={() => handleDeleteClick(item.mysqlId || item.id, item.name)}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-gray-400 bg-gray-200 cursor-not-allowed"
                                    title="Only Owners can delete users"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            <div className="flex flex-col items-center">
                              <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <p className="text-lg font-medium">No users found</p>
                              <p className="text-sm">Try adjusting your search or filter criteria</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {userList.length > 0 && (
                <div className="flex items-center justify-between mt-6 px-2">
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                    Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, userList.length)} of {userList.length} users
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === 1 
                          ? theme === 'dark' 
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : theme === 'dark'
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="flex space-x-1">
                     {(() => {
                        const totalPages = Math.ceil(userList.length / usersPerPage);
                        const visiblePages = 5;
                        let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
                        let endPage = startPage + visiblePages - 1;

                        if (endPage > totalPages) {
                          endPage = totalPages;
                          startPage = Math.max(1, endPage - visiblePages + 1);
                        }

                        const pageNumbers = [];
                        for (let i = startPage; i <= endPage; i++) {
                          pageNumbers.push(i);
                        }

                        return (
                          <>
                            {startPage > 1 && (
                              <>
                                <button
                                  onClick={() => paginate(1)}
                                  className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                  1
                                </button>
                                {startPage > 2 && <span className="px-2">...</span>}
                              </>
                            )}

                            {pageNumbers.map((number) => (
                              <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  currentPage === number
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : theme === 'dark'
                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {number}
                              </button>
                            ))}

                            {endPage < totalPages && (
                              <>
                                {endPage < totalPages - 1 && <span className="px-2">...</span>}
                                <button
                                  onClick={() => paginate(totalPages)}
                                  className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                  {totalPages}
                                </button>
                              </>
                            )}
                          </>
                        );
                      })()}

                    </div>
                    
                    <button
                      onClick={nextPage}
                      disabled={currentPage === Math.ceil(userList.length / usersPerPage)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === Math.ceil(userList.length / usersPerPage)
                          ? theme === 'dark' 
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : theme === 'dark'
                            ? 'bg-gray-700 text-white hover:bg-gray-600'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        itemName={itemNameToDelete}
      />
    </div>
  );
};

export default User;