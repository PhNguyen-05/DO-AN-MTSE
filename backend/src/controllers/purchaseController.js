const mongoose = require("mongoose");
const Purchase = require("../models/Purchase");
const Payment = require("../models/Payment");
const Exam = require("../models/Exam");

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

    const validPackageTypes = new Set(["bundle", "listening", "reading", "vocabulary", "premium"]);
    const isPremiumItem = (item) => {
      const itemType = String(item?.type || "").trim().toLowerCase();
      const packageType = String(item?.packageType || "").trim().toLowerCase();
      return itemType === "premium" || packageType === "premium";
    };
    const parseProductId = (productId) => {
      if (!productId || typeof productId !== 'string') {
        return { examId: null, packageType: null };
      }
      const tokens = productId.split("-");
      if (tokens.length < 2) {
        return { examId: productId, packageType: null };
      }
      const packageType = tokens.pop();
      const examId = tokens.join("-");
      if (!validPackageTypes.has(packageType)) {
        return { examId: productId, packageType: null };
      }
      return { examId, packageType };
    };

    const normalizedItems = items.map((item) => {
      if (isPremiumItem(item)) {
        return {
          id: item.id || "premium",
          examId: item.id || "premium",
          title: item.title || "Gói Premium",
          type: "premium",
          price: Number(item.price || 0),
          tone: item.tone || "blue",
          packageType: "premium"
        };
      }

      const rawExamId = item.examId || item.id;
      const parsedProduct = parseProductId(String(rawExamId || ""));
      const parsedPackageType = parsedProduct.packageType || "";
      const calculatedPackageType = (parsedPackageType && validPackageTypes.has(parsedPackageType))
        ? parsedPackageType
        : (item.packageType || (item.type === "vocabulary" ? "vocabulary" : "bundle"));
      const packageType = validPackageTypes.has(calculatedPackageType) ? calculatedPackageType : "bundle";

      return {
        id: item.id,
        examId: parsedProduct.examId || rawExamId,
        title: item.title,
        type: item.type || "exam",
        price: Number(item.price || 0),
        tone: item.tone || "blue",
        packageType
      };
    });

    const toExamId = (value) => {
      if (mongoose.isValidObjectId(value)) {
        return new mongoose.Types.ObjectId(value);
      }
      return String(value || "");
    };

    const purchaseDocs = await Promise.all(normalizedItems.map((item) => {
      const examId = toExamId(item.examId || item.id);
      return Purchase.create({
        user: req.userId,
        exam: examId,
        packageType: item.packageType,
        amount: item.price,
        status: "paid",
        paidAt: now
      });
    }));

    await Promise.all(normalizedItems.map(async (item) => {
      const examId = String(item.examId || item.id || "").trim();
      const packageType = item.packageType || "bundle";
      if (!examId || !validPackageTypes.has(packageType) || packageType === "vocabulary" || packageType === "premium") {
        return;
      }
      if (!mongoose.isValidObjectId(examId)) {
        return;
      }
      await Exam.findByIdAndUpdate(examId, {
        $inc: { [`soldCounts.${packageType}`]: 1 }
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
        exam: toExamId(item.examId || item.id),
        examId: item.examId || item.id,
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

const isPremiumPurchaseItem = (item) => {
  if (!item || typeof item !== 'object') return false;
  const packageType = String(item.packageType || item.type || '').trim().toLowerCase();
  const title = String(item.title || '').trim().toLowerCase();
  if (packageType === 'premium' || packageType === 'membership') return true;
  if (String(item.type || '').trim().toLowerCase() === 'premium') return true;
  if (title.includes('premium') || title.includes('membership')) return true;
  return false;
};

const getPremiumStatus = async (req, res, next) => {
  try {
    const [paymentRecords, purchaseRecords] = await Promise.all([
      Payment.find({ user: req.userId, status: 'success', type: 'income' }).lean(),
      Purchase.find({ user: req.userId, status: 'paid' }).lean()
    ]);

    const hasPremiumPayment = paymentRecords.some((payment) =>
      Array.isArray(payment.items) && payment.items.some(isPremiumPurchaseItem)
    );

    const hasPremiumPurchase = purchaseRecords.some((purchase) =>
      String(purchase.packageType || '').trim().toLowerCase() === 'premium'
    );

    res.json({ success: true, isPremium: hasPremiumPayment || hasPremiumPurchase });
  } catch (error) {
    next(error);
  }
};

const checkUserPurchase = async (req, res, next) => {
  try {
    const { examId, packageType = 'bundle' } = req.query;

    if (!examId) {
      return res.status(400).json({ message: "examId là bắt buộc." });
    }

    const normalizedPackageType = String(packageType || 'bundle').trim();
    const user = await User.findById(req.userId).lean();
    const isPremiumUser = user && user.accountType === "Premium";

    let isPurchased = false;
    if (isPremiumUser) {
      isPurchased = true;
    } else {
      const examCandidates = mongoose.isValidObjectId(examId)
        ? [new mongoose.Types.ObjectId(examId), String(examId)]
        : [String(examId)];

      const purchase = await Purchase.findOne({
        user: req.userId,
        exam: { $in: examCandidates },
        packageType: normalizedPackageType,
        status: 'paid'
      }).lean();
      isPurchased = !!purchase;
    }

    res.json({
      success: true,
      isPurchased,
      examId,
      packageType: normalizedPackageType
    });
  } catch (error) {
    next(error);
  }
};

const getUserPurchasedItems = async (req, res, next) => {
  try {
    const purchases = await Purchase.find({
      user: req.userId,
      status: 'paid'
    })
      .select('exam packageType')
      .lean();

    const purchasedItems = purchases.map((purchase) => {
      const packageType = purchase.packageType || 'bundle';
      if (packageType === 'premium') {
        return 'premium';
      }
      const examId = String(purchase.exam || '');
      return `${examId}-${packageType}`;
    });

    res.json({
      success: true,
      purchasedItems: purchasedItems
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPurchaseOrder,
  getPurchaseHistory,
  getPremiumStatus,
  checkUserPurchase,
  getUserPurchasedItems
};
