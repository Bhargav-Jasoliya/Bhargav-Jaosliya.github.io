const mongoose = require('mongoose');
const Document = require('./models/document'); // Import your Document model
const User = require('./models/user'); // Import your User model

async function getDocumentsToPublishToday() {
    try {
        // Get current date in Indian time zone
        const currentDateIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        const currentDateISTObj = new Date(currentDateIST);
        const currentDateISTFormatted = currentDateISTObj.toISOString().split('T')[0]; // Extract date in YYYY-MM-DD format

        // Find documents scheduled to go live today
        const upcomingDocuments = await Document.find({
            status: 'Scheduled',
            schedule: { $gte: new Date(currentDateISTFormatted), $lt: new Date(`${currentDateISTFormatted}T23:59:59`) }
        }).select('createdBy title');

        // Get the IDs of users who created these documents
        const createdByIds = upcomingDocuments.map(doc => doc.createdBy);

        // Find the users corresponding to these IDs to get their email addresses
        const users = await User.find({ _id: { $in: createdByIds } }).select('email');

        // Create an array of objects containing email and title
        const emailsAndTitles = upcomingDocuments.map(doc => {
            const user = users.find(user => user._id.equals(doc.createdBy));
            return {
                email: user ? user.email : '', // If user is found, get email, otherwise set to empty string
                title: doc.title
            };
        });

        return emailsAndTitles;
    } catch (error) {
        console.error('Error retrieving documents:', error);
        throw error;
    }
}

module.exports = { getDocumentsToPublishToday };