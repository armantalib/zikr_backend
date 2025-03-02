const express = require('express');
const error = require('../middleware/error');
const auth = require('../routes/auth');
const users = require('../routes/users');
const authMiddleWare = require('../middleware/auth');
const messageRoutes = require('../routes/messageRoutes');
const notificationRoute = require('../routes/notificationRoute');
const walletRoute = require('../routes/walletRoute');
const bookSessionRoute = require('../routes/bookSessionRoute');
const ratingRoutes = require('../routes/ratingRoutes');
const generalRoute = require('../routes/generalRoute');




// const uploadImages = require('../routes/uploadImages');

// const trainingRoute = require('../routes/trainingRoute');
// const gigRoute = require('../routes/gigRoute');
// const offerRoute = require('../routes/offerRoute');
// const requestRoute = require('../routes/requestRoute');
// const applicationRoute = require('../routes/applicationRoute');
const uploadImages = require('../routes/uploadImages');
// const catRoute = require('../routes/catRoute');
// const supportRoute = require('../routes/supportRoute');
// const payment = require('../routes/PayRoute');

module.exports = function (app) {
  app.use(express.json());
  app.use('/api/auth', auth);
  app.use('/api/users', users);
  app.use('/api/msg', messageRoutes);
  app.use('/api/notification', notificationRoute);
  app.use('/api/wallet', walletRoute);
  app.use('/api/session', bookSessionRoute);
  app.use('/api/rating', ratingRoutes);
  app.use('/api/general', generalRoute);


  app.use('/api/image', uploadImages);

  // app.use('/api/cat', catRoute);
  // app.use('/api/training', trainingRoute);
  // app.use('/api/gig', gigRoute);
  // app.use('/api/offers', authMiddleWare, offerRoute);
  // app.use('/api/request', authMiddleWare, requestRoute);
  // app.use('/api/order', authMiddleWare, applicationRoute);
  // app.use('/api/image', authMiddleWare,uploadImages);
  // app.use('/api/rating', ratingRoutes);
  // app.use('/api/support', supportRoute);
  // app.use('/api/payment', payment);
  app.use(error);
}