const mongoose = require("mongoose");
const dbConfig = require("../configs/db-config.js");

const env = process.env.NODE_ENV || "development";
const connectionString = dbConfig[env];

console.log(`Connecting to MongoDB in ${env} mode...`);

// Mongoose will auto-create the database and collections as needed
mongoose
  .connect(connectionString)
  .then(() => {
    console.log(`✔ Database connected successfully.`);
    console.log(`✔ Database: ${mongoose.connection.db.databaseName}`);
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

module.exports = mongoose;
