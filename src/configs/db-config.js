const config = {
  development: {
    url:
      process.env.MONGODB_URI ||
      `mongodb://${process.env.MONGODB_USER || "test"}:${
        process.env.MONGODB_PASSWORD || "test"
      }@${process.env.MONGODB_HOST || "localhost"}:${
        process.env.MONGODB_PORT || "27017"
      }/${process.env.MONGODB_DATABASE || "test"}?authSource=admin`,
  },

  production: {
    url:
      process.env.MONGODB_URI ||
      `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}?authSource=admin&ssl=true&retryWrites=true&w=majority`,
  },
};

// Return connection string directly
module.exports = {
  development: config.development.url,
  production: config.production.url,
};

