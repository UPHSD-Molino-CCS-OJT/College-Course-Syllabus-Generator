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

// Syllabus API
export const syllabusAPI = {
  // Get all syllabi with optional pagination and filtering
  getSyllabi: async (params = {}) => {
    const response = await api.get('/syllabi', { params });
    return response.data;
  },

  // Get a specific syllabus by ID
  getSyllabusById: async (id) => {
    const response = await api.get(`/syllabi/${id}`);
    return response.data;
  },

  // Create a new syllabus
  createSyllabus: async (syllabusData) => {
    const response = await api.post('/syllabi', syllabusData);
    return response.data;
  },

  // Update a syllabus by ID
  updateSyllabus: async (id, syllabusData) => {
    const response = await api.patch(`/syllabi/${id}`, syllabusData);
    return response.data;
  },

  // Delete a syllabus by ID
  deleteSyllabus: async (id) => {
    const response = await api.delete(`/syllabi/${id}`);
    return response.data;
  },

  // Get syllabi by semester and year
  getSyllabusBySemester: async (semester, year) => {
    const response = await api.get(`/syllabi/semester/${semester}/${year}`);
    return response.data;
  },
};

export default api;
