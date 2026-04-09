const express = require('express');
const { protect } = require('../middleware/auth');
const { authorizeStaff } = require('../middleware/role');
const { getUsers, deleteUser, getStats } = require('../controllers/userController');

const router = express.Router();

router.get('/', protect, authorizeStaff, getUsers);
router.get('/stats', protect, authorizeStaff, getStats);
router.delete('/:id', protect, authorizeStaff, deleteUser);

module.exports = router;

