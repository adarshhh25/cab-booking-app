import express from 'express';
import Groq from 'groq-sdk';
import database from '../config/database.js';

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Detailed health check with external dependencies
router.get('/detailed', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {}
  };

  // Check Groq API connectivity
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
    
    // Simple test call to Groq
    await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'test' }],
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1
    });
    
    health.services.groq = {
      status: 'healthy',
      message: 'Connected successfully'
    };
  } catch (error) {
    health.services.groq = {
      status: 'unhealthy',
      message: error.message
    };
    health.status = 'degraded';
  }

  // Check MongoDB connectivity
  try {
    const dbHealth = await database.healthCheck();
    health.services.mongodb = dbHealth;

    if (dbHealth.status !== 'connected') {
      health.status = 'degraded';
    }
  } catch (error) {
    health.services.mongodb = {
      status: 'error',
      message: error.message
    };
    health.status = 'degraded';
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  health.memory = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)} MB`
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Readiness probe (for Kubernetes/Docker)
router.get('/ready', async (req, res) => {
  // Check if the application is ready to serve requests
  const isReady = process.env.GROQ_API_KEY &&
                  process.uptime() > 5 &&
                  database.isConnectionActive();
  
  if (isReady) {
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      reason: 'Application still starting up or missing configuration'
    });
  }
});

// Liveness probe (for Kubernetes/Docker)
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
