const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const upload = require('../middleware/uploadmiddleware');
const {protect} = require('../middleware/auth');

router.get('/search', blogController.searchBlogs); 
router.get('/', blogController.getBlogs);
router.get('/:id', blogController.getBlogById);

// Protected routes
router.post('/', protect, upload.single('image'), blogController.createBlog);

router.put('/:id', protect, upload.single('image'), blogController.updateBlog);

router.delete('/:id', protect, blogController.deleteBlog);


module.exports = router;