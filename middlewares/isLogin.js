const appErr = require("../helper/appErr");
const getTokenFromHeader = require("../helper/getTokenFromHeader");
const verifyToken = require("../helper/verifyToken");

const isLogin = (req, res, next) => {
  //get token from header
  const token = getTokenFromHeader(req);
  //verify token
  const decodedUser = verifyToken(token);
  //save the user into req obj
  req.userAuth = decodedUser.id;

  if (!decodedUser) {
    return next(appErr("Invalid/Expired token, please login", 500));
  } else {
    next();
  }
};

module.exports = isLogin;
