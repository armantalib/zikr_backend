const BookSession = require("../models/BookSession");
const BookSlots = require("../models/BookSlots");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const { User } = require("../models/user");
const { sendNotification } = require("./notificationCreateService");
const lang2 = require('../routes/lang2.json');
const lang = require('../routes/lang.json');
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

    // await sendNotification({
    //   user: userId,
    //   to_id: to_id,
    //   description: `${'Your session has been booked'} ${myUser.fname + " " + myUser.lname
    //     }`,
    //   type: "order",
    //   title: 'Book Session',
    //   fcmtoken: users.fcmtoken,
    //   order: bookSession._id,
    //   noti: users.noti,
    // });
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
    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang2["error"] });
  }
};
exports.getSlotsData = async (req, res) => {
  const { userId, date } = req.params
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

    if (data.length > 0) {
      res.status(200).json({ success: true, data });
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

  const pageSize = 10;

  try {
    const data = await BookSession.find(query).sort({ _id: -1 })
      .populate("user").populate("to_id")
      .limit(pageSize)
      .lean();

    if (data.length > 0) {
      res.status(200).json({ success: true, data });
    } else {
      res.status(200).json({ success: false, data: [], message: 'No Session Found' });
    }
  } catch (error) {
    res.status(500).json({ message: lang["error"] });
  }
};


