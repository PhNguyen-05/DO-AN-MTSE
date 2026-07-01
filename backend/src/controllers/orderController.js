const Order = require("../models/Order");
const OrderDetail = require("../models/OrderDetail");
const { verifyVnpayChecksum } = require("../utils/vnpay");
const {
  createCheckoutOrder,
  fulfillPaidOrder
} = require("../services/orderPaymentService");

const formatOrder = async (order) => {
  const details = await OrderDetail.find({ orderId: order._id });
  return {
    ...order.toObject(),
    items: details
  };
};

const createOrder = async (req, res, next) => {
  try {
    const { items, paymentMethod, couponCode } = req.body;
    const result = await createCheckoutOrder({
      userId: req.userId,
      items,
      paymentMethod,
      couponCode,
      clientIp: req.ip
    });

    return res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công.",
      data: {
        order: await formatOrder(result.order),
        subtotal: result.subtotal,
        discountAmount: result.discountAmount,
        paymentUrl: result.paymentUrl
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Không thể tạo đơn hàng."
    });
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    const data = await Promise.all(orders.map((order) => formatOrder(order)));

    return res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    }

    const isOwner = String(order.userId) === String(req.userId);
    const isStaff = ["Admin", "Manager", "Employee"].includes(req.userRole);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: "Bạn không có quyền xem đơn hàng này." });
    }

    return res.json({
      success: true,
      data: await formatOrder(order)
    });
  } catch (error) {
    next(error);
  }
};

const confirmCodOrder = async (req, res, next) => {
  try {
    if (!["Admin", "Manager", "Employee"].includes(req.userRole)) {
      return res.status(403).json({ success: false, message: "Không có quyền xác nhận thanh toán." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    }

    if (order.paymentStatus === "SUCCESS") {
      return res.json({ success: true, message: "Đơn hàng đã được thanh toán.", data: await formatOrder(order) });
    }

    order.paidAt = new Date();
    await order.save();
    const fulfilled = await fulfillPaidOrder(order._id);

    return res.json({
      success: true,
      message: "Xác nhận thanh toán COD thành công.",
      data: await formatOrder(fulfilled)
    });
  } catch (error) {
    next(error);
  }
};

const vnpayIpnHandler = async (req, res) => {
  try {
    const data = { ...req.query, ...req.body };
    const { vnp_TxnRef, vnp_ResponseCode } = data;

    if (!vnp_TxnRef) {
      return res.status(200).json({ RspCode: "99", Message: "Missing transaction reference" });
    }

    if (!verifyVnpayChecksum(data)) {
      return res.status(200).json({ RspCode: "97", Message: "Invalid Checksum" });
    }

    const order = await Order.findOne({ vnpTxnRef: vnp_TxnRef });
    if (!order) {
      return res.status(200).json({ RspCode: "01", Message: "Order not found" });
    }

    if (order.paymentStatus !== "PENDING") {
      return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
    }

    if (vnp_ResponseCode === "00") {
      order.paidAt = new Date();
      await order.save();
      await fulfillPaidOrder(order._id);
    } else {
      order.paymentStatus = "FAILED";
      await order.save();
    }

    return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
  } catch (error) {
    console.error("[VNPay IPN]", error);
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

const vnpayReturnHandler = async (req, res) => {
  try {
    const data = { ...req.query };
    const { vnp_TxnRef, vnp_ResponseCode } = data;

    if (!vnp_TxnRef) {
      return res.status(400).json({ success: false, message: "Missing transaction reference" });
    }

    if (!verifyVnpayChecksum(data)) {
      return res.status(400).json({ success: false, message: "Invalid checksum" });
    }

    const order = await Order.findOne({ vnpTxnRef: vnp_TxnRef });
    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng." });
    }

    if (order.paymentStatus === "PENDING") {
      if (vnp_ResponseCode === "00") {
        order.paidAt = new Date();
        await order.save();
        await fulfillPaidOrder(order._id);
      } else {
        order.paymentStatus = "FAILED";
        await order.save();
      }
    }

    const refreshed = await Order.findById(order._id);
    return res.json({
      success: true,
      data: await formatOrder(refreshed)
    });
  } catch (error) {
    console.error("[VNPay Return]", error);
    return res.status(500).json({ success: false, message: "Lỗi xử lý kết quả thanh toán." });
  }
};

const getAllOrdersAdmin = async (req, res, next) => {
  try {
    if (!["Admin", "Manager", "Employee"].includes(req.userRole)) {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập." });
    }

    const orders = await Order.find().sort({ createdAt: -1 });
    const data = await Promise.all(orders.map((order) => formatOrder(order)));

    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getPaymentReport = async (req, res, next) => {
  try {
    if (!["Admin", "Manager", "Employee"].includes(req.userRole)) {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập." });
    }

    const [totalOrders, successOrders, paymentStats] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: "SUCCESS" }),
      Order.aggregate([
        {
          $group: {
            _id: "$paymentMethod",
            count: { $sum: 1 },
            total: { $sum: "$totalAmount" }
          }
        }
      ])
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    return res.json({
      success: true,
      data: {
        totalOrders,
        successOrders,
        totalRevenue: revenueResult[0]?.total || 0,
        paymentStats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  confirmCodOrder,
  vnpayIpnHandler,
  vnpayReturnHandler,
  getAllOrdersAdmin,
  getPaymentReport
};
