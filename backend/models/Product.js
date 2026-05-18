const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  image:       { type: String, required: true },
  description: { type: String, default: "" },
  price:       { type: Number, required: true },
  category:    { type: String, default: "General" },
  rating:      { type: Number, default: 4.0 },
  reviews:     { type: Number, default: 0 },
  stock:       { type: Number, default: 100 },
  badge:       { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
