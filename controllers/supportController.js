const Support = require("../models/Support");
const lang2 = require('../routes/lang2.json');
const lang = require('../routes/lang.json');

exports.create = async (req, res) => {
  try {
    const { name, phone, email, msg } = req.body;
    const support = new Support({
      name, phone, email, msg
    });

    await support.save();

    res.status(201).json({ success: true, message: req?.user?.lang=='english'?lang["messagesent"]:lang2["messagesent"], message: support });
  } catch (error) {
    res.status(500).json({ success: false, message: req?.user?.lang=='english'?lang["error"]:lang2["error"],});
  }
};

exports.getAdminnotifications = async (req, res) => {
  const lastId = parseInt(req.params.id);

  // Check if lastId is a valid number
  if (isNaN(lastId) || lastId < 0) {
    return res.status(400).json({ error: req?.user?.lang=='english'?lang["Invalid_last_id"]:lang2["Invalid_last_id"],});
  }

  let query={};
  if (req.params.search) {
    query.name = { $regex: new RegExp(req.params.search, 'i') };
  }

  const pageSize = 10;

  const skip = Math.max(0, (lastId - 1)) * pageSize;
  try {
    const categories = await Support.find(query)
      .skip(skip)
      .limit(pageSize)
      .lean();

    const totalCount = await Support.find(query);
    const totalPages = Math.ceil(totalCount.length / pageSize);

    if (categories.length > 0) {
      res.status(200).json({ success: true, Messages: categories, count: { totalPage: totalPages, currentPageSize: categories.length } });
    } else {
      res.status(200).json({ success: false, message: req?.user?.lang=='english'?lang["nome"]:lang2["nome"], Messages: categories, count: { totalPage: totalPages, currentPageSize: 0 } });
    }
  } catch (error) {
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"], });
  }
};


exports.attendTheSupport = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Support.findOneAndUpdate(
      { _id: serviceId },
      {
        attended: true,
        updated_at: Date.now()
      },
      { new: true }
    );

    if (service == null) {
      return res.status(404).json({ message: req?.user?.lang=='english'?lang["supportnot"]:lang2["supportnot"],});
    }

    res.status(200).json({ message: req?.user?.lang=='english'?lang["supportupd"]:lang2["supportupd"], service: service });

  } catch (error) {
    res.status(500).json({ message:req?.user?.lang=='english'?lang["error"]:lang2["error"], });
  }
};

