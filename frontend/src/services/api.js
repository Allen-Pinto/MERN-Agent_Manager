import axios from 'axios';
import { getToken, logout } from '../utils/auth';

const API_BASE = 'https://mern-agent-manager-5pvw.onrender.com/api';

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Include cookies for auth
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 errors globally (auto logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) { 
      logout();
    }
    return Promise.reject(error);
  }
);

// ===== AUTH =====

// Login
export const login = (data) => 
  api.post('/auth/login', data).catch((err) => {
    throw err.response?.data || err;
  });

// Register
export const register = (data) => 
  api.post('/auth/register', data).catch((err) => {
    throw err.response?.data || err;
  });

// ===== AGENTS =====
export const createAgent = (data) => 
  api.post('/agents', data).catch((err) => { throw err.response?.data || err; });

export const getAgents = () => 
  api.get('/agents').catch((err) => { throw err.response?.data || err; });

export const updateAgent = (id, data) => 
  api.put(`/agents/${id}`, data).catch((err) => { throw err.response?.data || err; });

export const deleteAgent = (id) => 
  api.delete(`/agents/${id}`).catch((err) => { throw err.response?.data || err; });

// ===== LEADS =====
export const uploadLeads = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/leads/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).catch((err) => { throw err.response?.data || err; });
};

export const getAllLeads = () => 
  api.get('/leads').catch((err) => { throw err.response?.data || err; });

export const getLeadsByAgent = (agentId) => 
  api.get(`/leads/agent/${agentId}`).catch((err) => { throw err.response?.data || err; });

