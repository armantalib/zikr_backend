const Category = require('../models/Category');
const lang2 = require('../routes/lang2.json');
const lang = require('../routes/lang.json');

exports.create = async (req, res) => {
  try {
    const { name, image } = req.body;
    const userId = req.user._id;
    const category = new Category({
      user: userId,
      name,
      image,
    });
    await category.save();

    res.status(201).json({ success: true, message: req.user.lang=='spanish'?lang2["catcreate"]:lang["catcreate"], category });
  } catch (error) {
    res.status(500).json({ success: false, message: req.user.lang=='spanish'?lang2["error"]:lang["error"] });
  }
};


exports.getAllCategories = async (req, res) => {
  const userId = req.user._id;
  
  const lastId = parseInt(req.params.id)||1;

  // Check if lastId is a valid number
  if (isNaN(lastId) || lastId < 0) {
    return res.status(400).json({ error: req.user.lang=='spanish'?lang2["invalid"]:lang["invalid"] });
  }
  const pageSize = 10;

  const skip = Math.max(0, (lastId - 1)) * pageSize;
  let query = {};
  if (req.params.search) {
    query.name = { $regex: new RegExp(req.params.search, 'i') };
  }
  query.user=userId

  try {
    const categories = await Category.find(query).skip(skip)
    .limit(pageSize).lean();

    const totalCount = await Category.find(query);
    const totalPages = Math.ceil(totalCount.length / pageSize);

    if (categories.length > 0) {
      res.status(200).json({ success: true, categories: categories,count: { totalPage: totalPages, currentPageSize: categories.length } });
    } else {
      res.status(200).json({ success: false,categories:[], message: req.user.lang=='spanish'?lang2["no_cat"]:lang["no_cat"],count: { totalPage: totalPages, currentPageSize: categories.length } });
    }
  } catch (error) {
    res.status(500).json({ message: req.user.lang=='spanish'?lang2["error"]:lang["error"] });
  }
};

exports.getAllCustomerCategories = async (req, res) => {
  let query = {};
  if (req.params.id) {
    query._id = { $gt: req.params.id };
  }
  query.status = 'active'
  try {
    const categories = await Category.find(query).sort({ _id: 1 }).lean();


    if (categories.length > 0) {
      res.status(200).json({ success: true, categories: categories });
    } else {
      res.status(200).json({ success: false,categories:[], message: lang2["no_cat"] });
    }
  } catch (error) {
    res.status(500).json({ message: lang2['error'] });
  }
};


exports.editCategories = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const userId = req.user._id;

    const { name, image } = req.body;

    const service = await Category.findOneAndUpdate(
      { user: userId, _id: serviceId },
      {
        name, image,
        updated_at: Date.now()
      },
      { new: true }
    );

    if (service == null) {
      return res.status(404).json({ message:req.user.lang=='spanish'?lang2["not_cat"]:lang["not_cat"] });
    }

    res.status(200).json({ message: req.user.lang=='spanish'?lang2["catupdate"]:lang["catupdate"], Category: service });

  } catch (error) {
    res.status(500).json({ message: req.user.lang=='spanish'?lang2["error"]:lang["error"]});
  }
};

exports.deactivateCategries = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const userId = req.user._id;

    const service = await Category.findOneAndUpdate(
      { user: userId, _id: serviceId },
      {
        status: req.params.status,
        updated_at: Date.now()
      },
      { new: true }
    );

    if (service == null) {
      return res.status(404).json({ message: req.user.lang=='spanish'?lang2["not_cat"]:lang["not_cat"] });
    }

    res.status(200).json({ message: req.user.lang=='spanish'?lang2["catupdate"]:lang["catupdate"], Category: service });

  } catch (error) {
    res.status(500).json({ message: req.user.lang=='spanish'?lang2["error"]:lang["error"] });
  }
};

exports.deleteCatrgoires = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Category.findByIdAndDelete(serviceId);

    if (service == null) {
      return res.status(404).json({ message: req.user.lang=='spanish'?lang2["not_cat"]:lang["not_cat"] });
    }

    res.status(200).json({ message:req.user.lang=='spanish'?lang2["cat_delete"]:lang["cat_delete"], Category: service });

  } catch (error) {
    res.status(500).json({ message: req.user.lang=='spanish'?lang2["error"]:lang["error"] });
  }
};

