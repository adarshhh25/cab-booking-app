export class PriceCalculator {
  constructor() {
    // Base rates per km in INR
    this.baseRates = {
      cheapest: 12,   // ₹12 per km
      fastest: 18,    // ₹18 per km  
      luxurious: 35   // ₹35 per km
    };

    // Surge pricing multipliers
    this.surgeMultipliers = {
      low: 1.0,
      medium: 1.3,
      high: 1.8,
      peak: 2.2
    };

    // Time-based multipliers
    this.timeMultipliers = {
      earlyMorning: 1.1,  // 5 AM - 8 AM
      morning: 1.0,       // 8 AM - 11 AM
      afternoon: 1.0,     // 11 AM - 5 PM
      evening: 1.2,       // 5 PM - 9 PM
      night: 1.3,         // 9 PM - 12 AM
      lateNight: 1.5      // 12 AM - 5 AM
    };

    // Popular locations in Mumbai with coordinates
    this.locations = {
      'malad': { lat: 19.1876, lng: 72.8454, area: 'western'},
      'mulund': { lat: 19.1765, lng: 72.9475, area: 'central'},
      'nahur': { lat: 19.1553, lng: 72.9438, area: 'central'},
      'bhandup': { lat: 19.1624, lng: 72.9376, area: 'central'},
      'malad west': { lat: 19.1876, lng: 72.8454, area: 'western' },
      'malad east': { lat: 19.1876, lng: 72.8654, area: 'western' },
      'andheri': { lat: 19.1136, lng: 72.8697, area: 'western' },
      'andheri west': { lat: 19.1136, lng: 72.8697, area: 'western' },
      'andheri east': { lat: 19.1136, lng: 72.8697, area: 'western' },
      'bandra': { lat: 19.0596, lng: 72.8295, area: 'western' },
      'mumbai airport': { lat: 19.0896, lng: 72.8656, area: 'western' },
      'chhatrapati shivaji airport': { lat: 19.0896, lng: 72.8656, area: 'western' },
      'bkc': { lat: 19.0728, lng: 72.8826, area: 'central' },
      'bandra kurla complex': { lat: 19.0728, lng: 72.8826, area: 'central' },
      'powai': { lat: 19.1197, lng: 72.9056, area: 'central' },
      'ghatkopar': { lat: 19.0864, lng: 72.9081, area: 'central' },
      'thane': { lat: 19.2183, lng: 72.9781, area: 'central' },
      'navi mumbai': { lat: 19.0330, lng: 73.0297, area: 'central' },
      'churchgate': { lat: 19.0330, lng: 72.8270, area: 'south' },
      'marine drive': { lat: 19.0216, lng: 72.8232, area: 'south' },
      'colaba': { lat: 18.9067, lng: 72.8147, area: 'south' },
      'fort': { lat: 19.0330, lng: 72.8397, area: 'south' },
      'nariman point': { lat: 19.0216, lng: 72.8232, area: 'south' },
      'worli': { lat: 19.0176, lng: 72.8162, area: 'south' },
      'lower parel': { lat: 19.0008, lng: 72.8300, area: 'central' },
      'dadar': { lat: 19.0176, lng: 72.8562, area: 'central' },
      'kurla': { lat: 19.0728, lng: 72.8826, area: 'central' },
      'vikhroli': { lat: 19.1075, lng: 72.9200, area: 'central' },
      'borivali': { lat: 19.2307, lng: 72.8567, area: 'western' },
      'kandivali': { lat: 19.2095, lng: 72.8526, area: 'western' },
      'goregaon': { lat: 19.1663, lng: 72.8526, area: 'western' },
      'jogeshwari': { lat: 19.1347, lng: 72.8478, area: 'western' },
      'vile parle': { lat: 19.1075, lng: 72.8263, area: 'western' },
      'santacruz': { lat: 19.0825, lng: 72.8417, area: 'western' },
      'khar': { lat: 19.0728, lng: 72.8397, area: 'western' }
    };
  }

  calculatePrice(pickupLocation, destination, preference = 'cheapest') {
    try {
      // Calculate distance
      const distance = this.calculateDistance(pickupLocation, destination);
      
      // Get base rate
      const baseRate = this.baseRates[preference] || this.baseRates.cheapest;
      
      // Calculate base price
      let price = distance * baseRate;
      
      // Add minimum fare
      const minimumFare = this.getMinimumFare(preference);
      price = Math.max(price, minimumFare);
      
      // Apply time-based multiplier
      const timeMultiplier = this.getTimeMultiplier();
      price *= timeMultiplier;
      
      // Apply surge pricing
      const surgeMultiplier = this.getSurgeMultiplier(pickupLocation, destination);
      price *= surgeMultiplier;
      
      // Add tolls if applicable
      const tollCharges = this.calculateTolls(pickupLocation, destination);
      price += tollCharges;
      
      // Round to nearest rupee
      return Math.round(price);
      
    } catch (error) {
      console.error('Price calculation error:', error);
      // Return default price based on preference
      return this.getDefaultPrice(preference);
    }
  }

  calculateDistance(pickup, destination) {
    const pickupCoords = this.getLocationCoordinates(pickup);
    const destCoords = this.getLocationCoordinates(destination);
    
    if (!pickupCoords || !destCoords) {
      // Return default distance if locations not found
      return 15; // 15 km default
    }
    
    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(destCoords.lat - pickupCoords.lat);
    const dLng = this.toRadians(destCoords.lng - pickupCoords.lng);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(pickupCoords.lat)) * Math.cos(this.toRadians(destCoords.lat)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // Add 20% for actual road distance vs straight line
    return distance * 1.2;
  }

  getLocationCoordinates(locationName) {
    const normalizedName = locationName.toLowerCase().trim();
    
    // Direct match
    if (this.locations[normalizedName]) {
      return this.locations[normalizedName];
    }
    
    // Partial match
    for (const [key, coords] of Object.entries(this.locations)) {
      if (key.includes(normalizedName) || normalizedName.includes(key)) {
        return coords;
      }
    }
    
    return null;
  }

  getMinimumFare(preference) {
    const minimumFares = {
      cheapest: 50,   // ₹50
      fastest: 80,    // ₹80
      luxurious: 150  // ₹150
    };
    
    return minimumFares[preference] || minimumFares.cheapest;
  }

  getTimeMultiplier() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 8) return this.timeMultipliers.earlyMorning;
    if (hour >= 8 && hour < 11) return this.timeMultipliers.morning;
    if (hour >= 11 && hour < 17) return this.timeMultipliers.afternoon;
    if (hour >= 17 && hour < 21) return this.timeMultipliers.evening;
    if (hour >= 21 && hour < 24) return this.timeMultipliers.night;
    return this.timeMultipliers.lateNight;
  }

  getSurgeMultiplier(pickup, destination) {
    // Simplified surge pricing logic
    const hour = new Date().getHours();
    const day = new Date().getDay();
    
    // Peak hours: 8-10 AM, 6-9 PM on weekdays
    if (day >= 1 && day <= 5) { // Monday to Friday
      if ((hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21)) {
        return this.surgeMultipliers.high;
      }
    }
    
    // Weekend evenings
    if (day === 0 || day === 6) { // Sunday or Saturday
      if (hour >= 19 && hour <= 23) {
        return this.surgeMultipliers.medium;
      }
    }
    
    // Airport routes during peak times
    if (this.isAirportRoute(pickup, destination)) {
      if ((hour >= 6 && hour <= 9) || (hour >= 17 && hour <= 22)) {
        return this.surgeMultipliers.medium;
      }
    }
    
    return this.surgeMultipliers.low;
  }

  calculateTolls(pickup, destination) {
    // Simplified toll calculation
    const pickupCoords = this.getLocationCoordinates(pickup);
    const destCoords = this.getLocationCoordinates(destination);
    
    if (!pickupCoords || !destCoords) return 0;
    
    // Check if route likely involves toll roads
    const distance = this.calculateDistance(pickup, destination);
    
    // Long distance routes (>25km) likely use expressways
    if (distance > 25) {
      return 50; // ₹50 toll
    }
    
    // Cross-zone travel
    if (pickupCoords.area !== destCoords.area) {
      return 25; // ₹25 toll
    }
    
    return 0;
  }

  isAirportRoute(pickup, destination) {
    const airportKeywords = ['airport', 'terminal', 'chhatrapati shivaji'];
    const pickupLower = pickup.toLowerCase();
    const destLower = destination.toLowerCase();
    
    return airportKeywords.some(keyword => 
      pickupLower.includes(keyword) || destLower.includes(keyword)
    );
  }

  getDefaultPrice(preference) {
    const defaultPrices = {
      cheapest: 120,
      fastest: 180,
      luxurious: 350
    };
    
    return defaultPrices[preference] || defaultPrices.cheapest;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Get price breakdown for transparency
  getPriceBreakdown(pickupLocation, destination, preference = 'cheapest') {
    const distance = this.calculateDistance(pickupLocation, destination);
    const baseRate = this.baseRates[preference] || this.baseRates.cheapest;
    const basePrice = distance * baseRate;
    const minimumFare = this.getMinimumFare(preference);
    const adjustedBasePrice = Math.max(basePrice, minimumFare);
    
    const timeMultiplier = this.getTimeMultiplier();
    const surgeMultiplier = this.getSurgeMultiplier(pickupLocation, destination);
    const tollCharges = this.calculateTolls(pickupLocation, destination);
    
    const finalPrice = Math.round((adjustedBasePrice * timeMultiplier * surgeMultiplier) + tollCharges);
    
    return {
      distance: Math.round(distance * 10) / 10,
      baseRate,
      basePrice: Math.round(adjustedBasePrice),
      timeMultiplier,
      surgeMultiplier,
      tollCharges,
      finalPrice,
      breakdown: {
        baseFare: Math.round(adjustedBasePrice),
        timeAdjustment: Math.round(adjustedBasePrice * (timeMultiplier - 1)),
        surgeAdjustment: Math.round(adjustedBasePrice * timeMultiplier * (surgeMultiplier - 1)),
        tolls: tollCharges,
        total: finalPrice
      }
    };
  }
}
