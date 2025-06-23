// File: types/BookingState.ts
export type BookingState = {
  intent: 'book_cab';
  pickup?: string;
  destination?: string;
  time?: string;
  date?: string;
};
