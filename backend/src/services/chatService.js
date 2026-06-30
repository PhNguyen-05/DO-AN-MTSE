const { getPublicData } = require('../utils/publicData');
const { GoogleGenAI } = require('@google/genai');

// Danh sách model thử theo thứ tự ưu tiên (free tier)
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite-preview-02-05',
  'gemini-2.0-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-flash',
];

async function callExternalAI(message) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return 'Chưa cấu hình Gemini API key.';

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Bạn là trợ lý học TOEIC. Hãy trả lời ngắn gọn, hữu ích bằng tiếng Việt.\n\nNgười dùng: ${message}`;

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({ model, contents: prompt });
      const text = response.text;
      if (text) {
        console.log(`[Gemini] Dùng model: ${model}`);
        return text;
      }
    } catch (e) {
      const status = e?.status || e?.code;
      console.warn(`[Gemini] Model ${model} thất bại (${status}): ${e.message}`);
      // Nếu lỗi không phải quota/rate-limit thì dừng thử ngay
      if (status !== 429 && status !== 503 && !e.message?.includes('quota') && !e.message?.includes('not found')) {
        return 'Lỗi khi gọi Gemini AI: ' + (e.message || 'Không xác định');
      }
      // Ngược lại tiếp tục thử model tiếp theo
    }
  }

  return 'Tất cả model Gemini đã hết quota hoặc không khả dụng. Vui lòng thử lại sau ít phút.';
}

// Xử lý hội thoại
exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: 'Tin nhắn trống.' });

    // Phân loại truy vấn
    if (/hướng dẫn|cách dùng|sử dụng/i.test(message)) {
      return res.json({ reply: 'Bạn có thể đăng ký, làm đề thi thử, xem kết quả và ôn tập từ vựng trên website. Nếu cần trợ giúp cụ thể, hãy hỏi chi tiết hơn!' });
    }
    if (/đề thi|từ vựng|kết quả/i.test(message)) {
      const data = await getPublicData(message);
      return res.json({ reply: data });
    }

    // Mặc định: gọi Gemini AI
    const aiReply = await callExternalAI(message);
    return res.json({ reply: aiReply });
  } catch (e) {
    console.error('handleChat error:', e);
    return res.status(500).json({ reply: 'Lỗi máy chủ.' });
  }
};
