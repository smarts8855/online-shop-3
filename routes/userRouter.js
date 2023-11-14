const express = require("express");
const { User } = require("../model/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../helper/generateToken");
const getTokenFromHeader = require("../helper/getTokenFromHeader");
const isLogin = require("../middlewares/isLogin");
const appErr = require("../helper/appErr");
const isAdmin = require("../middlewares/isAdmin");
const router = express.Router();

router.get("/", isLogin, isAdmin, async (req, res) => {
  const userList = await User.find();
  res.send(userList);
});
//post method : Register
router.post("/register", async (req, res, next) => {
  const {
    name,
    email,
    passwordHash,
    phone,
    street,
    apartment,
    zip,
    city,
    country,
  } = req.body;
  //check if the product is already exists
  const userFound = await User.findOne({ name });
  if (userFound) {
    return next(appErr(`${name} User already exists`, 404));
  }
  const salt = await bcrypt.genSalt(10);
  let user = new User({
    name,
    email,
    passwordHash: bcrypt.hashSync(passwordHash, salt),
    phone,
    street,
    apartment,
    zip,
    city,
    country,
  });
  user = await user.save();
  if (!user) {
    return next(appErr("User cannot be created.", 400));
  }

  res.send(user);
});

//post method : Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userFound = await User.findOne({ email: email });
  if (!userFound) {
    return res.status(404).send("Invalid username or password provided.");
  }

  if (userFound && bcrypt.compareSync(password, userFound.passwordHash)) {
    res.status(200).json({
      message: "User login successful",
      name: userFound.name,
      email: userFound.email,
      isAdmin: userFound.isAdmin,
      id: userFound._id,
      token: generateToken(userFound._id),
    });
  } else {
    res.status(404).send("Invalid username or password provided.");
  }
});

//get single user
router.get("/profile", isLogin, async (req, res) => {
  console.log(getTokenFromHeader(req));
  const userProfile = await User.findById(req.userAuth);
  res.send(userProfile);
});

//update User
router.put("/update", isLogin, async (req, res) => {
  const {
    name,
    email,
    passwordHash,
    phone,
    street,
    apartment,
    zip,
    city,
    country,
  } = req.body;
  const user = await User.findByIdAndUpdate(
    req.userAuth,
    {
      name,
      email,
      passwordHash,
      phone,
      street,
      apartment,
      zip,
      city,
      country,
    },
    { new: true }
  );

  res.json({
    status: "success",
    data: user,
  });
});

//Delete User
router.delete("/:id", isLogin, isAdmin, async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);
  if (!user) {
    res.status(404).send("The category with this ID is not found.");
  }
  res.send("User deleted successfully.");
});

module.exports = router;
