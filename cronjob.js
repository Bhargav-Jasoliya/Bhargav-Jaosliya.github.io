const cron = require('node-cron');
const Document = require('./models/document');

// Define a cron job to run every minute
const cronJob = () => {
    
    cron.schedule('* * * * *', async () => {
    try {
        // Get current date and time in UTC
        const currentDateUTC = new Date();

        // Get documents scheduled to be live in the past or within the next minute
        const upcomingDocuments = await Document.find({
            status: 'Scheduled',
            schedule: { $lte: currentDateUTC }
        }) // Set the maximum execution time to 30 seconds (30000 milliseconds)
        console.log("Upcoming pages to be live:", upcomingDocuments);

        // Make upcoming documents live
        for (const doc of upcomingDocuments) {
            doc.status = 'Published';
            await doc.save();
            console.log(`Document "${doc.title}" is now live.`);
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    }
}, {
    scheduled: true,
    timezone: "UTC" // Set timezone to UTC
})}

module.exports = cronJob
