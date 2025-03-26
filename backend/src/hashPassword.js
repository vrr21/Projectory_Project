// backend/hashPassword.js
const bcrypt = require('bcrypt');

const plainPassword = 'admin123';

bcrypt.hash(plainPassword, 12, (err, hash) => {
  if (err) {
    console.error('Ошибка хеширования:', err);
    return;
  }
  console.log('Новый хеш пароля:', hash);
});