const User = require('../models/User');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2; 
const { uploadToCloudinary, deleteFromCloudinary } = require('../helper/cloudinaryHelper');

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Kullanıcı bilgileri alınamadı', 
      error: error.message 
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Temel bilgileri güncelle
    if (req.body.firstName) user.firstName = req.body.firstName;
    if (req.body.lastName) user.lastName = req.body.lastName;

    // Profil resmi güncelleme
    if (req.body.profileImage) {
      try {
        if (user.profileImage.publicId) {
          try {
            if (user.profileImage && user.profileImage.publicId) {
              await cloudinary.uploader.destroy(user.profileImage.publicId);
            }
          } catch (error) {
            console.error('Cloudinary silme hatası:', error);
          }
        }

          
          try {
              // Cloudinary'ye yükle
              const result = await cloudinary.uploader.upload(req.body.profileImage, {
                  resource_type: 'auto',
                  folder: 'profiles'
              });
              user.profileImage = {
                url: result.secure_url,
                publicId: result.publicId
              };
          } catch (uploadError) {
              console.error('Cloudinary yükleme hatası:', uploadError);
              return res.status(500).json({ message: 'Resim yükleme hatası' });
          }
        // Yeni resmi Cloudinary'ye yükle
        
        
      } catch (error) {
        return res.status(500).json({ 
          message: 'Profil resmi yüklenirken hata oluştu', 
          error: error.message 
        });
      }
    }

    // Şifre değiştirme
    if (req.body.currentPassword && req.body.newPassword) {
      // Mevcut şifreyi kontrol et
      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mevcut şifre yanlış' });
      }

      // Yeni şifreyi hashle ve kaydet
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.newPassword, salt);
    }

    // Kullanıcıyı kaydet
    await user.save();

    // Şifre hariç kullanıcı bilgilerini döndür
    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ 
      message: 'Profil güncellenirken bir hata oluştu', 
      error: error.message 
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Profil resmini Cloudinary'den sil
    if (user.profileImage.publicId) {
      await deleteFromCloudinary(user.profileImage.publicId);
    }

    // Kullanıcıyı sil
    await user.remove();

    res.json({ message: 'Hesap başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Hesap silinirken bir hata oluştu', 
      error: error.message 
    });
  }
};