const User = require("../models/User");

const ensureAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME?.trim() || "System Administrator";

    if (!adminEmail || !adminPassword) {
      console.warn(
        "ADMIN_EMAIL or ADMIN_PASSWORD is missing. Admin initialization skipped.",
      );
      return;
    }

    if (adminPassword.length < 6) {
      throw new Error("ADMIN_PASSWORD must contain at least 6 characters.");
    }

    let admin = await User.findOne({ email: adminEmail });

    /*
     * IMPORTANT:
     *
     * User.js already hashes passwords inside its Mongoose
     * pre("save") hook.
     *
     * Therefore DO NOT bcrypt.hash() here.
     */

    if (!admin) {
      admin = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "admin",
      });

      await admin.save();

      console.log(`Production admin created: ${adminEmail}`);
      return;
    }

    let changed = false;

    /*
     * Guarantee admin privileges.
     */
    if (admin.role !== "admin") {
      admin.role = "admin";
      changed = true;
    }

    /*
     * Keep the configured admin name synchronized.
     */
    if (admin.name !== adminName) {
      admin.name = adminName;
      changed = true;
    }

    /*
     * Verify configured password.
     *
     * If it doesn't match, assigning the plaintext password is
     * intentional because User.js hashes it during save().
     */
    const passwordMatches = await admin.matchPassword(adminPassword);

    if (!passwordMatches) {
      admin.password = adminPassword;
      changed = true;

      console.log(`Admin password synchronized: ${adminEmail}`);
    }

    if (changed) {
      await admin.save();
      console.log(`Production admin account synchronized: ${adminEmail}`);
    } else {
      console.log(`Production admin verified: ${adminEmail}`);
    }
  } catch (error) {
    console.error("Admin initialization failed:", error);
    throw error;
  }
};

module.exports = ensureAdmin;
