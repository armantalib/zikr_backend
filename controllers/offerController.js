const Offer = require('../models/Offer');
const OfferLike = require('../models/OfferLike');

const lang2 = require('../routes/lang2.json');
const lang = require('../routes/lang.json');

exports.createPost = async (req, res) => {
  try {
    const {
      title,
      images,
      category,
      position,
      comp_name,
      job_type,
      location,
      description,
      requirements,
      degree,
      experience,
      specialization,
      price
    } = req.body;
    const userId = req.user._id;

    const post = new Offer({
      user: userId,
      title,
      images,
      category,
      position,
      comp_name,
      job_type,
      location,
      description,
      requirements,
      degree,
      experience,
      specialization,
      price
    });

    await post.save();
    res.status(201).json({ success: true, message:req?.user?.lang=='english'?lang["offercreat"]:lang2["offercreat"], offer: post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};

exports.getMyGigs = async (req, res) => {
  let query = {};
  const userId = req.user._id

  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }
  query.user = userId

  const pageSize = 10;

  try {
    const posts = await Offer.find(query).populate("user").populate("category")
      .sort({ _id: -1 })
      .limit(pageSize)
      .lean();

    if (posts.length > 0) {
      res.status(200).json({ success: true, offers: posts });
    } else {
      res.status(200).json({ success: false,offers:[], message: req?.user?.lang=='english'?lang["nomoreoffer"]:lang2["nomoreoffer"] });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};

exports.getallOffers = async (req, res) => {
  let query = {};
  const userId = req.user._id

  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }
  query.user = { $ne: userId }
  query.status = 'pending'

  const pageSize = 10;

  try {
    const posts = await Offer.find(query).populate("user").populate("category").populate("requests").populate("likes")
      .sort({ _id: -1 })
      .limit(pageSize)
      .lean();

    if (posts.length > 0) {
      for (const post of posts) {
        post.TotalLikes = post?.likes?.length || 0
        post.likes = Array.isArray(post.likes) && post.likes.some(like => like.user.toString() === userId.toString());
        post.applied = Array.isArray(post.requests) && post.requests.some(like => like.user.toString() === userId.toString());
        delete post.requests
      }
      res.status(200).json({ success: true, offers: posts });
    } else {
      res.status(200).json({ success: false,offers:[], message: req?.user?.lang=='english'?lang["nomoreoffer"]:lang2["nomoreoffer"]});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message:req?.user?.lang=='english'?lang["error"]:lang2["error"] });
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
    query.title = { $regex: new RegExp(req.params.search, 'i') };
  }

  try {
    const posts = await Offer.find(query).populate("user").populate("category").populate("requests").populate("likes")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize).lean();    

  const totalCount = await Offer.find(query);
  const totalPages = Math.ceil(totalCount.length / pageSize);

    if (posts.length > 0) {
      res.status(200).json({ success: true, offers: posts,count: { totalPage: totalPages, currentPageSize: posts.length }  });
    } else {
      res.status(200).json({ success: false, offers:[],message:req?.user?.lang=='english'?lang["nomoreoffer"]:lang2["nomoreoffer"],count: { totalPage: totalPages, currentPageSize: posts.length }  });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};

exports.catgoryBaseOffers = async (req, res) => {
  let query = {};
  const userId = req.user._id

  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }
  query.user = { $ne: userId }
  query.category = req.params.catId
  query.status = 'pending'

  const pageSize = 10;

  try {
    const posts = await Offer.find(query).populate("user").populate("category").populate("requests").populate("likes")
      .sort({ _id: -1 })
      .limit(pageSize)
      .lean();

    if (posts.length > 0) {
      for (const post of posts) {
        post.TotalLikes = post?.likes?.length || 0
        post.likes = Array.isArray(post.likes) && post.likes.some(like => like.user.toString() === userId.toString());
        post.applied = Array.isArray(post.requests) && post.requests.some(like => like.user.toString() === userId.toString());
        delete post.requests
      }
      res.status(200).json({ success: true, offers: posts });
    } else {
      res.status(200).json({ success: false, offers:[],message: req?.user?.lang=='english'?lang["nomoreoffer"]:lang2["nomoreoffer"] });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message:req?.user?.lang=='english'?lang["error"]:lang2["error"]});
  }
};

exports.editMyGigs = async (req, res) => {
  const {
    title,
    images,
    category,
    position,
    comp_name,
    job_type,
    location,
    description,
    requirements,
    degree,
    experience,
    specialization,
    price
  } = req.body;

  // Create an object to store the fields to be updated
  const updateFields = Object.fromEntries(
    Object.entries({
      title,
      images,
      category,
      position,
      comp_name,
      job_type,
      location,
      description,
      requirements,
      degree,
      experience,
      specialization,
      price
    }).filter(([key, value]) => value !== undefined)
  );

  // Check if there are any fields to update
  if (Object.keys(updateFields).length === 0) {
    return res.status(400).send({ success: false, message: req?.user?.lang=='english'?lang["novalidfield"]:lang2["novalidfield"] });
  }
  const gig = await Offer.findOneAndUpdate(
    { user: req.user._id, _id: req.params.id },
    updateFields,
    {
      new: true
    }
  );

  if (!gig) return res.status(404).send({ success: false, message:req?.user?.lang=='english'?lang["offergivenid"]:lang2["offergivenid"] });

  res.send({ success: true, message: req?.user?.lang=='english'?lang["offerupdate"]:lang2["offerupdate"], offer: gig });
}

exports.deleteMyOffer = async (req, res) => {

  const userId = req.user._id
  const offerId = req.params.id

  const gig = await Offer.findOneAndDelete({ user: userId, _id: offerId });

  if (!gig) return res.status(404).send({ success: false, message: req?.user?.lang=='english'?lang["offergivenid"]:lang2["offergivenid"]});

  res.send({ success: true, message: req?.user?.lang=='english'?lang["offerdelete"]:lang2["offerdelete"], offer: gig });
}

exports.likePost = async (req, res) => {
  try {
    const offerId = req.params.id;
    const userId = req.user._id;

    const existingLike = await OfferLike.findOne({ user: userId, offer: offerId });

    if (existingLike) {
      return await dislike(offerId, res);
    }
    const likePost = new like({
      user: userId,
      offer: offerId
    });


    const updatedPost = await Offer.findByIdAndUpdate(
      offerId,
      { $push: { likes: likePost._id } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: req?.user?.lang=='english'?lang["offergivenid"]:lang2["offergivenid"] });
    }

    await likePost.save()

    res.status(200).json({ message: req?.user?.lang=='english'?lang["likeadd"]:lang2["likeadd"], Offer: updatedPost });
  } catch (error) {

    console.log(error)
    res.status(500).json({ message:req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};

const dislike = async (offerId, res) => {
  try {

    const deletedLike = await OfferLike.findOneAndDelete({ offer: offerId });

    if (!deletedLike) {
      return res.status(404).json({ message: req?.user?.lang=='english'?lang["offergivenid"]:lang2["offergivenid"] });
    }

    const updatedPost = await Offer.findByIdAndUpdate(
      offerId,
      { $pull: { likes: deletedLike._id } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message:req?.user?.lang=='english'?lang["offergivenid"]:lang2["offergivenid"] });
    }

    res.status(200).json({ message: req?.user?.lang=='english'?lang["likedelete"]:lang2["likedelete"], offer: updatedPost });
  } catch (error) {
    res.status(500).json({ message:req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};


exports.getMyFavPosts = async (req, res) => {
  const userId = req.user._id
  let query = {};
  if (req.params.id) {
    query._id = { $lt: req.body.id };
  }
  query.user = userId;
  try {
    const likedJobs = await OfferLike.find(query)
      .populate({
        path: 'offer',
        populate: [
          { path: 'user', model: 'user' },
          { path: 'applications', model: 'Application' }
        ]
      })
      .sort({ _id: -1 })
      .limit(10)
      .lean();

    const jobs = likedJobs.map((like) => like.job);
    if (jobs.length > 0) {
      for (const post of jobs) {
        post.TotalLikes = post?.likes?.length || 0
        post.likes = true
        post.applied = Array.isArray(post.applications) && post.applications.some(like => like.user.toString() === userId.toString());
        delete post.applications
      }
      res.status(200).json({ success: true, offers: jobs });
    } else {
      res.status(200).json({ success: false, offers:[],message: req?.user?.lang=='english'?lang["nofavoffer"]:lang2["nofavoffer"] });
    }
  } catch (error) {
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};

exports.UpdateStatusBYcontractor = async (req, res) => {
  try {
    const { status } = req.params;

    const validStatuses = ['cancelled']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message:req?.user?.lang=='english'?lang["invalidstat"]:lang2["invalidstat"] });
    }

    const applicationId = req.params.id;
    const userId = req.user._id;

    const updatedSession = await Offer.findOneAndUpdate(
      { user: userId, _id: applicationId },
      {
        status
      },
      { new: true }
    )
    if (updatedSession == null) {
      return res.status(404).json({ message: req?.user?.lang=='english'?lang["offergivenid"]:lang2["offergivenid"] });
    }
    res.status(200).json({ message:req?.user?.lang=='english'?lang["offerupdate"]:lang2["offerupdate"], offer: updatedSession });
  } catch (error) {
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};



exports.deleteOffer = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Offer.findByIdAndDelete(serviceId);

    if (service == null) {
      return res.status(404).json({ message: req?.user?.lang=='english'?lang["offergivenid"]:lang2["offergivenid"]});
    }

    res.status(200).json({ message:req?.user?.lang=='english'?lang["offerdelete"]:lang2["offerdelete"], Offer: service });

  } catch (error) {
    res.status(500).json({ message:req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};