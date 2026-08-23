import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Layers,
  BarChart3,
  Clock,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
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
import { ProductTable } from '../components/ProductTable';
import { getAnalytics, getProducts } from '../services/api';
import { formatNumber, formatPercent } from '../utils/formatters';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [statsData, prods] = await Promise.all([getAnalytics('30 Days'), getProducts()]);
        setAnalytics(statsData);
        setRecentProducts(prods.slice(0, 7));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const summary = analytics?.summary || {
    totalProcessed: 1284,
    successfullyEnriched: 1201,
    averageConfidence: 92.6,
    lowConfidenceCount: 83,
  };

  const timeSeriesData = analytics?.timeSeries || [];
  const confidenceData = analytics?.confidenceDistribution || [
    { name: 'High (90-100%)', value: 1124, color: '#10b981' },
    { name: 'Medium (70-89%)', value: 77, color: '#f59e0b' },
    { name: 'Low (<70%)', value: 83, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome & Quick CTA Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI Catalog Automation Active
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Product Data Intelligence
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Transform unstructured supplier data, raw datasheets, and messy SKUs into standardized, verified e-commerce product catalogs with 95%+ confidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="dashboard-enrich-cta-btn"
              onClick={() => navigate('/enrich')}
              className="px-5 py-3 rounded-xl font-bold text-sm bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Sparkles className="w-4 h-4" />
              <span>+ Enrich Product</span>
            </button>

            <button
              type="button"
              id="dashboard-bulk-cta-btn"
              onClick={() => navigate('/bulk-upload')}
              className="px-5 py-3 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-slate-300" />
              <span>Bulk CSV Processing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          id="stat-products-processed"
          title="Products Processed"
          value={formatNumber(summary.totalProcessed)}
          subtitle="+14.2% from last month"
          change="+14.2%"
          changeType="positive"
          icon="Layers"
          color="indigo"
        />

        <StatCard
          id="stat-successfully-enriched"
          title="Successfully Enriched"
          value={formatNumber(summary.successfullyEnriched)}
          subtitle="93.5% automated pass rate"
          change="+93.5%"
          changeType="positive"
          icon="CheckCircle2"
          color="emerald"
        />

        <StatCard
          id="stat-average-confidence"
          title="Average Confidence"
          value={`${summary.averageConfidence}%`}
          subtitle="Weighted certainty score"
          change="+1.8%"
          changeType="positive"
          icon="ShieldCheck"
          color="blue"
        />

        <StatCard
          id="stat-low-confidence"
          title="Low Confidence Products"
          value={formatNumber(summary.lowConfidenceCount)}
          subtitle="Flagged for human review"
          change="-8.4%"
          changeType="positive" // reduction in errors is positive
          icon="AlertTriangle"
          color="amber"
          onClick={() => navigate('/catalog?confidence=Low')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Enriched Over Time (Area Chart) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Products Enriched Over Time</h3>
              <p className="text-xs text-slate-500">Daily throughput of automated catalog pipeline</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
              Last 7 Days
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrichColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="highColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#enrichColor)"
                  name="Total Processed"
                />
                <Area
                  type="monotone"
                  dataKey="high"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#highColor)"
                  name="High Confidence"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence Distribution (Donut Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Confidence Distribution</h3>
            <p className="text-xs text-slate-500">Quality categorization of catalog attributes</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={confidenceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {confidenceData.map((entry, index) => (
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

            {/* Donut center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-slate-900">92.6%</span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Avg Score</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {confidenceData.map((item, idx) => (
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

      {/* Recent Enrichment Jobs Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Enrichment Jobs</h3>
            <p className="text-xs text-slate-500">Live feed of processed supplier product items</p>
          </div>

          <button
            type="button"
            id="view-all-catalog-btn"
            onClick={() => navigate('/catalog')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View Complete Catalog ({summary.totalProcessed})</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <ProductTable products={recentProducts} isLoading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
