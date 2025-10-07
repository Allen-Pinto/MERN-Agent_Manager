const Lead = require('../models/Lead');
const Agent = require('../models/Agent');
const csv = require('csv-parser');
const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');

// ===== LOGGING UTILITY =====
const logger = {
  info: (message, data = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data);
  },
  error: (message, error = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, {
      message: error.message,
      stack: error.stack,
      ...error
    });
  },
  warn: (message, data = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data);
  },
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data);
    }
  }
};

// ===== FILE UPLOAD OPERATIONS =====

// @desc    Upload and distribute leads from file
// @route   POST /api/leads/upload
// @access  Private
const uploadAndDistributeLeads = async (req, res) => {
  const startTime = Date.now();
  let filePath = null;

  try {
    logger.info('Upload request received', {
      file: req.file ? req.file.originalname : 'No file',
      userId: req.user?.id
    });

    if (!req.file) {
      logger.warn('Upload attempt without file');
      return res.status(400).json({ 
        success: false,
        message: 'Please upload a file' 
      });
    }

    filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    logger.info('File details', {
      path: filePath,
      extension: fileExtension,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    let leads = [];

    if (fileExtension === '.csv') {
      logger.info('Parsing CSV file...');
      leads = await parseCSV(filePath);
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      logger.info('Parsing Excel file...');
      leads = await parseExcel(filePath);
    } else {
      logger.warn('Invalid file format attempted', { extension: fileExtension });
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid file format. Only CSV, XLSX, and XLS are allowed' 
      });
    }

    logger.info('File parsed', { 
      totalRowsParsed: leads.length,
      sampleLead: leads[0] || null
    });

    if (leads.length === 0) {
      logger.warn('No valid leads found in file', { filePath });
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        success: false,
        message: 'No valid leads found in file. Please check that your CSV has Name, Email, and Mobile columns.' 
      });
    }

    // ← FILTER AGENTS BY OWNER
    const agents = await Agent.find({ owner: req.user.id });
    logger.info('Agents fetched', { count: agents.length });

    if (agents.length === 0) {
      logger.warn('No agents available for distribution');
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        success: false,
        message: 'No agents available. Please create agents first' 
      });
    }

    // ← PASS USER ID TO DISTRIBUTION FUNCTION
    const distributedLeads = distributeLeadsEqually(leads, agents, req.user.id);
    logger.info('Leads distributed', {
      totalLeads: distributedLeads.length,
      agentCount: agents.length,
      leadsPerAgent: Math.floor(leads.length / agents.length)
    });

    const savedLeads = await Lead.insertMany(distributedLeads);
    logger.info('Leads saved to database', { count: savedLeads.length });

    // Update agent lead counts
    for (const agent of agents) {
      const count = distributedLeads.filter(
        lead => lead.assignedTo.toString() === agent._id.toString()
      ).length;
      
      if (count > 0) {
        agent.assignedLeadsCount += count;
        await agent.save();
        logger.debug('Agent lead count updated', { 
          agentId: agent._id, 
          agentName: agent.name,
          newCount: agent.assignedLeadsCount 
        });
      }
    }

    fs.unlinkSync(filePath);
    
    const duration = Date.now() - startTime;
    logger.info('Upload completed successfully', { 
      duration: `${duration}ms`,
      leadsCount: savedLeads.length 
    });

    res.status(201).json({
      success: true,
      message: `${savedLeads.length} leads uploaded and distributed successfully`,
      totalLeads: savedLeads.length,
      agentsCount: agents.length
    });

  } catch (error) {
    logger.error('Upload leads error', error);
    
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.debug('Cleaned up file after error', { filePath });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error while uploading leads',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function: Parse CSV file (FIXED VERSION)
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const leads = [];
    const skippedRows = [];
    let rowNumber = 0;
    let headers = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headerList) => {
        headers = headerList;
        logger.info('CSV Headers detected', { headers: headerList });
      })
      .on('data', (row) => {
        rowNumber++;
        
        // Log first row for debugging
        if (rowNumber === 1) {
          logger.debug('First CSV row sample', { row });
        }

        // Try multiple column name variations (case-insensitive)
        const name = row.Name || row.name || row.FirstName || row.firstName || 
                     row.FIRSTNAME || row.first_name || row['First Name'] || '';
        
        const email = row.Email || row.email || row.EMAIL || 
                      row['E-mail'] || row['E-Mail'] || '';
        
        const mobile = row.Mobile || row.mobile || row.Phone || row.phone || 
                       row.MOBILE || row.PHONE || row.Contact || row.contact ||
                       row['Phone Number'] || row['Mobile Number'] || '';
        
        const notes = row.Notes || row.notes || row.NOTES || 
                      row.Comments || row.comments || '';

        // Validate required fields (only name and mobile are required, email is optional)
        if (name.toString().trim() && mobile.toString().trim()) {
          leads.push({
            name: name.toString().trim(),
            email: email.toString().trim().toLowerCase() || `lead${Date.now()}${rowNumber}@placeholder.com`,
            mobile: mobile.toString().trim(),
            notes: notes.toString().trim(),
            source: 'File Upload'
          });
        } else {
          skippedRows.push({
            rowNumber,
            data: row,
            reason: 'Missing required field(s): Name and Mobile/Phone are required'
          });
        }
      })
      .on('end', () => {
        logger.info('CSV parsing complete', { 
          totalRows: rowNumber,
          validLeads: leads.length,
          skippedRows: skippedRows.length
        });
        
        if (skippedRows.length > 0 && skippedRows.length <= 5) {
          logger.warn('Some rows were skipped', { skippedRows });
        } else if (skippedRows.length > 5) {
          logger.warn(`${skippedRows.length} rows were skipped. First 5:`, { 
            skippedRows: skippedRows.slice(0, 5) 
          });
        }
        
        resolve(leads);
      })
      .on('error', (error) => {
        logger.error('CSV parsing error', error);
        reject(error);
      });
  });
};

// Helper function: Parse Excel file (ENHANCED VERSION)
const parseExcel = (filePath) => {
  try {
    logger.debug('Reading Excel file', { filePath });
    
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    logger.info('Excel sheet info', { 
      sheetName,
      totalSheets: workbook.SheetNames.length 
    });
    
    const data = xlsx.utils.sheet_to_json(sheet);
    logger.info('Excel rows extracted', { count: data.length });

    if (data.length > 0) {
      logger.debug('Excel headers sample', { 
        headers: Object.keys(data[0]) 
      });
      logger.debug('First row sample', { row: data[0] });
    }

    const leads = [];
    const skippedRows = [];

    data.forEach((row, index) => {
      // Try multiple column name variations
      const name = row.Name || row.name || row.FirstName || row.firstName || 
                   row.FIRSTNAME || row.first_name || row['First Name'] || '';
      
      const email = row.Email || row.email || row.EMAIL || 
                    row['E-mail'] || row['E-Mail'] || '';
      
      const mobile = row.Mobile || row.mobile || row.Phone || row.phone || 
                     row.MOBILE || row.PHONE || row.Contact || row.contact ||
                     row['Phone Number'] || row['Mobile Number'] || '';
      
      const notes = row.Notes || row.notes || row.NOTES || 
                    row.Comments || row.comments || '';

      if (name.toString().trim() && email.toString().trim() && mobile.toString().trim()) {
        leads.push({
          name: name.toString().trim(),
          email: email.toString().trim().toLowerCase(),
          mobile: mobile.toString().trim(),
          notes: notes.toString().trim(),
          source: 'File Upload'
        });
      } else {
        skippedRows.push({
          rowNumber: index + 2, // +2 because Excel rows start at 1 and we skip header
          data: row,
          reason: 'Missing required field(s)'
        });
      }
    });

    logger.info('Excel parsing complete', { 
      validLeads: leads.length,
      skippedRows: skippedRows.length
    });

    if (skippedRows.length > 0 && skippedRows.length <= 5) {
      logger.warn('Some rows were skipped', { skippedRows });
    }

    return leads;
  } catch (error) {
    logger.error('Excel parsing error', error);
    throw error;
  }
};

// Helper function: Distribute leads equally among agents
// ← UPDATED TO ACCEPT AND ASSIGN OWNER
const distributeLeadsEqually = (leads, agents, ownerId) => {
  const leadsPerAgent = Math.floor(leads.length / agents.length);
  const remainingLeads = leads.length % agents.length;

  logger.debug('Distribution calculation', {
    totalLeads: leads.length,
    totalAgents: agents.length,
    leadsPerAgent,
    remainingLeads
  });

  const distributedLeads = [];
  let leadIndex = 0;

  for (let i = 0; i < agents.length; i++) {
    const count = leadsPerAgent + (i < remainingLeads ? 1 : 0);

    for (let j = 0; j < count; j++) {
      if (leadIndex < leads.length) {
        distributedLeads.push({
          ...leads[leadIndex],
          status: 'New',
          assignedTo: agents[i]._id,
          owner: ownerId  // ← ADD OWNER
        });
        leadIndex++;
      }
    }
    
    logger.debug(`Agent ${agents[i].name} assigned ${count} leads`);
  }

  return distributedLeads;
};

// ===== MANUAL LEAD OPERATIONS (with logging) =====

const createLead = async (req, res) => {
  try {
    const { name, email, mobile, status, assignedTo, notes } = req.body;

    logger.info('Creating lead', { name, email, mobile, assignedTo });

    if (!name || !email || !mobile || !status || !assignedTo) {
      logger.warn('Create lead validation failed', req.body);
      return res.status(400).json({ 
        success: false,
        message: 'Please provide name, email, mobile, status, and assignedTo' 
      });
    }

    // ← CHECK AGENT BELONGS TO USER
    const agent = await Agent.findOne({
      _id: assignedTo,
      owner: req.user.id
    });

    if (!agent) {
      logger.warn('Agent not found or not owned by user', { assignedTo });
      return res.status(400).json({
        success: false,
        message: 'Assigned agent not found'
      });
    }

    // ← CREATE LEAD WITH OWNER
    const lead = await Lead.create({
      name,
      email,
      mobile,
      status,
      assignedTo,
      notes: notes || '',
      source: 'Manual',
      owner: req.user.id  // ← ADD OWNER
    });

    await Agent.findByIdAndUpdate(assignedTo, {
      $inc: { assignedLeadsCount: 1 }
    });

    const populatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email mobile');

    logger.info('Lead created successfully', { leadId: lead._id });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      lead: populatedLead
    });

  } catch (error) {
    logger.error('Create lead error', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating lead'
    });
  }
};

const getAllLeads = async (req, res) => {
  try {
    // ← FILTER BY OWNER
    const leads = await Lead.find({ owner: req.user.id })
      .populate('assignedTo', 'name email mobile')
      .sort({ createdAt: -1 });

    logger.info('Fetched all leads', { count: leads.length });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads
    });

  } catch (error) {
    logger.error('Get leads error', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leads'
    });
  }
};

const getLead = async (req, res) => {
  try {
    // ← FILTER BY OWNER
    const lead = await Lead.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('assignedTo', 'name email mobile');

    if (!lead) {
      logger.warn('Lead not found', { id: req.params.id });
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      lead
    });

  } catch (error) {
    logger.error('Get lead error', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lead'
    });
  }
};

const updateLead = async (req, res) => {
  try {
    const { name, email, mobile, status, assignedTo, notes } = req.body;

    // ← FILTER BY OWNER
    const lead = await Lead.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!lead) {
      logger.warn('Update attempted on non-existent lead', { id: req.params.id });
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const previousAgent = lead.assignedTo;

    if (name) lead.name = name;
    if (email) lead.email = email;
    if (mobile) lead.mobile = mobile;
    if (status) lead.status = status;
    if (notes !== undefined) lead.notes = notes;
    
    if (assignedTo && assignedTo !== lead.assignedTo.toString()) {
      // ← CHECK AGENT BELONGS TO USER
      const agent = await Agent.findOne({
        _id: assignedTo,
        owner: req.user.id
      });

      if (!agent) {
        return res.status(400).json({
          success: false,
          message: 'Assigned agent not found'
        });
      }
      lead.assignedTo = assignedTo;
    }

    await lead.save();

    if (previousAgent?.toString() !== lead.assignedTo?.toString()) {
      if (previousAgent) {
        await Agent.findByIdAndUpdate(previousAgent, {
          $inc: { assignedLeadsCount: -1 }
        });
      }
      
      if (lead.assignedTo) {
        await Agent.findByIdAndUpdate(lead.assignedTo, {
          $inc: { assignedLeadsCount: 1 }
        });
      }
      
      logger.info('Lead reassigned', { 
        leadId: lead._id,
        from: previousAgent,
        to: lead.assignedTo 
      });
    }

    const populatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email mobile');

    logger.info('Lead updated', { leadId: lead._id });

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      lead: populatedLead
    });

  } catch (error) {
    logger.error('Update lead error', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating lead'
    });
  }
};

const deleteLead = async (req, res) => {
  try {
    // ← FILTER BY OWNER
    const lead = await Lead.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!lead) {
      logger.warn('Delete attempted on non-existent lead', { id: req.params.id });
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    if (lead.assignedTo) {
      await Agent.findByIdAndUpdate(lead.assignedTo, {
        $inc: { assignedLeadsCount: -1 }
      });
    }

    await lead.deleteOne();

    logger.info('Lead deleted', { leadId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully'
    });

  } catch (error) {
    logger.error('Delete lead error', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting lead'
    });
  }
};

const getLeadsByAgent = async (req, res) => {
  try {
    // ← FILTER BY OWNER
    const leads = await Lead.find({ 
      assignedTo: req.params.agentId,
      owner: req.user.id
    })
      .populate('assignedTo', 'name email mobile')
      .sort({ createdAt: -1 });

    logger.info('Fetched leads by agent', { 
      agentId: req.params.agentId,
      count: leads.length 
    });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads
    });

  } catch (error) {
    logger.error('Get leads by agent error', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leads'
    });
  }
};

module.exports = {
  createLead,
  getAllLeads,
  getLead,
  updateLead,
  deleteLead,
  getLeadsByAgent,
  uploadAndDistributeLeads
};