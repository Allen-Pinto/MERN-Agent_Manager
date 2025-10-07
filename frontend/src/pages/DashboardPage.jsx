import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAgents, getAllLeads } from '../services/api';
import Toast from '../components/common/Toast';
import { FiUsers, FiUpload, FiBarChart2 } from 'react-icons/fi';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const DashboardPage = () => {
  const [stats, setStats] = useState({ agents: 0, leads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [agentsRes, leadsRes] = await Promise.all([getAgents(), getAllLeads()]);
      setStats({
        agents: agentsRes.data.count || 0,
        leads: leadsRes.data.count || 0,
      });
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
        <div className="text-secondary">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-textDark">Welcome to Agent Manager</h1>
        <p className="text-secondary">Monitor your agents and leads distribution here.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-borderLight space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary rounded-lg">
              <FiUsers className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-secondary text-sm">Total Agents</p>
              <p className="text-2xl font-bold text-textDark">{stats.agents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-borderLight space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <FiUpload className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-secondary text-sm">Total Leads</p>
              <p className="text-2xl font-bold text-textDark">{stats.leads}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-borderLight space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FiBarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-secondary text-sm">Avg. Leads per Agent</p>
              <p className="text-2xl font-bold text-textDark">
                {stats.agents > 0 ? Math.round(stats.leads / stats.agents) : 0}
              </p>
            </div>
          </div>
        </div>
        {/* Placeholder for future stat */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-borderLight space-y-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <FiBarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-secondary text-sm">Pending Tasks</p>
              <p className="text-2xl font-bold text-textDark">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-borderLight">
        <h2 className="text-xl font-semibold text-textDark mb-6">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link to="/agents">
            <Button className="w-full flex items-center justify-center space-x-2">
              <FiUsers />
              <span>Manage Agents</span>
            </Button>
          </Link>
          <Link to="/leads">
            <Button className="w-full flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600">
              <FiUpload />
              <span>Upload Leads</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
