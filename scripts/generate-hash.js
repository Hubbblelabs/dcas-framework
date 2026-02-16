const bcrypt = require("bcryptjs");

async function generateHash() {
  const password = process.argv[2] || "admin123";
  const hash = await bcrypt.hash(password, 12);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
}

generateHash().catch(console.error);
