import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tabs';
import { AvailabilityEditor } from '../../../components/admin/AvailabilityEditor';
import { BookingSettingsForm } from '../../../components/admin/BookingSettingsForm';
import { CalendarConnectionCard } from '../../../components/admin/CalendarConnectionCard';
import { SmsLogsTable } from '../../../components/admin/SmsLogsTable';
import { Calendar, Settings, Link2, MessageSquare } from 'lucide-react';

const BookingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('availability');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Booking Management
        </h1>
        <p className="text-gray-600">
          Manage your availability, booking settings, and calendar integrations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Availability</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">SMS Logs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Availability Schedule</CardTitle>
              <CardDescription>
                Set your available time slots for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvailabilityEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking Settings</CardTitle>
              <CardDescription>
                Configure your booking preferences and public booking URL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingSettingsForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <CalendarConnectionCard />
        </TabsContent>

        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Logs</CardTitle>
              <CardDescription>
                View all SMS messages sent for bookings and reminders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SmsLogsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingDashboard;
