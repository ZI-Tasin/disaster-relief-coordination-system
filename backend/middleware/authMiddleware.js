const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    try {
      // Get token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find authenticated user
      const user = await User.findById(decoded.id).select("-password");

      // Token is valid, but user no longer exists
      if (!user) {
        return res.status(401).json({
          message: "User associated with token no longer exists",
        });
      }

      // Attach user to request
      req.user = user;

      return next();
    } catch (error) {
      console.error("Authentication error:", error.message);

      return res.status(401).json({
        message: "Not authorized, token failed",
      });
    }
  }

  return res.status(401).json({
    message: "Not authorized, no token",
  });
};

module.exports = {
  protect,
};
