const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { createPurchaseOrder, getPurchaseHistory, getPremiumStatus, checkUserPurchase, getUserPurchasedItems } = require("../controllers/purchaseController");

router.post("/purchase", authMiddleware, createPurchaseOrder);
router.get("/purchase-history", authMiddleware, getPurchaseHistory);
router.get("/premium-status", authMiddleware, getPremiumStatus);
router.get("/check-purchase", authMiddleware, checkUserPurchase);
router.get("/purchased-items", authMiddleware, getUserPurchasedItems);

module.exports = router;
