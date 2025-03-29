import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import ThemeSwitcher from "../components/ThemeSwitcher"
import DeleteConfirmation from "../components/DeleteConfirmation";

const User = () => {
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


  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);
  const fetchUsers = async (roleId = "all", search = "") => {
    let url = "http://localhost:5000/api/user";
    
    if (roleId !== "all") {
      url = `http://localhost:5000/api/user/role/${roleId}`;
    }
    
    try {
      const response = await axios.get(url);
      
      // Filter users by search term if one exists
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
    const response = await axios.get("http://localhost:5000/api/role");
    setRoleList(response.data);
  };


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
      await axios.delete(`http://localhost:5000/api/user/${itemToDelete}`);
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
      await axios.put(`http://localhost:5000/api/user/${id}`, editFormData);
      setEditingId(null);
      fetchUsers();
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

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 mb-[2rem]">
        <Sidebar />
        <div className="p-6 flex-1 bg-gray-100 dark:bg-gray-800">
  <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-100">
    <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-10xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-700">User Management</h1>
        
        <div className="flex items-center space-x-4">

        <form onSubmit={handleSearchSubmit} className="flex">
        <input
            type="text"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchUsers(selectedRole, e.target.value);
              setCurrentPage(1);
            }}
            className="border p-2 rounded-lg text-lg bg-white shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
    {/* <button 
      type="submit"
      className="ml-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition"
    >
      Search
    </button> */}
  </form>

          <select
            value={selectedRole}
            onChange={handleRoleFilterChange}
            className="border p-2 rounded-lg text-lg bg-white shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="all">All Roles</option>
            {roleList.map((role) => (
              <option key={role.mysqlId || role.id} value={role.mysqlId || role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <Link 
            to="/createuser" 
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition"
          >
            Add New User
          </Link>
              </div>
              </div>

              <div className="overflow-x-auto">
              <table className="w-full border-collapse shadow-md rounded-lg bg-white" style={{ tableLayout: 'fixed' }}>
              <thead>
                    <tr className="bg-gray-300 text-gray-700 uppercase text-lg leading-normal">
                    <th className="py-4 px-6 text-left" style={{ width: '100px' }}>Name</th>
                    <th className="py-4 px-6 text-left" style={{ width: '100px' }}>Lastname</th>
                    <th className="py-4 px-6 text-left" style={{ width: '100px' }}>Number</th>
                    <th className="py-4 px-6 text-left" style={{ width: '150px' }}>Email</th>
                    <th className="py-4 px-6 text-left" style={{ width: '100px' }}>Username</th>
                    <th className="py-4 px-6 text-left" style={{ width: '120px' }}>Birthdate</th>
                    <th className="py-4 px-6 text-left" style={{ width: '100px' }}>Gender</th>
                    <th className="py-4 px-6 text-left" style={{ width: '100px' }}>Country</th>
                    <th className="py-4 px-6 text-left" style={{ width: '100px' }}>City</th>
                    <th className="py-4 px-6 text-left" style={{ width: '150px' }}>Role</th>
                    <th className="py-4 px-6 text-center" style={{ width: '150px' }}>Actions</th>
                                </tr>
                  </thead>
                  <tbody className="text-gray-800 text-lg font-medium">
                    {currentUsers.length > 0 ? (
                      currentUsers.map((item) => (
                        <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
                          <td className="py-4 px-6 truncated">
                            {editingId === (item.mysqlId || item.id) ? (
                              <input
                                type="text"
                                name="name"
                                value={editFormData.name}
                                onChange={handleEditFormChange}
                                className="border p-2 rounded w-full"
                              />
                            ) : (
                              item.name
                            )}
                          </td>
                          <td className="py-4 px-6 truncated" >
                            {editingId === (item.mysqlId || item.id) ? (
                              <input
                                type="text"
                                name="lastName"
                                value={editFormData.lastName}
                                onChange={handleEditFormChange}
                                className="border p-2 rounded w-full"
                              />
                            ) : (
                              item.lastName
                            )}
                          </td>
                          <td className="py-4 px-6 truncated">
                            {editingId === (item.mysqlId || item.id) ? (
                              <input
                                type="text"
                                name="number"
                                value={editFormData.number}
                                onChange={handleEditFormChange}
                                className="border p-2 rounded w-full"
                              />
                            ) : (
                              item.number
                            )}
                          </td>
                          <td className="py-4 px-6 truncated">
                            {editingId === (item.mysqlId || item.id) ? (
                              <input
                                type="email"
                                name="email"
                                value={editFormData.email}
                                onChange={handleEditFormChange}
                                className="border p-2 rounded w-full"
                              />
                            ) : (
                              item.email
                            )}
                          </td>
                          <td className="py-4 px-6 truncated">
                            {editingId === (item.mysqlId || item.id) ? (
                              <input
                                type="text"
                                name="username"
                                value={editFormData.username}
                                onChange={handleEditFormChange}
                                className="border p-2 rounded w-full"
                              />
                            ) : (
                              item.username
                            )}
                          </td>
                          <td className="py-4 px-6 truncated">
                            {editingId === (item.mysqlId || item.id) ? (
                              <input
                                type="date"
                                name="birthday"
                                value={editFormData.birthday}
                                onChange={handleEditFormChange}
                                className="border p-2 rounded w-full"
                              />
                            ) : (
                              item.birthday ? item.birthday.split("T")[0] : ""
                            )}
                          </td>

                          <td className="py-4 px-6 truncated">
                            {editingId === (item.mysqlId || item.id) ? (
                              <input
                                type="text"
                                name="gender"
                                value={editFormData.gender}
                                onChange={handleEditFormChange}
                                className="border p-2 rounded w-full"
                              />
                            ) : (
                              item.gender
                            )}
                          </td>

                          <td className="py-4 px-6 truncated">
                            {editingId === (item.mysqlId || item.id) ? (
                              <input
                                type="text"
                                name="country"
                                value={editFormData.country}
                                onChange={handleEditFormChange}
                                className="border p-2 rounded w-full"
                              />
                            ) : (
                              item.country
                            )}
                          </td>
                          <td className="py-4 px-6 truncated">
                            {editingId === (item.mysqlId || item.id) ? (
                              <input
                                type="text"
                                name="city"
                                value={editFormData.city}
                                onChange={handleEditFormChange}
                                className="border p-2 rounded w-full"
                              />
                            ) : (
                              item.city
                            )}
                          </td>
                          <td className="py-4 px-6 truncated" >
                            {editingId === (item.mysqlId || item.id) ? (
                              <select
                                name="roleId"
                                value={editFormData.roleId}
                                onChange={handleEditFormChange}
                                className="border p-2 rounded w-full"
                              >
                                {roleList.map((role) => (
                                  <option key={role.mysqlId} value={role.mysqlId}>
                                    {role.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              item.roleId?.name || ""
                            )}
                          </td>
                          <td className="py-4 px-6 flex justify-center space-x-3">
                            {editingId === (item.mysqlId || item.id) ? (
                              <>
                                <button
                                  onClick={() => handleSaveClick(item.mysqlId || item.id)}
                                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg text-lg"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelClick}
                                  className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-lg"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditClick(item)}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg text-lg"
                                >
                                  Edit
                                </button>
                                <button
                        onClick={() => handleDeleteClick(item.mysqlId || item.id, item.name)}
                         className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-lg"
                                >
                                  Delete
                                </button>
                                <DeleteConfirmation
                          isOpen={deleteModalOpen}
                          onClose={cancelDelete}
                          onConfirm={confirmDelete}
                          itemName={itemNameToDelete}
                        />

                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-gray-500 py-6 text-lg">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination controls */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-2">
                    {Array.from({ length: Math.ceil(userList.length / usersPerPage) }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={`px-4 py-2 rounded-lg ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={nextPage}
                    disabled={currentPage === Math.ceil(userList.length / usersPerPage)}
                    className={`px-4 py-2 rounded-lg ${currentPage === Math.ceil(userList.length / usersPerPage) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ThemeSwitcher />
    </div>
  );
};

export default User;