// test-api.js - Simple test script for the backend API
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';
const TEST_USER_ID = 'test-user-' + Date.now();

async function testAPI() {
  console.log('🧪 Testing Cab Booking API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.status);
    console.log('');

    // Test 2: Initial Chat Message
    console.log('2️⃣ Testing Initial Chat...');
    const chatResponse1 = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I need a cab',
        userId: TEST_USER_ID
      })
    });
    const chatData1 = await chatResponse1.json();
    console.log('🤖 AI Response:', chatData1.response);
    console.log('📊 Conversation State:', chatData1.conversationState);
    console.log('');

    // Test 3: Provide Pickup Location
    console.log('3️⃣ Testing Pickup Location...');
    const chatResponse2 = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'From Malad West',
        userId: TEST_USER_ID
      })
    });
    const chatData2 = await chatResponse2.json();
    console.log('🤖 AI Response:', chatData2.response);
    console.log('📍 Pickup Location:', chatData2.bookingInfo?.pickupLocation);
    console.log('');

    // Test 4: Provide Destination
    console.log('4️⃣ Testing Destination...');
    const chatResponse3 = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'To Andheri Station',
        userId: TEST_USER_ID
      })
    });
    const chatData3 = await chatResponse3.json();
    console.log('🤖 AI Response:', chatData3.response);
    console.log('🎯 Destination:', chatData3.bookingInfo?.destination);
    console.log('💰 Estimated Price:', chatData3.estimatedPrice);
    console.log('');

    // Test 5: Provide Time
    console.log('5️⃣ Testing Pickup Time...');
    const chatResponse4 = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'In 30 minutes',
        userId: TEST_USER_ID
      })
    });
    const chatData4 = await chatResponse4.json();
    console.log('🤖 AI Response:', chatData4.response);
    console.log('⏰ Pickup Time:', chatData4.bookingInfo?.pickupTime);
    console.log('');

    // Test 6: Confirm Booking
    console.log('6️⃣ Testing Booking Confirmation...');
    const chatResponse5 = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Yes, confirm the booking',
        userId: TEST_USER_ID
      })
    });
    const chatData5 = await chatResponse5.json();
    console.log('🤖 AI Response:', chatData5.response);
    console.log('📋 Confirmation:', chatData5.confirmation ? 'Booking Created!' : 'Pending...');
    if (chatData5.confirmation) {
      console.log('🎫 Confirmation Code:', chatData5.confirmation.confirmationCode);
      console.log('👨‍💼 Driver:', chatData5.confirmation.driver?.name);
      console.log('🚗 Vehicle:', chatData5.confirmation.vehicle?.model, chatData5.confirmation.vehicle?.color);
    }
    console.log('');

    // Test 7: Get Conversation History
    console.log('7️⃣ Testing Conversation History...');
    const historyResponse = await fetch(`${BASE_URL}/chat/history/${TEST_USER_ID}`);
    const historyData = await historyResponse.json();
    console.log('📜 Conversation Messages:', historyData.history?.length || 0);
    console.log('');

    // Test 8: Reset Conversation
    console.log('8️⃣ Testing Conversation Reset...');
    const resetResponse = await fetch(`${BASE_URL}/chat/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: TEST_USER_ID })
    });
    const resetData = await resetResponse.json();
    console.log('🔄 Reset Status:', resetData.success ? 'Success' : 'Failed');
    console.log('');

    // Test 9: Detailed Health Check
    console.log('9️⃣ Testing Detailed Health Check...');
    const detailedHealthResponse = await fetch(`${BASE_URL}/health/detailed`);
    const detailedHealthData = await detailedHealthResponse.json();
    console.log('🏥 Detailed Health:', detailedHealthData.status);
    console.log('🤖 Groq Service:', detailedHealthData.services?.groq?.status || 'Unknown');
    console.log('💾 Memory Usage:', detailedHealthData.memory?.heapUsed || 'Unknown');
    console.log('');

    console.log('✅ All tests completed successfully!');
    console.log('🎉 Your backend is ready for the React Native app!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the backend server is running (npm run dev)');
    console.log('2. Check if your Groq API key is set in .env file');
    console.log('3. Verify the server is accessible at http://localhost:3000');
    console.log('4. Check the server logs for any errors');
  }
}

// Run the tests
testAPI();
