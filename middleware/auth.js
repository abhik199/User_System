const { customErrorHandler } = require("./customErrorHandler");
const { JWT_SECRET } = require("../config/index");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  let authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(customErrorHandler.unAuthorized());
  }

  const token = authHeader.split(" ")[1];
  console.log(token);
  try {
    const { _id, email } = await jwt.verify(token, JWT_SECRET);
    console.log(_id);
    const user = {
      _id,
      email,
    };
    req.user = user;
    next();
  } catch (error) {
    return next(customErrorHandler.unAuthorized());
  }
};
module.exports = { auth };
