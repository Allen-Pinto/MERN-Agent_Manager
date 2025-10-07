import React, { useState, useEffect } from 'react';
import { getAllLeads, getAgents } from '../services/api';
import UploadForm from '../components/Leads/UploadForm';
import LeadsDisplay from '../components/Leads/LeadsDisplay';
import { toast } from 'react-toastify';

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leadsRes, agentsRes] = await Promise.all([getAllLeads(), getAgents()]);
      setLeads(leadsRes.data.leads);
      setAgents(agentsRes.data.agents);
    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    fetchData();
  };

  const handleLeadDeleted = async () => {
    await fetchData(); // Refresh the leads after deletion
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgLight p-8">
        <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
          <div className="text-secondary">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgLight p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-textDark">Upload & Distribute Leads</h1>
          <p className="text-secondary">Upload a CSV/XLSX file to distribute leads equally among agents.</p>
        </div>
        <UploadForm onUploadSuccess={handleUploadSuccess} />
        <LeadsDisplay leads={leads} agents={agents} onLeadDeleted={handleLeadDeleted} />
      </div>
    </div>
  );
};

export default LeadsPage;