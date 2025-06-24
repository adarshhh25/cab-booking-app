import { v4 as uuidv4 } from 'uuid';

// In-memory booking storage (use database in production)
const bookings = new Map();

export class BookingService {
  constructor() {
    this.bookings = bookings;
  }

  async createBooking(bookingData) {
    const bookingId = uuidv4();
    const confirmationCode = this.generateConfirmationCode();
    
    const booking = {
      id: bookingId,
      confirmationCode,
      userId: bookingData.userId,
      pickupLocation: bookingData.pickupLocation,
      destination: bookingData.destination,
      pickupTime: bookingData.pickupTime,
      passengers: bookingData.passengers || 1,
      travelPreference: bookingData.travelPreference || 'cheapest',
      specialRequirements: bookingData.specialRequirements || null,
      estimatedPrice: bookingData.estimatedPrice,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Driver details (mock data)
      driver: this.assignMockDriver(),
      
      // Vehicle details (mock data)
      vehicle: this.assignMockVehicle(bookingData.travelPreference),
      
      // Estimated arrival time
      estimatedArrival: this.calculateEstimatedArrival(),
      
      // Status history
      statusHistory: [{
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        message: 'Booking confirmed successfully'
      }]
    };

    this.bookings.set(bookingId, booking);
    
    // Simulate driver assignment after a delay
    setTimeout(() => {
      this.updateBookingStatus(bookingId, 'driver_assigned', 'Driver has been assigned to your booking');
    }, 30000); // 30 seconds

    return booking;
  }

  async getBooking(bookingId) {
    return this.bookings.get(bookingId) || null;
  }

  async getUserBookings(userId) {
    const userBookings = [];
    for (const booking of this.bookings.values()) {
      if (booking.userId === userId) {
        userBookings.push(booking);
      }
    }
    return userBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async updateBookingStatus(bookingId, status, message = null) {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    
    // Add to status history
    booking.statusHistory.push({
      status,
      timestamp: new Date().toISOString(),
      message: message || `Status updated to ${status}`
    });

    // Update estimated arrival for certain statuses
    if (status === 'driver_assigned') {
      booking.estimatedArrival = this.calculateEstimatedArrival(5); // 5 minutes
    } else if (status === 'driver_arrived') {
      booking.estimatedArrival = 'Driver has arrived';
    }

    this.bookings.set(bookingId, booking);
    return booking;
  }

  async cancelBooking(bookingId, reason = null) {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    booking.status = 'cancelled';
    booking.updatedAt = new Date().toISOString();
    booking.cancellationReason = reason;
    
    booking.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      message: reason || 'Booking cancelled by user'
    });

    this.bookings.set(bookingId, booking);
    return booking;
  }

  async getBookingStatus(bookingId) {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    return {
      status: booking.status,
      estimatedArrival: booking.estimatedArrival,
      driver: booking.driver,
      vehicle: booking.vehicle,
      lastUpdated: booking.updatedAt
    };
  }

  // Helper methods
  generateConfirmationCode() {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  assignMockDriver() {
    const drivers = [
      { name: 'Rajesh Kumar', rating: 4.8, phone: '+91-9876543210', experience: '5 years' },
      { name: 'Amit Singh', rating: 4.9, phone: '+91-9876543211', experience: '7 years' },
      { name: 'Priya Sharma', rating: 4.7, phone: '+91-9876543212', experience: '3 years' },
      { name: 'Vikram Patel', rating: 4.6, phone: '+91-9876543213', experience: '4 years' },
      { name: 'Sunita Devi', rating: 4.9, phone: '+91-9876543214', experience: '6 years' }
    ];
    
    return drivers[Math.floor(Math.random() * drivers.length)];
  }

  assignMockVehicle(preference = 'cheapest') {
    const vehicles = {
      cheapest: [
        { model: 'Maruti Swift', color: 'White', number: 'MH 01 AB 1234', type: 'Hatchback' },
        { model: 'Hyundai i10', color: 'Silver', number: 'MH 02 CD 5678', type: 'Hatchback' },
        { model: 'Tata Tiago', color: 'Blue', number: 'MH 03 EF 9012', type: 'Hatchback' }
      ],
      fastest: [
        { model: 'Honda City', color: 'Black', number: 'MH 04 GH 3456', type: 'Sedan' },
        { model: 'Hyundai Verna', color: 'Red', number: 'MH 05 IJ 7890', type: 'Sedan' },
        { model: 'Maruti Ciaz', color: 'Grey', number: 'MH 06 KL 1234', type: 'Sedan' }
      ],
      luxurious: [
        { model: 'Toyota Camry', color: 'Pearl White', number: 'MH 07 MN 5678', type: 'Luxury Sedan' },
        { model: 'BMW 3 Series', color: 'Black', number: 'MH 08 OP 9012', type: 'Luxury Sedan' },
        { model: 'Mercedes C-Class', color: 'Silver', number: 'MH 09 QR 3456', type: 'Luxury Sedan' }
      ]
    };

    const vehicleList = vehicles[preference] || vehicles.cheapest;
    return vehicleList[Math.floor(Math.random() * vehicleList.length)];
  }

  calculateEstimatedArrival(minutes = null) {
    const arrivalMinutes = minutes || Math.floor(Math.random() * 15) + 5; // 5-20 minutes
    const arrivalTime = new Date(Date.now() + arrivalMinutes * 60000);
    return `${arrivalMinutes} minutes (${arrivalTime.toLocaleTimeString()})`;
  }

  // Analytics and reporting methods
  getBookingStats() {
    const stats = {
      total: this.bookings.size,
      byStatus: {},
      byPreference: {},
      totalRevenue: 0
    };

    for (const booking of this.bookings.values()) {
      // Count by status
      stats.byStatus[booking.status] = (stats.byStatus[booking.status] || 0) + 1;
      
      // Count by preference
      stats.byPreference[booking.travelPreference] = (stats.byPreference[booking.travelPreference] || 0) + 1;
      
      // Calculate revenue (extract number from price string)
      if (booking.estimatedPrice) {
        const price = parseFloat(booking.estimatedPrice.replace(/[^\d.]/g, ''));
        if (!isNaN(price)) {
          stats.totalRevenue += price;
        }
      }
    }

    return stats;
  }
}
