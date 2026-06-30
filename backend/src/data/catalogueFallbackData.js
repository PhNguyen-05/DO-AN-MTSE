const fallbackExams = [
  {
    _id: "fallback-ets-2026-1",
    name: "ETS TOEIC 2026 - Bộ đề chuẩn mới",
    releaseYear: 2026,
    difficulty: "medium",
    priceBundle: 450000,
    priceListening: 260000,
    priceReading: 260000,
    pdfUrl: "",
    audioUrls: ["fallback-audio"],
    createdAt: "2026-04-18T08:00:00.000Z",
    updatedAt: "2026-05-12T08:00:00.000Z"
  },
  {
    _id: "fallback-economy-2025",
    name: "Economy TOEIC LC & RC 2025",
    releaseYear: 2025,
    difficulty: "hard",
    priceBundle: 390000,
    priceListening: 220000,
    priceReading: 220000,
    pdfUrl: "",
    audioUrls: ["fallback-audio"],
    createdAt: "2026-03-04T08:00:00.000Z",
    updatedAt: "2026-04-30T08:00:00.000Z"
  },
  {
    _id: "fallback-reading-2024",
    name: "Bộ 5 đề thi thử Reading có chấm điểm",
    releaseYear: 2024,
    difficulty: "easy",
    priceBundle: 180000,
    priceListening: 0,
    priceReading: 120000,
    pdfUrl: "",
    audioUrls: [],
    createdAt: "2026-01-20T08:00:00.000Z",
    updatedAt: "2026-02-10T08:00:00.000Z"
  },
  {
    _id: "fallback-listening-2024",
    name: "Gói luyện nghe TOEIC 2024 - ETS Format",
    releaseYear: 2024,
    difficulty: "medium",
    priceBundle: 320000,
    priceListening: 190000,
    priceReading: 0,
    pdfUrl: "",
    audioUrls: ["fallback-audio"],
    createdAt: "2025-12-05T08:00:00.000Z",
    updatedAt: "2026-01-16T08:00:00.000Z"
  }
];

const fallbackVocabularyProducts = [
  {
    id: "vocab-it-01",
    title: "Flashcard từ vựng chuyên ngành IT",
    subtitle: "350 từ vựng công nghệ, ví dụ song ngữ và mini quiz",
    type: "vocabulary",
    category: "vocabulary",
    categoryName: "Bộ từ vựng",
    categoryLabel: "VOCAB",
    skill: "vocabulary",
    packageType: "vocabulary",
    year: 2026,
    price: 85000,
    originalPrice: 120000,
    rating: 4.8,
    reviews: 96,
    sold: 212,
    views: 1480,
    tone: "green",
    updatedAt: "2026-05-18T08:00:00.000Z",
    questionCount: 350
  },
  {
    id: "vocab-business-02",
    title: "Bộ từ vựng TOEIC Business 900+",
    subtitle: "Từ vựng thương mại, hợp đồng, nhân sự và tài chính",
    type: "vocabulary",
    category: "vocabulary",
    categoryName: "Bộ từ vựng",
    categoryLabel: "VOCAB",
    skill: "vocabulary",
    packageType: "vocabulary",
    year: 2025,
    price: 99000,
    originalPrice: 150000,
    rating: 4.9,
    reviews: 128,
    sold: 276,
    views: 1960,
    tone: "orange",
    updatedAt: "2026-04-24T08:00:00.000Z",
    questionCount: 500
  }
];

const banners = [
  {
    id: "toeic-900",
    title: "Chinh phục TOEIC 900+",
    subtitle: "Tham gia khóa luyện thi chuyên sâu với bộ tài liệu mới nhất. Giảm 20% cho 100 học viên đầu tiên.",
    badge: "Sự kiện mới"
  }
];

const articles = [
  {
    id: "reading-time",
    title: "Chiến lược quản lý thời gian trong phần thi Reading TOEIC",
    summary: "Cách phân bổ thời gian theo từng part để giữ nhịp làm bài ổn định.",
    category: "blog",
    type: "Bài viết",
    date: "2026-05-12T08:00:00.000Z",
    readMinutes: 5
  },
  {
    id: "listening-keyword",
    title: "Làm sao để nghe keyword hiệu quả trong Part 3 và Part 4?",
    summary: "Kỹ thuật bắt từ khóa, dự đoán ngữ cảnh và tránh bẫy paraphrase.",
    category: "blog",
    type: "Bài viết",
    date: "2026-05-10T08:00:00.000Z",
    readMinutes: 7
  },
  {
    id: "toeic-update",
    title: "Cập nhật cấu trúc đề thi TOEIC mới nhất năm 2026",
    summary: "Tổng hợp các điểm cần lưu ý khi luyện đề theo format mới.",
    category: "blog",
    type: "Bài viết",
    date: "2026-05-08T08:00:00.000Z",
    readMinutes: 4
  },
  {
    id: "toeic-fee-2026",
    title: "Thông báo thay đổi lệ phí thi TOEIC áp dụng từ năm 2026",
    summary: "Cập nhật mức lệ phí thi TOEIC mới và thời gian áp dụng chính thức.",
    category: "announcement",
    type: "Tin tức",
    date: "2026-05-07T08:00:00.000Z",
    readMinutes: 3
  },
  {
    id: "toeic-schedule-2026",
    title: "Lịch thi TOEIC các đợt tháng 7 và tháng 8/2026",
    summary: "Danh sách địa điểm và thời gian tổ chức thi TOEIC trong hai tháng tới.",
    category: "announcement",
    type: "Tin tức",
    date: "2026-05-06T08:00:00.000Z",
    readMinutes: 2
  }
];

module.exports = {
  articles,
  banners,
  fallbackExams,
  fallbackVocabularyProducts
};
