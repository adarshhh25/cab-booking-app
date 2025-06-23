import React, { useEffect, useState } from 'react';
import { askGemini, getConversationHistory } from '../services/GeminiService';
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
} from 'react-native';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TypingAnimation } from 'react-native-typing-animation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { getNextPrompt, isBookingComplete, extractBookingDetails } from '../logic/bookingFSM';
import type { BookingState } from '../types/BookingState';



const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [manualText, setManualText] = useState('');
  const [bookingState, setBookingState] = useState<BookingState | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

// Simulate login state for now (replace with actual auth later)
const [isLoggedIn, setIsLoggedIn] = useState(false);

// Modal visibility for ride history
const [showHistory, setShowHistory] = useState(false);

// Sample ride history
const rideHistory = [
  { id: 1, from: 'Mumbai', to: 'Pune', time: '10:00 AM' },
  { id: 2, from: 'Delhi', to: 'Noida', time: '4:30 PM' },
];


  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechEnd = () => setListening(false);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = async (e: any) => {
    const text = e.value[0];
    setSpeechText(text);
    setListening(false);

    // Process the text through our conversation handler
    await handleGeminiConversation(text);
  };

  const handleGeminiConversation = async (input: string) => {
    Tts.speak('Processing...');

    let reply = '';
    let updatedBooking: BookingState | null = bookingState;

    // 1. Check for booking intent
    if (/book.*cab/i.test(input)) {
      updatedBooking = { intent: 'book_cab' };
      
      // Extract any details already provided in the initial command
      if (updatedBooking) {
        updatedBooking = extractBookingDetails(input, updatedBooking);
        setBookingState(updatedBooking);
        
        // Get next prompt based on what information we still need
        const nextPrompt = getNextPrompt(updatedBooking);
        if (nextPrompt) {
          reply = nextPrompt;
        } else if (isBookingComplete(updatedBooking)) {
          reply = `Your cab is booked from ${updatedBooking.pickup} to ${updatedBooking.destination} on ${updatedBooking.date} at ${updatedBooking.time}. ✅`;
          setBookingState(null); // reset after confirmation
        }
      }
    }
    
    // 2. Continue FSM flow if in progress
    else if (bookingState) {
      // Extract details from the current input
      updatedBooking = extractBookingDetails(input, bookingState);
      setBookingState(updatedBooking);
      
      const nextPrompt = getNextPrompt(updatedBooking);
      if (nextPrompt) {
        reply = nextPrompt;
      } else if (isBookingComplete(updatedBooking)) {
        reply = `Your cab is booked from ${updatedBooking.pickup} to ${updatedBooking.destination} on ${updatedBooking.date} at ${updatedBooking.time}. ✅`;
        setBookingState(null); // reset after confirmation
      }
    }

    // 3. Default: use Gemini
    else {
      reply = await askGemini(input);
    }

    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: input }]);
    
    // Add AI response to chat
    setChatMessages(prev => [...prev, { role: 'model', content: reply }]);
    
    // Speak the reply
    Tts.speak(reply);
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

      Tts.speak('How can I help you?');
      setListening(true);
      setSpeechText('');
      await Voice.start('en-US');
    } catch (e) {
      console.error('Voice start error:', e);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualText.trim()) return;
    Keyboard.dismiss();
    
    const text = manualText.trim();
    setSpeechText(text);
    
    // Clear input field
    setManualText('');
    
    // Process the text through our conversation handler
    await handleGeminiConversation(text);
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

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* <View style={styles.header}>
  <TouchableOpacity onPress={() => setModalVisible(true)}>
    <View style={styles.profileCircle}>
      <Image
        source={require('../assets/icons/user.png')}
        style={styles.profileIcon}
      />
    </View>
  </TouchableOpacity>
</View> */}
   <View style={styles.header}>
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

      <View style={styles.centeredPrompt}>
        <Text style={styles.typingText}>How can I help you ?</Text>
        <TypingAnimation
          dotRadius={4}
          dotMargin={4}
          dotAmplitude={3}
          dotSpeed={0.15}
          dotX={12}
          dotY={0}
          color="#ffffff"
          style={{ marginTop: 5 }}
        />
      </View>

      {/* Chat Messages Display */}
      <View style={styles.chatContainer}>
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
          <Text style={styles.emptyChat}>Your conversation will appear here</Text>
        )}
      </View>

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          placeholder="Type your query..."
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
              navigation.navigate('Account');}}>
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
              navigation.navigate('Contact');}}>
              <Text style={styles.modalText}>📞 Contact Us</Text>
            </TouchableOpacity>
              <TouchableOpacity style={styles.modalItem} onPress={handleLogout}>
              <Text style={styles.modalText}>🚪 Logout</Text>
            </TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>


      {/* Ride History Modal */}
<Modal
  animationType="slide"
  transparent={true}
  visible={showHistory}
  onRequestClose={() => setShowHistory(false)}
>
  <TouchableOpacity
    activeOpacity={1}
    onPressOut={() => setShowHistory(false)}
    style={styles.historyOverlay}
  >
    <View style={styles.historyContainer}>
      <Text style={styles.historyTitle}>🧾 Ride History</Text>

      {isLoggedIn ? (
        rideHistory.map((ride) => (
          <View key={ride.id} style={styles.rideItem}>
            <Text style={styles.rideText}>From: {ride.from}</Text>
            <Text style={styles.rideText}>To: {ride.to}</Text>
            <Text style={styles.rideText}>Time: {ride.time}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.rideText}>🔐 Please sign up to view your ride history.</Text>
      )}
    </View>
  </TouchableOpacity>
</Modal>


      {/* Floating Button to open ride history */}
   <TouchableOpacity
    style={styles.floatingButton}
    onPress={() => setShowHistory(true)}>
   <Icon name="history" size={28} color="#fff" />
  </TouchableOpacity>
</SafeAreaView>
  )};

const styles = StyleSheet.create({
  whiteCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff', // Completely filled white circle
    alignItems: 'center',
    justifyContent: 'center',
  },

  blackIcon: {
    width: 24,
    height: 24,
    tintColor: '#000000', // Force image to appear black
  },

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
    marginVertical: 60,
  },
  typingText: {
    fontSize: 30,
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
  floatingButton: {
  position: 'absolute',
  bottom: 90,
  right: 20,
  backgroundColor: '#1e88e5',
  width: 56,
  height: 56,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 10,
},

historyOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'flex-end',
},

historyContainer: {
  backgroundColor: '#1f1f1f',
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: 20,
  maxHeight: '60%',
},

historyTitle: {
  color: '#fff',
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 10,
},

rideItem: {
  backgroundColor: '#2c2c2c',
  borderRadius: 10,
  padding: 10,
  marginBottom: 10,
},

rideText: {
  color: '#ccc',
  fontSize: 14,
},

  chatContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 80, // Space for input box
  },
  chatContentContainer: {
    paddingVertical: 10,
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
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HomeScreen;
