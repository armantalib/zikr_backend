const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Zikr App',
        description: 'Zikr App API'
    },
    // host: 'localhost:8080'
    host: 'https://zikr-backend.onrender.com'
};

const outputFile = './swagger-output.json';
const routes = ['./startup/routes.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);