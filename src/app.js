const express = require("express"); // Create an express application
const cors = require("cors");
const rateLimit = require("express-rate-limit");

require("./utils/db");

const app = express();

const limiter = rateLimit({
  max: 1000,
  windowMS: 1000 * 60,
  message: "Too many requests",
});

// Global middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cors());
app.use(limiter);

app.use("/api/v1/syllabi", require("./modules/syllabi/index"));
app.use("/api/v1/settings", require("./modules/settings/index"));

// changes added from remote

module.exports = app;
