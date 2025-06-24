import { v4 as uuidv4 } from 'uuid';

// Request logging middleware
export const requestLogger = (req, res, next) => {
  // Generate unique request ID
  req.id = uuidv4();
  
  // Log request start
  const startTime = Date.now();
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Request ID: ${req.id}`);
  
  // Log request body for non-GET requests (excluding sensitive data)
  if (req.method !== 'GET' && req.body) {
    const logBody = { ...req.body };
    
    // Remove sensitive fields
    if (logBody.password) logBody.password = '[REDACTED]';
    if (logBody.apiKey) logBody.apiKey = '[REDACTED]';
    if (logBody.token) logBody.token = '[REDACTED]';
    
    console.log(`[${new Date().toISOString()}] Request Body:`, JSON.stringify(logBody, null, 2));
  }
  
  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - startTime;
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - Request ID: ${req.id}`);
    
    // Log response body for errors or in development
    if (res.statusCode >= 400 || process.env.NODE_ENV === 'development') {
      const logBody = { ...body };
      
      // Truncate large responses
      if (JSON.stringify(logBody).length > 1000) {
        logBody._truncated = true;
        logBody._originalLength = JSON.stringify(body).length;
      }
      
      console.log(`[${new Date().toISOString()}] Response Body:`, JSON.stringify(logBody, null, 2));
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};

// Performance monitoring middleware
export const performanceLogger = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      console.warn(`[SLOW REQUEST] ${req.method} ${req.url} took ${duration.toFixed(2)}ms`);
    }
    
    // Log memory usage for long requests
    if (duration > 5000) {
      const memUsage = process.memoryUsage();
      console.warn(`[MEMORY] RSS: ${Math.round(memUsage.rss / 1024 / 1024)}MB, Heap: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
    }
  });
  
  next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url} - Request ID: ${req.id}`);
  console.error(`[ERROR] Message: ${err.message}`);
  console.error(`[ERROR] Stack: ${err.stack}`);
  
  // Log additional context
  console.error(`[ERROR] User Agent: ${req.get('User-Agent')}`);
  console.error(`[ERROR] IP: ${req.ip}`);
  console.error(`[ERROR] Timestamp: ${new Date().toISOString()}`);
  
  next(err);
};

// API usage logging
export const apiUsageLogger = (req, res, next) => {
  // Track API endpoint usage
  const endpoint = `${req.method} ${req.route?.path || req.url}`;
  
  // In a real application, you might want to store this in a database
  // or send to an analytics service
  console.log(`[API_USAGE] ${endpoint} - User: ${req.body?.userId || 'anonymous'} - Time: ${new Date().toISOString()}`);
  
  next();
};
