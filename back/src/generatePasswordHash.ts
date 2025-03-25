// generatePasswordHash.ts
import { hashPassword } from "./middleware/hashPasswords";

const passwords = [
  { email: "admin@gmail.com", password: "admin123" },
  { email: "ivanov@gmail.com", password: "ivanov123" },
  { email: "petrov@gmail.com", password: "petrov123" },
  { email: "sidorova@gmail.com", password: "sidorova123" },
  { email: "kozlov@gmail.com", password: "kozlov123" },
];

const generateHashes = async () => {
  for (const { email, password } of passwords) {
    const hash = await hashPassword(password);
    console.log(`Email: ${email}, Password: ${password}, Hash: ${hash}`);
  }
};

generateHashes().catch((err) => {
  console.error("Ошибка генерации хешей:", err);
  process.exit(1);
});