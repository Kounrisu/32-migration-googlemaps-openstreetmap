import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookingService } from '../../core/booking.service';
import { Slot } from '../../core/models';
import { OfficeService } from '../../core/office.service';

@Component({
  selector: 'app-booking',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking {
  /** Bound from the route param `:officeId` (withComponentInputBinding). */
  readonly officeId = input.required<string>();

  private readonly offices = inject(OfficeService);
  private readonly bookings = inject(BookingService);

  protected readonly office = computed(() => this.offices.byId(this.officeId()));
  protected readonly slots = computed(() => this.offices.slots(this.officeId()));
  protected readonly days = computed(() => {
    const byDay = new Map<string, Slot[]>();
    for (const s of this.slots()) {
      const key = s.start.slice(0, 10) + '|' + new Date(s.start).toDateString();
      byDay.set(key, [...(byDay.get(key) ?? []), s]);
    }
    return [...byDay.entries()].map(([key, slots]) => ({ key, date: slots[0].start, slots }));
  });

  protected readonly chosen = signal<Slot | null>(null);
  protected readonly fullName = signal('');
  protected readonly email = signal('');
  protected readonly confirmation = signal<{ reference: string } | null>(null);

  protected submit(): void {
    const office = this.office();
    const slot = this.chosen();
    if (!office || !slot || !this.fullName().trim() || !this.email().includes('@')) return;
    this.confirmation.set(this.bookings.book(office, slot, this.fullName().trim(), this.email().trim()));
  }
}
