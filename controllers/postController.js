const Gig = require('../models/Gig');
const like = require('../models/like');
const { User } = require('../models/user');
const lang2 = require('../routes/lang2.json');
const lang = require('../routes/lang.json');
const logger = require('../startup/logger');

exports.createPost = async (req, res) => {
  try {
    const { title, images, category, service_type, description, keywords, requirements, plans } = req.body;
    const userId = req.user._id;

    const post = new Gig({
      user: userId,
      title,
      images,
      category,
      service_type,
      description,
      keywords,
      requirements,
      plans
    });

    await post.save();
    res.status(201).json({ success: true, message: req?.user?.lang=='english'?lang["gigcreate"]:lang2["gigcreate"], gig: post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message:  req?.user?.lang=='english'?lang["error"]:lang2["error"] });
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
    const posts = await Gig.find(query).populate("user").populate("category")
      .sort({ _id: -1 })
      .limit(pageSize)
      .lean();

    if (posts.length > 0) {
      res.status(200).json({ success: true, gigs: posts });
    } else {
      res.status(200).json({ success: false, gigs:[],message:  req?.user?.lang=='english'?lang["nomoregig"]:lang2["nomoregig"]});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message:  req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};

exports.adminSideGigs = async (req, res) => {
  let query = {};

  const lastId = parseInt(req.params.id)||1;

  // Check if lastId is a valid number
  if (isNaN(lastId) || lastId < 0) {
    return res.status(400).json({ error:  req?.user?.lang=='english'?lang["Invalid_last_id"]:lang2["Invalid_last_id"]});
  }
  const pageSize = 10;

  if (req.params.search) {
    query.title = { $regex: new RegExp(req.params.search, 'i') };
  }

  const skip = Math.max(0, (lastId - 1)) * pageSize;

  try {
    const posts = await Gig.find(query).populate("user").populate("category")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize).lean();    

  const totalCount = await Gig.find(query);
  const totalPages = Math.ceil(totalCount.length / pageSize);

    if (posts.length > 0) {
      res.status(200).json({ success: true, gigs: posts,count: { totalPage: totalPages, currentPageSize: posts.length }  });
    } else {
      res.status(200).json({ success: false, gigs:[],message:  req?.user?.lang=='english'?lang["nomoregig"]:lang2["nomoregig"],count: { totalPage: totalPages, currentPageSize: posts.length }  });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message:  req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};

exports.searchGigs = async (req, res) => {
  let query = {};

  const { type } = req.params

  logger.info(`req.params.search ===>${type}`)


  const validStatuses = ['related', 'promoted', 'cat', 'search'];

  if (!validStatuses.includes(type)) {
    return res.status(400).json({ success: false, message:  req?.user?.lang=='english'?lang["invalidstat"]:lang2["invalidstat"] });
  }
  let user = null;
  if (req?.user?._id) {
    const userId = req.user._id
    user = await User.findById(userId)
    if (!user) {
      return res.status(400).json({ success: false, message:  req?.user?.lang=='english'?lang["nouserfound"]:lang2["nouserfound"] });
    }
  }

  switch (type) {
    case 'related':
      if (user) {
        query.category = Array.isArray(user.profession)?{$in:[user.profession]}:user.profession
      }
      break;
    case 'promoted':
      if (user) {
        query.category = Array.isArray(user.profession)?{$in:[user.profession]}:user.profession
      }
      break;
    case 'cat':
      if (req.params.search) {
        query.category = req.params.search
      }
      break;
    case 'search':
      if (req.params.search) {
        const searchRegex = new RegExp(req.params.search, 'i');
        const searchQuery = [
          { title: { $regex: searchRegex } },
          { service_type: { $regex: searchRegex } }
        ];
        query.$or = searchQuery.concat({ keywords: { $in: searchRegex } });
      }else{
       return res.status(200).json({ success: false,gigs:[], message: req?.user?.lang=='english'?lang["nomoregig"]:lang2["nomoregig"]});
      }
      break;

    default:
      break;
  }

  const pageSize = 20;

  try {
    const posts = await Gig.find(query).populate("user").populate("category").populate("likes")
      .sort({ _id: -1 })
      .limit(pageSize)
      .lean();

    if (posts.length > 0) {
      for (let post of posts) {
        post.TotalLikes = post?.likes?.length || 0
        post.likes = req?.user?._id ? Array.isArray(post.likes) && post.likes.some(like => like.user.toString() === req.user._id.toString()) : false
      }
      res.status(200).json({ success: true, gigs: posts });
    } else {
      res.status(200).json({ success: false,gigs:[], message:  req?.user?.lang=='english'?lang["nomoregig"]:lang2["nomoregig"]});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message:  req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};

exports.editMyGigs = async (req, res) => {
  const {
    title,
    images,
    category,
    service_type,
    description,
    keywords,
    requirements,
    plans
  } = req.body;

  // Create an object to store the fields to be updated
  const updateFields = Object.fromEntries(
    Object.entries({
      title,
      images,
      category,
      service_type,
      description,
      keywords,
      requirements,
      plans
    }).filter(([key, value]) => value !== undefined)
  );

  // Check if there are any fields to update
  if (Object.keys(updateFields).length === 0) {
    return res.status(400).send({ success: false, message: req?.user?.lang=='english'?lang["novalidfield"]:lang2["novalidfield"] });
  }
  const gig = await Gig.findOneAndUpdate(
    { user: req.user._id, _id: req.params.id },
    updateFields,
    {
      new: true
    }
  );

  if (!gig) return res.status(404).send({ success: false, message:  req?.user?.lang=='english'?lang["gigupdate"]:lang2["gigupdate"] });

  res.send({ success: true, message:  req?.user?.lang=='english'?lang["gigcreate"]:lang2["gigcreate"], gig: gig });
}
exports.detailsGigs = async (req, res) => {

  
  const gig = await Gig.findById(req.params.id).populate("user").populate("category").populate("likes").lean()
  
  if (!gig) return res.status(404).send({ success: false, message:  req?.user?.lang=='english'?lang["notgigfound"]:lang2["notgigfound"] });
  let TotalLikes = 0;
  let likes = false;
  
  if (req?.user?._id) {
    const userId=req.user._id
    TotalLikes = gig?.likes?.length || 0
    likes = Array.isArray(gig.likes) && gig.likes.some(like => like.user.toString() === userId.toString());
  }

  const newGig = { ...gig.toObject(), likes, TotalLikes, };

  res.send({ success: true, gig: newGig });
}
exports.userGigs = async (req, res) => {

  const gig = await Gig.find({ user: req.params.userid }).populate("user").populate("category").populate("likes").sort({ _id: -1 }).lean()

  if (gig.length == 0) return res.status(200).send({ success: false, gig: [] });

  if (req?.user?._id) {
   const userId=req.user._id 
    for (let post of gig) {
      post.TotalLikes = post?.likes?.length || 0
      post.likes = req?.user?._id ? Array.isArray(post.likes) && post.likes.some(like => like.user.toString() === userId.toString()) : false
    }
  }

  res.send({ success: true, gig: gig });
}


exports.likePost = async (req, res) => {
  try {
    const gigId = req.params.id;
    const userId = req.user._id;

    const existingLike = await like.findOne({ user: userId, gig: gigId });

    if (existingLike) {
      return await dislike(gigId, res);
    }
    const likePost = new like({
      user: userId,
      gig: gigId
    });


    const updatedPost = await Gig.findByIdAndUpdate(
      gigId,
      { $push: { likes: likePost._id } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message:  req?.user?.lang=='english'?lang["notgigfound"]:lang2["notgigfound"]});
    }

    await likePost.save()

    res.status(200).json({ message:  req?.user?.lang=='english'?lang["likeadd"]:lang2["likeadd"], gig: updatedPost });
  } catch (error) {

    console.log(error)
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"]});
  }
};

const dislike = async (gigId, res) => {
  try {

    const deletedLike = await like.findOneAndDelete({ gig: gigId });

    if (!deletedLike) {
      return res.status(404).json({ message:  req?.user?.lang=='english'?lang["gigcreate"]:lang2["gigcreate"]});
    }

    const updatedPost = await Gig.findByIdAndUpdate(
      gigId,
      { $pull: { likes: deletedLike._id } },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: req?.user?.lang=='english'?lang["notgigfound"]:lang2["notgigfound"] });
    }

    res.status(200).json({ message:  req?.user?.lang=='english'?lang["likedelete"]:lang2["likedelete"], gig: updatedPost });
  } catch (error) {
    res.status(500).json({ message:  req?.user?.lang=='english'?lang["error"]:lang2["error"]});
  }
};


exports.getMyFavPosts = async (req, res) => {
  const userId = req.user._id
  let query = {};
  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }
  query.user = userId;
  try {
    const likedJobs = await like.find(query)
      .populate({
        path: 'gig',
        populate: [
          { path: 'user', model: 'user' },
          { path: 'category', model: 'Category' }
        ]
      })
      .sort({ _id: -1 })
      .limit(10)
      .lean();

    const jobs = likedJobs.map((like) => like.gig);

    if (jobs.length > 0) {
      for (const post of jobs) {
        post.TotalLikes = post?.likes?.length || 0
        post.likes = true
      }
      res.status(200).json({ success: true, gigs: jobs });
    } else {
      res.status(200).json({ success: false, gigs:[],message:  req?.user?.lang=='english'?lang["nofavgig"]:lang2["nofavgig"] });
    }
  } catch (error) {
    res.status(500).json({ message:  req?.user?.lang=='english'?lang["error"]:lang2["error"]});
  }
};



exports.deleteGig = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Gig.findByIdAndDelete(serviceId);

    if (service == null) {
      return res.status(404).json({ message:  req?.user?.lang=='english'?lang["notgigfound"]:lang2["notgigfound"] });
    }

    res.status(200).json({ message:  req?.user?.lang=='english'?lang["gigdelete"]:lang2["gigdelete"], Gig: service });

  } catch (error) {
    res.status(500).json({ message:  req?.user?.lang=='english'?lang["error"]:lang2["error"]});
  }
};