const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const connectToMongoDB = require("./config/mongo");
const env = require("./utils/env");
const seedRoles = require("./seed/roles.seed");
const seedUsers = require("./seed/users.seed");

// set default middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Start server function
async function startServer() {
  try {
    await connectToMongoDB(env.MONGO_URL);
    await seedRoles()
    await seedUsers()
    app.listen(env.PORT, () => {
      console.log(`Server is running on ${env.PORT} port :)`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
}

// Call start server function
startServer();
