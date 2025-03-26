import React, { useState, useEffect } from "react";
import axios from "axios";

const User = () => {
  const [formData, setFormData] = useState({});
  const [userList, setUserList] = useState([]);
  const [roleList, setRoleList] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    const response = await axios.get("http://localhost:5000/api/user");
    setUserList(response.data);
  };

  const fetchRoles = async () => {
    const response = await axios.get("http://localhost:5000/api/role");
    setRoleList(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.id) {
      await axios.put(`http://localhost:5000/api/user/${formData.id}`, formData);
    } else {
      await axios.post("http://localhost:5000/api/user", formData);
    }
    fetchUsers();
    setFormData({});
  };

  const handleEdit = (item) => {
    setFormData({ ...item, id: item.mysqlId || item.id });
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/user/${id}`);
    fetchUsers();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-10xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-700">
          User Management
        </h1>

        {/* Forma */}
        <form onSubmit={handleSubmit} className="mb-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName || ""}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              type="text"
              placeholder="Number"
              value={formData.number || ""}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              className="border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              type="email"
              placeholder="Email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              type="text"
              placeholder="Username"
              value={formData.username || ""}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.roleId || ""}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                className="border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="" disabled>
                  Select Role
                </option>
                {roleList.map((item) => (
                  <option key={item.mysqlId} value={item.mysqlId}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg rounded-lg font-semibold transition"
          >
            {formData.id ? "Update" : "Add"}
          </button>
        </form>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-lg bg-white">
            <thead>
              <tr className="bg-gray-300 text-gray-700 uppercase text-lg leading-normal">
                <th className="py-4 px-6 text-left">Name</th>
                <th className="py-4 px-6 text-left">Last Name</th>
                <th className="py-4 px-6 text-left">Number</th>
                <th className="py-4 px-6 text-left">Email</th>
                <th className="py-4 px-6 text-left">Username</th>
                <th className="py-4 px-6 text-left">Role</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 text-lg font-medium">
              {userList.length > 0 ? (
                userList.map((item) => (
                  <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-4 px-6">{item.name}</td>
                    <td className="py-4 px-6">{item.lastName}</td>
                    <td className="py-4 px-6">{item.number}</td>
                    <td className="py-4 px-6">{item.email}</td>
                    <td className="py-4 px-6">{item.username}</td>
                    <td className="py-4 px-6">{item.roleId?.name || ""}</td>
                    <td className="py-4 px-6 flex justify-center space-x-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg text-lg"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.mysqlId || item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-lg"
                      >
                        Delete
                      </button>
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
        </div>
      </div>
    </div>
  );
};

export default User;
