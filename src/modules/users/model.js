const mongoose = require("mongoose");
const CryptoJS = require("crypto-js");
const { validatePayload } = require("../../utils");
const userJoiSchema = require("./joiSchema");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware for password hashing and validation
userSchema.pre("save", function (next) {
  // Hash password if modified
  if (this.isModified("password")) {
    this.password = hashPassword(this.password);
  }

  // Validate payload
  const schema = this.isNew ? userJoiSchema.create : userJoiSchema.update;
  validatePayload(this.toObject(), schema);

  next();
});

// Pre-update middleware for validation
userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  
  // Hash password if being updated
  if (update.password || update.$set?.password) {
    const password = update.password || update.$set.password;
    if (update.$set) {
      update.$set.password = hashPassword(password);
    } else {
      update.password = hashPassword(password);
    }
  }

  // Validate update payload
  const updateData = update.$set || update;
  validatePayload(updateData, userJoiSchema.update);

  next();
});

// < ========== Static & Instance methods ========== >
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
}

userSchema.statics.hashPassword = hashPassword;

userSchema.statics.verifyPassword = function (inputPassword, hashedPassword) {
  const hashedInputPassword = CryptoJS.SHA256(inputPassword).toString(
    CryptoJS.enc.Hex
  );
  return hashedInputPassword === hashedPassword;
};

userSchema.methods.getEmail = function () {
  return this.email.toLowerCase();
};

const User = mongoose.model("User", userSchema);

module.exports = User;
