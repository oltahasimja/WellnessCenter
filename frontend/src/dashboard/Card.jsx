import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Add this for better error messages
import 'react-toastify/dist/ReactToastify.css';

const Card = () => {
  const [formData, setFormData] = useState({
    isArchived: false,
    priority: 'medium',
    labels: [],
    attachments: [],
    checklist: []
  });
  const [cardList, setCardList] = useState([]);
  const [listList, setListList] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const resetForm = () => {
    setFormData({
      isArchived: false,
      priority: 'medium',
      labels: [],
      attachments: [],
      checklist: []
    });
    setSelectedFiles([]);
    setNewChecklistItem('');
  };
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user', { withCredentials: true });
        if (response.data.user) {
          setUser(response.data.user);
          fetchCards();
          fetchLists();
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.log('User is not logged in.');
        navigate('/login');
      }
    };

    checkLoginStatus();
  }, [navigate]);

  const fetchCards = async () => {
    const response = await axios.get('http://localhost:5000/api/card');
    setCardList(response.data);
  };

  const fetchLists = async () => {
    const response = await axios.get('http://localhost:5000/api/list');
    setListList(response.data);
  };

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const uploadFiles = async () => {
    const filePromises = selectedFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name,
            type: file.type,
            data: e.target.result.split(',')[1] // base64 without prefix
          });
        };
        reader.readAsDataURL(file);
      });
    });

    return await Promise.all(filePromises);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
  
    // Validate required fields
    if (!formData.title || !formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
  
    if (!formData.listId) {
      toast.error('Please select a list');
      return;
    }
  
    try {
      // Convert files to base64 if any
      const attachments = selectedFiles.length > 0 
        ? await Promise.all(selectedFiles.map(convertToBase64))
        : [];
  
      // Prepare the data payload
      const payload = {
        ...formData, // Include all form data
        id: formData.id, // Explicitly include ID
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        listId: formData.listId,
        createdById: user.id,
        dueDate: formData.dueDate || null,
        priority: formData.priority || 'medium',
        labels: formData.labels || [],
        attachments: [...(formData.attachments || []), ...attachments],
        checklist: formData.checklist || [],
        isArchived: Boolean(formData.isArchived)
      };
  
      const endpoint = formData.id 
        ? `http://localhost:5000/api/card/${formData.id}`
        : 'http://localhost:5000/api/card';
  
      const method = formData.id ? 'put' : 'post';
  
      const response = await axios[method](endpoint, payload, {
        withCredentials: true,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.data) {
        toast.success(`Card ${formData.id ? 'updated' : 'created'} successfully!`);
        fetchCards();
        resetForm();
      }
    } catch (error) {
      console.error('Submission error:', error);
      let errorMessage = 'Failed to save card';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.statusText || 
                      `Server error (${error.response.status})`;
      } else if (error.request) {
        errorMessage = 'No response from server. Check your connection.';
      }
      
      toast.error(errorMessage);
    }
  };
  
  // Helper function to convert files to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result.split(',')[1] // Remove data URL prefix
      });
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };
  const handleEdit = (item) => {
    const editData = { 
      ...item,
      id: item.mysqlId || item.id,
      listId: item.listId?.mysqlId || item.listId // Handle list reference
    };
    setFormData(editData);
  };



  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/card/${id}`);
    fetchCards();
  };

  const addLabel = (label) => {
    if (!formData.labels.includes(label)) {
      setFormData({
        ...formData,
        labels: [...formData.labels, label]
      });
    }
  };

  const removeLabel = (labelToRemove) => {
    setFormData({
      ...formData,
      labels: formData.labels.filter(label => label !== labelToRemove)
    });
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData({
        ...formData,
        checklist: [...formData.checklist, { text: newChecklistItem, completed: false }]
      });
      setNewChecklistItem('');
    }
  };

  const toggleChecklistItem = (index) => {
    const updatedChecklist = [...formData.checklist];
    updatedChecklist[index].completed = !updatedChecklist[index].completed;
    setFormData({
      ...formData,
      checklist: updatedChecklist
    });
  };

  const removeChecklistItem = (index) => {
    setFormData({
      ...formData,
      checklist: formData.checklist.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Card Management</h1>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                <input 
                  type="text"
                  placeholder="Card title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Card description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">List*</label>
                <select
                  value={formData.listId || ''}
                  onChange={(e) => setFormData({ ...formData, listId: e.target.value })}
                  className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="" disabled>Select List</option>
                  {listList.map((item) => (
                    <option key={item.mysqlId} value={item.mysqlId}>{item.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input 
                  type="datetime-local"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority || 'medium'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Labels</label>
                <div className="flex space-x-2 mb-2">
                  {['Frontend', 'Backend', 'Bug', 'Feature', 'Urgent'].map(label => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => addLabel(label)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                    >
                      + {label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.labels.map(label => (
                    <span key={label} className="flex items-center bg-gray-200 px-2 py-1 rounded-md text-sm">
                      {label}
                      <button 
                        type="button"
                        onClick={() => removeLabel(label)}
                        className="ml-1 text-gray-600 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                <input 
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="border p-2 rounded-md w-full"
                />
                <div className="mt-2 space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {file.name}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Checklist</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add checklist item"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    className="border p-2 rounded-md flex-grow"
                  />
                  <button
                    type="button"
                    onClick={addChecklistItem}
                    className="bg-blue-500 text-white px-3 py-2 rounded-md"
                  >
                    Add
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  {formData.checklist.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.completed || false}
                        onChange={() => toggleChecklistItem(index)}
                        className="mr-2"
                      />
                      <span className={item.completed ? 'line-through text-gray-500' : ''}>
                        {item.text}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(index)}
                        className="ml-auto text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox"
                  checked={formData.isArchived || false}
                  onChange={(e) => setFormData({ ...formData, isArchived: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="ml-2">Archive this card</span>
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg"
          >
            {formData.id ? 'Update' : 'Create'}
          </button>
        </form>
        
        {/* Cards Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse shadow-md rounded-md bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Title</th>
                <th className="py-3 px-6 text-left">List</th>
                <th className="py-3 px-6 text-left">Priority</th>
                <th className="py-3 px-6 text-left">Due Date</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm font-light">
              {cardList.length > 0 ? (
                cardList.map((item) => (
                  <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left">{item.title}</td>
                    <td className="py-3 px-6 text-left">{item.listId?.name || ''}</td>
                    <td className="py-3 px-6 text-left">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.priority === 'high' ? 'bg-red-100 text-red-800' :
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-left">{item.dueDate ? new Date(item.dueDate).toLocaleString() : '-'}</td>
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
                  <td colSpan="5" className="text-center text-gray-500 py-4">No cards found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Card;