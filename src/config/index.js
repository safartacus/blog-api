const connectDB = require('./dbConfig');
const { configCloudinary } = require('./cloudinaryConfig');
const startApp = require('./startApp');

module.exports = {
    connectDB,
    configCloudinary,
    startApp
};