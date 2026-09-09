'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Eye,
  MessageSquare,
  Loader2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { formatRupiah } from '@/lib/currency';
import { useToast } from '@/components/ui/Toast';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  shippingAddress: string;
  city: string;
  district: string | null;
  postalCode: string | null;
  customerNotes: string | null;
  paymentMethod: string;
  status: string;
  total: number;
  items: any[];
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  NEW: { label: 'Baru', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: AlertCircle },
  PROCESSING: { label: 'Diproses', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  SHIPPED: { label: 'Dikirim', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck },
  COMPLETED: { label: 'Selesai', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Dibatalkan', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: XCircle },
};

export default function OrdersAdminPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, search]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus) params.set('status', selectedStatus);
      if (search) params.set('search', search);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (e) {
      toast.error('Gagal mengambil daftar pesanan');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Status pesanan diubah menjadi: ${STATUS_MAP[newStatus]?.label || newStatus}`);
        if (selectedOrder) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        await fetchOrders();
      } else {
        toast.error('Gagal memperbarui status');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan jaringan');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Daftar Transaksi Pesanan
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Pantau dan proses pesanan masuk dari transfer bank, COD, maupun WhatsApp Order
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 items-center">
        {[
          { key: '', label: 'Semua Pesanan' },
          { key: 'NEW', label: 'Baru Masuk' },
          { key: 'PROCESSING', label: 'Diproses' },
          { key: 'SHIPPED', label: 'Dikirim' },
          { key: 'COMPLETED', label: 'Selesai' },
          { key: 'CANCELLED', label: 'Dibatalkan' },
        ].map((tab) => {
          const isActive = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs max-w-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari no pesanan, nama, no HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">No. Pesanan</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Pelanggan</th>
                <th className="py-3.5 px-4">Metode Bayar</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Rincian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    Memuat pesanan...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada pesanan ditemukan
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const statusInfo = STATUS_MAP[o.status] || {
                    label: o.status,
                    color: 'bg-slate-100 text-slate-700',
                  };
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {o.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(o.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{o.customerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{o.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-600">
                          {o.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {formatRupiah(o.total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50 text-xs font-medium inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">
                  Rincian Pesanan: #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tanggal: {new Date(selectedOrder.createdAt).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* Status updater */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-500">Status Saat Ini:</span>
                  <div className="mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        STATUS_MAP[selectedOrder.status]?.color
                      }`}
                    >
                      {STATUS_MAP[selectedOrder.status]?.label || selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Ubah Status:</span>
                  <select
                    disabled={updating}
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="NEW">Baru</option>
                    <option value="PROCESSING">Diproses</option>
                    <option value="SHIPPED">Dikirim</option>
                    <option value="COMPLETED">Selesai</option>
                    <option value="CANCELLED">Dibatalkan</option>
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs mb-2">Informasi Pembeli</h4>
                  <p><span className="text-slate-400">Nama:</span> <strong className="text-slate-800">{selectedOrder.customerName}</strong></p>
                  <p><span className="text-slate-400">WhatsApp:</span> <strong className="font-mono text-blue-600">{selectedOrder.customerPhone}</strong></p>
                  <p><span className="text-slate-400">Email:</span> {selectedOrder.customerEmail || '-'}</p>
                  <div className="pt-2">
                    <a
                      href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat WhatsApp Pembeli</span>
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs mb-2">Alamat Pengiriman</h4>
                  <p className="text-slate-700 leading-relaxed">{selectedOrder.shippingAddress}</p>
                  <p className="text-slate-500">{selectedOrder.city}, {selectedOrder.district || ''} {selectedOrder.postalCode || ''}</p>
                  {selectedOrder.customerNotes && (
                    <p className="pt-2 text-slate-600 italic">
                      Catatan: "{selectedOrder.customerNotes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Product items list */}
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                  Daftar Produk Dipesan
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-800">{item.productName}</p>
                        <p className="text-[11px] text-slate-400">
                          {formatRupiah(item.price)} x {item.quantity} unit
                        </p>
                      </div>
                      <div className="font-bold text-slate-800">
                        {formatRupiah(item.subtotal)}
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-slate-50 flex items-center justify-between font-bold text-slate-900 text-sm">
                    <span>Total Pembayaran:</span>
                    <span className="text-blue-600">{formatRupiah(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
