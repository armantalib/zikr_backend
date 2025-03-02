require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
const logger = require('./startup/logger'); // Adjust the path as needed
const lang2 = require('./routes/lang2.json');
const { default: axios } = require('axios');


const admin = require("firebase-admin");

const config = {
  "type": process.env.TYPE,
  "project_id":process.env.PROJECTID,
  "private_key_id": process.env.PRIVATE_KEY_ID,
  "private_key":process.env.PRIVATE_KEY,
  "client_email":process.env.CLIENT_EMAIL,
  "client_id": process.env.CLIENTID,
  "auth_uri": process.env.AUTH_URI,
  "token_uri": process.env.TOKEN_URL,
  "auth_provider_x509_cert_url":process.env.AUTHPROVIDER,
  "client_x509_cert_url": process.env.CLIENT_CERT,
  "universe_domain": process.env.DOMAIN
  };
  
  admin.initializeApp({
    credential: admin.credential.cert(config),
    storageBucket: "gs://zikr_bucket"
  });
  
  app.use(cors());

require('./startup/config')();
require('./startup/logging')();
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/validation')();
require('./startup/cron')();

// Middleware to parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/privacy_policy', function(req, res){
  res.sendFile(__dirname + '/privacy_policy.html');
});
// Route to handle the POST request
app.post('/newredirect/callback', async(req, res) => {
    try {
        const response = JSON.parse(req.body.Response);        
        res.send(response);
    } catch (error) {   
        logger.error(error)
        res.status(400).send({ success: false, message: lang2["error"]  });
    }
});

// Route to handle the POST request
app.post('/payment', async(req, res) => {
    try {
        const { SpiToken }=req.body
        const payload = JSON.stringify(SpiToken);

        const result= await axios.post('https://staging.ptranz.com/api/spi/payment', payload, {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
          },
        })    
        
        res.send({ success: true, result:result.data });
    } catch (error) {   
        res.status(400).send({ success: false, message: lang2["error"]  });
    }
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => logger.info(`Listening on port ${port}...`));

require('./startup/sockets')(server, app);

module.exports = server;