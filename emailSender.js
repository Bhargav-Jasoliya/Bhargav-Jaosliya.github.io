const nodemailer = require('nodemailer');

async function sendMail(emailTitleList) {
    try {
        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            // Configure your email service provider here
            service: 'gmail',
            auth: {
                user: 'bhargavjasoliya10@gmail.com',
                pass: 'thpu bkrr gyhu ojsa',
            }
        });

        // Iterate over the email and title list and send email for each entry
        for (const {email, title} of emailTitleList) {
            // Compose email message
            const mailOptions = {
                from: 'bhargav.jasoliya@rapidops.co',
                to: email,
                subject: 'Upcoming Page to Go Live Today',
                text: `Your page "${title}" is scheduled to go live today.`
            };

            // Send email (awaiting for each one to complete before sending the next)
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent:', info.response);
        }
    } catch (error) {
        console.error('Error in sending email:', error);
    }
}

module.exports = sendMail;
