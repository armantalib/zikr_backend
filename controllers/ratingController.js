const Rating = require('../models/Rating');
const { User } = require('../models/user');
const lang2 = require('../routes/lang2.json');
const lang = require('../routes/lang.json');

function calculateAverage(initialValue, numberToAdd) {
  if (initialValue == 0) return Number(numberToAdd)

  const sum = Number(initialValue) + Number(numberToAdd);
  const average = sum / 2; // Divide by 2 since there are two values

  return Number(Math.min(average, 5)); // Cap the average at 5 using Math.min
}

exports.createRating = async (req, res) => {
  try {
    const { to_id, rating, review,user_type,session } = req.body;
    const userId = req.user._id;

    const ratings = new Rating({
      user: userId,
      to_id, rating, review, user_type,session
    });

    const user = await User.findById(to_id)

    if (!user) return res.status(500).json({ message:req?.user?.lang=='english'?lang["nouserfound"]:lang["nouserfound"]});

    user.rating = calculateAverage(user?.rating || 0, rating)

    await user.save()

    await ratings.save();

    res.status(201).json({ success: true, message:req?.user?.lang=='english'?lang["ratingdone"]:lang["ratingdone"], ratings });
  } catch (error) {
    res.status(500).json({ success: false, message:req?.user?.lang=='english'?lang["error"]:lang["error"], error });
  }
};

exports.getUserRatings = async (req, res) => {
  
  let query = {};
  query.to_id = req.params.userId

  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }

  const pageSize = 10;

  try {
    const user = await User.findById(req.params.userId)
    if (!user) return res.status(500).json({ message:req?.user?.lang=='english'?lang["nouserfound"]:lang["nouserfound"]});

    const avg_rating = user.rating

    const rating = await Rating.find(query).sort({ _id: -1 }).populate("user")
      .limit(pageSize)
      .lean();

    const totalLength = await Rating.find({ to_id: req.params.userId, }).lean();
    const rating1 = await Rating.find({ to_id: req.params.userId, rating: 1 }).lean();
    const rating2 = await Rating.find({ to_id: req.params.userId, rating: 2 }).lean();
    const rating3 = await Rating.find({ to_id: req.params.userId, rating: 3 }).lean();
    const rating4 = await Rating.find({ to_id: req.params.userId, rating: 4 }).lean();
    const rating5 = await Rating.find({ to_id: req.params.userId, rating: 5 }).lean();
    if (rating.length > 0) {
      res.status(200).json({
        success: true,
        ratings: rating,
        totalLength: totalLength.length,
        totalsRating: {
          1: rating1.length,
          2: rating2.length,
          3: rating3.length,
          4: rating4.length,
          5: rating5.length,
        },
        avg_rating:avg_rating||0
      });
    } else {
      res.status(200).json({
        success: false, message: req?.user?.lang=='english'?lang["nomorerat"]:lang2["nomorerat"],
        ratings: [],
        totalLength: totalLength.length,
        totalsRating: {
          1: rating1.length,
          2: rating2.length,
          3: rating3.length,
          4: rating4.length,
          5: rating5.length,
        },
        avg_rating:avg_rating||0
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};


exports.checkRating = async (req, res) => {
  try {
    const userId = req.user._id;
    const trainingId = req.params.id;

    const user = await User.findById(userId)

    if (user) {
      for (let index = 0; index < user.ScholarCareer.length; index++) {
        const element = user.ScholarCareer[index];
        if (element.TrainingId == trainingId) {
          return res.status(200).json({ success: true, message: req?.user?.lang=='english'?lang["ratingyes"]:lang2["ratingyes"] });
        }
      }
      return res.status(200).json({ success: false, message:req?.user?.lang=='english'?lang["ratingnotper"]:lang2["ratingnotper"]});
    }

    res.status(200).json({ success: false, message: req?.user?.lang=='english'?lang["ratingnotper"]:lang2["ratingnotper"] });
  } catch (error) {
    res.status(500).json({ success: false, message: req?.user?.lang=='english'?lang["error"]:lang2["error"], error });
  }
};

exports.getUserPosts = async (req, res) => {
  let query = {};
  query.gig = req.params.gigId

  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }

  const pageSize = 10;

  try {
    const rating = await Rating.find(query).sort({ _id: -1 }).populate("user")
      .limit(pageSize)
      .lean();

    const totalLength = await Rating.find({ gig: req.params.gigId, }).lean();
    const rating1 = await Rating.find({ gig: req.params.gigId, rating: 1 }).lean();
    const rating2 = await Rating.find({ gig: req.params.gigId, rating: 2 }).lean();
    const rating3 = await Rating.find({ gig: req.params.gigId, rating: 3 }).lean();
    const rating4 = await Rating.find({ gig: req.params.gigId, rating: 4 }).lean();
    const rating5 = await Rating.find({ gig: req.params.gigId, rating: 5 }).lean();
    if (rating.length > 0) {
      res.status(200).json({
        success: true, ratings: rating,
        totalLength: totalLength.length,
        totalsRating: {
          1: rating1.length,
          2: rating2.length,
          3: rating3.length,
          4: rating4.length,
          5: rating5.length,
        }
      });
    } else {
      res.status(200).json({
        success: false, message: req?.user?.lang=='english'?lang["nomorerat"]:lang2["nomorerat"],
        ratings: [],
        totalLength: totalLength.length,
        totalsRating: {
          1: rating1.length,
          2: rating2.length,
          3: rating3.length,
          4: rating4.length,
          5: rating5.length,
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: req?.user?.lang=='english'?lang["error"]:lang2["error"]});
  }
};



exports.deleterating = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Rating.findByIdAndDelete(serviceId);

    if (service == null) {
      return res.status(404).json({ message:req?.user?.lang=='english'?lang["Invalid_last_id"]:lang2["Invalid_last_id"] });
    }

    res.status(200).json({ message:req?.user?.lang=='english'?lang["ratingdell"]:lang2["ratingdell"], rating: service });

  } catch (error) {
    res.status(500).json({ message:req?.user?.lang=='english'?lang["error"]:lang2["error"] });
  }
};