import axios from 'axios';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
export const userAPI = {
  // Get all users with optional pagination and filtering
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Create a new user
  createUser: async (userData) => {
    const response = await api.post('/users/add-new-user', userData);
    return response.data;
  },

  // Update a user by ID
  updateUser: async (id, userData) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },
};

export default api;
