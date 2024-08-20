const Offer = require('../models/Offer');
const Request = require('../models/Request');
const {sendNotification} = require('../controllers/notificationCreateService');
const lang2 = require('../routes/lang2.json');
const lang = require('../routes/lang.json');
const { notificationAdminService } = require('./notificationAdminService');
const { User } = require('../models/user');

exports.create = async (req, res) => {
  try {
    const { to_id, offer_id, cover_letter, bid_price, resume, description, gig_id } = req.body;
    const userId = req.user._id;

    const findApplication = await Request.findOne({ offer: offer_id, user: userId }).populate("user")
    if (findApplication) {
      return res.status(404).json({ message: req?.user?.lang=='english'?lang["alreadyapplied"]:lang2["alreadyapplied"] });
    }
    const request = new Request({
      user: userId,
      to_id, offer: offer_id, cover_letter, bid_price, resume, description,
      gig: gig_id
    });
    const updateJob = await Offer.findByIdAndUpdate(offer_id, { $push: { requests: request._id } },
      {
        new: true
      }).populate("user")

    if (!updateJob) {
      return res.status(404).json({ message: req?.user?.lang=='english'?lang["jobnot"]:lang2["jobnot"] });
    }

    await sendNotification({
      user : userId,
      to_id : to_id,
      description : `${req?.user?.lang=='english'?lang["jobnewappl"]:lang2["jobnewappl"]} "${updateJob.title}" ${req?.user?.lang=='english'?lang["job"]:lang2["job"]}`,
      type :'request',
      title :req?.user?.lang=='english'?lang["newapp"]:lang2["newapp"],
      fcmtoken : updateJob?.user?.fcmtoken,
      request:request._id,
      noti:updateJob?.user?.noti
    })

    const users = await User.findById(to_id);
    const myUser = await User.findById(userId);


    await notificationAdminService({
      user: userId,
      description: `${myUser?.fname + " " + myUser?.lname} ha enviado una nueva solicitud de Trabajo a ${users?.fname + " " + users?.lname}`,
      type: "request",
      title:lang2["newapp"],
      request:request._id,
    });
    
    await request.save();

    res.status(201).json({ success: true, message: req?.user?.lang=='english'?lang["requestcreat"]:lang2["requestcreat"], request });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};


exports.getAllApplication = async (req, res) => {
  let query = {};
  const userId = req.user._id;

  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }
  query.to_id = userId;
  query.offer = req.params.offer_id;

  const pageSize = 10;

  try {
    const applications = await Request.find(query).sort({ _id: -1 })
      .populate("user").populate("offer").populate("gig")
      .limit(pageSize)
      .lean();

    if (applications.length > 0) {
      res.status(200).json({ success: true, applications });
    } else {
      res.status(200).json({ success: false, applications:[],message: req?.user?.lang=='english'?lang["noapp"]:lang2["noapp"] });
    }
  } catch (error) {
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};


exports.adminSideGigs = async (req, res) => {
  let query = {};

  const lastId = parseInt(req.params.id)||1;

  // Check if lastId is a valid number
  if (isNaN(lastId) || lastId < 0) {
    return res.status(400).json({ error: req?.user?.lang=='english'?lang["Invalid_last_id"]:lang2["Invalid_last_id"] });
  }
  const pageSize = 10;

  const skip = Math.max(0, (lastId - 1)) * pageSize;
  if (req.params.search) {
    query.description = { $regex: new RegExp(req.params.search, 'i') };
  }

  try {
    const posts = await Request.find(query).populate("user").populate("offer").populate("gig")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize).lean();    

    const totalCount = await Request.find(query);
    const totalPages = Math.ceil(totalCount.length / pageSize);
  
    if (posts.length > 0) {
      res.status(200).json({ success: true, request: posts,count: { totalPage: totalPages, currentPageSize: posts.length }  });
    } else {
      res.status(200).json({ success: false, request:[],message: req?.user?.lang=='english'?lang["nomorereq"]:lang2["nomorereq"],count: { totalPage: totalPages, currentPageSize: posts.length }  });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message:req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};


exports.deleteRequest = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Request.findByIdAndDelete(serviceId);

    if (service == null) {
      return res.status(404).json({ message:req?.user?.lang=='english'?lang["reqno"]:lang2["reqno"] });
    }

    res.status(200).json({ message: req?.user?.lang=='english'?lang["reqdelete"]:lang2["reqdelete"], Request: service });

  } catch (error) {
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};