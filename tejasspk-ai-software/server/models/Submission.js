const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    empName: {
        type: String,
        required: true
    },
    empId: {
        type: String,
        required: true
    },
    pdfFile: {
        type: String,
        required: [true, 'PDF file is required']
    },
    pdfFileName: {
        type: String,
        required: true
    },
    weekEnding: {
        type: Date,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
