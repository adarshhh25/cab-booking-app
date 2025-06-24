// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   Modal,
//   SafeAreaView,
//   Platform,
//   PermissionsAndroid,
//   Alert,
// } from 'react-native';
// import Tts from 'react-native-tts';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import VoiceService from '../services/voiceService';

// const HomeScreen = () => {
//   const insets = useSafeAreaInsets();
//   const [modalVisible, setModalVisible] = useState(false);
//   const [listening, setListening] = useState(false);
//   const [speechText, setSpeechText] = useState('');
//   const voiceService = VoiceService.getInstance();

//   useEffect(() => {
//     let isMounted = true;

//     // Initialize voice service
//     const initVoice = async () => {
//       try {
//         await voiceService.initialize();
//         if (isMounted) {
//           console.log('Voice service initialized in HomeScreen');
//         }
//       } catch (error) {
//         if (isMounted) {
//           console.error('Failed to initialize voice service:', error);
//         }
//       }
//     };

//     initVoice();

//     return () => {
//       isMounted = false;
//       // Cleanup voice service
//       const cleanup = async () => {
//         try {
//           await voiceService.stopListening();
//           await voiceService.destroy();
//         } catch (error) {
//           console.error('Error during voice service cleanup:', error);
//         }
//       };
//       cleanup();
//     };
//   }, [voiceService]);

//   const onSpeechResults = useCallback((text: string) => {
//     try {
//       setSpeechText(text);
//       setListening(false);
//       console.log('User said:', text);
//       respondToCommand(text);
//     } catch (error) {
//       console.error('Error processing speech results:', error);
//       setListening(false);
//     }
//   }, []);

//   const onSpeechError = useCallback((error: string) => {
//     console.error('Speech error:', error);
//     setListening(false);
//     Alert.alert('Voice Error', error);
//   }, []);

//   const respondToCommand = useCallback((text: string) => {
//     try {
//       if (text.toLowerCase().includes('malad') && text.toLowerCase().includes('andheri')) {
//         Tts.speak("Sure! Would you like the fastest route or the cheapest one?");
//       } else if (text.toLowerCase().includes('fastest')) {
//         Tts.speak("Booking the fastest route to Andheri from Malad.");
//       } else {
//         Tts.speak("Can you please repeat that?");
//       }
//     } catch (error) {
//       console.error('Error in TTS:', error);
//     }
//   }, []);

//   const startVoiceRecognition = useCallback(async () => {
//     try {
//       console.log('Starting voice recognition...');

//       // Check if already listening
//       if (listening) {
//         console.log('Already listening, stopping first...');
//         await voiceService.stopListening();
//         setListening(false);
//         return;
//       }

//       if (Platform.OS === 'android') {
//         const permission = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
//         );
//         if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
//           Tts.speak('Microphone permission is required.');
//           Alert.alert('Permission Required', 'Microphone permission is required for voice recognition.');
//           return;
//         }
//         console.log('Audio permission granted');
//       }

//       setListening(true);
//       setSpeechText('');
//       console.log('About to start voice service...');
//       await voiceService.startListening(onSpeechResults, onSpeechError);
//       console.log('Voice service started successfully');
//     } catch (error) {
//       console.error('Voice start error:', error);
//       setListening(false);
//       const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//       Alert.alert('Voice Error', `Failed to start voice recognition: ${errorMessage}`);
//     }
//   }, [listening, voiceService, onSpeechResults, onSpeechError]);

//   return (
//     <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
//       {/* Profile Icon Top Right */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => setModalVisible(true)}>
//           <Image
//             source={require('../assets/icons/user.png')}
//             style={styles.profileImage}
//           />
//         </TouchableOpacity>
//       </View>

//       {/* Greeting */}
//       <View style={styles.centerContent}>
//         <Text style={styles.headingText}>How can I help you?</Text>

//         {/* Mic Button */}
//         <TouchableOpacity
//           style={[styles.micButton, listening && styles.micButtonListening]}
//           onPress={startVoiceRecognition}
//         >
//           <Icon
//             name={listening ? "stop" : "keyboard-voice"}
//             size={36}
//             color="#fff"
//           />
//         </TouchableOpacity>

//         {listening && (
//           <Text style={styles.listeningText}>Listening...</Text>
//         )}
//         {!!speechText && (
//           <Text style={styles.speechText}>
//             You said: "{speechText}"
//           </Text>
//         )}

//         {/* Test Voice Service Button */}
//         <TouchableOpacity
//           style={styles.testButton}
//           onPress={async () => {
//             try {
//               console.log('Testing voice service initialization...');
//               await voiceService.initialize();
//               Alert.alert(
//                 'Success',
//                 'Voice service initialized successfully!\n\nYou can now use the microphone button to start voice recognition.',
//                 [{ text: 'OK', style: 'default' }]
//               );
//             } catch (error) {
//               const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//               console.error('Voice service test failed:', errorMessage);
//               Alert.alert(
//                 'Voice Service Error',
//                 `Failed to initialize voice service:\n\n${errorMessage}\n\nPlease check if the voice recognition package is properly installed.`,
//                 [{ text: 'OK', style: 'default' }]
//               );
//             }
//           }}
//         >
//           <Text style={styles.testButtonText}>Test Voice Service</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Profile Modal */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           onPress={() => setModalVisible(false)}
//         >
//           <View style={styles.modalBox}>
//             <TouchableOpacity style={styles.modalItem}>
//               <Text style={styles.modalText}>👤 View Profile</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.modalItem}>
//               <Text style={styles.modalText}>⚙️ Settings</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.modalItem}>
//               <Text style={styles.modalText}>🚪 Logout</Text>
//             </TouchableOpacity>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#121212', // ChatGPT dark theme
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     paddingRight: 20,
//     paddingTop: 10,
//   },
//   profileImage: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//   },
//   centerContent: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headingText: {
//     fontSize: 28,
//     color: '#ffffff',
//     fontWeight: 'bold',
//     marginBottom: 30,
//     textAlign: 'center',
//   },
//   micButton: {
//     backgroundColor: '#1e88e5',
//     padding: 20,
//     borderRadius: 50,
//     elevation: 4,
//   },
//   micButtonListening: {
//     backgroundColor: '#f44336',
//   },
//   listeningText: {
//     color: '#888',
//     marginTop: 20,
//     fontSize: 16,
//   },
//   speechText: {
//     color: '#ccc',
//     marginTop: 10,
//     paddingHorizontal: 20,
//     textAlign: 'center',
//     fontSize: 14,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: '#00000099',
//     justifyContent: 'flex-start',
//     alignItems: 'flex-end',
//     paddingTop: 50,
//     paddingRight: 15,
//   },
//   modalBox: {
//     width: 180,
//     backgroundColor: '#1f1f1f',
//     borderRadius: 10,
//     paddingVertical: 10,
//   },
//   modalItem: {
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//   },
//   modalText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   testButton: {
//     backgroundColor: '#4CAF50',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 25,
//     marginTop: 20,
//   },
//   testButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
// });

// export default HomeScreen;


import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  SafeAreaView,
  Platform,
  PermissionsAndroid,
  Keyboard,
  Alert,
} from 'react-native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TypingAnimation } from 'react-native-typing-animation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [manualText, setManualText] = useState('');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechEnd = () => setListening(false);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (e: any) => {
    const text = e.value[0];
    setSpeechText(text);
    respondToCommand(text);
  };

  const respondToCommand = (text: string) => {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('malad') && lowerText.includes('andheri')) {
      Tts.speak('Sure! Would you like the fastest route or the cheapest one?');
    } else if (lowerText.includes('fastest')) {
      Tts.speak('Booking the fastest route to Andheri from Malad.');
    } else {
      Tts.speak('Can you please repeat that?');
    }
  };

  const startVoiceRecognition = async () => {
    try {
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          Tts.speak('Microphone permission is required.');
          return;
        }
      }

      setListening(true);
      setSpeechText('');
      await Voice.start('en-US');
    } catch (e) {
      console.error('Voice start error:', e);
    }
  };

  const handleManualSubmit = () => {
    if (!manualText.trim()) return;
    Keyboard.dismiss();
    respondToCommand(manualText.trim());
    setSpeechText(manualText.trim());
    setManualText('');
  };

  const handleLogout = () => {
    Alert.alert(
      'Are you sure you want to logout?',
      '',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            setModalVisible(false);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Profile Icon Top Right */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            source={require('../assets/icons/user.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Centered Text + Typing Effect */}
      <View style={styles.centeredPrompt}>
        <Text style={styles.typingText}>How can I help you</Text>
        <TypingAnimation
          dotRadius={4}
          dotMargin={4}
          dotAmplitude={3}
          dotSpeed={0.15}
          dotX={12}
          dotY={0}
          style={{ marginTop: 5 }}
        />
      </View>

      {/* Transcript Display */}
      {!!speechText && (
        <Text style={styles.transcript}>You said: "{speechText}"</Text>
      )}

      {/* Input + Mic Like ChatGPT */}
      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="Type your destination here..."
          placeholderTextColor="#777"
          value={manualText}
          onChangeText={setManualText}
          onSubmitEditing={handleManualSubmit}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={startVoiceRecognition} style={styles.iconWrapper}>
          <Icon name="keyboard-voice" size={24} color="#1e88e5" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleManualSubmit} style={styles.iconWrapper}>
          <Icon name="send" size={24} color="#1e88e5" />
        </TouchableOpacity>
      </View>

      {/* Optional Listening Text */}
      {listening && <Text style={styles.listeningText}>🎤 Listening...</Text>}

      {/* Modal for Profile Options */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('Profile');
              }}
            >
              <Text style={styles.modalText}>👤 View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalItem}>
              <Text style={styles.modalText}>⚙️ Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalItem}>
              <Text style={styles.modalText}>📞 Contact Us</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={handleLogout}
            >
              <Text style={styles.modalText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 20,
    paddingTop: 10,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  centeredPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  typingText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
  },
  transcript: {
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: '#1f1f1f',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginHorizontal: 20,
    alignItems: 'center',
    position: 'absolute',
    bottom: 30,
    width: '90%',
    alignSelf: 'center',
    elevation: 5,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 4,
  },
  iconWrapper: {
    marginLeft: 10,
  },
  listeningText: {
    color: '#29b6f6',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 15,
  },
  modalBox: {
    width: 180,
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    paddingVertical: 10,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default HomeScreen;
