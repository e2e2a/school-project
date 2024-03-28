// seeders/admin-seeder.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const UserModel = require("../models/user");

async function seedAdmin() {
  // Connect to the database
  await mongoose.connect("mongodb://localhost/your-database", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Check if admin already exists
  const existingAdmin = await UserModel.findOne({ role: 'admin' });

  if (!existingAdmin) {
    // Create admin credentials
    const adminCredentials = {
      name: "Admin User",
      password: "adminpassword",
      role: 'admin',
      isVerified: true
      // Add other fields as needed
    };

    // Hash the admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminCredentials.password, salt);
    adminCredentials.password = hashedPassword;

    // Create admin user
    await UserModel.create(adminCredentials);

    console.log("Admin user created successfully");
  } else {
    console.log("Admin user already exists");
  }

  // Close the database connection
  await mongoose.disconnect();
}

// Execute the admin seeder
seedAdmin().then(() => {
  console.log("Admin seeding completed");
  process.exit(0);
}).catch((err) => {
  console.error("Error seeding admin:", err);
  process.exit(1);
});