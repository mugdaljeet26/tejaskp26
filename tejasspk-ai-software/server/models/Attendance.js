const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    empId: { type: String, required: true },
    empName: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    checkIn: { type: Date, default: null },
    checkOut: { type: Date, default: null },
    totalHours: { type: String, default: null },
    status: { type: String, enum: ['Present', 'Late', 'Half Day', 'Absent', 'Leave'], default: 'Absent' },
    location: { type: String, default: 'N/A' },
}, { timestamps: true });

// Unique attendance per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
