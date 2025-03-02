const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const { User, validate, validateCodeUser, generateAuthToken, passwordApiBodyValidate, generateIdToken, phoneApiBodyValidate } = require('../models/user');
const express = require('express');
const { sendEmail } = require('../controllers/emailservice');
const passwordauth = require('../middleware/passwordauth');
const { generateCode } = require('../controllers/generateCode');
const router = express.Router();
const moment = require('moment');
const { TempUser } = require('../models/TempUser');
const userAvailability = require('../models/userAvailability')
const BookSession = require('../models/BookSession')
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const admin = require('../middleware/admin');
const lang2 = require('./lang2.json');
const lang = require('./lang.json');
const { phoneservice } = require('../controllers/phoneservice');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET);

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  let query = {};
  if (user.type == 'buyer') {
    query.to_id = user._id
  } else {
    query.user = user._id
  }
  // const totalOrder = await Application.find(query).lean()
  // const completed = await Application.find(query).lean()
  // const active = await Application.find(query).lean()
  // const cancelled = await Application.find(query).lean()
  res.send({ success: true, user });
});


router.get('/admin/dashboard', auth, async (req, res) => {
  const totalStudents=await User.countDocuments({type:"student",status : 'online'})
  const totalTrainer=await User.countDocuments({type:"trainer",status :'online'})
  const session = await BookSession.countDocuments({})
  const pendingSession = await BookSession.countDocuments({status:"pending"})
  const completedSession = await BookSession.countDocuments({status:"completed"})
  res.send({
    success: true,
   totalUsers:totalStudents+totalTrainer,
   studens:totalStudents,
   tutors:totalTrainer,
   totalSession:session,
   pendingSession:pendingSession,
   completedSession:completedSession,
  });
});

router.get('/tutor/counts', auth, async (req, res) => {
  const userId = req.user._id;
  const session = await BookSession.countDocuments({to_id:userId})
  const totalEarning = 0
  let earningSum = 0;
  // const totalEar = await Promise.all(
  //   totalEarning.map(async (item) => {
  //     earningSum = earningSum + balance
  //     return {
  //       ...item,
  //       feedback: session_r || null // Add the found dua_d or null if not found
  //     };
  //   })
  // );
  res.send({
    success: true,
    totalSession:session,
    totalEarning: totalEarning,
    totalStudent:session
  });
});

router.get('/totalUnseens/:type', auth, async (req, res) => {
   // #swagger.ignore = true
  const userId = req.user._id;

  const type=req.params.type

  let applicationCount={}
  if (type!=='seller') {
     applicationCount=await Application.find({ to_id: userId, seen:false, status: { $in: ['pending','rejected'] } }).lean()
  } else {
    applicationCount=await Application.find({ user: userId,seen:false, status: { $in: ['accepted', 'completed', 'cancelled',] } }).lean()
  }
  const notifications = await Notification.find({to_id:userId,seen:false}).lean()
  
  const conversations = await Conversation.find({participants:{ $in: [userId] }})
      .sort({ _id: -1 })
      .lean()
  let messageCount=0
  for (let conversation of conversations) {    
    const otherId = conversation.participants.filter(id => id._id.toString() !== userId.toString())

    const unseenMessages = await Message.find({ conversationId: conversation._id, sender: otherId[0]?._id, seen: false }).lean()

    messageCount=Number(messageCount)+unseenMessages.length
  }

  res.send({
    success: true,
    orderCount:applicationCount.length,
    notiCount:notifications.length,
    unseenMessage:messageCount
  });
});

router.get('/admin/all/:type/:id/:search?', [auth,admin], async (req, res) => {

  const lastId = parseInt(req.params.id)||1;

  // Check if lastId is a valid number
  if (isNaN(lastId) || lastId < 0) {
    return res.status(400).json({ error:lang["Invalid_last_id"] });
  }
  const {type}=req.params

  const validType=['student', 'trainer']

  if (!validType.includes(type)) {
   return res.status(400).send({ success: false, message:lang["error"] });
  }
  const pageSize = 10;

  const skip = Math.max(0, (lastId - 1)) * pageSize;
  let query = {};

  query.type = type;
  // query.status = 'online';
  if (req.params.search) {
    const searchRegex = new RegExp(req.params.search, 'i');
    const searchQuery = [
      { fname: { $regex: searchRegex } },
      { lname: { $regex: searchRegex } }
    ];
    query.$or = searchQuery
  }

  const users = await User.find(query).select('-password').sort({ _id: -1 }).skip(skip)
  .limit(pageSize).lean();
let mData = users;
if(type == 'trainer'){
   mData = await Promise.all(
    users.map(async (item) => {
      const session_r = await userAvailability.findOne({ user: item?._id,}).lean(); // assuming 'dua' field corresponds to item._id
      return {
        ...item,
        trainerDocs: session_r || null // Add the found dua_d or null if not found
      };
    })
  );
}


  const totalCount = await User.countDocuments(query);
  const totalPages = Math.ceil(totalCount / pageSize);

  res.send({ success: true, users: mData,count: { totalPage: totalPages, currentPageSize: users.length } });
});



router.get('/other/:id', async (req, res) => {
   // #swagger.ignore = true
  const user = await User.findById(req.params.id).select('-password').populate("profession")

  let query = {};
  if (user.type == 'buyer') {
    query.to_id = user._id
  } else {
    query.user = user._id
  }

  const totalOrder = await Application.find(query).lean()
  const completed = await Application.find({ ...query, status: "completed" }).lean()
  const active = await Application.find({ ...query, status: "accepted" }).lean()
  const cancelled = await Application.find({ ...query, status: "cancelled" }).lean()
  res.send({ success: true, user, total: totalOrder.length, completed: completed.length, active: active.length, cancelled: cancelled.length });
});

router.post('/forget-password', async (req, res) => {
   // #swagger.ignore = true


  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).send({ message:lang["nouser"] });

  if (user.status == 'deleted') return res.status(400).send({ message: lang["deleted"] });

  const verificationCode = generateCode();
  await sendEmail(email, verificationCode)

  await User.findOneAndUpdate({ email }, { code: verificationCode });

  const token = generateIdToken(user._id);

  res.send({ success: true, message:lang["sendcode"], token });
});

router.put('/update-password', passwordauth, async (req, res) => {

  const { error } = passwordApiBodyValidate(req.body);
  if (error) return res.status(400).send({ success: false, message: error.details[0].message });

  const { password } = req.body

  const user = await User.findById(req.user._id);

  if (!user) return res.status(404).send({ success: false, message: lang2["nouserfound"] });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  user.password = hashedPassword;

  await user.save();

  res.send({ success: true, message:lang2["passupdate"]});
});

router.put('/change-password', auth, async (req, res) => {

  const { oldPassword, newPassword } = req.body

  const user = await User.findById(req.user._id);

  if (!user) return res.status(404).send({ success: false, message:req.user.lang=='spanish'?lang2["nouserfound"]:lang["nouserfound"] });

  const validPassword = await bcrypt.compare(oldPassword, user.password);
  if (!validPassword) return res.status(400).send({ success: false, message:'Invalid password' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  user.password = hashedPassword;

  await user.save();

  res.send({ success: true, message: req.user.lang=='spanish'?lang2["passupdate"]:lang["passupdate"] });
});

router.post('/send-code', async (req, res) => {
  
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already exist'  });
    }
    const verificationCode = generateCode();

    await sendEmail(email, verificationCode)
  
    await User.findOneAndUpdate({ email }, { code: verificationCode });

    return res.json({ message:'Code send',code:verificationCode});
  } catch (error) {
    console.error('Error sending verification code:', error);
    return res.status(500).json({ error: lang["error"]});
  }
});

router.post('/verify-otp/registration', async (req, res) => {
   // #swagger.ignore = true
  try {
    const { phone, code } = req.body;

    const verificationRecord = await TempUser.findOne({ phone });

    if (!verificationRecord || Number(verificationRecord.code) !== Number(code)) {
      return res.status(200).json({ success: false, message:lang2["incorrect"] });
    }

    return res.json({ success: true, message:lang2["codematch"] });
  } catch (error) {
    return res.status(500).json({ error: lang2["error"] });
  }
});

router.post('/signup/:type', async (req, res) => {

  const { type } = req.params;

  const validStatuses = ['student', 'trainer'];

  if (!validStatuses.includes(type)) {
    return res.status(400).json({ success: false, message:lang["invalidstat"] });
  }
  const {
    name,
    email,
    password,
    image,
    location,
    fcmtoken
  } = req.body;
  const updatEmail = String(email).trim().toLocaleLowerCase()
  const user = await User.findOne({ email:updatEmail });
  if (user) return res.status(400).send({ success: false,statusCode:400, message:lang["emailalready"] });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  
  const newUser = new User({
    password: hashedPassword,
    name,
    email:updatEmail,
    image,
    location,
    type: req.params.type,
    fcmtoken
  });
  
  await newUser.save();

  const verificationCode = generateCode();

  await sendEmail(email, verificationCode)

  await User.findOneAndUpdate({ email }, { code: verificationCode });
  
  const token = generateAuthToken(newUser._id,newUser.type,newUser.lang);
  res.send({ success: true,statusCode:200, message: lang2["acc_create"], token: token, user: newUser,trainerDocs:false });
});


//  trainer availability
router.post('/trainer/availability', auth,async (req, res) => {
  try {
    const {
      teach,
      availability,
      document,
      country,
      city,
      hours,
    } = req.body;

   const data = await userAvailability.findOne({user: req.user._id});
   if (data) return res.status(404).send({ success: false, message:'Availability Already exist please update information' });
  
   const saveData = new userAvailability({
      user:req.user._id,
      teach,
      availability,
      document,
      country,
      city,
      hours
    });
    await saveData.save();

    const mData = await userAvailability.findOne({user: req.user._id}).populate("user");
    res.send({ success: true,statusCode:200, message: lang["acc_create"],  data: saveData,trainerDocs:mData });
  } catch (error) {
    return res.status(500).json({ error: lang["error"] });
  }
});

router.post('/trainer/availability/web', auth,async (req, res) => {
  try {
    const {
      teach,
      availability,
      document,
      country,
      city,
      hours,
      introduction,
      languages,
      hourlyRate

    } = req.body;

  //  const data = await userAvailability.findOne({user: req.user._id});
  //  if (data) return res.status(404).send({ success: false, message:'Availability Already exist please update information' });
  
   const saveData = new userAvailability({
      user:req.user._id,
      teach,
      availability,
      document,
      country,
      city,
      hours,
      introduction,
      languages,
      hourlyRate

    });
    await saveData.save();

    const mData = await userAvailability.findOne({user: req.user._id}).populate("user");
    res.send({ success: true,statusCode:200, message: lang["acc_create"],  data: saveData,trainerDocs:mData });
  } catch (error) {
    return res.status(500).json({ error: lang["error"] });
  }
});

router.get('/trainer/availability', auth, async (req, res) => {
  const data = await userAvailability.findOne({user: req.user._id}).populate("user");
  res.send({ success:data.length==0?false:true, data });
});
router.get('/trainer/availability/:userId', auth, async (req, res) => {
  const userId = req.params.userId
  const data = await userAvailability.findOne({user: userId}).populate("user");
  res.send({ success:data.length==0?false:true, data });
});
router.get('/trainers', auth, async (req, res) => {
  let query = {};
  const userId = req.user._id

  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }
  query.availability = true
  query.user = { $ne: null }
  const pageSize = 20;

  try {
    const data = await userAvailability.find(query).populate('user')
      .sort({ _id: -1 })
      .limit(pageSize)
      .lean();
    
    if (data.length > 0) {
      res.status(200).json({ success: true, data: data });
    } else {
      res.status(200).json({ success: false, data:[],message:  'Data Not Fetched'});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message:  lang["error"] });
  }
});

router.put('/trainer/availability', auth,async (req, res) => {
  
  try {
    const {
      teach,
      availability,
      hours,
      introduction,
      qualification,
      hourlyRate,
      languages,
      eventName,
      eventDuration,
      id
    } = req.body;

    const updateFields = Object.fromEntries(
      Object.entries({
        teach,
        availability,
        hours,
        introduction,
        qualification,
        hourlyRate,
        languages,
        eventName,
        eventDuration,
      }).filter(([key, value]) => value !== undefined)
    );
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send({ success: false, message: 'Please send correct data' });
    }  
    const data = await userAvailability.findByIdAndUpdate(id, updateFields, {
      new: true
    });
  
    if (!data) return res.status(404).send({ success: false, message:lang["nouserfound"] });
    const mData = await userAvailability.findOne({user: req.user._id}).populate("user");
  
    res.send({ success: true, message: 'Update data successfully', data,trainerDocs:mData });

  } catch (error) {
    return res.status(500).json({ error: lang["error"] });
  }
});

router.post('/verify-otp/forget-password', passwordauth, async (req, res) => {
  try {
    const { code } = req.body;

    const user = await User.findById(req.user._id);
    

    if (!user) return res.status(200).send({ success: false, message: lang["nouserfound"] });

    if (Number(user.code) !== Number(code)) return res.status(200).send({ success: false, message:lang["incorrect"]});

    return res.json({ success: true, message: 'Verification code match successfully' });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return res.status(500).json({ error:lang2["error"]});
  }
});

router.post('/verify-otp/sign-up', async (req, res) => {
  try {
    const { code,email } = req.body;
    const updatEmail = String(email).trim().toLocaleLowerCase()
    const verificationRecord = await User.findOne({email: updatEmail });
    if (Number(verificationRecord.code) !== Number(code)) return res.status(400).send({ success: false, message:lang["incorrect"]});
    await User.findOneAndUpdate({ email:updatEmail }, { verified: true });
    return res.json({ success: true, message: 'Verification code match successfully' });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return res.status(500).json({ error:lang2["error"]});
  }
});

router.post('/check-email', async (req, res) => {
  const { error } = validateCodeUser(req.body);
  if (error) return res.status(400).send({ success: false, message: error.details[0].message });

  const { email } = req.body;

  const updatEmail = String(email).trim().toLocaleLowerCase()

  const user = await User.findOne({ email:updatEmail });
  if (user) return res.status(400).send({ success: false, message: lang2['emailalready'] });

  res.send({ success: true, message: "Email doesn't existed" });
});

router.post('/check-phone', async (req, res) => {
   // #swagger.ignore = true
  const { error } = phoneApiBodyValidate(req.body);
  if (error) return res.status(400).send({ success: false, message: error.details[0].message });

  const { phone } = req.body;

  const user = await User.findOne({ phone });
  if (user) return res.status(400).send({ success: false, message: lang2["phonealready"]});

  res.send({ success: true, message: "Phone doesn't existed" });
});

router.put('/update-user', auth, async (req, res) => {
  const {
    name,
    email,
    image,
    location,
    country,
    city,
    fcmtoken
  } = req.body;

  // Create an object to store the fields to be updated
  const updateFields = Object.fromEntries(
    Object.entries({
      name,
      email,
      image,
      location,
      country,
      city,
      fcmtoken
    }).filter(([key, value]) => value !== undefined)
  );

  // Check if there are any fields to update
  if (Object.keys(updateFields).length === 0) {
    return res.status(400).send({ success: false, message: req.user.lang=='spanish'?lang2["novalid"]:lang["novalid"]  });
  }
  const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
    new: true
  });

  if (!user) return res.status(404).send({ success: false, message:req.user.lang=='spanish'?lang2["nouserfound"]:lang["nouserfound"] });
  const availability = await userAvailability.findOne({ user:user?._id });
  res.send({ success: true, message: req.user.lang=='spanish'?lang2["userupdate"]:lang["userupdate"], user,availability });
});

router.put('/update-lang', auth, async (req, res) => {
  const { lang } = req.body;

  const user = await User.findByIdAndUpdate(req.user._id, {lang:lang}, { new: true });

  if (!user) return res.status(404).send({ success: false, message: req.user.lang=='spanish'?lang2["nouserfound"]:lang["nouserfound"]});

  const token = generateAuthToken(user._id,user.type,user.lang);

  res.send({ success: true, message:req.user.lang=='spanish'?lang2["userupdate"]:lang["userupdate"], user, token });
});



router.put('/update/:id/:status', [auth,admin], async (req, res) => {
 
  const user = await User.findByIdAndUpdate(req.params.id, {status:req.params.status}, {new: true});

  if (!user) return res.status(404).send({ success: false, message: req.user.lang=='spanish'?lang2["nouserfound"]:lang["nouserfound"] });

  res.send({ success: true, message: req.user.lang=='spanish'?lang["userupdate"]:lang["userupdate"], user });
});

router.put('/update/:type', [auth], async (req, res) => {
  const userId = req.user._id

  const user = await User.findByIdAndUpdate(userId, {type:req.params.type}, {new: true});

  if (!user) return res.status(404).send({ success: false, message: lang["nouserfound"] });

  res.send({ success: true, message: req.user.lang=='spanish'?lang["userupdate"]:lang["userupdate"], user });
});

router.delete('/', auth, async (req, res) => {
 
  const user = await User.findByIdAndUpdate(req.user._id, {status:'deleted'}, {new: true});

  if (!user) return res.status(404).send({ success: false, message: req.user.lang=='spanish'?lang2["nouserfound"]:lang["nouserfound"] });

  res.send({ success: true, message: req.user.lang=='spanish'?lang2["userdelete"]:lang["userdelete"], user });
});

router.delete('/:id', [auth,admin], async (req, res) => {
 
  const user = await User.findByIdAndUpdate(req.params.id, {status:'deleted'}, {new: true});

  if (!user) return res.status(404).send({ success: false, message: req.user.lang=='spanish'?lang2["nouserfound"]:lang["nouserfound"] });

  res.send({ success: true, message: req.user.lang=='spanish'?lang2["userdelete"]:lang["userdelete"], user });
});

router.post('/payment-intent', async (req, res) => {

  const { amount } = req.body;
  let currency = 'USD';
  let finalAm = parseFloat(amount)*100
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
     amount:finalAm,
      currency,
    });

    res.status(200).send({
      success:true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
  
    res.status(500).send({
      error: error.message,
    });
  }
});

module.exports = router; 
