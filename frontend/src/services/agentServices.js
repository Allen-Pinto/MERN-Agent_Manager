import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://mern-agent-manager-5pvw.onrender.com/api';

export const createAgent = async (agentData) => {
  const response = await axios.post(`${API_BASE_URL}/agents`, agentData);
  return response.data;
};

export const updateAgent = async (agentId, agentData) => {
  const response = await axios.put(`${API_BASE_URL}/agents/${agentId}`, agentData);
  return response.data;
};
