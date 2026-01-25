import axios from 'axios';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Settings API
export const settingsAPI = {
  // Get branding settings
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Create branding settings
  createSettings: async (settingsData) => {
    const response = await api.post('/settings', settingsData);
    return response.data;
  },

  // Update branding settings
  updateSettings: async (settingsData) => {
    const response = await api.put('/settings', settingsData);
    return response.data;
  },
};

// Templates API
export const templateAPI = {
  // Get all templates with optional pagination and filtering
  getTemplates: async (params = {}) => {
    const response = await api.get('/templates', { params });
    return response.data;
  },

  // Get a specific template by ID
  getTemplateById: async (id) => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  // Get default template
  getDefaultTemplate: async () => {
    const response = await api.get('/templates/default');
    return response.data;
  },

  // Create a new template
  createTemplate: async (templateData) => {
    const response = await api.post('/templates', templateData);
    return response.data;
  },

  // Update a template by ID
  updateTemplate: async (id, templateData) => {
    const response = await api.put(`/templates/${id}`, templateData);
    return response.data;
  },

  // Delete a template by ID
  deleteTemplate: async (id) => {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  },

  // Set template as default
  setDefaultTemplate: async (id) => {
    const response = await api.patch(`/templates/${id}/set-default`);
    return response.data;
  },
};

export default api;
