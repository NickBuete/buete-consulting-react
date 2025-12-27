import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Alert, AlertDescription } from '../ui/Alert';
import { Calendar as CalendarIcon, Clock, Loader2, CheckCircle } from 'lucide-react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';

interface AvailabilitySlot {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const bookingSchema = z.object({
  // Patient Information
  patientFirstName: z.string().min(1, 'First name is required'),
  patientLastName: z.string().min(1, 'Last name is required'),
  patientPhone: z.string().min(10, 'Valid phone number is required'),
  patientEmail: z.string().optional().refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: 'Valid email is required',
  }),

  // Referrer Information
  referrerName: z.string().min(1, 'Referrer name is required'),
  referrerEmail: z.string().optional().refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: 'Valid email is required',
  }),
  referrerPhone: z.string().optional(),
  referrerClinic: z.string().optional(),

  // Appointment Details
  referralReason: z.string().optional(),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface InlineBookingWidgetProps {
  pharmacistId: number;
  onBookingComplete?: () => void;
  showTitle?: boolean;
}

export const InlineBookingWidget: React.FC<InlineBookingWidgetProps> = ({
  pharmacistId,
  onBookingComplete,
  showTitle = true,
}) => {
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<'date' | 'time' | 'form' | 'success'>('date');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  // Generate next 14 days for quick selection
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pharmacistId]);

  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, availabilitySlots]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(
        `${apiUrl}/api/booking/availability?userId=${pharmacistId}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }

      const data = await response.json();
      setAvailabilitySlots(data);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (date: Date) => {
    const dayOfWeek = (date.getDay() + 6) % 7; // Convert to Monday=0
    const slotsForDay = availabilitySlots.filter(
      (slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable
    );

    const slots: TimeSlot[] = [];
    const slotDuration = 60; // Default 60 minutes

    slotsForDay.forEach((availSlot) => {
      const [startHour, startMin] = availSlot.startTime.split(':').map(Number);
      const [endHour, endMin] = availSlot.endTime.split(':').map(Number);

      let currentHour = startHour;
      let currentMin = startMin;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMin < endMin)
      ) {
        const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin
          .toString()
          .padStart(2, '0')}`;
        slots.push({ time: timeStr, available: true });

        currentMin += slotDuration;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin = currentMin % 60;
        }
      }
    });

    setTimeSlots(slots);
  };

  const hasAvailability = (date: Date) => {
    const dayOfWeek = (date.getDay() + 6) % 7;
    return availabilitySlots.some(
      (slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable
    );
  };

  const formatTime12hr = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setBookingStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingStep('form');
  };

  const handleBack = () => {
    if (bookingStep === 'form') {
      setBookingStep('time');
      setSelectedTime(null);
    } else if (bookingStep === 'time') {
      setBookingStep('date');
      setSelectedDate(null);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedDate || !selectedTime) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/booking/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          pharmacistId,
          appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
          appointmentTime: selectedTime,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      // Success - move to success step
      setBookingStep('success');
      reset();

      if (onBookingComplete) {
        onBookingComplete();
      }
    } catch (err) {
      console.error('Booking submission error:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Quick Booking
          </CardTitle>
          <CardDescription>
            Select a date and time to book an appointment
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Step Indicator */}
        {bookingStep !== 'success' && (
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`flex items-center gap-2 ${
                bookingStep === 'date' ? 'text-blue-600 font-medium' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  bookingStep === 'date'
                    ? 'bg-blue-600 text-white'
                    : selectedDate
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {selectedDate ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <span>Date</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div
              className={`flex items-center gap-2 ${
                bookingStep === 'time' ? 'text-blue-600 font-medium' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  bookingStep === 'time'
                    ? 'bg-blue-600 text-white'
                    : selectedTime
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {selectedTime ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <span>Time</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div
              className={`flex items-center gap-2 ${
                bookingStep === 'form' ? 'text-blue-600 font-medium' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  bookingStep === 'form'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                3
              </div>
              <span>Details</span>
            </div>
          </div>
        )}

        {/* Date Selection */}
        {bookingStep === 'date' && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Select a Date</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {availableDates.map((date) => {
                const isAvailable = hasAvailability(date);
                const isPast = date < startOfDay(new Date());
                const isToday = isSameDay(date, new Date());

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => isAvailable && !isPast && handleDateSelect(date)}
                    disabled={!isAvailable || isPast}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      !isAvailable || isPast
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : selectedDate && isSameDay(selectedDate, date)
                        ? 'bg-blue-50 border-blue-600 text-blue-900'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                    }`}
                  >
                    <div className="text-xs text-gray-500">
                      {isToday ? 'Today' : format(date, 'EEE')}
                    </div>
                    <div className="text-lg font-semibold">{format(date, 'd')}</div>
                    <div className="text-xs">{format(date, 'MMM')}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Time Selection */}
        {bookingStep === 'time' && selectedDate && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">
                Select a Time for {format(selectedDate, 'EEEE, MMMM d')}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleBack}>
                Change Date
              </Button>
            </div>
            {timeSlots.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No available time slots for this date
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => handleTimeSelect(slot.time)}
                    disabled={!slot.available}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      !slot.available
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : selectedTime === slot.time
                        ? 'bg-blue-50 border-blue-600 text-blue-900'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                    }`}
                  >
                    <Clock className="h-4 w-4 mx-auto mb-1" />
                    <div className="text-sm font-medium">
                      {formatTime12hr(slot.time)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form Step */}
        {bookingStep === 'form' && selectedDate && selectedTime && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Booking Details</h3>
              <Button type="button" variant="ghost" size="sm" onClick={handleBack}>
                Change Time
              </Button>
            </div>

            {/* Selected Appointment Summary */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <div className="text-sm text-blue-900">
                <div className="font-medium mb-1">Selected Appointment:</div>
                <div>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</div>
                <div>{formatTime12hr(selectedTime)}</div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-gray-900">Patient Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientFirstName">First Name *</Label>
                  <Input
                    id="patientFirstName"
                    {...register('patientFirstName')}
                    className={errors.patientFirstName ? 'border-red-500' : ''}
                  />
                  {errors.patientFirstName && (
                    <p className="text-sm text-red-600 mt-1">{errors.patientFirstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="patientLastName">Last Name *</Label>
                  <Input
                    id="patientLastName"
                    {...register('patientLastName')}
                    className={errors.patientLastName ? 'border-red-500' : ''}
                  />
                  {errors.patientLastName && (
                    <p className="text-sm text-red-600 mt-1">{errors.patientLastName.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patientPhone">Phone *</Label>
                  <Input
                    id="patientPhone"
                    type="tel"
                    {...register('patientPhone')}
                    className={errors.patientPhone ? 'border-red-500' : ''}
                  />
                  {errors.patientPhone && (
                    <p className="text-sm text-red-600 mt-1">{errors.patientPhone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="patientEmail">Email (optional)</Label>
                  <Input
                    id="patientEmail"
                    type="email"
                    {...register('patientEmail')}
                    className={errors.patientEmail ? 'border-red-500' : ''}
                  />
                  {errors.patientEmail && (
                    <p className="text-sm text-red-600 mt-1">{errors.patientEmail.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Referrer Information */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-gray-900">Referrer Information</h4>
              <div>
                <Label htmlFor="referrerName">Referrer Name *</Label>
                <Input
                  id="referrerName"
                  {...register('referrerName')}
                  className={errors.referrerName ? 'border-red-500' : ''}
                />
                {errors.referrerName && (
                  <p className="text-sm text-red-600 mt-1">{errors.referrerName.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="referrerEmail">Email (optional)</Label>
                  <Input
                    id="referrerEmail"
                    type="email"
                    {...register('referrerEmail')}
                    className={errors.referrerEmail ? 'border-red-500' : ''}
                  />
                  {errors.referrerEmail && (
                    <p className="text-sm text-red-600 mt-1">{errors.referrerEmail.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="referrerPhone">Phone (optional)</Label>
                  <Input
                    id="referrerPhone"
                    type="tel"
                    {...register('referrerPhone')}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="referrerClinic">Clinic Name (optional)</Label>
                <Input id="referrerClinic" {...register('referrerClinic')} />
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="referralReason">Referral Reason (optional)</Label>
                <Textarea
                  id="referralReason"
                  {...register('referralReason')}
                  placeholder="Briefly describe the reason for referral"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes (optional)</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Any additional information"
                  rows={3}
                />
              </div>
            </div>

            {submitError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </form>
        )}

        {/* Success Step */}
        {bookingStep === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
            <p className="text-gray-600 mb-6">
              Your appointment has been successfully booked. You will receive a confirmation email shortly with details and a reschedule link if needed.
            </p>
            <Button
              onClick={() => {
                setBookingStep('date');
                setSelectedDate(null);
                setSelectedTime(null);
                setSubmitError(null);
              }}
              variant="outline"
            >
              Book Another Appointment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
