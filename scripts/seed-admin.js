const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://kavinnandha:kavin4343@cluster0.ipg5jxa.mongodb.net/dcas-unified";

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
