// File: logic/bookingFSM.ts
import type { BookingState } from '../types/BookingState';

// Add this function to extract booking details from user input
export const extractBookingDetails = (input: string, currentState: BookingState): BookingState => {
  const updatedState = { ...currentState };
  
  // Extract destination if not already set
  if (!updatedState.destination) {
    const destinationMatch = input.match(/to\s+([A-Za-z\s-]+)(?:\s+from|\s*$)/i);
    if (destinationMatch) {
      updatedState.destination = destinationMatch[1].trim();
    }
  }
  
  // Extract pickup location if not already set
  if (!updatedState.pickup) {
    const pickupMatch = input.match(/from\s+([A-Za-z\s-]+)(?:\s+on|\s+at|\s*$)/i);
    if (pickupMatch) {
      updatedState.pickup = pickupMatch[1].trim();
    }
  }
  
  // Extract date if not already set
  if (!updatedState.date) {
    if (input.toLowerCase().includes('today')) {
      updatedState.date = 'today';
    } else if (input.toLowerCase().includes('tomorrow')) {
      updatedState.date = 'tomorrow';
    } else {
      const dateMatch = input.match(/on\s+([A-Za-z0-9\s,]+)(?:\s+at|\s*$)/i);
      if (dateMatch) {
        updatedState.date = dateMatch[1].trim();
      }
    }
  }
  
  // Extract time if not already set
  if (!updatedState.time) {
    const timeMatch = input.match(/at\s+([0-9:]+\s*(?:am|pm)?)/i);
    if (timeMatch) {
      updatedState.time = timeMatch[1].trim();
    }
  }
  
  return updatedState;
};

export const getNextPrompt = (state: BookingState): string | null => {
  if (!state.destination) return 'Where do you want to go?';
  if (!state.pickup) return 'Where should I pick you up from?';
  if (!state.date) return 'On which date would you like to travel?';
  if (!state.time) return 'What time should I schedule the cab for?';
  return null; // ready to confirm booking
};

export const isBookingComplete = (state: BookingState): boolean => {
  return !!(state.intent && state.pickup && state.destination && state.date && state.time);
};
