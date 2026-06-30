'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  DollarSign,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Users,
  Eye,
  Instagram,
  Twitter,
  Facebook,
  ChevronRight,
  Target,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Gem,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface KpiData {
  totalSpend: number;
  totalConversions: number;
  avgCac: number;
  avgRoas: number;
  totalFollowers: number;
  pageViews: number;
  bounceRate: number;
}

interface CampaignRow {
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

interface GoalItem {
  id: string;
  channel: string;
  metric: string;
  current: number;
  target: number;
  status: string;
}

interface TrafficPoint {
  month: string;
  paid: number;
  organic: number;
}

interface FunnelStage {
  stage: string;
  value: number;
  dropRate: number;
}

interface SocialPlatform {
  followers: number;
  posts: number;
  engagement: number;
}

interface OverviewData {
  kpis: KpiData;
  goalTracking: {
    onTrack: number;
    atRisk: number;
    offTrack: number;
    total: number;
  };
  campaigns: CampaignRow[];
  goals: GoalItem[];
  trafficData: TrafficPoint[];
  funnelData: FunnelStage[];
  socialMedia: {
    instagram: SocialPlatform;
    twitter: SocialPlatform;
    facebook: SocialPlatform;
    pinterest: SocialPlatform;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return n.toLocaleString('en-IN');
}

function formatCurrency(n: number): string {
  if (n >= 1000) return `₹${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function performanceBadgeClass(perf: string | null | undefined): string {
  if (!perf) return 'badge-yellow';
  const p = perf.toLowerCase();
  if (p === 'excellent' || p === 'good' || p === 'great') return 'badge-green';
  if (p === 'poor' || p === 'bad') return 'badge-red';
  return 'badge-yellow';
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

function GoldTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-[#111] px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

// ─── KPI Cards Skeleton ─────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="gold-card rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

// ─── Chart Skeleton ─────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <Card className="gold-card border-0">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-56" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[260px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function OverviewTab() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/marketing/overview');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // silently fail — keep showing skeletons
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ─── KPI cards config ────────────────────────────────────────────────────

  const kpiCards = loading
    ? null
    : [
        {
          label: 'Total Spend',
          value: formatCurrency(data!.kpis.totalSpend),
          raw: data!.kpis.totalSpend,
          change: -14.6,
          icon: DollarSign,
          positive: false,
          good: false,
        },
        {
          label: 'Conversions',
          value: formatNumber(data!.kpis.totalConversions),
          raw: data!.kpis.totalConversions,
          change: 8.3,
          icon: TrendingUp,
          positive: true,
          good: true,
        },
        {
          label: 'Avg. CPA',
          value: `₹${data!.kpis.avgCac.toFixed(2)}`,
          raw: data!.kpis.avgCac,
          change: -5.8,
          icon: Target,
          positive: false,
          good: true,
        },
        {
          label: 'ROAS',
          value: `${data!.kpis.avgRoas.toFixed(2)}x`,
          raw: data!.kpis.avgRoas,
          change: 11.2,
          icon: ArrowUpRight,
          positive: true,
          good: true,
        },
        {
          label: 'Total Followers',
          value: formatNumber(data!.kpis.totalFollowers),
          raw: data!.kpis.totalFollowers,
          change: 12.4,
          icon: Users,
          positive: true,
          good: true,
        },
        {
          label: 'Page Views',
          value: formatNumber(data!.kpis.pageViews),
          raw: data!.kpis.pageViews,
          change: -3.2,
          icon: Eye,
          positive: false,
          good: false,
          extra: `Bounce: ${data!.kpis.bounceRate}%`,
        },
      ];

  // ─── Spend by channel (static mock) ──────────────────────────────────────

  const spendByChannel = [
    { channel: 'Google Ads', spend: 28500 },
    { channel: 'Instagram', spend: 22000 },
    { channel: 'YouTube', spend: 12800 },
    { channel: 'Facebook', spend: 7400 },
    { channel: 'Email', spend: 1980 },
    { channel: 'Organic', spend: 0 },
  ];

  // ─── Social platforms config ─────────────────────────────────────────────

  const socialPlatforms = loading
    ? null
    : [
        {
          name: 'Instagram',
          icon: Instagram,
          color: '#E1306C',
          data: data!.socialMedia.instagram,
        },
        {
          name: 'Twitter',
          icon: Twitter,
          color: '#1DA1F2',
          data: data!.socialMedia.twitter,
        },
        {
          name: 'Facebook',
          icon: Facebook,
          color: '#4267B2',
          data: data!.socialMedia.facebook,
        },
        {
          name: 'Pinterest',
          icon: ChevronRight,
          color: '#E60023',
          data: data!.socialMedia.pinterest,
        },
      ];

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-[#1a1610] via-[#151210] to-[#0d0d0d] border border-[#D4A843]/15">
        <CardContent className="relative p-5 sm:p-6">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#D4A843]/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#D4A843]/3 to-transparent rounded-full translate-y-1/3 -translate-x-1/4" />
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gold-gradient shadow-lg shadow-[#D4A843]/20">
                <Gem className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold gold-gradient-text">{getGreeting()}, Laxree Team</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Your marketing dashboard is performing <span className="text-green-400 font-medium">12% better</span> than last month. 
                  3 campaigns need attention.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-0">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#D4A843]/10 border border-[#D4A843]/20">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <div>
                  <p className="text-xs text-muted-foreground">ROAS</p>
                  <p className="text-sm font-bold text-green-400">+11.2%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#D4A843]/10 border border-[#D4A843]/20">
                <Users className="h-4 w-4 text-[#D4A843]" />
                <div>
                  <p className="text-xs text-muted-foreground">New Leads</p>
                  <p className="text-sm font-bold text-[#D4A843]">+48</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#D4A843]/10 border border-[#D4A843]/20">
                <Target className="h-4 w-4 text-[#E8C46A]" />
                <div>
                  <p className="text-xs text-muted-foreground">Conversions</p>
                  <p className="text-sm font-bold text-[#E8C46A]">+8.3%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 stagger-children count-animate">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          kpiCards!.map((kpi, idx) => (
            <div
              key={kpi.label}
              className="stat-animate gold-card-hover gold-shimmer rounded-xl p-4"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {kpi.label}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-muted">
                  <kpi.icon className="h-4 w-4 text-gold" />
                </div>
              </div>
              <p className="text-2xl font-bold gold-glow tracking-tight">
                {kpi.value}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                {kpi.positive ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <ArrowDownRight
                    className={`h-3.5 w-3.5 ${kpi.good ? 'text-green-400' : 'text-red-400'}`}
                  />
                )}
                <span
                  className={`text-xs font-medium ${
                    kpi.good ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {Math.abs(kpi.change)}%
                </span>
                {kpi.extra && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    {kpi.extra}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Charts Grid 2×2 ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Traffic Trend */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <Card className="gold-card border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-foreground">
                    Traffic Trend
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Paid vs Organic traffic over 5 months
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data!.trafficData}>
                    <defs>
                      <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4A843" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#D4A843" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="creamGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E8C46A" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#E8C46A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2a2520"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#9a9080', fontSize: 12 }}
                      axisLine={{ stroke: '#2a2520' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#9a9080', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                      domain={[0, 50000]}
                    />
                    <Tooltip content={<GoldTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: '#9a9080' }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Area
                      type="monotone"
                      dataKey="paid"
                      name="Paid Traffic"
                      stroke="#D4A843"
                      strokeWidth={2}
                      fill="url(#goldGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="organic"
                      name="Organic Traffic"
                      stroke="#E8C46A"
                      strokeWidth={2}
                      fill="url(#creamGrad)"
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Funnel Breakdown */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <Card className="gold-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Funnel Breakdown
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                User journey from impression to conversion
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data!.funnelData}
                    layout="vertical"
                    margin={{ left: 20 }}
                  >
                    <defs>
                      <linearGradient id="barGold" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#B8922F" />
                        <stop offset="100%" stopColor="#E8C46A" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2a2520"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: '#9a9080', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                    />
                    <YAxis
                      dataKey="stage"
                      type="category"
                      tick={{ fill: '#f5f0e8', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />
                    <Tooltip content={<GoldTooltip />} />
                    <Bar
                      dataKey="value"
                      name="Count"
                      fill="url(#barGold)"
                      radius={[0, 4, 4, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Spend by Channel */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <Card className="gold-card border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Spend by Channel
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Budget allocation across marketing channels
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={spendByChannel}>
                    <defs>
                      <linearGradient id="spendGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4A843" />
                        <stop offset="100%" stopColor="#B8922F" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2a2520"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="channel"
                      tick={{ fill: '#9a9080', fontSize: 11 }}
                      axisLine={{ stroke: '#2a2520' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#9a9080', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip content={<GoldTooltip />} />
                    <Bar
                      dataKey="spend"
                      name="Spend"
                      fill="url(#spendGold)"
                      radius={[4, 4, 0, 0]}
                      barSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Channel Goal Tracking */}
        {loading ? (
          <ChartSkeleton />
        ) : (
          <Card className="gold-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">
                Channel Goal Tracking
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {data!.goalTracking.total} total goals across channels
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Status summary */}
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-center">
                  <CheckCircle2 className="mx-auto mb-1 h-4 w-4 text-green-400" />
                  <p className="text-lg font-bold text-green-400">
                    {data!.goalTracking.onTrack}
                  </p>
                  <p className="text-[10px] text-green-400/70">On Track</p>
                </div>
                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-center">
                  <AlertTriangle className="mx-auto mb-1 h-4 w-4 text-yellow-400" />
                  <p className="text-lg font-bold text-yellow-400">
                    {data!.goalTracking.atRisk}
                  </p>
                  <p className="text-[10px] text-yellow-400/70">At Risk</p>
                </div>
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-center">
                  <XCircle className="mx-auto mb-1 h-4 w-4 text-red-400" />
                  <p className="text-lg font-bold text-red-400">
                    {data!.goalTracking.offTrack}
                  </p>
                  <p className="text-[10px] text-red-400/70">Off Track</p>
                </div>
              </div>

              {/* Individual goals */}
              <div className="max-h-[140px] space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                {data!.goals.slice(0, 6).map((goal) => {
                  const pct = Math.min(
                    100,
                    Math.round((goal.current / goal.target) * 100)
                  );
                  const statusColor =
                    goal.status === 'on_track'
                      ? 'text-green-400'
                      : goal.status === 'at_risk'
                        ? 'text-yellow-400'
                        : 'text-red-400';
                  const barColor =
                    goal.status === 'on_track'
                      ? 'bg-green-400'
                      : goal.status === 'at_risk'
                        ? 'bg-yellow-400'
                        : 'bg-red-400';

                  return (
                    <div key={goal.id}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-foreground">
                          {goal.channel} — {goal.metric}
                        </span>
                        <span
                          className={`text-xs font-semibold ${statusColor}`}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full ${barColor} transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Campaign Insights Table ─────────────────────────────────────── */}
      <Card className="gold-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Campaign Insights
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Performance breakdown of active marketing campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="gold-table-header hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-gold">
                      Campaign
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gold">
                      Channel
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gold text-right">
                      Spend
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gold text-right">
                      Convs.
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gold text-right">
                      CAC
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gold text-right">
                      ROAS
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-gold text-right">
                      Performance
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data!.campaigns.slice(0, 10).map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-border/50 table-row-hover"
                    >
                      <TableCell className="text-xs font-medium text-foreground">
                        {c.name}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">
                          {c.channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right text-foreground">
                        {formatCurrency(c.spend)}
                      </TableCell>
                      <TableCell className="text-xs text-right text-foreground">
                        {c.conversions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-right text-foreground">
                        ₹{c.cac.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-right text-foreground">
                        {c.roas.toFixed(2)}x
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            performanceBadgeClass(c.performance)
                          }`}
                        >
                          {c.performance || 'Average'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Social Media Quick Stats ────────────────────────────────────── */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Social Media Quick Stats
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="gold-card rounded-xl p-4 space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-7 w-32" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            : socialPlatforms!.map((sp) => (
                <div
                  key={sp.name}
                  className="stat-animate gold-card gold-shimmer rounded-xl p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${sp.color}20` }}
                    >
                      <sp.icon className="h-4 w-4" style={{ color: sp.color }} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {sp.name}
                    </span>
                  </div>
                  <p className="text-xl font-bold gold-glow">
                    {formatNumber(sp.data.followers)}
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        Posts
                      </span>
                      <span className="text-[11px] font-medium text-foreground">
                        {sp.data.posts}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        Engagement
                      </span>
                      <span className="text-[11px] font-semibold text-gold">
                        {sp.data.engagement}%
                      </span>
                    </div>
                    <Progress
                      value={sp.data.engagement * 10}
                      className="mt-1 h-1"
                    />
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Campaign Performance Alerts */}
      <Card className="gold-card border-0 mt-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              </div>
              <CardTitle className="text-sm font-semibold">Campaign Alerts</CardTitle>
            </div>
            <Badge variant="outline" className="badge-red text-[10px]">3 Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { campaign: 'YouTube Brand Video', channel: 'YouTube', issue: 'CPM increased 42%, ROAS dropped to 2.1x', severity: 'critical' },
            { campaign: 'Influencer Collab Q4', channel: 'Instagram', issue: 'Below target conversions by 15%', severity: 'warning' },
            { campaign: 'Organic Traffic', channel: 'Organic', issue: 'Monthly traffic target 75% reached, needs content push', severity: 'warning' },
          ].map((alert, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#0a0a0a] border border-border/50 hover:border-[#D4A843]/20 transition-colors">
              <span className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${alert.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{alert.campaign}</p>
                  <Badge variant="outline" className="badge-gold text-[10px] shrink-0">{alert.channel}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.issue}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}