import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const createEmptyForm = () => ({
  name: "",
  releaseYear: new Date().getFullYear(),
  difficulty: "medium",
  examType: "bundle",
  price: "",
  priceBundle: 0,
  priceListening: 0,
  priceReading: 0,
  durationMinutes: 120,
  pdf: null,
  answerPdf: null,
  audios: [],
  hasExistingPdf: false,
  hasExistingAnswerPdf: false,
  existingPdfUrl: "",
  existingAnswerPdfUrl: "",
  existingAudioUrls: [],
  removeExistingAudios: false
});

const createEmptyQuestionForm = () => ({
  part: 1,
  questionNumber: 1,
  readingPassage: "",
  answerA: "",
  answerB: "",
  answerC: "",
  answerD: "",
  correctAnswer: "A",
  explanation: ""
});

const createEmptyVocabularyWord = () => ({
  term: "",
  phonetic: "",
  partOfSpeech: "",
  meaning: "",
  example: "",
  audioUrl: "",
  audioFile: null,
  imageUrl: "",
  imageFile: null
});

const createEmptyVocabularyForm = () => ({
  name: "",
  description: "",
  thumbnail: null,
  thumbnailUrl: "",
  price: "",
  accessType: "paid",
  words: [createEmptyVocabularyWord()]
});

const createEmptyCouponForm = () => ({
  code: "",
  discountType: "percent",
  discountPercent: "",
  fixedAmount: "",
  minimumOrderValue: 0,
  maxUses: 0,
  maxUsesPerUser: 1,
  startDate: "",
  endDate: "",
  scope: "system",
  isActive: true
});

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || ""
});

const yearOptions = [2022, 2023, 2024, 2025, 2026, 2027];
const currency = new Intl.NumberFormat("vi-VN");
const examTypeOptions = [
  { value: "bundle", label: "Đề thi trọn gói", priceKey: "priceBundle" },
  { value: "listening", label: "Đề phần Nghe", priceKey: "priceListening" },
  { value: "reading", label: "Đề phần Đọc", priceKey: "priceReading" }
];
const accessTypeOptions = [
  { value: "free", label: "Miễn phí" },
  { value: "paid", label: "Trả phí" },
  { value: "premium", label: "Premium" }
];
const couponScopeOptions = [
  { value: "system", label: "Toàn hệ thống" },
  { value: "exam_2026", label: "Chỉ áp dụng cho đề năm 2026" },
  { value: "premium", label: "Gói Premium" }
];
const couponTypeOptions = [
  { value: "percent", label: "Giảm theo %" },
  { value: "fixed", label: "Số tiền cố định" }
];

const getExamTypeFromExam = (exam) => {
  if (Number(exam.priceListening || 0) > 0) return "listening";
  if (Number(exam.priceReading || 0) > 0) return "reading";
  return "bundle";
};

const getExamDisplayPrice = (exam) => {
  const type = getExamTypeFromExam(exam);
  const option = examTypeOptions.find((item) => item.value === type);
  return exam[option?.priceKey || "priceBundle"];
};
const formatVnd = (value) => `${currency.format(Number(value || 0))} đồng`;

const getFileNameFromUrl = (url) => {
  if (!url) return "";

  try {
    return decodeURIComponent(url.split("/").pop() || url);
  } catch {
    return url.split("/").pop() || url;
  }
};

const getMaterialLabel = (exam) => {
  const materials = [];

  if (exam.pdfUrl) {
    materials.push("PDF");
  }

  if (exam.answerPdfUrl) {
    materials.push("ANS");
  }

  if ((exam.audioUrls || []).length > 0) {
    materials.push("MP3");
  }

  return materials.length ? materials.join(" / ") : "Chưa có";
};

const answerKeys = ["A", "B", "C", "D"];
const getRequiredAnswerKeys = (part) => (Number(part) === 2 ? ["A", "B", "C"] : answerKeys);

const getNextQuestionNumber = (questions = []) => {
  const usedNumbers = new Set(questions.map((question) => Number(question.questionNumber)));

  for (let number = 1; number <= 200; number += 1) {
    if (!usedNumbers.has(number)) return number;
  }

  return 200;
};

const getViewLabel = (view) => {
  if (view === "exams") return "Quản lý đề thi";
  if (view === "questions") return "Ngân hàng câu hỏi";
  if (view === "vocabulary") return "Quản lý bộ từ vựng";
  if (view === "coupons") return "Quản lý mã giảm giá";
  return "Dashboard";
};

const getViewTitle = (view) => {
  if (view === "exams") return "Quản lý Đề thi TOEIC";
  if (view === "questions") return "Quản lý Ngân hàng câu hỏi";
  if (view === "vocabulary") return "Quản lý Bộ từ vựng";
  if (view === "coupons") return "Quản lý Mã giảm giá";
  return "Thống kê hệ thống";
};

const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const [activeView, setActiveView] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formResetKey, setFormResetKey] = useState(0);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionForm, setQuestionForm] = useState(createEmptyQuestionForm);
  const [questionEditingId, setQuestionEditingId] = useState(null);
  const [questionFormResetKey, setQuestionFormResetKey] = useState(0);
  const [vocabularySets, setVocabularySets] = useState([]);
  const [vocabularyForm, setVocabularyForm] = useState(createEmptyVocabularyForm);
  const [vocabularyEditingId, setVocabularyEditingId] = useState(null);
  const [vocabularyFormResetKey, setVocabularyFormResetKey] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState(createEmptyCouponForm);
  const [couponEditingId, setCouponEditingId] = useState(null);
  const [couponFormResetKey, setCouponFormResetKey] = useState(0);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionImporting, setQuestionImporting] = useState(false);
  const [vocabularyLoading, setVocabularyLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  // Pagination states
  const [examPage, setExamPage] = useState(1);
  const [questionPage, setQuestionPage] = useState(1);
  const [vocabularyPage, setVocabularyPage] = useState(1);
  const itemsPerPage = 10;

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  const maxRevenue = useMemo(() => {
    const values = (stats?.monthlyRevenue || []).map((item) => Number(item.total) || 0);
    return Math.max(...values, 1);
  }, [stats]);

  const completionRate = Number(stats?.completionRate || 0);
  const selectedExam = useMemo(
    () => exams.find((exam) => exam._id === selectedExamId),
    [exams, selectedExamId]
  );
  const questionsByPart = useMemo(() => (
    Array.from({ length: 7 }, (_, index) => {
      const part = index + 1;
      return {
        part,
        count: questions.filter((question) => Number(question.part) === part).length
      };
    })
  ), [questions]);

  const visibleVocabularySets = useMemo(() => vocabularySets, [vocabularySets]);
  const visibleCoupons = useMemo(() => coupons, [coupons]);

  // Pagination logic
  const paginatedExams = useMemo(() => {
    const start = (examPage - 1) * itemsPerPage;
    return exams.slice(start, start + itemsPerPage);
  }, [exams, examPage]);

  const paginatedQuestions = useMemo(() => {
    const start = (questionPage - 1) * itemsPerPage;
    return questions.slice(start, start + itemsPerPage);
  }, [questions, questionPage]);

  const paginatedVocabularySets = useMemo(() => {
    const start = (vocabularyPage - 1) * itemsPerPage;
    return visibleVocabularySets.slice(start, start + itemsPerPage);
  }, [visibleVocabularySets, vocabularyPage]);

  const examTotalPages = Math.ceil(exams.length / itemsPerPage);
  const questionTotalPages = Math.ceil(questions.length / itemsPerPage);
  const vocabularyTotalPages = Math.ceil(visibleVocabularySets.length / itemsPerPage);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const loadAdminData = async () => {
    const [statsResponse, examsResponse, vocabularyResponse, couponResponse] = await Promise.all([
      api.get("/admin/dashboard", { headers: authHeaders }),
      api.get("/admin/exams?includeHidden=true", { headers: authHeaders }),
      api.get("/admin/vocabulary-sets?includeHidden=true", { headers: authHeaders }),
      api.get("/admin/coupons?includeHidden=true", { headers: authHeaders })
    ]);

    setStats(statsResponse.data);
    setExams(examsResponse.data);
    setVocabularySets(vocabularyResponse.data);
    setCoupons(couponResponse.data);
  };

  const loadQuestions = async (examId = selectedExamId) => {
    if (!examId) {
      setQuestions([]);
      return;
    }

    const response = await api.get(`/admin/exams/${examId}/questions`, { headers: authHeaders });
    setQuestions(response.data);
    return response.data;
  };

  useEffect(() => {
    loadAdminData().catch(() => {
      setNotice({ type: "danger", message: "Could not load admin data." });
    });
  }, []);

  useEffect(() => {
    if (activeView === "questions" && exams.length && !selectedExamId) {
      setSelectedExamId(exams[0]._id);
    }
  }, [activeView, exams, selectedExamId]);

  useEffect(() => {
    if (activeView !== "questions") return;

    loadQuestions().catch(() => {
      setNotice({ type: "danger", message: "Could not load questions." });
    });
  }, [activeView, selectedExamId]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 15000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const changeView = (view) => {
    setActiveView(view);
    setNotice(null);
    // Reset pagination when changing views
    setExamPage(1);
    setQuestionPage(1);
    setVocabularyPage(1);
  };

  const updateField = (event) => {
    const { name, value, files } = event.target;

    if (name === "pdf") {
      setForm((current) => ({ ...current, pdf: files[0] || null }));
      return;
    }

    if (name === "answerPdf") {
      setForm((current) => ({ ...current, answerPdf: files[0] || null }));
      return;
    }

    if (name === "audios") {
      setForm((current) => ({
        ...current,
        audios: Array.from(files || []),
        removeExistingAudios: files?.length ? false : current.removeExistingAudios
      }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateQuestionField = (event) => {
    const { name, value } = event.target;
    setQuestionForm((current) => ({ ...current, [name]: value }));
  };

  const updateVocabularyField = (event) => {
    const { name, value, files } = event.target;

    if (name === "thumbnail") {
      setVocabularyForm((current) => ({ ...current, thumbnail: files[0] || null }));
      return;
    }

    setVocabularyForm((current) => ({ ...current, [name]: value }));
  };

  const updateVocabularyWord = (index, field, value) => {
    setVocabularyForm((current) => ({
      ...current,
      words: current.words.map((word, wordIndex) => (
        wordIndex === index ? { ...word, [field]: value } : word
      ))
    }));
  };

  const updateVocabularyWordAudio = (index, file) => {
    setVocabularyForm((current) => ({
      ...current,
      words: current.words.map((word, wordIndex) => (
        wordIndex === index ? { ...word, audioFile: file || null } : word
      ))
    }));
  };

  const updateVocabularyWordImage = (index, file) => {
    setVocabularyForm((current) => ({
      ...current,
      words: current.words.map((word, wordIndex) => (
        wordIndex === index ? { ...word, imageFile: file || null } : word
      ))
    }));
  };

  const addVocabularyWord = () => {
    setVocabularyForm((current) => ({
      ...current,
      words: [...current.words, createEmptyVocabularyWord()]
    }));
  };

  const removeVocabularyWord = (index) => {
    setVocabularyForm((current) => ({
      ...current,
      words: current.words.length > 1
        ? current.words.filter((_, wordIndex) => wordIndex !== index)
        : [createEmptyVocabularyWord()]
    }));
  };

  const updateCouponField = (event) => {
    const { name, value, type, checked } = event.target;
    setCouponForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setEditingId(null);
    setFormResetKey((current) => current + 1);
  };

  const resetQuestionForm = (sourceQuestions = questions) => {
    setQuestionForm({
      ...createEmptyQuestionForm(),
      questionNumber: getNextQuestionNumber(sourceQuestions)
    });
    setQuestionEditingId(null);
    setQuestionFormResetKey((current) => current + 1);
  };

  const resetVocabularyForm = () => {
    setVocabularyForm(createEmptyVocabularyForm());
    setVocabularyEditingId(null);
    setVocabularyFormResetKey((current) => current + 1);
  };

  const resetCouponForm = () => {
    setCouponForm(createEmptyCouponForm());
    setCouponEditingId(null);
    setCouponFormResetKey((current) => current + 1);
  };

  const submitExam = async (event) => {
    event.preventDefault();
    setNotice(null);

    const selectedType = examTypeOptions.find((item) => item.value === form.examType) || examTypeOptions[0];
    const selectedPrice = Number(form.price);

    if (!form.name.trim() || !form.releaseYear || !form.difficulty || !form.examType) {
      setNotice({ type: "danger", message: "Vui long nhap day du thong tin de thi." });
      return;
    }

    if (!Number.isFinite(selectedPrice) || selectedPrice < 0) {
      setNotice({ type: "danger", message: "Vui long nhap gia tien lon hon hoac bang 0." });
      return;
    }

    const durationMinutes = Number(form.durationMinutes);

    if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 300) {
      setNotice({ type: "danger", message: "Thoi gian lam bai phai tu 1 den 300 phut." });
      return;
    }

    if (!editingId && !form.pdf) {
      setNotice({ type: "danger", message: "Vui long tai file de PDF." });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    ["name", "releaseYear", "difficulty"].forEach((key) => {
      formData.append(key, form[key]);
    });
    formData.append("durationMinutes", durationMinutes);
    formData.append("priceBundle", selectedType.priceKey === "priceBundle" ? selectedPrice : 0);
    formData.append("priceListening", selectedType.priceKey === "priceListening" ? selectedPrice : 0);
    formData.append("priceReading", selectedType.priceKey === "priceReading" ? selectedPrice : 0);

    if (form.pdf) {
      formData.append("pdf", form.pdf);
    }

    if (form.answerPdf) {
      formData.append("answerPdf", form.answerPdf);
    }

    form.audios.forEach((audio) => formData.append("audios", audio));
    if (form.removeExistingAudios) {
      formData.append("removeAudios", "true");
    }

    try {
      let response;

      if (editingId) {
        response = await api.put(`/admin/exams/${editingId}`, formData, { headers: authHeaders });
      } else {
        response = await api.post("/admin/exams", formData, { headers: authHeaders });
      }

      await loadAdminData();
      resetForm();
      const importResult = response.data?.questionImport;
      const importMessage = importResult
        ? ` ${importResult.message || `Imported ${importResult.createdCount || 0} question(s) from PDF.`}`
        : "";
      setNotice({ type: "success", message: `Exam saved successfully.${importMessage}` });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not save exam." });
    } finally {
      setLoading(false);
    }
  };

  const editExam = (exam) => {
    const examType = getExamTypeFromExam(exam);
    setEditingId(exam._id);
    setForm({
      name: exam.name,
      releaseYear: exam.releaseYear,
      difficulty: exam.difficulty,
      examType,
      price: getExamDisplayPrice(exam) || "",
      priceBundle: exam.priceBundle,
      priceListening: exam.priceListening,
      priceReading: exam.priceReading,
      durationMinutes: exam.durationMinutes || 120,
      pdf: null,
      answerPdf: null,
      audios: [],
      hasExistingPdf: Boolean(exam.pdfUrl),
      hasExistingAnswerPdf: Boolean(exam.answerPdfUrl),
      existingPdfUrl: exam.pdfUrl || "",
      existingAnswerPdfUrl: exam.answerPdfUrl || "",
      existingAudioUrls: exam.audioUrls || [],
      removeExistingAudios: false
    });
    setFormResetKey((current) => current + 1);
  };

  const removeExistingAudios = () => {
    setForm((current) => ({
      ...current,
      existingAudioUrls: [],
      audios: [],
      removeExistingAudios: true
    }));
    setFormResetKey((current) => current + 1);
  };

  const removeExam = async (examId) => {
    if (!window.confirm("Delete this exam? Purchased exams will be hidden instead.")) {
      return;
    }

    try {
      const response = await api.delete(`/admin/exams/${examId}`, { headers: authHeaders });
      await loadAdminData();
      setNotice({ type: "info", message: response.data.message });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not delete exam." });
    }
  };

  const changeSelectedExam = (event) => {
    setSelectedExamId(event.target.value);
    setQuestions([]);
    resetQuestionForm([]);
  };

  const submitQuestion = async (event) => {
    event.preventDefault();
    setNotice(null);

    if (!selectedExamId) {
      setNotice({ type: "danger", message: "Vui long chon de thi truoc khi them cau hoi." });
      return;
    }

    const payload = {
      part: Number(questionForm.part),
      questionNumber: Number(questionForm.questionNumber),
      readingPassage: questionForm.readingPassage,
      answerA: questionForm.answerA,
      answerB: questionForm.answerB,
      answerC: questionForm.answerC,
      answerD: questionForm.answerD,
      correctAnswer: questionForm.correctAnswer,
      explanation: questionForm.explanation
    };

    if (payload.part < 1 || payload.part > 7 || payload.questionNumber < 1 || payload.questionNumber > 200) {
      setNotice({ type: "danger", message: "Part phai tu 1-7 va thu tu cau phai tu 1-200." });
      return;
    }

    const requiredAnswerFields = getRequiredAnswerKeys(payload.part).map((key) => `answer${key}`);

    if (!requiredAnswerFields.every((key) => payload[key].trim())) {
      setNotice({
        type: "danger",
        message: payload.part === 2
          ? "Vui long nhap day du dap an A, B va C."
          : "Vui long nhap day du dap an A, B, C va D."
      });
      return;
    }

    setQuestionLoading(true);

    try {
      if (questionEditingId) {
        await api.put(`/admin/questions/${questionEditingId}`, payload, { headers: authHeaders });
      } else {
        await api.post(`/admin/exams/${selectedExamId}/questions`, payload, { headers: authHeaders });
      }

      const response = await api.get(`/admin/exams/${selectedExamId}/questions`, { headers: authHeaders });
      setQuestions(response.data);
      resetQuestionForm(response.data);
      setNotice({ type: "success", message: "Question saved successfully." });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not save question." });
    } finally {
      setQuestionLoading(false);
    }
  };

  const importQuestionsFromPdf = async () => {
    if (!selectedExamId) {
      setNotice({ type: "danger", message: "Vui long chon de thi truoc khi doc PDF." });
      return;
    }

    setNotice(null);
    setQuestionImporting(true);

    try {
      const response = await api.post(`/admin/exams/${selectedExamId}/questions/import-pdf`, {}, { headers: authHeaders });
      const importedQuestions = await loadQuestions(selectedExamId);
      resetQuestionForm(importedQuestions);
      setNotice({ type: "success", message: response.data?.message || "Imported questions from PDF." });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not import questions from PDF." });
    } finally {
      setQuestionImporting(false);
    }
  };

  const editQuestion = (question) => {
    setQuestionEditingId(question._id);
    setQuestionForm({
      part: question.part,
      questionNumber: question.questionNumber,
      readingPassage: question.readingPassage || "",
      answerA: question.answers?.A || "",
      answerB: question.answers?.B || "",
      answerC: question.answers?.C || "",
      answerD: question.answers?.D || "",
      correctAnswer: question.correctAnswer || "A",
      explanation: question.explanation || ""
    });
    setQuestionFormResetKey((current) => current + 1);
  };

  const removeQuestion = async (questionId) => {
    if (!window.confirm("Delete this question?")) {
      return;
    }

    try {
      await api.delete(`/admin/questions/${questionId}`, { headers: authHeaders });
      const response = await api.get(`/admin/exams/${selectedExamId}/questions`, { headers: authHeaders });
      setQuestions(response.data);
      resetQuestionForm(response.data);
      setNotice({ type: "info", message: "Question deleted successfully." });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not delete question." });
    }
  };

  const submitVocabularySet = async (event) => {
    event.preventDefault();
    setNotice(null);

    const cleanWords = vocabularyForm.words.filter((word) => word.term.trim() && word.meaning.trim());

    if (!vocabularyForm.name.trim() || cleanWords.length === 0) {
      setNotice({ type: "danger", message: "Vui long nhap ten bo tu vung va it nhat mot tu." });
      return;
    }

    const price = Number(vocabularyForm.price || 0);
    if (!Number.isFinite(price) || price < 0) {
      setNotice({ type: "danger", message: "Gia ban khong hop le." });
      return;
    }

    setVocabularyLoading(true);

    const formData = new FormData();
    formData.append("name", vocabularyForm.name);
    formData.append("description", vocabularyForm.description);
    formData.append("price", price);
    formData.append("accessType", vocabularyForm.accessType);
    formData.append("words", JSON.stringify(cleanWords.map(({ audioFile, imageFile, ...word }) => ({
      ...word,
      hasNewAudio: Boolean(audioFile),
      hasNewImage: Boolean(imageFile)
    }))));
    cleanWords.forEach((word) => {
      if (word.audioFile) formData.append("wordAudios", word.audioFile);
      if (word.imageFile) formData.append("wordImages", word.imageFile);
    });
    if (vocabularyForm.thumbnail) {
      formData.append("thumbnail", vocabularyForm.thumbnail);
    }

    try {
      if (vocabularyEditingId) {
        await api.put(`/admin/vocabulary-sets/${vocabularyEditingId}`, formData, { headers: authHeaders });
      } else {
        await api.post("/admin/vocabulary-sets", formData, { headers: authHeaders });
      }

      await loadAdminData();
      resetVocabularyForm();
      setNotice({ type: "success", message: "Vocabulary set saved successfully." });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not save vocabulary set." });
    } finally {
      setVocabularyLoading(false);
    }
  };

  const editVocabularySet = (set) => {
    setVocabularyEditingId(set._id);
    setVocabularyForm({
      name: set.name || "",
      description: set.description || "",
      thumbnail: null,
      thumbnailUrl: set.thumbnailUrl || "",
      price: set.price ?? "",
      accessType: set.accessType || "paid",
      words: (set.words?.length ? set.words : [createEmptyVocabularyWord()]).map((word) => ({
        term: word.term || "",
        phonetic: word.phonetic || "",
        partOfSpeech: word.partOfSpeech || "",
        meaning: word.meaning || "",
        example: word.example || "",
        audioUrl: word.audioUrl || "",
        audioFile: null,
        imageUrl: word.imageUrl || "",
        imageFile: null
      }))
    });
    setVocabularyFormResetKey((current) => current + 1);
  };

  const removeVocabularySet = async (setId) => {
    if (!window.confirm("Hide this vocabulary set?")) {
      return;
    }

    try {
      const response = await api.delete(`/admin/vocabulary-sets/${setId}`, { headers: authHeaders });
      await loadAdminData();
      setNotice({ type: "info", message: response.data.message });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not delete vocabulary set." });
    }
  };

  const submitCoupon = async (event) => {
    event.preventDefault();
    setNotice(null);

    if (!couponForm.code.trim() || !couponForm.startDate || !couponForm.endDate) {
      setNotice({ type: "danger", message: "Vui long nhap ma, ngay bat dau va ngay ket thuc." });
      return;
    }

    const payload = {
      ...couponForm,
      discountPercent: Number(couponForm.discountPercent || 0),
      fixedAmount: Number(couponForm.fixedAmount || 0),
      minimumOrderValue: Number(couponForm.minimumOrderValue || 0),
      maxUses: Number(couponForm.maxUses || 0),
      maxUsesPerUser: Number(couponForm.maxUsesPerUser || 0)
    };

    setCouponLoading(true);

    try {
      if (couponEditingId) {
        await api.put(`/admin/coupons/${couponEditingId}`, payload, { headers: authHeaders });
      } else {
        await api.post("/admin/coupons", payload, { headers: authHeaders });
      }

      await loadAdminData();
      resetCouponForm();
      setNotice({ type: "success", message: "Coupon saved successfully." });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not save coupon." });
    } finally {
      setCouponLoading(false);
    }
  };

  const editCoupon = (coupon) => {
    setCouponEditingId(coupon._id);
    setCouponForm({
      code: coupon.code || "",
      discountType: coupon.discountType || "percent",
      discountPercent: coupon.discountPercent ?? "",
      fixedAmount: coupon.fixedAmount ?? "",
      minimumOrderValue: coupon.minimumOrderValue ?? 0,
      maxUses: coupon.maxUses ?? 0,
      maxUsesPerUser: coupon.maxUsesPerUser ?? 1,
      startDate: toDateInputValue(coupon.startDate),
      endDate: toDateInputValue(coupon.endDate),
      scope: coupon.scope || "system",
      isActive: Boolean(coupon.isActive)
    });
    setCouponFormResetKey((current) => current + 1);
  };

  const removeCoupon = async (couponId) => {
    if (!window.confirm("Hide this coupon?")) {
      return;
    }

    try {
      const response = await api.delete(`/admin/coupons/${couponId}`, { headers: authHeaders });
      await loadAdminData();
      setNotice({ type: "info", message: response.data.message });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not delete coupon." });
    }
  };

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-mark">T</span>
          <div>
            <strong>TOEIC Admin</strong>
            <small>{user.role || "staff"}</small>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          <button className={activeView === "dashboard" ? "active" : ""} type="button" onClick={() => changeView("dashboard")}>
            <i className="bi bi-grid-1x2" aria-hidden="true" />
            Dashboard
          </button>
          <button className={activeView === "exams" ? "active" : ""} type="button" onClick={() => changeView("exams")}>
            <i className="bi bi-journal-text" aria-hidden="true" />
            Quản lý đề thi
          </button>
          <button className={activeView === "questions" ? "active" : ""} type="button" onClick={() => changeView("questions")}>
            <i className="bi bi-list-check" aria-hidden="true" />
            Ngân hàng câu hỏi
          </button>
          <button className={activeView === "vocabulary" ? "active" : ""} type="button" onClick={() => changeView("vocabulary")}>
            <i className="bi bi-collection" aria-hidden="true" />
            Bộ từ vựng
          </button>
          <button className={activeView === "coupons" ? "active" : ""} type="button" onClick={() => changeView("coupons")}>
            <i className="bi bi-ticket-perforated" aria-hidden="true" />
            Mã giảm giá
          </button>
          <Link to="/profile">
            <i className="bi bi-person" aria-hidden="true" />
            Hồ sơ
          </Link>
        </nav>

        <button className="admin-logout" type="button" onClick={logout}>
          <i className="bi bi-box-arrow-right" aria-hidden="true" />
          Đăng xuất
        </button>
      </aside>

      <section className="admin-content">
        <header className="admin-topbar">
          <div>
            <p className="admin-breadcrumb">Home / {getViewLabel(activeView)}</p>
            <h1>{getViewTitle(activeView)}</h1>
          </div>
          <div className="admin-account">
            <span>{user.email || "Staff account"}</span>
            <strong>{user.role || "staff"}</strong>
          </div>
        </header>

        {notice && <div className={`alert alert-${notice.type}`}>{notice.message}</div>}

        {activeView === "dashboard" && (
          <div className="dashboard-grid">
            <section className="metric-card primary">
              <div className="metric-icon"><i className="bi bi-people" aria-hidden="true" /></div>
              <span>Tổng số User</span>
              <strong>{stats?.totalUsers ?? 0}</strong>
              <small>Học viên đang có trong hệ thống</small>
            </section>

            <section className="metric-card">
              <div className="metric-icon"><i className="bi bi-file-earmark-text" aria-hidden="true" /></div>
              <span>Tổng số Đề thi</span>
              <strong>{stats?.totalExams ?? 0}</strong>
              <small>Đề thi TOEIC đang hiển thị</small>
            </section>

            <section className="metric-card completion-card">
              <div className="metric-icon"><i className="bi bi-check2-circle" aria-hidden="true" /></div>
              <span>Tỉ lệ hoàn thành bài làm</span>
              <strong>{completionRate}%</strong>
              <div className="completion-track" aria-label={`Completion rate ${completionRate}%`}>
                <span style={{ width: `${Math.min(100, completionRate)}%` }} />
              </div>
              <small>{stats?.completedAttempts ?? 0}/{stats?.totalAttempts ?? 0} lượt làm đã hoàn thành</small>
            </section>

            <section className="admin-panel chart-panel">
              <div className="panel-heading">
                <div>
                  <h2>Biểu đồ tổng quan</h2>
                </div>
              </div>
              <div className="system-bars">
                {[
                  { label: "User", value: stats?.totalUsers ?? 0 },
                  { label: "Đề thi", value: stats?.totalExams ?? 0 },
                  { label: "Hoàn thành", value: completionRate }
                ].map((item) => (
                  <div className="system-bar" key={item.label}>
                    <span>{item.label}</span>
                    <div><span style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }} /></div>
                    <strong>{item.value}{item.label === "Hoàn thành" ? "%" : ""}</strong>
                  </div>
                ))}
              </div>
            </section>

            {user.role === "admin" && (
              <section className="admin-panel revenue-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Doanh thu dòng tiền</h2>
                  </div>
                  <strong>{formatVnd(stats?.revenue)}</strong>
                </div>
                <div className="revenue-chart">
                  {(stats?.monthlyRevenue || []).map((item) => (
                    <div className="revenue-bar" key={item.month}>
                      <span style={{ height: `${Math.max(10, (Number(item.total) / maxRevenue) * 100)}%` }} />
                      <small>{item.month}</small>
                    </div>
                  ))}
                  {!(stats?.monthlyRevenue || []).length && (
                    <p className="empty-chart">Chưa có dữ liệu doanh thu.</p>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {activeView === "exams" && (
          <div className="exam-management-grid">
            <form className="admin-panel exam-form" key={formResetKey} onSubmit={submitExam}>
              <div className="panel-heading">
                <div>
                  <h2>{editingId ? "Chỉnh sửa đề thi" : "Thêm mới đề thi"}</h2>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="name">Tên đề</label>
                <input className="form-control" id="name" name="name" value={form.name} onChange={updateField} required />
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="releaseYear">Năm phát hành</label>
                  <select className="form-select" id="releaseYear" name="releaseYear" value={form.releaseYear} onChange={updateField}>
                    {yearOptions.map((year) => <option value={year} key={year}>{year}</option>)}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="difficulty">Mức độ khó</label>
                  <select className="form-select" id="difficulty" name="difficulty" value={form.difficulty} onChange={updateField}>
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="durationMinutes">Thoi gian lam bai (phut)</label>
                  <input className="form-control" id="durationMinutes" name="durationMinutes" type="number" min="1" max="300" value={form.durationMinutes} onChange={updateField} required />
                </div>
              </div>

              <div className="price-grid">
                <label>
                  <span>Loại đề thi</span>
                  <select className="form-select" name="examType" value={form.examType} onChange={updateField} required>
                    {examTypeOptions.map((option) => (
                      <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Giá tiền</span>
                  <input className="form-control" name="price" type="number" min="0" value={form.price} onChange={updateField} required />
                  <small>{form.price === "" ? "Nhập 0 để miễn phí" : formatVnd(form.price)}</small>
                </label>
              </div>

              <div className="upload-zone">
                <label htmlFor="pdf">
                  <i className="bi bi-file-earmark-pdf" aria-hidden="true" />
                  <span>Tải file đề .pdf</span>
                  <input id="pdf" name="pdf" type="file" accept="application/pdf" onChange={updateField} required={!editingId && !form.hasExistingPdf} />
                  {form.existingPdfUrl && !form.pdf && (
                    <small className="current-file">Hiện có: {getFileNameFromUrl(form.existingPdfUrl)}</small>
                  )}
                  {form.pdf && (
                    <small className="current-file">Mới: {form.pdf.name}</small>
                  )}
                </label>
                <label htmlFor="audios">
                  <i className="bi bi-music-note-beamed" aria-hidden="true" />
                  <span>Tải file nghe .mp3</span>
                  <input id="audios" name="audios" type="file" accept="audio/mpeg,audio/mp3" multiple onChange={updateField} />
                  {(form.existingAudioUrls.length > 0 || form.audios.length > 0) && (
                    <div className="current-files">
                      {form.existingAudioUrls.length > 0 && !form.audios.length && (
                        <small>Hiện có: {form.existingAudioUrls.map(getFileNameFromUrl).join(", ")}</small>
                      )}
                      {form.audios.length > 0 && (
                        <small>Mới: {form.audios.map((audio) => audio.name).join(", ")}</small>
                      )}
                      {form.existingAudioUrls.length > 0 && (
                        <button className="link-button danger" type="button" onClick={removeExistingAudios}>
                          Bỏ file nghe
                        </button>
                      )}
                    </div>
                  )}
                </label>
                <label htmlFor="answerPdf">
                  <i className="bi bi-check2-square" aria-hidden="true" />
                  <span>Tai file dap an .pdf</span>
                  <input id="answerPdf" name="answerPdf" type="file" accept="application/pdf" onChange={updateField} />
                  {form.existingAnswerPdfUrl && !form.answerPdf && (
                    <small className="current-file">Hien co: {getFileNameFromUrl(form.existingAnswerPdfUrl)}</small>
                  )}
                  {form.answerPdf && (
                    <small className="current-file">Moi: {form.answerPdf.name}</small>
                  )}
                </label>
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu đề thi"}
                </button>
                {editingId && (
                  <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>
                    Hủy
                  </button>
                )}
              </div>
            </form>

            <section className="admin-panel exam-list-panel">
              <div className="panel-heading">
                <div>
                  <h2>Danh sách đề thi</h2>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle admin-table">
                  <thead>
                    <tr>
                      <th>Tên đề</th>
                      <th>Năm</th>
                      <th>Độ khó</th>
                      <th>Loại đề</th>
                      <th>Giá tiền</th>
                      <th>Học liệu</th>
                      <th>Trạng thái</th>
                      <th>Thoi gian</th>
                      <th className="text-end">Thao tac</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedExams.map((exam) => (
                      <tr key={exam._id}>
                        <td><strong>{exam.name}</strong></td>
                        <td>{exam.releaseYear}</td>
                        <td><span className="soft-badge">{exam.difficulty}</span></td>
                        <td>{examTypeOptions.find((option) => option.value === getExamTypeFromExam(exam))?.label}</td>
                        <td>{formatVnd(getExamDisplayPrice(exam))}</td>
                        <td>{getMaterialLabel(exam)}</td>
                        <td>{exam.isHidden ? <span className="status-badge hidden">Đã ẩn</span> : <span className="status-badge">Hiển thị</span>}</td>
                        <td>{exam.durationMinutes || 120} phut</td>
                        <td className="text-end">
                          <button className="icon-action" type="button" onClick={() => editExam(exam)} title="Chỉnh sửa">
                            <i className="bi bi-pencil-square" aria-hidden="true" />
                          </button>
                          <button className="icon-action danger" type="button" onClick={() => removeExam(exam._id)} title="Xóa đề thi">
                            <i className="bi bi-trash" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!exams.length && (
                      <tr>
                        <td className="text-center text-secondary py-4" colSpan="9">Chưa có đề thi.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {examTotalPages > 1 && (
                <div className="pagination-controls">
                  <button 
                    className="btn btn-sm btn-outline-secondary" 
                    onClick={() => setExamPage(p => Math.max(1, p - 1))}
                    disabled={examPage === 1}
                  >
                    Trước
                  </button>
                  <span className="pagination-info">Trang {examPage} / {examTotalPages}</span>
                  <button 
                    className="btn btn-sm btn-outline-secondary" 
                    onClick={() => setExamPage(p => Math.min(examTotalPages, p + 1))}
                    disabled={examPage === examTotalPages}
                  >
                    Sau
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {activeView === "questions" && (
          <div className="question-management">
            <section className="admin-panel question-toolbar">
              <div>
                <label className="form-label" htmlFor="questionExam">Chọn đề thi</label>
                <select className="form-select" id="questionExam" value={selectedExamId} onChange={changeSelectedExam}>
                  <option value="">Chọn đề thi cần nhập câu hỏi</option>
                  {exams.map((exam) => (
                    <option value={exam._id} key={exam._id}>{exam.name} ({exam.releaseYear})</option>
                  ))}
                </select>
              </div>
              <div className="question-progress">
                <span>{selectedExam ? selectedExam.name : "Chưa chọn đề"}</span>
                <strong>{questions.length}/200 câu</strong>
                <div className="completion-track" aria-label={`${questions.length} of 200 questions`}>
                  <span style={{ width: `${Math.min(100, (questions.length / 200) * 100)}%` }} />
                </div>
              </div>
              <div className="question-import-actions">
                <button className="btn btn-outline-primary" type="button" onClick={importQuestionsFromPdf} disabled={!selectedExamId || questionImporting}>
                  <i className="bi bi-file-earmark-arrow-up" aria-hidden="true" />
                  {questionImporting ? "Đang đọc PDF..." : "Đọc câu hỏi từ PDF"}
                </button>
              </div>
            </section>

            <div className="question-management-grid">
              <form className="admin-panel question-form" key={questionFormResetKey} onSubmit={submitQuestion}>
                <div className="panel-heading">
                  <div>
                    <h2>{questionEditingId ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi"}</h2>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="part">Part</label>
                    <select className="form-select" id="part" name="part" value={questionForm.part} onChange={updateQuestionField}>
                      {[1, 2, 3, 4, 5, 6, 7].map((part) => (
                        <option value={part} key={part}>Part {part}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label" htmlFor="questionNumber">Thứ tự câu</label>
                    <input className="form-control" id="questionNumber" name="questionNumber" type="number" min="1" max="200" value={questionForm.questionNumber} onChange={updateQuestionField} required />
                  </div>
                </div>

                <div className="mb-3 mt-3">
                  <label className="form-label" htmlFor="readingPassage">Đoạn văn đọc hiểu</label>
                  <textarea className="form-control" id="readingPassage" name="readingPassage" rows="5" value={questionForm.readingPassage} onChange={updateQuestionField} placeholder="Nhập passage nếu câu hỏi thuộc phần đọc hiểu..." />
                </div>

                <div className="answer-grid">
                  {answerKeys.map((key) => (
                    <label key={key}>
                      <span>Đáp án {key}</span>
                      <textarea className="form-control" name={`answer${key}`} rows="2" value={questionForm[`answer${key}`]} onChange={updateQuestionField} required />
                    </label>
                  ))}
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-12 col-md-5">
                    <label className="form-label" htmlFor="correctAnswer">Đáp án đúng</label>
                    <select className="form-select" id="correctAnswer" name="correctAnswer" value={questionForm.correctAnswer} onChange={updateQuestionField}>
                      {answerKeys.map((key) => (
                        <option value={key} key={key}>{key}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-7">
                    <label className="form-label" htmlFor="explanation">Lời giải thích chi tiết</label>
                    <textarea className="form-control" id="explanation" name="explanation" rows="3" value={questionForm.explanation} onChange={updateQuestionField} />
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn btn-primary" type="submit" disabled={questionLoading || !selectedExamId}>
                    {questionLoading ? "Đang lưu..." : "Lưu câu hỏi"}
                  </button>
                  {questionEditingId && (
                    <button className="btn btn-outline-secondary" type="button" onClick={() => resetQuestionForm()}>
                      Hủy
                    </button>
                  )}
                </div>
              </form>

              <section className="admin-panel question-list-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Danh sách câu hỏi</h2>
                  </div>
                </div>

                <div className="part-summary" aria-label="Question count by part">
                  {questionsByPart.map((item) => (
                    <span className="soft-badge" key={item.part}>Part {item.part}: {item.count}</span>
                  ))}
                </div>

                <div className="table-responsive">
                  <table className="table align-middle admin-table question-table">
                    <thead>
                      <tr>
                        <th>Câu</th>
                        <th>Part</th>
                        <th>Nội dung</th>
                        <th>Đáp án đúng</th>
                        <th>Lời giải</th>
                        <th className="text-end">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedQuestions.map((question) => (
                        <tr key={question._id}>
                          <td><strong>#{question.questionNumber}</strong></td>
                          <td><span className="soft-badge">Part {question.part}</span></td>
                          <td>
                            <div className="question-preview">
                              <strong>{question.readingPassage || question.answers?.A || "Không có nội dung"}</strong>
                              <small>A. {question.answers?.A}</small>
                              <small>B. {question.answers?.B}</small>
                            </div>
                          </td>
                          <td><span className="status-badge">{question.correctAnswer}</span></td>
                          <td className="question-explanation">{question.explanation || "Chưa có"}</td>
                          <td className="text-end">
                            <button className="icon-action" type="button" onClick={() => editQuestion(question)} title="Chỉnh sửa">
                              <i className="bi bi-pencil-square" aria-hidden="true" />
                            </button>
                            <button className="icon-action danger" type="button" onClick={() => removeQuestion(question._id)} title="Xóa câu hỏi">
                              <i className="bi bi-trash" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!questions.length && (
                        <tr>
                          <td className="text-center text-secondary py-4" colSpan="6">
                            {selectedExamId ? "Chưa có câu hỏi cho đề này." : "Vui lòng chọn một đề thi."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {questionTotalPages > 1 && (
                  <div className="pagination-controls">
                    <button 
                      className="btn btn-sm btn-outline-secondary" 
                      onClick={() => setQuestionPage(p => Math.max(1, p - 1))}
                      disabled={questionPage === 1}
                    >
                      Trước
                    </button>
                    <span className="pagination-info">Trang {questionPage} / {questionTotalPages}</span>
                    <button 
                      className="btn btn-sm btn-outline-secondary" 
                      onClick={() => setQuestionPage(p => Math.min(questionTotalPages, p + 1))}
                      disabled={questionPage === questionTotalPages}
                    >
                      Sau
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {activeView === "vocabulary" && (
          <div className="exam-management-grid">
            <form className="admin-panel exam-form" key={vocabularyFormResetKey} onSubmit={submitVocabularySet}>
              <div className="panel-heading">
                <div>
                  <h2>{vocabularyEditingId ? "Chinh sua bo tu vung" : "Them bo tu vung"}</h2>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="vocabularyName">Ten bo tu vung</label>
                <input className="form-control" id="vocabularyName" name="name" value={vocabularyForm.name} onChange={updateVocabularyField} required />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="vocabularyDescription">Mo ta</label>
                <textarea className="form-control" id="vocabularyDescription" name="description" rows="3" value={vocabularyForm.description} onChange={updateVocabularyField} />
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="vocabularyPrice">Gia ban</label>
                  <input className="form-control" id="vocabularyPrice" name="price" type="number" min="0" value={vocabularyForm.price} onChange={updateVocabularyField} required />
                  <small className="text-primary fw-semibold">{formatVnd(vocabularyForm.price)}</small>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="accessType">Quyen truy cap</label>
                  <select className="form-select" id="accessType" name="accessType" value={vocabularyForm.accessType} onChange={updateVocabularyField}>
                    {accessTypeOptions.map((option) => (
                      <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="upload-zone">
                <label htmlFor="thumbnail">
                  <i className="bi bi-image" aria-hidden="true" />
                  <span>Ảnh Thumbnail</span>
                  <input id="thumbnail" name="thumbnail" type="file" accept="image/*" onChange={updateVocabularyField} />
                  {vocabularyForm.thumbnailUrl && !vocabularyForm.thumbnail && (
                    <small className="current-file">Hien co: {getFileNameFromUrl(vocabularyForm.thumbnailUrl)}</small>
                  )}
                  {vocabularyForm.thumbnail && (
                    <small className="current-file">Moi: {vocabularyForm.thumbnail.name}</small>
                  )}
                </label>
              </div>

              <div className="vocabulary-word-list">
                <div className="panel-heading compact-heading">
                  <div>
                    <h2>Danh sách từ chi tiết</h2>
                  </div>
                </div>

                {vocabularyForm.words.map((word, index) => (
                  <div className="word-editor" key={`${index}-${word.audioUrl}`}>
                    <div className="word-editor-header">
                      <strong>Từ #{index + 1}</strong>
                      <button className="icon-action danger" type="button" onClick={() => removeVocabularyWord(index)} title="Xoa tu">
                        <i className="bi bi-x-lg" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="row g-2">
                      <div className="col-12 col-md-6">
                        <input className="form-control" placeholder="Tu" value={word.term} onChange={(event) => updateVocabularyWord(index, "term", event.target.value)} required />
                      </div>
                      <div className="col-12 col-md-6">
                        <input className="form-control" placeholder="Phien am" value={word.phonetic} onChange={(event) => updateVocabularyWord(index, "phonetic", event.target.value)} />
                      </div>
                      <div className="col-12 col-md-6">
                        <input className="form-control" placeholder="Loai tu" value={word.partOfSpeech} onChange={(event) => updateVocabularyWord(index, "partOfSpeech", event.target.value)} />
                      </div>
                      <div className="col-12 col-md-6">
                        <input className="form-control" placeholder="Nghia" value={word.meaning} onChange={(event) => updateVocabularyWord(index, "meaning", event.target.value)} required />
                      </div>
                      <div className="col-12">
                        <textarea className="form-control" placeholder="Vi du" rows="2" value={word.example} onChange={(event) => updateVocabularyWord(index, "example", event.target.value)} />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Audio phát âm</label>
                        <input className="form-control" type="file" accept="audio/mpeg,audio/mp3,audio/*" onChange={(event) => updateVocabularyWordAudio(index, event.target.files?.[0])} />
                        {(word.audioUrl || word.audioFile) && (
                          <small className="current-file">
                            {word.audioFile ? `Mới: ${word.audioFile.name}` : `Hiện có: ${getFileNameFromUrl(word.audioUrl)}`}
                          </small>
                        )}
                      </div>
                      <div className="col-12">
                        <label className="form-label">Ảnh minh họa</label>
                        <input className="form-control" type="file" accept="image/*" onChange={(event) => updateVocabularyWordImage(index, event.target.files?.[0])} />
                        {(word.imageUrl || word.imageFile) && (
                          <small className="current-file">
                            {word.imageFile ? `Ảnh mới: ${word.imageFile.name}` : `Ảnh hiện có: ${getFileNameFromUrl(word.imageUrl)}`}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button className="btn btn-outline-primary vocabulary-add-button" type="button" onClick={addVocabularyWord}>
                  <i className="bi bi-plus-lg" aria-hidden="true" />
                  Thêm từ
                </button>
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={vocabularyLoading}>
                  {vocabularyLoading ? "Dang luu..." : "Luu bo tu vung"}
                </button>
                {vocabularyEditingId && (
                  <button className="btn btn-outline-secondary" type="button" onClick={resetVocabularyForm}>
                    Huy
                  </button>
                )}
              </div>
            </form>

            <section className="admin-panel exam-list-panel">
              <div className="panel-heading">
                <div>
                  <h2>Danh sach bo tu vung</h2>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle admin-table">
                  <thead>
                    <tr>
                      <th>Ten bo</th>
                      <th>Quyen</th>
                      <th>Gia</th>
                      <th>So tu</th>
                      <th>Trang thai</th>
                      <th className="text-end">Thao tac</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVocabularySets.map((set) => (
                      <tr key={set._id}>
                        <td>
                          <strong>{set.name}</strong>
                          <small className="table-subtext">{set.description || "Chua co mo ta"}</small>
                        </td>
                        <td><span className="soft-badge">{accessTypeOptions.find((option) => option.value === set.accessType)?.label || set.accessType}</span></td>
                        <td>{formatVnd(set.price)}</td>
                        <td>{set.words?.length || 0}</td>
                        <td>{set.isHidden ? <span className="status-badge hidden">Da an</span> : <span className="status-badge">Hien thi</span>}</td>
                        <td className="text-end">
                          <button className="icon-action" type="button" onClick={() => editVocabularySet(set)} title="Chinh sua">
                            <i className="bi bi-pencil-square" aria-hidden="true" />
                          </button>
                          <button className="icon-action danger" type="button" onClick={() => removeVocabularySet(set._id)} title="Xoa mem">
                            <i className="bi bi-trash" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!visibleVocabularySets.length && (
                      <tr>
                        <td className="text-center text-secondary py-4" colSpan="6">Chua co bo tu vung.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {vocabularyTotalPages > 1 && (
                <div className="pagination-controls">
                  <button 
                    className="btn btn-sm btn-outline-secondary" 
                    onClick={() => setVocabularyPage(p => Math.max(1, p - 1))}
                    disabled={vocabularyPage === 1}
                  >
                    Trước
                  </button>
                  <span className="pagination-info">Trang {vocabularyPage} / {vocabularyTotalPages}</span>
                  <button 
                    className="btn btn-sm btn-outline-secondary" 
                    onClick={() => setVocabularyPage(p => Math.min(vocabularyTotalPages, p + 1))}
                    disabled={vocabularyPage === vocabularyTotalPages}
                  >
                    Sau
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {activeView === "coupons" && (
          <div className="exam-management-grid">
            <form className="admin-panel exam-form" key={couponFormResetKey} onSubmit={submitCoupon}>
              <div className="panel-heading">
                <div>
                  <h2>{couponEditingId ? "Chinh sua ma giam gia" : "Them ma giam gia"}</h2>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="couponCode">Ten ma (Code)</label>
                <input className="form-control text-uppercase" id="couponCode" name="code" value={couponForm.code} onChange={updateCouponField} required />
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="discountType">Loai giam</label>
                  <select className="form-select" id="discountType" name="discountType" value={couponForm.discountType} onChange={updateCouponField}>
                    {couponTypeOptions.map((option) => (
                      <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="scope">Pham vi ap dung</label>
                  <select className="form-select" id="scope" name="scope" value={couponForm.scope} onChange={updateCouponField}>
                    {couponScopeOptions.map((option) => (
                      <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="discountPercent">Giam (%)</label>
                  <input className="form-control" id="discountPercent" name="discountPercent" type="number" min="0" max="100" value={couponForm.discountPercent} onChange={updateCouponField} disabled={couponForm.discountType !== "percent"} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="fixedAmount">So tien co dinh</label>
                  <input className="form-control" id="fixedAmount" name="fixedAmount" type="number" min="0" value={couponForm.fixedAmount} onChange={updateCouponField} disabled={couponForm.discountType !== "fixed"} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="minimumOrderValue">Gia tri don hang toi thieu</label>
                  <input className="form-control" id="minimumOrderValue" name="minimumOrderValue" type="number" min="0" value={couponForm.minimumOrderValue} onChange={updateCouponField} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="maxUses">So luot su dung toi da</label>
                  <input className="form-control" id="maxUses" name="maxUses" type="number" min="0" value={couponForm.maxUses} onChange={updateCouponField} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="maxUsesPerUser">Gioi han/User</label>
                  <input className="form-control" id="maxUsesPerUser" name="maxUsesPerUser" type="number" min="0" value={couponForm.maxUsesPerUser} onChange={updateCouponField} />
                </div>
                <div className="col-12 col-md-6 coupon-toggle">
                  <label className="form-check">
                    <input className="form-check-input" name="isActive" type="checkbox" checked={couponForm.isActive} onChange={updateCouponField} />
                    <span className="form-check-label">Dang kich hoat</span>
                  </label>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="startDate">Ngay bat dau</label>
                  <input className="form-control" id="startDate" name="startDate" type="date" value={couponForm.startDate} onChange={updateCouponField} required />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="endDate">Ngay ket thuc</label>
                  <input className="form-control" id="endDate" name="endDate" type="date" value={couponForm.endDate} onChange={updateCouponField} required />
                </div>
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={couponLoading}>
                  {couponLoading ? "Dang luu..." : "Luu ma giam gia"}
                </button>
                {couponEditingId && (
                  <button className="btn btn-outline-secondary" type="button" onClick={resetCouponForm}>
                    Huy
                  </button>
                )}
              </div>
            </form>

            <section className="admin-panel exam-list-panel">
              <div className="panel-heading">
                <div>
                  <h2>Danh sach ma giam gia</h2>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle admin-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Gia tri</th>
                      <th>Don toi thieu</th>
                      <th>Gioi han</th>
                      <th>Pham vi</th>
                      <th>Trang thai</th>
                      <th className="text-end">Thao tac</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCoupons.map((coupon) => (
                      <tr key={coupon._id}>
                        <td><strong>{coupon.code}</strong></td>
                        <td>{coupon.discountType === "percent" ? `${coupon.discountPercent}%` : formatVnd(coupon.fixedAmount)}</td>
                        <td>{formatVnd(coupon.minimumOrderValue)}</td>
                        <td>{coupon.maxUses || "Khong gioi han"} / {coupon.maxUsesPerUser || "Khong gioi han"} user</td>
                        <td><span className="soft-badge">{couponScopeOptions.find((option) => option.value === coupon.scope)?.label || coupon.scope}</span></td>
                        <td>
                          {coupon.isHidden ? (
                            <span className="status-badge hidden">Da an</span>
                          ) : new Date(coupon.endDate) < new Date() ? (
                            <span className="status-badge expired">Het han</span>
                          ) : (
                            <span className={`status-badge${coupon.isActive ? "" : " hidden"}`}>
                              {coupon.isActive ? "Dang bat" : "Dang tat"}
                            </span>
                          )}
                        </td>
                        <td className="text-end">
                          <button className="icon-action" type="button" onClick={() => editCoupon(coupon)} title="Chinh sua">
                            <i className="bi bi-pencil-square" aria-hidden="true" />
                          </button>
                          <button className="icon-action danger" type="button" onClick={() => removeCoupon(coupon._id)} title="Xoa mem">
                            <i className="bi bi-trash" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!visibleCoupons.length && (
                      <tr>
                        <td className="text-center text-secondary py-4" colSpan="7">Chua co ma giam gia.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;
