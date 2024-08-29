const express = require('express');
const error = require('../middleware/error');
const auth = require('../routes/auth');
const users = require('../routes/users');
const authMiddleWare = require('../middleware/auth');
// const uploadImages = require('../routes/uploadImages');

// const trainingRoute = require('../routes/trainingRoute');
// const gigRoute = require('../routes/gigRoute');
// const offerRoute = require('../routes/offerRoute');
// const messageRoutes = require('../routes/messageRoutes');
// const requestRoute = require('../routes/requestRoute');
// const applicationRoute = require('../routes/applicationRoute');
// const notificationRoute = require('../routes/notificationRoute');
// const ratingRoutes = require('../routes/ratingRoutes');
// const uploadImages = require('../routes/uploadImages');
// const catRoute = require('../routes/catRoute');
// const walletRoute = require('../routes/walletRoute');
// const supportRoute = require('../routes/supportRoute');
// const payment = require('../routes/PayRoute');

module.exports = function (app) {
  app.use(express.json());
  app.use('/api/auth', auth);
  app.use('/api/users', users);
  // app.use('/api/image', uploadImages);

  // app.use('/api/cat', catRoute);
  // app.use('/api/training', trainingRoute);
  // app.use('/api/gig', gigRoute);
  // app.use('/api/offers', authMiddleWare, offerRoute);
  // app.use('/api/request', authMiddleWare, requestRoute);
  // app.use('/api/order', authMiddleWare, applicationRoute);
  // app.use('/api/msg', authMiddleWare, messageRoutes);
  // app.use('/api/notification', authMiddleWare, notificationRoute);
  // app.use('/api/wallet',authMiddleWare, walletRoute);
  // app.use('/api/image', authMiddleWare,uploadImages);
  // app.use('/api/rating', ratingRoutes);
  // app.use('/api/support', supportRoute);
  // app.use('/api/payment', payment);
  app.use(error);
}