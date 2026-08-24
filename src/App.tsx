/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  fetchRunnerData, 
  SHEET_TSV_URL 
} from './utils/tsvParser';
import { Runner } from './types';
import DashboardStats from './components/DashboardStats';
import RunnerSearch from './components/RunnerSearch';
import { 
  Activity, 
  RefreshCw, 
  ExternalLink, 
  AlertTriangle, 
  Database,
  Search,
  CheckCircle,
  HelpCircle,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  LogOut
} from 'lucide-react';

export default function App() {
  const [runners, setRunners] = useState<Runner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Authorization states
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Check storage on boot
  useEffect(() => {
    const authState = localStorage.getItem('galaxy_run_authorized');
    if (authState === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  // Load runner data
  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    
    setError(null);
    try {
      const data = await fetchRunnerData();
      setRunners(data);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(
        err.message || 'Không thể tải dữ liệu hệ thống. Vui lòng kiểm tra lại kết nối mạng.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthorized]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    if (passwordInput.trim() === 'SS26') {
      setIsAuthorized(true);
      localStorage.setItem('galaxy_run_authorized', 'true');
    } else {
      setPasswordError('Mật khẩu không chính xác. Vui lòng nhập lại!');
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setPasswordInput('');
    setPasswordError(null);
    localStorage.removeItem('galaxy_run_authorized');
  };

  // 1. Authorization Lock Screen Render
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white relative overflow-hidden" id="auth-root">
        
        {/* Ambient colored background blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-150 shadow-2xl space-y-6 relative z-10"
        >
          {/* Lock Screen Header Centered */}
          <div className="flex flex-col items-center text-center pb-2">
            <div className="h-1 bg-gradient-to-r from-rose-500 to-indigo-500 w-24 mb-4 rounded-full" />
            <h2 className="text-xl font-black font-display text-slate-800 tracking-tight">
              Yêu cầu mật khẩu truy cập
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium font-sans">
              Run For Children Live Report
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Mật khẩu hệ thống</label>
              
              <div className="relative flex items-center">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="Nhập mật khẩu truy cập..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-11 pr-11 py-3.5 rounded-2xl font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all font-semibold"
                  autoFocus
                />
                <KeyRound className="absolute left-4 w-5 h-5 text-slate-400" />
                
                {/* View toggle password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 p-1 rounded-lg hover:bg-slate-250/50 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error dialog message */}
            <AnimatePresence mode="wait">
              {passwordError && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs font-semibold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{passwordError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Trigger Action */}
            <button 
              type="submit"
              className="w-full py-4 bg-[#9a1d49] hover:bg-[#80143a] text-white font-sans font-bold text-sm tracking-wide rounded-2xl transition-all hover:shadow-lg hover:shadow-rose-900/10 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Xác nhận mật khẩu</span>
            </button>
          </form>

          {/* Hint Footer tag */}
          <div className="text-[10px] text-center text-slate-400 font-semibold uppercase tracking-widest pt-2 border-t border-slate-50">
            Hộ tống giải chạy danh giá 2026
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-rose-500 selection:text-white" id="main-root">
      
      {/* Visual Header Grid Accent */}
      <div className="bg-white border-b border-slate-150 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-rose-500/5 via-indigo-500/5 to-emerald-500/5 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Title block */}
            <div className="flex items-center gap-3">
              <div className="text-left">
                <span className="text-xs font-black tracking-widest text-[#9a1d49] uppercase font-display block">LIVE REPORT</span>
                <h1 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight">
                  Run For Children Live Report
                </h1>
              </div>
            </div>

            {/* Syncing controller block */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              {/* Status indicator / updated hour */}
              {lastUpdated && (
                <div className="bg-emerald-50 text-emerald-700 py-2 px-3 rounded-xl border border-emerald-100 font-semibold flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Đã đồng bộ {lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}

              {/* Manual Trigger Button */}
              <button
                onClick={() => loadData(true)}
                disabled={isLoading || isRefreshing}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2 px-3.5 rounded-xl border border-indigo-700 transition-all cursor-pointer shadow-xs hover:shadow-md disabled:cursor-not-allowed"
                id="btn-sync-data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Đang đồng bộ...' : 'Làm mới'}</span>
              </button>

              {/* Guard Logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 px-3.5 rounded-xl border border-slate-250 transition-all cursor-pointer shadow-xs"
                title="Đăng xuất khỏi hệ thống report"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Container body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <AnimatePresence mode="wait">
          
          {/* 1. Loading / Sleek Skeleton state */}
          {isLoading && (
            <motion.div 
              key="loading-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* 3 top card placeholders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
                    <div className="space-y-2 w-2/3">
                      <div className="h-4 bg-slate-200 rounded-md w-1/2 animate-pulse" />
                      <div className="h-8 bg-slate-200 rounded-md w-3/4 animate-pulse" />
                    </div>
                    <div className="w-12 h-12 bg-slate-100 rounded-xl animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Grid content placeholders */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Stats placeholder */}
                <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                  <div className="h-6 bg-slate-200 rounded-md w-1/4 animate-pulse" />
                  <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
                </div>
                {/* Search placeholder */}
                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                  <div className="h-6 bg-slate-200 rounded-md w-1/3 animate-pulse" />
                  <div className="h-12 bg-slate-50 rounded-xl animate-pulse" />
                  <div className="h-56 bg-slate-100 rounded-xl animate-pulse" />
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. Error / Error resolution screen */}
          {!isLoading && error && (
            <motion.div 
              key="error-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white p-8 max-w-xl mx-auto rounded-3xl border border-slate-150 shadow-xl text-center space-y-5"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
                <AlertTriangle className="w-8 h-8 animate-bounce" />
              </div>
              <h2 className="text-xl font-black font-display text-slate-850">Không thể đồng bộ cơ sở dữ liệu</h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                {error}
              </p>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-2 mt-4 text-xs font-semibold text-slate-700">
                <p className="font-extrabold uppercase text-slate-500 text-[10px] tracking-wider flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                  Hướng dẫn khắc phục:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Kiểm tra xem mạng có đang bị chặn hoặc tường lửa không.</li>
                  <li>Vui lòng kiểm tra lại nguồn cấp dữ liệu hoặc liên hệ admin.</li>
                  <li>Nhấn nút làm mới dữ liệu ở bên dưới để thử lại.</li>
                </ul>
              </div>
              <button 
                onClick={() => loadData()}
                className="bg-slate-900 hover:bg-rose-600 text-white font-bold px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md inline-flex items-center gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Thử kết nối lại
              </button>
            </motion.div>
          )}

          {/* 3. Healthy / Live Dashboard Screen */}
          {!isLoading && !error && (
            <motion.div 
              key="active-dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {/* Box 1 (Stats cards & distribution charts) - Full width */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-400 font-display tracking-widest uppercase mb-1">BOX 1 // THỐNG KÊ CHI TIẾT</h3>
                  <div className="h-0.5 bg-slate-200 w-24 mb-4 rounded-full" />
                </div>
                <DashboardStats runners={runners} />
              </div>

              {/* Visual separation */}
              <div className="border-t border-slate-200/80 my-8 pt-2" />

              {/* Box 2 (Lookup & Runner List) - Full width */}
              <div className="space-y-6 w-full">
                <div>
                  <h3 className="text-base font-bold text-slate-400 font-display tracking-widest uppercase mb-1">BOX 2 // TRA CỨU & DANH SÁCH RUNNER</h3>
                  <div className="h-0.5 bg-slate-200 w-24 mb-4 rounded-full" />
                </div>
                <RunnerSearch runners={runners} />
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Footer credits line */}
      <footer className="border-t border-slate-150 py-8 mt-12 bg-white text-center text-xs text-slate-400/80 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Runner Statistics Dashboard. Đồng bộ dữ liệu tự động.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Bảo mật</span>
            <span className="hover:text-slate-600 cursor-pointer">Điều khoản</span>
            <span className="hover:text-slate-600 cursor-pointer">Trợ giúp</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

