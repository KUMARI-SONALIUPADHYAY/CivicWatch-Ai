
import React from 'react';
import { DashboardStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StatsOverviewProps {
  stats: DashboardStats;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const chartData = Object.entries(stats.categoryDistribution).map(([name, value]) => ({
    name: name.replace('_', ' '),
    count: value
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-slate-400 text-sm font-semibold uppercase mb-1">Total Hazards</p>
        <h3 className="text-4xl font-bold text-slate-800">{stats.totalReports}</h3>
        <div className="mt-4 flex items-center text-xs text-slate-400">
          <span className="text-blue-500 font-bold mr-1">↑ 12%</span> from last week
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <p className="text-slate-400 text-sm font-semibold uppercase mb-1">Resolution Rate</p>
        <h3 className="text-4xl font-bold text-slate-800">
          {stats.totalReports > 0 ? Math.round((stats.resolvedCount / stats.totalReports) * 100) : 0}%
        </h3>
        <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
          <div 
            className="bg-green-500 h-1.5 rounded-full" 
            style={{ width: `${stats.totalReports > 0 ? (stats.resolvedCount / stats.totalReports) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <p className="text-slate-400 text-sm font-semibold uppercase mb-1">Hotspots by Category</p>
        <div className="h-24 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <Bar dataKey="count">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
