import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Hello',
    });
    console.log("Success:", response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
