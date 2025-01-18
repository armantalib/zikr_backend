const HajjUmrah = require("../models/HajjUmrah");
const Duas = require("../models/Duas");
const DailyAyat = require("../models/DailyAyat");
const Favorite = require("../models/Favorite1");
const FavDua = require("../models/FavDua");
const Settings = require("../models/Settings");
const UsersPrayers = require("../models/UsersPrayers");
const QuranPakTime = require("../models/QuranPakTime");

const { User } = require("../models/user");
const { sendNotification } = require("./notificationCreateService");
const lang2 = require('../routes/lang2.json');
const lang = require('../routes/lang.json');
const { notificationAdminService } = require("./notificationAdminService");
const moment = require('moment');

exports.create = async (req, res) => {
  try {
    const { title, desc, image, sub_title, sub_data, icon } = req.body;
    const data = new HajjUmrah({
      title, desc, image, sub_title, sub_data, icon
    });
    await data.save();
    res.send({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang["error"] });
  }
};
exports.updateHajjUmrah = async (req, res) => {
  try {
    const {
      title, desc, image, sub_title, sub_data, icon,
      id
    } = req.body;

    const updateFields = Object.fromEntries(
      Object.entries({
        title, desc, image, sub_title, sub_data, icon
      }).filter(([key, value]) => value !== undefined)
    );
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send({ success: false, message: 'Please send correct data' });
    }
    const data = await HajjUmrah.findByIdAndUpdate(id, updateFields, {
      new: true
    });

    if (!data) return res.status(404).send({ success: false, message: 'Please send id of object' });

    res.send({ success: true, message: 'Update data successfully', data });

  } catch (error) {
    return res.status(500).json({ error: lang["error"] });
  }
};
exports.duaCreate = async (req, res) => {
  try {
    const { title, arabic, english } = req.body;
    const data = new Duas({
      title, arabic, english
    });
    await data.save();
    res.send({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang["error"] });
  }
};

exports.dailyAyatCreate = async (req, res) => {
  try {
    const { title, arabic, english } = req.body;
    const data = new DailyAyat({
      title, arabic, english
    });
    await data.save();
    res.send({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang["error"] });
  }
};

exports.updateDua = async (req, res) => {
  try {
    const {
      title, arabic, english,
      id
    } = req.body;

    const updateFields = Object.fromEntries(
      Object.entries({
        title, arabic, english,
      }).filter(([key, value]) => value !== undefined)
    );
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send({ success: false, message: 'Please send correct data' });
    }
    const data = await Duas.findByIdAndUpdate(id, updateFields, {
      new: true
    });

    if (!data) return res.status(404).send({ success: false, message: 'Please send id of object' });

    res.send({ success: true, message: 'Update data successfully', data });

  } catch (error) {
    return res.status(500).json({ error: lang["error"] });
  }
};

exports.updateDailyAyat = async (req, res) => {
  try {
    const {
      title, arabic, english,
      id
    } = req.body;

    const updateFields = Object.fromEntries(
      Object.entries({
        title, arabic, english,
      }).filter(([key, value]) => value !== undefined)
    );
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send({ success: false, message: 'Please send correct data' });
    }
    const data = await DailyAyat.findByIdAndUpdate(id, updateFields, {
      new: true
    });

    if (!data) return res.status(404).send({ success: false, message: 'Please send id of object' });

    res.send({ success: true, message: 'Update data successfully', data });

  } catch (error) {
    return res.status(500).json({ error: lang["error"] });
  }
};

exports.favQCreate = async (req, res) => {
  try {
    const { title, arabic, english, verse_id, verse_key } = req.body;
    const user = req.user._id;
    const dua_d = await Favorite.findOne({ user: user, verse_id: verse_id }).lean()
    let data = null
    if (dua_d) {
      await Favorite.deleteMany({ verse_id: verse_id });
    } else {
      data = new Favorite({
        title, arabic, english, verse_id, verse_key, user: user
      });
      await data.save();
    }
    res.send({ success: true, data: data });
  } catch (error) {

    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang["error"] });
  }
};
exports.favDuaCreate = async (req, res) => {
  try {
    const { dua } = req.body;
    const user = req.user._id;
    const dua_d = await FavDua.findOne({ user: user, dua: dua }).lean()

    let data = null;
    if (dua_d) {
      await FavDua.deleteMany({ dua: dua });

    } else {
      data = new FavDua({ user, dua });
      await data.save();
    }
    res.send({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang["error"] });
  }
};

exports.settingUpdate = async (req, res) => {
  try {
    const { notification_reminder, azan_voice, namaz_timing, azan_voice_switch, location, juma_time } = req.body;
    const user = req.user._id;
    const setting = await Settings.findOne({ user: user }).lean()
    const updateFields = Object.fromEntries(
      Object.entries({
        notification_reminder, azan_voice, namaz_timing, azan_voice_switch, location, juma_time
      }).filter(([key, value]) => value !== undefined)
    );
    // Check if there are any fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send({ success: false, message: req.user.lang == 'spanish' ? lang["novalid"] : lang["novalid"] });
    }

    let data = null
    if (setting) {
      data = await Settings.findByIdAndUpdate(setting?._id, updateFields, {
        new: true
      });
    } else {
      data = new Settings({
        ...updateFields,
        user: user
      });
      await data.save();
    }
    res.send({ success: true, data: data });
  } catch (error) {

    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang["error"] });
  }
};


exports.quranPakTimeUpdate = async (req, res) => {
  try {
    const { time, date } = req.body;
    const user = req.user._id;
    const setting = await QuranPakTime.findOne({ user: user, date: date }).lean()
    const updateFields = Object.fromEntries(
      Object.entries({
        time, date
      }).filter(([key, value]) => value !== undefined)
    );
    // Check if there are any fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send({ success: false, message: req.user.lang == 'spanish' ? lang["novalid"] : lang["novalid"] });
    }

    let data = null
    if (setting) {
      let updateTime = parseInt(time) + parseInt(setting?.time)
      data = await QuranPakTime.findByIdAndUpdate(setting?._id, { time: updateTime, date: date }, {
        new: true
      });
    } else {
      data = new QuranPakTime({
        ...updateFields,
        user: user
      });
      await data.save();
    }
    res.send({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang["error"] });
  }
};




exports.getSettings = async (req, res) => {
  try {
    const data = await Settings.findOne({ user: req.user._id }).populate("user");
    res.send({ success: data.length == 0 ? false : true, data });
  } catch (error) {

  }
}

exports.getHajjUmrahApp = async (req, res) => {
  let query = {};
  const userId = req.user._id;
  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }

  const pageSize = 10;

  try {
    const data = await HajjUmrah.find(query).sort({ _id: -1 })
      .limit(pageSize)
      .lean();

    if (data.length > 0) {
      res.status(200).json({ success: true, data });
    } else {
      res.status(200).json({ success: false, data: [], message: 'No Data Found' });
    }
  } catch (error) {
    console.log("E", error);

    res.status(500).json({ message: lang["error"] });
  }
};

exports.getFavDuaApp = async (req, res) => {
  let query = {};
  const userId = req.user._id;
  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }
  query.user = userId;
  const pageSize = 10;

  try {
    const data = await FavDua.find(query).sort({ _id: -1 }).populate('dua').populate('user')
      .limit(pageSize)
      .lean();

    if (data.length > 0) {
      res.status(200).json({ success: true, data });
    } else {
      res.status(200).json({ success: false, data: [], message: 'No Data Found' });
    }
  } catch (error) {
    res.status(500).json({ message: lang["error"] });
  }
};

exports.getFavQApp = async (req, res) => {
  let query = {};
  const userId = req.user._id;
  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }
  query.user = userId;
  const pageSize = 10;

  try {
    const data = await Favorite.find(query).sort({ _id: -1 }).populate('user')
      .limit(pageSize)
      .lean();

    if (data.length > 0) {
      res.status(200).json({ success: true, data });
    } else {
      res.status(200).json({ success: false, data: [], message: 'No Data Found' });
    }
  } catch (error) {
    res.status(500).json({ message: lang["error"] });
  }
};

exports.getDuaApp = async (req, res) => {
  let query = {};
  const userId = req.user._id;
  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }

  const pageSize = 10;

  try {
    const data = await Duas.find(query).sort({ _id: -1 })
      .limit(pageSize)
      .lean();

    const duaData = await Promise.all(
      data.map(async (item) => {
        const dua_d = await FavDua.findOne({ user: userId, dua: item._id }).lean(); // assuming 'dua' field corresponds to item._id
        return {
          ...item,
          favorite: dua_d ? true : false // Add the found dua_d or null if not found
        };
      })
    );

    if (data.length > 0) {
      res.status(200).json({ success: true, data: duaData });
    } else {
      res.status(200).json({ success: false, data: [], message: 'No Data Found' });
    }
  } catch (error) {
    res.status(500).json({ message: lang["error"] });
  }
};


exports.getAllHajjUmrahAdmin = async (req, res) => {
  const userId = req.user._id;

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
  // query.user = userId

  try {
    const data = await HajjUmrah.find(query).skip(skip)
      .limit(pageSize).lean();

    const totalCount = await HajjUmrah.countDocuments(query);
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

exports.getAllDuaAdmin = async (req, res) => {
  const userId = req.user._id;

  const lastId = parseInt(req.params.id) || 1;

  // Check if lastId is a valid number
  if (isNaN(lastId) || lastId < 0) {
    return res.status(400).json({ error: req.user.lang == 'spanish' ? lang["invalid"] : lang["invalid"] });
  }
  const pageSize = 10;

  const skip = Math.max(0, (lastId - 1)) * pageSize;
  let query = {};
  if (req.params.search) {
    query.name = { $regex: new RegExp(req.params.search, 'i') };
  }
  // query.user = userId

  try {
    const data = await Duas.find(query).skip(skip)
      .limit(pageSize).lean();

    const totalCount = await Duas.countDocuments(query);
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

exports.getAllDailyAyatAdmin = async (req, res) => {
  const userId = req.user._id;

  const lastId = parseInt(req.params.id) || 1;

  // Check if lastId is a valid number
  if (isNaN(lastId) || lastId < 0) {
    return res.status(400).json({ error: req.user.lang == 'spanish' ? lang["invalid"] : lang["invalid"] });
  }
  const pageSize = 10;

  const skip = Math.max(0, (lastId - 1)) * pageSize;
  let query = {};
  if (req.params.search) {
    query.name = { $regex: new RegExp(req.params.search, 'i') };
  }
  // query.user = userId

  try {
    const data = await DailyAyat.find(query).skip(skip)
      .limit(pageSize).lean();

    const totalCount = await Duas.countDocuments(query);
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

exports.updateBookSession = async (req, res) => {
  try {
    const { id, status } = req.params;

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

exports.deleteHajjUmrah = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await HajjUmrah.findByIdAndDelete(serviceId);

    if (service == null) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.status(200).json({ message: 'Data deleted Successfully', data: service });

  } catch (error) {
    res.status(500).json({ message: req?.user?.lang == 'english' ? lang["error"] : lang["error"] });
  }
};

exports.deleteDua = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Duas.findByIdAndDelete(serviceId);

    if (service == null) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.status(200).json({ message: 'Data deleted Successfully', data: service });

  } catch (error) {
    res.status(500).json({ message: req?.user?.lang == 'english' ? lang["error"] : lang["error"] });
  }
};

exports.deleteDailyAyat = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await DailyAyat.findByIdAndDelete(serviceId);

    if (service == null) {
      return res.status(404).json({ message: 'Data not found' });
    }

    res.status(200).json({ message: 'Data deleted Successfully', data: service });

  } catch (error) {
    res.status(500).json({ message: req?.user?.lang == 'english' ? lang["error"] : lang["error"] });
  }
};

exports.usersPrayers = async (req, res) => {
  try {
    const { namaz_name, status, status_text } = req.body;
    const user = req.user._id;
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));  // Start of today
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));  // End of today
    const setting = await UsersPrayers.findOne({
      user: user, namaz_name: namaz_name,
      createdAt: { $gte: startOfToday, $lte: endOfToday }

    }).lean()
    const updateFields = Object.fromEntries(
      Object.entries({
        namaz_name, status, status_text
      }).filter(([key, value]) => value !== undefined)
    );
    // Check if there are any fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send({ success: false, message: req.user.lang == 'spanish' ? lang["novalid"] : lang["novalid"] });
    }

    let data = null
    if (setting) {
      return res.status(400).send({ success: false, message: 'You already prayed this prayer' });
    } else {
      data = new UsersPrayers({
        ...updateFields,
        user: user
      });
      await data.save();
    }
    res.send({ success: true, data: data });
  } catch (error) {

    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang["error"] });
  }
};


exports.getAllPrayers = async (req, res) => {
  try {
    const { date } = req.body;
    const user = req.user._id;
    const today = new Date(date);

    const startOfToday = new Date(today.setHours(0, 0, 0, 0));  // Start of today
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));  // End of today
    const prayers = await UsersPrayers.find({
      user: user,
      createdAt: { $gte: startOfToday, $lte: endOfToday }

    }).lean()

    const quran_pak_time = await QuranPakTime.find({
      user: user,
      createdAt: { $gte: startOfToday, $lte: endOfToday }

    }).lean()


    res.send({ success: true, data: prayers,quran_pak_time:quran_pak_time });
  } catch (error) {


    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang["error"] });
  }
};




exports.getNamazProgressCal = async (req, res) => {
  try {
    const { start_month, end_month } = req.body;

    const user = req.user._id;
    const start = new Date(start_month);
    const end = new Date(end_month);
    const startOfToday = new Date(start.setHours(0, 0, 0, 0));  // Start of today
    const endOfToday = new Date(end.setHours(23, 59, 59, 999));  // End of today
   
    
    const prayers = await UsersPrayers.countDocuments({
      user: user,
      status : 'yes',
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    }).lean()

    const quran_pak = await QuranPakTime.find({
      user: user,
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    }).lean()

    

    let unPrayed=150-prayers;
    let percent_ = (prayers * 100) / 150
    res.send({ success: true, prayed: prayers,un_prayed:unPrayed , percent:percent_,quran_pak_time:quran_pak });
  } catch (error) {

    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang["error"] });
  }
};


