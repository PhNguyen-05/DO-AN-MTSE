const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  confirmCodOrder,
  vnpayIpnHandler,
  vnpayReturnHandler,
  getAllOrdersAdmin,
  getPaymentReport
} = require("../controllers/orderController");

const router = express.Router();

router.get("/vnpay/ipn", vnpayIpnHandler);
router.get("/vnpay/return", vnpayReturnHandler);

router.post("/", authMiddleware, createOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/admin/all", authMiddleware, getAllOrdersAdmin);
router.get("/admin/report", authMiddleware, getPaymentReport);
router.put("/:id/confirm-cod", authMiddleware, confirmCodOrder);
router.get("/:id", authMiddleware, getOrderById);

module.exports = router;
