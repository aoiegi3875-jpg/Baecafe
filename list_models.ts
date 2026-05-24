import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function list() {
  try {
    const res = await ai.models.list();
    for (const m of res.models) {
      console.log(m.name);
    }
  } catch(e) {
    console.error(e);
  }
}
list();
