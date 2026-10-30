export interface BookingDates {
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
}

/** Body sent to POST/PUT /booking and returned by GET /booking/:id. */
export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

/** Response from POST /booking. */
export interface CreateBookingResponse {
  bookingid: number;
  booking: Booking;
}

/** Request body for POST /auth. */
export interface AuthRequest {
  username: string;
  password: string;
}

/** Response from POST /auth: a token, or a reason when the login failed. */
export interface AuthResponse {
  token?: string;
  reason?: string;
}
