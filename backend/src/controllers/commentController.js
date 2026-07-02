const Comment = require("../models/Comment");
const User = require("../models/User");

const createComment = async (req, res, next) => {
  try {
    const { content, targetType, targetId, replyTo } = req.body;
    const userId = req.userId;

    if (!content?.trim() || !targetType || !targetId) {
      return res.status(400).json({ message: "Nội dung, loại, và ID không được để trống." });
    }

    const user = await User.findById(userId);
    const isAdminReply = user.role === 'admin' || user.role === 'manager';

    const comment = new Comment({
      content: content.trim(),
      author: userId,
      targetType,
      targetId,
      replyTo: replyTo || null,
      isAdminReply,
      status: "VISIBLE"
    });

    await comment.save();
    await comment.populate('author', 'name email role');

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

const getCommentsByTarget = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.query;
    
    if (!targetType || !targetId) {
      return res.status(400).json({ message: "Thiếu targetType hoặc targetId." });
    }

    const comments = await Comment.find({
      targetType,
      targetId,
      status: "VISIBLE"
    })
      .populate('author', 'name email role')
      .populate('replyTo')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getCommentsByTarget
};
