'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  Download,
  Search,
  ArrowUpDown,
  TrendingUp,
  Users,
  Globe2,
  Flame,
  Thermometer,
  Snowflake,
  Eye,
  CircleDollarSign,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Lead {
  id: string;
  company: string | null;
  email: string | null;
  utmSource: string | null;
  quality: string;
  country: string | null;
  date: string;
}

interface RevenueMonthly {
  month: string;
  online: number;
  inStore: number;
}

interface TrendPoint {
  date: string;
  traffic: number;
  roi: number;
  conversions: number;
}

interface LeadsData {
  leads: Lead[];
  qualityCounts: { HOT: number; WARM: number; COLD: number; NEEDS_REVIEW: number };
  trendData: TrendPoint[];
  revenueData: {
    total: number;
    online: number;
    inStore: number;
    monthly: RevenueMonthly[];
  };
}

type SortKey = 'date' | 'company' | 'email' | 'utmSource' | 'quality' | 'country';
type SortDir = 'asc' | 'desc';

const qualityConfig: Record<string, { badge: string; icon: typeof Flame; label: string }> = {
  HOT: { badge: 'badge-red', icon: Flame, label: 'HOT' },
  WARM: { badge: 'badge-yellow', icon: Thermometer, label: 'WARM' },
  COLD: { badge: 'badge-blue', icon: Snowflake, label: 'COLD' },
  NEEDS_REVIEW: { badge: 'badge-purple', icon: Eye, label: 'NEEDS REVIEW' },
};

function formatCurrency(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

const COUNTRY_FLAGS: Record<string, string> = {
  India: '🇮🇳',
  US: '🇺🇸',
  'United States': '🇺🇸',
  UK: '🇬🇧',
  'United Kingdom': '🇬🇧',
  UAE: '🇦🇪',
  Canada: '🇨🇦',
  Australia: '🇦🇺',
  Singapore: '🇸🇬',
};

export default function LeadsTab() {
  const [data, setData] = useState<LeadsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/leads');
      const json = await res.json();
      setData(json);
    } catch {
      console.error('Failed to fetch leads data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'date' ? 'desc' : 'asc');
    }
  };

  const filteredLeads = useMemo(() => {
    if (!data) return [];
    let list = [...data.leads];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          (l.company || '').toLowerCase().includes(q) ||
          (l.email || '').toLowerCase().includes(q) ||
          (l.utmSource || '').toLowerCase().includes(q) ||
          (l.country || '').toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => {
      const aVal = a[sortKey] || '';
      const bVal = b[sortKey] || '';
      if (sortKey === 'date') {
        return sortDir === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
  }, [data, search, sortKey, sortDir]);

  const revenueChartData = useMemo(() => {
    if (!data) return [];
    return data.revenueData.monthly.map((m) => ({
      month: m.month,
      Online: m.online,
      'In-Store': m.inStore,
    }));
  }, [data]);

  const trendWithPct = useMemo(() => {
    if (!data || data.trendData.length < 2) return [];
    return data.trendData.map((t, i) => {
      const prev = data.trendData[i - 1];
      const trafficPct = prev ? ((t.traffic - prev.traffic) / prev.traffic * 100).toFixed(1) : '0.0';
      const roiPct = prev ? ((t.roi - prev.roi) / prev.roi * 100).toFixed(1) : '0.0';
      const convPct = prev ? ((t.conversions - prev.conversions) / prev.conversions * 100).toFixed(1) : '0.0';
      return { ...t, trafficPct: `${Number(trafficPct) > 0 ? '+' : ''}${trafficPct}%`, roiPct: `${Number(roiPct) > 0 ? '+' : ''}${roiPct}%`, convPct: `${Number(convPct) > 0 ? '+' : ''}${convPct}%` };
    });
  }, [data]);

  const onlinePct = data
    ? Math.round((data.revenueData.online / data.revenueData.total) * 100)
    : 0;
  const inStorePct = data ? 100 - onlinePct : 0;

  const SortableHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <TableHead
      className="cursor-pointer text-xs font-semibold text-gold"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </span>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg bg-secondary/50" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg bg-secondary/50" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg bg-secondary/50" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-lg bg-secondary/50" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-muted">
            <DollarSign className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Leads &amp; Revenue</h2>
            <p className="text-sm text-muted-foreground">Lead management and revenue analytics</p>
          </div>
        </div>
        <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold-muted">
          <Download className="mr-1.5 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="gold-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <CircleDollarSign className="h-4 w-4 text-gold" />
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </div>
          <p className="text-2xl font-bold text-foreground stat-animate gold-glow">
            {formatCurrency(data.revenueData.total)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">All channels</p>
        </Card>
        <Card className="gold-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Globe2 className="h-4 w-4 text-gold" />
            <p className="text-xs text-muted-foreground">Online Revenue</p>
          </div>
          <p className="text-2xl font-bold text-gold stat-animate">
            {formatCurrency(data.revenueData.online)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{onlinePct}% of total</p>
        </Card>
        <Card className="gold-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-gold" />
            <p className="text-xs text-muted-foreground">In-Store Revenue</p>
          </div>
          <p className="text-2xl font-bold text-foreground stat-animate">
            {formatCurrency(data.revenueData.inStore)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{inStorePct}% of total</p>
        </Card>
      </div>

      {/* Revenue Trend + Sales Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="gold-card lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-gold" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="onlineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4A843" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D4A843" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="inStoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E8C46A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#E8C46A" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 168, 67, 0.1)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#9a9080', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(212, 168, 67, 0.2)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#9a9080', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(212, 168, 67, 0.2)' }}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#111111',
                      border: '1px solid rgba(212, 168, 67, 0.3)',
                      borderRadius: '8px',
                      color: '#f5f0e8',
                      fontSize: '12px',
                    }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  />
                  <Legend
                    verticalAlign="top"
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '8px' }}
                    formatter={(value: string) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="Online"
                    stroke="#D4A843"
                    strokeWidth={2}
                    fill="url(#onlineGrad)"
                    stackId="1"
                  />
                  <Area
                    type="monotone"
                    dataKey="In-Store"
                    stroke="#E8C46A"
                    strokeWidth={2}
                    fill="url(#inStoreGrad)"
                    stackId="1"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales Distribution */}
        <Card className="gold-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-gold" />
              Sales Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-center gap-6">
            {/* Stacked horizontal bar */}
            <div>
              <div className="flex h-8 w-full overflow-hidden rounded-full">
                <div
                  className="flex items-center justify-center transition-all duration-700"
                  style={{
                    width: `${onlinePct}%`,
                    background: 'linear-gradient(135deg, #D4A843, #E8C46A)',
                  }}
                >
                  {onlinePct > 15 && (
                    <span className="text-xs font-bold text-primary-foreground">{onlinePct}%</span>
                  )}
                </div>
                <div
                  className="flex items-center justify-center bg-gold-dark/40 transition-all duration-700"
                  style={{ width: `${inStorePct}%` }}
                >
                  {inStorePct > 15 && (
                    <span className="text-xs font-bold text-gold-light">{inStorePct}%</span>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                  Online
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-gold-dark/60" />
                  In-Store
                </span>
              </div>
            </div>

            {/* Lead Quality Distribution */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Lead Quality</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(qualityConfig).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <div key={key} className="rounded-lg bg-secondary/40 p-3 text-center">
                      <Icon className="mx-auto mb-1 h-4 w-4" style={{ color: cfg.badge.includes('red') ? '#ef4444' : cfg.badge.includes('yellow') ? '#eab308' : cfg.badge.includes('blue') ? '#3b82f6' : '#a855f7' }} />
                      <p className="text-lg font-bold text-foreground">{data.qualityCounts[key as keyof typeof data.qualityCounts]}</p>
                      <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card className="gold-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-gold" />
              Leads
              <Badge className="badge-gold px-2 py-0.5 text-xs">{data.leads.length}</Badge>
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="border-border bg-secondary/50 pl-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto rounded-lg border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="gold-table-header hover:bg-transparent">
                  <SortableHeader label="Date" field="date" />
                  <SortableHeader label="Company" field="company" />
                  <SortableHeader label="Email" field="email" />
                  <SortableHeader label="UTM Source" field="utmSource" />
                  <SortableHeader label="Quality" field="quality" />
                  <SortableHeader label="Country" field="country" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => {
                  const qCfg = qualityConfig[lead.quality] || qualityConfig.COLD;
                  return (
                    <TableRow key={lead.id} className="border-border/30 hover:bg-gold-muted/20 transition-colors">
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(lead.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">{lead.company || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{lead.email || '—'}</TableCell>
                      <TableCell>
                        <Badge className="badge-gold px-1.5 py-0.5 text-[10px]">{lead.utmSource || 'Direct'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${qCfg.badge} px-2 py-0.5 text-[10px] font-semibold`}>
                          {qCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {lead.country ? (
                          <span className="flex items-center gap-1.5">
                            <span>{COUNTRY_FLAGS[lead.country] || ''}</span>
                            {lead.country}
                          </span>
                        ) : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Trends Chart */}
      <Card className="gold-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-gold" />
            Weekly Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendWithPct}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 168, 67, 0.1)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#9a9080', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(212, 168, 67, 0.2)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#9a9080', fontSize: 11 }}
                  axisLine={{ stroke: 'rgba(212, 168, 67, 0.2)' }}
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid rgba(212, 168, 67, 0.3)',
                    borderRadius: '8px',
                    color: '#f5f0e8',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Traffic') return [value.toLocaleString(), 'Traffic'];
                    if (name === 'ROI') return [formatCurrency(value), 'ROI'];
                    return [value, 'Conversions'];
                  }}
                  labelFormatter={(label) => {
                    const point = trendWithPct.find((t) => t.date === label);
                    if (!point) return label;
                    return `${label}  |  Traffic: ${point.trafficPct}  ROI: ${point.roiPct}  Conv: ${point.convPct}`;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '8px' }}
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="traffic"
                  name="Traffic"
                  stroke="#D4A843"
                  strokeWidth={2.5}
                  dot={{ fill: '#D4A843', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="roi"
                  name="ROI"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={{ fill: '#22c55e', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  name="Conversions"
                  stroke="#E8C46A"
                  strokeWidth={2.5}
                  dot={{ fill: '#E8C46A', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}