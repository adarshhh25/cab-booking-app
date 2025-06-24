// services/voiceService.ts
import Voice from '@react-native-voice/voice';
import { ApiService } from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class VoiceService {
  private static instance: VoiceService;
  private isInitialized = false;
  private apiService: ApiService;
  private userId: string | null = null;
  private speechProcessed = false;

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  constructor() {
    this.apiService = ApiService.getInstance();
    this.initializeUserId();
  }

  private async initializeUserId() {
    try {
      let userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        // Generate a proper UUID v4 format
        userId = this.generateUUID();
        await AsyncStorage.setItem('userId', userId);
      }
      this.userId = userId;
      console.log('🆔 User ID initialized:', userId);
    } catch (error) {
      console.error('Error initializing user ID:', error);
      this.userId = this.generateUUID();
    }
  }

  private generateUUID(): string {
    // Generate UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing Voice service...');

      // Check if Voice module is available
      if (!Voice) {
        throw new Error('Voice module is not available');
      }

      // Check if Voice is available on device
      if (typeof Voice.isAvailable === 'function') {
        try {
          const isAvailable = await Voice.isAvailable();
          if (!isAvailable) {
            console.warn('Voice recognition not available on this device');
          }
        } catch (error) {
          console.warn('Could not check voice availability:', error);
        }
      }

      this.isInitialized = true;
      console.log('Voice service initialized successfully');
    } catch (error) {
      console.error('Voice initialization error:', error);
      throw error;
    }
  }

  async startListening(onSpeechResult: (text: string) => void, onError: (error: string) => void): Promise<void> {
    try {
      console.log('Starting voice listening...');

      // Reset speech processing flag for new session
      this.speechProcessed = false;

      if (!this.isInitialized) {
        await this.initialize();
      }

      // Verify Voice methods exist
      if (!Voice || typeof Voice.start !== 'function') {
        throw new Error('Voice.start method is not available');
      }

      // Set up event listeners with backend integration
      Voice.onSpeechResults = async (e: any) => {
        try {
          const spokenText = e?.value?.[0] || '';
          console.log('🎤 Speech result:', spokenText);

          if (spokenText) {
            // Mark speech as successfully processed
            this.speechProcessed = true;

            // FIRST: Display the actual spoken text immediately
            onSpeechResult(spokenText);

            // THEN: Send to backend for AI processing (this will be handled by the HomeScreen)
            // The HomeScreen will handle the API call and display the AI response
          }
        } catch (error) {
          console.error('Error processing speech results:', error);
        }
      };

      Voice.onSpeechError = (e: any) => {
        console.error('Speech error event:', e);

        // Filter out non-critical errors that don't affect functionality
        const errorCode = e?.error?.code || e?.code;
        const errorMessage = e?.error?.message || e?.message || 'Speech recognition error';

        // Common non-critical error codes that can be ignored
        const ignorableErrors = [
          '11', // "Didn't understand" - but speech was actually captured
          'ERROR_NO_MATCH',
          'ERROR_SPEECH_TIMEOUT',
          'ERROR_INSUFFICIENT_PERMISSIONS' // If already handled elsewhere
        ];

        // Check if this is an ignorable error OR if speech was already processed successfully
        const isIgnorableError = ignorableErrors.some(code =>
          errorCode === code ||
          errorMessage.includes(code) ||
          errorMessage.includes('Didn\'t understand')
        );

        if (isIgnorableError || this.speechProcessed) {
          console.log('🔇 Ignoring non-critical voice error:', errorMessage, 'Speech processed:', this.speechProcessed);
          // Don't call onError for these cases
          return;
        }

        // Only show error popup for genuine errors
        onError(errorMessage);
      };

      Voice.onSpeechEnd = () => {
        console.log('Speech recognition ended');
      };

      Voice.onSpeechStart = () => {
        console.log('Speech recognition started');
      };

      // Start voice recognition
      console.log('Calling Voice.start...');
      await Voice.start('en-US');
      console.log('Voice.start completed successfully');

    } catch (error) {
      console.error('Start listening error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start voice recognition';
      onError(errorMessage);
    }
  }

  private async speakResponse(text: string) {
    try {
      const Tts = require('react-native-tts');
      Tts.speak(text);
    } catch (error) {
      console.error('TTS error:', error);
    }
  }

  async stopListening(): Promise<void> {
    try {
      console.log('Stopping voice listening...');
      if (Voice && typeof Voice.stop === 'function') {
        await Voice.stop();
        console.log('Voice stopped successfully');
      }
    } catch (error) {
      console.error('Stop listening error:', error);
    }
  }

  async destroy(): Promise<void> {
    try {
      console.log('Destroying voice service...');
      if (Voice) {
        if (typeof Voice.destroy === 'function') {
          await Voice.destroy();
        }
        if (typeof Voice.removeAllListeners === 'function') {
          Voice.removeAllListeners();
        }
      }
      this.isInitialized = false;
      console.log('Voice service destroyed');
    } catch (error) {
      console.error('Destroy voice error:', error);
      this.isInitialized = false;
    }
  }

  // Get user ID for API calls
  getUserId(): string | null {
    return this.userId;
  }

  // Reset conversation
  async resetConversation(): Promise<void> {
    try {
      if (this.userId) {
        await this.apiService.resetConversation(this.userId);
      }
    } catch (error) {
      console.error('Error resetting conversation:', error);
    }
  }
}

export default VoiceService;
