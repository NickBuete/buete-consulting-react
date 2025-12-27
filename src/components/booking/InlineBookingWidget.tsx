import React, { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Alert, AlertDescription } from '../ui/Alert';
import { Calendar as CalendarIcon, Clock, Loader2, CheckCircle } from 'lucide-react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import type { AvailabilitySlot, BookingSettings, BusySlot } from '../../types/booking';
import { getBookingDayOfWeek, buildTimeSlots, formatBookingTime } from '../../utils/booking';
import { inlineBookingSchema } from '../../schemas/booking';
import {
  createDirectBooking,
  getAvailabilitySlots,
  getBookingSettings,
  getBusySlots,
} from '../../services/booking';
import type { z } from 'zod';

type BookingFormData = z.infer<typeof inlineBookingSchema>;

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
  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);
  const [bookingSettings, setBookingSettings] = useState<BookingSettings | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
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
    resolver: zodResolver(inlineBookingSchema),
  });

  // Generate next 14 days for quick selection
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pharmacistId]);

  const timeSlots = useMemo(
    () =>
      buildTimeSlots({
        availabilitySlots,
        busySlots,
        selectedDate,
        bookingSettings: bookingSettings ?? undefined,
      }),
    [availabilitySlots, busySlots, selectedDate, bookingSettings]
  );

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const [availability, settings, busy] = await Promise.all([
        getAvailabilitySlots(),
        getBookingSettings(),
        getBusySlots(),
      ]);
      setAvailabilitySlots(availability);
      setBookingSettings(settings);
      setBusySlots(busy);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const hasAvailability = (date: Date) => {
    const dayOfWeek = getBookingDayOfWeek(date);
    return availabilitySlots.some(
      (slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable
    );
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

      await createDirectBooking({
        pharmacistId,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        appointmentTime: selectedTime,
        ...data,
      });

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
                {timeSlots.map((slot) => {
                  const label = slot.available
                    ? formatBookingTime(slot.time)
                    : slot.isBusy
                    ? 'Busy'
                    : formatBookingTime(slot.time);

                  return (
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
                      aria-label={
                        slot.available
                          ? `Select ${formatBookingTime(slot.time)}`
                          : slot.isBusy
                          ? 'Busy'
                          : `Unavailable ${formatBookingTime(slot.time)}`
                      }
                    >
                      <Clock className="h-4 w-4 mx-auto mb-1" />
                      <div className="text-sm font-medium">{label}</div>
                    </button>
                  );
                })}
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
                <div>{formatBookingTime(selectedTime)}</div>
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
