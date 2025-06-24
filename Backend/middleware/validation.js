import Joi from 'joi';

// Chat request validation schema
const chatRequestSchema = Joi.object({
  message: Joi.string().required().min(1).max(1000).trim(),
  userId: Joi.string().optional().allow('').default('anonymous'), // Very flexible user ID
  isVoiceInput: Joi.boolean().optional().default(false),
  sessionId: Joi.string().optional()
});

// Booking request validation schema
const bookingRequestSchema = Joi.object({
  userId: Joi.string().required(),
  pickupLocation: Joi.string().required().min(3).max(200),
  destination: Joi.string().required().min(3).max(200),
  pickupTime: Joi.string().required(),
  passengers: Joi.number().integer().min(1).max(8).default(1),
  travelPreference: Joi.string().valid('cheapest', 'fastest', 'luxurious').default('cheapest'),
  specialRequirements: Joi.string().optional().max(500),
  estimatedPrice: Joi.string().optional(),
  phoneNumber: Joi.string().optional().pattern(/^[+]?[1-9][\d\s\-\(\)]{7,15}$/),
  email: Joi.string().optional().email()
});

// Booking status update validation schema
const bookingStatusSchema = Joi.object({
  status: Joi.string().required().valid(
    'confirmed', 
    'driver_assigned', 
    'driver_arrived', 
    'in_progress', 
    'completed', 
    'cancelled'
  ),
  reason: Joi.string().optional().max(500)
});

// Middleware function to validate chat requests
export const validateChatRequest = (req, res, next) => {
  const { error, value } = chatRequestSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      })),
      timestamp: new Date().toISOString()
    });
  }
  
  req.body = value;
  next();
};

// Middleware function to validate booking requests
export const validateBookingRequest = (req, res, next) => {
  const { error, value } = bookingRequestSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      })),
      timestamp: new Date().toISOString()
    });
  }
  
  req.body = value;
  next();
};

// Middleware function to validate booking status updates
export const validateBookingStatus = (req, res, next) => {
  const { error, value } = bookingStatusSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      })),
      timestamp: new Date().toISOString()
    });
  }
  
  req.body = value;
  next();
};

// Generic validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        })),
        timestamp: new Date().toISOString()
      });
    }
    
    req.body = value;
    next();
  };
};

// Export schemas for reuse
export {
  chatRequestSchema,
  bookingRequestSchema,
  bookingStatusSchema
};
