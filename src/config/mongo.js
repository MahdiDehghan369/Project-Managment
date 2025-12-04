const mongoose = require("mongoose");

function mongoConnectWrapper(connectFn, retries = 3) {
  return async function (uri) {
    for (let i = 0; i < retries; i++) {
      try {
        await connectFn(uri);
        console.log("Connected to mongodb successfully :)");
        return;
      } catch (err) {
        console.error(`[connected to mongodb failed][${i + 1}][error => ` ,  err.message , "]");
        if (i === retries - 1) {
          console.error("Connected failed :(");
        }
      }
    }
  };
}

async function connectMongo(uri) {
  await mongoose.connect(uri);
}

const safeConnectMongo = mongoConnectWrapper(connectMongo, 3);

module.exports = safeConnectMongo