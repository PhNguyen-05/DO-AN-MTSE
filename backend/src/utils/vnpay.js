const crypto = require("crypto");

const VNP_TMN_CODE = process.env.VNP_TMN_CODE || "2NBAO7U2";
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || "RQFG9FWK5X6JCPVKADX9KHP9AVBEXIIB";
const VNP_URL = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNP_RETURN_URL = process.env.VNP_RETURN_URL ||
  `${process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:5173"}/payment-result`;

/**
 * VNPay sortObject — matches VNPay reference implementation exactly.
 *  1. encodeURIComponent on every key & value
 *  2. replace %20 with + (space → +)
 *  3. sort by encoded key
 *  4. return a new object with encoded keys and encoded values
 */
function sortObject(obj) {
  return Object.keys(obj)
    .sort((a, b) => {
      const ea = encodeURIComponent(a);
      const eb = encodeURIComponent(b);
      return ea.localeCompare(eb);
    })
    .reduce((sorted, key) => {
      const encodedKey = encodeURIComponent(key);
      const rawValue = String(obj[key]);
      sorted[encodedKey] = encodeURIComponent(rawValue).replace(/%20/g, "+");
      return sorted;
    }, {});
}

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
  // VNPay sandbox rejects 127.0.0.1 in some environments
  if (cleanIp === "127.0.0.1") cleanIp = "1.1.1.1";

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

  // Sort & encode using VNPay's sortObject
  const sortedEncoded = sortObject(params);

  // Build signData: the raw concatenation of sorted, already-encoded params
  const signParts = Object.keys(sortedEncoded).map(k => `${k}=${sortedEncoded[k]}`);
  const signData = signParts.join("&");

  const secureHash = crypto
    .createHmac("sha512", VNP_HASH_SECRET)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  // Build full URL: values are already encoded by sortObject
  const queryString = signParts.join("&");

  console.log("[VNPay] Payment URL generated:");
  console.log("[VNPay]   txnRef:", txnRef);
  console.log("[VNPay]   amount:", amount);
  console.log("[VNPay]   secureHash:", secureHash);
  console.log("[VNPay]   signData:", signData);

  return `${VNP_URL}?${queryString}&vnp_SecureHash=${secureHash}`;
}

function verifyVnpayChecksum(data) {
  const secret = VNP_HASH_SECRET;
  const { vnp_SecureHash, vnp_SecureHashType, ...rest } = data;

  // Re-encode the decoded params using sortObject — exactly matches VNPay's signing
  const sortedEncoded = sortObject(rest);

  const signParts = Object.keys(sortedEncoded).map(k => `${k}=${sortedEncoded[k]}`);
  const signData = signParts.join("&");

  const checksum = crypto
    .createHmac("sha512", secret)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  const match = checksum.toLowerCase() === String(vnp_SecureHash || "").toLowerCase();

  if (!match) {
    console.log("[VNPay Verify] FAILED checksum");
    console.log("[VNPay Verify]   received hash:", vnp_SecureHash);
    console.log("[VNPay Verify]   calculated:", checksum);
    console.log("[VNPay Verify]   signData:", signData);
  }

  return match;
}

module.exports = {
  generateVnpayUrl,
  verifyVnpayChecksum
};
