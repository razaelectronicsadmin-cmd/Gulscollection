'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import {
  ShoppingCart, Search, Download, Calendar, Filter, X,
  ChevronLeft, ChevronRight, Loader2, Eye, AlertCircle, CheckCircle2,
  Package, Clock, Send
} from 'lucide-react';
import { OrderStatus } from '@prisma/client';
import OrderDetailsModal, { AdminOrder } from '@/components/admin/OrderDetailsModal';
import OrderCancellationModal from '@/components/admin/OrderCancellationModal';

const STATUS_TABS: { key: string; label: string; status: OrderStatus | 'ALL' }[] = [
  { key: 'ALL', label: 'All Orders', status: 'ALL' },
  { key: 'PENDING', label: 'New / Pending', status: 'PENDING' },
  { key: 'CONFIRMED', label: 'Confirmed', status: 'CONFIRMED' },
  { key: 'DISPATCHED', label: 'Dispatched', status: 'DISPATCHED' },
  { key: 'COMPLETED', label: 'Completed', status: 'COMPLETED' },
  { key: 'CANCELLED', label: 'Cancelled', status: 'CANCELLED' },
];

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Server-side filters
  const [currentTab, setCurrentTab] = useState<OrderStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('all');
  const [productList, setProductList] = useState<{ id: number; name: string }[]>([]);

  // Server-side pagination
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    ALL: 0,
    PENDING: 0,
    CONFIRMED: 0,
    DISPATCHED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Modals state
  const [viewingOrder, setViewingOrder] = useState<AdminOrder | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<AdminOrder | null>(null);

  const [, startTransition] = useTransition();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Load products list once for product filter dropdown
  useEffect(() => {
    fetch('/api/admin/products?limit=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && Array.isArray(data.products)) {
          setProductList(data.products.map((p: any) => ({ id: p.id, name: p.name })));
        }
      })
      .catch((err) => console.error('Failed to load products for filter:', err));
  }, []);

  // Fetch paginated orders from server
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: currentTab,
        search: debouncedSearch,
        startDate: startDate || '',
        endDate: endDate || '',
        productId: selectedProductId,
      });

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setOrders(data.orders || []);
      setPagination(data.pagination || { total: 0, totalPages: 1, limit: 10 });
      if (data.statusCounts) setStatusCounts(data.statusCounts);
    } catch {
      setError('Could not load orders. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [page, currentTab, debouncedSearch, startDate, endDate, selectedProductId]);

  useEffect(() => {
    startTransition(() => {
      fetchOrders();
    });
  }, [fetchOrders]);

  // Bulk Export CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        status: currentTab,
        search: debouncedSearch,
        startDate: startDate || '',
        endDate: endDate || '',
        productId: selectedProductId,
        exportCsv: 'true',
      });

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guls-orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Direct Status Update Handler
  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus, cancellationReason?: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          cancellationReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setFeedbackMessage(data.message || `Order status updated to ${newStatus}`);
      setTimeout(() => setFeedbackMessage(''), 4500);

      // Refresh order in modal if open
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder(data.order);
      }

      setCancellingOrder(null);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Error updating order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-800 border-amber-200/70';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-800 border-blue-200/70';
      case 'DISPATCHED':
        return 'bg-purple-50 text-purple-800 border-purple-200/70';
      case 'COMPLETED':
        return 'bg-green-50 text-green-800 border-green-200/70';
      case 'CANCELLED':
        return 'bg-red-50 text-red-800 border-red-200/70';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    setSelectedProductId('all');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || startDate || endDate || (selectedProductId && selectedProductId !== 'all'));

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Title and CSV Export */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart size={24} />
              Order Management System
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Guest checkout order stream with automated customer email alerts.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={isExporting || orders.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-800 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <Loader2 size={16} className="animate-spin text-gray-500" />
            ) : (
              <Download size={16} className="text-[#d4af37]" />
            )}
            <span>Bulk Export to CSV</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className="p-3.5 bg-green-50 border border-green-200 text-sm text-green-800 rounded-lg flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-green-600" />
              <span>{feedbackMessage}</span>
            </div>
            <button onClick={() => setFeedbackMessage('')} className="text-green-600 hover:text-green-800">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Status Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 scrollbar-none">
          {STATUS_TABS.map((tab) => {
            const isActive = currentTab === tab.status;
            const count = statusCounts[tab.status] || 0;

            return (
              <button
                key={tab.key}
                onClick={() => {
                  setCurrentTab(tab.status);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[12px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Advanced Filters Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by Order #, Customer Name, Phone, Email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              />
            </div>

            {/* Product Filter */}
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#d4af37] w-full md:w-56"
            >
              <option value="all">Filter by Product: All</option>
              {productList.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Date Range Pickers & Clear */}
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-gray-50 text-xs text-gray-600">
            <span className="flex items-center gap-1 font-medium text-gray-500">
              <Calendar size={14} /> Date Range:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="px-2.5 py-1.5 border border-gray-200 rounded-md text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              />
              <span>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="px-2.5 py-1.5 border border-gray-200 rounded-md text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="ml-auto text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium"
              >
                <X size={13} /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Showing {orders.length} of {pagination.total} orders
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 text-gray-400 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-center py-12 text-sm text-red-500">{error}</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 px-4">
              <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-700 text-sm font-semibold">No orders found.</p>
              <p className="text-gray-400 text-xs mt-1">Try broadening your search or date range filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Order</th>
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Customer</th>
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Date</th>
                    <th className="text-left px-6 py-3.5 font-semibold text-gray-500">Items</th>
                    <th className="text-right px-6 py-3.5 font-semibold text-gray-500">Amount</th>
                    <th className="text-center px-6 py-3.5 font-semibold text-gray-500">Status</th>
                    <th className="text-right px-6 py-3.5 font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => {
                    const badgeClass = getStatusBadge(order.status);
                    const itemsSummary = order.orderItems
                      .map((i) => `${i.product.name} × ${i.quantity}`)
                      .join(', ');

                    return (
                      <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                        {/* Order Number */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="font-bold text-gray-900 hover:text-[#d4af37] text-left underline font-mono text-xs"
                          >
                            #{order.orderNumber}
                          </button>
                        </td>

                        {/* Customer */}
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-xs text-gray-500">{order.customerPhone}</div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Items */}
                        <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate" title={itemsSummary}>
                          {itemsSummary}
                        </td>

                        {/* Amount */}
                        <td className="px-6 py-4 text-right font-semibold text-gray-900 whitespace-nowrap">
                          PKR {Number(order.totalAmount).toLocaleString()}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
                            {order.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingOrder(order)}
                              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                              title="View Order Details"
                            >
                              <Eye size={16} />
                            </button>

                            {order.status !== 'CANCELLED' && (
                              <button
                                onClick={() => setCancellingOrder(order)}
                                className="p-2 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors text-xs font-medium"
                                title="Cancel Order"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-xs text-gray-500">
                Page {page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="p-1.5 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Order Modal */}
      {viewingOrder && (
        <OrderDetailsModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onStatusChange={(id, status) => handleUpdateStatus(id, status)}
          onRequestCancel={(order) => {
            setViewingOrder(null);
            setCancellingOrder(order);
          }}
          isUpdatingStatus={isUpdatingStatus}
        />
      )}

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <OrderCancellationModal
          isOpen={true}
          orderNumber={cancellingOrder.orderNumber}
          isSubmitting={isUpdatingStatus}
          onConfirm={(reason) => handleUpdateStatus(cancellingOrder.id, 'CANCELLED', reason)}
          onClose={() => setCancellingOrder(null)}
        />
      )}
    </>
  );
}

