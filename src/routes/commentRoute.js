const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/blog/:blogId', commentController.getComments);
router.post('/blog/:blogId', protect, commentController.createComment);
router.delete('/:commentId', protect, commentController.deleteComment);
router.post('/:commentId/like', protect, commentController.toggleLike);

module.exports = router;