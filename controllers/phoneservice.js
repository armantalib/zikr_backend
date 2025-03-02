const twilio = require('twilio');
const logger = require('../startup/logger'); // Adjust the path as needed

// Replace these with your actual Twilio credentials
// const accountSid = '';
// const authToken = '';
// const client = new twilio(accountSid, authToken);
const client ='';

exports.phoneservice = async (phone, code) => {
     client.messages
          .create({
               to: phone, // The recipient's phone number
               from: '+13343800944', // Your Twilio phone number
               body: 'Tu código de verificación de la aplicación trabajos24 es ' + code // The message body
          })
          .then(message => {
               logger.info('Message sent: ' + message.sid);
          })
          .catch(error => {
               logger.error('Error sending message: ', error);
          });
}

