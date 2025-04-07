const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const startApp  = require('./src/config/startApp');

// Çevre değişkenlerini yükle
dotenv.config();

// Express uygulamasını oluştur
const app = express();

// Middleware'leri ekle
app.use(cors({
    origin: [
        process.env.PRODUCTION_URL,
        process.env.TEST_URL
      ],
      credentials: true
}));
app.use(express.json({ limit: '50mb' }));  // JSON boyut limitini artır
app.use(express.urlencoded({ limit: '50mb', extended: true }));  // URL-encoded boyut limitini artır

// Uygulamayı başlat
startApp(app);