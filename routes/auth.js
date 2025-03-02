const Joi = require('joi');
const bcrypt = require('bcryptjs');
const { User, generateAuthToken } = require('../models/user');
const userAvailability = require('../models/userAvailability')
const express = require('express');
const lang2 = require('./lang2.json');
const lang = require('./lang.json');
const logger = require('../startup/logger');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ success: false, message: error.details[0].message });

    const { email, password, fcmtoken } = req.body;

    const updatEmail = String(email).trim().toLocaleLowerCase();
    const user = await User.findOne({ email: updatEmail });

    if (!user) return res.status(400).send({ success: false, message: lang["invalid"] });
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send({ success: false, message: lang["invalid"] });

    if (user.status == 'deleted') return res.status(400).send({ success: false, message: lang["deleted"] });
    if (user.status == 'deactivated') return res.status(400).send({ success: false, message: lang["deactivated"] });
    if (user.verified == false) return res.status(400).send({ success: false, message: 'Please verify your profile' });
    let trainerDocs = null
    if (user.type == 'trainer') {
      trainerDocs = await userAvailability.findOne({ user: user?._id }).populate("user");
    }
    if (fcmtoken != 'any') {
      user.fcmtoken = fcmtoken
    }
    await user.save()
    const token = generateAuthToken(user._id, user.type, user.lang);
    res.send({
      token: token,
      user: user,
      success: true,
      trainerDocs: trainerDocs ? trainerDocs : false
    });
  } catch (error) {
    res.status(400).send({ success: false, message: lang["error"] });
  }
});

router.post('/admin', async (req, res) => {

  const { error } = validate(req.body);
  if (error) return res.status(400).send({ success: false, message: error.details[0].message });

  const { email, password } = req.body;

  const updatEmail = String(email).trim().toLocaleLowerCase()

  const user = await User.findOne({ email: updatEmail });

  if (!user) return res.status(400).send({ success: false, message: lang2["invalid"] });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send({ success: false, message: lang2["invalid"] });

  if (user.status == 'deleted') return res.status(400).send({ success: false, message: lang2["deleted"] });
  if (user.type !== 'admin') return res.status(400).send({ success: false, message: lang2["invalid"] });

  const token = generateAuthToken(user._id, user.type);
  res.send({
    token: token,
    user: user
  });
});


function validate(req) {
  const emailSchema = {
    email: Joi.string().min(5).max(255).email(),
    password: Joi.string().min(5).max(255).required(),
    fcmtoken: Joi.string().min(0).max(1024).optional()
  };

  const schema = Joi.object(emailSchema)

  return schema.validate(req);
}


module.exports = router; 
