import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, User, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { format } from 'date-fns';

interface BookingConfirmationData {
  bookingId: number;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  pharmacistName: string;
  appointmentDate: string;
  appointmentTime: string;
  location?: string;
  requiresApproval: boolean;
}

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state as BookingConfirmationData;

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600">No booking information found.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const appointmentDateTime = new Date(`${bookingData.appointmentDate}T${bookingData.appointmentTime}`);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {bookingData.requiresApproval ? 'Booking Request Received!' : 'Booking Confirmed!'}
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            {bookingData.requiresApproval
              ? 'Your booking request has been submitted and is pending approval.'
              : 'Your appointment has been successfully booked.'}
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Pharmacist</p>
                <p className="font-medium text-gray-900">{bookingData.pharmacistName}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium text-gray-900">
                  {format(appointmentDateTime, 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-gray-700">{format(appointmentDateTime, 'h:mm a')}</p>
              </div>
            </div>

            {bookingData.location && (
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{bookingData.location}</p>
                </div>
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium text-gray-900 mb-3">Patient Information</h3>

              <div className="flex items-start space-x-3 mb-2">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{bookingData.patientName}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 mb-2">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{bookingData.patientPhone}</p>
                </div>
              </div>

              {bookingData.patientEmail && (
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{bookingData.patientEmail}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-gray-700">
              {bookingData.requiresApproval ? (
                <>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">1.</span>
                    <span>The pharmacist will review your booking request.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">2.</span>
                    <span>You'll receive a confirmation via SMS and/or email once approved.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">3.</span>
                    <span>24 hours before your appointment, you'll receive a reminder with a preparation checklist.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">1.</span>
                    <span>You'll receive a confirmation SMS at {bookingData.patientPhone}.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">2.</span>
                    <span>24 hours before your appointment, you'll receive a reminder with a preparation checklist.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">3.</span>
                    <span>Please have your medications and Medicare card ready for the appointment.</span>
                  </li>
                </>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => window.print()} variant="outline">
            Print Confirmation
          </Button>
          <Button onClick={() => navigate('/')} variant="default">
            Return to Home
          </Button>
        </div>

        {/* Print-only booking reference */}
        <div className="hidden print:block mt-8 p-4 border-t">
          <p className="text-sm text-gray-600">
            Booking Reference: #{bookingData.bookingId}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Please keep this for your records
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
