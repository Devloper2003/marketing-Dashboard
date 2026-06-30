'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  Filter,
  Users,
  TrendingUp,
  Clock,
  IndianRupee,
  ArrowDownRight,
  AlertTriangle,
  Monitor,
  Smartphone,
  Tablet,
  Target,
  Zap,
  ChevronDown,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';

/* ──────────── Types ──────────── */
interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: number | null;
  dropoffRate: number | null;
  avgTimeSpent: number;
  revenue: number | null;
}

interface ChannelFunnel {
  channel: string;
  stages: { stage: string; count: number }[];
}

interface Bottleneck {
  fromStage: string;
  toStage: string;
  dropoffCount: number;
  dropoffPercent: number;
  recommendation: string;
}

interface JourneyDuration {
  range: string;
  count: number;
}

interface DeviceBreakdown {
  device: string;
  percentage: number;
  conversionRate: number;
  count: number;
}

interface MonthlyFunnelTrend {
  month: string;
  stages: { stage: string; count: number }[];
}

interface FunnelData {
  mainFunnel: FunnelStage[];
  funnelByChannel: ChannelFunnel[];
  bottlenecks: Bottleneck[];
  journeyDuration: JourneyDuration[];
  deviceBreakdown: DeviceBreakdown[];
  monthlyFunnelTrend: MonthlyFunnelTrend[];
}

/* ──────────── Helpers ──────────── */
function formatCount(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return n.toString();
}

function formatCurrency(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return `₹${n}`;
}

const CHANNEL_COLORS = ['#D4A843', '#C4943A', '#B8860B', '#A07828', '#8B6914'];

const DEVICE_COLORS: Record<string, string> = {
  Desktop: '#D4A843',
  Mobile: '#B8860B',
  Tablet: '#8B6914',
};

const STAGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Awareness: Eye,
  Interest: Users,
  Consideration: Target,
  Intent: Zap,
  Evaluation: Filter,
  Purchase: IndianRupee,
  Loyalty: TrendingUp,
};

/* ──────────── Custom Tooltip ──────────── */
function ChannelTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string; payload: { channel: string } }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-[#D4A843]/30 rounded-lg p-3 shadow-xl">
      <p className="text-sm font-semibold text-[#D4A843] mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="flex-1">{p.name}</span>
          <span className="text-foreground font-medium">{formatCount(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function DurationTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { range: string } }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-[#D4A843]/30 rounded-lg p-3 shadow-xl">
      <p className="text-sm font-semibold text-[#D4A843]">{payload[0].payload.range}</p>
      <p className="text-xs text-muted-foreground mt-1">{formatCount(payload[0].value)} visitors</p>
    </div>
  );
}

/* ──────────── Component ──────────── */
export default function FunnelTab() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredStage, setHoveredStage] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/marketing/funnel')
      .then((r) => r.json())
      .then((d: FunnelData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load funnel data');
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6 p-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[500px] rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  const maxCount = data.mainFunnel[0].count;
  const overallCR = ((data.mainFunnel[5].count / data.mainFunnel[0].count) * 100).toFixed(1);
  const revenuePerVisitor = Math.round(data.mainFunnel[5].revenue! / data.mainFunnel[0].count);

  // Channel comparison chart data
  const stages = data.mainFunnel.map((s) => s.stage);
  const channelChartData = stages.map((stage) => {
    const row: Record<string, string | number> = { stage };
    data.funnelByChannel.forEach((ch) => {
      const s = ch.stages.find((st) => st.stage === stage);
      row[ch.channel] = s?.count ?? 0;
    });
    return row;
  });

  // Duration average
  const avgDuration = Math.round(data.journeyDuration.reduce((a, b) => a + b.count, 0) / data.journeyDuration.length);

  return (
    <div className="space-y-6 p-1">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Filter className="h-5 w-5 text-[#D4A843]" />
            <h1 className="text-xl font-bold text-foreground">Customer Journey</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-[34px]">Visualize and optimize your marketing funnel</p>
        </div>
        <Badge className="badge-gold text-xs">
          <span className="badge-dot-gold mr-1.5" />
          Live Data
        </Badge>
      </div>

      {/* ── Sub Tabs ── */}
      <Tabs defaultValue="funnel" className="space-y-6">
        <TabsList className="bg-[#111] border border-border/50 h-10">
          <TabsTrigger value="funnel" className="data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843] text-muted-foreground text-sm">
            Funnel View
          </TabsTrigger>
          <TabsTrigger value="channels" className="data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843] text-muted-foreground text-sm">
            Channel Analysis
          </TabsTrigger>
          <TabsTrigger value="journey" className="data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843] text-muted-foreground text-sm">
            Journey Insights
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════════════ */}
        {/* TAB 1: FUNNEL VIEW                    */}
        {/* ══════════════════════════════════════ */}
        <TabsContent value="funnel" className="space-y-6">
          {/* ── Funnel + Metrics Grid ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
            {/* Visual Funnel — HERO */}
            <Card className="premium-card border-border/50 relative overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="section-heading text-base">Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative ambient-particles min-h-[100px]">
                  <div className="stagger-children space-y-1.5 py-2">
                    {data.mainFunnel.map((stage, idx) => {
                      const widthPct = Math.max((stage.count / maxCount) * 100, 8);
                      const isHovered = hoveredStage === idx;
                      const StageIcon = STAGE_ICONS[stage.stage] || Zap;

                      return (
                        <motion.div
                          key={stage.stage}
                          initial={{ opacity: 0, scaleX: 0.3 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
                          onMouseEnter={() => setHoveredStage(idx)}
                          onMouseLeave={() => setHoveredStage(null)}
                          className="group cursor-pointer"
                        >
                          {/* Stage row */}
                          <div className="flex items-center gap-3">
                            {/* Stage name */}
                            <div className="w-28 lg:w-32 text-right shrink-0">
                              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors flex items-center justify-end gap-1.5">
                                <StageIcon className="h-3 w-3 text-[#D4A843]/60 group-hover:text-[#D4A843] transition-colors" />
                                {stage.stage}
                              </span>
                            </div>

                            {/* Funnel bar */}
                            <div className="flex-1 relative">
                              <motion.div
                                className="h-10 rounded-lg border transition-all duration-300 flex items-center justify-between px-4 relative overflow-hidden"
                                style={{
                                  width: `${widthPct}%`,
                                  margin: '0 auto',
                                  background: isHovered
                                    ? 'linear-gradient(90deg, rgba(212,168,67,0.35), rgba(212,168,67,0.18))'
                                    : 'linear-gradient(90deg, rgba(212,168,67,0.2), rgba(212,168,67,0.08))',
                                  borderColor: isHovered ? 'rgba(212,168,67,0.5)' : 'rgba(212,168,67,0.15)',
                                  boxShadow: isHovered ? '0 0 20px rgba(212,168,67,0.15)' : 'none',
                                }}
                                whileHover={{ scale: 1.02 }}
                              >
                                {/* Gold shimmer overlay */}
                                <div className="absolute inset-0 gold-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />

                                <span className="text-sm font-semibold text-foreground relative z-10">
                                  {stage.count >= 1000 ? formatCount(stage.count) : stage.count}
                                </span>

                                {stage.conversionRate !== null && (
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-[#D4A843]/40 text-[#D4A843] bg-[#D4A843]/10 relative z-10">
                                    {stage.conversionRate}%
                                  </Badge>
                                )}

                                {/* Revenue on purchase/loyalty */}
                                {stage.revenue !== null && (
                                  <span className="text-[10px] text-emerald-400 font-medium ml-2 relative z-10">
                                    {formatCurrency(stage.revenue)}
                                  </span>
                                )}
                              </motion.div>
                            </div>

                            {/* Count on right */}
                            <div className="w-20 lg:w-24 shrink-0">
                              {stage.avgTimeSpent > 0 && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-2.5 w-2.5" />
                                  {stage.avgTimeSpent}m
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Dropoff connector */}
                          {idx < data.mainFunnel.length - 1 && (
                            <div className="flex items-center justify-center my-0.5">
                              <div className="flex flex-col items-center">
                                <ChevronDown className="h-3 w-3 text-[#D4A843]/40" />
                                <span className="text-[10px] text-red-400/80 font-medium">
                                  -{data.mainFunnel[idx + 1].dropoffRate}% drop
                                </span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Funnel Metrics Sidebar */}
            <div className="space-y-4">
              <Card className="premium-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#D4A843]/10 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-[#D4A843]" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Entry</p>
                      <p className="text-lg font-bold text-foreground count-up-smooth">{formatCount(maxCount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#D4A843]/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-5 w-5 text-[#D4A843]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Overall Conversion Rate</p>
                      <p className="text-lg font-bold text-foreground">{overallCR}%</p>
                      <Progress value={parseFloat(overallCR)} className="h-1.5 mt-1.5 [&>div]:bg-[#D4A843]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#D4A843]/10 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-[#D4A843]" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg. Journey Time</p>
                      <p className="text-lg font-bold text-foreground">4.2 <span className="text-sm font-normal text-muted-foreground">days</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#D4A843]/10 flex items-center justify-center shrink-0">
                      <IndianRupee className="h-5 w-5 text-[#D4A843]" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue per Visitor</p>
                      <p className="text-lg font-bold text-foreground">₹{revenuePerVisitor}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="premium-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Zap className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Best Converting Stage</p>
                      <Badge className="badge-green text-xs mt-1">Intent → Eval</Badge>
                      <p className="text-[10px] text-emerald-400 mt-1">50.9% conversion</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Bottleneck Analysis ── */}
          <div>
            <h3 className="section-heading text-sm mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#D4A843]" />
              Bottleneck Analysis
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {data.bottlenecks.map((bn, idx) => {
                const isCritical = bn.dropoffPercent > 50;
                const isWarning = bn.dropoffPercent >= 30 && bn.dropoffPercent <= 50;
                const severityColor = isCritical ? 'red' : isWarning ? 'yellow' : 'green';

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                  >
                    <Card className={`premium-card border-border/50 h-full ${isCritical ? 'corner-accent' : ''} hover-scale-sm`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className={`status-dot-${severityColor}`} />
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            {severityColor === 'red' ? 'Critical' : severityColor === 'yellow' ? 'Warning' : 'Minor'}
                          </span>
                        </div>

                        <div className="text-sm font-semibold text-foreground mb-1">
                          {bn.fromStage}
                          <ArrowDownRight className="inline h-3 w-3 mx-1 text-muted-foreground" />
                          {bn.toStage}
                        </div>

                        <div className="flex items-baseline gap-1 mb-2">
                          <span className={`text-2xl font-bold ${isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-emerald-400'}`}>
                            -{bn.dropoffPercent}%
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ({formatCount(bn.dropoffCount)} lost)
                          </span>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                          {bn.recommendation}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════ */}
        {/* TAB 2: CHANNEL ANALYSIS               */}
        {/* ══════════════════════════════════════ */}
        <TabsContent value="channels" className="space-y-6">
          <Card className="premium-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="section-heading text-base">Funnel by Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-container h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelChartData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      type="number"
                      tick={{ fill: '#737373', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      tickFormatter={(v: number) => formatCount(v)}
                    />
                    <YAxis
                      dataKey="stage"
                      type="category"
                      tick={{ fill: '#a3a3a3', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      width={100}
                    />
                    <RechartsTooltip content={<ChannelTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: '#a3a3a3' }}
                      formatter={(value: string) => <span style={{ color: '#a3a3a3' }}>{value}</span>}
                    />
                    {data.funnelByChannel.map((ch, i) => (
                      <Bar
                        key={ch.channel}
                        dataKey={ch.channel}
                        stackId="a"
                        fill={CHANNEL_COLORS[i]}
                        radius={i === data.funnelByChannel.length - 1 ? [0, 4, 4, 0] : undefined}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Channel Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {data.funnelByChannel.map((ch, idx) => {
              const entry = ch.stages[0].count;
              const purchase = ch.stages[5].count;
              const cr = ((purchase / entry) * 100).toFixed(1);
              return (
                <Card key={ch.channel} className="premium-card border-border/50 hover-scale-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ background: CHANNEL_COLORS[idx] }}
                      />
                      <span className="text-xs font-medium text-muted-foreground truncate">{ch.channel}</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{cr}%</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatCount(entry)} → {formatCount(purchase)}
                    </p>
                    <Progress
                      value={parseFloat(cr) * 10}
                      className="h-1 mt-2 [&>div]:bg-[#D4A843]"
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════ */}
        {/* TAB 3: JOURNEY INSIGHTS                */}
        {/* ══════════════════════════════════════ */}
        <TabsContent value="journey" className="space-y-6">
          {/* Journey Duration Distribution */}
          <Card className="premium-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="section-heading text-base">Journey Duration Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-container h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.journeyDuration} margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="range"
                      tick={{ fill: '#737373', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis
                      tick={{ fill: '#737373', fontSize: 11 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      tickFormatter={(v: number) => formatCount(v)}
                    />
                    <RechartsTooltip content={<DurationTooltip />} />
                    <ReferenceLine
                      y={avgDuration}
                      stroke="#D4A843"
                      strokeDasharray="5 5"
                      label={{ value: `Avg: ${formatCount(avgDuration)}`, fill: '#D4A843', fontSize: 11, position: 'right' }}
                    />
                    <defs>
                      <linearGradient id="durationGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4A843" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#B8860B" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="count" fill="url(#durationGrad)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Device Breakdown */}
          <div>
            <h3 className="section-heading text-sm mb-4 flex items-center gap-2">
              <Monitor className="h-4 w-4 text-[#D4A843]" />
              Device Breakdown
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              {/* Device Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {data.deviceBreakdown.map((d) => {
                  const DeviceIcon = d.device === 'Desktop' ? Monitor : d.device === 'Mobile' ? Smartphone : Tablet;
                  const isBest = d.conversionRate === Math.max(...data.deviceBreakdown.map((x) => x.conversionRate));

                  return (
                    <Card
                      key={d.device}
                      className={`premium-card border-border/50 hover-scale-sm ${isBest ? 'gradient-border' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div
                            className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${DEVICE_COLORS[d.device]}15` }}
                          >
                            <DeviceIcon className="h-4 w-4" style={{ color: DEVICE_COLORS[d.device] }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{d.device}</p>
                            {isBest && (
                              <Badge className="badge-green text-[9px] px-1.5 py-0 mt-0.5">Best CR</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold text-foreground">{d.percentage}%</p>
                            <p className="text-[10px] text-muted-foreground">{formatCount(d.count)} visitors</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-[#D4A843]">{d.conversionRate}%</p>
                            <p className="text-[10px] text-muted-foreground">conv. rate</p>
                          </div>
                        </div>
                        <Progress
                          value={d.percentage}
                          className="h-1 mt-3"
                          style={{ ['--progress-color' as string]: DEVICE_COLORS[d.device] }}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Donut Chart */}
              <Card className="premium-card border-border/50">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <p className="text-xs text-muted-foreground mb-3">Traffic by Device</p>
                  <div className="chart-container w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.deviceBreakdown.map((d) => ({
                            name: d.device,
                            value: d.percentage,
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {data.deviceBreakdown.map((d, i) => (
                            <Cell key={i} fill={DEVICE_COLORS[d.device]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          formatter={(value: number) => [`${value}%`, '']}
                          contentStyle={{
                            background: '#111',
                            border: '1px solid rgba(212,168,67,0.3)',
                            borderRadius: '8px',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Custom center label */}
                  <div className="mt-[-130px] mb-[90px] text-center">
                    <p className="text-2xl font-bold text-foreground">50K</p>
                    <p className="text-[10px] text-muted-foreground">Total Visitors</p>
                  </div>
                  <Separator className="my-3 gold-divider" />
                  <div className="flex items-center justify-center gap-4 w-full">
                    {data.deviceBreakdown.map((d) => (
                      <div key={d.device} className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: DEVICE_COLORS[d.device] }}
                        />
                        <span className="text-[10px] text-muted-foreground">{d.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}