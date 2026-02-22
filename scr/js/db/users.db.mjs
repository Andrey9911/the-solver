// /**
//  * Модуль работы с базой данных пользователей Telegram
//  * - Подключение к MongoDB
//  * - CRUD операции для пользователей
//  * - Сохранение истории постов
//  */

// import connectDB from './connect.mjs';
// import User from './schema.mjs';

// // ============ Подключение ============
// export { connectDB };

// // ============ Пользователи ============

// /**
//  * Получить или создать пользователя по telegramId
//  * @param {number} telegramId - ID пользователя в Telegram
//  * @param {object} profile - { username, firstName, lastName }
//  * @returns {Promise<object|null>}
//  */
// export async function getOrCreateUser(telegramId, profile = {}) {
//   try {
//     let user = await User.findOne({ telegramId });
//     if (!user) {
//       user = new User({
//         telegramId,
//         username: profile.username || null,
//         firstName: profile.firstName || null,
//         lastName: profile.lastName || null,
//         isPremium: profile.isPremium || false
//       });
//       await user.save();
//     } else {
//       // Обновляем данные профиля при каждом обращении
//       if (profile.username !== undefined) user.username = profile.username;
//       if (profile.firstName !== undefined) user.firstName = profile.firstName;
//       if (profile.lastName !== undefined) user.lastName = profile.lastName;
//       if (profile.isPremium !== undefined) user.isPremium = profile.isPremium;
//       await user.save();
//     }
//     return user;
//   } catch (error) {
//     console.error('[users.db] Ошибка getOrCreateUser:', error);
//     return null;
//   }
// }

// /**
//  * Обновить данные пользователя
//  * @param {number} telegramId
//  * @param {object} updates - поля для обновления
//  */
// export async function updateUser(telegramId, updates) {
//   try {
//     const user = await User.findOneAndUpdate(
//       { telegramId },
//       { $set: updates },
//       { new: true }
//     );
//     return user;
//   } catch (error) {
//     console.error('[users.db] Ошибка updateUser:', error);
//     return null;
//   }
// }

// /**
//  * Найти пользователя по telegramId
//  */
// export async function findUser(telegramId) {
//   try {
//     return await User.findOne({ telegramId });
//   } catch (error) {
//     console.error('[users.db] Ошибка findUser:', error);
//     return null;
//   }
// }

// /**
//  * Получить всех пользователей (для админки)
//  */
// export async function getAllUsers(limit = 100) {
//   try {
//     return await User.find().sort({ createdAt: -1 }).limit(limit).lean();
//   } catch (error) {
//     console.error('[users.db] Ошибка getAllUsers:', error);
//     return [];
//   }
// }

// // ============ История постов ============

// /**
//  * Сохранить пост в историю пользователя
//  * @param {number} telegramId
//  * @param {object} post - { type: 'text'|'photo', text, caption, photoFileId, channelId, channelTitle }
//  */
// export async function saveUserPost(telegramId, post) {
//   try {
//     const user = await User.findOne({ telegramId });
//     if (!user) return null;

//     user.postHistory.push({
//       type: post.type || 'text',
//       text: post.text || null,
//       caption: post.caption || null,
//       photoFileId: post.photoFileId || null,
//       channelId: post.channelId || null,
//       channelTitle: post.channelTitle || null
//     });
//     await user.save();
//     return user.postHistory[user.postHistory.length - 1];
//   } catch (error) {
//     console.error('[users.db] Ошибка saveUserPost:', error);
//     return null;
//   }
// }

// /**
//  * Получить историю постов пользователя
//  * @param {number} telegramId
//  * @param {number} limit - кол-во последних постов
//  */
// export async function getPostHistory(telegramId, limit = 50) {
//   try {
//     const user = await User.findOne({ telegramId })
//       .select('postHistory')
//       .lean();
//     if (!user) return [];
//     const history = user.postHistory || [];
//     return history.slice(-limit).reverse();
//   } catch (error) {
//     console.error('[users.db] Ошибка getPostHistory:', error);
//     return [];
//   }
// }

// // ============ Авто-постинг ============

// /**
//  * Получить статус авто-постинга пользователя
//  */
// export async function getAutoPostingStatus(telegramId) {
//   try {
//     const user = await User.findOne({ telegramId }).select('autoPosting').lean();
//     if (!user || !user.autoPosting) {
//       return { enabled: false, channelId: null, channelTitle: null, webhookUrl: null };
//     }
//     return {
//       enabled: user.autoPosting.enabled || false,
//       channelId: user.autoPosting.channelId || null,
//       channelTitle: user.autoPosting.channelTitle || null,
//       webhookUrl: user.autoPosting.webhookUrl || null
//     };
//   } catch (error) {
//     console.error('[users.db] Ошибка getAutoPostingStatus:', error);
//     return { enabled: false, channelId: null, channelTitle: null, webhookUrl: null };
//   }
// }

// /**
//  * Обновить статус авто-постинга
//  * @param {number} telegramId
//  * @param {boolean} enabled
//  * @param {object} data - { channelId, channelTitle, webhookUrl }
//  */
// export async function updateAutoPostingStatus(telegramId, enabled, data = {}) {
//   try {
//     const update = {
//       'autoPosting.enabled': enabled,
//       'autoPosting.lastPostAt': enabled ? new Date() : undefined
//     };
//     if (data.channelId !== undefined) update['autoPosting.channelId'] = data.channelId;
//     if (data.channelTitle !== undefined) update['autoPosting.channelTitle'] = data.channelTitle;
//     if (data.webhookUrl !== undefined) update['autoPosting.webhookUrl'] = data.webhookUrl;

//     const user = await User.findOneAndUpdate(
//       { telegramId },
//       { $set: update },
//       { new: true }
//     );
//     return !!user;
//   } catch (error) {
//     console.error('[users.db] Ошибка updateAutoPostingStatus:', error);
//     return false;
//   }
// }
