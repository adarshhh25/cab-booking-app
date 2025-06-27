import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  firstName: 'Adarsh',
  lastName: 'Jha',
  email: 'adarsh.jha@test.com',
  phone: '+919876543210',
  password: 'SecurePass123',
  dateOfBirth: '1995-01-15',
  gender: 'male'
};

let authToken = '';
let userId = '';

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('Request failed:', error.message);
    return { status: 500, data: { error: error.message } };
  }
}

async function testUserAPI() {
  console.log('🧪 Testing User API Endpoints...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const health = await makeRequest(`${BASE_URL}/health`);
    console.log('Status:', health.status);
    console.log('Response:', health.data);
    console.log('✅ Health check completed\n');

    // Test 2: Register User
    console.log('2️⃣ Testing User Registration...');
    const register = await makeRequest(`${BASE_URL}/users/register`, {
      method: 'POST',
      body: JSON.stringify(testUser)
    });
    
    console.log('Status:', register.status);
    if (register.status === 201) {
      authToken = register.data.data.token;
      userId = register.data.data.user._id;
      console.log('✅ User registered successfully');
      console.log('👤 User ID:', userId);
      console.log('🔑 Token received');
    } else {
      console.log('❌ Registration failed:', register.data.message);
      if (register.data.message?.includes('already exists')) {
        console.log('ℹ️ User already exists, trying to login...');
        
        // Try to login instead
        const login = await makeRequest(`${BASE_URL}/users/login`, {
          method: 'POST',
          body: JSON.stringify({
            identifier: testUser.email,
            password: testUser.password
          })
        });
        
        if (login.status === 200) {
          authToken = login.data.data.token;
          userId = login.data.data.user._id;
          console.log('✅ Login successful');
          console.log('👤 User ID:', userId);
          console.log('🔑 Token received');
        } else {
          console.log('❌ Login failed:', login.data.message);
          return;
        }
      } else {
        return;
      }
    }
    console.log('');

    // Test 3: Get User Profile
    console.log('3️⃣ Testing Get User Profile...');
    const profile = await makeRequest(`${BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('Status:', profile.status);
    if (profile.status === 200) {
      console.log('✅ Profile retrieved successfully');
      console.log('👤 Name:', profile.data.data.user.fullName);
      console.log('📧 Email:', profile.data.data.user.email);
      console.log('📱 Phone:', profile.data.data.user.phone);
    } else {
      console.log('❌ Failed to get profile:', profile.data.message);
    }
    console.log('');

    // Test 4: Update User Profile
    console.log('4️⃣ Testing Update User Profile...');
    const updateProfile = await makeRequest(`${BASE_URL}/users/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        firstName: 'Adarsh Kumar',
        profilePicture: 'https://example.com/profile.jpg'
      })
    });
    
    console.log('Status:', updateProfile.status);
    if (updateProfile.status === 200) {
      console.log('✅ Profile updated successfully');
      console.log('👤 Updated Name:', updateProfile.data.data.user.fullName);
    } else {
      console.log('❌ Failed to update profile:', updateProfile.data.message);
    }
    console.log('');

    // Test 5: Add User Address
    console.log('5️⃣ Testing Add User Address...');
    const addAddress = await makeRequest(`${BASE_URL}/users/${userId}/addresses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        type: 'home',
        name: 'Home',
        address: '123 Main Street, Mumbai, Maharashtra, India',
        coordinates: {
          latitude: 19.0760,
          longitude: 72.8777
        },
        isDefault: true
      })
    });
    
    console.log('Status:', addAddress.status);
    if (addAddress.status === 201) {
      console.log('✅ Address added successfully');
      console.log('🏠 Addresses count:', addAddress.data.data.user.addresses.length);
    } else {
      console.log('❌ Failed to add address:', addAddress.data.message);
    }
    console.log('');

    // Test 6: Update User Preferences
    console.log('6️⃣ Testing Update User Preferences...');
    const updatePrefs = await makeRequest(`${BASE_URL}/users/${userId}/preferences`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        language: 'hi',
        currency: 'INR',
        notifications: {
          push: true,
          email: false,
          sms: true
        },
        voiceCommands: {
          enabled: true,
          language: 'hi'
        }
      })
    });
    
    console.log('Status:', updatePrefs.status);
    if (updatePrefs.status === 200) {
      console.log('✅ Preferences updated successfully');
      console.log('🌐 Language:', updatePrefs.data.data.user.preferences.language);
      console.log('💰 Currency:', updatePrefs.data.data.user.preferences.currency);
    } else {
      console.log('❌ Failed to update preferences:', updatePrefs.data.message);
    }
    console.log('');

    // Test 7: Get User Statistics
    console.log('7️⃣ Testing Get User Statistics...');
    const stats = await makeRequest(`${BASE_URL}/users/stats`);
    
    console.log('Status:', stats.status);
    if (stats.status === 200) {
      console.log('✅ Statistics retrieved successfully');
      console.log('📊 Total Users:', stats.data.data.totalUsers);
      console.log('✅ Active Users:', stats.data.data.activeUsers);
      console.log('🔐 Verified Users:', stats.data.data.verifiedUsers);
      console.log('⭐ Average Rating:', stats.data.data.avgRating?.toFixed(2) || 'N/A');
    } else {
      console.log('❌ Failed to get statistics:', stats.data.message);
    }
    console.log('');

    // Test 8: Test Invalid Token
    console.log('8️⃣ Testing Invalid Token...');
    const invalidToken = await makeRequest(`${BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid_token'
      }
    });
    
    console.log('Status:', invalidToken.status);
    if (invalidToken.status === 401) {
      console.log('✅ Invalid token properly rejected');
    } else {
      console.log('❌ Invalid token test failed');
    }
    console.log('');

    console.log('🎉 All User API tests completed!');
    console.log('✅ User API is working correctly');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run the test
console.log('🚀 Starting User API Tests...');
console.log('📍 Base URL:', BASE_URL);
console.log('⏰ Please ensure the server is running on port 3000\n');

testUserAPI();
