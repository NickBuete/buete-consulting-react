import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert, AlertDescription } from '../ui/Alert';
import { Copy, ExternalLink, CheckCircle, Loader2, Share2 } from 'lucide-react';
import type { PublicBookingSettings } from '../../types/booking';
import { getBookingSettings } from '../../services/booking';

type BookingSettings = Pick<PublicBookingSettings, 'bookingUrl' | 'allowPublicBooking'>;

export const BookingUrlCard: React.FC = () => {
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBookingSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load booking URL');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!settings?.bookingUrl) return;

    const fullUrl = `${window.location.origin}/book/${settings.bookingUrl}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const openInNewTab = () => {
    if (!settings?.bookingUrl) return;
    const fullUrl = `${window.location.origin}/book/${settings.bookingUrl}`;
    window.open(fullUrl, '_blank');
  };

  const shareUrl = async () => {
    if (!settings?.bookingUrl) return;

    const fullUrl = `${window.location.origin}/book/${settings.bookingUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Book an Appointment',
          text: 'Book an appointment with me',
          url: fullUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
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

  if (!settings?.bookingUrl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Public Booking URL</CardTitle>
          <CardDescription>
            Set up your booking URL in settings to share with referrers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="default">
            <a href="/admin/booking">Configure Booking Settings</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const fullUrl = `${window.location.origin}/book/${settings.bookingUrl}`;

  return (
    <Card className={settings.allowPublicBooking ? 'border-blue-200 bg-blue-50' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Your Public Booking URL
            </CardTitle>
            <CardDescription>
              {settings.allowPublicBooking
                ? 'Share this link with referrers to book appointments'
                : 'Public booking is currently disabled'}
            </CardDescription>
          </div>
          {settings.allowPublicBooking && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <CheckCircle className="h-3 w-3" />
              Active
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL Display */}
        <div className="p-3 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between gap-2">
            <code className="text-sm text-blue-600 font-mono break-all">
              {fullUrl}
            </code>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={copyToClipboard}
            disabled={!settings.allowPublicBooking}
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            disabled={!settings.allowPublicBooking}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Preview
          </Button>

          {typeof navigator.share !== 'undefined' && (
            <Button
              variant="outline"
              size="sm"
              onClick={shareUrl}
              disabled={!settings.allowPublicBooking}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>

        {!settings.allowPublicBooking && (
          <Alert>
            <AlertDescription>
              Enable public booking in{' '}
              <a href="/admin/booking" className="font-medium text-blue-600 hover:underline">
                Booking Settings
              </a>{' '}
              to activate this link.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
