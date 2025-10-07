const express = require('express');
const {
  createAgent,
  getAllAgents,
  getAgentById,
  updateAgent,
  deleteAgent
} = require('../controllers/agentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();


router.route('/')
  .post(protect, createAgent)
  .get(protect, getAllAgents);

router.route('/:id')
  .get(protect, getAgentById)
  .put(protect, updateAgent)
  .delete(protect, deleteAgent);

module.exports = router;