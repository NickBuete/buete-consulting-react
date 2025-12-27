import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, startOfDay } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import { Calendar as CalendarIcon, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { getRescheduleInfo, rescheduleBooking } from '../../services/booking';

const rescheduleSchema = z.object({
  appointmentDate: z.string().min(1, 'Please select a date'),
  appointmentTime: z.string().min(1, 'Please select a time'),
});

type RescheduleFormData = z.infer<typeof rescheduleSchema>;

interface BookingInfo {
  bookingId: number;
  patient: {
    firstName: string;
    lastName: string;
  };
  pharmacist: {
    name: string;
  };
  currentAppointment: {
    date: string;
    time: string;
  };
  referredBy: string;
}

const ReschedulePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RescheduleFormData>({
    resolver: zodResolver(rescheduleSchema),
  });

  const selectedDate = watch('appointmentDate');
  const selectedTime = watch('appointmentTime');

  useEffect(() => {
    const fetchBookingInfo = async () => {
      if (!token) {
        setError('Invalid reschedule token');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getRescheduleInfo(token);
        setBookingInfo(data);

        // Pre-fill with current appointment
        setValue('appointmentDate', data.currentAppointment.date);
        setValue('appointmentTime', data.currentAppointment.time);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingInfo();
  }, [token, setValue]);

  const onSubmit = async (data: RescheduleFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await rescheduleBooking(token, data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reschedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <div className="mt-8">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !bookingInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Return to home page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Appointment Rescheduled!
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Your appointment has been successfully rescheduled.
              </p>
              <p className="text-gray-600 mb-8">
                You will receive a confirmation email with the new appointment details.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-2">New Appointment:</h3>
                <p className="text-gray-700">
                  <strong>Date:</strong> {selectedDate && format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-gray-700">
                  <strong>Time:</strong> {selectedTime}
                </p>
                <p className="text-gray-700">
                  <strong>With:</strong> {bookingInfo?.pharmacist.name}
                </p>
              </div>
              <Button onClick={() => navigate('/')} variant="outline">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Reschedule Appointment
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            {bookingInfo?.patient.firstName} {bookingInfo?.patient.lastName}
          </p>
        </div>

        {/* Current Appointment Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Current Appointment</CardTitle>
            <CardDescription>
              Your scheduled Home Medicines Review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Patient</p>
                <p className="font-medium text-gray-900">
                  {bookingInfo?.patient.firstName} {bookingInfo?.patient.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pharmacist</p>
                <p className="font-medium text-gray-900">{bookingInfo?.pharmacist.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Date</p>
                <p className="font-medium text-gray-900">
                  {bookingInfo?.currentAppointment.date &&
                    format(new Date(bookingInfo.currentAppointment.date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Time</p>
                <p className="font-medium text-gray-900">
                  {bookingInfo?.currentAppointment.time}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reschedule Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Select New Date and Time
            </CardTitle>
            <CardDescription>
              Choose a new date and time for your appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Date
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {Array.from({ length: 14 }, (_, i) => {
                    const date = addDays(new Date(), i);
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isSelected = selectedDate === dateStr;
                    const isPast = date < startOfDay(new Date());

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => !isPast && setValue('appointmentDate', dateStr)}
                        disabled={isPast}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          isPast
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-900'
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                        }`}
                      >
                        <div className="text-xs text-gray-500">
                          {i === 0 ? 'Today' : format(date, 'EEE')}
                        </div>
                        <div className="text-lg font-semibold">{format(date, 'd')}</div>
                        <div className="text-xs">{format(date, 'MMM')}</div>
                      </button>
                    );
                  })}
                </div>
                {errors.appointmentDate && (
                  <p className="text-sm text-red-600 mt-2">
                    {errors.appointmentDate.message}
                  </p>
                )}
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Time
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
                    '16:00', '16:30',
                  ].map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setValue('appointmentTime', time)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-900'
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                        }`}
                      >
                        <Clock className="h-4 w-4 mx-auto mb-1" />
                        <div className="text-sm font-medium">{time}</div>
                      </button>
                    );
                  })}
                </div>
                {errors.appointmentTime && (
                  <p className="text-sm text-red-600 mt-2">
                    {errors.appointmentTime.message}
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Rescheduling...
                    </>
                  ) : (
                    'Confirm Reschedule'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This reschedule link can only be used once. If you need further assistance,
            please contact {bookingInfo?.pharmacist.name} directly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReschedulePage;
