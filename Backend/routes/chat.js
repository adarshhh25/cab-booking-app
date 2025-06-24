import express from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { validateChatRequest } from '../middleware/validation.js';
import { ConversationManager } from '../services/conversationManager.js';
import { BookingService } from '../services/bookingService.js';
import { PriceCalculator } from '../services/priceCalculator.js';

const router = express.Router();
dotenv.config();

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Initialize services
const conversationManager = new ConversationManager();
const bookingService = new BookingService();
const priceCalculator = new PriceCalculator();

// Chat endpoint for voice conversations
router.post('/', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    // Generate userId if not provided
    const sessionId = userId || uuidv4();
    
    // Get conversation history
    const conversation = conversationManager.getConversation(sessionId);
    
    // Add user message to history
    conversation.addMessage('user', message);
    
    // Prepare system prompt for Groq
    const systemPrompt = `You are a helpful cab booking assistant for a voice-enabled mobile app. Your goal is to help users book a cab through natural conversation.

Required booking information:
- Pickup location (specific address or landmark)
- Destination (specific address or landmark)
- Pickup time (now, specific time, or relative time like "in 30 minutes")
- Number of passengers (default to 1 if not specified)
- Travel preference (cheapest, fastest, or luxurious - default to cheapest)
- Special requirements (wheelchair accessible, child seat, etc. - optional)

CRITICAL: Extract ALL available information from each user message. Users often provide multiple details in one voice input.

Location Extraction Examples:
- "I want to go to Pune from Andheri West metro station" → pickup: "Andheri West metro station", destination: "Pune"
- "Book a cab from Malad to BKC" → pickup: "Malad", destination: "BKC"
- "Take me from home to airport" → pickup: "home", destination: "airport"
- "I need to travel from Mumbai Central to Thane" → pickup: "Mumbai Central", destination: "Thane"

Time Extraction Examples:
- "in 30 minutes" → pickupTime: "in 30 minutes"
- "at 5 PM" → pickupTime: "at 5 PM"
- "now" or "right now" → pickupTime: "now"
- "tomorrow morning" → pickupTime: "tomorrow morning"

Conversation flow:
1. Extract ALL available information from the user's message
2. Acknowledge what you understood and confirm the details
3. Ask only for missing required information
4. Once you have pickup, destination, and time, provide price estimate
5. Ask for confirmation of all details
6. If confirmed, generate booking confirmation

Guidelines:
- ALWAYS extract multiple pieces of information when provided in one message
- Acknowledge what you understood: "I see you want to travel from [pickup] to [destination]"
- Only ask for information that is genuinely missing
- Handle voice input variations and common abbreviations
- Be intelligent about location recognition (BKC = Bandra Kurla Complex, etc.)

Current conversation state: ${conversation.getState()}
Missing information: ${conversation.getMissingInfo().join(', ') || 'None'}
Current booking info: ${JSON.stringify(conversation.getBookingInfo())}

Respond in JSON format:
{
  "response": "Your natural conversational response",
  "bookingInfo": {
    "pickupLocation": "extracted location or null",
    "destination": "extracted destination or null", 
    "pickupTime": "extracted time or null",
    "passengers": "number or null",
    "travelPreference": "cheapest/fastest/luxurious or null",
    "specialRequirements": "requirements or null"
  },
  "conversationState": "greeting/collecting/confirming/confirmed/cancelled",
  "missingInfo": ["array of missing required fields"],
  "estimatedPrice": "price if locations available",
  "needsConfirmation": boolean,
  "suggestions": ["helpful suggestions if needed"]
}`;

    // Get conversation messages for Groq (remove timestamps)
    const conversationMessages = conversation.getMessages().map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationMessages
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    // Parse response
    const responseContent = completion.choices[0].message.content;
    let parsedResponse;
    
    try {
      parsedResponse = JSON.parse(responseContent);
    } catch (error) {
      console.error('Failed to parse Groq response:', error);
      throw new Error('Invalid response format from AI');
    }

    // Add assistant response to conversation
    conversation.addMessage('assistant', parsedResponse.response);
    
    // Update conversation state
    conversation.updateBookingInfo(parsedResponse.bookingInfo);
    conversation.setState(parsedResponse.conversationState);

    // Calculate price if we have enough information
    if (parsedResponse.bookingInfo.pickupLocation && 
        parsedResponse.bookingInfo.destination) {
      
      const priceEstimate = priceCalculator.calculatePrice(
        parsedResponse.bookingInfo.pickupLocation,
        parsedResponse.bookingInfo.destination,
        parsedResponse.bookingInfo.travelPreference || 'cheapest'
      );
      
      parsedResponse.estimatedPrice = `₹${priceEstimate.toFixed(0)}`;
    }

    // Handle booking confirmation
    if (parsedResponse.conversationState === 'confirmed') {
      const bookingDetails = await bookingService.createBooking({
        ...parsedResponse.bookingInfo,
        userId: sessionId,
        estimatedPrice: parsedResponse.estimatedPrice
      });
      
      parsedResponse.confirmation = bookingDetails;
      conversation.setBookingConfirmed(bookingDetails);
    }

    // Prepare response
    const response = {
      ...parsedResponse,
      sessionId,
      timestamp: new Date().toISOString()
    };

    res.json(response);

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Reset conversation endpoint
router.post('/reset', (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    conversationManager.resetConversation(userId);
    
    res.json({
      success: true,
      message: 'Conversation reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({
      error: 'Failed to reset conversation',
      message: error.message
    });
  }
});

// Get conversation history endpoint
router.get('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const conversation = conversationManager.getConversation(userId);
    
    res.json({
      history: conversation.getMessages(),
      bookingInfo: conversation.getBookingInfo(),
      state: conversation.getState(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      error: 'Failed to get conversation history',
      message: error.message
    });
  }
});

// Voice-specific endpoint for better integration
router.post('/voice', validateChatRequest, async (req, res) => {
  try {
    const { message, userId, isVoiceInput = true } = req.body;

    // Process voice input with additional context
    const enhancedMessage = isVoiceInput ?
      `[Voice Input] ${message}` : message;

    // Forward to main chat endpoint logic
    req.body.message = enhancedMessage;

    // Call the main chat logic (reuse the above logic)
    // For brevity, we'll redirect to the main endpoint
    const chatResponse = await processChatMessage(req.body);

    // Add voice-specific enhancements
    chatResponse.isVoiceResponse = true;
    chatResponse.speechText = chatResponse.response;

    res.json(chatResponse);

  } catch (error) {
    console.error('Voice chat error:', error);
    res.status(500).json({
      error: 'Failed to process voice message',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to process chat messages (extracted for reuse)
async function processChatMessage(body) {
  // This would contain the main chat logic from above
  // For now, return a placeholder
  return {
    response: "Voice processing implemented",
    sessionId: body.userId,
    timestamp: new Date().toISOString()
  };
}

export default router;
