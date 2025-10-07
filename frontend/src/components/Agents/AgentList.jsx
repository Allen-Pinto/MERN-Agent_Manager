import React from 'react';
import { FiEdit3, FiTrash2, FiUser , FiPhone } from 'react-icons/fi';  // Icons
import Button from '../common/Button';  // Path from Agents/ to common/
import { toast } from 'react-toastify';  // NEW: Direct import for toasts (matches your setup)

const AgentList = ({ agents = [], loading = false, onEdit, onDelete }) => {
  const safeAgents = Array.isArray(agents) ? agents : [];

  const handleDelete = (agentId) => {
    if (!window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) return;
    if (onDelete) {
      onDelete(agentId);  // Call parent handler (API + toast + refresh)
    }
  };

  const handleEdit = (agent) => {
    if (onEdit) {
      onEdit(agent);  // Open edit modal
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-secondary">Loading agents...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Empty State */}
      {safeAgents.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg">
          <FiUser  className="w-12 h-12 text-secondary mb-4" />
          <h3 className="text-lg font-semibold text-textDark mb-2">No Agents Yet</h3>
          <p className="text-secondary mb-4">Add your first agent to get started.</p>
        </div>
      ) : (
        /* Agent Cards */
        safeAgents.map((agent) => (
          <div key={agent._id} className="bg-white rounded-lg shadow-md p-6 border border-borderLight hover:shadow-lg transition-shadow">
            {/* Header: Avatar + Name/Email */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <FiUser  className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-textDark">{agent.name}</h3>
                <p className="text-sm text-secondary">{agent.email}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              <p className="flex items-center text-sm">
                <FiPhone className="w-4 h-4 mr-2 text-secondary" />
                {agent.mobile || 'No phone number'}
              </p>
              {agent.createdAt && (
                <p className="text-xs text-secondary">
                  Joined: {new Date(agent.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Actions: Edit & Delete */}
            <div className="flex space-x-2 pt-4 border-t border-borderLight">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEdit(agent)}
                className="flex-1"
                leftIcon={<FiEdit3 className="w-4 h-4" />}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(agent._id)}
                className="flex-1"
                leftIcon={<FiTrash2 className="w-4 h-4" />}
              >
                Delete
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AgentList;
