const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Production MongoDB Atlas connection
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://soulsanctuary.mongodb.net/soulsanctuary?retryWrites=true&w=majority';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected to production database: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
