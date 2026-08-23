require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const ADMIN_EMAIL = process.argv[2];
const ADMIN_PASSWORD = process.argv[3];

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Usage: node backend/scripts/resetAdmin.js admin@example.com password"
  );
  process.exit(1);
}

async function resetAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await User.findOneAndUpdate(
      { email: ADMIN_EMAIL.toLowerCase().trim() },
      {
        $set: {
          name: "System Administrator",
          email: ADMIN_EMAIL.toLowerCase().trim(),
          password: passwordHash,
          role: "admin",
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("\nAdmin account ready:");
    console.log("ID:", admin._id.toString());
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Failed:", error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

resetAdmin();


