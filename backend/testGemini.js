const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite-preview-02-05',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro'
];

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("No API key");
    return;
  }
  console.log("Using API key:", apiKey.substring(0, 15) + "...");
  const ai = new GoogleGenAI({ apiKey });

  for (const model of MODELS) {
    try {
      console.log(`Testing model: ${model}...`);
      const response = await ai.models.generateContent({ model, contents: "Hello, testing 123." });
      console.log(`Success with ${model}:`, response.text);
      return;
    } catch (e) {
      console.log(`Failed ${model}:`, e.message);
    }
  }
}

testGemini();
