import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Alert, AlertDescription } from '../ui/Alert';
import { Loader2, User } from 'lucide-react';
import { api } from '../../services/api';

const profileSchema = z.object({
  pharmacyBusinessName: z.string().min(1, 'Business name is required').max(150),
  pharmacyPhone: z.string().optional(),
  pharmacyAddress: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileData {
  username: string;
  email: string;
  pharmacyBusinessName: string | null;
  pharmacyPhone: string | null;
  pharmacyAddress: string | null;
}

export const ProfileSettingsCard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<ProfileData>('/users/profile');
      setProfileData(data);

      setValue('pharmacyBusinessName', data.pharmacyBusinessName || '');
      setValue('pharmacyPhone', data.pharmacyPhone || '');
      setValue('pharmacyAddress', data.pharmacyAddress || '');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);
      await api.patch('/users/profile', data);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSubmitting(false);
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle>Profile & Business Details</CardTitle>
            <CardDescription>
              Update your business information for patient communications
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription className="text-green-600">
                Profile updated successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Read-only user info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm text-gray-600">Username</Label>
              <p className="font-medium">{profileData?.username}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Email</Label>
              <p className="font-medium">{profileData?.email}</p>
            </div>
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Business Information</h3>
            <p className="text-sm text-gray-600">
              These details will appear in appointment confirmation emails sent to patients.
            </p>

            <div>
              <Label htmlFor="pharmacyBusinessName">
                Business Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pharmacyBusinessName"
                {...register('pharmacyBusinessName')}
                placeholder="e.g., Buete Consulting"
                className={errors.pharmacyBusinessName ? 'border-red-500' : ''}
              />
              {errors.pharmacyBusinessName && (
                <p className="mt-1 text-sm text-red-600">{errors.pharmacyBusinessName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="pharmacyPhone">Contact Phone (Optional)</Label>
              <Input
                id="pharmacyPhone"
                type="tel"
                {...register('pharmacyPhone')}
                placeholder="+61 XXX XXX XXX"
              />
              <p className="mt-1 text-xs text-gray-500">
                This phone number will be shown in patient confirmation emails
              </p>
            </div>

            <div>
              <Label htmlFor="pharmacyAddress">Business Address (Optional)</Label>
              <Input
                id="pharmacyAddress"
                {...register('pharmacyAddress')}
                placeholder="123 Main St, Sydney NSW 2000"
              />
              <p className="mt-1 text-xs text-gray-500">
                Full address for reference in communications
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
