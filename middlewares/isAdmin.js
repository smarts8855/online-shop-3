const appErr = require("../helper/appErr");
const getTokenFromHeader = require("../helper/getTokenFromHeader");
const verifyToken = require("../helper/verifyToken");
const { User } = require("../model/User");

const isAdmin = async (req, res, next) => {
  //get token from header
  const token = getTokenFromHeader(req);
  //verify token
  const decodedUser = verifyToken(token);
  //save the user into req obj
  req.userAuth = decodedUser.id;

  //find the user
  const user = await User.findById(decodedUser.id);

  //Check if admin
  if (user.isAdmin) {
    return next();
  } else {
    return next(appErr("Access Denied, Admin Only", 403));
  }
};

module.exports = isAdmin;
