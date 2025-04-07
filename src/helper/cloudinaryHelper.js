const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (fileBuffer, folder) => {
  try {
    // Buffer'ı base64'e çevir
    const base64String = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:image/jpeg;base64,${base64String}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto'
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    throw new Error('Cloudinary yükleme hatası: ' + error.message);
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Cloudinary silme hatası:', error);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};