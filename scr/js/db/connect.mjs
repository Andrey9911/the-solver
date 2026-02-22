import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Строка подключения должна быть в .env файле
    // Пример: MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/mybot
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB подключена: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Ошибка подключения к MongoDB: ${error.message}`);
  }
};

export default connectDB;