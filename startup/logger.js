const winston = require('winston');

const logger = winston.createLogger({
     level: 'info', // Set the default log level
     format: winston.format.combine(
          winston.format.colorize(), // Add colors to console output (optional)
          winston.format.simple() // Use a simple log format (optional)
     ),
     transports: [
          new winston.transports.Console(), // Log to the console
          new winston.transports.File({ filename: 'logfile.log' }) // Log to a file (optional)
     ]
});

module.exports = logger;
