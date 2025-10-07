const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  // Manual lead operations
  createLead,
  getAllLeads,
  getLead,
  updateLead,
  deleteLead,
  getLeadsByAgent,
  
  // File upload operations
  uploadAndDistributeLeads
} = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV, XLSX, and XLS files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ===== MANUAL LEAD ROUTES =====
router.route('/')
  .post(protect, createLead)       // Create single lead manually
  .get(protect, getAllLeads);      // Get all leads

router.route('/:id')
  .get(protect, getLead)           // Get single lead
  .put(protect, updateLead)        // Update lead
  .delete(protect, deleteLead);    // Delete lead

// ===== FILE UPLOAD ROUTES =====
router.post('/upload', protect, upload.single('file'), uploadAndDistributeLeads);

// ===== AGENT-SPECIFIC ROUTES =====
router.get('/agent/:agentId', protect, getLeadsByAgent);

module.exports = router;