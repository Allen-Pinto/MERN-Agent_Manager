import axios from 'axios';
import { getToken, logout } from '../utils/auth';

const API_BASE = 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 errors (logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) logout();
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data); 

// Agents
export const createAgent = (data) => api.post('/agents', data);
export const getAgents = () => api.get('/agents');
export const updateAgent = (id, data) => api.put(`/agents/${id}`, data);
export const deleteAgent = (id) => api.delete(`/agents/${id}`); // Simplified: Caller handles errors

// Leads
export const uploadLeads = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/leads/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getAllLeads = () => api.get('/leads');
export const getLeadsByAgent = (agentId) => api.get(`/leads/agent/${agentId}`);
