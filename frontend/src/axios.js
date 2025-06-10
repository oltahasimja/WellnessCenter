import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshRes = await axios.post('http://localhost:5001/refresh', {}, {
          withCredentials: true,
        });

        if (refreshRes.status === 200) {
          return api(originalRequest); 
        }
      } catch (refreshErr) {
        console.error("Refresh token error:", refreshErr);
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
