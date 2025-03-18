const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');

// Validation middleware
const agentValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('mobileNumber')
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Please enter a valid mobile number with country code'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Get all agents
router.get('/', auth, async (req, res) => {
  try {
    const agents = await Agent.find().select('-password');
    res.json(agents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create agent
router.post('/', [auth, agentValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, mobileNumber, password } = req.body;

    // Check if agent exists
    let agent = await Agent.findOne({ email });
    if (agent) {
      return res.status(400).json({ message: 'Agent already exists' });
    }

    // Create new agent
    agent = new Agent({
      name,
      email,
      mobileNumber,
      password,
      assignedTasks: []
    });

    await agent.save();

    // Return agent without password
    const agentResponse = agent.toObject();
    delete agentResponse.password;

    res.status(201).json(agentResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update agent
router.put('/:id', [auth, agentValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, mobileNumber } = req.body;
    const agentId = req.params.id;

    // Check if agent exists
    let agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check if email is taken by another agent
    if (email !== agent.email) {
      const emailExists = await Agent.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update agent
    agent.name = name;
    agent.email = email;
    agent.mobileNumber = mobileNumber;

    await agent.save();

    // Return updated agent without password
    const agentResponse = agent.toObject();
    delete agentResponse.password;

    res.json(agentResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete agent
router.delete('/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    await agent.deleteOne();
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 