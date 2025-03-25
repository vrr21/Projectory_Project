// backend/scripts/generateHashes.js
const bcrypt = require('bcryptjs');

const passwords = [
  'admin123',
  'ivanov123',
  'petrov123',
  'sidorova123',
  'kozlov123',
];

async function generateHashes() {
  for (const password of passwords) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`Password: ${password}, Hash: ${hash}`);
  }
}

generateHashes();