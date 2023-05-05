const joi = require("joi");
const userModels = require("../models/userModels");
const { customErrorHandler } = require("../middleware/customErrorHandler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, REFRESH_SECRET } = require("../config/index");
const refreshToken = require("../models/refreshToken");

//---------------------------- Registrations Controllers ----------------------------------

exports.userRegistration = async (req, res, next) => {
  try {
    const registrationSchema = joi.object({
      name: joi.string().min(3).max(15).required(),
      email: joi.string().email().required(),
      password: joi.string().min(8).required(),
    });
    const { error } = registrationSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { name, email, password } = req.body;
    const exist = await userModels.exists({ email: email });
    if (exist) {
      return next(customErrorHandler.alreadyExist());
    }
    // Password Hash
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModels({
      name,
      email,
      password: hashedPassword,
    });
    const data = await user.save();
    if (data) {
      return res.status(201).json({
        success: true,
        message: "User Registration successfully",
      });
    }
    return res.status(204).json({
      success: false,
      message: "User Registration failed",
    });
  } catch (error) {
    return next(error);
  }
};

//---------------------------- Login Controllers ----------------------------------

exports.userLogin = async (req, res, next) => {
  try {
    const loginSchema = joi.object({
      email: joi.string().email().required(),
      password: joi.string().min(8).required(),
    });
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { email, password } = req.body;
    const user = await userModels.findOne({ email: email });

    if (!user) {
      return next(customErrorHandler.wrongCredentials());
    }
    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return next(customErrorHandler.wrongCredentials());
    }
    // Create JWt Token
    // Access Token
    const access_token = jwt.sign(
      { _id: user._id, email: user.email },
      JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    // Refresh Token
    const refresh_token = await jwt.sign(
      { _id: user._id, email: user.email },
      REFRESH_SECRET,
      { expiresIn: "1y" }
    );
    await refreshToken.create({ token: refresh_token });

    console.log(access_token);
    return res.json({
      success: true,
      message: "User Login Successfully",
      access_token: access_token,
      refresh_token: refresh_token,
    });
  } catch (error) {
    return next(error);
  }
};

//---------------------------- Get All data Controllers ----------------------------------

exports.getallData = async (req, res, next) => {
  try {
    const user = await userModels
      .findOne({ _id: req.user._id })
      .select("-password -updatedAt -__v");

    if (!user) {
      return next(customErrorHandler.notFound());
    }
    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

//---------------------------- Refresh Token Controllers ----------------------------------

exports.refreshTokenControllers = async (req, res, next) => {
  try {
    // check Refresh Token in dataBase
    const RefreshToken = await refreshToken.findOne({
      token: req.body.refresh_token,
    });
    if (!refreshToken) {
      return next(customErrorHandler.unAuthorized("Invalid refresh token"));
    }
    // Verify Refresh Token
    const { _id } = await jwt.verify(RefreshToken.token, REFRESH_SECRET);
    const userId = _id;

    // Check User exist in database

    const user = await userModels.findOne({ _id: userId });
    if (!user) {
      return next(customErrorHandler.unAuthorized("Invalid refresh token"));
    }

    // Generate New Access and Refresh Token
    // Access Token
    const access_token = jwt.sign(
      { _id: user._id, email: user.email },
      JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    // Refresh Token
    const refresh_token = await jwt.sign(
      { _id: user._id, email: user.email },
      REFRESH_SECRET,
      { expiresIn: "1y" }
    );
    // database whitelist
    await refreshToken.create({ token: refresh_token });
    res.json({
      message: "New access and refresh token",
      access_token,
      refresh_token,
    });
  } catch (error) {
    return next(error);
  }
};

//---------------------------- LogOut Controllers ----------------------------------

exports.userLogout = async (req, res, next) => {
  try {
    // First delete Refresh Token in database
    await refreshToken.deleteOne({ token: req.body.refresh_token });
    res.json({ message: "User LogOut Successfully " });
  } catch (error) {
    return next(new Error("Something went wrong in database"));
  }
};
