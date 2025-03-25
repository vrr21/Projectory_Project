import bcrypt from "bcryptjs";

// Функция для генерации хеша пароля
const generateHash = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log(`Password: ${password}`);
  console.log(`Hashed Password: ${hashedPassword}`);
  return hashedPassword;
};

// Пароли для тестовых пользователей
const passwords = [
  "admin123", // Для admin@gmail.com
  "ivanov123", // Для ivanov@gmail.com
  "petrov123", // Для petrov@gmail.com
  "sidorova123", // Для sidorova@gmail.com
  "kozlov123", // Для kozlov@gmail.com
];

// Асинхронная функция для генерации хешей
const generateAllHashes = async () => {
  for (const password of passwords) {
    await generateHash(password);
  }
};

// Запуск генерации хешей
generateAllHashes().catch((err) => {
  console.error("Error generating hashes:", err);
});