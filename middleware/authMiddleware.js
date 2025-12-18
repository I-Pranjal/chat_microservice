// middleware/auth.js
import jwt from "jsonwebtoken";

export default function (req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user data to request
    console.log("Authenticated user:", req.user);
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};
