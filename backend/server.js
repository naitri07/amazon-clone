const express = require("express");
const cors = require("cors");
require("./db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/products", require("./routes/product"));
app.use("/api/orders",   require("./routes/order"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Amazon Clone API is running ✅" });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
