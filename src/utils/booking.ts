import { addMinutes, format, isBefore, isSameDay, parse } from 'date-fns';
import type { AvailabilitySlot, BookingSettings, BusySlot, TimeSlot } from '../types/booking';

export const getBookingDayOfWeek = (date: Date) => {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
};

const defaultSettings: BookingSettings = {
  bufferTimeBefore: 0,
  bufferTimeAfter: 0,
  defaultDuration: 60,
  requireApproval: false,
};

export const formatBookingTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
};

export const buildTimeSlots = ({
  availabilitySlots,
  busySlots = [],
  selectedDate,
  bookingSettings,
  now = new Date(),
}: {
  availabilitySlots: AvailabilitySlot[];
  busySlots?: BusySlot[];
  selectedDate?: Date | null;
  bookingSettings?: BookingSettings;
  now?: Date;
}): TimeSlot[] => {
  if (!selectedDate) {
    return [];
  }

  const dayOfWeek = getBookingDayOfWeek(selectedDate);
  const daySlots = availabilitySlots.filter(
    (slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable
  );

  if (daySlots.length === 0) {
    return [];
  }

  const settings = { ...defaultSettings, ...bookingSettings };
  const parsedBusySlots = busySlots.map((slot) => ({
    start: new Date(slot.start),
    end: new Date(slot.end),
  }));

  const hasConflict = (slotStart: Date, slotEnd: Date) =>
    parsedBusySlots.some((busy) => {
      const bufferedStart = addMinutes(busy.start, -settings.bufferTimeBefore);
      const bufferedEnd = addMinutes(busy.end, settings.bufferTimeAfter);
      return slotStart < bufferedEnd && slotEnd > bufferedStart;
    });

  const slots: TimeSlot[] = [];
  const slotDuration = settings.defaultDuration || defaultSettings.defaultDuration;
  const isToday = isSameDay(selectedDate, now);

  daySlots.forEach((daySlot) => {
    const startTime = parse(daySlot.startTime, 'HH:mm', selectedDate);
    const endTime = parse(daySlot.endTime, 'HH:mm', selectedDate);

    let currentTime = startTime;

    while (isBefore(currentTime, endTime) || currentTime.getTime() === endTime.getTime()) {
      const slotEndTime = addMinutes(currentTime, slotDuration);

      if (isBefore(slotEndTime, endTime) || slotEndTime.getTime() === endTime.getTime()) {
        const isBusy = hasConflict(currentTime, slotEndTime);
        const isPast = isToday && isBefore(currentTime, now);

        slots.push({
          time: format(currentTime, 'HH:mm'),
          available: !isBusy && !isPast,
          isBusy,
        });
      }

      currentTime = addMinutes(
        currentTime,
        slotDuration + settings.bufferTimeBefore + settings.bufferTimeAfter
      );
    }
  });

  slots.sort((a, b) => a.time.localeCompare(b.time));
  return slots;
};
