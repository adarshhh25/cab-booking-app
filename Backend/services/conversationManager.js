import { v4 as uuidv4 } from 'uuid';

// In-memory conversation storage (use database in production)
const conversations = new Map();

export class ConversationManager {
  constructor() {
    this.conversations = conversations;
  }

  getConversation(userId) {
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, new Conversation(userId));
    }
    return this.conversations.get(userId);
  }

  resetConversation(userId) {
    this.conversations.delete(userId);
  }

  getAllConversations() {
    return Array.from(this.conversations.values());
  }

  cleanupOldConversations(maxAgeHours = 24) {
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    
    for (const [userId, conversation] of this.conversations.entries()) {
      if (conversation.lastActivity < cutoffTime) {
        this.conversations.delete(userId);
      }
    }
  }
}

class Conversation {
  constructor(userId) {
    this.userId = userId;
    this.messages = [];
    this.bookingInfo = {
      pickupLocation: null,
      destination: null,
      pickupTime: null,
      passengers: null,
      travelPreference: null,
      specialRequirements: null
    };
    this.state = 'greeting'; // greeting, collecting, confirming, confirmed, cancelled
    this.createdAt = Date.now();
    this.lastActivity = Date.now();
    this.bookingConfirmed = null;
  }

  addMessage(role, content) {
    this.messages.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
    this.lastActivity = Date.now();
  }

  getMessages() {
    return this.messages;
  }

  updateBookingInfo(newInfo) {
    // Merge new information with existing booking info
    Object.keys(newInfo).forEach(key => {
      if (newInfo[key] !== null && newInfo[key] !== undefined) {
        this.bookingInfo[key] = newInfo[key];
      }
    });
    this.lastActivity = Date.now();
  }

  getBookingInfo() {
    return this.bookingInfo;
  }

  setState(newState) {
    this.state = newState;
    this.lastActivity = Date.now();
  }

  getState() {
    return this.state;
  }

  getMissingInfo() {
    const required = ['pickupLocation', 'destination', 'pickupTime'];
    const missing = [];

    required.forEach(field => {
      if (!this.bookingInfo[field]) {
        missing.push(field);
      }
    });

    return missing;
  }

  isReadyForConfirmation() {
    return this.getMissingInfo().length === 0;
  }

  setBookingConfirmed(confirmationDetails) {
    this.bookingConfirmed = confirmationDetails;
    this.state = 'confirmed';
    this.lastActivity = Date.now();
  }

  getBookingConfirmation() {
    return this.bookingConfirmed;
  }

  // Get conversation summary for analytics
  getSummary() {
    return {
      userId: this.userId,
      messageCount: this.messages.length,
      state: this.state,
      bookingInfo: this.bookingInfo,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      duration: this.lastActivity - this.createdAt,
      isCompleted: this.state === 'confirmed' || this.state === 'cancelled'
    };
  }

  // Export conversation for backup/analysis
  export() {
    return {
      userId: this.userId,
      messages: this.messages,
      bookingInfo: this.bookingInfo,
      state: this.state,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      bookingConfirmed: this.bookingConfirmed
    };
  }

  // Import conversation from backup
  import(data) {
    this.messages = data.messages || [];
    this.bookingInfo = data.bookingInfo || {};
    this.state = data.state || 'greeting';
    this.createdAt = data.createdAt || Date.now();
    this.lastActivity = data.lastActivity || Date.now();
    this.bookingConfirmed = data.bookingConfirmed || null;
  }
}
