const Comment = require('../models/Comment');

exports.getComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const comments = await Comment.find({ blogId })
      .populate('author', 'firstName lastName profileImage')
      .populate('likes', 'firstName lastName')
      .sort('-createdAt');
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Yorumlar yüklenirken hata oluştu' });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = new Comment({
      content,
      blogId,
      author: userId
    });
    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'firstName lastName profileImage');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: 'Yorum eklenirken hata oluştu' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }
    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    await comment.deleteOne();
    res.json({ message: 'Yorum silindi' });
  } catch (error) {
    console.log(error.message); 
    res.status(500).json({ message: 'Yorum silinirken hata oluştu' });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Yorum bulunamadı' });
    }

    const likeIndex = comment.likes.indexOf(userId);
    
    if (likeIndex === -1) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(likeIndex, 1);
    }

    await comment.save();

    const updatedComment = await Comment.findById(commentId)
      .populate('author', 'firstName lastName profileImage')
      .populate('likes', 'firstName lastName');

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Beğeni işlemi başarısız' });
  }
};