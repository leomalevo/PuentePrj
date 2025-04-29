const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/adminController');

// Get all users (admin only)
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

// Update user role (admin only)
router.put('/users/:id', authMiddleware, adminMiddleware, updateUserRole);

// Delete user (admin only)
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

module.exports = router; 