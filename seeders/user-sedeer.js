const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");

async function seedUsers() {
    try {
        // Connect to the MongoDB database
        await mongoose.connect("mongodb://localhost/your-database", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Create a new user
        const newUser = new User({
            email: "user@example.com",
            password: "password123",
            role: "user",
            isVerified: true,
        });
        await newUser.save();
        console.log("User created successfully:", newUser);

        // Find and update a user
        const userToUpdate = await User.findOne({ email: "user@example.com" });
        if (userToUpdate) {
            userToUpdate.role = "admin";
            await userToUpdate.save();
            console.log("User updated successfully:", userToUpdate);
        }

        // Find and delete a user
        const userToDelete = await User.findOne({ email: "user@example.com" });
        if (userToDelete) {
            await userToDelete.remove();
            console.log("User deleted successfully:", userToDelete);
        }

        // Find all users
        const allUsers = await User.find();
        console.log("All users:", allUsers);
    } catch (error) {
        console.error("Error seeding users:", error);
    } finally {
        // Disconnect from the MongoDB database
        await mongoose.disconnect();
    }
}

// Execute the seeder
seedUsers();
