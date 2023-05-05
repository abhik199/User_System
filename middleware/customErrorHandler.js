class customErrorHandler extends Error {
  constructor(status, msg) {
    super();
    this.status = status;
    this.message = msg;
  }
  static alreadyExist(message = "This email is already taken!") {
    return new customErrorHandler(409, message);
  }
  static wrongCredentials(message = "Username or password is wrong!") {
    return new customErrorHandler(401, message);
  }
  static notFound(message = "404 Not Found") {
    return new customErrorHandler(404, message);
  }
  static serverError(message = "Internal server error") {
    return new customErrorHandler(500, message);
  }
  static unAuthorized(message = "unauthorized") {
    return new customErrorHandler(401, message);
  }
}
module.exports = { customErrorHandler };
