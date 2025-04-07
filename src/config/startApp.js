const connectDB = require('./dbConfig');
const { configCloudinary } = require('./cloudinaryConfig');
const blogRoutes = require('../routes/blogRoute');
const categoryRoutes = require('../routes/categoryRoutes');
const authRoutes = require('../routes/authRoute');
const userRoutes = require('../routes/userRoute');
const startApp = async (app) => {
    try {
        // Önce MongoDB'ye bağlan
        await connectDB();
        
        // Sonra Cloudinary'yi yapılandır
        configCloudinary();

        // Route'ları ekle
        
        app.use('/api/blogs', blogRoutes);
        app.use('/api/categories', categoryRoutes);
        app.use('/api/auth', authRoutes);
        app.use('/api/users', userRoutes);
        // Sunucuyu başlat
        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, () => {
            console.log(`Sunucu ${PORT} portunda çalışıyor`);
        });

        // Graceful shutdown için event listener'lar
        process.on('SIGTERM', () => {
            console.log('SIGTERM sinyali alındı. Sunucu kapatılıyor...');
            server.close(() => {
                console.log('Sunucu kapatıldı');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT sinyali alındı. Sunucu kapatılıyor...');
            server.close(() => {
                console.log('Sunucu kapatıldı');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('Uygulama başlatma hatası:', error);
        process.exit(1);
    }
};

module.exports = startApp;