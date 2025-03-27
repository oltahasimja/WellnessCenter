import React, { useState, useEffect } from "react";
import axios from "axios";

const UserPrograms = () => {
  const [formData, setFormData] = useState({});
  const [userprogramsList, setUserProgramsList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [programList, setProgramList] = useState([]);

  useEffect(() => {
    fetchUserPrograms();
    fetchUsers();
    fetchPrograms();
  }, []);

  const fetchUserPrograms = async () => {
    const response = await axios.get("http://localhost:5000/api/userprograms");
    setUserProgramsList(response.data);
  };

  const fetchUsers = async () => {
    const response = await axios.get("http://localhost:5000/api/user");
    setUserList(response.data);
  };

  const fetchPrograms = async () => {
    const response = await axios.get("http://localhost:5000/api/program");
    setProgramList(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.id) {
      await axios.put(
        `http://localhost:5000/api/userprograms/${formData.id}`,
        formData
      );
    } else {
      await axios.post("http://localhost:5000/api/userprograms", formData);
    }
    fetchUserPrograms();
    setFormData({});
  };

  const handleEdit = (item) => {
    const editData = { ...item };
    if (item.mysqlId) {
      editData.id = item.mysqlId;
    }
    setFormData(editData);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/userprograms/${id}`);
    fetchUserPrograms();
  };

  // Helper function to get the inviter's name
  const getInviterName = (invitedById) => {
    const inviter = userList.find((user) => user.mysqlId === invitedById);
    return inviter ? inviter.name : "Unknown";
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">
          UserPrograms Management
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              value={formData.userId || ""}
              onChange={(e) =>
                setFormData({ ...formData, userId: e.target.value })
              }
              className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="" disabled>
                Select User
              </option>
              {userList.map((item) => (
                <option key={item.mysqlId} value={item.mysqlId}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program
            </label>
            <select
              value={formData.programId || ""}
              onChange={(e) =>
                setFormData({ ...formData, programId: e.target.value })
              }
              className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="" disabled>
                Select Program
              </option>
              {programList.map((item) => (
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

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">User</th>
                <th className="py-3 px-6 text-left">Program</th>
                <th className="py-3 px-6 text-left">Invited By</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {userprogramsList.length > 0 ? (
                userprogramsList.map((item) => (
                  <tr
                    key={item.mysqlId || item.id}
                    className="border-b border-gray-200 hover:bg-gray-100"
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
                        onClick={() => handleDelete(item.mysqlId || item.id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-gray-500 py-4">
                    Nuk ka të dhëna
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

export default UserPrograms;
