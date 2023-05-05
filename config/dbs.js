const { DB_URL } = require("./index");
const mongoose = require("mongoose");

mongoose
  .connect(DB_URL)
  .then((res) => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("Failed connection");
  });
