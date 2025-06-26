import Tts from 'react-native-tts';
import { Alert, Platform } from 'react-native';

export class TTSService {
  private static instance: TTSService;
  private isInitialized = false;
  private availableVoices: any[] = [];
  private currentVoice: any = null;

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🔊 Initializing TTS Service...');
      
      // Step 1: Check if TTS is available
      const isAvailable = await this.checkTTSAvailability();
      if (!isAvailable) {
        console.error('❌ TTS not available on this device');
        return false;
      }

      // Step 2: Get available voices
      await this.loadAvailableVoices();

      // Step 3: Set up event listeners
      this.setupEventListeners();

      // Step 4: Configure TTS settings
      await this.configureTTS();

      // Step 5: Test TTS functionality
      const testResult = await this.performInitialTest();
      
      this.isInitialized = testResult;
      console.log(testResult ? '✅ TTS Service initialized successfully' : '❌ TTS Service initialization failed');
      
      return testResult;
    } catch (error) {
      console.error('❌ TTS initialization error:', error);
      return false;
    }
  }

  private async checkTTSAvailability(): Promise<boolean> {
    try {
      // Try to get voices - if this fails, TTS is not available
      const voices = await Tts.voices();
      console.log('✅ TTS is available, found', voices.length, 'voices');
      return voices.length > 0;
    } catch (error) {
      console.error('❌ TTS availability check failed:', error);
      return false;
    }
  }

  private async loadAvailableVoices(): Promise<void> {
    try {
      this.availableVoices = await Tts.voices();
      console.log('📢 Available voices:', this.availableVoices.length);
      
      // Log first few voices for debugging
      this.availableVoices.slice(0, 3).forEach((voice, index) => {
        console.log(`Voice ${index + 1}:`, {
          id: voice.id,
          name: voice.name,
          language: voice.language,
          quality: voice.quality,
          networkConnectionRequired: voice.networkConnectionRequired
        });
      });

      // Find the best English voice
      this.currentVoice = this.findBestEnglishVoice();
      if (this.currentVoice) {
        console.log('🎯 Selected voice:', this.currentVoice.name, '(', this.currentVoice.language, ')');
      }
    } catch (error) {
      console.error('❌ Failed to load voices:', error);
    }
  }

  private findBestEnglishVoice(): any {
    // Priority order for voice selection
    const priorities = [
      (voice: any) => voice.language === 'en-US' && !voice.networkConnectionRequired,
      (voice: any) => voice.language.startsWith('en-') && !voice.networkConnectionRequired,
      (voice: any) => voice.language === 'en-US',
      (voice: any) => voice.language.startsWith('en-'),
      (voice: any) => !voice.networkConnectionRequired,
      (voice: any) => true // fallback to any voice
    ];

    for (const priority of priorities) {
      const voice = this.availableVoices.find(priority);
      if (voice) return voice;
    }

    return this.availableVoices[0] || null;
  }

  private setupEventListeners(): void {
    Tts.addEventListener('tts-start', (event) => {
      console.log('🔊 TTS Started:', event);
    });

    Tts.addEventListener('tts-progress', (event) => {
      console.log('📈 TTS Progress:', event);
    });

    Tts.addEventListener('tts-finish', (event) => {
      console.log('✅ TTS Finished:', event);
    });

    Tts.addEventListener('tts-cancel', (event) => {
      console.log('⏹️ TTS Cancelled:', event);
    });

    Tts.addEventListener('tts-error', (event) => {
      console.error('❌ TTS Error Event:', event);
    });
  }

  private async configureTTS(): Promise<void> {
    try {
      // Set language
      await Tts.setDefaultLanguage('en-US');
      console.log('✅ Language set to en-US');

      // Set speech rate (0.1 to 1.0)
      await Tts.setDefaultRate(0.5);
      console.log('✅ Speech rate set to 0.5');

      // Set pitch (0.5 to 2.0)
      await Tts.setDefaultPitch(1.0);
      console.log('✅ Pitch set to 1.0');

      // Set voice if we found a good one
      if (this.currentVoice) {
        await Tts.setDefaultVoice(this.currentVoice.id);
        console.log('✅ Voice set to:', this.currentVoice.name);
      }

    } catch (error) {
      console.error('❌ TTS configuration error:', error);
    }
  }

  private async performInitialTest(): Promise<boolean> {
    try {
      console.log('🧪 Performing TTS test...');
      
      // Test with a simple phrase
      await Tts.speak('Test');
      
      // Wait a moment for the test to complete
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ TTS test completed');
      return true;
    } catch (error) {
      console.error('❌ TTS test failed:', error);
      return false;
    }
  }

  async speak(text: string, options?: any): Promise<boolean> {
    if (!text || text.trim().length === 0) {
      console.warn('⚠️ Empty text provided to TTS');
      return false;
    }

    try {
      console.log('🔊 Speaking:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));

      // Always try to initialize if not already done
      if (!this.isInitialized) {
        console.log('🔄 TTS not initialized, initializing now...');
        await this.initialize();
      }

      // Stop any ongoing speech first
      try {
        await Tts.stop();
        await new Promise<void>(resolve => setTimeout(resolve, 200));
      } catch (stopError) {
        console.log('⚠️ Stop TTS warning:', stopError);
      }

      // Try multiple approaches for maximum compatibility
      const approaches = [
        // Approach 1: Simple speak (most compatible)
        async () => {
          console.log('🔊 Trying simple TTS speak...');
          await Tts.speak(text);
        },

        // Approach 2: With rate setting
        async () => {
          console.log('🔊 Trying TTS with rate setting...');
          await Tts.setDefaultRate(0.5);
          await Tts.speak(text);
        },

        // Approach 3: With full configuration
        async () => {
          console.log('🔊 Trying TTS with full configuration...');
          await Tts.setDefaultRate(0.5);
          await Tts.setDefaultPitch(1.0);
          await Tts.setDefaultLanguage('en-US');
          await Tts.speak(text);
        },

        // Approach 4: Force with options (cast to any to bypass TypeScript)
        async () => {
          console.log('🔊 Trying TTS with forced options...');
          const ttsOptions: any = {
            androidParams: {
              KEY_PARAM_PAN: 0,
              KEY_PARAM_VOLUME: 1.0,
              KEY_PARAM_STREAM: 'STREAM_MUSIC',
            },
            rate: 0.5,
            pitch: 1.0,
            ...options
          };
          await (Tts.speak as any)(text, ttsOptions);
        }
      ];

      for (let i = 0; i < approaches.length; i++) {
        try {
          console.log(`🔊 Trying TTS approach ${i + 1}...`);
          await approaches[i]();
          console.log(`✅ TTS approach ${i + 1} succeeded`);
          return true;
        } catch (error) {
          console.log(`⚠️ TTS approach ${i + 1} failed:`, error);
          if (i === approaches.length - 1) {
            throw error; // Re-throw the last error
          }
          // Wait a bit before trying next approach
          await new Promise<void>(resolve => setTimeout(resolve, 300));
        }
      }

      return false;
    } catch (error) {
      console.error('❌ All TTS approaches failed:', error);

      // Final diagnostic attempt
      try {
        const diagnostic = await this.runFullDiagnostic();
        console.log('🔍 TTS Diagnostic:', diagnostic);
      } catch (diagError) {
        console.error('❌ Diagnostic failed:', diagError);
      }

      return false;
    }
  }

  async stop(): Promise<void> {
    try {
      await Tts.stop();
      console.log('⏹️ TTS stopped');
    } catch (error) {
      console.error('❌ TTS stop error:', error);
    }
  }

  async getDiagnosticInfo(): Promise<any> {
    return {
      isInitialized: this.isInitialized,
      availableVoicesCount: this.availableVoices.length,
      currentVoice: this.currentVoice,
      platform: Platform.OS,
      voices: this.availableVoices.slice(0, 5) // First 5 voices for debugging
    };
  }

  async runFullDiagnostic(): Promise<string> {
    const results = [];

    try {
      // Test 1: Check availability
      const isAvailable = await this.checkTTSAvailability();
      results.push(`TTS Available: ${isAvailable ? '✅' : '❌'}`);

      if (!isAvailable) {
        results.push('❌ NO TTS ENGINE FOUND');
        results.push('📱 Install Google Text-to-speech from Play Store');
        return results.join('\n');
      }

      // Test 2: Check voices
      await this.loadAvailableVoices();
      results.push(`Voices Found: ${this.availableVoices.length}`);

      if (this.availableVoices.length === 0) {
        results.push('❌ NO VOICES AVAILABLE');
        results.push('📥 Download voice data in TTS settings');
        return results.join('\n');
      }

      // Test 3: Check for English voices
      const englishVoices = this.availableVoices.filter(v => v.language.startsWith('en'));
      results.push(`English Voices: ${englishVoices.length}`);

      // Test 4: Check current voice
      if (this.currentVoice) {
        results.push(`Selected Voice: ${this.currentVoice.name}`);
        results.push(`Voice Language: ${this.currentVoice.language}`);
        results.push(`Network Required: ${this.currentVoice.networkConnectionRequired ? 'Yes' : 'No'}`);
      } else {
        results.push('❌ NO VOICE SELECTED');
      }

      // Test 5: Test speak function
      const speakResult = await this.speak('Test', { androidParams: { KEY_PARAM_VOLUME: 1.0 } });
      results.push(`Speak Function: ${speakResult ? '✅' : '❌'}`);

      // Test 6: Platform info
      results.push(`Platform: ${Platform.OS}`);

      return results.join('\n');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push(`❌ Diagnostic Error: ${errorMessage}`);
      results.push('🔧 Check TTS engine installation');
      return results.join('\n');
    }
  }

  destroy(): void {
    try {
      Tts.removeAllListeners();
      this.isInitialized = false;
      console.log('🧹 TTS Service destroyed');
    } catch (error) {
      console.error('❌ TTS destroy error:', error);
    }
  }
}
