const express = require("express");
const {
  userRegistration,
  userLogin,
  getallData,
  refreshTokenControllers,
  userLogout,
} = require("../controllers/userController");
const { auth } = require("../middleware/auth");
const router = express.Router();

// User Registration
router.post("/register", userRegistration);

// User Login
router.post("/login", userLogin);

// get all data
router.get("/getAll", auth, getallData);

// Refresh Token
router.post("/refresh", refreshTokenControllers);

// Logout user
router.post("/logout", auth, userLogout);
module.exports = { router };
