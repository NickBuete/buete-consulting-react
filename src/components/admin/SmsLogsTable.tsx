import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert, AlertDescription } from '../ui/Alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';
import { Loader2, Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fetchSmsLogs as getSmsLogs } from '../../services/sms';
import type { SmsLog } from '../../services/sms';

export const SmsLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<SmsLog | null>(null);
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  const pageSize = 20;

  useEffect(() => {
    fetchSmsLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const fetchSmsLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSmsLogs({
        page,
        pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      });
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching SMS logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load SMS logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchSmsLogs();
  };

  const handleViewMessage = (log: SmsLog) => {
    setSelectedLog(log);
    setShowMessageDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3" />
            Sent
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="h-3 w-3" />
            Failed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Format Australian phone numbers: 0412 345 678
    if (phone.startsWith('04') && phone.length === 10) {
      return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
    }
    return phone;
  };

  const truncateMessage = (message: string, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return `${message.slice(0, maxLength)}...`;
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border rounded-md bg-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>

          <Button onClick={handleSearch} variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date/Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No SMS logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {format(new Date(log.sentAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatPhoneNumber(log.phoneNumber)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {truncateMessage(log.message)}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(log.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.hmrReviewId ? (
                        <a
                          href={`/hmr/${log.hmrReviewId}`}
                          className="text-blue-600 hover:underline"
                        >
                          #{log.hmrReviewId}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewMessage(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, total)} of {total} logs
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>SMS Message Details</DialogTitle>
            <DialogDescription>
              Sent on{' '}
              {selectedLog &&
                format(new Date(selectedLog.sentAt), 'dd/MM/yyyy HH:mm')}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </div>
                <div className="text-sm text-gray-900">
                  {formatPhoneNumber(selectedLog.phoneNumber)}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Status</div>
                {getStatusBadge(selectedLog.status)}
              </div>

              {selectedLog.hmrReviewId && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    HMR Review
                  </div>
                  <a
                    href={`/hmr/${selectedLog.hmrReviewId}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Review #{selectedLog.hmrReviewId}
                  </a>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Message
                </div>
                <div className="p-3 bg-gray-50 border rounded-md text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedLog.message}
                </div>
              </div>

              {selectedLog.status === 'failed' && selectedLog.errorMessage && (
                <div>
                  <div className="text-sm font-medium text-red-700 mb-1">
                    Error Message
                  </div>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-900">
                    {selectedLog.errorMessage}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
