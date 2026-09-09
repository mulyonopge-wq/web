'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  FolderTree,
  Plus,
  ArrowUpRight,
  Clock,
  Layers,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { formatRupiah } from '@/lib/currency';

interface DashboardData {
  stats: {
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    totalCategories: number;
    totalOrders: number;
    newOrders: number;
    totalRevenue: number;
  };
  recentOrders: any[];
  topItems: { name: string; totalSold: number; revenue: number }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-lg w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Dashboard Ikhtisar
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ringkasan performa toko online dan status konten website
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/builder"
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Homepage Builder</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Pendapatan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Omset
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-800">
              {formatRupiah(stats?.totalRevenue || 0)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Akumulasi pesanan terverifikasi</p>
          </div>
        </div>

        {/* Card 2: Total Pesanan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Pesanan
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-800">
              {stats?.totalOrders || 0}
            </h3>
            {Boolean(stats?.newOrders) && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                {stats?.newOrders} Baru
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            <Link href="/admin/orders" className="text-blue-600 hover:underline">
              Kelola pesanan masuk →
            </Link>
          </p>
        </div>

        {/* Card 3: Total Produk & Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Katalog Produk
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-800">
              {stats?.totalProducts || 0}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-600 font-semibold">{stats?.activeProducts} aktif</span>
              <span>•</span>
              <span className="text-rose-500 font-semibold">{stats?.outOfStockProducts} habis</span>
            </p>
          </div>
        </div>

        {/* Card 4: Kategori */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kategori Produk
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-800">
              {stats?.totalCategories || 0}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              <Link href="/admin/categories" className="text-blue-600 hover:underline">
                Atur kategori produk →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Two columns: Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-800">Pesanan Terbaru</h2>
              <p className="text-xs text-slate-400 mt-0.5">Daftar transaksi pesanan masuk terkini</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Lihat Semua
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">No. Pesanan</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.recentOrders && data.recentOrders.length > 0 ? (
                  data.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{order.customerName}</div>
                        <div className="text-[11px] text-slate-400">{order.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-600">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {formatRupiah(order.total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'NEW'
                              ? 'bg-rose-100 text-rose-700'
                              : order.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada transaksi pesanan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Top Products */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-800">Produk Terlaris</h2>
            <p className="text-xs text-slate-400 mt-0.5">Berdasarkan volume item terjual</p>
          </div>

          <div className="space-y-4">
            {data?.topItems && data.topItems.length > 0 ? (
              data.topItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <div className="space-y-0.5 pr-2">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Terjual: <span className="font-bold text-blue-600">{item.totalSold} unit</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-700">
                      {formatRupiah(item.revenue)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Belum ada data penjualan produk
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
