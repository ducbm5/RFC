/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  User, 
  CalendarDays, 
  History, 
  Copy, 
  Check, 
  UserCheck, 
  RefreshCw,
  SearchCode,
  Phone,
  CreditCard,
  X,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
  Users,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Runner } from '../types';

interface RunnerSearchProps {
  runners: Runner[];
}

export default function RunnerSearch({ runners }: RunnerSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistance, setSelectedDistance] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<'userId' | 'ten' | 'tuoi' | 'thoiGianTao'>('thoiGianTao');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Distinct list of available distances for filtering
  const availableDistances = useMemo(() => {
    const set = new Set<string>();
    runners.forEach(r => {
      if (r.cuLy && r.cuLy !== 'Chưa rõ') set.add(r.cuLy);
    });
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
  }, [runners]);

  // Comprehensive multi-field filtering & sorting
  const filteredRunners = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return runners.filter(r => {
      // 1. Distance filter
      if (selectedDistance !== 'all' && r.cuLy !== selectedDistance) {
        return false;
      }

      // 2. Gender filter
      if (selectedGender !== 'all') {
        const gen = r.gioiTinh.toLowerCase();
        if (selectedGender === 'nam' && !gen.includes('nam')) return false;
        if (selectedGender === 'nu' && !gen.includes('nữ') && !gen.includes('nu')) return false;
        if (selectedGender === 'khac' && (gen.includes('nam') || gen.includes('nữ') || gen.includes('nu'))) return false;
      }

      // 3. Search query across all fields (User ID, Tên, SĐT, CCCD)
      if (!q) return true;

      const matchUserId = r.userId.toLowerCase().includes(q);
      const matchTen = r.ten.toLowerCase().includes(q);
      const matchSdt = r.sdt.toLowerCase().includes(q);
      const matchCccd = r.cccd.toLowerCase().includes(q);
      const matchCuLy = r.cuLy.toLowerCase().includes(q);

      return matchUserId || matchTen || matchSdt || matchCccd || matchCuLy;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'userId') {
        comparison = a.userId.localeCompare(b.userId, undefined, { numeric: true });
      } else if (sortBy === 'ten') {
        comparison = a.ten.localeCompare(b.ten, 'vi');
      } else if (sortBy === 'tuoi') {
        comparison = (a.tuoi || 0) - (b.tuoi || 0);
      } else if (sortBy === 'thoiGianTao') {
        comparison = a.thoiGianTao.localeCompare(b.thoiGianTao);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [runners, searchQuery, selectedDistance, selectedGender, sortBy, sortOrder]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDistance, selectedGender, pageSize, sortBy, sortOrder]);

  // Paginated records
  const totalPages = Math.max(1, Math.ceil(filteredRunners.length / pageSize));
  const paginatedRunners = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRunners.slice(start, start + pageSize);
  }, [filteredRunners, currentPage, pageSize]);

  // Copy to clipboard helper
  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text || text === '—') return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Quick random runner selector
  const handleRandomSelect = () => {
    if (runners.length === 0) return;
    const randomIndex = Math.floor(Math.random() * runners.length);
    const randomRunner = runners[randomIndex];
    setSelectedRunner(randomRunner);
  };

  // Export filtered runners to CSV
  const handleExportCSV = () => {
    if (filteredRunners.length === 0) return;
    const headers = ['STT', 'USER ID', 'HỌ VÀ TÊN', 'SỐ ĐIỆN THOẠI', 'CCCD/CMND', 'CỰ LY', 'GIỚI TÍNH', 'TUỔI', 'NĂM SINH', 'THỜI GIAN TẠO'];
    const rows = filteredRunners.map((r, index) => [
      index + 1,
      `"${r.userId}"`,
      `"${r.ten}"`,
      `"${r.sdt}"`,
      `"${r.cccd}"`,
      `"${r.cuLy}"`,
      `"${r.gioiTinh}"`,
      r.tuoi > 0 ? r.tuoi : '',
      r.namSinh > 0 ? r.namSinh : '',
      `"${r.thoiGianTao}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `danh_sach_runner_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Distance badge style helper
  const getDistanceBadgeStyle = (cuLy: string) => {
    const dist = cuLy.toLowerCase();
    if (dist.includes('42')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (dist.includes('21')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    } else if (dist.includes('10')) {
      return 'bg-teal-50 text-teal-700 border-teal-200';
    } else if (dist.includes('5')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  // Bib card color theme for details modal / drawer
  const bibCardTheme = useMemo(() => {
    if (!selectedRunner) return null;
    const dist = selectedRunner.cuLy.toLowerCase();
    
    if (dist.includes('42')) {
      return {
        bg: 'from-orange-500 via-red-500 to-rose-600',
        text: 'text-rose-100',
        badge: 'bg-red-900/30 text-red-100 border-red-500/30',
        label: 'MARATHON - 42KM',
        bubble: 'bg-rose-500/20 text-rose-300'
      };
    } else if (dist.includes('21')) {
      return {
        bg: 'from-blue-600 via-indigo-600 to-violet-700',
        text: 'text-indigo-100',
        badge: 'bg-blue-950/30 text-blue-100 border-blue-500/30',
        label: 'HALF MARATHON - 21KM',
        bubble: 'bg-indigo-500/20 text-indigo-300'
      };
    } else if (dist.includes('10')) {
      return {
        bg: 'from-emerald-500 via-teal-600 to-cyan-600',
        text: 'text-teal-100',
        badge: 'bg-teal-950/30 text-teal-100 border-teal-500/30',
        label: 'CHALLENGE RUN - 10KM',
        bubble: 'bg-teal-500/20 text-teal-300'
      };
    } else {
      return {
        bg: 'from-indigo-500 via-purple-500 to-pink-500',
        text: 'text-purple-100',
        badge: 'bg-purple-950/30 text-purple-100 border-purple-500/30',
        label: 'FUN RUN / DISCOVERY',
        bubble: 'bg-purple-500/20 text-purple-200'
      };
    }
  }, [selectedRunner]);

  return (
    <div className="w-full space-y-6" id="box-runner-lookup">
      
      {/* 1. Header & Quick Controls Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title and stats counter */}
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-7 bg-rose-500 rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold font-display text-slate-900">
                  Tra cứu & Danh sách Runner
                </h4>
                <span className="bg-rose-50 text-rose-600 border border-rose-100 font-bold text-xs px-2.5 py-0.5 rounded-full">
                  {filteredRunners.length.toLocaleString()} / {runners.length.toLocaleString()} runner
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tìm kiếm theo Tên, Số điện thoại, CCCD, User ID hoặc lọc theo Cự ly và Giới tính
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              onClick={handleRandomSelect}
              className="text-xs flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer font-bold shadow-2xs"
              title="Chọn ngẫu nhiên một Runner để xem thẻ BIB chi tiết"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Xem ngẫu nhiên</span>
            </button>

            <button 
              onClick={handleExportCSV}
              disabled={filteredRunners.length === 0}
              className="text-xs flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 py-2 px-3.5 rounded-xl hover:bg-emerald-100 disabled:opacity-50 transition-colors cursor-pointer font-bold shadow-2xs disabled:cursor-not-allowed"
              title="Xuất danh sách runner đang lọc ra file Excel/CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất CSV ({filteredRunners.length})</span>
            </button>
          </div>
        </div>

        {/* 2. Filters & Search Box Row */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-4 border-t border-slate-100">
          
          {/* Main Search input (Tên, SĐT, CCCD, User ID) */}
          <div className="md:col-span-6 relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập Tên, SĐT, CCCD hoặc User ID để tìm..."
              className="w-full bg-slate-50/90 border border-slate-200 text-slate-900 pl-10 pr-9 py-2.5 rounded-xl font-sans text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all font-medium placeholder:text-slate-400"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-md cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Distance Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedDistance}
              onChange={(e) => setSelectedDistance(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-3 rounded-xl font-sans text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer"
            >
              <option value="all">Tất cả Cự ly ({runners.length})</option>
              {availableDistances.map(dist => {
                const count = runners.filter(r => r.cuLy === dist).length;
                return (
                  <option key={dist} value={dist}>
                    Cự ly {dist} ({count} runner)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-3 rounded-xl font-sans text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer"
            >
              <option value="all">Tất cả Giới tính</option>
              <option value="nam">Nam</option>
              <option value="nu">Nữ</option>
              <option value="khac">Chưa rõ / Khác</option>
            </select>
          </div>

        </div>

      </div>

      {/* 3. Table of Runners */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        
        {/* Table Top Bar */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <Users className="w-4 h-4 text-rose-500" />
            <span>Danh sách chi tiết ({filteredRunners.length} kết quả)</span>
          </div>

          {/* Sorter & Page size selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <span>Sắp xếp:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="bg-white border border-slate-200 text-slate-700 py-1 px-2 rounded-lg font-semibold cursor-pointer focus:outline-hidden focus:border-rose-500"
              >
                <option value="thoiGianTao-desc">Mới nhất</option>
                <option value="thoiGianTao-asc">Cũ nhất</option>
                <option value="ten-asc">Tên (A → Z)</option>
                <option value="ten-desc">Tên (Z → A)</option>
                <option value="userId-asc">User ID (Tăng dần)</option>
                <option value="tuoi-desc">Tuổi (Cao → Thấp)</option>
                <option value="tuoi-asc">Tuổi (Thấp → Cao)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <span>Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white border border-slate-200 text-slate-700 py-1 px-2 rounded-lg font-semibold cursor-pointer focus:outline-hidden focus:border-rose-500"
              >
                <option value={10}>10 / trang</option>
                <option value={25}>25 / trang</option>
                <option value={50}>50 / trang</option>
                <option value={100}>100 / trang</option>
              </select>
            </div>
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 text-center w-12">#</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Số điện thoại</th>
                <th className="py-3 px-4">CCCD / CMND</th>
                <th className="py-3 px-4 text-center">Cự ly</th>
                <th className="py-3 px-4 text-center">Giới tính</th>
                <th className="py-3 px-4 text-center">Tuổi</th>
                <th className="py-3 px-4">Thời gian tạo</th>
                <th className="py-3 px-4 text-center w-24">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedRunners.length > 0 ? (
                paginatedRunners.map((runner, idx) => {
                  const itemIndex = (currentPage - 1) * pageSize + idx + 1;
                  const isSelected = selectedRunner?.userId === runner.userId;

                  return (
                    <tr 
                      key={`${runner.userId}-${idx}`}
                      className={`hover:bg-rose-50/30 transition-colors ${isSelected ? 'bg-rose-50/50 font-medium' : ''}`}
                    >
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-bold">
                        {itemIndex}
                      </td>

                      {/* User ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                            {runner.userId}
                          </span>
                          <button
                            onClick={() => copyToClipboard(runner.userId, `id-${runner.userId}`)}
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded-md hover:bg-slate-200/60 transition-colors"
                            title="Sao chép User ID"
                          >
                            {copiedField === `id-${runner.userId}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Tên */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[11px] shrink-0 border border-slate-200">
                            {runner.ten && runner.ten !== '—' ? runner.ten.trim().charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="font-bold text-slate-850 font-display">
                            {runner.ten || '—'}
                          </span>
                        </div>
                      </td>

                      {/* SĐT */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {runner.sdt && runner.sdt !== '—' ? (
                          <div className="flex items-center gap-1.5">
                            <span>{runner.sdt}</span>
                            <button
                              onClick={() => copyToClipboard(runner.sdt, `phone-${runner.userId}`)}
                              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded-md hover:bg-slate-200/60 transition-colors"
                              title="Sao chép SĐT"
                            >
                              {copiedField === `phone-${runner.userId}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* CCCD */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {runner.cccd && runner.cccd !== '—' ? (
                          <div className="flex items-center gap-1.5">
                            <span>{runner.cccd}</span>
                            <button
                              onClick={() => copyToClipboard(runner.cccd, `cccd-${runner.userId}`)}
                              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded-md hover:bg-slate-200/60 transition-colors"
                              title="Sao chép CCCD"
                            >
                              {copiedField === `cccd-${runner.userId}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Cự ly */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border ${getDistanceBadgeStyle(runner.cuLy)}`}>
                          {runner.cuLy}
                        </span>
                      </td>

                      {/* Giới tính */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block font-semibold text-[11px] px-2 py-0.5 rounded-md ${
                          runner.gioiTinh.toLowerCase().includes('nam')
                            ? 'bg-blue-50 text-blue-700'
                            : runner.gioiTinh.toLowerCase().includes('nữ') || runner.gioiTinh.toLowerCase().includes('nu')
                            ? 'bg-pink-50 text-pink-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {runner.gioiTinh}
                        </span>
                      </td>

                      {/* Tuổi */}
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {runner.tuoi > 0 ? (
                          <span>{runner.tuoi} <span className="text-[10px] text-slate-400 font-normal">({runner.namSinh})</span></span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Thời gian tạo */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                        {runner.thoiGianTao}
                      </td>

                      {/* Thao tác xem */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedRunner(runner)}
                          className="bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-700 font-bold p-1.5 px-2.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px]"
                          title="Xem thẻ BIB runner"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Thẻ BIB</span>
                        </button>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <SearchCode className="w-8 h-8 text-slate-300" />
                      <p className="font-bold text-slate-700">Không tìm thấy runner nào phù hợp</p>
                      <p className="text-xs max-w-sm">
                        Thử kiểm tra lại từ khóa tìm kiếm (Tên, SĐT, CCCD, User ID) hoặc xóa bộ lọc cự ly/giới tính.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium">
              Đang xem từ trang <span className="font-bold text-slate-900">{currentPage}</span> trên tổng số <span className="font-bold text-slate-900">{totalPages}</span> trang ({filteredRunners.length} kết quả)
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center gap-1 text-slate-700 cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3 && currentPage < totalPages - 2) {
                      pageNumber = currentPage - 2 + i;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    }
                  }

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        currentPage === pageNumber
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center gap-1 text-slate-700 cursor-pointer shadow-2xs"
              >
                <span>Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 4. Verified Runner BIB Modal Popup */}
      <AnimatePresence>
        {selectedRunner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 relative"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedRunner(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Event BIB Ticket Card Header */}
              <div className={`relative bg-gradient-to-br ${bibCardTheme?.bg} p-6 sm:p-8 text-white text-center overflow-hidden`}>
                
                {/* Visual BIB Accents */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                
                {/* Punch Hole accents */}
                <div className="absolute top-1/2 -left-4 w-8 h-8 bg-white rounded-full z-10 pointer-events-none transform -translate-y-1/2 shadow-inner" />
                <div className="absolute top-1/2 -right-4 w-8 h-8 bg-white rounded-full z-10 pointer-events-none transform -translate-y-1/2 shadow-inner" />

                {/* Header Track Label */}
                <div className="flex justify-between items-center mb-5">
                  <span className={`text-[10px] font-black tracking-widest uppercase border border-white/30 px-3 py-1 rounded-full ${bibCardTheme?.badge}`}>
                    {bibCardTheme?.label}
                  </span>
                  <div className="flex items-center gap-1 bg-white/15 px-3 py-1 rounded-full backdrop-blur-xs text-[10px] font-black tracking-wide">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>VERIFIED RUNNER</span>
                  </div>
                </div>

                {/* Runner Name */}
                <div className="mb-2">
                  <h3 className="text-2xl font-black font-display tracking-tight text-white drop-shadow-sm">
                    {selectedRunner.ten || 'Chưa cập nhật tên'}
                  </h3>
                </div>

                {/* Massive BIB ID Display */}
                <div className="my-3 relative">
                  <span className="text-white/60 block text-[10px] font-black tracking-widest uppercase mb-1">
                    RUNNER USER ID / BIB
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-4xl sm:text-5xl font-mono font-black tracking-wider drop-shadow-md">
                      {selectedRunner.userId}
                    </h2>
                    <button 
                      onClick={() => copyToClipboard(selectedRunner.userId, 'modal-id')}
                      className="p-2 bg-white/15 hover:bg-white/25 rounded-xl cursor-pointer transition-colors"
                      title="Sao chép User ID"
                    >
                      {copiedField === 'modal-id' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                </div>

                {/* Subtitle Accent */}
                <div className="w-16 h-1 bg-white/25 mx-auto my-4 rounded-full" />

              </div>

              {/* Body Detailed Information Grid */}
              <div className="p-6 bg-slate-50 space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* SĐT */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Số điện thoại</span>
                        <span className="text-sm font-bold font-mono text-slate-900">{selectedRunner.sdt || '—'}</span>
                      </div>
                    </div>
                    {selectedRunner.sdt && selectedRunner.sdt !== '—' && (
                      <button
                        onClick={() => copyToClipboard(selectedRunner.sdt, 'modal-phone')}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                        title="Sao chép SĐT"
                      >
                        {copiedField === 'modal-phone' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {/* CCCD */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CCCD / CMND</span>
                        <span className="text-sm font-bold font-mono text-slate-900">{selectedRunner.cccd || '—'}</span>
                      </div>
                    </div>
                    {selectedRunner.cccd && selectedRunner.cccd !== '—' && (
                      <button
                        onClick={() => copyToClipboard(selectedRunner.cccd, 'modal-cccd')}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                        title="Sao chép CCCD"
                      >
                        {copiedField === 'modal-cccd' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {/* Cự ly */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cự ly thi đấu</span>
                      <span className="text-sm font-bold text-slate-900">{selectedRunner.cuLy}</span>
                    </div>
                  </div>

                  {/* Giới tính & Tuổi */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Giới tính & Tuổi</span>
                      <span className="text-sm font-bold text-slate-900">
                        {selectedRunner.gioiTinh} {selectedRunner.tuoi > 0 ? `• ${selectedRunner.tuoi} tuổi` : ''}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Thời gian tạo record */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span className="font-semibold">Thời gian đăng ký:</span>
                  </div>
                  <span className="font-mono font-medium text-slate-800">{selectedRunner.thoiGianTao}</span>
                </div>

                {/* Footer Modal Action */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedRunner(null)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all cursor-pointer text-sm"
                  >
                    Đóng cửa sổ
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
