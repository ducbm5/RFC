/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Map, 
  UserSquare2, 
  TrendingUp, 
  Sparkles,
  Award,
  CircleDot
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { Runner } from '../types';

interface DashboardStatsProps {
  runners: Runner[];
}

export default function DashboardStats({ runners }: DashboardStatsProps) {
  const totalRunners = runners.length;

  // 1. Calculate Gender distribution
  const genderStats = useMemo(() => {
    const stats: Record<string, number> = {};
    runners.forEach(r => {
      // Normalize gender key (e.g. Nam/Nữ/Chưa rõ)
      let g = r.gioiTinh.trim();
      if (g.toLowerCase() === 'nam' || g.toLowerCase() === 'male') g = 'Nam';
      else if (g.toLowerCase() === 'nu' || g.toLowerCase() === 'nữ' || g.toLowerCase() === 'female') g = 'Nữ';
      else if (!g) g = 'Chưa rõ';
      
      stats[g] = (stats[g] || 0) + 1;
    });

    return Object.entries(stats).map(([name, count]) => ({
      name,
      count,
      percentage: totalRunners > 0 ? ((count / totalRunners) * 100).toFixed(1) : '0'
    }));
  }, [runners, totalRunners]);

  // 2. Calculate Distance distribution
  const distanceStats = useMemo(() => {
    const stats: Record<string, number> = {};
    runners.forEach(r => {
      stats[r.cuLy] = (stats[r.cuLy] || 0) + 1;
    });

    // Sort distances logically if they are e.g., 5km, 10km, 21km, 42km
    return Object.entries(stats)
      .map(([name, count]) => {
        // Extract numeric value for sorting
        const match = name.match(/(\d+(\.\d+)?)/);
        const num = match ? parseFloat(match[1]) : 999;
        return { name, count, num };
      })
      .sort((a, b) => a.num - b.num)
      .map(({ name, count }) => ({ name, count }));
  }, [runners]);

  // 3. Calculate Age groups
  const ageGroupStats = useMemo(() => {
    const groups = [
      { name: 'Dưới 18', count: 0, min: 1, max: 17 },
      { name: '18 - 29', count: 0, min: 18, max: 29 },
      { name: '30 - 39', count: 0, min: 30, max: 39 },
      { name: '40 - 49', count: 0, min: 40, max: 49 },
      { name: '50 - 59', count: 0, min: 50, max: 59 },
      { name: 'Trên 60', count: 0, min: 60, max: 200 },
      { name: 'Không rõ', count: 0, min: 0, max: 0 } // representing those with namSinh = 0
    ];

    runners.forEach(r => {
      const age = r.tuoi;
      if (age === 0) {
        groups[6].count++;
      } else {
        const group = groups.find(g => age >= g.min && age <= g.max);
        if (group) {
          group.count++;
        } else {
          groups[5].count++; // Above 60 fallback
        }
      }
    });

    // Always keep the main active brackets from 0 to 5 to avoid dynamic x/y axis jumping
    // Only exclude 'Không rõ' (index 6) if it has zero entries
    return groups.filter((g, index) => index < 6 || g.count > 0);
  }, [runners]);

  // Theme colors for beautiful visual flow
  const PIE_COLORS = {
    'Nam': '#3b82f6',     // Blue
    'Nữ': '#ec4899',      // Pink
    'Chưa rõ': '#94a3b8',  // Slate
    'Không rõ': '#94a3b8'
  };

  const BAR_COLORS = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ef4444', // Red
    '#06b6d4', // Cyan
  ];

  if (totalRunners === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50/50 rounded-2xl border border-gray-100">
        <CircleDot className="w-12 h-12 text-gray-400 mb-3 animate-pulse" />
        <p className="font-sans text-gray-500 font-medium">Không có dữ liệu thống kê.</p>
        <p className="text-gray-400 text-sm mt-1">Vui lòng kiểm tra lại nguồn cấp dữ liệu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Runners Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow duration-300"
          id="stat-card-total-runners"
        >
          <div>
            <p className="text-sm font-sans font-medium text-slate-500 uppercase tracking-wider">Tổng số Runner</p>
            <h3 className="text-4xl font-sans font-bold text-slate-900 mt-1 tracking-tight">
              {totalRunners.toLocaleString()}
            </h3>
            <p className="text-xs text-indigo-600 font-medium mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> VĐV đã đăng ký tham gia
            </p>
          </div>
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
            <Users className="w-7 h-7" />
          </div>
        </motion.div>

        {/* Favorite Distance Stat Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow duration-300"
          id="stat-card-favorite-distance"
        >
          <div>
            <p className="text-sm font-sans font-medium text-slate-500 uppercase tracking-wider">Cự ly phổ biến nhất</p>
            <h3 className="text-4xl font-sans font-bold text-slate-900 mt-1 tracking-tight">
              {distanceStats.length > 0 ? distanceStats.reduce((max, cur) => cur.count > max.count ? cur : max, distanceStats[0]).name : 'N/A'}
            </h3>
            <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
              <Award className="w-3 h-3" /> Thu hút nhiều lượt chạy nhất
            </p>
          </div>
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
            <Map className="w-7 h-7" />
          </div>
        </motion.div>

        {/* Median Age Group Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow duration-300"
          id="stat-card-prime-age"
        >
          <div>
            <p className="text-sm font-sans font-medium text-slate-500 uppercase tracking-wider">Độ tuổi đột phá</p>
            <h3 className="text-4xl font-sans font-bold text-slate-900 mt-1 tracking-tight">
              {ageGroupStats.length > 0 ? ageGroupStats.reduce((max, cur) => (cur.name !== 'Không rõ' && cur.count > max.count) ? cur : max, ageGroupStats[0]).name : 'N/A'}
            </h3>
            <p className="text-xs text-amber-600 font-medium mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Nhóm tuổi năng nổ nhất
            </p>
          </div>
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
            <UserSquare2 className="w-7 h-7" />
          </div>
        </motion.div>
      </div>

      {/* Grid of detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distance Distribution Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col hover:shadow-md transition-shadow duration-300"
          id="chart-distance-container"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-6 bg-indigo-500 rounded-full" />
            <h4 className="text-lg font-sans font-bold text-slate-850">Cự ly đăng ký (Runner / Cự ly)</h4>
          </div>
          
          <div className="h-64 mt-2 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distanceStats} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  className="font-sans text-xs text-slate-500 font-semibold"
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  className="font-sans text-xs text-slate-500 font-semibold"
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    border: '1px solid #f1f5f9', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  formatter={(value) => [`${value} Runner`, 'Số lượng']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36}>
                  {distanceStats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={BAR_COLORS[index % BAR_COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend Table */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-50 text-xs">
            {distanceStats.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-slate-600 bg-slate-50/60 py-2 px-3 rounded-lg border border-slate-100/50">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: BAR_COLORS[index % BAR_COLORS.length] }} 
                />
                <span className="font-semibold">{item.name}:</span>
                <span className="text-slate-900 font-bold ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Age Group Distribution Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col hover:shadow-md transition-shadow duration-300"
          id="chart-age-container"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-6 bg-amber-500 rounded-full" />
            <h4 className="text-lg font-sans font-bold text-slate-850">Phân bố độ tuổi</h4>
          </div>

          <div className="h-64 mt-2 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageGroupStats} margin={{ top: 20, right: 10, left: -20, bottom: 5 }} layout="vertical">
                <XAxis type="number" tickLine={false} axisLine={false} className="font-sans text-xs text-slate-500 font-semibold" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tickLine={false} 
                  axisLine={false}
                  className="font-sans text-xs text-slate-500 font-semibold"
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    border: '1px solid #f1f5f9', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  formatter={(value) => [`${value} Runner`, 'Số lượng']}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                  {ageGroupStats.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={BAR_COLORS[(index + 3) % BAR_COLORS.length]} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Age Group Labels */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-50 text-xs">
            {ageGroupStats.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-slate-600 bg-slate-50/60 py-2 px-3 rounded-lg border border-slate-100/50">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: BAR_COLORS[(index + 3) % BAR_COLORS.length] }} 
                />
                <span className="font-semibold">{item.name}:</span>
                <span className="text-slate-900 font-bold ml-auto">{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Gender Demographics (Col-span 100% on normal, styled with absolute layout elegance) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:col-span-2 hover:shadow-md transition-shadow duration-300"
          id="chart-gender-container"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-6 bg-pink-500 rounded-full" />
            <h4 className="text-lg font-sans font-bold text-slate-850">Cơ cấu Giới tính</h4>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-4">
            {/* Pie Chart Representation */}
            <div className="h-56 w-56 shrink-0 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ 
                      border: '1px solid #f1f5f9', 
                      borderRadius: '12px', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    formatter={(value, name) => [`${value} Runner`, `${name}`]}
                  />
                  <Pie
                    data={genderStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {genderStats.map((entry) => (
                      <Cell 
                        key={`cell-${entry.name}`} 
                        fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS] || '#64748b'} 
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              
              {/* Absoluted stat center-piece */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-sm font-medium text-slate-400">Tỷ lệ chính</span>
                <span className="text-2xl font-bold text-slate-850">
                  {genderStats.length > 0 ? `${genderStats.reduce((max, cur) => cur.count > max.count ? cur : max, genderStats[0]).percentage}%` : 'N/A'}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {genderStats.length > 0 ? genderStats.reduce((max, cur) => cur.count > max.count ? cur : max, genderStats[0]).name : ''}
                </span>
              </div>
            </div>

            {/* Structured Stats Side Deck */}
            <div className="space-y-4 flex-1 max-w-md w-full">
              {genderStats.map((item) => {
                const color = PIE_COLORS[item.name as keyof typeof PIE_COLORS] || '#64748b';
                return (
                  <div key={item.name} className="space-y-1.5 p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors duration-200">
                    <div className="flex justify-between text-sm font-semibold">
                      <div className="flex items-center gap-2 text-slate-700">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: color }} 
                        />
                        <span>Runner {item.name}</span>
                      </div>
                      <div className="text-slate-900">
                        {item.count} <span className="text-xs text-slate-400 font-normal">({item.percentage}%)</span>
                      </div>
                    </div>
                    {/* Linear progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out" 
                        style={{ 
                          backgroundColor: color, 
                          width: `${item.percentage}%` 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
