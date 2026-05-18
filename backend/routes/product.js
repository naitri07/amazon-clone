const express  = require("express");
const router   = express.Router();
const Product  = require("../models/Product");
const { authMiddleware } = require("../middleware/auth");

// GET all products (with optional search & category)
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (search)   filter.name     = { $regex: search,   $options: "i" };
    if (category && category !== "All")
                  filter.category = { $regex: category, $options: "i" };
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// GET single product
router.get("/:id", async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// ADD product (protected)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const p = await Product.create(req.body);
    res.status(201).json({ message: "Product added", product: p });
  } catch (err) {
    res.status(500).json({ message: "Failed to add product", error: err.message });
  }
});

// UPDATE product (protected)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Product updated", product: p });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product" });
  }
});

// DELETE product (protected)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;
