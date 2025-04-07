const cloudinary = require('cloudinary').v2;

const configCloudinary = () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });
        console.log('Cloudinary yapılandırması başarıyla tamamlandı');
    } catch (error) {
        console.error('Cloudinary yapılandırma hatası:', error);
        process.exit(1);
    }
};

module.exports = { configCloudinary, cloudinary:cloudinary };