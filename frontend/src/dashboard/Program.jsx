import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Sidebar from "../components/Sidebar";
import Navbar from '../components/Navbar';
import DeleteConfirmation from '../components/DeleteConfirmation';

const Program = () => {
  const [formData, setFormData] = useState({});
  const [programList, setProgramList] = useState([]);
  const [user, setUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();

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
    fetchPrograms();
  }, [navigate]);

  const fetchPrograms = async () => {
    const response = await axios.get('http://localhost:5001/api/program');
    setProgramList(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
  
    const dataToSend = { ...formData, createdById: user.id };
  
    if (formData.id) {
      await axios.put(`http://localhost:5001/api/program/${formData.id}`, dataToSend);
    } else {
      await axios.post('http://localhost:5001/api/program', dataToSend);
    }
    fetchPrograms();
    setFormData({});
  };

  const handleEdit = (item) => {
    setFormData({ ...item, id: item.mysqlId || item.id });
  };

  const handleDeleteClick = (id) => {
    if (!user) return;
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5001/api/program/${itemToDelete}`, {
        data: { userId: user.id }
      });
      fetchPrograms();
    } catch (error) {
      console.error("Error deleting program:", error);
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 mb-[2rem]">
        <div className="p-6 flex-1 bg-gray-100 dark:bg-gray-800">
          <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
              <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Program Management</h1>
              
              <form onSubmit={handleSubmit} className="mb-6 space-y-4">
                <input
                  type="text"
                  placeholder="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <input
                  type="text"
                  placeholder="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border p-3 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold text-lg">
                  {formData.id ? 'Përditëso' : 'Shto'}
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse shadow-md rounded-md bg-white">
                  <thead>
                    <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-left">Title</th>
                      <th className="py-3 px-6 text-left">Description</th>
                      <th className="py-3 px-6 text-left">Created By</th>
                      <th className="py-3 px-6 text-left">Created At</th>
                      <th className="py-3 px-6 text-center">Veprime</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 text-sm font-light">
                    {programList.length > 0 ? (
                      programList.map((item) => (
                        <tr key={item.mysqlId || item.id} className="border-b border-gray-200 hover:bg-gray-100">
                          <td className="py-3 px-6 text-left">
                            <Link 
                              to={`/programs/${item.mysqlId || item.id}`}
                              className="text-blue-500 hover:underline"
                            >
                              {item.title}
                            </Link>
                          </td>
                          <td className="py-3 px-6 text-left">{item.description}</td>
                          <td className="py-3 px-6 text-left">
                            {item.createdById?.name || 'N/A'}
                          </td>
                          <td className="py-3 px-6 text-left">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-6 flex justify-center space-x-2">
                            <button 
                              onClick={() => handleEdit(item)} 
                              className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-md text-sm"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(item.mysqlId || item.id)} 
                              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-gray-500 py-4">Nuk ka të dhëna</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmation 
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={
          programList.find(item => (item.mysqlId || item.id) === itemToDelete)?.title || "this program"
        }
      />
    </div>
  );
};

export default Program;