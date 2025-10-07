const Agent = require('../models/Agent');
const bcrypt = require('bcryptjs');

const createAgent = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const agentExists = await Agent.findOne({ 
      email, 
      owner: req.user.id 
    });

    if (agentExists) {
      return res.status(400).json({ message: 'Agent with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create agent with owner
    const agent = await Agent.create({
      name,
      email,
      mobile,
      password: hashedPassword,
      owner: req.user.id  // ← Assign logged-in user as owner
    });

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        mobile: agent.mobile,
        assignedLeadsCount: agent.assignedLeadsCount
      }
    });

  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ message: 'Server error while creating agent' });
  }
};

const getAllAgents = async (req, res) => {
  try {
    // Only fetch agents owned by logged-in user
    const agents = await Agent.find({ owner: req.user.id }).select('-password');

    res.status(200).json({
      success: true,
      count: agents.length,
      agents
    });

  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Server error while fetching agents' });
  }
};

const getAgentById = async (req, res) => {
  try {
    // Only fetch if agent belongs to logged-in user
    const agent = await Agent.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).select('-password');

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.status(200).json({
      success: true,
      agent
    });

  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ message: 'Server error while fetching agent' });
  }
};

const updateAgent = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Only update if agent belongs to logged-in user
    const agent = await Agent.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    if (name) agent.name = name;
    if (email) agent.email = email;
    if (mobile) agent.mobile = mobile;
    if (password) {
      agent.password = await bcrypt.hash(password, 10);
    }

    await agent.save();

    res.status(200).json({
      success: true,
      message: 'Agent updated successfully',
      agent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        mobile: agent.mobile
      }
    });

  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ message: 'Server error while updating agent' });
  }
};

const deleteAgent = async (req, res) => {
  try {
    // Only delete if agent belongs to logged-in user
    const agent = await Agent.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    await agent.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Agent deleted successfully'
    });

  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ message: 'Server error while deleting agent' });
  }
};

module.exports = {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent
};