const nodemailer = require('nodemailer');
const logger = require('../startup/logger'); // Adjust the path as needed

exports.sendEmail = async (email,code) => {
     // Create a Nodemailer transporter object
     const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
               user: 'myapp1jb@gmail.com',
               pass: 'xjrq yvbc hmbi znik',
          },
     });

     // Email data
     const mailOptions = {
          from: 'myapp1jb@gmail.com',
          to: email, // Replace with the recipient's email address
          subject: "Verification code", // Subject line
          text: "Your Zikr app otp code is " + code, // Plain text body
     };

     // Send the email
     transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
               logger.error('Error sending email: ', error);
          } else {
               logger.info('Email sent: ' + info.response);
          }
     });
}
