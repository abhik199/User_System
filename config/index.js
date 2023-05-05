require("dotenv").config();

const { PORT, DB_URL, DEBUG_MODE, JWT_SECRET, REFRESH_SECRET } = process.env;

module.exports = { PORT, DB_URL, DEBUG_MODE, JWT_SECRET, REFRESH_SECRET };
