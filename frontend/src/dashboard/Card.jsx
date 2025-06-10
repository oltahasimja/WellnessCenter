
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
  const [removedAttachments, setRemovedAttachments] = useState([]);
  const navigate = useNavigate();
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

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
    setRemovedAttachments([]); // Make sure to reset this state
  };
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5001/user', { withCredentials: true });
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
    const response = await axios.get('http://localhost:5001/api/card');
    setCardList(response.data);
  };

  const fetchLists = async () => {
    const response = await axios.get('http://localhost:5001/api/list');
    setListList(response.data);
  };

  const handleFileChange = (e) => {
    setSelectedFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files)]);
  };

  const uploadFiles = async () => {
    // Keep existing attachments that weren't removed
    const keptAttachments = formData.attachments?.filter(att => 
      !removedAttachments.includes(att._id?.toString())
    ) || [];
    
    // Process only new files (not marked as existing)
    const newFiles = selectedFiles.filter(file => !file.isExisting);
    const newAttachments = await Promise.all(
      newFiles.map(async file => {
        if (file.size > MAX_FILE_SIZE) {
          toast.warn(`File ${file.name} is too large (max 5MB)`);
          return null;
        }
        
        try {
          return await convertToBase64(file);
        } catch (error) {
          console.error('Error converting file:', file.name, error);
          toast.warn(`Failed to process file ${file.name}`);
          return null;
        }
      })
    );
    
    return [...keptAttachments, ...newAttachments.filter(Boolean)];
  };
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result.split(',')[1]
      });
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
  
    try {
      const uploadedAttachments = selectedFiles.length > 0 
        ? await uploadFiles() 
        : [];
  
      const payload = {
        ...formData,
        id: formData.id,
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        listId: formData.listId,
        createdById: user.id,
        dueDate: formData.dueDate || null,
        priority: formData.priority || 'medium',
        labels: formData.labels || [],
        attachments: uploadedAttachments,
        checklist: formData.checklist || [],
        isArchived: Boolean(formData.isArchived),
        removedAttachments: removedAttachments // Make sure this is included
      };
  
      const endpoint = formData.id 
        ? `http://localhost:5001/api/card/${formData.id}`
        : 'http://localhost:5001/api/card';
  
      const method = formData.id ? 'put' : 'post';
  
      const response = await axios[method](endpoint, payload, {
        withCredentials: true,
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
      toast.error(error.response?.data?.message || 'Failed to save card');
    }
  };

// Inside the Card component

// Updated handleEdit function for Card.jsx
const handleEdit = async (item) => {
  try {
    const response = await axios.get(`http://localhost:5001/api/card/${item.mysqlId || item.id}`);
    const fullCardData = response.data;
    
    const editData = { 
      ...fullCardData,
      id: fullCardData.mysqlId || fullCardData.id,
      listId: fullCardData.listId?.mysqlId || fullCardData.listId
    };
    
    // Reset removed attachments
    setRemovedAttachments([]);
    
    // Process attachments
    let existingAttachments = [];
    if (fullCardData.attachments && fullCardData.attachments.length > 0) {
      existingAttachments = fullCardData.attachments.map(attachment => {
        return {
          _id: attachment._id ? attachment._id.toString() : null,
          name: attachment.name || `Attachment-${attachment._id}`,
          type: attachment.type || 'application/octet-stream',
          size: attachment.size || 0,
          data: attachment.data,
          isExisting: true
        };
      });
    }
    
    setFormData({
      ...editData,
      attachments: existingAttachments
    });
    
    setSelectedFiles(existingAttachments);
  } catch (error) {
    console.error('Error fetching card details:', error);
    toast.error(`Failed to load card details: ${error.message}`);
  }
};
  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5001/api/card/${id}`);
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

  const removeFile = (index) => {
    const file = selectedFiles[index];
    
    // If it's an existing attachment, track its ID for deletion
    if (file.isExisting && file._id) {
      setRemovedAttachments(prev => [...prev, file._id]);
    }
    
    // Remove from selectedFiles
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
    
    // Remove from formData.attachments if it exists there
    if (formData.attachments && formData.attachments.length > 0) {
      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.filter(att => {
          if (file._id && att._id) {
            return att._id.toString() !== file._id.toString();
          }
          return att.name !== file.name;
        })
      }));
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
                  accept="image/*"
                />

                
                <div className="mt-2 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex flex-col border rounded p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{file.name}</span>
                        <button 
                          type="button"
                          onClick={() => removeFile(index)}
                          className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                          title="Remove file"
                        >
                          ×
                        </button>
                      </div>
                      
                      {/* Show image preview for image files */}
                      {file.type?.startsWith('image/') && file.data && (
                  <div className="mt-2">
                    <img 
                      src={file.isExisting 
                        ? `data:${file.type};base64,${file.data}`
                        : URL.createObjectURL(new Blob([file], { type: file.type }))}
                      alt={file.name}
                      className="max-h-40 max-w-full border rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                )}                
                      {file.size && (
                        <div className="text-xs text-gray-400 mt-1">
                          {Math.round(file.size / 1024)} KB
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {selectedFiles.length === 0 && (
                    <div className="text-sm text-gray-500 italic">
                      No files attached
                    </div>
                  )}
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