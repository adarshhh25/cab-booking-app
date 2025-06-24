// services/apiService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatResponse {
  response: string;
  bookingInfo: {
    pickupLocation: string | null;
    destination: string | null;
    pickupTime: string | null;
    passengers: number | null;
    travelPreference: string | null;
    specialRequirements: string | null;
  };
  conversationState: string;
  missingInfo: string[];
  estimatedPrice?: string;
  needsConfirmation?: boolean;
  suggestions?: string[];
  confirmation?: any;
  sessionId: string;
  timestamp: string;
}

interface BookingData {
  userId: string;
  pickupLocation: string;
  destination: string;
  pickupTime: string;
  passengers?: number;
  travelPreference?: string;
  specialRequirements?: string;
  estimatedPrice?: string;
}

export class ApiService {
  private static instance: ApiService;
  private baseUrl: string;
  private timeout: number = 10000; // 10 seconds

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  constructor() {
    // Use different URLs for development and production
    // Try multiple URLs for Android emulator compatibility
    this.baseUrl = __DEV__
      ? 'http://10.0.2.2:3000/api'  // Android emulator
      : 'https://your-production-api.com/api'; // Replace with your production URL

    console.log('🔗 API Base URL:', this.baseUrl);
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: this.timeout,
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...finalOptions,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ API Response: ${response.status}`, data);
      
      return data;
    } catch (error) {
      console.error(`❌ API Error: ${url}`, error);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your internet connection');
      }
      
      if (error.message.includes('Network request failed')) {
        throw new Error('Network error - please check your internet connection');
      }
      
      throw error;
    }
  }

  async sendChatMessage(message: string, userId?: string): Promise<ChatResponse> {
    return this.makeRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        userId,
        isVoiceInput: true,
      }),
    });
  }

  async sendVoiceMessage(message: string, userId?: string): Promise<ChatResponse> {
    return this.makeRequest('/chat/voice', {
      method: 'POST',
      body: JSON.stringify({
        message,
        userId,
        isVoiceInput: true,
      }),
    });
  }

  async resetConversation(userId: string): Promise<{ success: boolean; message: string }> {
    return this.makeRequest('/chat/reset', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async getConversationHistory(userId: string): Promise<any> {
    return this.makeRequest(`/chat/history/${userId}`);
  }

  async createBooking(bookingData: BookingData): Promise<any> {
    return this.makeRequest('/booking', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBooking(bookingId: string): Promise<any> {
    return this.makeRequest(`/booking/${bookingId}`);
  }

  async getUserBookings(userId: string): Promise<any> {
    return this.makeRequest(`/booking/user/${userId}`);
  }

  async updateBookingStatus(bookingId: string, status: string, reason?: string): Promise<any> {
    return this.makeRequest(`/booking/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<any> {
    return this.makeRequest(`/booking/${bookingId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  }

  async getBookingStatus(bookingId: string): Promise<any> {
    return this.makeRequest(`/booking/${bookingId}/status`);
  }

  async checkHealth(): Promise<any> {
    return this.makeRequest('/health');
  }

  async checkDetailedHealth(): Promise<any> {
    return this.makeRequest('/health/detailed');
  }

  // Utility methods
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  setTimeout(timeout: number) {
    this.timeout = timeout;
  }

  // Cache management
  async clearCache() {
    try {
      await AsyncStorage.multiRemove(['conversations', 'bookings', 'userPreferences']);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Offline support (basic)
  async cacheResponse(key: string, data: any) {
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error caching response:', error);
    }
  }

  async getCachedResponse(key: string, maxAge: number = 300000): Promise<any> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < maxAge) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error getting cached response:', error);
    }
    return null;
  }
}
