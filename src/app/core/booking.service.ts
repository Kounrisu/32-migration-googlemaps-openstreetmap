import { Injectable, signal } from '@angular/core';
import { Booking, Office, Slot } from './models';

/** In-memory stand-in for the booking back-end (POST /appointments). */
@Injectable({ providedIn: 'root' })
export class BookingService {
  readonly last = signal<Booking | null>(null);

  book(office: Office, slot: Slot, fullName: string, email: string): Booking {
    const booking: Booking = {
      office,
      slot,
      fullName,
      email,
      reference: `RDV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    };
    this.last.set(booking);
    return booking;
  }
}
