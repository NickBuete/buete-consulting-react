import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingForm } from '../../components/booking/BookingForm';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';

interface PharmacistInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  bookingSettings: {
    allowPublicBooking: boolean;
    requireApproval: boolean;
    bufferTimeBefore: number;
    bufferTimeAfter: number;
    defaultDuration: number;
  };
}

const BookingPage: React.FC = () => {
  const { bookingUrl } = useParams<{ bookingUrl: string }>();
  const navigate = useNavigate();
  const [pharmacist, setPharmacist] = useState<PharmacistInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPharmacistInfo = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        const response = await fetch(
          `${apiUrl}/api/booking/public/${bookingUrl}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Booking page not found. Please check the URL.');
          }
          throw new Error('Failed to load booking information.');
        }

        const data = await response.json();
        setPharmacist(data);
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

  if (error || !pharmacist) {
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

  if (!pharmacist.bookingSettings.allowPublicBooking) {
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
            with {pharmacist.firstName} {pharmacist.lastName}
          </p>
          {pharmacist.bookingSettings.requireApproval && (
            <p className="mt-2 text-sm text-amber-600">
              Note: All bookings require approval
            </p>
          )}
        </div>

        {/* Booking Form */}
        <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8">
          <BookingForm
            bookingUrl={bookingUrl!}
            pharmacistId={pharmacist.id}
            bookingSettings={pharmacist.bookingSettings}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            By booking an appointment, you agree to our terms and conditions.
          </p>
          <p className="mt-2">
            Need help? Contact us at {pharmacist.email}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
