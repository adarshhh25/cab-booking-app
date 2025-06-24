import React, { useEffect, useState, useRef } from 'react';
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
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import Tts from 'react-native-tts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VoiceService from '../services/voiceService';
import { ApiService } from '../services/apiService';
import { TTSService } from '../services/ttsService';

const { width } = Dimensions.get('window');

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface BookingInfo {
  pickupLocation: string | null;
  destination: string | null;
  pickupTime: string | null;
  passengers: number | null;
  travelPreference: string | null;
  specialRequirements: string | null;
}

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [manualText, setManualText] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [bookingInfo, setBookingInfo] = useState<BookingInfo>({
    pickupLocation: null,
    destination: null,
    pickupTime: null,
    passengers: null,
    travelPreference: null,
    specialRequirements: null,
  });
  const [conversationState, setConversationState] = useState('greeting');
  const [estimatedPrice, setEstimatedPrice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(-width * 0.7)).current;

  // Services
  const voiceService = VoiceService.getInstance();
  const apiService = ApiService.getInstance();
  const ttsService = TTSService.getInstance();

  // Simulate login state for now (replace with actual auth later)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Modal visibility for ride history
  const [showHistory, setShowHistory] = useState(false);

  // Sample ride history
  const rideHistory = [
    { id: 1, from: 'Mumbai', to: 'Pune', time: '10:00 AM' },
    { id: 2, from: 'Delhi', to: 'Noida', time: '4:30 PM' },
  ];

  // Track if chat has started
  const [chatStarted, setChatStarted] = useState(false);

  useEffect(() => {
    // Initialize Voice Service
    const initVoice = async () => {
      try {
        await voiceService.initialize();
        console.log('Voice service initialized in HomeScreen');
      } catch (error) {
        console.error('Failed to initialize voice service:', error);
      }
    };

    // Initialize TTS Service
    const initializeTTS = async () => {
      try {
        console.log('🔊 Initializing TTS Service...');
        const success = await ttsService.initialize();
        if (success) {
          console.log('✅ TTS Service initialized successfully');
        } else {
          console.error('❌ TTS Service initialization failed');
          Alert.alert(
            'TTS Warning',
            'Text-to-speech initialization failed. Voice responses may not work. Please check your device TTS settings.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('❌ TTS initialization error:', error);
      }
    };

    initializeTTS();

    initVoice();

    return () => {
      // Clean up Voice Service
      voiceService.destroy();

      // Clean up TTS Service
      ttsService.destroy();

      // Clean up TTS
      Tts.stop();
      Tts.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    // Set chatStarted to true if there are any messages
    if (chatMessages.length > 0 && !chatStarted) {
      setChatStarted(true);
    }
  }, [chatMessages]);

  useEffect(() => {
    // Animate the drawer when showHistory changes
    Animated.timing(slideAnim, {
      toValue: showHistory ? 0 : -width * 0.7,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showHistory, slideAnim]);

  const onSpeechResults = (text: string) => {
    setSpeechText(text);
    setListening(false);
    console.log('User said:', text);

    // Add the user's actual spoken text to chat immediately
    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, userMessage]);

    // Process the text through our conversation handler
    handleConversation(text, false); // false = don't add user message again
  };

  const onSpeechError = (error: string) => {
    console.error('Speech error:', error);
    setListening(false);

    // Only show alert for genuine errors that affect functionality
    if (error && !error.includes('Didn\'t understand') && !error.includes('11/')) {
      Alert.alert('Voice Error', error);
    }
  };

  const handleConversation = async (input: string, addUserMessage: boolean = true) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // Add user message to chat only if not already added (for manual input)
      if (addUserMessage) {
        const userMessage: ChatMessage = {
          role: 'user',
          content: input,
          timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, userMessage]);
      }

      // Send to backend API
      const response = await apiService.sendChatMessage(input, voiceService.getUserId());

      // Update booking info if provided
      if (response.bookingInfo) {
        setBookingInfo(response.bookingInfo);
      }

      // Update conversation state
      setConversationState(response.conversationState);

      // Update estimated price if available
      if (response.estimatedPrice) {
        setEstimatedPrice(response.estimatedPrice);
      }

      // Add AI response to chat
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp
      };
      setChatMessages(prev => [...prev, aiMessage]);

      // Speak the response
      await speakResponse(response.response);

      // Handle booking confirmation
      if (response.confirmation) {
        handleBookingConfirmation(response.confirmation);
      }

    } catch (error) {
      console.error('Conversation error:', error);
      const errorMessage = 'Sorry, I encountered an error. Please try again.';

      const errorAiMessage: ChatMessage = {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorAiMessage]);

      await speakResponse(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = async (text: string) => {
    if (!text || text.trim().length === 0) {
      console.log('⚠️ Empty text provided to TTS');
      return;
    }

    try {
      console.log('🔊 Using TTS Service to speak:', text.substring(0, 50) + '...');

      const success = await ttsService.speak(text);

      if (!success) {
        console.error('❌ TTS Service failed to speak');
        Alert.alert(
          'TTS Error',
          'Text-to-speech failed. Please check your device TTS settings or try restarting the app.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ TTS error in speakResponse:', error);
      Alert.alert('TTS Error', 'Text-to-speech encountered an error: ' + error.message);
    }
  };

  const handleBookingConfirmation = (confirmation: any) => {
    Alert.alert(
      'Booking Confirmed! 🎉',
      `Confirmation Code: ${confirmation.confirmationCode}\nDriver: ${confirmation.driver?.name}\nVehicle: ${confirmation.vehicle?.model} ${confirmation.vehicle?.color}\nEstimated Arrival: ${confirmation.estimatedArrival}`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Reset booking state
            setBookingInfo({
              pickupLocation: null,
              destination: null,
              pickupTime: null,
              passengers: null,
              travelPreference: null,
              specialRequirements: null,
            });
            setConversationState('greeting');
            setEstimatedPrice(null);
          }
        }
      ]
    );
  };

  const startVoiceRecognition = async () => {
    try {
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Required', 'Microphone permission is required for voice recognition.');
          return;
        }
      }

      if (chatMessages.length === 0) {
        await speakResponse('How can I help you with your cab booking today?');
      }

      setListening(true);
      setSpeechText('');
      await voiceService.startListening(onSpeechResults, onSpeechError);
    } catch (error) {
      console.error('Voice start error:', error);
      setListening(false);
      Alert.alert('Voice Error', 'Failed to start voice recognition. Please try again.');
    }
  };

  const handleManualSubmit = async () => {
    if (!manualText.trim() || isProcessing) return;

    Keyboard.dismiss();

    const text = manualText.trim();
    setSpeechText(text);

    // Clear input field
    setManualText('');

    // Process the text through our conversation handler (add user message for manual input)
    await handleConversation(text, true);
  };

  const handleLogout = () => {
    Alert.alert('Are you sure you want to logout?', '', [
      { text: 'Cancel', style: 'cancel' },
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
    ]);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {/* History button - in top left */}
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={toggleHistory}
        >
          <Icon name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        {/* Profile button - in top right */}
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <View style={styles.whiteCircle}>
            <Image
              source={require('../assets/icons/user.png')}
              style={styles.blackIcon}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Initial welcome prompt - only show if chat hasn't started */}
      {!chatStarted && (
        <View style={styles.centeredPrompt}>
          <Text style={styles.welcomeText}>Hey Adarsh Jha!</Text>
          <Text style={styles.subtitleText}>What's on your mind?</Text>
        </View>
      )}

      {/* Chat Messages Display */}
      <View style={[
        styles.chatContainer, 
        chatStarted ? styles.expandedChatContainer : null
      ]}>
        {chatMessages.length > 0 ? (
          <FlatList
            data={chatMessages}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={item.role === 'user' ? styles.userMessage : styles.aiMessage}>
                <Text style={item.role === 'user' ? styles.userText : styles.aiText}>
                  {item.content}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.chatContentContainer}
          />
        ) : (
          <Text style={styles.emptyChat}></Text>
        )}
      </View>

      {/* Input area - positioned differently based on chat state */}
      <View style={[
        styles.inputBox,
        chatStarted ? styles.bottomInputBox : styles.centeredInputBox
      ]}>
        <TextInput
          style={styles.input}
          placeholder="Ask anything"
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

      {listening && <Text style={styles.listeningText}>🎤 Listening...</Text>}



      {/* Profile Modal */}
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
                navigation.navigate('Account');
              }}>
              <Text style={styles.modalText}>👤 Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('Settings');
              }}
            >
              <Text style={styles.modalText}>⚙️ Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalItem} onPress={() => {
              setModalVisible(false);
              navigation.navigate('Contact');
            }}>
              <Text style={styles.modalText}>📞 Contact Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalItem} onPress={handleLogout}>
              <Text style={styles.modalText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Ride History Drawer - slides from left */}
      <Animated.View 
        style={[
          styles.historyDrawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>📋 Ride History</Text>
          <TouchableOpacity onPress={toggleHistory}>
            <Icon name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.historyContent}>
          {isLoggedIn ? (
            rideHistory.map((ride) => (
              <View key={ride.id} style={styles.rideItem}>
                <Text style={styles.rideText}>From: {ride.from}</Text>
                <Text style={styles.rideText}>To: {ride.to}</Text>
                <Text style={styles.rideText}>Time: {ride.time}</Text>
              </View>
            ))
          ) : (
            <View style={styles.signInPrompt}>
              <Text style={styles.signInText}>🔐 Please sign up to view your ride history.</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Semi-transparent overlay when history drawer is open */}
      {showHistory && (
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={toggleHistory}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  whiteCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blackIcon: {
    width: 24,
    height: 24,
    tintColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 120,
  },
  welcomeText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 20,
    color: '#aaaaaa',
    marginTop: 10,
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
  expandedChatContainer: {
    marginBottom: 80,
  },
  chatContentContainer: {
    paddingVertical: 10,
    paddingBottom: 20,
  },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: '#1f1f1f',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginHorizontal: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  centeredInputBox: {
    position: 'absolute',
    bottom: '50%',
    width: '90%',
    alignSelf: 'center',
  },
  bottomInputBox: {
    position: 'absolute',
    bottom: 30,
    width: '90%',
    alignSelf: 'center',
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
    position: 'absolute',
    bottom: 10,
    width: '100%',
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
  historyDrawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '70%',
    height: '100%',
    backgroundColor: '#1f1f1f',
    zIndex: 1000,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  historyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  historyContent: {
    flex: 1,
    padding: 20,
  },
  rideItem: {
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  rideText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  signInPrompt: {
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  signInText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '30%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1e88e5',
    borderRadius: 16,
    padding: 12,
    marginVertical: 4,
    maxWidth: '80%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 12,
    marginVertical: 4,
    maxWidth: '80%',
  },
  userText: {
    color: 'white',
    fontSize: 16,
  },
  aiText: {
    color: 'white',
    fontSize: 16,
  },
  emptyChat: {
    color: 'transparent',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HomeScreen;
