const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [{
    name:     { type: String },
    price:    { type: Number },
    quantity: { type: Number },
    image:    { type: String }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ["Online Payment", "Cash on Delivery"],
    required: true
  },
  status: {
    type: String,
    enum: ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Placed"
  },
  shippingAddress: {
    street:  { type: String, default: "" },
    city:    { type: String, default: "" },
    state:   { type: String, default: "" },
    pincode: { type: String, default: "" }
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
