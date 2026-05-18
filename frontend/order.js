const express = require("express");
const router  = express.Router();
const Order   = require("../models/Order");
const { authMiddleware } = require("../middleware/auth");

/* ============================================================
   SMART STATUS CALCULATOR
   Works based on time elapsed since order was placed.
   Survives server restarts — no timers needed.

   Timeline (demo-friendly):
     0  – 2  min  → Placed
     2  – 5  min  → Processing
     5  – 10 min  → Shipped
     10+ min      → Delivered

   To use realistic times for real deployment, change to:
     0  – 1  day  → Placed
     1  – 2  days → Processing
     2  – 5  days → Shipped
     5+ days      → Delivered
   ============================================================ */
function calculateStatus(order) {
  // Never touch cancelled orders
  if (order.status === "Cancelled") return "Cancelled";

  const minutesElapsed = (Date.now() - new Date(order.createdAt).getTime()) / 60000;

  if (minutesElapsed < 2)  return "Placed";
  if (minutesElapsed < 5)  return "Processing";
  if (minutesElapsed < 10) return "Shipped";
  return "Delivered";
}

/* Updates order status in MongoDB if it has changed */
async function syncStatus(order) {
  if (order.status === "Cancelled") return order;

  const correctStatus = calculateStatus(order);
  if (order.status !== correctStatus) {
    order.status = correctStatus;
    await order.save();
    console.log(`📦 Order ${order._id} → ${correctStatus}`);
  }
  return order;
}

/* ============================================================
   PLACE ORDER  (protected)
   ============================================================ */
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
      shippingAddress: shippingAddress || {},
      status: "Placed"
    });

    console.log(`✅ New order placed: ${order._id}`);
    res.status(201).json({ message: "Order placed successfully", order });

  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ message: "Failed to place order", error: err.message });
  }
});

/* ============================================================
   GET MY ORDERS  (protected)
   Syncs status of every order before returning — so the
   user always sees the correct real-time status.
   ============================================================ */
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

    // Sync status for all non-cancelled orders
    const updated = await Promise.all(orders.map(order => syncStatus(order)));

    res.json(updated);
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* ============================================================
   GET ALL ORDERS  — admin
   ============================================================ */
router.get("/all", authMiddleware, async (req, res) => {
  try {
    const orders = await Order
      .find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    const updated = await Promise.all(orders.map(order => syncStatus(order)));
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/* ============================================================
   GET SINGLE ORDER  (protected)
   ============================================================ */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const updated = await syncStatus(order);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

/* ============================================================
   CANCEL ORDER  (protected)
   ============================================================ */
router.put("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order)
      return res.status(404).json({ message: "Order not found" });
    if (order.status === "Delivered")
      return res.status(400).json({ message: "Cannot cancel a delivered order" });
    if (order.status === "Cancelled")
      return res.status(400).json({ message: "Order is already cancelled" });

    order.status = "Cancelled";
    await order.save();
    res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel order" });
  }
});

/* ============================================================
   UPDATE STATUS MANUALLY  — admin
   ============================================================ */
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!valid.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const order = await Order.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Status updated to " + status, order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

module.exports = router;