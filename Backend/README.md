# Cab Booking Backend with Groq AI

A Node.js backend service for voice-enabled cab booking using Groq AI for intelligent conversation handling.

## Features

- 🤖 **Groq AI Integration**: Intelligent conversation flow using Llama 3.3 70B model
- 🎤 **Voice-First Design**: Optimized for voice interactions from React Native app
- 🚗 **Smart Booking Flow**: Automated extraction of pickup, destination, time, and preferences
- 💰 **Dynamic Pricing**: Real-time price calculation based on distance and preferences
- 📱 **React Native Ready**: CORS and mobile-optimized API endpoints
- 🔄 **Conversation State**: Maintains context across multiple interactions
- 📊 **Booking Management**: Complete CRUD operations for bookings
- 🏥 **Health Monitoring**: Built-in health checks and monitoring endpoints

## Quick Start

### 1. Installation

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
NODE_ENV=development
```

### 3. Get Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Chat Endpoints
- `POST /api/chat` - Send chat message to AI
- `POST /api/chat/voice` - Voice-optimized chat endpoint
- `POST /api/chat/reset` - Reset conversation
- `GET /api/chat/history/:userId` - Get conversation history

### Booking Endpoints
- `POST /api/booking` - Create new booking
- `GET /api/booking/:bookingId` - Get booking details
- `GET /api/booking/user/:userId` - Get user bookings
- `PATCH /api/booking/:bookingId/status` - Update booking status
- `DELETE /api/booking/:bookingId` - Cancel booking

### Health Endpoints
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health with dependencies

## React Native Integration

### Frontend Setup

1. Install required dependencies:
```bash
cd frontend
npm install @react-native-async-storage/async-storage
```

2. Update your React Native app to use the backend:
```typescript
// The ApiService is already configured to connect to:
// - Development: http://10.0.2.2:3000/api (Android emulator)
// - Production: https://your-production-api.com/api
```

### Voice Integration

The backend is optimized for voice interactions:

1. **Voice Input Processing**: Handles natural language from speech-to-text
2. **Conversational Responses**: Generates human-like responses for text-to-speech
3. **Context Awareness**: Maintains conversation state across voice interactions
4. **Error Handling**: Graceful fallbacks for voice recognition errors

## Conversation Flow

The AI handles intelligent cab booking conversations:

1. **Greeting**: Welcomes user and asks how to help
2. **Information Gathering**: Collects pickup location, destination, time, passengers
3. **Preference Selection**: Asks about travel preference (cheapest/fastest/luxurious)
4. **Price Estimation**: Calculates and presents estimated fare
5. **Confirmation**: Confirms all details before booking
6. **Booking Creation**: Generates confirmation with driver details

## Example Conversation

```
User: "I need a cab"
AI: "I'd be happy to help you book a cab! Where would you like to be picked up?"

User: "From Malad West"
AI: "Great! And where would you like to go?"

User: "To Andheri station"
AI: "Perfect! When would you like to be picked up?"

User: "In 30 minutes"
AI: "I found a route from Malad West to Andheri Station. The estimated fare is ₹180 for the cheapest option. Would you like to confirm this booking?"

User: "Yes, book it"
AI: "Excellent! Your cab has been booked. Confirmation code: ABC123XYZ. Driver Rajesh Kumar will arrive in 10 minutes with a white Maruti Swift (MH 01 AB 1234)."
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Your Groq API key | Required |
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `ALLOWED_ORIGINS` | CORS origins | localhost:8081,10.0.2.2:8081 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

### Customization

#### Adding New Locations
Edit `backend/services/priceCalculator.js` to add more locations:

```javascript
this.locations = {
  'your_location': { lat: 19.1234, lng: 72.5678, area: 'central' },
  // ... existing locations
};
```

#### Modifying Pricing
Adjust base rates in `backend/services/priceCalculator.js`:

```javascript
this.baseRates = {
  cheapest: 12,   // ₹12 per km
  fastest: 18,    // ₹18 per km  
  luxurious: 35   // ₹35 per km
};
```

## Development

### Project Structure
```
backend/
├── server.js              # Main server file
├── routes/                 # API route handlers
│   ├── chat.js            # Chat endpoints
│   ├── booking.js         # Booking endpoints
│   └── health.js          # Health check endpoints
├── services/              # Business logic
│   ├── conversationManager.js
│   ├── bookingService.js
│   └── priceCalculator.js
├── middleware/            # Express middleware
│   ├── validation.js
│   ├── errorHandler.js
│   └── logger.js
└── package.json
```

### Testing

```bash
# Run health check
curl http://localhost:3000/api/health

# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I need a cab from Malad to Andheri", "userId": "test-user"}'
```

## Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use a proper database instead of in-memory storage
3. Set up proper logging (Winston, etc.)
4. Configure reverse proxy (Nginx)
5. Set up SSL certificates
6. Configure monitoring (PM2, etc.)
7. Set up backup strategies

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

1. **Groq API Key Issues**
   - Ensure your API key is valid and has sufficient credits
   - Check the key is properly set in `.env`

2. **CORS Errors**
   - Verify `ALLOWED_ORIGINS` includes your React Native development server
   - For Android emulator, use `10.0.2.2` instead of `localhost`

3. **Voice Recognition Not Working**
   - Check microphone permissions in React Native app
   - Verify network connectivity between app and backend

4. **Price Calculation Errors**
   - Ensure location names match those in `priceCalculator.js`
   - Check for typos in pickup/destination locations

### Logs

Enable detailed logging by setting `LOG_LEVEL=debug` in your `.env` file.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check server logs for detailed error messages
4. Ensure all environment variables are properly set

## License

MIT License - see LICENSE file for details.
