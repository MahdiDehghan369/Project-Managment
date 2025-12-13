const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require('path');
const connectToMongoDB = require("./config/mongo");
const env = require("./utils/env");
const seedRoles = require("./seed/roles.seed");
const seedUsers = require("./seed/users.seed");

const usersRouter = require('./modules/users/user.route');
const authRouter = require('./modules/auth/auth.route');
const errorHandler = require("./middlewares/errorHandler");

// set default middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname , ".." , "public")))

// set routes
function setRoutes() {
  app.use("/users" , usersRouter)
  app.use("/auth" , authRouter)

  // set error handelr
  app.use(errorHandler)
} 

// Start server function
async function startServer() {
  try {
    setRoutes()
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
