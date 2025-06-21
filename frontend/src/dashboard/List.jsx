import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const List = () => {
  const [formData, setFormData] = useState({});
  const [listList, setListList] = useState([]);
  const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [programList, setProgramList] = useState([]);
    const [editingId, setEditingId] = useState(null); // Track which list is being edited
    const [editName, setEditName] = useState(''); // Store the edited name

    useEffect(() => {
      const checkLoginStatus = async () => {
        try {
          const response = await axios.get('http://localhost:5001/user', { withCredentials: true });
          if (response.data.user) {
            setUser(response.data.user);
          } else {
            navigate('/login');
          }
        } catch (error) {
          console.log('Përdoruesi nuk është i kyçur.');
          navigate('/login');
        }
      };
    
      checkLoginStatus();
      fetchLists();
      fetchPrograms(); // ✅ Make sure to call this function
    }, [navigate]);
  const fetchLists = async () => {
    const response = await axios.get('http://localhost:5001/api/list');
    setListList(response.data);
  };

    const fetchPrograms = async () => {
      const response = await axios.get("http://localhost:5001/api/program");
      setProgramList(response.data);
    };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return; // Ensure user is logged in
  
    if (!formData.programId) {
      alert('Please select a program');
      return;
    }
    const dataToSend = { ...formData, createdById: user.id, programId: formData.programId }; // Assign createdById automatically

    if (formData.id) {
      await axios.put(`http://localhost:5001/api/list/${formData.id}`, dataToSend);
    } else {
      await axios.post('http://localhost:5001/api/list', dataToSend);
    }
    fetchLists();
    setFormData({});
  };
  const handleEdit = (item) => {
    // Create a copy of the item to avoid direct modification
    const editData = { ...item };
    if (item.mysqlId) {
      editData.id = item.mysqlId;
    }
    setFormData(editData);
  };
  const startInlineEdit = (item) => {
    setEditingId(item.mysqlId || item.id);
    setEditName(item.name);
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveInlineEdit = async (id) => {
    try {
      await axios.put(`http://localhost:5001/api/list/${id}`, { name: editName });
      setEditingId(null);
      setEditName('');
      fetchLists();
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5001/api/list/${id}`);
    fetchLists();
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">List Management</h1>
        
        {/* Forma */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
          />
                 <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program
            </label>
            <select
  value={formData.programId || ''}
  onChange={(e) =>
    setFormData({ ...formData, programId: e.target.value })
  }
  className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
>
  <option value="" disabled>Select Program</option>
  {programList.map((item) => (
    <option key={item.mysqlId || item.id} value={item.mysqlId || item.id}>
      {item.title}
    </option>
  ))}
</select>
          </div>
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg">
            {formData.id ? 'Përditëso' : 'Shto'}
          </button>
        </form>
        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Program</th>
                <th className="py-3 px-6 text-left">Created By</th>
                <th className="py-3 px-6 text-left">Created At</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {listList.length > 0 ? (
                listList.map((item) => (
                  <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">
                      {editingId === (item.mysqlId || item.id) ? (
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="border p-1 rounded-md w-full"
                          />
                        </div>
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="py-3 px-6 text-left">{item.programId?.title || '—'}</td>
                    <td className="py-3 px-6 text-left">{item.createdById.name}</td>
                    <td className="py-3 px-6 text-left">{item.createdAt}</td>
                    <td className="py-3 px-6 flex justify-center space-x-2">
                      {editingId === (item.mysqlId || item.id) ? (
                        <>
                          <button 
                            onClick={() => saveInlineEdit(item.mysqlId || item.id)}
                            className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md text-sm"
                          >
                            Save
                          </button>
                          <button 
                            onClick={cancelInlineEdit}
                            className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded-md text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => startInlineEdit(item)}
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
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default List;