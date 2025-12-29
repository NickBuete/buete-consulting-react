import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert, AlertDescription } from '../ui/Alert';
import { CheckCircle, XCircle, Loader2, Calendar, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';
import {
  type CalendarStatus,
  disconnectMicrosoftCalendar,
  getMicrosoftCalendarStatus,
  getMicrosoftLoginUrl,
  syncMicrosoftCalendar,
  updateMicrosoftAutoSync,
} from '../../services/microsoftCalendar';

export const CalendarConnectionCard: React.FC = () => {
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchCalendarStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCalendarStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMicrosoftCalendarStatus();
      setStatus(data);
    } catch (err) {
      console.error('Error fetching calendar status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load calendar status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setError(null);
      const response = await fetch(getMicrosoftLoginUrl(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get Microsoft login URL');
      }

      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (err) {
      console.error('Microsoft connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to initiate Microsoft connection');
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      setError(null);
      await disconnectMicrosoftCalendar();
      setShowDisconnectDialog(false);
      await fetchCalendarStatus();
    } catch (err) {
      console.error('Error disconnecting calendar:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect calendar');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      setError(null);
      await syncMicrosoftCalendar();
      await fetchCalendarStatus();
    } catch (err) {
      console.error('Error syncing calendar:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync calendar');
    } finally {
      setSyncing(false);
    }
  };

  const toggleAutoSync = async () => {
    if (!status) return;

    try {
      await updateMicrosoftAutoSync(!status.autoSync);
      await fetchCalendarStatus();
    } catch (err) {
      console.error('Error toggling auto-sync:', err);
      setError(err instanceof Error ? err.message : 'Failed to update auto-sync setting');
    }
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never';
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Microsoft 365 Calendar Integration</CardTitle>
              <CardDescription>
                Sync your appointments with Microsoft Outlook Calendar
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Connection Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              {status?.connected ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Connected</div>
                    {status.email && (
                      <div className="text-sm text-gray-600">{status.email}</div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Not Connected</div>
                    <div className="text-sm text-gray-600">
                      Connect your calendar to sync appointments
                    </div>
                  </div>
                </>
              )}
            </div>

            {status?.connected ? (
              <Button
                variant="outline"
                onClick={() => setShowDisconnectDialog(true)}
              >
                Disconnect
              </Button>
            ) : (
              <Button onClick={handleConnect}>Connect to Microsoft</Button>
            )}
          </div>

          {/* Calendar Settings (only show when connected) */}
          {status?.connected && (
            <>
              <div className="space-y-3 p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900">Sync Settings</h4>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Last Synced</div>
                    <div className="text-xs text-gray-600">
                      {formatLastSync(status.lastSync)}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncNow}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync Now
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <div className="text-sm font-medium">Automatic Sync</div>
                    <div className="text-xs text-gray-600">
                      Sync appointments automatically when created
                    </div>
                  </div>
                  <button
                    onClick={toggleAutoSync}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      status.autoSync ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        status.autoSync ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  How Calendar Sync Works
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• New bookings are automatically added to your calendar</li>
                  <li>• Appointments appear in your default Outlook calendar</li>
                  <li>• Cancellations will remove events from your calendar</li>
                  <li>• Updates sync changes to existing calendar events</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Microsoft Calendar?</DialogTitle>
            <DialogDescription>
              This will stop syncing appointments to your Microsoft Outlook calendar.
              Existing calendar events will not be deleted.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisconnectDialog(false)}
              disabled={disconnecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              {disconnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                'Disconnect'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
