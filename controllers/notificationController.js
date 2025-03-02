const Notification = require("../models/Notification");
const lang2 = require('../routes/lang2.json');
const lang = require('../routes/lang.json');

exports.getApplicationDetails = async (req, res) => {
  let query = {};
  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }
  query.to_id = req.user._id
  try {
    const notifications = await Notification.find(query).populate("user").populate("session_id").populate("to_id").sort({ _id: -1 }).limit(15).lean();

    if (notifications.length > 0) {
      res.status(200).json({ success: true, notifications: notifications });
    } else {
      res.status(200).json({ success: false, message:req?.user?.lang=='english'?lang["nonoti"]:lang2["nonoti"] });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message:req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};
exports.checkSeen = async (req, res) => {
  let query = {};
  query.to_id = req.user._id
  query.seen = false
  try {
    const notifications = await Notification.find(query).lean()

    res.status(200).json({ success: true, unseen: notifications.length });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};

exports.deleteNoti = async (req, res) => {
  try {
    const notiId = req.params.id;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({ to_id: userId, _id: notiId });

    if (notification == null) {
      return res.status(404).json({ message: req?.user?.lang=='english'?lang["notino"]:lang2["notino"] });
    }

    res.status(200).json({ message:req?.user?.lang=='english'?lang["notidelete"]:lang2["notidelete"], notification: notification });

  } catch (error) {
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};

exports.allSeen = async (req, res) => {
  try {
    const userId = req.user._id;

    const updateResult = await Notification.updateMany(
      { to_id: userId, seen: false },
      { $set: { seen: true } }
    );
    res.status(200).json({ success: false, result: updateResult });
  } catch (error) {
    // If an error occurs during the execution, respond with a 500 Internal Server Error
    res.status(500).json({ error: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};



exports.deletenotification = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Notification.findByIdAndDelete(serviceId);

    if (service == null) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: `Notification deleted successfully`, notification: service });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};