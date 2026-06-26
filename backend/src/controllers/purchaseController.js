const mongoose = require("mongoose");
const Purchase = require("../models/Purchase");
const Payment = require("../models/Payment");

const createPurchaseOrder = async (req, res, next) => {
  try {
    let { items, voucherCode = "", subtotal = 0, discount = 0, total = 0 } = req.body;

    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (parseError) {
        return res.status(400).json({ message: 'Invalid items payload.' });
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items to purchase." });
    }

    const now = new Date();
    const orderId = `DH${String(Date.now()).slice(-8)}`;

    const normalizedItems = items.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type || "exam",
      price: Number(item.price || 0),
      tone: item.tone || "blue",
      packageType: item.packageType || (item.type === "vocabulary" ? "vocabulary" : "bundle")
    }));

    const toExamId = (value) => {
      if (mongoose.isValidObjectId(value)) {
        return new mongoose.Types.ObjectId(value);
      }
      return String(value || "");
    };

    const purchaseDocs = await Promise.all(normalizedItems.map((item) => {
      const examId = toExamId(item.id);
      return Purchase.create({
        user: req.userId,
        exam: examId,
        packageType: item.packageType,
        amount: item.price,
        status: "paid",
        paidAt: now
      });
    }));

    const payment = await Payment.create({
      user: req.userId,
      purchase: purchaseDocs[0]._id,
      amount: Number(total || subtotal - discount),
      type: "income",
      status: "success",
      paidAt: now,
      orderId,
      voucherCode: String(voucherCode || "").trim(),
      items: normalizedItems.map((item) => ({
        exam: toExamId(item.id),
        title: item.title,
        type: item.type,
        price: item.price,
        tone: item.tone,
        packageType: item.packageType
      }))
    });

    res.json({ success: true, orderId, paidAt: now, payment });
  } catch (error) {
    next(error);
  }
};

const getPurchaseHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.userId })
      .sort({ paidAt: -1 })
      .lean();

    const history = payments.map((payment) => ({
      orderId: payment.orderId || `DH${String(payment._id).slice(-8)}`,
      date: payment.paidAt ? payment.paidAt.toISOString().slice(0, 10).split("-").reverse().join("/") : "",
      total: payment.amount || 0,
      voucherCode: payment.voucherCode || "",
      items: Array.isArray(payment.items) ? payment.items : []
    }));

    res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPurchaseOrder,
  getPurchaseHistory
};
