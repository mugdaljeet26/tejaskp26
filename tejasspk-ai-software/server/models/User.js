const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    empId: { type: String, unique: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    phone: { type: String, default: '' },
    parentPhone: { type: String, default: '' },
    dept: { type: String, enum: ['ai-ml','web-development','ai-research','engineering','data-science','product','design'], default: 'engineering' },
    role: { type: String, enum: ['employee', 'admin'], default: 'employee' },
    photo: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Auto-generate Employee ID
userSchema.pre('save', async function (next) {
    if (!this.empId) {
        this.empId = 'TSPK-' + Math.floor(1000 + Math.random() * 9000);
    }
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
