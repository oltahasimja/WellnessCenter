import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const CardMember = () => {
  const [formData, setFormData] = useState({
    userId: "",
    cardId: "",
  });
  const [loading, setLoading] = useState(true);
  const [CardMemberList, setCardMemberList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [cardList, setCardList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    fetchCardMember();
    fetchUsers();
    fetchCards();
  }, []);

  const fetchCardMember = async () => {
    const response = await axios.get("http://localhost:5001/api/cardmember");
    setCardMemberList(response.data);
  };
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
  const fetchUsers = async () => {
    const response = await axios.get("http://localhost:5001/api/user");
    setUserList(response.data);
  };

  const fetchCards = async () => {
    const response = await axios.get("http://localhost:5001/api/card");
    setCardList(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('You must be logged in to perform this action');
      return;
    }
  
    try {
      const submissionData = {
        userId: formData.userId,
        cardId: formData.cardId,
        invitedById: currentUser.id // Use the current user's ID as the inviter
      };
  
      if (formData.id) {
        submissionData.id = formData.id;
        await axios.put(
          `http://localhost:5001/api/cardmember/${formData.id}`,
          submissionData
        );
      } else {
        // First try to add the invited user
        try {
          await axios.post("http://localhost:5001/api/cardmember", submissionData);
        } catch (error) {
          if (error.response?.data?.message?.includes("already exists")) {
            alert('This user is already in the card');
            return;
          }
          throw error;
        }
  
        // Then ensure the inviter is in the card (unless they're adding themselves)

      }
  
      fetchCardMember();
      setFormData({ userId: "", cardId: "" });
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Error saving card member");
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
      cardId: editData.cardId?.mysqlId || editData.cardId || "",
    });
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5001/api/cardmember/${id}`);
    fetchCardMember();
  };

  const getInviterName = (invitedById) => {
    const inviter = userList.find((user) => user.mysqlId === invitedById);
    return inviter ? inviter.name : "Unknown";
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">
          CardMember Management
        </h1>

        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Card</label>
            <select
              value={formData.cardId}
              onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
              className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="" disabled>
                Select Card
              </option>
              {cardList.map((item) => (
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
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">User</th>
                <th className="py-3 px-6 text-left">Card</th>
                <th className="py-3 px-6 text-left">Invited By</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {CardMemberList.length > 0 ? (
                CardMemberList.map((item) => (
                  <tr
                    key={item.mysqlId}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-6 text-left">
                      {item.userId?.name || ""}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {item.cardId?.title || ""}
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

export default CardMember;
