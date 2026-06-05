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
  Sparkles,
  RefreshCw,
  SearchCode
} from 'lucide-react';
import { Runner } from '../types';

interface RunnerSearchProps {
  runners: Runner[];
}

export default function RunnerSearch({ runners }: RunnerSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRunner, setSelectedRunner] = useState<Runner | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions as user types (up to 6 records)
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    
    return runners
      .filter(r => r.userId.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery, runners]);

  // Handle outside clicks to close the suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle direct search submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    // Direct exact or case-insensitive match search
    const found = runners.find(r => r.userId.toLowerCase() === q);
    if (found) {
      setSelectedRunner(found);
      setDropdownOpen(false);
    } else {
      // Find closest fuzzy match if exact match is not found
      const fuzzyFound = runners.find(r => r.userId.toLowerCase().includes(q));
      if (fuzzyFound) {
        setSelectedRunner(fuzzyFound);
        setSearchQuery(fuzzyFound.userId);
      } else {
        setSelectedRunner(null);
      }
      setDropdownOpen(false);
    }
  };

  const handleSelectRunner = (runner: Runner) => {
    setSelectedRunner(runner);
    setSearchQuery(runner.userId);
    setDropdownOpen(false);
  };

  const handleRandomSearch = () => {
    if (runners.length === 0) return;
    const randomIndex = Math.floor(Math.random() * runners.length);
    const randomRunner = runners[randomIndex];
    setSelectedRunner(randomRunner);
    setSearchQuery(randomRunner.userId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render a lovely colorful runner ticket / event bib card
  const bibCardTheme = useMemo(() => {
    if (!selectedRunner) return null;
    const dist = selectedRunner.cuLy.toLowerCase();
    
    if (dist.includes('42')) {
      return {
        bg: 'from-orange-500 via-red-500 to-rose-600',
        text: 'text-rose-100',
        badge: 'bg-red-900/30 text-red-100 border-red-500/30',
        label: 'MARATHON - 42.195K',
        bubble: 'bg-rose-500/20 text-rose-300'
      };
    } else if (dist.includes('21')) {
      return {
        bg: 'from-blue-600 via-indigo-600 to-violet-700',
        text: 'text-indigo-100',
        badge: 'bg-blue-950/30 text-blue-100 border-blue-500/30',
        label: 'HALF MARATHON - 21K',
        bubble: 'bg-indigo-500/20 text-indigo-300'
      };
    } else if (dist.includes('10')) {
      return {
        bg: 'from-emerald-500 via-teal-600 to-cyan-600',
        text: 'text-teal-100',
        badge: 'bg-teal-950/30 text-teal-100 border-teal-500/30',
        label: 'CHALLENGE RUN - 10K',
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
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col h-full" id="box-runner-lookup">
      
      {/* Title block */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-rose-500 rounded-full" />
          <h4 className="text-lg font-sans font-bold text-slate-850">Tra cứu thông tin Runner</h4>
        </div>
        
        {/* Quick random search tag */}
        <button 
          onClick={handleRandomSearch}
          className="text-xs flex items-center gap-1 bg-rose-50 border border-rose-100 text-rose-600 py-1.5 px-3 rounded-full hover:bg-rose-100/80 transition-colors cursor-pointer font-semibold"
          title="Chọn ngẫu nhiên một Runner để tra cứu nhanh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ngẫu nhiên</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-6" ref={dropdownRef}>
        <form onSubmit={handleSearchSubmit}>
          <div className="relative flex items-center">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Nhập User ID để bắt đầu tra cứu..."
              className="w-full bg-slate-50/80 border border-slate-200/80 text-slate-900 pl-11 pr-24 py-3.5 rounded-xl font-sans text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all shadow-inner font-medium placeholder:text-slate-400"
            />
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            
            <button 
              type="submit"
              className="absolute right-2 top-2 bg-slate-900 text-white font-sans font-bold text-xs px-4 py-2 rounded-lg hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
            >
              Tìm kiếm
            </button>
          </div>
        </form>

        {/* Dynamic Auto-complete Suggestions list */}
        <AnimatePresence>
          {dropdownOpen && suggestions.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-100 shadow-xl rounded-xl z-50 py-1 overflow-hidden"
            >
              <div className="px-3.5 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 border-b border-slate-100/50 uppercase tracking-widest flex items-center gap-1">
                <SearchCode className="w-3 h-3 text-slate-400" />
                Kết quả phù hợp ({suggestions.length})
              </div>
              {suggestions.map((r) => (
                <button
                  key={r.userId}
                  onClick={() => handleSelectRunner(r)}
                  className="w-full text-left px-4 py-2.5 hover:bg-rose-50/50 cursor-pointer flex items-center justify-between transition-colors border-b last:border-b-0 border-slate-50"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-sans text-sm font-semibold text-slate-800">{r.userId}</span>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">
                    {r.cuLy}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Details Panel */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
        <AnimatePresence mode="wait">
          {selectedRunner ? (
            <motion.div
              key={selectedRunner.userId}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-sm flex flex-col"
            >
              {/* Event BIB Ticket Card */}
              <div className={`relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${bibCardTheme?.bg} p-6 text-white text-center`}>
                
                {/* Visual BIB Accents */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                
                {/* Punch Hole accents (Standard marathon ticket look) */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white rounded-full z-10 pointer-events-none transform -translate-y-1/2 shadow-inner" />
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white rounded-full z-10 pointer-events-none transform -translate-y-1/2 shadow-inner" />

                {/* Header Track Label */}
                <div className="flex justify-between items-center mb-6">
                  <span className={`text-[10px] font-black tracking-widest uppercase border border-white/20 px-3 py-1 rounded-full ${bibCardTheme?.badge}`}>
                    {bibCardTheme?.label}
                  </span>
                  <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-xs text-[10px] font-black tracking-wide">
                    <UserCheck className="w-3 h-3 text-emerald-300" />
                    <span>VERIFIED RUNNER</span>
                  </div>
                </div>

                {/* Massive BIB ID Display */}
                <div className="my-3 relative">
                  <span className="text-slate-100/50 block text-[11px] font-black tracking-widest uppercase mb-1">RUNNER BIB ID</span>
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-4xl sm:text-5xl font-mono font-black tracking-wider drop-shadow-md pr-1">
                      {selectedRunner.userId}
                    </h2>
                    <button 
                      onClick={() => copyToClipboard(selectedRunner.userId)}
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition-colors"
                      title="Copy User ID"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                </div>

                {/* Subtitle Accent */}
                <div className="w-12 h-1 bg-white/20 mx-auto my-5 rounded-full" />

                {/* Visual Details grid */}
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs text-left">
                    <span className="block text-[10px] text-white/60 font-medium tracking-wide uppercase">Cự ly chạy</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 text-rose-300" />
                      <span className="font-bold text-base">{selectedRunner.cuLy}</span>
                    </div>
                  </div>

                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs text-left">
                    <span className="block text-[10px] text-white/60 font-medium tracking-wide uppercase">Giới tính</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <User className="w-4 h-4 text-sky-300" />
                      <span className="font-bold text-base">{selectedRunner.gioiTinh}</span>
                    </div>
                  </div>

                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs text-left">
                    <span className="block text-[10px] text-white/60 font-medium tracking-wide uppercase">Tuổi & Năm sinh</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <CalendarDays className="w-4 h-4 text-amber-300" />
                      <span className="font-bold text-base">
                        {selectedRunner.tuoi > 0 ? `${selectedRunner.tuoi} tuổi` : 'Chưa rõ'}
                      </span>
                    </div>
                    {selectedRunner.namSinh > 0 && (
                      <span className="text-[10px] text-white/50 block mt-0.5">Sinh năm: {selectedRunner.namSinh}</span>
                    )}
                  </div>

                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs text-left">
                    <span className="block text-[10px] text-white/60 font-medium tracking-wide uppercase">Thời gian đăng ký</span>
                    <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
                      <History className="w-4 h-4 text-teal-300 shrink-0" />
                      <span className="font-bold text-[11px] truncate leading-tight mt-0.5" title={selectedRunner.thoiGianTao}>
                        {selectedRunner.thoiGianTao}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 text-[9px] text-white/40 tracking-wider font-semibold italic">
                  Database Record Verified
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/80 max-w-sm w-full"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-4 animate-bounce">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h5 className="font-sans text-sm font-bold text-slate-800">Không tìm thấy hoặc chưa tra cứu</h5>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                {searchQuery.trim() 
                  ? `Không tìm thấy thông tin runner với mã "${searchQuery}". Vui lòng nhập mã ID khác hoặc xem danh sách gợi ý khi gõ.`
                  : 'Nhập mã User ID của runner vào thanh tìm kiếm ở trên hoặc nhấn nút "Ngẫu nhiên" để xem thử thông tin chi tiết.'
                }
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
