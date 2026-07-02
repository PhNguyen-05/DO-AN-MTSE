import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout as reduxLogout } from "../redux/authSlice";
import apiInstance from "../utils/axiosInstance";
import AdminProfile from "./AdminProfile";

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
  removeExistingAudios: false,
  partAudio1: null,
  partAudio2: null,
  partAudio3: null,
  partAudio4: null,
  existingPartAudioUrls: { part1: "", part2: "", part3: "", part4: "" }
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
  explanation: "",
  imageFile: null,
  imageUrl: "",
  removeImage: false
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

const createEmptyBlogForm = () => ({
  title: "",
  content: "",
  excerpt: "",
  category: "blog",
  tags: "",
  thumbnail: null,
  hasExistingThumbnail: false,
  existingThumbnailUrl: ""
});

const createEmptyCommentForm = () => ({
  content: "",
  targetType: "blog_post",
  targetId: "",
  replyTo: ""
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
  if (view === "interaction") return "Thống kê tương tác";
  if (view === "blog") return "Quản lý bài viết";
  if (view === "comments") return "Kiểm duyệt bình luận";
  if (view === "users") return "Quản lý user";
  if (view === "profile") return "Hồ sơ cá nhân";
  return "Dashboard";
};

const getViewTitle = (view) => {
  if (view === "exams") return "Quản lý Đề thi TOEIC";
  if (view === "questions") return "Quản lý Ngân hàng câu hỏi";
  if (view === "vocabulary") return "Quản lý Bộ từ vựng";
  if (view === "coupons") return "Quản lý Mã giảm giá";
  if (view === "interaction") return "Thống kê Tương tác";
  if (view === "blog") return "Quản lý Bài viết (Blog, Tin tức)";
  if (view === "comments") return "Kiểm duyệt Bình luận";
  if (view === "users") return "Quản lý Tài khoản Người dùng";
  if (view === "profile") return "Hồ sơ & Cài đặt tài khoản";
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
  const dispatch = useDispatch();
  const { user: reduxUser } = useSelector((s) => s.auth);
  // Normalize role to lowercase for legacy comparison in this component
  const user = {
    ...(reduxUser || {}),
    role: (reduxUser?.role || '').toLowerCase(),
    email: reduxUser?.email || '',
    name: reduxUser?.name || ''
  };
  const isAdmin = user.role === 'admin';
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
  const [interactionStats, setInteractionStats] = useState(null);
  const [interactionLoading, setInteractionLoading] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [revenueYear, setRevenueYear] = useState(new Date().getFullYear());
  const [hoveredRevenue, setHoveredRevenue] = useState(null);
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogForm, setBlogForm] = useState(createEmptyBlogForm);
  const [blogEditingId, setBlogEditingId] = useState(null);
  const [blogFormResetKey, setBlogFormResetKey] = useState(0);
  const [blogLoading, setBlogLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentForm, setCommentForm] = useState(createEmptyCommentForm);
  const [commentEditingId, setCommentEditingId] = useState(null);
  const [commentFormResetKey, setCommentFormResetKey] = useState(0);
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [commentTab, setCommentTab] = useState("comments"); // 'comments' | 'reviews'

  // Search and filter states
  const [examSearchTerm, setExamSearchTerm] = useState("");
  const [examStatusFilter, setExamStatusFilter] = useState("all");
  const [vocabularySearchTerm, setVocabularySearchTerm] = useState("");
  const [vocabularyStatusFilter, setVocabularyStatusFilter] = useState("all");
  const [couponSearchTerm, setCouponSearchTerm] = useState("");
  const [couponStatusFilter, setCouponStatusFilter] = useState("all");
  const [blogSearchTerm, setBlogSearchTerm] = useState("");
  const [blogStatusFilter, setBlogStatusFilter] = useState("all");
  const [commentSearchTerm, setCommentSearchTerm] = useState("");
  const [commentStatusFilter, setCommentStatusFilter] = useState("all");
  const [reviewSearchTerm, setReviewSearchTerm] = useState("");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("all");
  const [reviewPage, setReviewPage] = useState(1);

  // User management states
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userTotalItems, setUserTotalItems] = useState(0);
  const [userLoading, setUserLoading] = useState(false);

  // Pagination states
  const [examPage, setExamPage] = useState(1);
  const [questionPage, setQuestionPage] = useState(1);
  const [vocabularyPage, setVocabularyPage] = useState(1);
  const [blogPage, setBlogPage] = useState(1);
  const [commentPage, setCommentPage] = useState(1);
  const itemsPerPage = 10;

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  const maxRevenue = useMemo(() => {
    const values = (stats?.monthlyRevenue || []).map((item) => Number(item.total) || 0);
    return Math.max(...values, 1);
  }, [stats]);
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


  // Filtered data
  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const matchesSearch = exam.name.toLowerCase().includes(examSearchTerm.toLowerCase()) ||
                          exam.releaseYear?.toString().includes(examSearchTerm);
      const matchesStatus = examStatusFilter === "all" ||
                          (examStatusFilter === "visible" && !exam.isHidden) ||
                          (examStatusFilter === "hidden" && exam.isHidden);
      return matchesSearch && matchesStatus;
    });
  }, [exams, examSearchTerm, examStatusFilter]);

  const filteredVocabularySets = useMemo(() => {
    return vocabularySets.filter(set => {
      const matchesSearch = set.name.toLowerCase().includes(vocabularySearchTerm.toLowerCase()) ||
                          set.description?.toLowerCase().includes(vocabularySearchTerm.toLowerCase());
      const matchesStatus = vocabularyStatusFilter === "all" ||
                          (vocabularyStatusFilter === "visible" && !set.isHidden) ||
                          (vocabularyStatusFilter === "hidden" && set.isHidden);
      return matchesSearch && matchesStatus;
    });
  }, [vocabularySets, vocabularySearchTerm, vocabularyStatusFilter]);

  const filteredCoupons = useMemo(() => {
    return coupons.filter(coupon => {
      const matchesSearch = coupon.code.toLowerCase().includes(couponSearchTerm.toLowerCase());
      const matchesStatus = couponStatusFilter === "all" ||
                          (couponStatusFilter === "active" && coupon.isActive && !coupon.isHidden && new Date(coupon.endDate) >= new Date()) ||
                          (couponStatusFilter === "inactive" && !coupon.isActive) ||
                          (couponStatusFilter === "expired" && new Date(coupon.endDate) < new Date()) ||
                          (couponStatusFilter === "hidden" && coupon.isHidden);
      return matchesSearch && matchesStatus;
    });
  }, [coupons, couponSearchTerm, couponStatusFilter]);

  const filteredBlogPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(blogSearchTerm.toLowerCase()) ||
                          post.author?.name?.toLowerCase().includes(blogSearchTerm.toLowerCase());
      const matchesStatus = blogStatusFilter === "all" ||
                          (blogStatusFilter === "draft" && post.status === "DRAFT") ||
                          (blogStatusFilter === "pending" && post.status === "PENDING") ||
                          (blogStatusFilter === "approved" && post.status === "APPROVED") ||
                          (blogStatusFilter === "hidden" && post.status === "HIDDEN");
      return matchesSearch && matchesStatus;
    });
  }, [blogPosts, blogSearchTerm, blogStatusFilter]);

  const filteredComments = useMemo(() => {
    return comments.filter(comment => {
      const matchesSearch = comment.content.toLowerCase().includes(commentSearchTerm.toLowerCase()) ||
                          comment.author?.name?.toLowerCase().includes(commentSearchTerm.toLowerCase());
      const matchesStatus = commentStatusFilter === "all" ||
                          (commentStatusFilter === "visible" && comment.status === "VISIBLE") ||
                          (commentStatusFilter === "hidden" && comment.status === "HIDDEN");
      return matchesSearch && matchesStatus;
    });
  }, [comments, commentSearchTerm, commentStatusFilter]);

  const visibleVocabularySets = useMemo(() => filteredVocabularySets, [filteredVocabularySets]);
  const visibleCoupons = useMemo(() => filteredCoupons, [filteredCoupons]);

  // Pagination logic
  const paginatedExams = useMemo(() => {
    const start = (examPage - 1) * itemsPerPage;
    return filteredExams.slice(start, start + itemsPerPage);
  }, [filteredExams, examPage]);

  const paginatedQuestions = useMemo(() => {
    const start = (questionPage - 1) * itemsPerPage;
    return questions.slice(start, start + itemsPerPage);
  }, [questions, questionPage]);

  const paginatedVocabularySets = useMemo(() => {
    const start = (vocabularyPage - 1) * itemsPerPage;
    return filteredVocabularySets.slice(start, start + itemsPerPage);
  }, [filteredVocabularySets, vocabularyPage]);

  const paginatedBlogPosts = useMemo(() => {
    const start = (blogPage - 1) * itemsPerPage;
    return filteredBlogPosts.slice(start, start + itemsPerPage);
  }, [filteredBlogPosts, blogPage]);

  const paginatedComments = useMemo(() => {
    const start = (commentPage - 1) * itemsPerPage;
    return filteredComments.slice(start, start + itemsPerPage);
  }, [filteredComments, commentPage]);

  const examTotalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const questionTotalPages = Math.ceil(questions.length / itemsPerPage);
  const vocabularyTotalPages = Math.ceil(filteredVocabularySets.length / itemsPerPage);
  const blogTotalPages = Math.ceil(filteredBlogPosts.length / itemsPerPage);
  const commentTotalPages = Math.ceil(filteredComments.length / itemsPerPage);

  const filteredProductReviews = useMemo(() => {
    return productReviews.filter(review => {
      const matchesSearch = review.content?.toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
                          review.userId?.name?.toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
                          review.userId?.email?.toLowerCase().includes(reviewSearchTerm.toLowerCase());
      const matchesStatus = reviewStatusFilter === "all" ||
                          (reviewStatusFilter === "visible" && review.status === "VISIBLE") ||
                          (reviewStatusFilter === "hidden" && review.status === "HIDDEN");
      return matchesSearch && matchesStatus;
    });
  }, [productReviews, reviewSearchTerm, reviewStatusFilter]);

  const paginatedProductReviews = useMemo(() => {
    const start = (reviewPage - 1) * itemsPerPage;
    return filteredProductReviews.slice(start, start + itemsPerPage);
  }, [filteredProductReviews, reviewPage]);

  const reviewTotalPages = Math.ceil(filteredProductReviews.length / itemsPerPage);


  const logout = () => {
    dispatch(reduxLogout());

    navigate("/login", { replace: true });
  };

  const loadAdminData = async () => {

    const [statsResponse, examsResponse, vocabularyResponse, couponResponse, blogResponse] = await Promise.all([
      apiInstance.get(`/admin/dashboard?year=${revenueYear}`, { headers: authHeaders }),
      apiInstance.get("/admin/exams?includeHidden=true", { headers: authHeaders }),
      apiInstance.get("/admin/vocabulary-sets?includeHidden=true", { headers: authHeaders }),
      apiInstance.get("/admin/coupons?includeHidden=true", { headers: authHeaders }),
      apiInstance.get("/admin/blog-posts?includeHidden=true", { headers: authHeaders })

    ]);

    setStats(statsResponse.data);
    setExams(examsResponse.data);

    setVocabularySets(vocabularyResponse.data);
    setCoupons(couponResponse.data);
    setBlogPosts(blogResponse.data);
  };

  const loadInteractionStats = async () => {
    setInteractionLoading(true);
    try {
      const params = {};
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;

      const response = await apiInstance.get("/admin/interaction-stats", { 
        headers: authHeaders,
        params 
      });
      setInteractionStats(response.data);
    } catch (error) {
      setNotice({ type: "danger", message: "Could not load interaction statistics." });
    } finally {
      setInteractionLoading(false);
    }

  };

  const loadQuestions = async (examId = selectedExamId) => {
    if (!examId) {
      setQuestions([]);
      return;
    }

    const response = await apiInstance.get(`/admin/exams/${examId}/questions`, { headers: authHeaders });
    setQuestions(response.data);
    return response.data;
  };

  useEffect(() => {
    loadAdminData().catch(() => {
      setNotice({ type: "danger", message: "Could not load admin data." });
    });
  }, [revenueYear]);

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
    if (activeView === "interaction") {
      loadInteractionStats();
    }
  }, [activeView, filterStartDate, filterEndDate]);

  const loadComments = async () => {
    try {
      const response = await apiInstance.get("/admin/comments?includeHidden=true", { headers: authHeaders });
      setComments(response.data);
    } catch (error) {
      setNotice({ type: "danger", message: "Could not load comments." });
    }
  };

  const loadProductReviews = async () => {
    try {
      setReviewLoading(true);
      const response = await apiInstance.get("/admin/product-reviews", { headers: authHeaders });
      setProductReviews(response.data);
    } catch (error) {
      setNotice({ type: "danger", message: "Không thể tải đánh giá sao." });
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === "comments") {
      loadComments();
      loadProductReviews();
    }
  }, [activeView]);


  useEffect(() => {
    if (activeView === "users" && !isAdmin) {
      setActiveView("dashboard");
    }
  }, [activeView, isAdmin]);

  useEffect(() => {
    if (activeView === "users" && isAdmin) {
      loadUsers(userPage);
    }
  }, [activeView, userPage, isAdmin]);

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
    setBlogPage(1);
    setCommentPage(1);
    setUserPage(1);
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

    if (["partAudio1", "partAudio2", "partAudio3", "partAudio4"].includes(name)) {
      setForm((current) => ({ ...current, [name]: files[0] || null }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateQuestionField = (event) => {
    const { name, value, files } = event.target;
    if (name === "questionImage") {
      setQuestionForm((current) => ({ ...current, imageFile: files[0] || null, removeImage: false }));
      return;
    }
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

  const resetBlogForm = () => {
    setBlogForm(createEmptyBlogForm());
    setBlogEditingId(null);
    setBlogFormResetKey((current) => current + 1);
  };

  const resetCommentForm = () => {
    setCommentForm(createEmptyCommentForm());
    setCommentEditingId(null);
    setCommentFormResetKey((current) => current + 1);
    setReplyingTo(null);
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

    // Append per-part audio files for Listening
    ["partAudio1", "partAudio2", "partAudio3", "partAudio4"].forEach((key) => {
      if (form[key]) formData.append(key, form[key]);
    });

    try {
      let response;

      if (editingId) {
        response = await apiInstance.put(`/admin/exams/${editingId}`, formData, { headers: authHeaders });
      } else {
        response = await apiInstance.post("/admin/exams", formData, { headers: authHeaders });
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
      removeExistingAudios: false,
      partAudio1: null,
      partAudio2: null,
      partAudio3: null,
      partAudio4: null,
      existingPartAudioUrls: {
        part1: exam.partAudioUrls?.part1 || "",
        part2: exam.partAudioUrls?.part2 || "",
        part3: exam.partAudioUrls?.part3 || "",
        part4: exam.partAudioUrls?.part4 || ""
      }
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
      const response = await apiInstance.delete(`/admin/exams/${examId}`, { headers: authHeaders });
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

    const partNum = Number(questionForm.part);
    const questionNumber = Number(questionForm.questionNumber);

    if (partNum < 1 || partNum > 7 || questionNumber < 1 || questionNumber > 200) {
      setNotice({ type: "danger", message: "Part phai tu 1-7 va thu tu cau phai tu 1-200." });
      return;
    }

    const requiredAnswerFields = getRequiredAnswerKeys(partNum).map((key) => `answer${key}`);
    if (!requiredAnswerFields.every((key) => (questionForm[key] || "").trim())) {
      setNotice({
        type: "danger",
        message: partNum === 2
          ? "Vui long nhap day du dap an A, B va C."
          : "Vui long nhap day du dap an A, B, C va D."
      });
      return;
    }

    setQuestionLoading(true);

    try {
      // Use FormData to support image upload
      const formData = new FormData();
      formData.append("part", partNum);
      formData.append("questionNumber", questionNumber);
      formData.append("readingPassage", questionForm.readingPassage || "");
      formData.append("answerA", questionForm.answerA || "");
      formData.append("answerB", questionForm.answerB || "");
      formData.append("answerC", questionForm.answerC || "");
      formData.append("answerD", questionForm.answerD || "");
      formData.append("correctAnswer", questionForm.correctAnswer);
      formData.append("explanation", questionForm.explanation || "");

      if (questionForm.imageFile) {
        // New image file uploaded
        formData.append("questionImage", questionForm.imageFile);
      } else if (questionForm.removeImage) {
        formData.append("removeImage", "true");
      } else if (questionForm.imageUrl) {
        // Keep existing image
        formData.append("imageUrl", questionForm.imageUrl);
      }

      if (questionEditingId) {
        await apiInstance.put(`/admin/questions/${questionEditingId}`, formData, { headers: authHeaders });
      } else {
        await apiInstance.post(`/admin/exams/${selectedExamId}/questions`, formData, { headers: authHeaders });
      }

      const response = await apiInstance.get(`/admin/exams/${selectedExamId}/questions`, { headers: authHeaders });
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
      const response = await apiInstance.post(`/admin/exams/${selectedExamId}/questions/import-pdf`, {}, { headers: authHeaders });
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
      explanation: question.explanation || "",
      imageFile: null,
      imageUrl: question.imageUrl || "",
      removeImage: false
    });
    setQuestionFormResetKey((current) => current + 1);
  };

  const removeQuestion = async (questionId) => {
    if (!window.confirm("Delete this question?")) {
      return;
    }

    try {
      await apiInstance.delete(`/admin/questions/${questionId}`, { headers: authHeaders });
      const response = await apiInstance.get(`/admin/exams/${selectedExamId}/questions`, { headers: authHeaders });
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
        await apiInstance.put(`/admin/vocabulary-sets/${vocabularyEditingId}`, formData, { headers: authHeaders });
      } else {
        await apiInstance.post("/admin/vocabulary-sets", formData, { headers: authHeaders });
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
      const response = await apiInstance.delete(`/admin/vocabulary-sets/${setId}`, { headers: authHeaders });
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
        await apiInstance.put(`/admin/coupons/${couponEditingId}`, payload, { headers: authHeaders });
      } else {
        await apiInstance.post("/admin/coupons", payload, { headers: authHeaders });
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
      const response = await apiInstance.delete(`/admin/coupons/${couponId}`, { headers: authHeaders });
      await loadAdminData();
      setNotice({ type: "info", message: response.data.message });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not delete coupon." });
    }
  };

  const submitBlogPost = async (event, submitForApproval = false) => {
    event.preventDefault();
    setNotice(null);

    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      setNotice({ type: "danger", message: "Vui lòng nhập tiêu đề và nội dung bài viết." });
      return;
    }

    setBlogLoading(true);

    const formData = new FormData();
    formData.append("title", blogForm.title);
    formData.append("content", blogForm.content);
    formData.append("excerpt", blogForm.excerpt || blogForm.content.substring(0, 200));
    formData.append("category", blogForm.category);
    formData.append("tags", blogForm.tags);
    formData.append("submitForApproval", submitForApproval ? "true" : "false");

    if (blogForm.thumbnail) {
      formData.append("thumbnail", blogForm.thumbnail);
    }

    try {
      // Axios sẽ tự động set Content-Type với boundary đúng cho FormData
      const formDataHeaders = { ...authHeaders };
      // Xóa Content-Type nếu có để Axios tự động set
      delete formDataHeaders['Content-Type'];
      
      if (blogEditingId) {
        await apiInstance.put(`/admin/blog-posts/${blogEditingId}`, formData, { headers: formDataHeaders });
      } else {
        await apiInstance.post("/admin/blog-posts", formData, { headers: formDataHeaders });
      }

      await loadAdminData();
      resetBlogForm();
      setNotice({ type: "success", message: submitForApproval ? "Bài viết đã gửi duyệt." : "Bài viết đã lưu nháp." });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not save blog post." });
    } finally {
      setBlogLoading(false);
    }
  };

  const approveBlogPost = async (postId) => {
    try {
      await apiInstance.put(`/admin/blog-posts/${postId}/approve`, {}, { headers: authHeaders });
      await loadAdminData();
      setNotice({ type: "success", message: "Bài viết đã được phê duyệt và xuất bản." });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not approve blog post." });
    }
  };

  const loadUsers = async (page = userPage, roleOverride = userRoleFilter, statusOverride = userStatusFilter) => {
    setUserLoading(true);
    try {
      const response = await apiInstance.get("/admin/users", {
        headers: authHeaders,
        params: {
          search: userSearchTerm,
          role: roleOverride,
          status: statusOverride,
          page: page,
          limit: itemsPerPage
        }
      });
      setUsers(response.data.data);
      setUserTotalPages(response.data.pagination.pages);
      setUserTotalItems(response.data.pagination.total);
      setUserPage(response.data.pagination.page);
    } catch (error) {
      setNotice({ type: "danger", message: "Could not load users." });
    } finally {
      setUserLoading(false);
    }
  };

  const handleUserSearchSubmit = (e) => {
    e.preventDefault();
    setUserPage(1);
    loadUsers(1);
  };

  const changeUserRole = async (userId, newRole) => {
    if (!window.confirm("Bạn có chắc muốn thay đổi quyền của người dùng này?")) return;
    try {
      await apiInstance.patch(`/admin/users/${userId}/role`, { newRole }, { headers: authHeaders });
      setNotice({ type: "success", message: "Cập nhật quyền thành công." });
      loadUsers();
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Lỗi cập nhật quyền." });
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const action = currentStatus === "Bị khóa" ? "mở khóa" : "khóa";
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;
    try {
      const res = await apiInstance.patch(`/admin/users/${userId}/status`, {}, { headers: authHeaders });
      setNotice({ type: "success", message: res.data.message || `Tài khoản đã được ${action}.` });
      loadUsers();
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Lỗi thay đổi trạng thái." });
    }
  };

  const editBlogPost = (post) => {
    setBlogEditingId(post._id);
    setBlogForm({
      title: post.title || "",
      content: post.content || "",
      excerpt: post.excerpt || "",
      category: post.category || "blog",
      tags: (post.tags || []).join(", "),
      thumbnail: null,
      hasExistingThumbnail: Boolean(post.thumbnailUrl),
      existingThumbnailUrl: post.thumbnailUrl || ""
    });
    setBlogFormResetKey((current) => current + 1);
  };

  const removeBlogPost = async (postId) => {
    if (!window.confirm("Ẩn bài viết này?")) {
      return;
    }

    try {
      const response = await apiInstance.delete(`/admin/blog-posts/${postId}`, { headers: authHeaders });
      await loadAdminData();
      setNotice({ type: "info", message: response.data.message });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not delete blog post." });
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    setNotice(null);

    if (!commentForm.content.trim() || !commentForm.targetId) {
      setNotice({ type: "danger", message: "Vui lòng nhập nội dung bình luận." });
      return;
    }

    setCommentLoading(true);

    try {
      const payload = {
        content: commentForm.content,
        targetType: commentForm.targetType,
        targetId: commentForm.targetId,
        replyTo: replyingTo || null
      };

      await apiInstance.post("/admin/comments", payload, { headers: authHeaders });
      await loadComments();
      resetCommentForm();
      setNotice({ type: "success", message: "Bình luận đã được gửi." });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not submit comment." });
    } finally {
      setCommentLoading(false);
    }
  };

  const hideComment = async (commentId) => {
    try {
      await apiInstance.put(`/admin/comments/${commentId}/hide`, {}, { headers: authHeaders });
      await loadComments();
      setNotice({ type: "info", message: "Bình luận đã bị ẩn." });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not hide comment." });
    }
  };

  const showComment = async (commentId) => {
    try {
      await apiInstance.put(`/admin/comments/${commentId}/show`, {}, { headers: authHeaders });
      await loadComments();
      setNotice({ type: "info", message: "Bình luận đã được hiển thị lại." });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not show comment." });
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Xóa vĩnh viễn bình luận này?")) {
      return;
    }

    try {
      await apiInstance.delete(`/admin/comments/${commentId}`, { headers: authHeaders });
      await loadComments();
      setNotice({ type: "info", message: "Bình luận đã được xóa." });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Could not delete comment." });
    }
  };

  const startReply = (comment) => {
    setReplyingTo(comment._id);
    setCommentForm({
      ...commentForm,
      targetType: comment.targetType,
      targetId: comment.targetId
    });
  };


  const hideProductReview = async (reviewId) => {
    try {
      await apiInstance.put(`/admin/product-reviews/${reviewId}/hide`, {}, { headers: authHeaders });
      await loadProductReviews();
      setNotice({ type: "info", message: "Đánh giá đã bị ẩn." });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Không thể ẩn đánh giá." });
    }
  };

  const showProductReview = async (reviewId) => {
    try {
      await apiInstance.put(`/admin/product-reviews/${reviewId}/show`, {}, { headers: authHeaders });
      await loadProductReviews();
      setNotice({ type: "info", message: "Đánh giá đã được hiển thị lại." });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Không thể hiển thị đánh giá." });
    }
  };

  const deleteProductReview = async (reviewId) => {
    if (!window.confirm("Xóa vĩnh viễn đánh giá này?")) return;
    try {
      await apiInstance.delete(`/admin/product-reviews/${reviewId}`, { headers: authHeaders });
      await loadProductReviews();
      setNotice({ type: "info", message: "Đánh giá đã được xóa." });
    } catch (error) {
      setNotice({ type: "danger", message: error.response?.data?.message || "Không thể xóa đánh giá." });
    }
  };

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="brand-mark">T</span>
          <div>
            <strong>TOEIC {user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Manager' : 'Staff'}</strong>
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
          <button className={activeView === "blog" ? "active" : ""} type="button" onClick={() => changeView("blog")}>
            <i className="bi bi-file-earmark-text" aria-hidden="true" />
            Quản lý bài viết
          </button>
          <button className={activeView === "comments" ? "active" : ""} type="button" onClick={() => changeView("comments")}>
            <i className="bi bi-chat-dots" aria-hidden="true" />
            Kiểm duyệt bình luận
          </button>
          <button className={activeView === "interaction" ? "active" : ""} type="button" onClick={() => changeView("interaction")}>
            <i className="bi bi-graph-up" aria-hidden="true" />
            Thống kê tương tác
          </button>
          {isAdmin && (
            <button className={activeView === "users" ? "active" : ""} type="button" onClick={() => changeView("users")}>
              <i className="bi bi-people" aria-hidden="true" />
              Quản lý User
            </button>
          )}
          <button className={activeView === "profile" ? "active" : ""} type="button" onClick={() => changeView("profile")}>
            <i className="bi bi-person-circle" aria-hidden="true" />
            Hồ sơ
          </button>
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

            <section className="metric-card">
              <div className="metric-icon"><i className="bi bi-journal-text" aria-hidden="true" /></div>
              <span>Tổng số Bài viết</span>
              <strong>{stats?.totalBlogPosts ?? 0}</strong>
              <small>Bài viết Blog, Tin tức</small>
            </section>

            <section className="metric-card">
              <div className="metric-icon"><i className="bi bi-collection" aria-hidden="true" /></div>
              <span>Tổng số Bộ từ vựng</span>
              <strong>{stats?.totalVocabularySets ?? 0}</strong>
              <small>Bộ từ vựng đang hiển thị</small>
            </section>

            <section className="metric-card">
              <div className="metric-icon"><i className="bi bi-ticket-perforated" aria-hidden="true" /></div>
              <span>Tổng số Mã giảm giá</span>
              <strong>{stats?.totalCoupons ?? 0}</strong>
              <small>Mã giảm giá đang hoạt động</small>
            </section>

            <section className="metric-card">
              <div className="metric-icon"><i className="bi bi-chat-dots" aria-hidden="true" /></div>
              <span>Tổng số Bình luận</span>
              <strong>{stats?.totalComments ?? 0}</strong>
              <small>Bình luận từ học viên</small>
            </section>

            {isAdmin && (
              <section className="admin-panel revenue-panel" style={{ gridColumn: "span 3" }}>
                <div className="panel-heading">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h2>Doanh thu dòng tiền</h2>
                      <small className="text-muted">Tổng hợp từ thanh toán, mua đề thi và đơn hàng thành công</small>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <select 
                        className="form-select form-select-sm" 
                        style={{ width: "auto" }}
                        value={revenueYear}
                        onChange={(e) => setRevenueYear(parseInt(e.target.value))}
                      >
                        {[2024, 2025, 2026, 2027, 2028].map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <strong>{formatVnd(stats?.revenue)}</strong>
                    </div>
                  </div>
                </div>
                <div className="revenue-chart">
                  {(stats?.monthlyRevenue || []).map((item) => (
                    <div 
                      className="revenue-bar" 
                      key={item.month}
                      onMouseEnter={() => setHoveredRevenue(item)}
                      onMouseLeave={() => setHoveredRevenue(null)}
                    >
                      <span style={{ height: `${Math.max(10, (Number(item.total) / maxRevenue) * 100)}%` }} />
                      <small>{item.month.split('-')[1]}</small>
                      {hoveredRevenue?.month === item.month && (
                        <div className="revenue-tooltip">
                          <strong>{item.month}</strong>
                          <br />
                          {formatVnd(item.total)}
                        </div>
                      )}
                    </div>
                  ))}
                  {!(stats?.monthlyRevenue || []).some((item) => Number(item.total) > 0) && (
                    <p className="empty-chart">Chưa có dữ liệu doanh thu trong năm {revenueYear}.</p>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {activeView === "interaction" && (
          <div className="dashboard-grid">
            <section className="admin-panel">
              <div className="panel-heading">
                <div>
                  <h2>Bộ lọc thời gian</h2>
                </div>
              </div>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="filterStartDate">Từ ngày</label>
                  <input
                    className="form-control"
                    id="filterStartDate"
                    name="filterStartDate"
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="filterEndDate">Đến ngày</label>
                  <input
                    className="form-control"
                    id="filterEndDate"
                    name="filterEndDate"
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <small className="text-muted">
                    {!filterStartDate && !filterEndDate 
                      ? "Mặc định: 30 ngày gần nhất" 
                      : `Khoảng thời gian: ${filterStartDate || "từ đầu"} đến ${filterEndDate || "nay"}`}
                  </small>
                </div>
              </div>
            </section>

            {interactionLoading ? (
              <section className="admin-panel">
                <div className="panel-heading">
                  <h2>Đang tải dữ liệu...</h2>
                </div>
              </section>
            ) : interactionStats ? (
              <>
                <section className="metric-card primary">
                  <div className="metric-icon"><i className="bi bi-pencil-square" aria-hidden="true" /></div>
                  <span>Số lượt thi thử</span>
                  <strong>{interactionStats.examAttempts ?? 0}</strong>
                  <small>Tổng số lần làm đề thi</small>
                </section>

                <section className="metric-card">
                  <div className="metric-icon"><i className="bi bi-book" aria-hidden="true" /></div>
                  <span>Số lượt luyện tập</span>
                  <strong>{interactionStats.practiceAttempts ?? 0}</strong>
                  <small>Tổng số lần luyện tập</small>
                </section>

                <section className="metric-card">
                  <div className="metric-icon"><i className="bi bi-translate" aria-hidden="true" /></div>
                  <span>Số lượt học từ vựng</span>
                  <strong>{interactionStats.vocabularyStudyCount ?? 0}</strong>
                  <small>Tổng số từ vựng được học</small>
                </section>

                <section className="metric-card">
                  <div className="metric-icon"><i className="bi bi-people" aria-hidden="true" /></div>
                  <span>Số người dùng hoạt động</span>
                  <strong>{interactionStats.activeUsers ?? 0}</strong>
                  <small>Người dùng mới trong khoảng thời gian</small>
                </section>

                {interactionStats.mostActiveUser && (
                  <section className="admin-panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Người dùng hoạt động nhiều nhất</h2>
                      </div>
                    </div>
                    <div className="user-activity-card">
                      <div className="user-info">
                        <strong>{interactionStats.mostActiveUser.userName || "Unknown"}</strong>
                        <small>{interactionStats.mostActiveUser.userEmail || ""}</small>
                      </div>
                      <div className="activity-count">
                        <strong>{interactionStats.mostActiveUser.activityCount}</strong>
                        <small>lượt hoạt động</small>
                      </div>
                    </div>
                  </section>
                )}

                {!interactionStats.mostActiveUser && (
                  <section className="admin-panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Người dùng hoạt động nhiều nhất</h2>
                      </div>
                    </div>
                    <p className="empty-chart">Không có dữ liệu người dùng hoạt động.</p>
                  </section>
                )}
              </>
            ) : (
              <section className="admin-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Không có dữ liệu thống kê</h2>
                  </div>
                </div>
                <p>Không có dữ liệu trong khoảng thời gian đã chọn.</p>
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
                  <span>Tải file nghe tổng .mp3</span>
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

              {/* Audio từng Part Listening */}
              <div className="part-audio-section">
                <div className="part-audio-heading">
                  <i className="bi bi-headphones" aria-hidden="true" />
                  <span>Audio từng Part Listening</span>
                  <small>Upload file audio riêng cho từng Part 1 – 4</small>
                </div>
                <div className="part-audio-grid">
                  {[1, 2, 3, 4].map((partNum) => {
                    const fieldName = `partAudio${partNum}`;
                    const existingUrl = form.existingPartAudioUrls?.[`part${partNum}`] || "";
                    const newFile = form[fieldName];
                    return (
                      <label key={partNum} htmlFor={fieldName} className="part-audio-item">
                        <div className="part-audio-label">
                          <i className="bi bi-volume-up" aria-hidden="true" />
                          <span>Part {partNum}</span>
                        </div>
                        <input
                          id={fieldName}
                          name={fieldName}
                          type="file"
                          accept="audio/mpeg,audio/mp3,audio/*"
                          onChange={updateField}
                        />
                        {existingUrl && !newFile && (
                          <small className="current-file" title={existingUrl}>
                            <i className="bi bi-check-circle-fill text-success" /> {getFileNameFromUrl(existingUrl)}
                          </small>
                        )}
                        {newFile && (
                          <small className="current-file new-file">
                            <i className="bi bi-upload" /> {newFile.name}
                          </small>
                        )}
                        {!existingUrl && !newFile && (
                          <small className="current-file text-muted">Chưa có audio</small>
                        )}
                      </label>
                    );
                  })}
                </div>
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

              <div className="row mb-3 g-2">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Tìm kiếm theo tên hoặc năm..."
                    value={examSearchTerm}
                    onChange={(e) => {
                      setExamSearchTerm(e.target.value);
                      setExamPage(1);
                    }}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select form-select-sm"
                    value={examStatusFilter}
                    onChange={(e) => {
                      setExamStatusFilter(e.target.value);
                      setExamPage(1);
                    }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="visible">Hiển thị</option>
                    <option value="hidden">Đã ẩn</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={() => {
                      setExamSearchTerm("");
                      setExamStatusFilter("all");
                      setExamPage(1);
                    }}
                  >
                    <i className="bi bi-arrow-counterclockwise me-1" />
                    Đặt lại
                  </button>
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
                    <label className="form-label" htmlFor="explanation">
                      Lời giải thích chi tiết
                      <span style={{
                        marginLeft: 8, fontSize: "0.75rem", fontWeight: 600,
                        color: "#0b57c5", background: "#e9f0ff",
                        borderRadius: 4, padding: "1px 6px"
                      }}>
                        💡 Hiển thị cho user sau khi nộp bài
                      </span>
                    </label>
                    <textarea
                      className="form-control"
                      id="explanation"
                      name="explanation"
                      rows="3"
                      value={questionForm.explanation}
                      onChange={updateQuestionField}
                      placeholder="Nhập lời giải chi tiết để user hiểu tại sao đáp án đúng là... (khuyến khích điền đủ)"
                    />
                    {!questionForm.explanation && (
                      <small style={{ color: "#f59e0b", fontSize: "0.78rem" }}>
                        ⚠ Chưa có lời giải — user sẽ không thấy giải thích sau khi làm bài.
                      </small>
                    )}
                  </div>

                </div>

                {/* Ảnh cho câu hỏi Part 1 (Photographs) */}
                {Number(questionForm.part) === 1 && (
                  <div className="question-image-section mt-3">
                    <div className="question-image-heading">
                      <i className="bi bi-image" aria-hidden="true" />
                      <span>Ảnh câu hỏi Part 1</span>
                      <small>Part 1 (Photographs) — mỗi câu cần 1 ảnh minh hoạ</small>
                    </div>
                    <div className="question-image-upload">
                      <label htmlFor="questionImage" className="question-image-label">
                        <i className="bi bi-upload" aria-hidden="true" />
                        <span>Chọn ảnh (.jpg, .png, .webp)</span>
                        <input
                          id="questionImage"
                          name="questionImage"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/*"
                          onChange={updateQuestionField}
                        />
                      </label>
                      {(questionForm.imageFile || questionForm.imageUrl) ? (
                        <div className="question-image-preview">
                          <img
                            src={questionForm.imageFile
                              ? URL.createObjectURL(questionForm.imageFile)
                              : questionForm.imageUrl}
                            alt="Preview Part 1"
                          />
                          <div className="question-image-actions">
                            {questionForm.imageFile
                              ? <small className="new-file"><i className="bi bi-upload" /> {questionForm.imageFile.name}</small>
                              : <small className="current-file"><i className="bi bi-check-circle-fill text-success" /> Ảnh hiện tại</small>
                            }
                            <button
                              type="button"
                              className="link-button danger"
                              onClick={() => setQuestionForm((cur) => ({ ...cur, imageFile: null, imageUrl: "", removeImage: true }))}
                            >
                              <i className="bi bi-x-circle" /> Xóa ảnh
                            </button>
                          </div>
                        </div>
                      ) : (
                        <small className="text-muted" style={{ fontSize: "0.8rem" }}>⚠ Chưa có ảnh — nên thêm ảnh cho Part 1.</small>
                      )}
                    </div>
                  </div>
                )}

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
                        <th>Ảnh</th>
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
                            {question.part === 1 && question.imageUrl
                              ? <img src={question.imageUrl} alt={`Câu ${question.questionNumber}`} className="question-thumb" />
                              : <span className="text-muted" style={{ fontSize: "0.75rem" }}>—</span>
                            }
                          </td>
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
                          <td className="text-center text-secondary py-4" colSpan="7">
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
                  <h2>Danh sách bộ từ vựng</h2>
                </div>
              </div>

              <div className="row mb-3 g-2">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Tìm kiếm theo tên hoặc mô tả..."
                    value={vocabularySearchTerm}
                    onChange={(e) => {
                      setVocabularySearchTerm(e.target.value);
                      setVocabularyPage(1);
                    }}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select form-select-sm"
                    value={vocabularyStatusFilter}
                    onChange={(e) => {
                      setVocabularyStatusFilter(e.target.value);
                      setVocabularyPage(1);
                    }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="visible">Hiển thị</option>
                    <option value="hidden">Đã ẩn</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={() => {
                      setVocabularySearchTerm("");
                      setVocabularyStatusFilter("all");
                      setVocabularyPage(1);
                    }}
                  >
                    <i className="bi bi-arrow-counterclockwise me-1" />
                    Đặt lại
                  </button>
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
                  <h2>Danh sách mã giảm giá</h2>
                </div>
              </div>

              <div className="row mb-3 g-2">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Tìm kiếm theo code..."
                    value={couponSearchTerm}
                    onChange={(e) => {
                      setCouponSearchTerm(e.target.value);
                      setExamPage(1);
                    }}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select form-select-sm"
                    value={couponStatusFilter}
                    onChange={(e) => {
                      setCouponStatusFilter(e.target.value);
                      setExamPage(1);
                    }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang bật</option>
                    <option value="inactive">Đang tắt</option>
                    <option value="expired">Hết hạn</option>
                    <option value="hidden">Đã ẩn</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={() => {
                      setCouponSearchTerm("");
                      setCouponStatusFilter("all");
                      setExamPage(1);
                    }}
                  >
                    <i className="bi bi-arrow-counterclockwise me-1" />
                    Đặt lại
                  </button>
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

        {activeView === "blog" && (
          <div className="exam-management-grid">
            <form className="admin-panel exam-form" key={blogFormResetKey} onSubmit={(e) => submitBlogPost(e, false)}>
              <div className="panel-heading">
                <div>
                  <h2>{blogEditingId ? "Chỉnh sửa bài viết" : "Viết bài mới"}</h2>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="blogTitle">Tiêu đề</label>
                <input className="form-control" id="blogTitle" name="title" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} required />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="blogCategory">Danh mục</label>
                <select className="form-select" id="blogCategory" name="category" value={blogForm.category} onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}>
                  <option value="blog">Blog</option>
                  <option value="news">Tin tức</option>
                  <option value="announcement">Thông báo</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="blogContent">Nội dung</label>
                <textarea className="form-control" id="blogContent" name="content" rows="10" value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} required />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="blogExcerpt">Tóm tắt (tùy chọn)</label>
                <textarea className="form-control" id="blogExcerpt" name="excerpt" rows="3" value={blogForm.excerpt} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="blogTags">Tags (cách nhau bằng dấu phẩy)</label>
                <input className="form-control" id="blogTags" name="tags" value={blogForm.tags} onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })} />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="blogThumbnail">Hình ảnh đại diện</label>
                <input className="form-control" id="blogThumbnail" name="thumbnail" type="file" onChange={(e) => setBlogForm({ ...blogForm, thumbnail: e.target.files[0] || null })} />
                {blogForm.existingThumbnailUrl && !blogForm.thumbnail && (
                  <small className="current-file">Hiện có: {getFileNameFromUrl(blogForm.existingThumbnailUrl)}</small>
                )}
                {blogForm.thumbnail && (
                  <small className="current-file">Mới: {blogForm.thumbnail.name}</small>
                )}
              </div>

              <div className="form-actions">
                <button className="btn btn-outline-secondary" type="button" onClick={(e) => submitBlogPost(e, false)} disabled={blogLoading}>
                  {blogLoading ? "Đang lưu..." : "Lưu nháp"}
                </button>
                <button className="btn btn-primary" type="button" onClick={(e) => submitBlogPost(e, true)} disabled={blogLoading}>
                  {blogLoading ? "Đang gửi..." : "Gửi duyệt"}
                </button>
                {blogEditingId && (
                  <button className="btn btn-outline-danger" type="button" onClick={resetBlogForm}>
                    Hủy
                  </button>
                )}
              </div>
            </form>

            <section className="admin-panel exam-list-panel">
              <div className="panel-heading">
                <div>
                  <h2>Danh sách bài viết</h2>
                </div>
              </div>

              <div className="row mb-3 g-2">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..."
                    value={blogSearchTerm}
                    onChange={(e) => {
                      setBlogSearchTerm(e.target.value);
                      setBlogPage(1);
                    }}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select form-select-sm"
                    value={blogStatusFilter}
                    onChange={(e) => {
                      setBlogStatusFilter(e.target.value);
                      setBlogPage(1);
                    }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="draft">Nháp</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã xuất bản</option>
                    <option value="hidden">Đã ẩn</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <button
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={() => {
                      setBlogSearchTerm("");
                      setBlogStatusFilter("all");
                      setBlogPage(1);
                    }}
                  >
                    <i className="bi bi-arrow-counterclockwise me-1" />
                    Đặt lại
                  </button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table align-middle admin-table">
                  <thead>
                    <tr>
                      <th>Tiêu đề</th>
                      <th>Danh mục</th>
                      <th>Tác giả</th>
                      <th>Trạng thái</th>
                      <th className="text-end">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBlogPosts.map((post) => (
                      <tr key={post._id}>
                        <td>
                          <strong>{post.title}</strong>
                          {post.thumbnailUrl && <i className="bi bi-image ms-2 text-muted" />}
                        </td>
                        <td><span className="soft-badge">{post.category}</span></td>
                        <td>{post.author?.name || "Unknown"}</td>
                        <td>
                          {post.status === "DRAFT" && <span className="status-badge hidden">Nháp</span>}
                          {post.status === "PENDING" && <span className="status-badge pending">Chờ duyệt</span>}
                          {post.status === "APPROVED" && <span className="status-badge approved">Đã xuất bản</span>}
                          {post.status === "HIDDEN" && <span className="status-badge hidden">Đã ẩn</span>}
                        </td>
                        <td className="text-end">
                          <button className="icon-action" type="button" onClick={() => editBlogPost(post)} title="Chỉnh sửa">
                            <i className="bi bi-pencil-square" aria-hidden="true" />
                          </button>
                          {post.status === "PENDING" && user.role === "admin" && (
                            <button className="icon-action success" type="button" onClick={() => approveBlogPost(post._id)} title="Phê duyệt">
                              <i className="bi bi-check-circle" aria-hidden="true" />
                            </button>
                          )}
                          <button className="icon-action danger" type="button" onClick={() => removeBlogPost(post._id)} title="Ẩn bài viết">
                            <i className="bi bi-trash" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!blogPosts.length && (
                      <tr>
                        <td className="text-center text-secondary py-4" colSpan="5">Chưa có bài viết nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {blogTotalPages > 1 && (
                <div className="pagination-controls">
                  <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setBlogPage((p) => Math.max(1, p - 1))} disabled={blogPage === 1}>
                    <i className="bi bi-chevron-left" aria-hidden="true" />
                  </button>
                  <span className="pagination-info">
                    Trang {blogPage} / {blogTotalPages} ({blogPosts.length} bài viết)
                  </span>
                  <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setBlogPage((p) => Math.min(blogTotalPages, p + 1))} disabled={blogPage === blogTotalPages}>
                    <i className="bi bi-chevron-right" aria-hidden="true" />
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {activeView === "comments" && (
          <div>
            {/* Tab switcher */}
            <div className="d-flex gap-2 mb-4">
              <button
                type="button"
                className={`btn btn-sm ${commentTab === "comments" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setCommentTab("comments")}
              >
                <i className="bi bi-chat-dots me-1" />
                Bình luận ({comments.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${commentTab === "reviews" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setCommentTab("reviews")}
              >
                <i className="bi bi-star me-1" />
                Đánh giá sao ({productReviews.length})
              </button>
            </div>

            {/* ── BLOG COMMENTS TAB ── */}
            {commentTab === "comments" && (
              <div className="exam-management-grid">
                <section className="admin-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Trả lời bình luận</h2>
                    </div>
                  </div>

                  {replyingTo && (
                    <div className="mb-3">
                      <div className="alert alert-info d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Đang trả lời:</strong> {comments.find(c => c._id === replyingTo)?.content}
                        </div>
                        <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => setReplyingTo(null)}>
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={submitComment}>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="commentContent">Nội dung trả lời</label>
                      <textarea className="form-control" id="commentContent" name="content" rows="6" value={commentForm.content} onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })} required placeholder="Nhập nội dung trả lời..." />
                    </div>

                    <div className="form-actions">
                      <button className="btn btn-primary" type="submit" disabled={commentLoading}>
                        {commentLoading ? "Đang gửi..." : "Gửi trả lời"}
                      </button>
                      {replyingTo && (
                        <button className="btn btn-outline-secondary" type="button" onClick={() => setReplyingTo(null)}>
                          Hủy trả lời
                        </button>
                      )}
                    </div>
                  </form>
                </section>

                <section className="admin-panel exam-list-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Danh sách bình luận</h2>
                    </div>
                  </div>

                  <div className="row mb-3 g-2">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Tìm kiếm theo nội dung hoặc người dùng..."
                        value={commentSearchTerm}
                        onChange={(e) => {
                          setCommentSearchTerm(e.target.value);
                          setCommentPage(1);
                        }}
                      />
                    </div>
                    <div className="col-md-3">
                      <select
                        className="form-select form-select-sm"
                        value={commentStatusFilter}
                        onChange={(e) => {
                          setCommentStatusFilter(e.target.value);
                          setCommentPage(1);
                        }}
                      >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="visible">Hiển thị</option>
                        <option value="hidden">Đã ẩn</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <button
                        className="btn btn-sm btn-outline-secondary w-100"
                        type="button"
                        onClick={() => {
                          setCommentSearchTerm("");
                          setCommentStatusFilter("all");
                          setCommentPage(1);
                        }}
                      >
                        <i className="bi bi-arrow-counterclockwise me-1" />
                        Đặt lại
                      </button>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="table align-middle admin-table">
                      <thead>
                        <tr>
                          <th>Nội dung</th>
                          <th>Người dùng</th>
                          <th>Loại</th>
                          <th>Trạng thái</th>
                          <th className="text-end">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commentLoading ? (
                          <tr><td colSpan="5" className="text-center py-4"><span className="spinner-border spinner-border-sm text-primary me-2" role="status" />Đang tải...</td></tr>
                        ) : paginatedComments.length > 0 ? paginatedComments.map((comment) => (
                          <tr key={comment._id}>
                            <td>
                              <div className="comment-content">
                                {comment.content}
                                {comment.replyTo && (
                                  <small className="text-muted d-block mt-1">
                                    ← Trả lời bình luận {typeof comment.replyTo === 'object' ? (comment.replyTo.content ? `"${comment.replyTo.content}"` : `#${comment.replyTo._id}`) : `#${comment.replyTo}`}
                                  </small>
                                )}
                              </div>
                            </td>
                            <td>
                              <div>
                                <strong>
                                  {comment.isAdminReply && user.role !== "admin"
                                    ? "Ban Quản Trị"
                                    : (comment.author?.name || "Unknown")}
                                </strong>
                                {comment.isAdminReply && user.role === "admin" && (
                                  <span className="badge bg-primary ms-1">Admin Reply</span>
                                )}
                              </div>
                              <small className="text-muted">{new Date(comment.createdAt).toLocaleDateString("vi-VN")}</small>
                            </td>
                            <td><span className="soft-badge">{comment.targetType}</span></td>
                            <td>
                              {comment.status === "VISIBLE" ? (
                                <span className="status-badge approved">Hiển thị</span>
                              ) : (
                                <span className="status-badge hidden">Đã ẩn</span>
                              )}
                            </td>
                            <td className="text-end">
                              {!comment.isAdminReply && (
                                <button className="icon-action" type="button" onClick={() => startReply(comment)} title="Trả lời">
                                  <i className="bi bi-reply" aria-hidden="true" />
                                </button>
                              )}
                              {comment.status === "VISIBLE" ? (
                                <button className="icon-action danger" type="button" onClick={() => hideComment(comment._id)} title="Ẩn bình luận">
                                  <i className="bi bi-eye-slash" aria-hidden="true" />
                                </button>
                              ) : (
                                <button className="icon-action success" type="button" onClick={() => showComment(comment._id)} title="Hiển thị lại">
                                  <i className="bi bi-eye" aria-hidden="true" />
                                </button>
                              )}
                              <button className="icon-action danger" type="button" onClick={() => deleteComment(comment._id)} title="Xóa vĩnh viễn">
                                <i className="bi bi-trash" aria-hidden="true" />
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td className="text-center text-secondary py-4" colSpan="5">
                              <i className="bi bi-chat-dots fs-3 d-block mb-2" />
                              Chưa có bình luận nào.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {commentTotalPages > 1 && (
                    <div className="pagination-controls">
                      <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setCommentPage((p) => Math.max(1, p - 1))} disabled={commentPage === 1}>
                        <i className="bi bi-chevron-left" aria-hidden="true" />
                      </button>
                      <span className="pagination-info">
                        Trang {commentPage} / {commentTotalPages} ({filteredComments.length} bình luận)
                      </span>
                      <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setCommentPage((p) => Math.min(commentTotalPages, p + 1))} disabled={commentPage === commentTotalPages}>
                        <i className="bi bi-chevron-right" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* ── PRODUCT REVIEWS TAB ── */}
            {commentTab === "reviews" && (
              <section className="admin-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Đánh giá sao sản phẩm</h2>
                    <small className="text-muted">Quản lý đánh giá của học viên về đề thi và bộ từ vựng</small>
                  </div>
                </div>

                <div className="row mb-3 g-2">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Tìm kiếm theo nội dung hoặc người dùng..."
                      value={reviewSearchTerm}
                      onChange={(e) => {
                        setReviewSearchTerm(e.target.value);
                        setReviewPage(1);
                      }}
                    />
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select form-select-sm"
                      value={reviewStatusFilter}
                      onChange={(e) => {
                        setReviewStatusFilter(e.target.value);
                        setReviewPage(1);
                      }}
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="visible">Hiển thị</option>
                      <option value="hidden">Đã ẩn</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <button
                      className="btn btn-sm btn-outline-secondary w-100"
                      type="button"
                      onClick={() => {
                        setReviewSearchTerm("");
                        setReviewStatusFilter("all");
                        setReviewPage(1);
                      }}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1" />
                      Đặt lại
                    </button>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table align-middle admin-table">
                    <thead>
                      <tr>
                        <th>Nội dung</th>
                        <th>Người dùng</th>
                        <th>Sản phẩm</th>
                        <th>Sao</th>
                        <th>Trạng thái</th>
                        <th className="text-end">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviewLoading ? (
                        <tr><td colSpan="6" className="text-center py-4"><span className="spinner-border spinner-border-sm text-primary me-2" role="status" />Đang tải...</td></tr>
                      ) : paginatedProductReviews.length > 0 ? paginatedProductReviews.map((review) => (
                        <tr key={review._id}>
                          <td>
                            <div className="comment-content">{review.comment || <em className="text-muted">Không có nội dung</em>}</div>
                          </td>
                          <td>
                            <div><strong>{review.userId?.name || review.userId?.fullName || "Unknown"}</strong></div>
                            <small className="text-muted">{review.userId?.email || ""}</small>
                            <br />
                            <small className="text-muted">{review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : ""}</small>
                          </td>
                          <td>
                            <span className="soft-badge">{review.targetType || "Sản phẩm"}</span>
                          </td>
                          <td>
                            <span style={{ color: "#f59e0b", fontSize: "0.9rem" }}>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <i key={i} className={`bi ${i < (review.rating || 0) ? "bi-star-fill" : "bi-star"}`} />
                              ))}
                            </span>
                            <span className="ms-1 text-muted" style={{ fontSize: "0.85rem" }}>({review.rating || 0}/5)</span>
                          </td>
                          <td>
                            {review.status === "VISIBLE" || !review.status ? (
                              <span className="status-badge approved">Hiển thị</span>
                            ) : (
                              <span className="status-badge hidden">Đã ẩn</span>
                            )}
                          </td>
                          <td className="text-end">
                            {(review.status === "VISIBLE" || !review.status) ? (
                              <button className="icon-action danger" type="button" onClick={() => hideProductReview(review._id)} title="Ẩn đánh giá">
                                <i className="bi bi-eye-slash" aria-hidden="true" />
                              </button>
                            ) : (
                              <button className="icon-action success" type="button" onClick={() => showProductReview(review._id)} title="Hiển thị lại">
                                <i className="bi bi-eye" aria-hidden="true" />
                              </button>
                            )}
                            <button className="icon-action danger" type="button" onClick={() => deleteProductReview(review._id)} title="Xóa vĩnh viễn">
                              <i className="bi bi-trash" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td className="text-center text-secondary py-4" colSpan="6">
                            <i className="bi bi-star fs-3 d-block mb-2" />
                            Chưa có đánh giá nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {reviewTotalPages > 1 && (
                  <div className="pagination-controls">
                    <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setReviewPage((p) => Math.max(1, p - 1))} disabled={reviewPage === 1}>
                      <i className="bi bi-chevron-left" aria-hidden="true" />
                    </button>
                    <span className="pagination-info">
                      Trang {reviewPage} / {reviewTotalPages} ({filteredProductReviews.length} đánh giá)
                    </span>
                    <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setReviewPage((p) => Math.min(reviewTotalPages, p + 1))} disabled={reviewPage === reviewTotalPages}>
                      <i className="bi bi-chevron-right" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
        {activeView === "users" && isAdmin && (
          <div>
            {/* Header row */}
            <div className="row mb-3 g-2">
              <div className="col-12 d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-secondary mb-0 small">Hệ thống phân quyền bổ nhiệm vai trò và khóa/mở khóa tài khoản học viên</p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="soft-badge" style={{ fontSize: "0.9rem", padding: "0.4rem 0.8rem" }}>
                    <i className="bi bi-people me-1" />
                    {userTotalItems} tổng số tài khoản
                  </span>
                </div>
              </div>
            </div>

            {/* Search & filter */}
            <section className="admin-panel mb-3">
              <form className="row g-2 align-items-end" onSubmit={handleUserSearchSubmit}>
                <div className="col-md-5">
                  <label className="form-label small fw-semibold text-secondary">Tìm kiếm</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text"><i className="bi bi-search" /></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Theo Tên hoặc Email..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold text-secondary">Lọc theo quyền</label>
                  <select
                    className="form-select form-select-sm"
                    value={userRoleFilter}
                    onChange={(e) => { setUserRoleFilter(e.target.value); setUserPage(1); loadUsers(1, e.target.value, userStatusFilter); }}
                  >
                    <option value="">Tất cả quyền</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Employee">Employee</option>
                    <option value="User">User</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold text-secondary">Lọc theo trạng thái</label>
                  <select
                    className="form-select form-select-sm"
                    value={userStatusFilter}
                    onChange={(e) => { setUserStatusFilter(e.target.value); setUserPage(1); loadUsers(1, userRoleFilter, e.target.value); }}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="Đang hoạt động">Đang hoạt động</option>
                    <option value="Bị khóa">Bị khóa</option>
                    <option value="Chưa kích hoạt">Chưa kích hoạt</option>
                  </select>
                </div>
                <div className="col-md-1">
                  <button type="submit" className="btn btn-primary btn-sm w-100" title="Tìm kiếm">
                    <i className="bi bi-search" />
                  </button>
                </div>
              </form>
            </section>

            {/* Table */}
            <section className="admin-panel">
              <div className="table-responsive">
                <table className="table align-middle admin-table">
                  <thead>
                    <tr>
                      <th>Người Dùng</th>
                      <th>Phân Quyền</th>
                      <th>Trạng Thái</th>
                      <th className="text-end">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userLoading ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          <span className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                          Đang tải...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-secondary py-4">
                          <i className="bi bi-inbox fs-3 d-block mb-2" />
                          Không tìm thấy dữ liệu phù hợp
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              {u.avatarUrl ? (
                                <img
                                  src={u.avatarUrl.startsWith("http") ? u.avatarUrl : `${import.meta.env.VITE_API_URL || "http://localhost:3000"}${u.avatarUrl}`}
                                  alt="avatar"
                                  className="rounded-circle object-fit-cover"
                                  style={{ width: 38, height: 38 }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                                  style={{ width: 38, height: 38, background: "#4f46e5", fontSize: "1rem", flexShrink: 0 }}
                                >
                                  {(u.fullName || "?").charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>{u.fullName}</div>
                                <small className="text-secondary">{u.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            {u.role === "Admin" ? (
                              <span className="status-badge" style={{ background: "#fee2e2", color: "#b91c1c" }}>
                                <i className="bi bi-shield-lock-fill me-1" />Admin
                              </span>
                            ) : (
                              <select
                                className="form-select form-select-sm w-auto"
                                value={u.role}
                                onChange={(e) => changeUserRole(u._id, e.target.value)}
                                disabled={user.role !== "admin"}
                              >
                                <option value="Manager">Manager</option>
                                <option value="Employee">Employee</option>
                                <option value="User">User</option>
                              </select>
                            )}
                          </td>
                          <td>
                            {u.status === "Bị khóa" ? (
                              <span className="status-badge hidden">Bị khóa</span>
                            ) : u.status === "Chưa kích hoạt" ? (
                              <span className="status-badge" style={{ background: "#fef3c7", color: "#92400e" }}>Chưa kích hoạt</span>
                            ) : (
                              <span className="status-badge approved">Đang hoạt động</span>
                            )}
                          </td>
                          <td className="text-end">
                            <button
                              className={`icon-action ${u.status === "Bị khóa" ? "success" : "danger"}`}
                              type="button"
                              title={u.status === "Bị khóa" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                              onClick={() => toggleUserStatus(u._id, u.status)}
                              disabled={u.role === "Admin"}
                            >
                              <i className={`bi ${u.status === "Bị khóa" ? "bi-unlock-fill" : "bi-lock-fill"}`} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination-controls">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  type="button"
                  onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                  disabled={userPage === 1}
                >
                  <i className="bi bi-chevron-left" />
                </button>
                <span className="pagination-info">
                  Trang {userPage} / {Math.max(1, userTotalPages)} ({userTotalItems} người dùng)
                </span>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  type="button"
                  onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))}
                  disabled={userPage >= userTotalPages || userTotalPages <= 1}
                >
                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            </section>
          </div>
        )}

        {activeView === "profile" && (
          <div className="p-1">
            <AdminProfile />
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;
