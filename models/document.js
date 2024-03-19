const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subtext: {
        type: String
    },
    body: {
        type: String
    },
    attachments: {
        type: String  // Assuming attachment URLs will be stored as strings
    },
    link: {
        type: String
    },
    author: {
        type: String
    },
    showAuthor: {
        type: Boolean,
        default: false
    },
    status: {
        type: String
    },
    schedule: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, // Assuming user ID will be stored as ObjectId
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastModifiedBy:{
        type: mongoose.Schema.Types.ObjectId,
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now
    }
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;