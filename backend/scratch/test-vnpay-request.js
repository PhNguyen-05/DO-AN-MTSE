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

async function testUrl() {
  const now = new Date();
  const txnRef = "TEST" + Date.now();
  const vnpAmount = 1000000;

  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: VNP_TMN_CODE,
    vnp_Amount: String(vnpAmount),
    vnp_CurrCode: "VND",
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: `Thanh toan TOEIC ${txnRef}`,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: VNP_RETURN_URL,
    vnp_IpAddr: "127.0.0.1",
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

  const url = `${VNP_URL}?${signData}&vnp_SecureHash=${secureHash}`;
  console.log("Testing URL:", url);

  try {
    const res = await fetch(url);
    const html = await res.text();
    if (html.includes("Sai chữ ký") || html.includes("Thông báo")) {
      console.log("FAILED: Response contains error message");
      const match = html.match(/Thông báo[\s\S]*?Sai chữ ký/i) || html.match(/Sai chữ ký/i);
      console.log("Error details:", match ? match[0] : "Check HTML output manually");
    } else {
      console.log("SUCCESS! Payment page loaded successfully");
    }
  } catch (err) {
    console.error("HTTP error:", err.message);
  }
}

testUrl();
