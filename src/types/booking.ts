export interface AvailabilitySlot {
  id: number;
  dayOfWeek: number; // 0 = Monday, 6 = Sunday
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface BusySlot {
  start: string;
  end: string;
}

export interface BookingSettings {
  requireApproval: boolean;
  bufferTimeBefore: number;
  bufferTimeAfter: number;
  defaultDuration: number;
}

export interface PublicBookingSettings extends BookingSettings {
  allowPublicBooking: boolean;
  bookingUrl?: string | null;
}

export interface PublicBookingInfo {
  pharmacist: {
    id: number;
    name: string;
    email: string;
  };
  bookingSettings: PublicBookingSettings;
  availability: AvailabilitySlot[];
  busySlots: BusySlot[];
}
