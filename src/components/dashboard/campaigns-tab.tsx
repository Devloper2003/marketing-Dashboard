'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Megaphone,
  Plus,
  ArrowUpDown,
  TrendingUp,
  IndianRupee,
  Target,
  BarChart3,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  spend: number;
  conversions: number;
  cac: number;
  roas: number;
  status: string;
  performance: string | null;
}

type SortKey = 'name' | 'channel' | 'spend' | 'conversions' | 'cac' | 'roas';
type SortDir = 'asc' | 'desc';

const channelColors: Record<string, string> = {
  Google: 'bg-red-500/15 text-red-400 border-red-500/30',
  Instagram: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  Facebook: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Twitter: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  YouTube: 'bg-red-400/15 text-red-300 border-red-400/30',
  LinkedIn: 'bg-sky-600/15 text-sky-500 border-sky-600/30',
  Pinterest: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  Email: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

const statusStyles: Record<string, string> = {
  active: 'badge-green',
  at_risk: 'badge-yellow',
  completed: 'badge-blue',
  paused: 'badge-gold',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  at_risk: 'At Risk',
  completed: 'Completed',
  paused: 'Paused',
};

function formatCurrency(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

function getRoasColor(roas: number): string {
  if (roas > 4) return 'text-green-400';
  if (roas >= 2) return 'text-yellow-400';
  return 'text-red-400';
}

export default function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('roas');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/overview');
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch {
      console.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'cac' || key === 'name' ? 'asc' : 'desc');
    }
  };

  const channels = useMemo(
    () => [...new Set(campaigns.map((c) => c.channel))],
    [campaigns]
  );

  const statuses = useMemo(
    () => [...new Set(campaigns.map((c) => c.status))],
    [campaigns]
  );

  const filteredCampaigns = useMemo(() => {
    let list = campaigns;
    if (filterChannel !== 'all') list = list.filter((c) => c.channel === filterChannel);
    if (filterStatus !== 'all') list = list.filter((c) => c.status === filterStatus);
    return list.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
  }, [campaigns, filterChannel, filterStatus, sortKey, sortDir]);

  const channelSpend = useMemo(() => {
    const map: Record<string, number> = {};
    campaigns.forEach((c) => {
      map[c.channel] = (map[c.channel] || 0) + c.spend;
    });
    return Object.entries(map)
      .map(([channel, spend]) => ({ channel, spend: Math.round(spend) }))
      .sort((a, b) => b.spend - a.spend);
  }, [campaigns]);

  const campaignRoas = useMemo(
    () =>
      campaigns
        .slice(0, 8)
        .map((c) => ({
          name: c.name.length > 18 ? c.name.slice(0, 18) + '...' : c.name,
          roas: c.roas,
          fill: c.roas > 4 ? '#22c55e' : c.roas >= 2 ? '#eab308' : '#ef4444',
        })),
    [campaigns]
  );

  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const activeCount = campaigns.filter((c) => c.status === 'active').length;
  const avgRoas =
    campaigns.length > 0
      ? campaigns.reduce((s, c) => s + c.roas, 0) / campaigns.length
      : 0;

  const bestChannel = useMemo(() => {
    if (channelSpend.length === 0) return '—';
    const roasMap: Record<string, { total: number; count: number }> = {};
    campaigns.forEach((c) => {
      if (!roasMap[c.channel]) roasMap[c.channel] = { total: 0, count: 0 };
      roasMap[c.channel].total += c.roas;
      roasMap[c.channel].count += 1;
    });
    let best = '';
    let bestAvg = 0;
    for (const [ch, { total, count }] of Object.entries(roasMap)) {
      const avg = total / count;
      if (avg > bestAvg) {
        bestAvg = avg;
        best = ch;
      }
    }
    return best;
  }, [campaigns]);

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
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg bg-secondary/50" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-lg bg-secondary/50" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-lg bg-secondary/50" />
          <Skeleton className="h-64 rounded-lg bg-secondary/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-muted">
            <Megaphone className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Campaign Insights</h2>
            <p className="text-sm text-muted-foreground">Track campaign performance across all channels</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterChannel} onValueChange={setFilterChannel}>
            <SelectTrigger className="h-9 w-36 border-border bg-secondary/50 text-xs">
              <SelectValue placeholder="Channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              {channels.map((ch) => (
                <SelectItem key={ch} value={ch}>{ch}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 w-32 border-border bg-secondary/50 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>{statusLabels[s] || s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="gold-gradient text-primary-foreground hover:opacity-90">
            <Plus className="mr-1.5 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="gold-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-gold" />
            <p className="text-xs text-muted-foreground">Active Campaigns</p>
          </div>
          <p className="text-2xl font-bold text-foreground stat-animate">{activeCount}</p>
          <p className="text-xs text-muted-foreground mt-1">of {campaigns.length} total</p>
        </Card>
        <Card className="gold-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee className="h-4 w-4 text-gold" />
            <p className="text-xs text-muted-foreground">Total Budget Used</p>
          </div>
          <p className="text-2xl font-bold text-foreground stat-animate">{formatCurrency(totalSpend)}</p>
          <p className="text-xs text-muted-foreground mt-1">All channels combined</p>
        </Card>
        <Card className="gold-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-gold" />
            <p className="text-xs text-muted-foreground">Best Channel</p>
          </div>
          <p className="text-2xl font-bold text-gold stat-animate">{bestChannel}</p>
          <p className="text-xs text-muted-foreground mt-1">By average ROAS</p>
        </Card>
        <Card className="gold-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-gold" />
            <p className="text-xs text-muted-foreground">Average ROAS</p>
          </div>
          <p className={`text-2xl font-bold stat-animate ${getRoasColor(avgRoas)}`}>
            {avgRoas.toFixed(1)}x
          </p>
          <p className="text-xs text-muted-foreground mt-1">Return on ad spend</p>
        </Card>
      </div>

      {/* Campaign Table */}
      <Card className="gold-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-gold" />
            Campaign Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[420px] overflow-y-auto rounded-lg border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="gold-table-header hover:bg-transparent">
                  <SortableHeader label="Campaign" field="name" />
                  <TableHead className="text-xs font-semibold text-gold">Channel</TableHead>
                  <SortableHeader label="Spend" field="spend" />
                  <SortableHeader label="Conv." field="conversions" />
                  <SortableHeader label="CAC" field="cac" />
                  <SortableHeader label="ROAS" field="roas" />
                  <TableHead className="text-xs font-semibold text-gold">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-gold">Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((c) => (
                  <TableRow key={c.id} className="border-border/30 hover:bg-gold-muted/20 transition-colors">
                    <TableCell className="font-semibold text-foreground text-sm">{c.name}</TableCell>
                    <TableCell>
                      <Badge className={`${channelColors[c.channel] || 'badge-gold'} px-2 py-0.5 text-[10px]`}>
                        {c.channel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatCurrency(c.spend)}</TableCell>
                    <TableCell className="text-sm text-foreground">{c.conversions}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatCurrency(c.cac)}</TableCell>
                    <TableCell>
                      <span className={`text-sm font-bold ${getRoasColor(c.roas)}`}>{c.roas}x</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusStyles[c.status] || 'badge-gold'} px-2 py-0.5 text-[10px]`}>
                        {statusLabels[c.status] || c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs italic text-muted-foreground max-w-[140px] truncate">
                      {c.performance || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Channel Spend Breakdown */}
        <Card className="gold-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IndianRupee className="h-5 w-5 text-gold" />
              Channel Spend Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelSpend} layout="vertical" barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 168, 67, 0.1)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: '#9a9080', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(212, 168, 67, 0.2)' }}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <YAxis
                    type="category"
                    dataKey="channel"
                    tick={{ fill: '#f5f0e8', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#111111',
                      border: '1px solid rgba(212, 168, 67, 0.3)',
                      borderRadius: '8px',
                      color: '#f5f0e8',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Spend']}
                  />
                  <Bar dataKey="spend" radius={[0, 6, 6, 0]}>
                    {channelSpend.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#goldGradient-${index})`}
                      />
                    ))}
                    <defs>
                      <linearGradient id={`goldGradient-0`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#B8922F" />
                        <stop offset="100%" stopColor="#E8C46A" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Campaign ROI Chart */}
        <Card className="gold-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-gold" />
              Campaign ROAS Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignRoas} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 168, 67, 0.1)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#9a9080', fontSize: 10 }}
                    axisLine={{ stroke: 'rgba(212, 168, 67, 0.2)' }}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                    height={60}
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
                    formatter={(value: number) => [`${value}x`, 'ROAS']}
                  />
                  <Bar dataKey="roas" name="ROAS" radius={[6, 6, 0, 0]}>
                    {campaignRoas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

