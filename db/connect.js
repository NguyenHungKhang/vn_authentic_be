const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://vnauthentic:Admin12345@vnauthentic.ym6r6aw.mongodb.net/vnauthentic?retryWrites=true&w=majority&appName=vnauthentic', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed', err);
    process.exit(1);
  }
};

module.exports = connectDB;
