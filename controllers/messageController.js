const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { User } = require('../models/user');

exports.sendMessage = async (req, res) => {
  try {
    const { to_id, message } = req.body;
    const userId = req.user._id;

    let conversationId = ''
    // Check if a conversation already exists
    const existingConversation = await Conversation.findOne({ participants: { $all: [userId, to_id] } });
    if (existingConversation) {
      conversationId = existingConversation._id
    } else {
      // Create a new conversation if it doesn't exist
      const conversation = new Conversation({ participants: [to_id, userId] });
      await conversation.save();
      conversationId = conversation._id
    }

    // Create and save the new message
    const newMessage = new Message({
      conversationId,
      sender: userId,
      message,
    });
    await newMessage.save();

    // Save the conversation (if new)
    if (!existingConversation) {
      await Conversation.findByIdAndUpdate(
        conversationId,
        { $addToSet: { messageId: newMessage._id } },
        { new: true }
      )
    }

    res.status(201).json({ message: newMessage });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create conversation or message' });
  }
};

exports.getUserConversations = async (req, res) => {
  try {
    // Extract the user ID from the request object
    const userId = req.user._id;

    console.log(userId)

    let query = {};

    if (req.params.id) {
      query._id = { $lt: req.params.id };
    }

    query.participants = { $in: [userId] }

    const pageSize = 10;

    // Find conversations where the user is a participant
    const conversations = await Conversation.find(query)
      .sort({ _id: -1 })
      .limit(pageSize)
      .lean().select('-messageId').populate("participants")

    for (let conversation of conversations) {
      const messages = await Message.find({ conversationId: conversation._id }).sort({ _id: -1 }).limit(1);
      const otherId = conversation.participants.filter(id => id?._id.toString() !== userId.toString())
      conversation.otherUser = otherId[0]
      delete conversation.participants
      const unseenMessages = await Message.find({ conversationId: conversation._id, sender: otherId[0]?._id, seen: false })
      if (messages) {
        conversation.lastMsg = messages[0]
        conversation.unseen = unseenMessages.length
      }
    }
    // Respond with a success status and the list of conversations
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.log(error)
    // If an error occurs during the execution, respond with a 500 Internal Server Error
    res.status(500).json({ message: 'Failed to fetch conversations', error });
  }
};
exports.getMessages = async (req, res) => {
  try {
    const to_id = req.params.userId;

    const userId = req.user._id;

    // Check if a conversation already exists
    const existingConversation = await Conversation.findOne({ participants: { $all: [userId, to_id] } }).select('-messageId').populate("participants")

    if (!existingConversation) {
      const user = await User.findById(to_id).select('-password');

      return res.status(200).json({ success: true, messages: [], user });
    }

    let query = {};

    if (req.params.id) {
      query._id = { $lt: req.params.id };
    }
    query.conversationId = existingConversation._id;

    const pageSize = 30;

    // Find conversations where the user is a participant
    const messages = await Message.find(query).sort({ _id: -1 })
      .limit(pageSize)
      .lean();

    const otherId = existingConversation.participants.filter(id => id?._id.toString() !== userId)

    if (messages.length > 0) {
      await Message.updateMany(
        { conversationId: existingConversation._id, sender: to_id },
        { $set: { seen: true } }
      );

      // Respond with a success status and the list of conversations
      return res.status(200).json({ success: true, messages, user: otherId[0] });
    }
    return res.status(200).json({ success: false, messages: [], user: otherId[0] });

  } catch (error) {
    // If an error occurs during the execution, respond with a 500 Internal Server Error
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
};

exports.adminSideGigs = async (req, res) => {
  let query = {};

  const lastId = parseInt(req.params.id)||1;

  // Check if lastId is a valid number
  if (isNaN(lastId) || lastId < 0) {
    return res.status(400).json({ error: 'Invalid last_id' });
  }
  const pageSize = 10;

  const skip = Math.max(0, (lastId - 1)) * pageSize;

  try {
    const posts = await Conversation.find(query).populate("participants")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize).lean();    

  const totalCount = await Conversation.find(query);
  const totalPages = Math.ceil(totalCount.length / pageSize);

    if (posts.length > 0) {
      res.status(200).json({ success: true, conversations: posts,count: { totalPage: totalPages, currentPageSize: posts.length }  });
    } else {
      res.status(200).json({ success: false, conversations:[],message: 'No more conversations found',count: { totalPage: totalPages, currentPageSize: posts.length }  });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.adminSideMessage = async (req, res) => {
  let query = {};

  const lastId = parseInt(req.params.id)||1;

  const conversationsId=req.params.conversationsId

  // Check if lastId is a valid number
  if (isNaN(lastId) || lastId < 0) {
    return res.status(400).json({ error: 'Invalid last_id' });
  }
  
  query.conversationId=conversationsId

  const pageSize = 10;

  const skip = Math.max(0, (lastId - 1)) * pageSize;

  try {
    const posts = await Message.find(query).populate("sender")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize).lean();    

  const totalCount = await Message.find(query);
  const totalPages = Math.ceil(totalCount.length / pageSize);

    if (posts.length > 0) {
      res.status(200).json({ success: true, messages: posts,count: { totalPage: totalPages, currentPageSize: posts.length }  });
    } else {
      res.status(200).json({ success: false, messages:[],message: 'No more messages found',count: { totalPage: totalPages, currentPageSize: posts.length }  });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.allSeen = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [otherUserId, userId] },
    });

    if (conversation) {
      const otherId = conversation.participants.filter(id => id.toString() !== userId)
      const updateResult = await Message.updateMany(
        { conversationId: conversation._id, sender: otherId[0], seen: false },
        { $set: { seen: true } }
      );
      // Respond with a success status and the list of conversations
      return res.status(200).json({ success: true, updateResult });
    }
    res.status(200).json({ success: false, });
  } catch (error) {
    // If an error occurs during the execution, respond with a 500 Internal Server Error
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};


exports.newMessage = async (req, res) => {
  try {
    const to_id = req.params.userId;

    const userId = req.user._id;

    // Check if a conversation already exists
    const existingConversation = await Conversation.findOne({ participants: { $all: [userId, to_id] } }).select('-messageId').populate("participants")

    if (!existingConversation) {
      const user = await User.findById(to_id).select('-password');

      return res.status(200).json({ success: true, messages: [], user });
    }

    let query = {};

    if (req.params.id) {
      query._id = { $gt: req.params.id };
    }
    query.conversationId = existingConversation._id;

    const pageSize = 30;

    // Find conversations where the user is a participant
    const messages = await Message.find(query)
      .sort({ _id: 1 }) // Change to ascending order to get recent messages
      .limit(pageSize)
      .lean();

    const otherId = existingConversation.participants.filter(id => id._id.toString() !== userId)

    if (messages.length > 0) {
      // Respond with a success status and the list of conversations
      return res.status(200).json({ success: true, messages, user: otherId[0] });
    }
    return res.status(200).json({ success: false, messages: [], user: otherId[0] });

  } catch (error) {
    // If an error occurs during the execution, respond with a 500 Internal Server Error
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};


exports.deleteConversation = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Conversation.findByIdAndDelete(serviceId);

    if (service == null) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    await Message.deleteMany({
      conversationId:serviceId
    });

    res.status(200).json({ message: `Conversation deleted successfully`, conversation: service });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteMessages = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Message.findByIdAndDelete(serviceId);

    if (service == null) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json({ message: `Message deleted successfully`, message: service });

  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};