# Cab Booking App with AI Assistant

A React Native mobile application for booking cabs with an AI-powered assistant using Google's Gemini API.

## Features

- Voice-activated AI assistant
- Natural language cab booking
- Conversation history
- Text-to-speech responses

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- React Native development environment
- Google Gemini API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/cab-booking-app.git
   cd cab-booking-app
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```
   cp config/env.template.ts config/env.ts
   ```
   Then edit `config/env.ts` to add your Gemini API key.

4. Start Metro:
   ```
   npm start
   # or
   yarn start
   ```

5. Run the app:
   ```
   npm run android
   # or
   npm run ios
   ```

## Environment Setup

This project uses environment variables for API keys and endpoints. To set up:

1. Copy the template file:
   ```
   cp config/env.template.ts config/env.ts
   ```

2. Edit `config/env.ts` to add your Gemini API key:
   ```typescript
   export const ENV = {
     GEMINI_API_KEY: 'your-actual-api-key-here',
     GEMINI_ENDPOINT: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent'
   };
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

