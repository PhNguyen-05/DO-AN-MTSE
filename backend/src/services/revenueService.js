const Payment = require("../models/Payment");
const Purchase = require("../models/Purchase");
const Order = require("../models/Order");

const buildMonthlySeries = (year, monthlyMap) => (
  Array.from({ length: 12 }, (_, index) => ({
    month: `${year}-${String(index + 1).padStart(2, "0")}`,
    total: monthlyMap[index + 1] || 0
  }))
);

const addMonthlyTotals = (monthlyMap, rows) => {
  rows.forEach((item) => {
    const month = item._id?.month;
    if (!month) return;
    monthlyMap[month] = (monthlyMap[month] || 0) + (Number(item.total) || 0);
  });
};

async function getRevenueStats(year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

  const paymentFilter = {
    status: "success",
    type: "income",
    paidAt: { $gte: startDate, $lte: endDate }
  };

  const syncedPurchaseIds = await Payment.distinct("purchase", {
    ...paymentFilter,
    purchase: { $ne: null }
  });

  const [
    paymentTotalAgg,
    paymentMonthlyAgg,
    purchaseTotalAgg,
    purchaseMonthlyAgg,
    orderTotalAgg,
    orderMonthlyAgg
  ] = await Promise.all([
    Payment.aggregate([
      { $match: paymentFilter },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Payment.aggregate([
      { $match: paymentFilter },
      {
        $group: {
          _id: { month: { $month: "$paidAt" } },
          total: { $sum: "$amount" }
        }
      }
    ]),
    Purchase.aggregate([
      {
        $match: {
          status: "paid",
          paidAt: { $gte: startDate, $lte: endDate },
          _id: { $nin: syncedPurchaseIds.filter(Boolean) }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Purchase.aggregate([
      {
        $match: {
          status: "paid",
          paidAt: { $gte: startDate, $lte: endDate },
          _id: { $nin: syncedPurchaseIds.filter(Boolean) }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$paidAt" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]),
    Order.aggregate([
      {
        $match: {
          paymentStatus: "SUCCESS",
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]),
    Order.aggregate([
      {
        $match: {
          paymentStatus: "SUCCESS",
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.month": 1 } }
    ])
  ]);

  const revenue =
    (paymentTotalAgg[0]?.total || 0) +
    (purchaseTotalAgg[0]?.total || 0) +
    (orderTotalAgg[0]?.total || 0);

  const monthlyMap = {};
  addMonthlyTotals(monthlyMap, paymentMonthlyAgg);
  addMonthlyTotals(monthlyMap, purchaseMonthlyAgg);
  addMonthlyTotals(monthlyMap, orderMonthlyAgg);

  return {
    revenue,
    monthlyRevenue: buildMonthlySeries(year, monthlyMap)
  };
}

async function recordIncomePayment({ userId, amount, purchaseId = null, paidAt = new Date() }) {
  if (!amount || amount <= 0) return null;

  return Payment.create({
    user: userId || undefined,
    purchase: purchaseId || undefined,
    amount,
    type: "income",
    status: "success",
    paidAt
  });
}

module.exports = {
  getRevenueStats,
  recordIncomePayment
};
