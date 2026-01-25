const mongoose = require("mongoose");
const dbConfig = require("../configs/db-config.js");

const env = process.env.NODE_ENV || "development";
const connectionString = dbConfig[env];

console.log(`Connecting to MongoDB in ${env} mode...`);

mongoose
  .connect(connectionString)
  .then(() => {
    console.log(`✔ Database connected successfully.`);
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

module.exports = mongoose;
