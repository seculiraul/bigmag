const nodemailer = require('nodemailer');


const sendEmail = async options => {

    //1 Create transporter

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    
    //2. Define Email options

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        subject: options.subject,
        to: options.email,
        text: options.message
    };

    //3. Send email with node mailer

    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;