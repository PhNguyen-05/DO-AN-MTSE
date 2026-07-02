const crypto = require("crypto");
const qs = require("qs");

const VNP_TMN_CODE = "B6MXNQPO";
const VNP_HASH_SECRET = "BWPI0J4GAHSGY5832X5P8B3YVTD7ZPP4";
const VNP_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNP_RETURN_URL = "http://localhost:5173/payment-result";

function formatVnDate(date) {
  const offset = 7 * 60;
  const localDate = new Date(date.getTime() + offset * 60 * 1000);
  return localDate.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
}

function generateVnpayUrl(txnRef, amount, clientIp) {
  const now = new Date();
  const vnpAmount = Math.round(Math.max(0, amount)) * 100;

  let cleanIp = clientIp || "127.0.0.1";
  if (cleanIp.startsWith("::ffff:")) cleanIp = cleanIp.replace("::ffff:", "");
  if (cleanIp === "::1") cleanIp = "127.0.0.1";

  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: VNP_TMN_CODE,
    vnp_Amount: String(vnpAmount),
    vnp_CurrCode: "VND",
    vnp_TxnRef: String(txnRef).substring(0, 20),
    vnp_OrderInfo: `Thanh toan TOEIC ${txnRef}`.substring(0, 255),
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: VNP_RETURN_URL,
    vnp_IpAddr: cleanIp,
    vnp_CreateDate: formatVnDate(now),
    vnp_ExpireDate: formatVnDate(new Date(now.getTime() + 15 * 60 * 1000))
  };

  const sorted = {};
  const keys = Object.keys(params).map((key) => encodeURIComponent(key)).sort();
  keys.forEach((encodedKey) => {
    const originalKey = decodeURIComponent(encodedKey);
    sorted[encodedKey] = encodeURIComponent(params[originalKey]).replace(/%20/g, "+");
  });

  const signData = qs.stringify(sorted, { encode: false });
  const secureHash = crypto
    .createHmac("sha512", VNP_HASH_SECRET)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  console.log("params:", params);
  console.log("sorted:", sorted);
  console.log("signData:", signData);
  console.log("secureHash:", secureHash);
  return `${VNP_URL}?${signData}&vnp_SecureHash=${secureHash}`;
}

generateVnpayUrl("TOEIC-123456", 10000, "127.0.0.1");
