const express = require('express');
const router = express.Router();
const { getAllEmployees, addEmployee, updateEmployee, deleteEmployee, updateMyProfile } = require('../controllers/employeeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, getAllEmployees);
router.post('/', protect, adminOnly, addEmployee);
router.put('/profile', protect, updateMyProfile);
router.put('/:id', protect, adminOnly, updateEmployee);
router.delete('/:id', protect, adminOnly, deleteEmployee);

module.exports = router;
