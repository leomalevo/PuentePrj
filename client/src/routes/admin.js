const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/adminController');

// Get all users (admin only)
router.get('/users', auth, isAdmin, getAllUsers);

// Update user role (admin only)
router.put('/users/:id', auth, isAdmin, updateUserRole);

// Delete user (admin only)
router.delete('/users/:id', auth, isAdmin, deleteUser);

module.exports = router; 