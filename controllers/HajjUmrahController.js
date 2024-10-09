const HajjUmrah = require("../models/HajjUmrah");
const Duas = require("../models/Duas");
const Favorite = require("../models/Favorite1");
const FavDua = require("../models/FavDua");
const Settings = require("../models/Settings");

const { User } = require("../models/user");
const { sendNotification } = require("./notificationCreateService");
const lang2 = require('../routes/lang2.json');
const lang = require('../routes/lang.json');
const { notificationAdminService } = require("./notificationAdminService");


exports.create = async (req, res) => {
  try {
    const { title, desc, image, sub_title,sub_data } = req.body;
    const data = new HajjUmrah({
      title, desc, image, sub_title,sub_data
    });
    await data.save();
    res.send({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang["error"] });
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
    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang2["error"] });
  }
};

exports.favQCreate = async (req, res) => {
  try {
    const { title, arabic, english, verse_id,verse_key } = req.body;
    const user = req.user._id;
    const dua_d = await Favorite.findOne({ user: user, verse_id: verse_id }).lean()
   let data = null
    if(dua_d){
      await Favorite.deleteMany({verse_id:verse_id});
    }else{
     data = new Favorite({
      title, arabic, english, verse_id,verse_key,user:user
    });
    await data.save();
  }
    res.send({ success: true, data: data });
  } catch (error) {
    // console.log("E",error);
    
    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang2["error"] });
  }
};
exports.favDuaCreate = async (req, res) => {
  try {
    const { dua } = req.body;
    const user = req.user._id;
    const dua_d = await FavDua.findOne({ user: user, dua: dua }).lean()

    let data = null;
    if (dua_d) {
      await FavDua.deleteMany({dua:dua});
      
    } else {
      data = new FavDua({ user, dua });
      await data.save();
    }
    res.send({ success: true, data: data });
  } catch (error) {
    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang2["error"] });
  }
};

exports.settingUpdate = async (req, res) => {
  try {
    const { notification_reminder,azan_voice,namaz_timing, azan_voice_switch,location,juma_time} = req.body;
    const user = req.user._id;
    const setting = await Settings.findOne({ user: user}).lean()
    const updateFields = Object.fromEntries(
      Object.entries({
        notification_reminder,azan_voice,namaz_timing, azan_voice_switch,location,juma_time
      }).filter(([key, value]) => value !== undefined)
    );
    // Check if there are any fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).send({ success: false, message: req.user.lang=='spanish'?lang["novalid"]:lang["novalid"]  });
    }

   let data = null
    if(setting){
       data = await Settings.findByIdAndUpdate(setting?._id, updateFields, {
        new: true
      });
    }else{
     data = new Settings({
      ...updateFields,
      user:user
    });
    await data.save();
  }
    res.send({ success: true, data: data });
  } catch (error) {
    // console.log("E",error);
    
    res.status(500).json({ success: false, message: req?.user?.lang == 'english' ? lang["error"] : lang2["error"] });
  }
};
exports.getSettings = async (req, res) => {
  try {
    const data = await Settings.findOne({user: req.user._id}).populate("user");
    res.send({ success:data.length==0?false:true, data });
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
            favorite: dua_d?true:false // Add the found dua_d or null if not found
          };
        })
      );

    if (data.length > 0) {
      res.status(200).json({ success: true, data:duaData });
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
    return res.status(400).json({ error: req.user.lang == 'spanish' ? lang["invalid"] : lang["invalid"] });
  }
  const pageSize = 10;

  const skip = Math.max(0, (lastId - 1)) * pageSize;
  let query = {};
  if (req.params.search) {
    query.name = { $regex: new RegExp(req.params.search, 'i') };
  }
  query.user = userId

  try {
    const data = await HajjUmrah.find(query).skip(skip)
      .limit(pageSize).lean();

    const totalCount = await HajjUmrah.find(query);
    const totalPages = Math.ceil(totalCount.length / pageSize);

    if (data.length > 0) {
      res.status(200).json({ success: true, data: data, count: { totalPage: totalPages, currentPageSize: data.length } });
    } else {
      res.status(200).json({ success: false, data: [], message: req.user.lang == 'spanish' ? lang2["no_cat"] : lang["no_cat"], count: { totalPage: totalPages, currentPageSize: data.length } });
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
  query.user = userId

  try {
    const data = await Duas.find(query).skip(skip)
      .limit(pageSize).lean();

    const totalCount = await Duas.find(query);
    const totalPages = Math.ceil(totalCount.length / pageSize);

    if (data.length > 0) {
      res.status(200).json({ success: true, data: data, count: { totalPage: totalPages, currentPageSize: data.length } });
    } else {
      res.status(200).json({ success: false, data: [], message: req.user.lang == 'spanish' ? lang2["no_cat"] : lang["no_cat"], count: { totalPage: totalPages, currentPageSize: data.length } });
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
    console.log(id, status);

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


