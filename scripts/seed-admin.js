const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dns = require("dns");

// Fix for SRV resolution issues in some environments (like Cloudflare WARP)
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (e) {
  console.warn("Failed to set DNS servers for SRV resolution:", e);
}

const MONGODB_URI =
  process.env.MONGODB_URI;

const AdminSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
  },
  { timestamps: true },
);

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

    const existing = await Admin.findOne({ email: "admin@dcas.com" });
    if (existing) {
      console.log("Admin already exists: admin@dcas.com");
      await mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash("admin123", 12);
    await Admin.create({
      name: "DCAS Admin",
      email: "admin@dcas.com",
      password: hashedPassword,
      role: "superadmin",
    });

    console.log("Admin created successfully!");
    console.log("Email: admin@dcas.com");
    console.log("Password: admin123");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seedAdmin();
