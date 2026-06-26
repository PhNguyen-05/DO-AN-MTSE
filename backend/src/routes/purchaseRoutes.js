const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { createPurchaseOrder, getPurchaseHistory } = require("../controllers/purchaseController");

router.post("/purchase", authMiddleware, createPurchaseOrder);
router.get("/purchase-history", authMiddleware, getPurchaseHistory);

module.exports = router;
