const UserVocabulary = require("../models/UserVocabulary");

const fetchDictionaryData = async (word) => {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) return null;

    const entry = data[0];
    const phoneticObj =
      entry.phonetics?.find((p) => p.text && p.audio) ||
      entry.phonetics?.find((p) => p.text) ||
      null;
    const phonetic = phoneticObj?.text || entry.phonetic || `/${word}/`;
    const audioUrl =
      entry.phonetics?.find((p) => p.audio?.includes("-us"))?.audio ||
      entry.phonetics?.find((p) => p.audio)?.audio ||
      "";
    const firstMeaning = entry.meanings?.[0];
    const partOfSpeech = firstMeaning?.partOfSpeech || "word";
    const firstDef = firstMeaning?.definitions?.[0];
    const synonyms = firstDef?.synonyms?.slice(0, 3) || [];

    return {
      word: entry.word || word,
      phonetic,
      audioUrl,
      partOfSpeech,
      definitionEn: firstDef?.definition || "",
      exampleEn: firstDef?.example || "",
      synonyms,
    };
  } catch (err) {
    console.error("Free Dictionary API error:", err.message);
    return null;
  }
};

const translateToVietnamese = async (text) => {
  if (!text || !text.trim()) return "";
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    return text;
  } catch (err) {
    console.error("MyMemory Translate error:", err.message);
    return text;
  }
};

// POST /api/vocabulary/translate
const translateWord = async (req, res, next) => {
  try {
    const { word } = req.body;
    if (!word || !word.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập từ cần tra." });
    }
    const trimmed = word.trim();
    const dictData = await fetchDictionaryData(trimmed);

    if (!dictData) {
      return res.json({
        found: false,
        word: trimmed,
        phonetic: `/${trimmed.toLowerCase()}/`,
        audioUrl: "",
        type: "Unknown",
        meaning: `Không tìm thấy định nghĩa cho "${trimmed}". Hãy kiểm tra lại chính tả.`,
        example: "",
        synonyms: [],
      });
    }

    const [meaningVi, exampleVi] = await Promise.all([
      translateToVietnamese(dictData.definitionEn),
      translateToVietnamese(dictData.exampleEn),
    ]);

    const typeFormatted =
      dictData.partOfSpeech.charAt(0).toUpperCase() + dictData.partOfSpeech.slice(1);

    return res.json({
      found: true,
      word: dictData.word,
      phonetic: dictData.phonetic,
      audioUrl: dictData.audioUrl,
      type: typeFormatted,
      meaning: meaningVi,
      example: exampleVi,
      meaningEn: dictData.definitionEn,
      exampleEn: dictData.exampleEn,
      synonyms: dictData.synonyms,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/vocabulary/notebook
// FIX: trả về collectionId
const getNotebook = async (req, res, next) => {
  try {
    const words = await UserVocabulary.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(words);
  } catch (error) {
    next(error);
  }
};

// POST /api/vocabulary/notebook
// FIX: nhận và lưu collectionId
const addToNotebook = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { word, phonetic, audioUrl, type, meaning, example, collectionId } = req.body;

    if (!word?.trim() || !meaning?.trim()) {
      return res.status(400).json({ message: "Từ và nghĩa không được để trống." });
    }

    const existing = await UserVocabulary.findOne({
      user: userId,
      word: word.trim(),
    });

    if (existing) {
      // FIX: nếu từ đã tồn tại, cập nhật collectionId nếu được gửi lên
      if (collectionId !== undefined && existing.collectionId !== collectionId) {
        existing.collectionId = collectionId || null;
        await existing.save();
        return res.status(409).json({
          message: `Từ "${word}" đã có trong sổ tay của bạn (đã cập nhật bộ từ).`,
          vocab: existing,
        });
      }
      return res.status(409).json({ message: `Từ "${word}" đã có trong sổ tay của bạn.` });
    }

    const newWord = await UserVocabulary.create({
      user: userId,
      word: word.trim(),
      phonetic: phonetic || "",
      audioUrl: audioUrl || "",
      type: type || "",
      meaning: meaning.trim(),
      example: example || "",
      // FIX: lưu collectionId (string ID của bộ từ cá nhân)
      collectionId: collectionId || null,
      status: "Đang học",
      lastReviewed: new Date(),
    });

    return res.status(201).json({
      message: `Đã thêm từ "${word}" vào sổ tay.`,
      vocab: newWord,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Từ này đã có trong sổ tay của bạn." });
    }
    next(error);
  }
};

// PATCH /api/vocabulary/notebook/:id/status
const updateWordStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["Đang học", "Đã thuộc"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    const vocab = await UserVocabulary.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status, lastReviewed: new Date() },
      { new: true }
    );

    if (!vocab) {
      return res.status(404).json({ message: "Không tìm thấy từ này." });
    }

    return res.json({ message: "Cập nhật trạng thái thành công.", vocab });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/vocabulary/notebook/:id/collection
// FIX: Endpoint mới để cập nhật collectionId của từ
const updateWordCollection = async (req, res, next) => {
  try {
    const { collectionId } = req.body;

    const vocab = await UserVocabulary.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { collectionId: collectionId || null },
      { new: true }
    );

    if (!vocab) {
      return res.status(404).json({ message: "Không tìm thấy từ này." });
    }

    return res.json({ message: "Đã cập nhật bộ từ.", vocab });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/vocabulary/notebook/:id
const removeFromNotebook = async (req, res, next) => {
  try {
    const vocab = await UserVocabulary.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!vocab) {
      return res.status(404).json({ message: "Không tìm thấy từ này." });
    }

    return res.json({ message: `Đã xóa từ "${vocab.word}" khỏi sổ tay.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  translateWord,
  getNotebook,
  addToNotebook,
  updateWordStatus,
  updateWordCollection,
  removeFromNotebook,
};


// const UserVocabulary = require("../models/UserVocabulary");


// const fetchDictionaryData = async (word) => {
//   try {
//     const res = await fetch(
//       `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
//     );

//     if (!res.ok) return null;

//     const data = await res.json();
//     if (!Array.isArray(data) || !data.length) return null;

//     const entry = data[0];

//     // Lấy phonetic text - ưu tiên cái có cả text lẫn audio
//     const phoneticObj =
//       entry.phonetics?.find((p) => p.text && p.audio) ||
//       entry.phonetics?.find((p) => p.text) ||
//       null;

//     const phonetic = phoneticObj?.text || entry.phonetic || `/${word}/`;

//     // Lấy audio URL - ưu tiên giọng Mỹ (us), sau đó lấy bất kỳ cái có audio
//     const audioUrl =
//       entry.phonetics?.find((p) => p.audio?.includes("-us"))?.audio ||
//       entry.phonetics?.find((p) => p.audio)?.audio ||
//       "";

//     // Lấy meaning đầu tiên
//     const firstMeaning = entry.meanings?.[0];
//     const partOfSpeech = firstMeaning?.partOfSpeech || "word";
//     const firstDef = firstMeaning?.definitions?.[0];

//     // Lấy thêm các synonyms nếu có
//     const synonyms = firstDef?.synonyms?.slice(0, 3) || [];

//     return {
//       word: entry.word || word,
//       phonetic,
//       audioUrl,
//       partOfSpeech,
//       definitionEn: firstDef?.definition || "",
//       exampleEn: firstDef?.example || "",
//       synonyms,
//     };
//   } catch (err) {
//     console.error("Free Dictionary API error:", err.message);
//     return null;
//   }
// };

// // ============================================================
// // Helper 2: MyMemory Translate API
// // - Dịch văn bản tiếng Anh sang tiếng Việt
// // - Miễn phí, không cần key
// // - Giới hạn: 500 req/ngày (thêm email → 1000 req/ngày)
// // ============================================================
// const translateToVietnamese = async (text) => {
//   if (!text || !text.trim()) return "";

//   try {
//     const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
//       text
//     )}&langpair=en|vi`;

//     const res = await fetch(url);
//     const data = await res.json();

//     if (data.responseStatus === 200 && data.responseData?.translatedText) {
//       return data.responseData.translatedText;
//     }

//     // Fallback: trả về nguyên bản tiếng Anh nếu dịch thất bại
//     return text;
//   } catch (err) {
//     console.error("MyMemory Translate error:", err.message);
//     return text;
//   }
// };

// // ============================================================
// // POST /api/vocabulary/translate
// // Body: { word: "negotiate" }
// //
// // Luồng xử lý:
// // 1. Gọi Free Dictionary API → phonetic, audio, type, EN definition, EN example
// // 2. Gọi MyMemory API (song song) → dịch definition + example sang tiếng Việt
// // 3. Ghép kết quả → trả về frontend
// // ============================================================
// const translateWord = async (req, res, next) => {
//   try {
//     const { word } = req.body;

//     if (!word || !word.trim()) {
//       return res.status(400).json({ message: "Vui lòng nhập từ cần tra." });
//     }

//     const trimmed = word.trim();

//     // Bước 1: Lấy dữ liệu từ điển
//     const dictData = await fetchDictionaryData(trimmed);

//     if (!dictData) {
//       return res.json({
//         found: false,
//         word: trimmed,
//         phonetic: `/${trimmed.toLowerCase()}/`,
//         audioUrl: "",
//         type: "Unknown",
//         meaning: `Không tìm thấy định nghĩa cho "${trimmed}". Hãy kiểm tra lại chính tả.`,
//         example: "",
//         synonyms: [],
//       });
//     }

//     // Bước 2: Dịch định nghĩa và ví dụ song song để tăng tốc
//     const [meaningVi, exampleVi] = await Promise.all([
//       translateToVietnamese(dictData.definitionEn),
//       translateToVietnamese(dictData.exampleEn),
//     ]);

//     // Chuẩn hóa loại từ: "verb" → "Verb"
//     const typeFormatted =
//       dictData.partOfSpeech.charAt(0).toUpperCase() +
//       dictData.partOfSpeech.slice(1);

//     return res.json({
//       found: true,
//       word: dictData.word,
//       phonetic: dictData.phonetic,
//       audioUrl: dictData.audioUrl,       // URL file MP3 phát âm
//       type: typeFormatted,
//       meaning: meaningVi,                // Nghĩa tiếng Việt
//       example: exampleVi,                // Ví dụ tiếng Việt
//       meaningEn: dictData.definitionEn,  // Định nghĩa gốc tiếng Anh
//       exampleEn: dictData.exampleEn,     // Ví dụ gốc tiếng Anh
//       synonyms: dictData.synonyms,       // Từ đồng nghĩa
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // ============================================================
// // GET /api/vocabulary/notebook
// // Lấy toàn bộ từ trong sổ tay của user
// // ============================================================
// const getNotebook = async (req, res, next) => {
//   try {
//     const words = await UserVocabulary.find({ user: req.user._id })
//       .sort({ createdAt: -1 })
//       .lean();

//     return res.json(words);
//   } catch (error) {
//     next(error);
//   }
// };


// // Thêm từ vào sổ tay cá nhân
// const addToNotebook = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
//     const { word, phonetic, audioUrl, type, meaning, example } = req.body;

//     if (!word?.trim() || !meaning?.trim()) {
//       return res
//         .status(400)
//         .json({ message: "Từ và nghĩa không được để trống." });
//     }

//     // Kiểm tra đã có trong sổ tay chưa
//     const existing = await UserVocabulary.findOne({
//       user: userId,
//       word: word.trim(),
//     });

//     if (existing) {
//       return res
//         .status(409)
//         .json({ message: `Từ "${word}" đã có trong sổ tay của bạn.` });
//     }

//     const newWord = await UserVocabulary.create({
//       user: userId,
//       word: word.trim(),
//       phonetic: phonetic || "",
//       audioUrl: audioUrl || "",
//       type: type || "",
//       meaning: meaning.trim(),
//       example: example || "",
//       status: "Đang học",
//       lastReviewed: new Date(),
//     });

//     return res.status(201).json({
//       message: `Đã thêm từ "${word}" vào sổ tay.`,
//       vocab: newWord,
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res
//         .status(409)
//         .json({ message: "Từ này đã có trong sổ tay của bạn." });
//     }
//     next(error);
//   }
// };


// // Cập nhật trạng thái "Đang học" / "Đã thuộc"

// const updateWordStatus = async (req, res, next) => {
//   try {
//     const { status } = req.body;

//     if (!["Đang học", "Đã thuộc"].includes(status)) {
//       return res.status(400).json({ message: "Trạng thái không hợp lệ." });
//     }

//     const vocab = await UserVocabulary.findOneAndUpdate(
//       { _id: req.params.id, user: req.user._id },
//       { status, lastReviewed: new Date() },
//       { new: true }
//     );

//     if (!vocab) {
//       return res.status(404).json({ message: "Không tìm thấy từ này." });
//     }

//     return res.json({ message: "Cập nhật trạng thái thành công.", vocab });
//   } catch (error) {
//     next(error);
//   }
// };


// // Xóa từ khỏi sổ tay
// const removeFromNotebook = async (req, res, next) => {
//   try {
//     const vocab = await UserVocabulary.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!vocab) {
//       return res.status(404).json({ message: "Không tìm thấy từ này." });
//     }

//     return res.json({ message: `Đã xóa từ "${vocab.word}" khỏi sổ tay.` });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   translateWord,
//   getNotebook,
//   addToNotebook,
//   updateWordStatus,
//   removeFromNotebook,
// };