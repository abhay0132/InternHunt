// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/userInfo");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    const token = authHeader.split(" ")[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production");
      
      // Verify user still exists
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "User no longer exists" 
        });
      }

      req.user = { id: decoded.id, email: decoded.email };
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ 
          success: false, 
          message: "Token expired",
          code: "TOKEN_EXPIRED"
        });
      }
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Authentication failed" 
    });
  }
};

module.exports = authenticate;