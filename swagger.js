const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Zikr App',
        description: 'Zikr App API'
    },
    // securityDefinitions: {
    //     apiKeyAuth: {
    //       type: 'apiKey',
    //       in: 'header', // can be 'header', 'query' or 'cookie'
    //       name: 'x-auth-token', // name of the header, query parameter or cookie
    //       description: 'Some description...'
    //     }
    //   },
      schemes: [
        "https"
      ],
    // host: 'localhost:8080'
    host: 'api.zikr.ae'
    // host: 'zikr-backend.onrender.com'
};

const outputFile = './swagger-output.json';
const routes = ['./startup/routes.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);