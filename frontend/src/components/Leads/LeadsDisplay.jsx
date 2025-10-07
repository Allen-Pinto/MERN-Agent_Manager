import React, { useState } from 'react';
import { FiPhone, FiMail, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

const LeadsDisplay = ({ leads, agents, onLeadDeleted }) => {
  const [deletingLeadId, setDeletingLeadId] = useState(null);
  const [deletingAgentId, setDeletingAgentId] = useState(null);

  const leadsByAgent = agents.map(agent => ({
    ...agent,
    leads: leads.filter(lead => lead.assignedTo._id === agent._id)
  })).filter(group => group.leads.length > 0);

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) {
      return;
    }

    setDeletingLeadId(leadId);
    
    try {
      const response = await fetch(`http://localhost:5002/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Lead deleted successfully');
        onLeadDeleted();
      } else {
        toast.error(data.message || 'Failed to delete lead');
      }
    } catch (error) {
      console.error('Delete lead error:', error);
      toast.error('Failed to delete lead');
    } finally {
      setDeletingLeadId(null);
    }
  };

  const handleDeleteAllLeadsForAgent = async (agentId, agentName, leadsCount) => {
    if (!window.confirm(`Are you sure you want to delete ALL ${leadsCount} leads for agent "${agentName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingAgentId(agentId);
    
    try {
      const leadsToDelete = leads.filter(lead => lead.assignedTo._id === agentId);
      
      // Delete all leads for this agent
      const deletePromises = leadsToDelete.map(lead =>
        fetch(`http://localhost:5002/api/leads/${lead._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
      );

      const results = await Promise.all(deletePromises);
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} lead(s)`);
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} lead(s)`);
      }
      
      onLeadDeleted();
    } catch (error) {
      console.error('Delete all leads error:', error);
      toast.error('Failed to delete leads');
    } finally {
      setDeletingAgentId(null);
    }
  };

  if (leadsByAgent.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg">No leads distributed yet.</p>
        <p className="text-gray-400 text-sm mt-2">Upload a file to start distributing leads to agents.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {leadsByAgent.map((group) => (
        <div key={group._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <span>Agent: {group.name}</span>
              <span className="text-sm bg-blue-500 text-white px-3 py-1 rounded-full">
                {group.leads.length} {group.leads.length === 1 ? 'lead' : 'leads'}
              </span>
            </h3>
            
            <button
              onClick={() => handleDeleteAllLeadsForAgent(group._id, group.name, group.leads.length)}
              disabled={deletingAgentId === group._id}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingAgentId === group._id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <FiTrash2 className="w-4 h-4" />
                  <span>Delete All Leads</span>
                </>
              )}
            </button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {group.leads.map((lead) => (
              <div 
                key={lead._id} 
                className="relative p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow space-y-2"
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteLead(lead._id)}
                  disabled={deletingLeadId === lead._id}
                  className="absolute top-2 right-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete lead"
                >
                  {deletingLeadId === lead._id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  ) : (
                    <FiTrash2 className="w-4 h-4" />
                  )}
                </button>

                {/* Lead Info */}
                <h4 className="font-medium text-gray-800 pr-8">{lead.name}</h4>
                
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <FiMail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{lead.email}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <FiPhone className="w-4 h-4 flex-shrink-0" />
                  <span>{lead.mobile}</span>
                </div>
                
                {lead.notes && (
                  <p className="text-gray-500 text-sm italic pt-2 border-t border-gray-100">
                    Notes: {lead.notes}
                  </p>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    lead.status === 'New' ? 'bg-blue-100 text-blue-700' :
                    lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-700' :
                    lead.status === 'Qualified' ? 'bg-green-100 text-green-700' :
                    lead.status === 'Converted' ? 'bg-purple-100 text-purple-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {lead.status}
                  </span>
                  
                  <span className="text-xs text-gray-400">
                    {lead.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeadsDisplay;