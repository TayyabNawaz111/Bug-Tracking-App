const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from header
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // Attach user info from token to request object
    req.user = decoded;
    next(); // Proceed to the next middleware/controller
  } catch (error) {
    console.log(error);
    res.status(403).json({ message: "Token is invalid" });
  }
};

module.exports = authenticateToken;
