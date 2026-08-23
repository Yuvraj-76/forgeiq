import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Layers,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Zap,
  Download,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { StatCard } from '../components/StatCard';
import { getAnalytics } from '../services/api';
import { formatNumber, formatPercent } from '../utils/formatters';

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30 Days');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getAnalytics(timeRange);
        setAnalyticsData(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [timeRange]);

  const summary = analyticsData?.summary || {
    totalProcessed: 1284,
    successfullyEnriched: 1201,
    averageConfidence: 92.6,
    lowConfidenceCount: 83,
    manualReviewsPending: 19,
    dataCompletenessRate: 98.4,
  };

  const timeSeries = analyticsData?.timeSeries || [];
  const confidenceDistribution = analyticsData?.confidenceDistribution || [];
  const categoryDistribution = analyticsData?.categoryDistribution || [];
  const topBrands = analyticsData?.topBrands || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Data Quality & Catalog Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time telemetry on catalog throughput, model confidence distributions, and human review efficiency.
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
          {['Today', '7 Days', '30 Days', '90 Days'].map((range) => (
            <button
              key={range}
              type="button"
              id={`analytics-range-${range.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Top 5 Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Products"
          value={formatNumber(summary.totalProcessed)}
          subtitle="Processed in catalog"
          change="+18.4%"
          color="indigo"
          icon="Layers"
        />

        <StatCard
          title="Enrichment Success Rate"
          value="93.5%"
          subtitle="Direct pass to catalog"
          change="+2.1%"
          color="emerald"
          icon="CheckCircle2"
        />

        <StatCard
          title="Average Confidence"
          value={`${summary.averageConfidence}%`}
          subtitle="Weighted accuracy"
          change="+1.4%"
          color="blue"
          icon="ShieldCheck"
        />

        <StatCard
          title="Manual Review Rate"
          value="6.5%"
          subtitle="Flagged for specialist"
          change="-2.3%"
          color="amber"
          icon="AlertTriangle"
        />

        <StatCard
          title="Data Completeness"
          value="98.4%"
          subtitle="Populated spec fields"
          change="+3.0%"
          color="purple"
          icon="Zap"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Processed Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Enrichment Throughput</h3>
              <p className="text-xs text-slate-500">Daily high-confidence vs review items</p>
            </div>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="high" fill="#10b981" radius={[4, 4, 0, 0]} name="High Confidence" />
                <Bar dataKey="low" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Needs Review" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Category Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of enriched products across product taxonomy</p>
            </div>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={categoryDistribution}
                margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="SKU Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Brands Performance */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Top Brands by Volume & Quality</h3>
            <p className="text-xs text-slate-500">Average model confidence across major manufacturers</p>
          </div>
          <div className="mt-4 space-y-3">
            {topBrands.map((brand, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[11px]">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">{brand.brand}</div>
                    <div className="text-[11px] text-slate-500">{brand.count} products enriched</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-emerald-700 font-mono">{brand.avgConfidence}%</div>
                  <div className="text-[10px] text-slate-400">Avg Confidence</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Confidence Breakdown</h3>
            <p className="text-xs text-slate-500">Total catalog quality assessment</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={confidenceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {confidenceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {confidenceDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{formatNumber(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
