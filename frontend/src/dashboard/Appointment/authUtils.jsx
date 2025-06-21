// authUtils.js
import axios from "axios";

/**
 * Check user login status and fetch user details
 * @param {Function} navigate - React router navigate function
 * @param {Function} setCurrentUser - State setter for current user
 * @param {Function} setFormData - State setter for form data
 * @param {Function} setLoading - State setter for loading state
 * @returns {Promise<void>}
 */
export const checkLoginStatus = async (navigate, setCurrentUser, setFormData, setLoading) => {
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

      setFormData(prev => ({
        ...prev,
        userId: response.data.user.id
      }));
      setLoading(false);
    }
  } catch (error) {
    console.error('Error checking login status:', error);
    navigate('/login');
  }
};

/**
 * Filter specialists by appointment type
 * @param {string} type - Appointment type
 * @param {Array} specialists - List of all specialists
 * @param {Function} setFilteredSpecialists - State setter for filtered specialists
 * @returns {Array} - Filtered specialists
 */
export const filterSpecialistsByType = (type, specialists, setFilteredSpecialists) => {
  if (type === 'select') {
    setFilteredSpecialists([]);
    return [];
  }
  
  let filtered = specialists;
  
  switch (type) {
    case 'training':
      filtered = specialists.filter(spec => spec.roleId?.name === 'Trajner');
      break;
    case 'nutrition':
      filtered = specialists.filter(spec => spec.roleId?.name === 'Nutricionist');
      break;
    case 'therapy':
      filtered = specialists.filter(spec => spec.roleId?.name === 'Fizioterapeut');
      break;
    case 'mental_performance':
      filtered = specialists.filter(spec => spec.roleId?.name === 'Psikolog');
      break;
    default:
      filtered = specialists;
  }
  
  setFilteredSpecialists(filtered);
  return filtered;
};

/**
 * Search specialists by name, last name or role
 * @param {string} searchTerm - Search term
 * @param {string} type - Appointment type
 * @param {Array} specialists - List of all specialists
 * @returns {Array} - Filtered specialists by search term
 */
export const searchSpecialists = (searchTerm, type, specialists) => {
  let filtered = specialists;
  
  // First filter by type
  switch (type) {
    case 'training':
      filtered = specialists.filter(spec => spec.roleId?.name === 'Trajner');
      break;
    case 'nutrition':
      filtered = specialists.filter(spec => spec.roleId?.name === 'Nutricionist');
      break;
    case 'therapy':
      filtered = specialists.filter(spec => spec.roleId?.name === 'Fizioterapeut');
      break;
    case 'mental_performance':
      filtered = specialists.filter(spec => spec.roleId?.name === 'Psikolog');
      break;
    default:
      filtered = specialists;
  }
  
  // Then filter by search term
  return filtered.filter(spec => 
    `${spec.name} ${spec.lastName} ${spec.roleId?.name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
};