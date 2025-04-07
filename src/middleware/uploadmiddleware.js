const multer = require('multer');

// Geçici depolama alanı oluştur
const storage = multer.memoryStorage();

// Sadece resim dosyalarını kabul et
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim yükleyebilirsiniz!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;