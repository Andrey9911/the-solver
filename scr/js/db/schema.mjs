import mongoose from 'mongoose';

// Здесь вы описываете вашу "Схему"
const UserSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    required: true,
    unique: true // Гарантирует, что ID не дублируются
  },
  username: String,
  firstName: String,
  isPremium: {
    type: Boolean,
    default: false
  },
  // Можно добавлять сложные поля, массивы и т.д.
  history: [
    {
      prompt: String,
      response: String,
      date: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Экспортируем модель
const User = mongoose.model('User', UserSchema);
export default User;