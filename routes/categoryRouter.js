const express = require("express");
const { Category } = require("../model/Category");
const mongoose = require("mongoose");
const isLogin = require("../middlewares/isLogin");
const isAdmin = require("../middlewares/isAdmin");
const router = express.Router();

//post method
router.post("/", isLogin, isAdmin, async (req, res) => {
  const { name, icon, color } = req.body;
  let category = new Category({
    name,
    icon,
    color,
  });
  category = await category.save();
  if (!category) {
    res.status(404).send("Category cannot be created.");
  }

  res.send(category);
});

//Get all categories
router.get("/", async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(404).json({ success: false });
  }
  res.send(categoryList);
});

//Get single category
router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404).send("The category with this ID is not found.");
  }
  res.send(category);
});

//update category
router.put("/:id", isLogin, isAdmin, async (req, res) => {
  const { name, icon, color } = req.body;
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name,
      icon,
      color,
    },
    { new: true }
  );
  if (!category) {
    res.status(404).send("The category with this ID is not found.");
  }
  res.send(category);
});

//Delete category
router.delete("/:id", isLogin, isAdmin, async (req, res) => {
  const category = await Category.findByIdAndRemove(req.params.id);
  if (!category) {
    res.status(404).send("The category with this ID is not found.");
  }
  res.send("Category deleted successfully.");
});

module.exports = router;
