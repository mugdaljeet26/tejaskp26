const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @route GET /api/employees  (admin)
const getAllEmployees = asyncHandler(async (req, res) => {
    const employees = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, employees });
});

// @route POST /api/employees  (admin)
const addEmployee = asyncHandler(async (req, res) => {
    const { fullName, email, password, dept, phone, parentPhone, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) { res.status(400); throw new Error('Employee already exists'); }
    const user = await User.create({ fullName, email, password, dept, phone, parentPhone, role });
    res.status(201).json({ success: true, user });
});

// @route PUT /api/employees/:id  (admin)
const updateEmployee = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('Employee not found'); }
    const { fullName, email, dept, phone, parentPhone, role, isActive } = req.body;
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.dept = dept || user.dept;
    user.phone = phone !== undefined ? phone : user.phone;
    user.parentPhone = parentPhone !== undefined ? parentPhone : user.parentPhone;
    user.role = role || user.role;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();
    res.json({ success: true, user });
});

// @route DELETE /api/employees/:id  (admin)
const deleteEmployee = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('Employee not found'); }
    await user.deleteOne();
    res.json({ success: true, message: 'Employee removed' });
});

// @route PUT /api/employees/profile  (self)
const updateMyProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const { fullName, phone, dept, photo } = req.body;
    user.fullName = fullName || user.fullName;
    user.phone = phone || user.phone;
    user.dept = dept || user.dept;
    if (photo) user.photo = photo;
    if (req.body.password) user.password = req.body.password;
    const updated = await user.save();
    res.json({ success: true, user: { _id: updated._id, fullName: updated.fullName, email: updated.email, empId: updated.empId, dept: updated.dept, role: updated.role, photo: updated.photo } });
});

module.exports = { getAllEmployees, addEmployee, updateEmployee, deleteEmployee, updateMyProfile };
