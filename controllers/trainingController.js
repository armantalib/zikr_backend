const favorite = require('../models/favorite');
const { School } = require('../models/school');
const { Training } = require('../models/training');
const { User } = require('../models/user');

exports.create = async (req, res) => {
  try {
    const { TrainingName, SchoolName, SchoolAddress, Email,
      County, Type, LogoURL, MoreInformations,
      Classes, DataType, Origin,
      Bio, Opinions, City, Modality, Domain } = req.body;
    const training = new Training({
      TrainingName, SchoolName, SchoolAddress, Email,
      County, Type, LogoURL, MoreInformations,
      Classes, DataType, Origin,
      Bio, Opinions, City, Modality, Domain,
      newlyCreated: true
    });
    await training.save();

    res.status(201).json({ success: true, message: 'Training created successfully', training });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.editTraining = async (req, res) => {
  try {
    const trainingId = req.params.id
    const { TrainingName, SchoolName, SchoolAddress, Email,
      County, Type, LogoURL, MoreInformations,
      Classes, DataType, Origin,
      Bio, Opinions, City, Modality, Domain } = req.body;
    const training = await Training.findByIdAndUpdate(trainingId,
      {
        TrainingName, SchoolName, SchoolAddress, Email,
        County, Type, LogoURL, MoreInformations,
        Classes, DataType, Origin,
        Bio, Opinions, City, Modality, Domain
      }, { new: true })

    res.status(201).json({ success: true, message: 'Training updated successfully', training });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


exports.getAllScools = async (req, res) => {

  let query = {};

  if (req.params.name) {
    query.Name = { $regex: new RegExp(req.params.name, 'i') };
  }

  try {
    const schools = await School.find(query).limit(10).lean()

    for (let school of schools) {
      school.TrainingsIds = await Training.find({ _id: { $in: school.TrainingsIds } })
    }

    if (schools.length > 0) {
      res.status(200).json({ success: true, schools: schools });
    } else {
      res.status(200).json({ success: false, message: 'No more schools found' });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getAllTraining = async (req, res) => {

  let query = {};

  if (req.params.name) {
    query.TrainingName = { $regex: new RegExp(req.params.name, 'i') };
  }

  try {
    const schools = await Training.find(query).limit(10).lean()

    if (schools.length > 0) {
      res.status(200).json({ success: true, trainings: schools });
    } else {
      res.status(200).json({ success: false, message: 'No more trainings found' });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.searchAllTraining = async (req, res) => {

  let query = {};

  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }

  if (req.params.name) {
    query.TrainingName = { $regex: new RegExp(req.params.name, 'i') };
  }

  let schoolquery = {};

  if (req.params.name) {
    schoolquery.Name = { $regex: new RegExp(req.params.name, 'i') };
  }
  if (req.params.schoolId) {
    schoolquery._id = { $lt: req.params.schoolId };
  }

  try {
    const schools = await Training.find(query).sort({ _id: -1 }).limit(10).lean()

    const schoolsData = await School.find(schoolquery).sort({ _id: -1 }).limit(10).lean()

    for (let school of schoolsData) {
      school.TrainingsIds = await Training.find({ _id: { $in: school.TrainingsIds } })
    }

    res.status(200).json({ success: true, trainings: schools, schools: schoolsData });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.remainingTraining = async (req, res) => {

  try {
    const schoolsData = await School.findById(req.params.schoolId)
    const TrainingsIds = await Training.find({ _id: { $in: schoolsData.TrainingsIds, $nin: await User.distinct('trainingIds') } })

    res.status(200).json({ success: true, trainings: TrainingsIds });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
  }
};

function mergeArrays(arr1, arr2) {
  // Combine the arrays
  const mergedArray = arr1
    .map(item => ({ ...item, key: 1 }))
    .concat(arr2.map(item => ({ ...item, key: 2 })));

  // Shuffle the merged array using Fisher-Yates algorithm
  for (let i = mergedArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mergedArray[i], mergedArray[j]] = [mergedArray[j], mergedArray[i]];
  }

  return mergedArray;
}

exports.filterTrainings = async (req, res) => {

  let query = {};

  if (req.body.type) {
    query.Type = req.body.type
  }
  if (req.body.last_id) {
    query._id = { $lt: req.body.last_id };
  }
  if (req.body.Capacity) {
    const capacity = parseInt(req.body.Capacity);
    query['MoreInformations.Capacity'] = { $lte: capacity };
  }
  if (req.body.Domain) {
    query.Domain = req.body.Domain;
  }
  if (req.body.County) {
    query.County = req.body.County;
  }

  if (req.body.search) {
    query.TrainingName = { $regex: new RegExp(req.body.search, 'i') };
  }

  let schoolquery = {};

  if (req.body.search) {
    schoolquery.Name = { $regex: new RegExp(req.body.search, 'i') };
  }
  if (req.body.schoolId) {
    schoolquery._id = { $lt: req.body.schoolId };
  }

  try {
    const schools = await Training.find(query).sort({ _id: -1 }).limit(10).lean()

    const schoolsData = await School.find(schoolquery).sort({ _id: -1 }).limit(10).lean()

    for (let school of schoolsData) {
      school.TrainingsIds = await Training.find({ _id: { $in: school.TrainingsIds } })
    }
    const filterData = mergeArrays(schools, schoolsData)

    const trainingId = schools.length > 0 ? schools[schools.length - 1]?._id : req.body.last_id
    const schoolId = schoolsData.length > 0 ? schoolsData[schoolsData.length - 1]?._id : req.body.schoolId

    if (filterData.length > 0) {
      res.status(200).json({ success: true, filter: filterData, trainingId: trainingId, schoolId: schoolId });
    } else {
      res.status(200).json({ success: false, message: 'No more trainings found', filter: [], trainingId: trainingId, schoolId: schoolId });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getDashBoard = async (req, res) => {
  try {
    let trainquery = {};
    const userId = req.user._id

    const user = await User.findById(userId)

    if (user.type == 'student') {
      trainquery.Domain = { $in: user.domaines };
    }

    const training = await Training.find(trainquery).limit(10).lean()
    const schools = await School.find({ Type: 'Université' }).limit(10).lean()
    for (let school of schools) {
      school.TrainingsIds = await Training.find({ _id: { $in: school.TrainingsIds } })
    }
    let query = {};
    query.Type = { $regex: new RegExp('Ecole de commerce', 'i') };

    const bussinessSchools = await School.find(query).limit(10).lean()
    for (let school of bussinessSchools) {
      school.TrainingsIds = await Training.find({ _id: { $in: school.TrainingsIds } })
    }
    const partnerSchool = await School.find({ Name: { $regex: new RegExp('University of Toulouse Capitole', 'i') } }).limit(10).lean()
    for (let school of partnerSchool) {
      school.TrainingsIds = await Training.find({ _id: { $in: school.TrainingsIds } })
    }
    res.status(200).json({ success: true, trainings: training, schools, bussinessSchools, partner: partnerSchool });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.suggestedUniversities = async (req, res) => {
  try {
    let query = {};
    if (req.params.id) {
      query._id = { $lt: req.params.id };
    }

    query.Type = 'Université'

    const schools = await School.find(query).sort({ _id: -1 }).limit(10).lean()
    for (let school of schools) {
      school.TrainingsIds = await Training.find({ _id: { $in: school.TrainingsIds } })
    }
    res.status(200).json({ success: true, schools });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.bussinessSchools = async (req, res) => {
  try {

    let query = {};
    if (req.params.id) {
      query._id = { $lt: req.params.id };
    }
    query.Type = { $regex: new RegExp('Ecole de commerce', 'i') };

    const bussinessSchools = await School.find(query).sort({ _id: -1 }).limit(10).lean()
    for (let school of bussinessSchools) {
      school.TrainingsIds = await Training.find({ _id: { $in: school.TrainingsIds } })
    }
    res.status(200).json({ success: true, schools: bussinessSchools });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.suggestedTrainings = async (req, res) => {
  let query = {};
  const userId = req.user._id

  const user = await User.findById(userId)

  if (user.type == 'student') {
    query.Domain = { $in: user.domaines };
  }

  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }
  try {
    const training = await Training.find(query).sort({ _id: -1 })
      .limit(10)
      .lean();
    res.status(200).json({ success: true, trainings: training });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.checkLike = async (req, res) => {
  try {
    const trainingId = req.params.id;
    const userId = req.user._id;
    const existingLike = await favorite.findOne({ user: userId, training: trainingId });

    if (existingLike) {
      res.status(200).json({ success: true, message: 'Like exist' });
    } else {
      res.status(200).json({ success: false, message: 'Like not exist' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const trainingId = req.params.id;
    const userId = req.user._id;
    const existingLike = await favorite.findOne({ user: userId, training: trainingId });

    if (existingLike) {
      return await dislike(trainingId, res, userId);
    }
    const likePost = new favorite({
      user: userId,
      training: trainingId
    });

    await likePost.save()

    res.status(200).json({ message: 'Like added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const dislike = async (trainingId, res, userId) => {
  try {
    await favorite.findOneAndDelete({ training: trainingId, user: userId });
    res.status(200).json({ message: 'Like deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
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
    const likedJobs = await favorite.find(query)
      .populate('training')
      .sort({ _id: -1 })
      .limit(10)
      .lean();

    const jobs = likedJobs.map((like) => like.training);
    if (jobs.length > 0) {
      res.status(200).json({ success: true, training: jobs });
    } else {
      res.status(200).json({ success: false, message: 'No more favorite training found' });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' });
  }
};

