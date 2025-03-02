const BookSession = require("../models/BookSession");
const BookSlots = require("../models/BookSlots");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const Rating = require("../models/Rating");
const userAvailability = require('../models/userAvailability')
const { User } = require("../models/user");
const { sendNotification } = require("./notificationCreateService");
const lang2 = require('../routes/lang2.json');
const lang = require('../routes/lang.json');
const moment = require('moment');
const { notificationAdminService } = require("./notificationAdminService");

function totalAmount(number) {
  return (Number(number) - Number(Number(number) * 0.20)).toFixed(2);
}

exports.create = async (req, res) => {
  try {
    const { to_id, bookedDate, bookedSlot, sessionType, message, amount } = req.body;

    if (!to_id) {
      return res
        .status(400)
        .json({ success: false, message: 'Error' });
    }
    const userId = req.user._id;

    const bookSession = new BookSession({
      user: userId,
      to_id,
      bookedDate,
      bookedSlot,
      sessionType,
      message,
      amount
    });

    const users = await User.findById(to_id);
    const myUser = await User.findById(userId);

    await sendNotification({
      user: userId,
      to_id: to_id,
      description: `${'Your session has been booked'} ${myUser.fname + " " + myUser.lname
        }`,
      type: "session",
      title: 'Book Session',
      fcmtoken: users.fcmtoken,
      session_id: bookSession._id,
      noti: users.noti,
    });
    // await notificationAdminService({
    //   user: userId,
    //   description: `${users.fname + " " + users.lname} book the session ${myUser.fname + " " + myUser.lname
    //     }`,
    //   type: "order",
    //   title: 'Book Session',
    //   order: bookSession._id,
    // });



    let wallet = {}
    wallet = await Wallet.findOne({ user: to_id });
    if (!wallet) {
      wallet = new Wallet({
        user: to_id,
        balance: 0
      })
    }
    wallet.balance = Number(wallet.balance) + Number(totalAmount(amount))

    let slots = {}
    slots = await BookSlots.findOne({ user: to_id, date: bookedDate });
    if (!slots) {
      slots = new BookSlots({
        user: to_id,
        slots: [bookedSlot],
        date: bookedDate
      })
    } else {
      let slotArray = slots.slots;
      slotArray.push(bookedSlot);
      slots.slots = slotArray
    }

    await slots.save();
    await wallet.save();
    await bookSession.save();
    const transaction = new Transaction({
      user: userId,
      to_id: to_id,
      session: bookSession?._id,
      balance: amount,
      type: "deposit",
      description: bookSession?._id + ' The payment for the session was successfully completed',
    });

    transaction.save();
    res
      .status(201)
      .json({
        success: true,
        message: 'Session has been created successfully',
        order: bookSession,
      });
  } catch (error) {
    console.log("V",error);
    
    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang2["error"] });
  }
};
exports.getSlotsData = async (req, res) => {
  const { userId, date } = req.params;

  const data = await BookSlots.findOne({ user: userId, date: date }).populate("user");
  res.send({ success: data ? true : false, data });
}

exports.getAllSessionTrainer = async (req, res) => {
  let query = {};
  const userId = req.user._id;
  if (req.params.status) {
    query.status = req.params.status
  }
  if (req.params.date) {
    query.bookedDate = req.params.date
  }

  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }
  query.to_id = userId;

  const pageSize = 10;

  try {
    const data = await BookSession.find(query).sort({ _id: -1 })
      .populate("user").populate("to_id")
      .limit(pageSize)
      .lean();

    const mData = await Promise.all(
      data.map(async (item) => {
        const session_r = await Rating.findOne({ to_id: userId, session: item._id }).lean(); // assuming 'dua' field corresponds to item._id
        return {
          ...item,
          feedback: session_r || null // Add the found dua_d or null if not found
        };
      })
    );

    if (data.length > 0) {
      res.status(200).json({ success: true, data: mData });
    } else {
      res.status(200).json({ success: false, data: [], message: 'No Session Found' });
    }
  } catch (error) {
    res.status(500).json({ message: lang["error"] });
  }
};

exports.getAllSessionStudent = async (req, res) => {
  let query = {};
  const userId = req.user._id;
  if (req.params.status) {
    query.status = req.params.status
  }
  if (req.params.date) {
    query.bookedDate = req.params.date
  }

  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }
  query.user = userId;

  const pageSize = 25;

  try {
    const data = await BookSession.find(query).sort({ _id: -1 })
      .populate("user").populate("to_id")
      .limit(pageSize)
      .lean();
    const mData = await Promise.all(
      data.map(async (item) => {
        const trainer = await userAvailability.findOne({ user: item?.to_id }).populate("user").lean(); // assuming 'dua' field corresponds to item._id
        return {
          ...item,
          trainerDocs: trainer || null // Add the found dua_d or null if not found
        };
      })
    );
    // const mData = await userAvailability.findOne({user: req.user._id}).populate("user");
    if (mData.length > 0) {
      res.status(200).json({ success: true, data: mData });
    } else {
      res.status(200).json({ success: false, data: [], message: 'No Session Found' });
    }
  } catch (error) {

    res.status(500).json({ message: lang["error"] });
  }
};

exports.updateBookSession = async (req, res) => {
  try {
    const { id, status } = req.params;

    const validStatus=['pending', 'started','completed','cancelled']

    if (!validStatus.includes(status)) {
     return res.status(400).send({ success: false, message:'Please send correct status' });
    }

    const data = await BookSession.findOneAndUpdate(
      { _id: id },
      {
        status: status,
        updatedAt: Date.now()
      },
    );

    if (data == null) {
      return res.status(404).json({ message: 'Session not updated', });
    }

    res.status(200).json({ success: true, message: 'Session updated successfully', data: data });

  } catch (error) {
    res.status(500).json({ message: req?.user?.lang == 'english' ? lang["error"] : lang["error"], });
  }
};

exports.getAllSessionAdmin = async (req, res) => {
  const userId = req.user._id;
  let startOfToday = '';
  let endOfToday = '';
  const lastId = parseInt(req.params.id) || 1;

  // Check if lastId is a valid number
  if (isNaN(lastId) || lastId < 0) {
    return res.status(400).json({ error: lang["invalid"] });
  }
  const pageSize = 10;

  const skip = Math.max(0, (lastId - 1)) * pageSize;
  let query = {};
  if (req.params.search) {
    query.name = { $regex: new RegExp(req.params.search, 'i') };
  }
  if (req.params.status && req.params.status !='null') {
    query.status = req.params.status;
  }
  if (req.params.date && req.params.date !='null') {
    // query.bookedDate = { $gte: startOfToday, $lte: endOfToday }
    query.bookedDate = req.params.date
  }
  if (req.params.type && req.params.type !='null') {
    query.sessionType = req.params.type;
  }
  // query.user = userId

  try {
    const data = await BookSession.find(query).skip(skip)
    .populate("user").populate("to_id")
      .limit(pageSize).lean();

    const totalCount = await BookSession.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);

    if (data.length > 0) {
      res.status(200).json({ success: true, data: data, count: { totalPage: totalPages, currentPageSize: data.length } });
    } else {
      res.status(200).json({ success: false, data: [], message: 'No more data', count: { totalPage: totalPages, currentPageSize: data.length } });
    }
  } catch (error) {
    res.status(500).json({ message: req.user.lang == 'spanish' ? lang["error"] : lang["error"] });
  }
};


