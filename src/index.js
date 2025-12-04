const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const connectToMongoDB = require("./config/mongo");
const env = require("./utils/env");

// set default middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Start server function
async function startServer() {
  try {
    await connectToMongoDB(env.MONGO_URL);
    app.listen(env.PORT, () => {
      console.log(`Server is running on ${env.PORT} port :)`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
    process.exit(1);
  }
}

// Call start server function
startServer();
