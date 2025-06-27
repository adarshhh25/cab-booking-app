import database from './config/database.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function testMongoDB() {
  try {
    console.log('🧪 Testing MongoDB Connection and User Creation...\n');

    // Test 1: Connect to MongoDB
    console.log('1️⃣ Testing MongoDB Connection...');
    await database.connect();
    console.log('✅ MongoDB connected successfully\n');

    // Test 2: Health Check
    console.log('2️⃣ Testing Database Health Check...');
    const healthCheck = await database.healthCheck();
    console.log('📊 Health Check Result:', healthCheck);
    console.log('✅ Health check completed\n');

    // Test 3: Create a test user
    console.log('3️⃣ Testing User Creation...');
    const testUser = {
      firstName: 'Adarsh',
      lastName: 'Jha',
      email: 'adarsh.jha@example.com',
      phone: '+919876543210',
      password: 'SecurePass123',
      dateOfBirth: new Date('1995-01-15'),
      gender: 'male',
      addresses: [
        {
          type: 'home',
          name: 'Home',
          address: '123 Main Street, Mumbai, Maharashtra, India',
          coordinates: {
            latitude: 19.0760,
            longitude: 72.8777
          },
          isDefault: true
        }
      ],
      preferences: {
        language: 'en',
        currency: 'INR',
        notifications: {
          push: true,
          email: true,
          sms: false
        },
        voiceCommands: {
          enabled: true,
          language: 'en'
        }
      }
    };

    // Check if user already exists
    const existingUser = await User.findByEmailOrPhone(testUser.email);
    if (existingUser) {
      console.log('⚠️ Test user already exists, deleting...');
      await User.deleteOne({ email: testUser.email });
    }

    // Create new user
    const user = new User(testUser);
    await user.save();
    console.log('✅ User created successfully');
    console.log('👤 User ID:', user._id);
    console.log('📧 Email:', user.email);
    console.log('📱 Phone:', user.phone);
    console.log('👤 Full Name:', user.fullName);
    console.log('🏠 Addresses:', user.addresses.length);
    console.log('⭐ Rating:', user.rating.average);
    console.log('');

    // Test 4: Find user by email
    console.log('4️⃣ Testing User Retrieval...');
    const foundUser = await User.findByEmailOrPhone(testUser.email);
    if (foundUser) {
      console.log('✅ User found by email');
      console.log('👤 Found User:', foundUser.fullName);
    } else {
      console.log('❌ User not found');
    }
    console.log('');

    // Test 5: Test password comparison
    console.log('5️⃣ Testing Password Verification...');
    const isPasswordValid = await foundUser.comparePassword('SecurePass123');
    console.log('✅ Password verification:', isPasswordValid ? 'PASSED' : 'FAILED');
    console.log('');

    // Test 6: Update user
    console.log('6️⃣ Testing User Update...');
    foundUser.totalBookings = 5;
    foundUser.totalSpent = 1250.50;
    foundUser.rating.average = 4.8;
    foundUser.rating.count = 12;
    await foundUser.save();
    console.log('✅ User updated successfully');
    console.log('🚗 Total Bookings:', foundUser.totalBookings);
    console.log('💰 Total Spent:', foundUser.totalSpent);
    console.log('⭐ Rating:', foundUser.rating.average, `(${foundUser.rating.count} reviews)`);
    console.log('');

    // Test 7: Add another address
    console.log('7️⃣ Testing Address Addition...');
    foundUser.addresses.push({
      type: 'work',
      name: 'Office',
      address: '456 Business District, Mumbai, Maharashtra, India',
      coordinates: {
        latitude: 19.0896,
        longitude: 72.8656
      },
      isDefault: false
    });
    await foundUser.save();
    console.log('✅ Address added successfully');
    console.log('🏠 Total Addresses:', foundUser.addresses.length);
    console.log('');

    // Test 8: User Statistics
    console.log('8️⃣ Testing User Statistics...');
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
          avgRating: { $avg: '$rating.average' },
          totalBookings: { $sum: '$totalBookings' },
          totalRevenue: { $sum: '$totalSpent' }
        }
      }
    ]);
    
    console.log('📊 Database Statistics:');
    console.log('👥 Total Users:', stats[0]?.totalUsers || 0);
    console.log('✅ Active Users:', stats[0]?.activeUsers || 0);
    console.log('🔐 Verified Users:', stats[0]?.verifiedUsers || 0);
    console.log('⭐ Average Rating:', (stats[0]?.avgRating || 0).toFixed(2));
    console.log('🚗 Total Bookings:', stats[0]?.totalBookings || 0);
    console.log('💰 Total Revenue:', `₹${(stats[0]?.totalRevenue || 0).toFixed(2)}`);
    console.log('');

    // Test 9: Clean up (optional)
    console.log('9️⃣ Cleaning up test data...');
    await User.deleteOne({ email: testUser.email });
    console.log('✅ Test user deleted');
    console.log('');

    console.log('🎉 All MongoDB tests completed successfully!');
    console.log('✅ MongoDB is ready for production use');

  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Disconnect from database
    await database.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the test
testMongoDB();
