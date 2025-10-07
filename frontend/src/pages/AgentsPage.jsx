import React, { useState, useEffect } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import AgentList from '../components/Agents/AgentList';
import AgentForm from '../components/Agents/AgentForm';
import Button from '../components/common/Button';
import { getAgents, deleteAgent } from '../services/api';  // API functions
import { toast } from 'react-toastify';  // NEW: Direct import for toasts (matches your setup)

const AgentsPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch agents on load
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await getAgents();
      const fetchedAgents = Array.isArray(response.data?.agents) ? response.data.agents : [];
      setAgents(fetchedAgents);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      toast.error('Failed to load agents: ' + (error.response?.data?.message || 'Network error'));  // FIXED: Use toast.error
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete (called from AgentList)
  const handleDeleteAgent = async (id) => {
    try {
      const response = await deleteAgent(id);
      toast.success(response.message || 'Agent deleted successfully');  // FIXED: Use toast.success
      fetchAgents();  // Refresh list
    } catch (error) {
      console.error('Delete agent error:', error);
      const message = error.response?.data?.message || 'Failed to delete agent';
      toast.error(message);  // FIXED: Use toast.error (this was causing the runtime error)
    }
  };

  const handleAddAgent = async () => {
    if (formLoading) setFormLoading(false);
    toast.success('Agent added successfully');  // FIXED: Use toast.success
    fetchAgents();
    closeForm();
  };

  const handleEditAgent = async () => {
    if (formLoading) setFormLoading(false);
    toast.success('Agent updated successfully');  // FIXED: Use toast.success
    fetchAgents();
    closeForm();
  };

  const openForm = (agent = null) => {
    setEditingAgent(agent);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingAgent(null);
    setFormLoading(false);
  };

  const handleFormSuccess = () => {
    if (editingAgent) {
      handleEditAgent();
    } else {
      handleAddAgent();
    }
  };

  const handleFormCancel = () => {
    closeForm();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-secondary">Loading agents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-textDark">Agents Management</h1>
        <Button
          onClick={() => openForm()}
          leftIcon={<FiPlus className="w-4 h-4" />}
          className="bg-primary text-white hover:bg-primary/90"
        >
          Add Agent
        </Button>
      </div>

      <AgentList
        agents={agents}
        loading={loading}
        onEdit={openForm}
        onDelete={handleDeleteAgent}  // Pass delete handler
      />

      {showForm && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={closeForm}
        >
          <div 
            className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto z-50"
            onClick={(e) => e.stopPropagation()}  // Prevent close on inside clicks
          >
            <div className="flex items-center justify-between p-6 border-b border-borderLight sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-textDark">
                {editingAgent ? 'Edit Agent' : 'Add Agent'}
              </h3>
              <button 
                onClick={closeForm}
                className="p-2 text-secondary hover:text-primary rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <AgentForm
                agent={editingAgent}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
                loading={formLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsPage;
