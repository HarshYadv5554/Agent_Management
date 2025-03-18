const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const Agent = require('../models/Agent');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.'));
    }
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Upload CSV and distribute tasks
router.post('/upload', [auth, upload.single('file')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get all available agents
    const agents = await Agent.find();
    if (agents.length === 0) {
      return res.status(400).json({ message: 'No agents available to distribute tasks' });
    }

    const results = [];
    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    // Read file based on extension
    if (fileExtension === '.csv') {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => {
            // Validate required fields
            if (!data.firstName || !data.phone) {
              reject(new Error('CSV must contain firstName and phone columns'));
              return;
            }
            results.push(data);
          })
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      // For Excel files, you'll need to implement xlsx parsing
      // This is a placeholder for Excel file handling
      throw new Error('Excel file support coming soon');
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'No valid data found in the file' });
    }

    // Calculate distribution
    const totalItems = results.length;
    const itemsPerAgent = Math.floor(totalItems / agents.length);
    const remainingItems = totalItems % agents.length;

    // Distribute tasks
    let currentIndex = 0;
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const itemsForThisAgent = itemsPerAgent + (i < remainingItems ? 1 : 0);
      const agentTasks = results.slice(currentIndex, currentIndex + itemsForThisAgent);
      
      // Update agent's assigned tasks
      agent.assignedTasks = agentTasks;
      await agent.save();

      currentIndex += itemsForThisAgent;
    }

    // Delete the uploaded file after processing
    fs.unlinkSync(filePath);

    res.json({ 
      message: 'Tasks distributed successfully',
      distribution: agents.map(agent => ({
        agentName: agent.name,
        taskCount: agent.assignedTasks.length
      }))
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: error.message || 'Error processing file' });
  }
});

// Get task distribution statistics
router.get('/distribution', auth, async (req, res) => {
  try {
    const agents = await Agent.find().select('name assignedTasks');
    const distribution = agents.map(agent => ({
      agentName: agent.name,
      taskCount: agent.assignedTasks.length,
      tasks: agent.assignedTasks
    }));
    res.json(distribution);
  } catch (error) {
    console.error('Error fetching distribution:', error);
    res.status(500).json({ message: 'Error fetching task distribution' });
  }
});

module.exports = router; 