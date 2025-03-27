import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const CreateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [roleList, setRoleList] = useState([]);

  useEffect(() => {
    fetchRoles();
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    const response = await axios.get(`http://localhost:5000/api/user/${id}`);
    setFormData(response.data);
  };

  const fetchRoles = async () => {
    const response = await axios.get("http://localhost:5000/api/role");
    setRoleList(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`http://localhost:5000/api/user/${id}`, formData);
      } else {
        await axios.post("http://localhost:5000/api/user", formData);
      }
      navigate("/user");
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 mb-[2rem]">
        <Sidebar />
        <div className="p-6 flex-1 bg-gray-100 dark:bg-gray-800">
          <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-4xl">
              <h1 className="text-4xl font-bold text-center mb-8 text-gray-700">
                {id ? "Edit User" : "Create New User"}
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName || ""}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Number"
                    value={formData.number || ""}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.username || ""}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />

                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={formData.roleId || ""}
                      onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                      className="border p-4 text-lg rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                      required
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

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => navigate("/user")}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition"
                  >
                    {id ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;