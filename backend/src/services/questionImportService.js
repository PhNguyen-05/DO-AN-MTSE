const fs = require("fs/promises");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const Question = require("../models/Question");

const uploadDir = path.join(__dirname, "..", "..", "uploads");
const answerKeys = ["A", "B", "C", "D"];

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

const parseAnswerKey = (text) => {
  const answers = new Map();
  const keySectionMatch = text.match(/(?:answer\s*key|answers|đáp\s*án|dap\s*an)([\s\S]*)/i);
  const keyText = keySectionMatch?.[1] || "";

  if (!keyText) return answers;

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

const parseAnswers = (blockText) => {
  const answers = {};
  const normalized = blockText.replace(/\n+/g, " ");
  const optionPattern = /\b([ABCD])[\).]\s*([\s\S]*?)(?=\s+\b[ABCD][\).]\s+|$)/g;
  let match = optionPattern.exec(normalized);

  while (match) {
    const key = match[1].toUpperCase();
    const value = match[2].trim();

    if (answerKeys.includes(key) && value) {
      answers[key] = value;
    }

    match = optionPattern.exec(normalized);
  }

  return answers;
};

const parseQuestionBlocks = (text) => {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const blocks = [];
  let currentPart = null;
  let currentBlock = null;

  for (const line of lines) {
    const partMatch = line.match(/\bpart\s*([1-7])\b/i);

    if (partMatch) {
      currentPart = Number(partMatch[1]);
      continue;
    }

    const questionMatch = line.match(/^(\d{1,3})[\).]\s*(.*)$/);

    if (questionMatch) {
      if (currentBlock) blocks.push(currentBlock);

      const questionNumber = Number(questionMatch[1]);
      currentBlock = {
        questionNumber,
        part: currentPart || inferPartFromQuestionNumber(questionNumber),
        lines: [questionMatch[2]]
      };
      continue;
    }

    if (currentBlock) {
      currentBlock.lines.push(line);
    }
  }

  if (currentBlock) blocks.push(currentBlock);

  return blocks.filter((block) => block.questionNumber >= 1 && block.questionNumber <= 200);
};

const parseQuestionsFromText = (text) => {
  const answerKey = parseAnswerKey(text);

  return parseQuestionBlocks(text)
    .map((block) => {
      const blockText = block.lines.join("\n").trim();
      const answers = parseAnswers(blockText);
      const firstAnswerIndex = blockText.search(/\bA[\).]\s+/);
      const readingPassage = firstAnswerIndex >= 0
        ? blockText.slice(0, firstAnswerIndex).trim()
        : blockText;

      return {
        part: block.part,
        questionNumber: block.questionNumber,
        readingPassage,
        answers,
        correctAnswer: answerKey.get(block.questionNumber) || "A",
        explanation: ""
      };
    })
    .filter((question) => answerKeys.every((key) => question.answers[key]?.trim()))
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

const importQuestionsFromPdf = async ({ examId, pdfPath, userId }) => {
  if (!pdfPath) {
    return { extractedCount: 0, createdCount: 0, skippedExisting: 0, message: "No PDF file found." };
  }

  const text = await extractTextFromPdf(pdfPath);
  const parsedQuestions = parseQuestionsFromText(text);

  if (!parsedQuestions.length) {
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

  return {
    extractedCount: parsedQuestions.length,
    createdCount: questionsToCreate.length,
    skippedExisting: parsedQuestions.length - questionsToCreate.length,
    message: `Imported ${questionsToCreate.length} question(s) from PDF.`
  };
};

module.exports = {
  getPdfPathFromUrl,
  importQuestionsFromPdf,
  parseQuestionsFromText
};
