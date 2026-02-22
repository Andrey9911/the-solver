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
  lastName: String,
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
  // История постов, созданных пользователем
  postHistory: [
    {
      type: { type: String, enum: ['text', 'photo'], default: 'text' },
      text: String,
      caption: String,
      photoFileId: String,
      channelId: String,
      channelTitle: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  // Настройки авто-постинга для канала
  autoPosting: {
    enabled: {
      type: Boolean,
      default: false
    },
    channelId: String,
    channelTitle: String,
    webhookUrl: String, // URL вебхука n8n для авто-постинга
    interval: {
      type: Number,
      default: 3600 // Интервал в секундах (по умолчанию 1 час)
    },
    lastPostAt: Date,
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Экспортируем модель
const User = mongoose.model('User', UserSchema);
export default User;