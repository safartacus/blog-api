const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/Upload');

// Profil işlemleri
router.get('/me', protect, userController.getCurrentUser);
router.put(
  '/profile',
  protect,
  upload.single('profileImage'),
  userController.updateProfile
);
router.delete('/account', protect, userController.deleteAccount);

module.exports = router;