const express = require("express");
const { Product } = require("../model/Product");
const { Category } = require("../model/Category");
const router = express.Router();
const mongoose = require("mongoose");
const isLogin = require("../middlewares/isLogin");
const isAdmin = require("../middlewares/isAdmin");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    cb(null, `${fileName}-${Date.now()}`);
    6;
  },
});

const uploadOption = multer({ storage: storage });
//post method
router.post(
  "/",
  uploadOption.single("image"),
  isLogin,
  isAdmin,
  async (req, res) => {
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
    const {
      name,
      description,
      richDescription,
      image,
      brand,
      price,
      category,
      countInStock,
      rating,
      numReviews,
      isFeatured,
    } = req.body;
    //check the category
    const categoryFind = await Category.findById(category);
    if (!categoryFind) {
      return res.status(404).send("Invalid Category");
    }
    //check if the product is already exists
    const productFound = await Product.findOne({ name });
    if (productFound) {
      return res.status(404).send(`${name} Product already exists`);
    }
    let product = new Product({
      name,
      description,
      richDescription,
      image: `${basePath}${fileName}`,
      brand,
      price,
      category,
      countInStock,
      rating,
      numReviews,
      isFeatured,
    });
    product = await product.save();

    if (!product) {
      res.status(404).json({ success: false });
    }

    res.send(product);
  }
);

//Get all products
router.get("/", async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter)
    .populate("category")
    .select("name price");
  if (!productList) {
    res.status(400).json({ success: false });
  }
  res.send(productList);
});

//Get single products
router.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category")
    .select("name price -_id");
  if (!product) {
    res.status(400).json({ success: false });
  }
  res.send(product);
});

//update product
//update category
router.put("/:id", isLogin, isAdmin, async (req, res) => {
  const {
    name,
    description,
    richDescription,
    image,
    brand,
    price,
    category,
    countInStock,
    rating,
    numReviews,
    isFeatured,
  } = req.body;
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).send("Invalid Product ID");
  }

  const categoryFind = await Category.findById(category);
  if (!categoryFind) {
    return res.status(404).send("Invalid Category");
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      richDescription,
      image,
      brand,
      price,
      category,
      countInStock,
      rating,
      numReviews,
      isFeatured,
    },
    { new: true }
  );
  if (!product) {
    res.status(404).send("The product with this ID is not found.");
  }
  res.status(200).json({
    message: "Product updated successfully",
    data: product,
  });
});

//Delete Product
router.delete("/:id", isLogin, isAdmin, async (req, res) => {
  const product = await Product.findByIdAndRemove(req.params.id);
  if (!product) {
    res.status(404).send("The product with this ID is not found.");
  }
  res.send("Product deleted successfully.");
});

//Get count products
router.get("/get/count", async (req, res) => {
  const productCount = await Product.countDocuments();
  if (!productCount) {
    res.status(400).json({ success: false });
  }
  res.send({
    count: productCount,
  });
});

//Get count products
router.get("/get/featured/:count", async (req, res) => {
  const conut = req.params.count ? req.params.count : 0;
  const productFeatured = await Product.find({ isFeatured: true }).limit(
    +conut
  );
  if (!productFeatured) {
    res.status(400).json({ success: false });
  }
  res.send(productFeatured);
});

module.exports = router;
