const express = require("express");
const router = express.Router();
const { authMiddleware, authorize } = require("../middlewares/auth.middleware");

const {
  listUsers,
  changeUserRole,
  toggleUserStatus
} = require("../controllers/adminController");

// User Management Routes
router.get("/users", authMiddleware, authorize("Admin", "Manager", "Employee"), listUsers);
router.patch("/users/:id/role", authMiddleware, authorize("Admin"), changeUserRole);
router.patch("/users/:id/status", authMiddleware, authorize("Admin", "Manager"), toggleUserStatus);

module.exports = router;
