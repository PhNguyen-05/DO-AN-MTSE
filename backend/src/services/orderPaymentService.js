const Exam = require("../models/Exam");
const VocabularySet = require("../models/VocabularySet");
const Coupon = require("../models/Coupon");
const CouponUsage = require("../models/CouponUsage");
const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const Purchase = require("../models/Purchase");
const User = require("../models/User");
const UserPurchasedPart = require("../models/UserPurchasedPart");
const { recordIncomePayment } = require("./revenueService");

const PREMIUM_PRICE = Number(process.env.PREMIUM_PRICE || 299000);
const PREMIUM_DAYS = Number(process.env.PREMIUM_DAYS || 365);

const generateOrderCode = () => `TOEIC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const getExamPrice = (exam, packageType) => {
  if (packageType === "listening") return Number(exam.priceListening || 0);
  if (packageType === "reading") return Number(exam.priceReading || 0);
  return Number(exam.priceBundle || 0);
};

async function resolveCheckoutItem(item) {
  const { productType, productId, packageType = "bundle" } = item;

  // Normalize productType: accept both English and Vietnamese
  const normalizedType = productType.toLowerCase();
  
  // Extract actual productId if it contains packageType suffix (e.g., "id-bundle")
  let actualProductId = productId;
  let actualPackageType = packageType;
  
  if (productId && typeof productId === 'string') {
    const parts = productId.split('-');
    const validPackageTypes = ['bundle', 'listening', 'reading', 'vocabulary', 'premium'];
    const lastPart = parts[parts.length - 1];
    
    if (parts.length > 1 && validPackageTypes.includes(lastPart)) {
      actualProductId = parts.slice(0, -1).join('-');
      actualPackageType = lastPart;
    }
  }
  
  if (normalizedType === "đề thi" || normalizedType === "exam") {
    const exam = await Exam.findOne({ _id: actualProductId, isHidden: { $ne: true } });
    if (!exam) throw new Error("Đề thi không tồn tại hoặc đã bị ẩn.");
    const price = getExamPrice(exam, actualPackageType);
    return {
      productType: "Đề thi",
      productId: exam._id,
      productName: exam.name,
      packageType: actualPackageType,
      price
    };
  }

  if (normalizedType === "bộ từ vựng" || normalizedType === "vocabulary") {
    const set = await VocabularySet.findOne({ _id: actualProductId, isHidden: { $ne: true } });
    if (!set) throw new Error("Bộ từ vựng không tồn tại hoặc đã bị ẩn.");
    if (set.accessType === "free") throw new Error(`Bộ từ vựng "${set.name}" đang miễn phí.`);
    return {
      productType: "Bộ từ vựng",
      productId: set._id,
      productName: set.name,
      packageType: "bundle",
      price: Number(set.price || 0)
    };
  }

  if (normalizedType === "gói premium" || normalizedType === "premium") {
    return {
      productType: "Gói Premium",
      productId: null,
      productName: "Gói Premium TOEIC",
      packageType: "premium",
      price: PREMIUM_PRICE
    };
  }

  throw new Error("Loại sản phẩm không hợp lệ.");
}

async function applyCoupon({ couponCode, userId, subtotal, items }) {
  if (!couponCode) {
    return { discountAmount: 0, coupon: null };
  }

  const coupon = await Coupon.findOne({
    code: String(couponCode).trim().toUpperCase(),
    isActive: true,
    isHidden: { $ne: true },
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });

  if (!coupon) throw new Error("Mã giảm giá không hợp lệ hoặc đã hết hạn.");

  if (coupon.minimumOrderValue && subtotal < coupon.minimumOrderValue) {
    throw new Error(`Đơn hàng tối thiểu ${coupon.minimumOrderValue.toLocaleString("vi-VN")} đ để dùng mã này.`);
  }

  if (coupon.maxUses > 0) {
    const usedCount = await CouponUsage.countDocuments({ couponId: coupon._id });
    if (usedCount >= coupon.maxUses) throw new Error("Mã giảm giá đã hết lượt sử dụng.");
  }

  if (coupon.maxUsesPerUser > 0) {
    const userUsed = await CouponUsage.countDocuments({ couponId: coupon._id, userId });
    if (userUsed >= coupon.maxUsesPerUser) throw new Error("Bạn đã sử dụng hết lượt cho mã giảm giá này.");
  }

  let discountAmount = 0;
  if (coupon.discountType === "percent") {
    discountAmount = Math.round(subtotal * (Number(coupon.discountPercent || 0) / 100));
  } else {
    discountAmount = Number(coupon.fixedAmount || 0);
  }

  discountAmount = Math.min(discountAmount, subtotal);

  return { discountAmount, coupon, items };
}

async function grantOrderAccess(order, details) {
  const userId = order.userId;

  for (const detail of details) {
    if (detail.productType === "Đề thi") {
      const packageType = detail.packageType || "bundle";
      
      // Kiểm tra xem đã có Purchase với cùng packageType chưa
      const existing = await Purchase.findOne({
        user: userId,
        exam: detail.productId,
        packageType: packageType,
        status: "paid"
      });

      if (!existing) {
        await Purchase.create({
          user: userId,
          exam: detail.productId,
          packageType: packageType,
          amount: detail.price,
          status: "paid",
          paidAt: new Date()
        });
      }

      if (detail.packageType === "listening") {
        await UserPurchasedPart.updateOne(
          { userId, examId: detail.productId, skillType: "Listening" },
          { $setOnInsert: { purchasedAt: new Date() } },
          { upsert: true }
        );
      }
      if (detail.packageType === "reading") {
        await UserPurchasedPart.updateOne(
          { userId, examId: detail.productId, skillType: "Reading" },
          { $setOnInsert: { purchasedAt: new Date() } },
          { upsert: true }
        );
      }
    }

    if (detail.productType === "Bộ từ vựng") {
      const existing = await Purchase.findOne({
        user: userId,
        vocabularySet: detail.productId,
        status: "paid"
      });

      if (!existing) {
        await Purchase.create({
          user: userId,
          vocabularySet: detail.productId,
          packageType: "vocabulary",
          amount: detail.price,
          status: "paid",
          paidAt: new Date()
        });
      }
    }

    if (detail.productType === "Gói Premium") {
      const user = await User.findById(userId);
      if (user) {
        const baseDate = user.premiumExpiresAt && user.premiumExpiresAt > new Date()
          ? user.premiumExpiresAt
          : new Date();
        const expiresAt = new Date(baseDate);
        expiresAt.setDate(expiresAt.getDate() + PREMIUM_DAYS);
        user.accountType = "Premium";
        user.premiumExpiresAt = expiresAt;
        await user.save();

        // Tạo Purchase record cho gói Premium
        const existingPremiumPurchase = await Purchase.findOne({
          user: userId,
          isPremium: true,
          status: "paid"
        });

        if (!existingPremiumPurchase) {
          await Purchase.create({
            user: userId,
            isPremium: true,
            packageType: "premium",
            amount: detail.price,
            status: "paid",
            paidAt: new Date()
          });
        }
      }
    }
  }
}

async function fulfillPaidOrder(orderId) {
  const order = await Order.findById(orderId);
  if (!order || order.paymentStatus === "SUCCESS") return order;

  const details = await OrderDetail.find({ orderId: order._id });
  await grantOrderAccess(order, details);

  if (order.discountCodeUsed) {
    const coupon = await Coupon.findOne({ code: order.discountCodeUsed });
    if (coupon) {
      await CouponUsage.create({
        couponId: coupon._id,
        userId: order.userId,
        orderId: order._id
      });
    }
  }

  await recordIncomePayment({
    userId: order.userId,
    amount: order.totalAmount,
    paidAt: order.paidAt || new Date()
  });

  order.paymentStatus = "SUCCESS";
  order.paidAt = order.paidAt || new Date();
  await order.save();

  return order;
}

async function createCheckoutOrder({ userId, items, paymentMethod, couponCode, clientIp }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Vui lòng chọn ít nhất một sản phẩm.");
  }

  if (!["COD", "VNPay"].includes(paymentMethod)) {
    throw new Error("Phương thức thanh toán không hợp lệ.");
  }

  const resolvedItems = [];
  for (const item of items) {
    resolvedItems.push(await resolveCheckoutItem(item));
  }

  const subtotal = resolvedItems.reduce((sum, item) => sum + item.price, 0);
  const { discountAmount, coupon } = await applyCoupon({
    couponCode,
    userId,
    subtotal,
    items: resolvedItems
  });

  const totalAmount = Math.max(0, subtotal - discountAmount);
  const txnRef = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`.substring(0, 20);

  const order = await Order.create({
    orderCode: generateOrderCode(),
    userId,
    totalAmount,
    paymentMethod: paymentMethod === "VNPay" ? "VNPay" : "COD",
    paymentStatus: "PENDING",
    discountCodeUsed: coupon?.code,
    vnpTxnRef: paymentMethod === "VNPay" ? txnRef : undefined
  });

  await OrderDetail.insertMany(
    resolvedItems.map((item) => ({
      orderId: order._id,
      productType: item.productType,
      productId: item.productId || order._id,
      productName: item.productName,
      packageType: item.packageType,
      price: item.price
    }))
  );

  let paymentUrl = "";
  if (paymentMethod === "VNPay") {
    const { generateVnpayUrl } = require("../utils/vnpay");
    paymentUrl = generateVnpayUrl(txnRef, totalAmount, clientIp);
  }

  return {
    order,
    items: resolvedItems,
    subtotal,
    discountAmount,
    paymentUrl
  };
}

module.exports = {
  createCheckoutOrder,
  fulfillPaidOrder,
  generateOrderCode
};
