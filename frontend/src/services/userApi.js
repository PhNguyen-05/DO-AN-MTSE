const BASE = import.meta.env.VITE_API_URL || "";

// ─── Helper ──────────────────────────────────────────────────
const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return "";
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
};

const authFetch = async (path, options = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: getToken(),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
};

// ─── Exam APIs ────────────────────────────────────────────────
export const examApi = {
  // GET /user/exams — danh sách đề + attemptInfo (ExamList)
  getExams: () => authFetch("/user/exams"),

  // GET /user/exams/:id — chi tiết 1 đề (TakeExam)
  getExam: (examId) => authFetch(`/user/exams/${examId}`),

  // GET /user/exams/:id/questions — câu hỏi không có đáp án (TakeExam)
  getQuestions: (examId) => authFetch(`/user/exams/${examId}/questions`),

  // POST /user/exams/:id/attempts — nộp bài (TakeExam)
  submitAttempt: (examId, payload) =>
    authFetch(`/user/exams/${examId}/attempts`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // GET /user/exams/:id/attempts — lịch sử làm bài (ExamHistory)
  getAttemptHistory: (examId) =>
    authFetch(`/user/exams/${examId}/attempts`),
};

// ─── Attempt APIs ─────────────────────────────────────────────
export const attemptApi = {
  // GET /user/attempts/:id — kết quả chi tiết (ExamResult)
  getResult: (attemptId) => authFetch(`/user/attempts/${attemptId}`),

  // GET /user/attempts/summary — map examId→stats (ExamList)
  getSummary: () => authFetch("/user/attempts/summary"),
};

// ─── Vocabulary APIs ──────────────────────────────────────────
export const vocabApi = {
  // GET /user/vocabulary-sets — danh sách bộ từ (VocabularyHub)
  getSets: () => authFetch("/user/vocabulary-sets"),

  // GET /api/vocabulary/notebook — sổ tay cá nhân (VocabularyHub)
  getNotebook: () => authFetch("/api/vocabulary/notebook"),

  // POST /api/vocabulary/translate — tra từ (VocabularyTranslate)
  translate: (word) =>
    authFetch("/api/vocabulary/translate", {
      method: "POST",
      body: JSON.stringify({ word }),
    }),

  // POST /api/vocabulary/notebook — lưu từ vào sổ tay
  saveWord: (wordData) =>
    authFetch("/api/vocabulary/notebook", {
      method: "POST",
      body: JSON.stringify(wordData),
    }),

  // PATCH /api/vocabulary/notebook/:id/status — cập nhật trạng thái
  updateStatus: (id, status) =>
    authFetch(`/api/vocabulary/notebook/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // DELETE /api/vocabulary/notebook/:id — xóa từ
  deleteWord: (id) =>
    authFetch(`/api/vocabulary/notebook/${id}`, { method: "DELETE" }),
};

// ─── Analytics API ────────────────────────────────────────────
export const analyticsApi = {
  // GET /user/analytics — thống kê học tập (UserAnalytics)
  get: () => authFetch("/user/analytics"),
};