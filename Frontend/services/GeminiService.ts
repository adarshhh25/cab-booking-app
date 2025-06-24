// services/GeminiService.ts
import axios from 'axios';
import { ENV } from '../config/env';

// Use environment variables from config
const GEMINI_API_KEY = ENV.GEMINI_API_KEY;
const endpoint = ENV.GEMINI_ENDPOINT;

// Structured conversation history with proper typing
interface Message {
  role: 'user' | 'model';
  content: string;
}

let conversationHistory: Message[] = [];

export const askGemini = async (userMessage: string): Promise<string> => {
  // Add user message to history
  conversationHistory.push({ role: 'user', content: userMessage });
  
  try {
    // Log the API request for debugging
    console.log(`Calling Gemini API with key: ${GEMINI_API_KEY ? 'Available' : 'Missing'}`);
    console.log(`Using endpoint: ${endpoint}`);
    
    const res = await axios.post(
      `${endpoint}?key=${GEMINI_API_KEY}`,
      {
        contents: conversationHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        }))
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const reply = res.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    
    // Add assistant response to history
    conversationHistory.push({ role: 'model', content: reply });
    
    console.log('Conversation history:', conversationHistory);
    return reply;
  } catch (error) {
    // Improved error logging
    if (axios.isAxiosError(error)) {
      console.error('Gemini API error:', error.message);
      console.error('Response data:', error.response?.data);
      console.error('Status code:', error.response?.status);
    } else {
      console.error('Unexpected error:', error);
    }
    return 'Error getting response from Gemini. Please check your API key and network connection.';
  }
};

// Add function to reset conversation
export const resetConversation = (): void => {
  conversationHistory = [];
  console.log('Conversation history reset');
};

// Get current conversation for UI display
export const getConversationHistory = (): Message[] => {
  return [...conversationHistory];
};
