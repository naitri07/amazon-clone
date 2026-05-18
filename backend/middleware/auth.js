const jwt = require("jsonwebtoken");

// Secret key wahi honi chahiye jo aapne login route mein use ki hai
const JWT_SECRET = "your_jwt_secret_key_here"; 

const authMiddleware = (req, res, next) => {
  // Token header se nikaalte hain
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Token verify karna
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // User data ko request object mein daalna
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Dono cheezon ko export karna zaroori hai
module.exports = { authMiddleware, JWT_SECRET };