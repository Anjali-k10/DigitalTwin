# LifeTwin Backend - Scalable SaaS Architecture Guide

## 🏗️ Architecture Overview

This backend follows **layered architecture** pattern for maximum scalability and maintainability.

```
┌─────────────────────────────────────────────────┐
│          Routes Layer (routes/)                 │
│     Defines API endpoints and HTTP methods      │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│      Controllers Layer (controllers/)           │
│   Business logic and request handling          │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│    Middleware Layer (middleware/)               │
│   Authentication, validation, error handling   │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│      Models Layer (models/)                    │
│    Data schema and validation                  │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│    Database Layer (MongoDB + Mongoose)         │
│           Data persistence                     │
└─────────────────────────────────────────────────┘
```

---

## 📚 Design Patterns Used

### 1. **MVC (Model-View-Controller)**
- **Models**: Define data schemas (User.js)
- **Controllers**: Handle business logic (authController.js)
- **Views**: JSON responses from API

### 2. **Middleware Pattern**
Separate concerns into reusable middleware:
- Authentication middleware for protected routes
- CORS middleware for cross-origin requests
- Error handler middleware for consistent error responses

### 3. **Singleton Pattern**
Database and Firebase connections initialized once and reused throughout the app.

### 4. **Factory Pattern**
`generateToken()` factory function creates JWT tokens with consistent configuration.

---

## 🎯 Scalability Principles

### 1. **Horizontal Scaling**
- Stateless authentication using JWT (no server sessions)
- Database is separate from application server
- Each server instance is identical

```
┌─────────┐
│ Server 1│ ──┐
└─────────┘   │
              ├──→ MongoDB (shared)
┌─────────┐   │
│ Server 2│ ──┤
└─────────┘   │
              │
┌─────────┐   │
│ Server 3│ ──┘
└─────────┘
```

### 2. **Database Optimization**
```javascript
// Indexes for faster queries
userSchema.index({ email: 1 });           // For login queries
userSchema.index({ createdAt: 1 });       // For sorting
userSchema.index({ isActive: 1 });        // For user filtering

// Lean queries for read-only operations
User.findById(id).lean();  // Faster, returns plain JS object

// Projection to exclude unnecessary fields
User.find({}, '-password -verificationToken');
```

### 3. **Asynchronous Processing**
```javascript
// All database operations are async
// Errors are caught and passed to error handler
router.post('/signup', asyncHandler(async (req, res) => {
  // Async code here
  // Errors automatically caught
}));
```

### 4. **Resource Pooling**
```javascript
// MongoDB connection is pooled and reused
// Pool size automatically managed by MongoDB driver
await mongoose.connect(mongoURI, {
  maxPoolSize: 10,           // Default pool size
  minPoolSize: 2,
});
```

---

## 🔐 Security Architecture

### 1. **Authentication Layer**
```
┌─────────────────────────────────────────────┐
│  Client sends credentials                   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Controller: Validate email & password      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Model: Compare password hash               │
└─────────────────┬───────────────────────────┘
                  │
        Yes ◄─────┴─────► No
        │                 │
   ┌────▼─────┐      ┌────▼──────────┐
   │ Generate │      │ Return 401    │
   │ JWT      │      │ Unauthorized  │
   └────┬─────┘      └───────────────┘
        │
   ┌────▼──────────────────────────┐
   │ Return token to client        │
   └──────────────────────────────┘
```

### 2. **Password Security**
```javascript
// Before saving: bcryptjs hashes with salt rounds
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
  next();
});

// When verifying: Compare with hash
const isValid = await bcrypt.compare(plainPassword, hash);
```

### 3. **Account Protection**
```javascript
// Lockout mechanism
failedLoginAttempts: 0
lockoutUntil: null

// After 5 failed attempts: Lock for 30 minutes
if (user.failedLoginAttempts >= 5) {
  user.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000);
}
```

---

## 🚀 Performance Optimization

### 1. **Query Optimization**
```javascript
// ❌ Bad: Fetch all fields
User.findById(id);

// ✅ Good: Select only needed fields
User.findById(id, 'firstName lastName email');

// ✅ Better: Use lean() for read-only
User.findById(id).lean();
```

### 2. **Pagination (Ready to implement)**
```javascript
// Future implementation pattern
const page = req.query.page || 1;
const limit = 10;
const skip = (page - 1) * limit;

Users.find().skip(skip).limit(limit);
```

### 3. **Caching Strategy**
```javascript
// Future: Add Redis for caching
// Cache user profile for 1 hour
// Cache frequent queries
```

### 4. **Connection Pooling**
MongoDB driver automatically manages connection pool:
- Connections are reused
- No need to reconnect for each request
- Configured in Mongoose connect options

---

## 📊 Data Modeling Best Practices

### 1. **Schema Design**
```javascript
// ✅ Good: Normalize related data
user: {
  firstName: String,
  lastName: String,
  profile: {
    bio: String,
    profilePhoto: String
  }
}

// ✅ Good: Include metadata
createdAt: Date,
updatedAt: Date,
lastLogin: Date

// ❌ Avoid: Storing too much data
// ❌ Avoid: Deeply nested structures
```

### 2. **Validation**
```javascript
// Schema-level validation
firstName: {
  type: String,
  required: [true, 'First name is required'],
  maxlength: [50, 'Cannot exceed 50 characters']
}

// Application-level validation in controller
if (password.length < 6) {
  return res.status(400).json({ error: 'Password too short' });
}
```

### 3. **Indexing Strategy**
```javascript
// Create indexes on frequently searched fields
userSchema.index({ email: 1 });           // For lookups
userSchema.index({ createdAt: -1 });      // For sorting
userSchema.index({ isActive: 1 });        // For filtering
```

---

## 🔄 Error Handling Strategy

### 1. **Centralized Error Handler**
```javascript
// All errors flow to one place
app.use(errorHandler);

// Consistent error format
{
  success: false,
  message: "User-friendly message",
  code: "ERROR_CODE"
}
```

### 2. **Error Categorization**
```
┌─────────────────────────────────────┐
│ Validation Error (400)              │
├─────────────────────────────────────┤
│ Authentication Error (401)          │
├─────────────────────────────────────┤
│ Authorization Error (403)           │
├─────────────────────────────────────┤
│ Not Found Error (404)               │
├─────────────────────────────────────┤
│ Conflict Error (409)                │
├─────────────────────────────────────┤
│ Server Error (500)                  │
└─────────────────────────────────────┘
```

### 3. **Async Error Wrapping**
```javascript
// Prevents unhandled promise rejections
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
router.post('/endpoint', asyncHandler(controllerFunction));
```

---

## 🎓 Extending for Additional Features

### Add User Roles & Permissions
```javascript
// models/User.js
role: {
  type: String,
  enum: ['user', 'moderator', 'admin'],
  default: 'user'
}

// middleware/auth.js - Add role check
export const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// routes/auth.js
router.delete('/users/:id', 
  authenticateToken, 
  authorize(['admin']), 
  deleteUser
);
```

### Add Email Verification
```javascript
// models/User.js - Add verification fields
verificationToken: String,
emailVerified: Boolean,

// controllers/authController.js - Send email on signup
const token = crypto.randomBytes(32).toString('hex');
user.verificationToken = token;
// Send email with token link
// Verify when user clicks link
```

### Add Password Reset
```javascript
// routes/auth.js
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password/:token', asyncHandler(resetPassword));

// controllers/authController.js
// Generate reset token
// Send via email
// Validate and update password
```

### Add Profile Photo Upload
```javascript
// Using multer for file upload
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

router.put('/profile/photo', 
  authenticateToken, 
  upload.single('photo'), 
  uploadProfilePhoto
);
```

---

## 📊 Monitoring & Logging

### Ready to Add
```javascript
// Setup logging with Winston
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('User logged in', { userId: user._id });
logger.error('Database error', error);
```

---

## 🚀 Deployment Checklist

### Before Deploying to Production

- [ ] Set `NODE_ENV=production`
- [ ] Use secure JWT_SECRET (long, random string)
- [ ] Use MongoDB Atlas (not localhost)
- [ ] Enable MongoDB IP whitelist
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS on frontend
- [ ] Add rate limiting
- [ ] Setup error logging (Sentry)
- [ ] Setup monitoring/alerting
- [ ] Test all endpoints
- [ ] Load test the API

### Production Environment Variables
```
NODE_ENV=production
PORT=3000 (or your platform's port)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lifetwin
JWT_SECRET=<very-long-random-secure-string>
JWT_EXPIRE=7d
CORS_ORIGIN=https://yourdomain.com
```

---

## 📈 Scalability Roadmap

**Phase 1: Current** ✅
- User authentication
- Profile management
- JWT tokens

**Phase 2: Soon**
- Email verification
- Password reset
- Social authentication
- User roles & permissions

**Phase 3: Growth**
- Rate limiting
- Caching layer (Redis)
- Message queue (Bull/BullMQ)
- Search functionality (Elasticsearch)

**Phase 4: Enterprise**
- Microservices architecture
- API gateway
- Event-driven architecture
- Distributed caching

---

## 🎯 SaaS-Specific Features to Add

1. **Subscription Management**
   - Stripe integration
   - Subscription plans
   - Billing history

2. **Usage Tracking**
   - API usage metrics
   - Feature usage analytics
   - Quota management

3. **Tenant Isolation**
   - Multi-tenancy support
   - Data segregation
   - Tenant-specific APIs

4. **Audit Logging**
   - Track all user actions
   - Compliance requirements
   - Security analysis

---

## ✨ Summary

Your backend is built with:
✅ Clean architecture (separation of concerns)
✅ Security best practices
✅ Error handling
✅ Scalable structure
✅ Production-ready code
✅ Ready for growth

**Build on this foundation with confidence! 🚀**
