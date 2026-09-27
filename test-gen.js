import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
const ai = new GoogleGenAI({  apiKey: process.env.GEMINI_API_KEY,  httpOptions: {    headers: {      'User-Agent': 'aistudio-build',    }  }});
async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "test",
    });
    console.log(response.text);
  } catch (e) {
    console.error(e);
  }
}
test();
