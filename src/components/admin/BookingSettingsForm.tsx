import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Alert, AlertDescription } from '../ui/Alert';
import { Loader2, CheckCircle, Copy } from 'lucide-react';

const settingsSchema = z.object({
  bookingUrl: z
    .string()
    .min(3, 'URL must be at least 3 characters')
    .max(50, 'URL must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
  bufferTimeBefore: z.number().min(0).max(120),
  bufferTimeAfter: z.number().min(0).max(120),
  defaultDuration: z.number().min(15).max(240),
  allowPublicBooking: z.boolean(),
  requireApproval: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const BookingSettingsForm: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [urlCheckError, setUrlCheckError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      bufferTimeBefore: 15,
      bufferTimeAfter: 15,
      defaultDuration: 60,
      allowPublicBooking: true,
      requireApproval: false,
    },
  });

  const allowPublicBooking = watch('allowPublicBooking');
  const bookingUrl = watch('bookingUrl');

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/booking/settings`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();

      // Set form values
      Object.keys(data).forEach((key) => {
        setValue(key as keyof SettingsFormData, data[key]);
      });
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/booking/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSubmitting(false);
    }
  };

  const checkUrlAvailability = async (url: string) => {
    if (!url || url.length < 3) return;

    try {
      setUrlCheckError(null);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(
        `${apiUrl}/api/booking/check-url?url=${encodeURIComponent(url)}`,
        {
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!data.available) {
        setUrlCheckError('This URL is already taken');
      }
    } catch (err) {
      console.error('Error checking URL:', err);
    }
  };

  const copyBookingUrl = () => {
    const fullUrl = `${window.location.origin}/book/${bookingUrl}`;
    navigator.clipboard.writeText(fullUrl);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {/* Public Booking URL */}
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-semibold text-gray-900">Public Booking URL</h3>

        <div>
          <Label htmlFor="bookingUrl">Custom URL Slug</Label>
          <div className="flex gap-2 mt-1">
            <div className="flex-1">
              <Input
                id="bookingUrl"
                {...register('bookingUrl')}
                placeholder="your-name"
                onBlur={(e) => checkUrlAvailability(e.target.value)}
                className={errors.bookingUrl || urlCheckError ? 'border-red-500' : ''}
              />
              {errors.bookingUrl && (
                <p className="mt-1 text-sm text-red-600">{errors.bookingUrl.message}</p>
              )}
              {urlCheckError && (
                <p className="mt-1 text-sm text-red-600">{urlCheckError}</p>
              )}
            </div>
          </div>
          {bookingUrl && !errors.bookingUrl && !urlCheckError && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 p-2 bg-white border rounded text-sm text-gray-600">
                {window.location.origin}/book/{bookingUrl}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyBookingUrl}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allowPublicBooking"
            {...register('allowPublicBooking')}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <Label htmlFor="allowPublicBooking" className="cursor-pointer">
            Enable public booking via this URL
          </Label>
        </div>

        {allowPublicBooking && (
          <div className="flex items-center gap-2 ml-6">
            <input
              type="checkbox"
              id="requireApproval"
              {...register('requireApproval')}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <Label htmlFor="requireApproval" className="cursor-pointer">
              Require approval before confirming bookings
            </Label>
          </div>
        )}
      </div>

      {/* Appointment Settings */}
      <div className="space-y-4 p-4 border rounded-lg">
        <h3 className="font-semibold text-gray-900">Appointment Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="defaultDuration">Default Duration (minutes)</Label>
            <Input
              id="defaultDuration"
              type="number"
              {...register('defaultDuration', { valueAsNumber: true })}
              min={15}
              max={240}
              step={15}
              className={errors.defaultDuration ? 'border-red-500' : ''}
            />
            {errors.defaultDuration && (
              <p className="mt-1 text-sm text-red-600">
                {errors.defaultDuration.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="bufferTimeBefore">Buffer Before (minutes)</Label>
            <Input
              id="bufferTimeBefore"
              type="number"
              {...register('bufferTimeBefore', { valueAsNumber: true })}
              min={0}
              max={120}
              step={5}
              className={errors.bufferTimeBefore ? 'border-red-500' : ''}
            />
            {errors.bufferTimeBefore && (
              <p className="mt-1 text-sm text-red-600">
                {errors.bufferTimeBefore.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Time blocked before appointment
            </p>
          </div>

          <div>
            <Label htmlFor="bufferTimeAfter">Buffer After (minutes)</Label>
            <Input
              id="bufferTimeAfter"
              type="number"
              {...register('bufferTimeAfter', { valueAsNumber: true })}
              min={0}
              max={120}
              step={5}
              className={errors.bufferTimeAfter ? 'border-red-500' : ''}
            />
            {errors.bufferTimeAfter && (
              <p className="mt-1 text-sm text-red-600">
                {errors.bufferTimeAfter.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Time blocked after appointment
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={submitting} size="lg">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </form>
  );
};
