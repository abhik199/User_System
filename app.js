const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// DataBase Connection
require("./config/dbs");

// api
const { router } = require("./routes/userRoutes");
app.use("/api/v1/user", router);

// Error Handler
const { errorHandler } = require("./middleware/errorHandler");
app.use(errorHandler);

module.exports = { app };
