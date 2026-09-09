'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

interface ProductFilterBarProps {
  initialSearch?: string;
  initialSort?: string;
  categorySlug?: string;
}

export default function ProductFilterBar({
  initialSearch = '',
  initialSort = 'latest',
  categorySlug = '',
}: ProductFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchVal = formData.get('search') as string;

    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    if (searchVal) {
      params.set('search', searchVal);
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset to page 1 on new search
    router.push(`/products?${params.toString()}`);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('sort', newSort);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          name="search"
          defaultValue={initialSearch}
          placeholder="Cari nama produk, spesifikasi, atau SKU..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </form>

      {/* Sorting Dropdown */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Urutkan:</span>
        <select
          value={initialSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none bg-white cursor-pointer"
        >
          <option value="latest">Terbaru</option>
          <option value="featured">Produk Unggulan</option>
          <option value="price-asc">Harga: Termurah</option>
          <option value="price-desc">Harga: Tertinggi</option>
        </select>
      </div>
    </div>
  );
}
