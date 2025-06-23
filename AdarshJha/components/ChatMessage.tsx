// (Already provided by you; slightly enhanced for context)

// services/GeminiService.ts
import axios from 'axios';

const GEMINI_API_KEY = 'YOUR_KEY';
const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

let chatHistory: string[] = [];

export const askGemini = async (message: string): Promise<string> => {
  chatHistory.push(`User: ${message}`);

  try {
    const res = await axios.post(
      `${endpoint}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: chatHistory.join('\n') }] }],
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    chatHistory.push(`Assistant: ${reply}`);
    return reply;
  } catch (error) {
    console.error('Gemini Error:', error);
    return 'Error getting response from Gemini';
  }
};