const Application = require("../models/Application");
const Offer = require("../models/Offer");
const ProofWork = require("../models/ProofWork");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const { User } = require("../models/user");
const { sendNotification } = require("./notificationCreateService");
const lang2 = require('../routes/lang2.json');
const lang = require('../routes/lang.json');
const { notificationAdminService } = require("./notificationAdminService");
const Request = require("../models/Request");

function totalAmount(number) {
  return (Number(number)- Number(Number(number) * 0.20)).toFixed(2);
}

function getTwentyPercent(number) {
  return (Number(number) * 0.20).toFixed(2);
}

exports.create = async (req, res) => {
  try {
    const { to_id, cover_letter, bid_price, resume, description, gig_id } = req.body;

    if (!gig_id) {
      return res
        .status(400)
        .json({ success: false, message:  req?.user?.lang=='english'?lang["gigidnot"]:lang2["gigidnot"] });
    }
    const userId = req.user._id;

    const application = new Application({
      user: userId,
      to_id,
      cover_letter,
      bid_price,
      resume,
      description,
      gig: gig_id,
      seen: false,
    });
    const request = await Request.findOne({user:userId,to_id:to_id}).lean()
    if (request) {
      await Offer.findByIdAndUpdate(request.offer,{status:'accepted'}).lean()
    }

    await sendNotification({
      user: to_id,
      to_id: userId,
      description: req?.user?.lang=='english'?lang["offersub"]:lang2["offersub"],
      type: "order",
      title: req?.user?.lang=='english'?lang["offerSubmitted"]:lang2["offerSubmitted"],
      fcmtoken: "",
      order: application._id,
      noti: false,
    });
    const users = await User.findById(to_id);
    const myUser = await User.findById(userId);

    await sendNotification({
      user: userId,
      to_id: to_id,
      description: `${req?.user?.lang=='english'?lang["offerfo"]:lang2["offerfo"]} ${
        myUser.fname + " " + myUser.lname
      }`,
      type: "order",
      title:req?.user?.lang=='english'?lang["neworder"]:lang2["neworder"],
      fcmtoken: users.fcmtoken,
      order: application._id,
      noti: users.noti,
    });
    await notificationAdminService({
      user: userId,
      description: `${users.fname + " " + users.lname} He recibido una nueva oferta de ${
        myUser.fname + " " + myUser.lname
      }`,
      type: "order",
      title:lang2["neworder"],
      order: application._id,
    });

    await application.save();

    res
      .status(201)
      .json({
        success: true,
        message:req?.user?.lang=='english'?lang["ordercreate"]:lang2["ordercreate"],
        order: application,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};

exports.getAllEmployeeApplication = async (req, res) => {
  let query = {};
  const userId = req.user._id;
  const { status } = req.params;

  const validStatuses = [
    "all",
    "pending",
    "accepted",
    "completed",
    "cancelled",
    "rejected",
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message:req?.user?.lang=='english'?lang["invalidstat"]:lang2["invalidstat"] });
  }

  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }
  query.to_id = userId;

  if (status !== "all") {
    query.status = status;
  }

  const pageSize = 10;

  try {
    const applications = await Application.find(query)
      .sort({ _id: -1 })
      .populate("proofwork")
      .populate("to_id")
      .populate({
        path: "gig",
        populate: {
          path: "user",
        },
      })
      .limit(pageSize)
      .lean();

    if (applications.length > 0) {
      res.status(200).json({ success: true, orders: applications });
    } else {
      res.status(200).json({ success: false,orders:[], message:req?.user?.lang=='english'?lang["noorder"]:lang2["noorder"]});
    }
  } catch (error) {
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};
exports.getAllSellerApplication = async (req, res) => {
  let query = {};
  const userId = req.user._id;
  const { status } = req.params;

  const validStatuses = [
    "all",
    "pending",
    "accepted",
    "completed",
    "cancelled",
    "rejected",
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: req?.user?.lang=='english'?lang["invalidstat"]:lang2["invalidstat"] });
  }

  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }
  query.user = userId;

  if (status !== "all") {
    query.status = status;
  }

  const pageSize = 10;

  try {
    const applications = await Application.find(query)
      .sort({ _id: -1 })
      .populate("proofwork")
      .populate("to_id")
      .populate({
        path: "gig",
        populate: {
          path: "user",
        },
      })
      .limit(pageSize)
      .lean();

    if (applications.length > 0) {
      res.status(200).json({ success: true, orders: applications });
    } else {
      res.status(200).json({ success: false, orders:[],message: req?.user?.lang=='english'?lang["noorder"]:lang2["noorder"]});
    }
  } catch (error) {
    res.status(500).json({ message:req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};

exports.UpdateOrder = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user._id;

    const updatedSession = await Application.findOneAndUpdate(
      { to_id: userId, _id: applicationId },
      {
        view: true,
      },
      { new: true }
    );
    if (updatedSession == null) {
      return res.status(404).json({ message: req?.user?.lang=='english'?lang["ordernot"]:lang2["ordernot"] });
    }

    res
      .status(200)
      .json({ message: req?.user?.lang=='english'?lang["orderupdate"]:lang2["orderupdate"], order: updatedSession });
  } catch (error) {
    res.status(500).json({ message:req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};
exports.UpdateBuyerOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    await Application.updateMany(
      { to_id: userId, seen: false, status: { $in: ["pending", "rejected"] } },
      { $set: { seen: true } }
    );

    res.status(200).json({ message: req?.user?.lang=='english'?lang["orderupdate"]:lang2["orderupdate"] });
  } catch (error) {
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};
exports.UpdateSellerOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    await Application.updateMany(
      {
        user: userId,
        seen: false,
        status: { $in: ["accepted", "completed", "cancelled"] },
      },
      { $set: { seen: true } }
    );

    res.status(200).json({ message:req?.user?.lang=='english'?lang["orderupdate"]:lang2["orderupdate"] });
  } catch (error) {
    res.status(500).json({ message:req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};

exports.UpdateStatusBYcontractor = async (req, res) => {
  try {
    const { status } = req.params;

    const validStatuses = ["accepted", "cancelled", "completed"];

    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: req?.user?.lang=='english'?lang["invalidstat"]:lang2["invalidstat"] });
    }

    const applicationId = req.params.id;
    const userId = req.user._id;

    const updatedSession = await Application.findOneAndUpdate(
      { to_id: userId, _id: applicationId },
      {
        status,
        seen: false,
      },
      { new: true }
    ).populate("user")
      .lean();
    if (updatedSession == null) {
      return res.status(404).json({ message:req?.user?.lang=='english'?lang["ordernot"]:lang2["ordernot"]});
    }
    const myUser = await User.findById(userId);
    if (status == "accepted") {
      await sendNotification({
        user: userId,
        to_id: updatedSession.user._id,
        description: `${req?.user?.lang=='english'?lang["offeraccept"]:lang2["offeraccept"]} ${
          myUser.fname + " " + myUser.lname
        }`,
        type: "order",
        title:req?.user?.lang=='english'?lang["Offeraccepted"]:lang2["Offeraccepted"],
        fcmtoken: updatedSession.user.fcmtoken,
        order: applicationId,
        noti: updatedSession.user.noti,
      });
      await notificationAdminService({
        user: userId,
        description: `${ myUser.fname + " " + myUser.lname} ha aceptado la oferta de ${
          updatedSession.user.fname + " " + updatedSession.user.lname
        }`,
        type: "order",
        title:lang2["Offeraccepted"],
        order:applicationId,
      });
    }
    if (status == "completed") {

      const request = await Request.findOne({user:updatedSession.user._id,to_id:userId}).lean()
      if (request) {
       await Offer.findByIdAndUpdate(request.offer,{status:'completed'}).lean()
      }

      const transaction = new Transaction({
        user: updatedSession.user._id,
        order: updatedSession._id,
        balance: totalAmount(updatedSession.bid_price),
        type: "deposit",
        description: `${lang2["invoicefor"]} (` + updatedSession.description + `)`,
      });
      await transaction.save();
      
      const feeTransaction = new Transaction({
        user: updatedSession.user._id,
        order: updatedSession._id,
        balance: getTwentyPercent(updatedSession.bid_price),
        type: "fee",
        description: `${lang2["servicefee"]} (` + updatedSession.description + `)`,
      });
      await feeTransaction.save();

      let wallet={}

       wallet=await Wallet.findOne({user:updatedSession.user._id});
    
      if (!wallet) {
         wallet= new Wallet({
          user:updatedSession.user._id,
          balance:totalAmount(updatedSession.bid_price)
        })
      }
      
      wallet.balance=Number(wallet.balance)+Number(totalAmount(updatedSession.bid_price))

      await wallet.save()

      const transaction2 = new Transaction({
        user: userId,
        order: updatedSession._id,
        balance: updatedSession.bid_price,
        type: "withdraw",
        description: `${lang2["invoicefor"]} (` + updatedSession.description + ")",
      });

      await transaction2.save();


      const wallet2=await Wallet.findOne({user:userId});
    

      wallet2.balance=Number(wallet2.balance)-Number(updatedSession.bid_price)

      await wallet2.save()

      await sendNotification({
        user: userId,
        to_id: updatedSession.user._id,
        description: `${req?.user?.lang=='english'?lang["cong"]:lang2["cong"]} ${
          myUser.fname + " " + myUser.lname
        } ${req?.user?.lang=='english'?lang["receive"]:lang2["receive"]} ${updatedSession.bid_price} amount.`,
        type: "order",
        title: req?.user?.lang=='english'?lang["Ordercompleted"]:lang2["Ordercompleted"],
        fcmtoken: updatedSession.user.fcmtoken,
        order: applicationId,
        noti: updatedSession.user.noti,
      });
      await sendNotification({
        user: updatedSession.user._id,
        to_id: myUser._id,
        description: `${req?.user?.lang=='english'?lang["cong"]:lang2["cong"]} ${
          updatedSession.user.fname + " " + updatedSession.user.lname
        }. ${req?.user?.lang=='english'?lang["kindlyrate"]:lang2["kindlyrate"]}`,
        type: "rating",
        title: req?.user?.lang=='english'?lang["Ordercompleted"]:lang2["Ordercompleted"],
        fcmtoken: myUser.fcmtoken,
        gig: updatedSession.gig,
        noti: myUser.noti,
      });

      await notificationAdminService({
        user: userId,
        description: `La orden de ${updatedSession?.user?.fname + " " + updatedSession?.user?.lname} ha sido completada por ${myUser?.fname + " " + myUser?.lname}`,
        type: "order",
        title:lang2["Ordercompleted"],
        order:applicationId,
        gig: updatedSession.gig,
      });

      await Application.findOneAndUpdate(
        { _id: applicationId },
        {
          bid_price:Number(totalAmount(updatedSession.bid_price))
        },
        { new: true }
      )
    }
    if (status == "cancelled") {
      await sendNotification({
        user: userId,
        to_id: updatedSession.user._id,
        description: `${req?.user?.lang=='english'?lang["Ordercancelled"]:lang2["Ordercancelled"]} ${
          myUser.fname + " " + myUser.lname
        }`,
        type: "order",
        title: req?.user?.lang=='english'?lang["ordesub"]:lang2["ordesub"],
        fcmtoken: updatedSession.user.fcmtoken,
        order: applicationId,
        noti: updatedSession.user.noti,
      });
      await notificationAdminService({
        user: userId,
        description: `${lang2["Ordercancelled"]} ${
          myUser.fname + " " + myUser.lname
        }`,
        type: "order",
        title:lang2["ordesub"],
        order:applicationId,
      });
    }
    res
      .status(200)
      .json({
        message:
          status == "cancelled"
            ? req?.user?.lang=='english'?lang["Ordercancelled"]:lang2["Ordercancelled"]
            : req?.user?.lang=='english'?lang["Orderupdated"]:lang2["Orderupdated"],
        order: updatedSession,
      });
  } catch (error) {
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};

exports.submitWork = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user._id;
    const { link, description, docs } = req.body;

    const updatedSession = await Application.findOne({
      user: userId,
      _id: applicationId,
    }).populate("user").populate("to_id")

    if (updatedSession == null) {
      return res.status(404).json({ message:req?.user?.lang=='english'?lang["ordernot"]:lang2["ordernot"]});
    }

    const proofwork = new ProofWork({
      user: userId,
      to_id: updatedSession.to_id._id,
      link,
      description,
      order: applicationId,
      docs,
    });

    updatedSession.seen = false;

    updatedSession.proofwork = proofwork._id;

    await proofwork.save();
    await updatedSession.save();

    await sendNotification({
      user: updatedSession.user._id,
      to_id: updatedSession.to_id._id,
      description: `${req?.user?.lang=='english'?lang["ordersub"]:lang2["ordersub"]} ${
        updatedSession.user.fname + " " + updatedSession.user.lname
      }.`,
      type: "order",
      title:req?.user?.lang=='english'?lang["ordesub"]:lang2["ordesub"],
      fcmtoken: updatedSession.to_id.fcmtoken,
      order: applicationId,
      noti: updatedSession.to_id.noti,
    });

    res
      .status(200)
      .json({ message: req?.user?.lang=='english'?lang["Orderupdated"]:lang2["Orderupdated"], proofwork: proofwork });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};

exports.adminSideGigs = async (req, res) => {
  let query = {};

  const lastId = parseInt(req.params.id)||1;

  // Check if lastId is a valid number
  if (isNaN(lastId) || lastId < 0) {
    return res.status(400).json({ error:req?.user?.lang=='english'?lang["Invalid_last_id"]:lang2["Invalid_last_id"]});
  }
  const pageSize = 10;

  if (req.params.type) {
    query.status=req.params.type
  }
  const skip = Math.max(0, (lastId - 1)) * pageSize;

  try {
    const posts = await Application.find(query).populate("user").populate("proofwork")
    .populate("to_id").populate("gig")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize).lean();    

  const totalCount = await Application.find(query);
  const totalPages = Math.ceil(totalCount.length / pageSize);

    if (posts.length > 0) {
      res.status(200).json({ success: true, orders: posts,count: { totalPage: totalPages, currentPageSize: posts.length }  });
    } else {
      res.status(200).json({ success: false, orders:[],message: req?.user?.lang=='english'?lang["noorder"]:lang2["noorder"],count: { totalPage: totalPages, currentPageSize: posts.length }  });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message:req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};


exports.deleteorders = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Application.findByIdAndDelete(serviceId);

    if (service == null) {
      return res.status(404).json({ message: req?.user?.lang=='english'?lang["ordernot"]:lang2["ordernot"]});
    }

    res.status(200).json({ message: req?.user?.lang=='english'?lang["orderdelet"]:lang2["orderdelet"], order: service });

  } catch (error) {
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};