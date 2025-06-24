# Complete Setup Guide: Voice-Enabled Cab Booking App with Groq AI Backend

This guide will help you set up the complete voice-enabled cab booking application with React Native frontend and Node.js backend using Groq AI.

## 📋 Prerequisites

- Node.js 18+ installed
- React Native development environment set up
- Android Studio (for Android development)
- Groq API account (free at https://console.groq.com/)

## 🚀 Step-by-Step Installation

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Edit the `.env` file with your Groq API key:**
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:8081,http://10.0.2.2:8081
```

**Get your Groq API key:**
1. Go to https://console.groq.com/
2. Sign up for a free account
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the key to your `.env` file

**Start the backend server:**
```bash
# Development mode with auto-reload
npm run dev
```

The backend will be running on `http://localhost:3000`

### Step 2: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install new dependencies for backend integration
npm install @react-native-async-storage/async-storage

# Install pods for iOS (if developing for iOS)
cd ios && pod install && cd ..
```

### Step 3: Test Backend Connection

**Test the backend health:**
```bash
curl http://localhost:3000/api/health
```

**Test chat endpoint:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I need a cab from Malad to Andheri", "userId": "test-user"}'
```

### Step 4: Run the React Native App

```bash
# Start Metro bundler
npx react-native start

# In another terminal, run Android app
npx react-native run-android
```

## 🔧 Configuration

### Backend Configuration

The backend is configured through environment variables in `.env`:

```env
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional (with defaults)
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:8081,http://10.0.2.2:8081
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Configuration

The frontend automatically connects to:
- **Development**: `http://10.0.2.2:3000/api` (Android emulator)
- **Production**: Update `baseUrl` in `frontend/services/apiService.ts`

## 🎤 Voice Features

### Voice Recognition Setup

The app includes:
- **Speech-to-Text**: Converts voice input to text
- **Text-to-Speech**: Speaks AI responses back to user
- **Conversation Context**: Maintains booking state across interactions
- **Error Handling**: Graceful fallbacks for voice recognition issues

### Supported Voice Commands

- "I need a cab"
- "Book a ride from Malad to Andheri"
- "I want the fastest route"
- "Book for 2 passengers"
- "Pick me up in 30 minutes"
- "Cancel my booking"

## 🚗 Booking Flow

### 1. Conversation Initiation
```
User: "I need a cab"
AI: "I'd be happy to help you book a cab! Where would you like to be picked up?"
```

### 2. Information Collection
The AI intelligently collects:
- **Pickup Location**: "From where?"
- **Destination**: "Where to?"
- **Pickup Time**: "When?"
- **Passengers**: "How many passengers?" (defaults to 1)
- **Preference**: "Cheapest, fastest, or luxurious?"

### 3. Price Estimation
```
AI: "I found a route from Malad West to Andheri Station. The estimated fare is ₹180 for the cheapest option."
```

### 4. Booking Confirmation
```
AI: "Your cab has been booked! Confirmation code: ABC123XYZ. Driver Rajesh Kumar will arrive in 10 minutes."
```

## 🛠 API Endpoints

### Chat Endpoints
- `POST /api/chat` - Main chat endpoint
- `POST /api/chat/voice` - Voice-optimized endpoint
- `POST /api/chat/reset` - Reset conversation
- `GET /api/chat/history/:userId` - Get conversation history

### Booking Endpoints
- `POST /api/booking` - Create booking
- `GET /api/booking/:bookingId` - Get booking details
- `GET /api/booking/user/:userId` - Get user bookings
- `PATCH /api/booking/:bookingId/status` - Update status
- `DELETE /api/booking/:bookingId` - Cancel booking

### Health Endpoints
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health with dependencies

## 🧪 Testing

### Test Voice Recognition
1. Open the app
2. Tap the microphone button
3. Say "I need a cab from Malad to Andheri"
4. Verify the AI responds appropriately

### Test Manual Input
1. Type in the text input field
2. Send messages like "Book a ride"
3. Follow the conversation flow

### Test Backend Directly
```bash
# Test health
curl http://localhost:3000/api/health

# Test chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "userId": "test"}'
```

## 🐛 Troubleshooting

### Common Issues

**1. Backend not starting:**
- Check if port 3000 is available
- Verify Groq API key is set correctly
- Check Node.js version (18+ required)

**2. Frontend can't connect to backend:**
- Ensure backend is running on port 3000
- For Android emulator, use `10.0.2.2` instead of `localhost`
- Check CORS configuration in backend

**3. Voice recognition not working:**
- Grant microphone permissions
- Test on physical device (emulator voice may not work)
- Check if `@react-native-voice/voice` is properly linked

**4. TTS not working:**
- Ensure `react-native-tts` is properly installed
- Test on physical device
- Check device volume settings

**5. Groq API errors:**
- Verify API key is valid
- Check if you have sufficient credits
- Ensure internet connectivity

### Debug Mode

Enable detailed logging:

**Backend:**
```env
LOG_LEVEL=debug
```

**Frontend:**
Check React Native debugger console for detailed logs.

## 📱 Device Testing

### Android
```bash
# Connect Android device via USB
adb devices

# Run on device
npx react-native run-android --device
```

### iOS (if applicable)
```bash
# Run on iOS simulator
npx react-native run-ios

# Run on device
npx react-native run-ios --device "Your Device Name"
```

## 🚀 Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use a proper database (MongoDB, PostgreSQL)
3. Set up reverse proxy (Nginx)
4. Configure SSL certificates
5. Use process manager (PM2)

### Frontend Deployment
1. Build release APK/IPA
2. Update API base URL to production server
3. Test on multiple devices
4. Submit to app stores

## 📊 Monitoring

### Backend Monitoring
- Health checks: `GET /api/health/detailed`
- Logs: Check console output or log files
- Performance: Monitor response times

### Frontend Monitoring
- React Native debugger
- Device logs
- Crash reporting tools

## 🔐 Security Considerations

1. **API Key Security**: Never expose Groq API key in frontend
2. **Rate Limiting**: Backend includes rate limiting
3. **Input Validation**: All inputs are validated
4. **CORS**: Properly configured for mobile apps
5. **Error Handling**: No sensitive data in error messages

## 📈 Scaling

### Backend Scaling
- Use database instead of in-memory storage
- Implement caching (Redis)
- Add load balancing
- Use microservices architecture

### Frontend Scaling
- Implement offline support
- Add push notifications
- Optimize for different screen sizes
- Add analytics

## 🎯 Next Steps

1. **Test the complete flow** from voice input to booking confirmation
2. **Customize locations** in `priceCalculator.js` for your area
3. **Modify pricing** based on your local rates
4. **Add real payment integration**
5. **Implement user authentication**
6. **Add real-time tracking**
7. **Deploy to production**

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review backend logs
3. Test API endpoints directly
4. Verify environment configuration
5. Check React Native setup

The app should now be fully functional with voice-enabled cab booking powered by Groq AI! 🎉
