const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    to: {
        type: String, // email address or 'all'
        required: true,
        default: 'all'
    },
    subject: {
        type: String,
        required: [true, 'Subject is required']
    },
    message: {
        type: String,
        required: [true, 'Message body is required']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
