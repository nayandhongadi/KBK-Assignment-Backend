const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connection = await mongoose.connect("mongodb://localhost:27017/kbk", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

module.exports = connectDB;
