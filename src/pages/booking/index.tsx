import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingForm } from '../../components/booking/BookingForm';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import type { PublicBookingInfo } from '../../types/booking';
import { getPublicBookingInfo } from '../../services/booking';

const BookingPage: React.FC = () => {
  const { bookingUrl } = useParams<{ bookingUrl: string }>();
  const navigate = useNavigate();
  const [bookingInfo, setBookingInfo] = useState<PublicBookingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPharmacistInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPublicBookingInfo(bookingUrl);
        setBookingInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (bookingUrl) {
      fetchPharmacistInfo();
    }
  }, [bookingUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
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

  if (error || !bookingInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              {error || 'Unable to load booking page'}
            </AlertDescription>
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

  if (!bookingInfo.bookingSettings.allowPublicBooking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertDescription>
              Online booking is currently unavailable. Please contact the pharmacist directly.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Book an Appointment
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            with {bookingInfo.pharmacist.name}
          </p>
          {bookingInfo.bookingSettings.requireApproval && (
            <p className="mt-2 text-sm text-amber-600">
              Note: All bookings require approval
            </p>
          )}
        </div>

        {/* Booking Form */}
        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
          <BookingForm
            bookingUrl={bookingUrl!}
            pharmacistName={bookingInfo.pharmacist.name}
            availabilitySlots={bookingInfo.availability}
            busySlots={bookingInfo.busySlots}
            bookingSettings={bookingInfo.bookingSettings}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            By booking an appointment, you agree to our terms and conditions.
          </p>
          <p className="mt-2">
            Need help? Contact us at {bookingInfo.pharmacist.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
