const express = require("express");
const router  = express.Router();
const Order   = require("../models/Order");
const { authMiddleware } = require("../middleware/auth");

// PLACE ORDER (protected)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, paymentMethod, shippingAddress } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const totalAmount = items.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity), 0
    );

    const order = await Order.create({
      userId: req.user.id,
      items,
      totalAmount,
      paymentMethod,
      shippingAddress: shippingAddress || {}
    });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ message: "Failed to place order", error: err.message });
  }
});

// GET MY ORDERS (protected)
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// GET ALL ORDERS - admin (protected)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().populate("userId","name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// GET SINGLE ORDER (protected)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

// UPDATE ORDER STATUS (admin)
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    res.json({ message: "Status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

// CANCEL ORDER (protected)
router.put("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status === "Delivered")
      return res.status(400).json({ message: "Cannot cancel a delivered order" });
    order.status = "Cancelled";
    await order.save();
    res.json({ message: "Order cancelled", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel order" });
  }
});

module.exports = router;
