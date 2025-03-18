import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const createAgent = async (agentData: {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
}) => {
  const response = await api.post('/agents', agentData);
  return response.data;
};

export const getAgents = async () => {
  const response = await api.get('/agents');
  return response.data;
};

export const updateAgent = async (id: string, agentData: {
  name?: string;
  email?: string;
  mobileNumber?: string;
}) => {
  const response = await api.put(`/agents/${id}`, agentData);
  return response.data;
};

export const deleteAgent = async (id: string) => {
  const response = await api.delete(`/agents/${id}`);
  return response.data;
};

export const uploadCSV = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/lists/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getTaskDistribution = async () => {
  const response = await api.get('/lists/distribution');
  return response.data;
};

export default api; 