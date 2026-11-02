'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  X, Package, MapPin, Mail, Phone, Calendar, Clock,
  CheckCircle2, Truck, AlertTriangle, ChevronDown, Loader2, Send
} from 'lucide-react';
import { OrderStatus } from '@prisma/client';

export interface AdminOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number | string;
  status: OrderStatus;
  trackingNumber?: string | null;
  carrier?: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems: {
    id: number;
    quantity: number;
    priceAtPurchase: number | string;
    product: {
      id: number;
      name: string;
      brand?: string;
      imageURL: string | null;
    };
  }[];
}

interface OrderDetailsModalProps {
  order: AdminOrder | null;
  onClose: () => void;
  onStatusChange: (
    orderId: number,
    newStatus: OrderStatus,
    options?: { trackingNumber?: string; carrier?: string }
  ) => void;
  onRequestCancel: (order: AdminOrder) => void;
  isUpdatingStatus: boolean;
}

export default function OrderDetailsModal({
  order,
  onClose,
  onStatusChange,
  onRequestCancel,
  isUpdatingStatus,
}: OrderDetailsModalProps) {
  const [carrier, setCarrier] = useState(order?.carrier || 'TCS');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [showTrackingInput, setShowTrackingInput] = useState(false);

  if (!order) return null;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pending Review', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'CONFIRMED':
        return { label: 'Confirmed & Packing', color: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'DISPATCHED':
        return { label: 'Dispatched / In Transit', color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'COMPLETED':
        return { label: 'Completed / Delivered', color: 'bg-green-50 text-green-800 border-green-200' };
      case 'CANCELLED':
        return { label: 'Cancelled', color: 'bg-red-50 text-red-800 border-red-200' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const badge = getStatusBadge(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto py-8">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Order #{order.orderNumber}</h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Changer Bar */}
          <div className="bg-[#faf9f5] border border-amber-200/60 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-gray-700 block">Manage Status</span>
              <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                <Send size={12} className="text-[#d4af37]" /> Triggers automated customer notification email
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isUpdatingStatus ? (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 py-1.5 px-3">
                  <Loader2 size={14} className="animate-spin" /> Updating…
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={order.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as OrderStatus;
                      if (newStatus === 'CANCELLED') {
                        onRequestCancel(order);
                      } else if (newStatus === 'DISPATCHED') {
                        setShowTrackingInput(true);
                        onStatusChange(order.id, newStatus, { trackingNumber, carrier });
                      } else {
                        onStatusChange(order.id, newStatus);
                      }
                    }}
                    className="appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-8 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37] cursor-pointer shadow-xs"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED (Pack)</option>
                    <option value="DISPATCHED">DISPATCHED (Out)</option>
                    <option value="COMPLETED">COMPLETED (Done)</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* Courier & Tracking Details Card */}
          {(order.status === 'DISPATCHED' || showTrackingInput || order.trackingNumber) && (
            <div className="bg-purple-50/70 border border-purple-200/70 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-purple-700" />
                  <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Courier & Tracking Details
                  </span>
                </div>
                {order.trackingNumber && !showTrackingInput && (
                  <button
                    type="button"
                    onClick={() => setShowTrackingInput(true)}
                    className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold underline cursor-pointer"
                  >
                    Edit Tracking
                  </button>
                )}
              </div>

              {order.trackingNumber && !showTrackingInput ? (
                <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded border border-purple-100">
                  <div>
                    <span className="text-gray-400 text-[11px] block uppercase font-medium">Courier Partner:</span>
                    <span className="font-semibold text-gray-900">{order.carrier || 'Standard Courier'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px] block uppercase font-medium">Tracking Code:</span>
                    <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded inline-block">
                      {order.trackingNumber}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-white p-3 rounded border border-purple-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Courier Partner</label>
                      <select
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="TCS">TCS</option>
                        <option value="Leopards Courier">Leopards Courier</option>
                        <option value="Trax Logistics">Trax Logistics</option>
                        <option value="PostEx">PostEx</option>
                        <option value="Call Courier">Call Courier</option>
                        <option value="M&P">M&P</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Tracking Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 1294827394"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    {order.trackingNumber && (
                      <button
                        type="button"
                        onClick={() => setShowTrackingInput(false)}
                        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => {
                        onStatusChange(order.id, 'DISPATCHED', { trackingNumber, carrier });
                        setShowTrackingInput(false);
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Send size={12} />
                      Save & Send Tracking Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cancellation Notice if Cancelled */}
          {order.status === 'CANCELLED' && order.cancellationReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <span className="text-xs font-bold text-red-800 uppercase tracking-wider block mb-1">
                Cancellation Reason:
              </span>
              <p className="text-sm text-red-700">{order.cancellationReason}</p>
            </div>
          )}

          {/* Customer & Shipping Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-50/70 border border-gray-100 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Customer Details</h4>
              <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                <Mail size={13} className="text-gray-400" /> {order.customerEmail}
              </p>
              <p className="text-xs text-gray-600 flex items-center gap-1.5">
                <Phone size={13} className="text-gray-400" /> {order.customerPhone}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50/70 border border-gray-100 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Delivery Address</h4>
              <p className="text-xs text-gray-700 leading-relaxed flex items-start gap-1.5">
                <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                <span>{order.shippingAddress}</span>
              </p>
            </div>
          </div>

          {/* Ordered Fragrances Table */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Purchased Fragrances</h4>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="text-left px-4 py-2.5">Product</th>
                    <th className="text-right px-4 py-2.5">Unit Price</th>
                    <th className="text-center px-4 py-2.5">Qty</th>
                    <th className="text-right px-4 py-2.5">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.orderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.product.imageURL ? (
                            <div className="w-10 h-10 relative rounded-md overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                              <Image src={item.product.imageURL} alt={item.product.name} fill className="object-cover" unoptimized />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center shrink-0 text-gray-400 border border-gray-200">
                              <Package size={16} />
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{item.product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        PKR {Number(item.priceAtPurchase).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-gray-800">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        PKR {(Number(item.priceAtPurchase) * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bg-gray-50/80 px-4 py-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Grand Total</span>
                <span className="text-base font-bold text-gray-900">
                  PKR {Number(order.totalAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

