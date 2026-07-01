const fs = require("fs/promises");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const Question = require("../models/Question");

const uploadDir = path.join(__dirname, "..", "..", "uploads");
const answerKeys = ["A", "B", "C", "D"];
const optionLinePattern = /^(?:\([ABCD]\)|[ABCD][\).])\s+/;
const inlineAnswerExplanationPattern = /(?:đáp\s*án|dap\s*an|phương\s*án|phuong\s*an)\s*(?:đúng|dung)?\s*:\s*\(?([ABCD])\)?(?:[.:]?\s+|\s*)(?:(?:giải\s*thích\s*chi\s*tiết|giai\s*thich\s*chi\s*tiet|giải\s*thích|giai\s*thich|lời\s*giải\s*chi\s*tiết|loi\s*giai\s*chi\s*tiet|lời\s*giải|loi\s*giai|hướng\s*dẫn\s*giải|huong\s*dan\s*giai)\s*:\s*)?([\s\S]*)$/i;

const preprocessText = (text) => {
  if (!text) return "";
  // Split inline questions (e.g. "text. 131. (A)" -> "text.\n131. (A)")
  return text.replace(/\s+(?=(?:(?:[cC][âÂaA][uU]|[qQ](?:[uU][eE][sS][tT][iI][oO][nN])?)\s*)?\d{1,3}[\).:]?\s*(?:\(A\)|A[\).])\s+)/g, "\n");
};

const normalizeAnswerEntry = (entry) => {
  if (!entry) return null;

  if (typeof entry === "string") {
    return { answer: entry.toUpperCase(), explanation: "" };
  }

  return {
    answer: String(entry.answer || "").toUpperCase(),
    explanation: entry.explanation || ""
  };
};

const cleanAnswerExplanation = (text = "") => (
  text
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .replace(/^\s*(?:[-–—•]\s*)+/, "")
    .trim()
);

const stripAnswerAndExplanationPrefixes = (text = "") => {
  if (!text) return "";
  return text
    .replace(/^(?:đáp\s*án|dap\s*an|phương\s*án|phuong\s*an)\s*(?:đúng|dung)?\s*:\s*\(?[ABCD]\)?[.:]?\s*/gi, "")
    .replace(/^(?:giải\s*thích\s*chi\s*tiết|giai\s*thich\s*chi\s*tiet|giải\s*thích|giai\s*thich|lời\s*giải\s*chi\s*tiết|loi\s*giai\s*chi\s*tiet|lời\s*giải|loi\s*giai|hướng\s*dẫn\s*giải|huong\s*dan\s*giai)\s*:\s*/gi, "")
    .trim();
};

const getCorrectAnswer = (answerKey, questionNumber) => (
  normalizeAnswerEntry(answerKey.get(questionNumber))?.answer || "A"
);

const getExplanation = (answerKey, questionNumber) => (
  normalizeAnswerEntry(answerKey.get(questionNumber))?.explanation || ""
);

const getRequiredAnswerKeys = (part) => (part === 2 ? ["A", "B", "C"] : answerKeys);

const hasRequiredAnswers = (answers, part) => (
  getRequiredAnswerKeys(part).every((key) => answers[key]?.trim())
);

const removeAnswerKeySection = (text = "") => (
  text.replace(/(?:^|\n)\s*(?:answer\s*key|answers|dap\s*an)\b[\s\S]*$/i, "").trim()
);

const inferPartFromQuestionNumber = (questionNumber) => {
  if (questionNumber <= 6) return 1;
  if (questionNumber <= 31) return 2;
  if (questionNumber <= 70) return 3;
  if (questionNumber <= 100) return 4;
  if (questionNumber <= 130) return 5;
  if (questionNumber <= 146) return 6;
  return 7;
};

const normalizePdfText = (text = "") => (
  text
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
);

const safeFileSegment = (value = "") => (
  String(value)
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
);

const buildUploadUrl = (fileName, baseUrl = "") => (
  baseUrl ? `${baseUrl}/uploads/${fileName}` : `/uploads/${fileName}`
);

const extractTextFromPdf = async (pdfPath) => {
  const buffer = await fs.readFile(pdfPath);
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return normalizePdfText(result.text || "");
  } finally {
    await parser.destroy();
  }
};

const extractImagesFromPdf = async (pdfPath, baseUrl = "") => {
  const buffer = await fs.readFile(pdfPath);
  const parser = new PDFParse({ data: buffer });
  const pdfBaseName = safeFileSegment(path.basename(pdfPath, path.extname(pdfPath))) || "pdf";

  try {
    const result = await parser.getImage({
      imageBuffer: true,
      imageDataUrl: false,
      imageThreshold: 120
    });
    const images = [];

    await fs.mkdir(uploadDir, { recursive: true });

    for (const page of result.pages || []) {
      for (let index = 0; index < page.images.length; index += 1) {
        const image = page.images[index];

        if (!image.data || image.width < 120 || image.height < 120) {
          continue;
        }

        const fileName = `${Date.now()}-${pdfBaseName}-page-${page.pageNumber}-image-${index + 1}.png`;
        await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(image.data));
        images.push({
          url: buildUploadUrl(fileName, baseUrl),
          pageNumber: page.pageNumber,
          width: image.width,
          height: image.height
        });
      }
    }

    return images;
  } catch {
    return [];
  } finally {
    await parser.destroy();
  }
};

const parseAnswerKey = (text) => {
  const answers = new Map();
  const keySectionMatch = text.match(/(?:answer\s*key|answers|đáp\s*án|dap\s*an)([\s\S]*)/i);
  const keyText = keySectionMatch?.[1] || text;

  const keyPattern = /\b(\d{1,3})\s*[\).:-]?\s*([ABCD])\b/gi;
  let match = keyPattern.exec(keyText);

  while (match) {
    const questionNumber = Number(match[1]);
    const answer = match[2].toUpperCase();

    if (questionNumber >= 1 && questionNumber <= 200) {
      answers.set(questionNumber, answer);
    }

    match = keyPattern.exec(keyText);
  }

  return answers;
};

const mergeAnswerKeys = (...answerMaps) => {
  const merged = new Map();

  answerMaps.forEach((answerMap) => {
    answerMap.forEach((answer, questionNumber) => {
      merged.set(questionNumber, answer);
    });
  });

  return merged;
};

const parseAnswerDetails = (text) => {
  const answers = mergeAnswerKeys(parseAnswerKey(text));
  const keySectionMatch = text.match(/(?:answer\s*key|answers|đáp\s*án|dap\s*an|Ä‘Ã¡p\s*Ã¡n)([\s\S]*)/i);
  const keyText = keySectionMatch?.[1] || text;
  const detailedPattern = /(?:^|\n)\s*(?:[cC][âÂaA][uU]|[qQ](?:[uU][eE][sS][tT][iI][oO][nN])?)?\s*(\d{1,3})\s*[\).:-]?\s*([ABCD])\b([\s\S]*?)(?=(?:\n\s*(?:[cC][âÂaA][uU]|[qQ](?:[uU][eE][sS][tT][iI][oO][nN])?)?\s*\d{1,3}\s*[\).:-]?\s*[ABCD]\b)|$)/gi;
  let match = detailedPattern.exec(keyText);

  while (match) {
    const questionNumber = Number(match[1]);
    const answer = match[2].toUpperCase();
    const explanation = cleanAnswerExplanation(match[3]);

    if (questionNumber >= 1 && questionNumber <= 200) {
      answers.set(questionNumber, { answer, explanation });
    }

    match = detailedPattern.exec(keyText);
  }

  return answers;
};

const mergeAnswerDetails = (...answerMaps) => {
  const merged = new Map();

  answerMaps.forEach((answerMap) => {
    answerMap.forEach((entry, questionNumber) => {
      const normalizedEntry = normalizeAnswerEntry(entry);
      const existingEntry = normalizeAnswerEntry(merged.get(questionNumber));

      merged.set(questionNumber, {
        answer: normalizedEntry?.answer || existingEntry?.answer || "A",
        explanation: normalizedEntry?.explanation || existingEntry?.explanation || ""
      });
    });
  });

  return merged;
};

const normalizeVietnameseSearchText = (text = "") => (
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
);

const inferAnswerFromExplanation = (text = "") => {
  const normalized = normalizeVietnameseSearchText(text).replace(/\s+/g, " ").trim();
  const patterns = [
    /(?:dap an|phuong an)[^ABCD]{0,40}\b([ABCD])\b/i,
    /\b([ABCD])\s+la\s+(?:phuong an|dap an|cau tra loi)[^.;\n]*(?:dung|chinh xac|phu hop)/i,
    /nen\s+\b([ABCD])\b\s+la[^.;\n]*(?:dung|chinh xac|phu hop)/i,
    /\b([ABCD])\b[^.;\n]{0,80}nen[^.;\n]{0,80}phuong an[^.;\n]*(?:dung|chinh xac)/i
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);

    if (match?.[1]) {
      return match[1].toUpperCase();
    }
  }

  return "";
};

const parseSolvedQuestionBlock = (blockText, part) => {
  const keys = getRequiredAnswerKeys(part);
  const answers = {};
  const readingLines = [];
  const explanationLines = [];
  let currentKey = "";
  let hasSeenOption = false;

  blockText.split("\n").map((line) => line.trim()).filter(Boolean).forEach((line) => {
    const isOptionsComplete = hasRequiredAnswers(answers, part);
    const markerPattern = /(?:^|\s)(?:\(([ABCD])\)|([ABCD])[\).])\s+/g;
    const markers = isOptionsComplete 
      ? [] 
      : Array.from(line.matchAll(markerPattern))
          .filter((match) => keys.includes((match[1] || match[2]).toUpperCase()));

    if (markers.length) {
      hasSeenOption = true;
      const marker = markers[0];
      const key = (marker[1] || marker[2]).toUpperCase();
      const nextMarker = markers[1];
      const optionStart = marker.index + marker[0].length;
      const optionEnd = nextMarker?.index ?? line.length;
      const beforeOption = line.slice(0, marker.index).trim();
      const optionText = line.slice(optionStart, optionEnd).trim();

      if (beforeOption && !Object.keys(answers).length) {
        readingLines.push(beforeOption);
      }

      if (optionText) {
        answers[key] = [answers[key], optionText].filter(Boolean).join(" ").trim();
      }

      if (nextMarker) {
        explanationLines.push(line.slice(nextMarker.index).trim());
      }

      currentKey = key;
      return;
    }

    if (!hasSeenOption) {
      readingLines.push(line);
      return;
    }

    if (currentKey && !hasRequiredAnswers(answers, part)) {
      answers[currentKey] = [answers[currentKey], line].filter(Boolean).join(" ").trim();
      return;
    }

    explanationLines.push(line);
  });

  const explanationRaw = explanationLines.join("\n");
  const correctAnswer = inferAnswerFromExplanation(explanationRaw);
  const explanation = stripAnswerAndExplanationPrefixes(cleanAnswerExplanation(explanationRaw));

  return {
    readingPassage: readingLines.join("\n").trim(),
    answers,
    correctAnswer,
    explanation
  };
};

const parseEmbeddedAnswerDetails = (text) => {
  const answers = new Map();

  parseQuestionBlocks(text).forEach((block) => {
    let blockText = block.lines.join("\n").trim();
    let extractedAnswer = "";
    let extractedExplanation = "";

    const inlineMatch = blockText.match(inlineAnswerExplanationPattern);
    if (inlineMatch) {
      extractedAnswer = inlineMatch[1].toUpperCase();
      extractedExplanation = cleanAnswerExplanation(inlineMatch[2]);
      blockText = blockText.slice(0, inlineMatch.index).trim();
    }

    const solvedBlock = parseSolvedQuestionBlock(blockText, block.part);
    const finalAnswer = extractedAnswer || solvedBlock.correctAnswer;
    const finalExplanation = extractedExplanation || solvedBlock.explanation;

    if (finalAnswer || finalExplanation) {
      answers.set(block.questionNumber, {
        answer: finalAnswer,
        explanation: finalExplanation
      });
    }
  });

  return answers;
};

const attachPartOneImages = (questions = [], images = [], answerKey = new Map()) => {
  if (!images.length) return questions;

  const questionsByNumber = new Map(questions.map((question) => [Number(question.questionNumber), question]));
  const partOneImages = images.slice(0, 6);

  partOneImages.forEach((image, index) => {
    const questionNumber = index + 1;
    const existingQuestion = questionsByNumber.get(questionNumber);

    if (existingQuestion) {
      existingQuestion.imageUrl = existingQuestion.imageUrl || image.url;
      existingQuestion.imagePage = existingQuestion.imagePage || image.pageNumber;
      return;
    }

    questionsByNumber.set(questionNumber, {
      part: 1,
      questionNumber,
      readingPassage: "",
      imageUrl: image.url,
      imagePage: image.pageNumber,
      answers: {
        A: "A",
        B: "B",
        C: "C",
        D: "D"
      },
      correctAnswer: getCorrectAnswer(answerKey, questionNumber),
      explanation: getExplanation(answerKey, questionNumber)
    });
  });

  return Array.from(questionsByNumber.values())
    .sort((left, right) => left.questionNumber - right.questionNumber);
};

const parseAnswers = (blockText) => {
  const answers = {};
  const normalized = blockText.replace(/\n+/g, " ");
  const optionPattern = /(?:^|\s)(?:\(([ABCD])\)|([ABCD])[\).])\s*([\s\S]*?)(?=\s+(?:\([ABCD]\)|[ABCD][\).])\s+|$)/g;
  let match = optionPattern.exec(normalized);

  while (match) {
    const key = (match[1] || match[2]).toUpperCase();
    const value = match[3].trim();

    if (answerKeys.includes(key) && value) {
      answers[key] = value;
    }

    match = optionPattern.exec(normalized);
  }

  return answers;
};

const removeOptionLines = (text = "") => (
  text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !optionLinePattern.test(line) && !/^\d+$/.test(line))
    .join("\n")
    .trim()
);

const extractFirstAnswerSet = (text = "") => {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const answerLines = [];
  let collecting = false;
  let lastKey = "";

  for (const line of lines) {
    const optionMatch = line.match(/^(?:\(([ABCD])\)|([ABCD])[\).])\s+/);

    if (optionMatch) {
      collecting = true;
      lastKey = optionMatch[1] || optionMatch[2];
      answerLines.push(line);

      if (lastKey === "D") {
        break;
      }

      continue;
    }

    if (collecting && lastKey && lastKey !== "D") {
      answerLines.push(line);
    }
  }

  return answerLines.length ? answerLines.join("\n") : text;
};

const getRangeGroups = (text) => {
  const headerPattern = /(?:^|\n|\b)\s*(?:Questions?|Conversation|Talk|Câu\s*hỏi|Đoạn\s*hội\s*thoại|Text|Passage|Part\s*\d+)(?:(?:\s*[:\-–—]?\s*[^(\n]{1,50}?\s*\(\s*(?:Câu\s*)?(\d{1,3})\s*[-–—]\s*(\d{1,3})\s*\))|(?:\s+(?:Câu\s*)?(\d{1,3})\s*[-–—]\s*(\d{1,3}))\b)[ \t]*(?:refer\s+to|Transcript\s*:|[^\r\n]*)/gi;
  const matches = [];
  let match = headerPattern.exec(text);

  while (match) {
    const start = Number(match[1] || match[3]);
    const end = Number(match[2] || match[4]);
    matches.push({
      index: match.index,
      header: match[0].trim(),
      headerLength: match[0].length,
      start,
      end
    });
    match = headerPattern.exec(text);
  }

  return matches.map((item, index) => ({
    ...item,
    text: text.slice(item.index, matches[index + 1]?.index ?? text.length)
  })).filter((item) => item.start >= 1 && item.end <= 200 && item.start <= item.end);
};

const extractLineWithNumber = (text = "", index = 0) => {
  if (!text || index < 0) return "";

  const lineStart = text.lastIndexOf("\n", index);
  const lineEnd = text.indexOf("\n", index);
  const start = lineStart >= 0 ? lineStart + 1 : 0;
  const end = lineEnd >= 0 ? lineEnd : text.length;

  return text.slice(start, end).trim();
};

const findQuestionOptionBlock = (text = "", questionNumber) => {
  if (!text || !questionNumber) return null;

  const headerRegex = new RegExp(`(?:^|\\n)\\s*(?:[qQ](?:[uU][eE][sS][tT][iI][oO][nN])?\\s*)${questionNumber}\\s*[\\).:]?`, "i");
  const headerMatch = text.match(headerRegex);

  if (!headerMatch) {
    return null;
  }

  const headerIndex = headerMatch.index + headerMatch[0].length;
  const nextHeaderRegex = /(?:^|\n)\s*(?:[qQ](?:[uU][eE][sS][tT][iI][oO][nN])?\s*)\d{1,3}\s*[\).:]?/gi;
  nextHeaderRegex.lastIndex = headerIndex;
  const nextHeaderMatch = nextHeaderRegex.exec(text);

  return {
    start: headerIndex,
    end: nextHeaderMatch ? nextHeaderMatch.index : text.length,
    text: text.slice(headerIndex, nextHeaderMatch ? nextHeaderMatch.index : text.length)
  };
};

const parseRangeQuestions = (text, answerKey = new Map()) => {
  const questions = [];

  getRangeGroups(text).forEach((group) => {
    const body = group.text.slice(group.headerLength).trim();
    const scannedText = text.slice(0, group.index + group.headerLength);
    const partMatches = Array.from(scannedText.matchAll(/\bpart\s*([1-7])\b/gi));
    const part = partMatches.length > 0
      ? Number(partMatches[partMatches.length - 1][1])
      : inferPartFromQuestionNumber(group.start);
    const firstNumberedQuestionIndex = body.search(new RegExp(`(?:^|\\n)\\s*(?:[cC][âÂaA][uU]|[qQ](?:[uU][eE][sS][tT][iI][oO][nN])?)?\\s*${group.start}[\\).]?\\s+`));
    const sharedPassage = firstNumberedQuestionIndex >= 0
      ? removeOptionLines(body.slice(0, firstNumberedQuestionIndex))
      : removeOptionLines(body);

    for (let questionNumber = group.start; questionNumber <= group.end; questionNumber += 1) {
      const numberedPattern = new RegExp(`(?:^|\\n)\\s*(?:[cC][âÂaA][uU]|[qQ](?:[uU][eE][sS][tT][iI][oO][nN])?)?\\s*${questionNumber}[\\).]?\\s+([\\s\\S]*?)(?=\\n\\s*(?:[cC][âÂaA][uU]|[qQ](?:[uU][eE][sS][tT][iI][oO][nN])?)?\\s*${questionNumber + 1}[\\).]?\\s+|$)`);
      const numberedMatch = body.match(numberedPattern);

      if (numberedMatch) {
        let blockText = numberedMatch[1].trim();
        let extractedAnswer = "";
        let extractedExplanation = "";

        const inlineMatch = blockText.match(inlineAnswerExplanationPattern);
        if (inlineMatch) {
          extractedAnswer = inlineMatch[1].toUpperCase();
          extractedExplanation = cleanAnswerExplanation(inlineMatch[2]);
          blockText = blockText.slice(0, inlineMatch.index).trim();
        }

        const solvedBlock = parseSolvedQuestionBlock(blockText, part);
        const answers = hasRequiredAnswers(solvedBlock.answers, part)
          ? solvedBlock.answers
          : parseAnswers(blockText);

        if (hasRequiredAnswers(answers, part)) {
          const finalCorrectAnswer = extractedAnswer || solvedBlock.correctAnswer || getCorrectAnswer(answerKey, questionNumber);
          const finalExplanation = extractedExplanation || solvedBlock.explanation || getExplanation(answerKey, questionNumber);

          questions.push({
            part,
            questionNumber,
            readingPassage: [group.header, sharedPassage, solvedBlock.readingPassage].filter(Boolean).join("\n"),
            answers,
            correctAnswer: finalCorrectAnswer,
            explanation: finalExplanation
          });
        }

        continue;
      }

      const clozePattern = new RegExp(`(?:\\.{2,}|…|\\.\\.\\.\\.)?\\s*\\(?${questionNumber}\\)?\\s*(?:\\.{2,}|…|\\.\\.\\.\\.)?`);
      const clozeMatch = body.match(clozePattern);

      if (!clozeMatch) {
        continue;
      }

      const restOfGroup = body.slice(clozeMatch.index);
      const nextClozePattern = new RegExp(`(?:\\.{2,}|…|\\.\\.\\.\\.)?\\s*\\(?${questionNumber + 1}\\)?\\s*(?:\\.{2,}|…|\\.\\.\\.\\.)?`);
      const nextClozeMatch = restOfGroup.slice(1).match(nextClozePattern);
      const answerSource = nextClozeMatch
        ? restOfGroup.slice(0, nextClozeMatch.index + 1)
        : restOfGroup;
      const optionBlock = findQuestionOptionBlock(body, questionNumber);
      const answerBlock = optionBlock?.text ? optionBlock.text : answerSource;
      const answers = parseAnswers(extractFirstAnswerSet(answerBlock));

      if (hasRequiredAnswers(answers, part)) {
        questions.push({
          part,
          questionNumber,
          readingPassage: [group.header, sharedPassage, extractLineWithNumber(body, clozeMatch.index)].filter(Boolean).join("\n"),
          answers,
          correctAnswer: getCorrectAnswer(answerKey, questionNumber),
          explanation: getExplanation(answerKey, questionNumber)
        });
      }
    }
  });

  return questions;
};

const parseQuestionBlocks = (text) => {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const blocks = [];
  let currentPart = null;
  let currentBlock = null;

  for (const line of lines) {
    const questionMatch = line.match(/^(?:(?:[cC][âÂaA][uU]|[qQ](?:[uU][eE][sS][tT][iI][oO][nN])?)\s*)?(\d{1,3})[\).:]?\s*(.*)$/);

    if (questionMatch) {
      if (currentBlock) blocks.push(currentBlock);

      const questionNumber = Number(questionMatch[1] || questionMatch[2]);
      currentBlock = {
        questionNumber,
        part: currentPart || inferPartFromQuestionNumber(questionNumber),
        lines: [questionMatch[3]]
      };
      continue;
    }

    const partMatch = line.match(/\bpart\s*([1-7])\b/i);

    if (partMatch) {
      currentPart = Number(partMatch[1]);
      continue;
    }

    if (currentBlock) {
      currentBlock.lines.push(line);
    }
  }

  if (currentBlock) blocks.push(currentBlock);

  return blocks.filter((block) => block.questionNumber >= 1 && block.questionNumber <= 200);
};

const parsePartSixQuestions = (text = "", answerKey = new Map()) => {
  const questions = [];
  const questionHeaderPattern = /(?:^|\n)\s*(?:(?:[cC][âÂaA][uU]|[qQ](?:[uU][eE][sS][tT][iI][oO][nN])?)\s*)?(\d{1,3})\s*[\).:]?/gi;
  const matches = Array.from(text.matchAll(questionHeaderPattern));

  matches.forEach((match, index) => {
    const questionNumber = Number(match[1]);

    if (questionNumber < 131 || questionNumber > 146) {
      return;
    }

    const headerIndex = match.index + match[0].length;
    const nextHeaderIndex = matches[index + 1]?.index ?? text.length;
    const blockText = text.slice(headerIndex, nextHeaderIndex).trim();
    const answers = parseAnswers(blockText);
    const markerRegex = new RegExp(`\\(\\s*${questionNumber}\\s*\\)`, "ig");
    let lastMarkerMatch = null;

    for (const markerMatch of text.matchAll(markerRegex)) {
      if (markerMatch.index < match.index) {
        lastMarkerMatch = markerMatch;
      }
    }

    const readingPassage = lastMarkerMatch?.index >= 0
      ? text.slice(text.lastIndexOf("\n", lastMarkerMatch.index) + 1, text.indexOf("\n", lastMarkerMatch.index)).trim() || text.slice(0, text.indexOf("\n", lastMarkerMatch.index)).trim()
      : "";

    if (hasRequiredAnswers(answers, 6)) {
      questions.push({
        part: 6,
        questionNumber,
        readingPassage,
        answers,
        correctAnswer: getCorrectAnswer(answerKey, questionNumber),
        explanation: getExplanation(answerKey, questionNumber)
      });
    }
  });

  return questions;
};

const parseQuestionsFromText = (text, answerKeyOverride = new Map()) => {
  const preprocessed = preprocessText(text);
  const embeddedAnswerKey = parseEmbeddedAnswerDetails(preprocessed);
  const answerKey = mergeAnswerDetails(answerKeyOverride, parseAnswerDetails(preprocessed), embeddedAnswerKey);
  const questionText = removeAnswerKeySection(preprocessed);
  const groupedQuestions = parseRangeQuestions(questionText, answerKey);
  const questionsByNumber = new Map(groupedQuestions.map((question) => [question.questionNumber, question]));

  parsePartSixQuestions(questionText, answerKey).forEach((question) => {
    if (!questionsByNumber.has(question.questionNumber)) {
      questionsByNumber.set(question.questionNumber, question);
    }
  });

  parseQuestionBlocks(questionText)
    .map((block) => {
      let blockText = block.lines.join("\n").trim();
      let extractedAnswer = "";
      let extractedExplanation = "";

      const inlineMatch = blockText.match(inlineAnswerExplanationPattern);
      if (inlineMatch) {
        extractedAnswer = inlineMatch[1].toUpperCase();
        extractedExplanation = cleanAnswerExplanation(inlineMatch[2]);
        blockText = blockText.slice(0, inlineMatch.index).trim();
      }

      const solvedBlock = parseSolvedQuestionBlock(blockText, block.part);
      const answers = hasRequiredAnswers(solvedBlock.answers, block.part)
        ? solvedBlock.answers
        : parseAnswers(blockText);
      const firstAnswerIndex = blockText.search(/(?:^|\s)(?:\(A\)|A[\).])\s+/);
      const readingPassage = solvedBlock.readingPassage || (firstAnswerIndex >= 0
        ? blockText.slice(0, firstAnswerIndex).trim()
        : blockText);

      const finalCorrectAnswer = extractedAnswer || solvedBlock.correctAnswer || getCorrectAnswer(answerKey, block.questionNumber);
      const finalExplanation = extractedExplanation || solvedBlock.explanation || getExplanation(answerKey, block.questionNumber);

      return {
        part: block.part,
        questionNumber: block.questionNumber,
        readingPassage,
        answers,
        correctAnswer: finalCorrectAnswer,
        explanation: finalExplanation
      };
    })
    .filter((question) => hasRequiredAnswers(question.answers, question.part))
    .forEach((question) => {
      if (!questionsByNumber.has(question.questionNumber)) {
        questionsByNumber.set(question.questionNumber, question);
      }
    });

  return Array.from(questionsByNumber.values())
    .sort((left, right) => left.questionNumber - right.questionNumber)
    .slice(0, 200);
};

const getPdfPathFromUrl = (pdfUrl) => {
  if (!pdfUrl) return null;

  const fileName = decodeURIComponent(pdfUrl.split("/uploads/").pop() || "");

  if (!fileName || fileName.includes("/") || fileName.includes("\\")) {
    return null;
  }

  return path.join(uploadDir, fileName);
};

const importQuestionsFromPdf = async ({ examId, pdfPath, answerPdfPath, userId, baseUrl = "" }) => {
  if (!pdfPath) {
    return { extractedCount: 0, createdCount: 0, skippedExisting: 0, message: "No PDF file found." };
  }

  const text = await extractTextFromPdf(pdfPath);
  const extractedImages = await extractImagesFromPdf(pdfPath, baseUrl);
  const answerText = answerPdfPath ? await extractTextFromPdf(answerPdfPath) : "";
  const answerKey = answerText ? parseAnswerDetails(answerText) : new Map();
  const embeddedAnswerKey = parseEmbeddedAnswerDetails(text);
  const combinedAnswerKey = mergeAnswerDetails(answerKey, parseAnswerDetails(text), embeddedAnswerKey);
  const parsedQuestions = attachPartOneImages(parseQuestionsFromText(text, answerKey), extractedImages, combinedAnswerKey);

  if (!parsedQuestions.length) {
    if (combinedAnswerKey.size) {
      const answerUpdates = Array.from(combinedAnswerKey.entries()).map(([questionNumber, answerEntry]) => {
        const normalizedEntry = normalizeAnswerEntry(answerEntry);
        const updatePayload = {
          correctAnswer: normalizedEntry?.answer || "A",
          updatedBy: userId
        };

        if (normalizedEntry?.explanation) {
          updatePayload.explanation = normalizedEntry.explanation;
        }

        return {
          updateOne: {
            filter: { exam: examId, questionNumber },
            update: { $set: updatePayload }
          }
        };
      });
      const result = answerUpdates.length ? await Question.bulkWrite(answerUpdates) : { modifiedCount: 0 };

      return {
        extractedCount: 0,
        createdCount: 0,
        skippedExisting: 0,
        updatedAnswers: result.modifiedCount || 0,
        answerKeyCount: combinedAnswerKey.size,
        message: `Updated ${result.modifiedCount || 0} answer key(s) from answer PDF.`
      };
    }

    const hasOptionMarkers = /\bA[\).]\s+[\s\S]*\bB[\).]\s+[\s\S]*\bC[\).]\s+[\s\S]*\bD[\).]\s+/i.test(text);

    return {
      extractedCount: 0,
      createdCount: 0,
      skippedExisting: 0,
      message: hasOptionMarkers
        ? "Could not detect complete questions with A/B/C/D answers from this PDF."
        : "This PDF does not expose readable question text. It may be a scanned/image PDF and needs OCR."
    };
  }

  const existingQuestions = await Question.find({ exam: examId }).select("questionNumber");
  const existingNumbers = new Set(existingQuestions.map((question) => Number(question.questionNumber)));
  const questionsToCreate = parsedQuestions
    .filter((question) => !existingNumbers.has(Number(question.questionNumber)))
    .map((question) => ({
      ...question,
      exam: examId,
      createdBy: userId,
      updatedBy: userId
    }));

  if (questionsToCreate.length) {
    await Question.insertMany(questionsToCreate, { ordered: false });
  }

  const answerUpdates = parsedQuestions
    .filter((question) => existingNumbers.has(Number(question.questionNumber)))
    .map((question) => ({
      updateOne: {
        filter: { exam: examId, questionNumber: question.questionNumber },
        update: {
          $set: {
            part: question.part,
            readingPassage: question.readingPassage,
            answers: question.answers,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            ...(question.imageUrl ? { imageUrl: question.imageUrl } : {}),
            ...(question.imagePage ? { imagePage: question.imagePage } : {}),
            updatedBy: userId
          }
        }
      }
    }));
  const answerUpdateResult = answerUpdates.length
    ? await Question.bulkWrite(answerUpdates)
    : { modifiedCount: 0 };

  return {
    extractedCount: parsedQuestions.length,
    createdCount: questionsToCreate.length,
    skippedExisting: parsedQuestions.length - questionsToCreate.length,
    updatedAnswers: answerUpdateResult.modifiedCount || 0,
    answerKeyCount: combinedAnswerKey.size,
    message: `Imported ${questionsToCreate.length} new question(s) and updated ${answerUpdateResult.modifiedCount || 0} existing question(s).`
  };
};

module.exports = {
  getPdfPathFromUrl,
  importQuestionsFromPdf,
  parseQuestionsFromText
};
