const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// POST create new user
router.post('/', [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('age').isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, age } = req.body;
    const user = new User({ name, age });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// PUT update user
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
  body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, age } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, age },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// POST bulk sync users from local storage to MongoDB
router.post('/sync/bulk', async (req, res) => {
  try {
    const { users } = req.body;
    
    if (!Array.isArray(users)) {
      return res.status(400).json({ message: 'Users must be an array' });
    }

    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (const userData of users) {
      try {
        const { id, name, age, createdAt, updatedAt } = userData;
        
        // Check if user exists in MongoDB by sync_id
        const existingUser = await User.findOne({ sync_id: id });
        
        if (existingUser) {
          // Update existing user
          await User.findByIdAndUpdate(existingUser._id, { 
            name, 
            age, 
            updatedAt: new Date(updatedAt),
            sync_version: (existingUser.sync_version || 1) + 1
          });
          results.updated++;
        } else {
          // Also check if user exists by name and age (to prevent duplicates from different sources)
          const duplicateByName = await User.findOne({ 
            name: name, 
            age: age,
            $or: [
              { sync_id: { $exists: false } },
              { sync_id: null }
            ]
          });
          
          if (duplicateByName) {
            // Update the existing user with sync_id instead of creating new one
            await User.findByIdAndUpdate(duplicateByName._id, {
              sync_id: id,
              updatedAt: new Date(updatedAt),
              sync_version: 1
            });
            results.updated++;
            console.log(`Updated existing user ${name} with sync_id ${id}`);
          } else {
            // Create new user with sync_id
            const newUser = new User({
              name,
              age,
              sync_id: id,
              createdAt: new Date(createdAt),
              updatedAt: new Date(updatedAt),
              sync_version: 1
            });
            await newUser.save();
            results.created++;
          }
        }
      } catch (error) {
        results.errors.push({
          userId: userData.id,
          error: error.message
        });
      }
    }

    res.json({
      message: 'Bulk sync completed',
      results
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error during bulk sync', 
      error: error.message 
    });
  }
});

// POST cleanup duplicates
router.post('/sync/cleanup', async (req, res) => {
  try {
    console.log('Starting duplicate cleanup...');
    
    // Get all users
    const allUsers = await User.find();
    const duplicates = [];
    const toDelete = [];
    
    // Group users by name and age to find duplicates
    const userGroups = {};
    allUsers.forEach(user => {
      const key = `${user.name}_${user.age}`;
      if (!userGroups[key]) {
        userGroups[key] = [];
      }
      userGroups[key].push(user);
    });
    
    // Find duplicates
    Object.values(userGroups).forEach(group => {
      if (group.length > 1) {
        duplicates.push(group);
        
        // Keep the oldest record (lowest _id or earliest createdAt)
        const sorted = group.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const toKeep = sorted[0];
        const toRemove = sorted.slice(1);
        
        toRemove.forEach(user => {
          toDelete.push(user._id);
        });
        
        console.log(`Found ${group.length} duplicates for ${group[0].name}, keeping oldest, removing ${toRemove.length}`);
      }
    });
    
    // Delete duplicates
    let deletedCount = 0;
    if (toDelete.length > 0) {
      const result = await User.deleteMany({ _id: { $in: toDelete } });
      deletedCount = result.deletedCount;
    }
    
    res.json({
      message: 'Duplicate cleanup completed',
      duplicatesFound: duplicates.length,
      recordsDeleted: deletedCount,
      duplicateGroups: duplicates.map(group => ({
        name: group[0].name,
        age: group[0].age,
        count: group.length
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error during cleanup', 
      error: error.message 
    });
  }
});

// GET sync status
router.get('/sync/status', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const lastUser = await User.findOne().sort({ updatedAt: -1 });
    
    res.json({
      mongoUserCount: userCount,
      lastSync: lastUser ? lastUser.updatedAt : new Date(),
      status: 'MongoDB connected'
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error getting sync status', 
      error: error.message,
      status: 'MongoDB disconnected'
    });
  }
});

module.exports = router;
