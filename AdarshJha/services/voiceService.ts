// // services/voiceService.ts
// import Voice from '@react-native-voice/voice';

// class VoiceService {
//   private static instance: VoiceService;
//   private isInitialized = false;

//   static getInstance(): VoiceService {
//     if (!VoiceService.instance) {
//       VoiceService.instance = new VoiceService();
//     }
//     return VoiceService.instance;
//   }

//   async initialize(): Promise<void> {
//     if (this.isInitialized) return;

//     try {
//       console.log('Initializing Voice service...');

//       // Check if Voice module is available
//       if (!Voice) {
//         throw new Error('Voice module is not available');
//       }

//       // Check if Voice is available on device
//       if (typeof Voice.isAvailable === 'function') {
//         try {
//           const isAvailable = await Voice.isAvailable();
//           if (!isAvailable) {
//             console.warn('Voice recognition not available on this device');
//           }
//         } catch (error) {
//           console.warn('Could not check voice availability:', error);
//         }
//       }

//       this.isInitialized = true;
//       console.log('Voice service initialized successfully');
//     } catch (error) {
//       console.error('Voice initialization error:', error);
//       throw error;
//     }
//   }

//   async startListening(onSpeechResult: (text: string) => void, onError: (error: string) => void): Promise<void> {
//     try {
//       console.log('Starting voice listening...');

//       if (!this.isInitialized) {
//         await this.initialize();
//       }

//       // Verify Voice methods exist
//       if (!Voice || typeof Voice.start !== 'function') {
//         throw new Error('Voice.start method is not available');
//       }

//       // Set up event listeners with proper error handling
//       Voice.onSpeechResults = (e: any) => {
//         try {
//           const spokenText = e?.value?.[0] || '';
//           console.log('🎤 Speech result:', spokenText);
//           if (spokenText) {
//             onSpeechResult(spokenText);
//           }
//         } catch (error) {
//           console.error('Error processing speech results:', error);
//         }
//       };

//       Voice.onSpeechError = (e: any) => {
//         console.error('Speech error event:', e);
//         const errorMessage = e?.error?.message || e?.message || 'Speech recognition error';
//         onError(errorMessage);
//       };

//       Voice.onSpeechEnd = () => {
//         console.log('Speech recognition ended');
//       };

//       Voice.onSpeechStart = () => {
//         console.log('Speech recognition started');
//       };

//       // Start voice recognition
//       console.log('Calling Voice.start...');
//       await Voice.start('en-US');
//       console.log('Voice.start completed successfully');

//     } catch (error) {
//       console.error('Start listening error:', error);
//       const errorMessage = error instanceof Error ? error.message : 'Failed to start voice recognition';
//       onError(errorMessage);
//     }
//   }

//   async stopListening(): Promise<void> {
//     try {
//       console.log('Stopping voice listening...');
//       if (Voice && typeof Voice.stop === 'function') {
//         await Voice.stop();
//         console.log('Voice stopped successfully');
//       }
//     } catch (error) {
//       console.error('Stop listening error:', error);
//     }
//   }

//   async destroy(): Promise<void> {
//     try {
//       console.log('Destroying voice service...');
//       if (Voice) {
//         if (typeof Voice.destroy === 'function') {
//           await Voice.destroy();
//         }
//         if (typeof Voice.removeAllListeners === 'function') {
//           Voice.removeAllListeners();
//         }
//       }
//       this.isInitialized = false;
//       console.log('Voice service destroyed');
//     } catch (error) {
//       console.error('Destroy voice error:', error);
//       this.isInitialized = false;
//     }
//   }
// }

// export default VoiceService;


// services/voiceService.ts
import Voice from '@react-native-voice/voice';

export const startListening = (onSpeechResult: (text: string) => void, onError: (e: string) => void) => {
  Voice.onSpeechResults = (e) => {
    const spokenText = e.value?.[0] || '';
    onSpeechResult(spokenText);
  };

  Voice.onSpeechError = (e) => {
    onError(e.error?.message || '');
  };

  Voice.start('en-US'); // or 'hi-IN', 'mr-IN' for multilingual later
};

export const stopListening = async () => {
  await Voice.stop();
};

export const destroyVoice = async () => {
  await Voice.destroy().catch(() => {});
};
