import express from 'express';
import { BookingService } from '../services/bookingService.js';
import { validateBookingRequest } from '../middleware/validation.js';

const router = express.Router();
const bookingService = new BookingService();

// Get all bookings for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await bookingService.getUserBookings(userId);
    
    res.json({
      bookings,
      count: bookings.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      error: 'Failed to get bookings',
      message: error.message
    });
  }
});

// Get specific booking details
router.get('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await bookingService.getBooking(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        error: 'Booking not found',
        bookingId
      });
    }
    
    res.json({
      booking,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      error: 'Failed to get booking',
      message: error.message
    });
  }
});

// Create a new booking
router.post('/', validateBookingRequest, async (req, res) => {
  try {
    const bookingData = req.body;
    const booking = await bookingService.createBooking(bookingData);
    
    res.status(201).json({
      booking,
      message: 'Booking created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      error: 'Failed to create booking',
      message: error.message
    });
  }
});

// Update booking status
router.patch('/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;
    
    const validStatuses = ['confirmed', 'driver_assigned', 'driver_arrived', 'in_progress', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        validStatuses
      });
    }
    
    const updatedBooking = await bookingService.updateBookingStatus(bookingId, status, reason);
    
    res.json({
      booking: updatedBooking,
      message: `Booking status updated to ${status}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      error: 'Failed to update booking status',
      message: error.message
    });
  }
});

// Cancel booking
router.delete('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    
    const cancelledBooking = await bookingService.cancelBooking(bookingId, reason);
    
    res.json({
      booking: cancelledBooking,
      message: 'Booking cancelled successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      error: 'Failed to cancel booking',
      message: error.message
    });
  }
});

// Get booking status updates (for real-time tracking)
router.get('/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const status = await bookingService.getBookingStatus(bookingId);
    
    res.json({
      bookingId,
      status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get booking status error:', error);
    res.status(500).json({
      error: 'Failed to get booking status',
      message: error.message
    });
  }
});

export default router;
