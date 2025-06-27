# Cab Booking API Documentation

## MongoDB Configuration

### Environment Variables (.env)
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/CabBooking
MONGODB_DB_NAME=CabBooking

# Security
JWT_SECRET=cab_booking_jwt_secret_key_2024_secure_random_string
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
```

### Database Structure
- **Database Name**: `CabBooking`
- **Collection**: `Users`
- **Connection String**: `mongodb://localhost:27017/CabBooking`

## User API Endpoints

### Base URL
```
http://localhost:3000/api/users
```

### 1. Register User
**POST** `/api/users/register`

**Description**: Create a new user account

**Request Body**:
```json
{
  "firstName": "Adarsh",
  "lastName": "Jha",
  "email": "adarsh.jha@example.com",
  "phone": "+919876543210",
  "password": "SecurePass123",
  "dateOfBirth": "1995-01-15",
  "gender": "male"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "firstName": "Adarsh",
      "lastName": "Jha",
      "email": "adarsh.jha@example.com",
      "phone": "+919876543210",
      "fullName": "Adarsh Jha",
      "isActive": true,
      "isVerified": false,
      "rating": {
        "average": 5.0,
        "count": 0
      },
      "createdAt": "2024-06-26T10:30:00.000Z",
      "updatedAt": "2024-06-26T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login User
**POST** `/api/users/login`

**Description**: Authenticate user and get access token

**Request Body**:
```json
{
  "identifier": "adarsh.jha@example.com",
  "password": "SecurePass123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "firstName": "Adarsh",
      "lastName": "Jha",
      "email": "adarsh.jha@example.com",
      "fullName": "Adarsh Jha",
      "lastLogin": "2024-06-26T10:35:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get User Profile
**GET** `/api/users/profile`

**Description**: Get current user's profile

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "firstName": "Adarsh",
      "lastName": "Jha",
      "email": "adarsh.jha@example.com",
      "phone": "+919876543210",
      "fullName": "Adarsh Jha",
      "addresses": [],
      "preferences": {
        "language": "en",
        "currency": "USD",
        "notifications": {
          "push": true,
          "email": true,
          "sms": false
        },
        "voiceCommands": {
          "enabled": true,
          "language": "en"
        }
      },
      "rating": {
        "average": 5.0,
        "count": 0
      },
      "totalBookings": 0,
      "totalSpent": 0
    }
  }
}
```

### 4. Update User Profile
**PUT** `/api/users/:userId/profile`

**Description**: Update user profile information

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "firstName": "Adarsh Kumar",
  "lastName": "Jha",
  "dateOfBirth": "1995-01-15",
  "gender": "male",
  "profilePicture": "https://example.com/profile.jpg"
}
```

### 5. Add User Address
**POST** `/api/users/:userId/addresses`

**Description**: Add a new address to user profile

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "type": "home",
  "name": "Home",
  "address": "123 Main Street, Mumbai, Maharashtra, India",
  "coordinates": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "isDefault": true
}
```

### 6. Update User Preferences
**PUT** `/api/users/:userId/preferences`

**Description**: Update user app preferences

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "language": "hi",
  "currency": "INR",
  "notifications": {
    "push": true,
    "email": false,
    "sms": true
  },
  "voiceCommands": {
    "enabled": true,
    "language": "hi"
  }
}
```

### 7. Change Password
**PUT** `/api/users/:userId/password`

**Description**: Change user password

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456",
  "confirmPassword": "NewSecurePass456"
}
```

### 8. Get User Statistics
**GET** `/api/users/stats`

**Description**: Get user statistics (for analytics)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeUsers": 142,
    "verifiedUsers": 89,
    "avgRating": 4.6
  }
}
```

## Health Check Endpoints

### Database Health Check
**GET** `/api/health/detailed`

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2024-06-26T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "groq": {
      "status": "healthy",
      "message": "Connected successfully"
    },
    "mongodb": {
      "status": "connected",
      "message": "MongoDB is healthy",
      "database": "CabBooking",
      "host": "localhost:27017",
      "readyState": 1
    }
  },
  "memory": {
    "rss": "45 MB",
    "heapTotal": "20 MB",
    "heapUsed": "15 MB",
    "external": "2 MB"
  }
}
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Access token is required"
}
```

### User Already Exists (400)
```json
{
  "success": false,
  "message": "User already exists with this email or phone number"
}
```

### User Not Found (404)
```json
{
  "success": false,
  "message": "User not found"
}
```

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Adarsh",
    "lastName": "Jha",
    "email": "adarsh.jha@example.com",
    "phone": "+919876543210",
    "password": "SecurePass123"
  }'
```

### Login User
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "adarsh.jha@example.com",
    "password": "SecurePass123"
  }'
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## MongoDB Compass Connection

1. **Open MongoDB Compass**
2. **Connection String**: `mongodb://localhost:27017`
3. **Database**: `CabBooking`
4. **Collection**: `users`

You should see your user data in the `users` collection with the structure defined in the User model.
