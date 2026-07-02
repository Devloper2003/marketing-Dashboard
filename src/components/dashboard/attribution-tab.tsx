'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  GitBranch,
  MousePointerClick,
  Timer,
  ArrowRightLeft,
  Zap,
  ArrowDown,
  TrendingUp,
  ArrowRight,
  IndianRupee,
  BarChart3,
  Activity,
  Grid3X3,
  MousePointer,
  Globe,
  ShoppingCart,
  CreditCard,
  Repeat2,
  Eye,
  FileText,
} from 'lucide-react';

/* ──────────── Types ──────────── */

interface ChannelAttribution {
  channel: string;
  firstTouchConversions: number;
  lastTouchConversions: number;
  linearConversions: number;
  timeDecayConversions: number;
  revenue: number;
  cost: number;
  assistedConversions: number;
}

interface ModelComparison {
  model: string;
  totalConversions: number;
  totalRevenue: number;
  avgCac: number;
  topChannel: string;
}

interface TouchPoint {
  stage: string;
  count: number;
  dropoff: number;
}

interface MonthlyAttribution {
  month: string;
  firstTouch: number;
  lastTouch: number;
  linear: number;
  timeDecay: number;
}

interface RoiCell {
  channel: string;
  model: string;
  roi: number;
}

interface AttributionData {
  channelData: ChannelAttribution[];
  modelComparison: ModelComparison[];
  touchPointDistribution: TouchPoint[];
  monthlyTrend: MonthlyAttribution[];
  roiMatrix: RoiCell[];
}

/* ──────────── Helpers ──────────── */

function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatINRFull(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatCount(n: number): string {
  if (n >= 100000) return `${(n / 1000).toFixed(0)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

const modelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'First Touch': MousePointerClick,
  'Last Touch': Zap,
  'Linear': ArrowRightLeft,
  'Time Decay': Timer,
};

const modelColors: Record<string, string> = {
  'First Touch': '#D4A843',
  'Last Touch': '#B8922E',
  'Linear': '#E8C96A',
  'Time Decay': '#8B7230',
};

const modelColorsLight: Record<string, string> = {
  'First Touch': '#D4A84380',
  'Last Touch': '#B8922E80',
  'Linear': '#E8C96A80',
  'Time Decay': '#8B723080',
};

const stageIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Ad Impression': Eye,
  'Ad Click': MousePointer,
  'Landing Page': Globe,
  'Product Page': FileText,
  'Add to Cart': ShoppingCart,
  'Checkout': CreditCard,
  'Purchase': IndianRupee,
  'Repeat': Repeat2,
};

/* ──────────── Component ──────────── */

export default function AttributionTab() {
  const [data, setData] = useState<AttributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModel, setActiveModel] = useState('Last Touch');
  const [subTab, setSubTab] = useState('model-comparison');

  useEffect(() => {
    fetch('/api/marketing/attribution')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /* Max conversions across channels for bar widths */
  const maxConv =
    data
      ? Math.max(
          ...data.channelData.flatMap((c) => [
            c.firstTouchConversions,
            c.lastTouchConversions,
            c.linearConversions,
            c.timeDecayConversions,
          ])
        )
      : 1;

  /* Chart data: channels × 4 models */
  const chartData =
    data?.channelData.map((c) => ({
      channel: c.channel,
      'First Touch': c.firstTouchConversions,
      'Last Touch': c.lastTouchConversions,
      Linear: c.linearConversions,
      'Time Decay': c.timeDecayConversions,
    })) ?? [];

  /* ROI matrix pivot */
  const channels = data?.channelData.map((c) => c.channel) ?? [];
  const models = ['First Touch', 'Last Touch', 'Linear', 'Time Decay'] as const;

  function getRoi(channel: string, model: string): number {
    if (!data) return 0;
    const cell = data.roiMatrix.find(
      (r) => r.channel === channel && r.model === model
    );
    return cell?.roi ?? 0;
  }

  function roiColor(roi: number): string {
    if (roi === 0) return 'bg-zinc-800/50 text-zinc-500';
    if (roi >= 3) return 'bg-emerald-900/40 text-emerald-400 border-emerald-700/40';
    if (roi >= 1.5) return 'bg-amber-900/40 text-amber-400 border-amber-700/40';
    return 'bg-red-900/40 text-red-400 border-red-700/40';
  }

  /* Conversion rate between funnel stages */
  function convRate(prevCount: number, currCount: number): string {
    if (prevCount === 0) return '0%';
    return ((currCount / prevCount) * 100).toFixed(1) + '%';
  }

  if (loading || !data) {
    return (
      <div className="space-y-6 p-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up stagger-children">
      {/* ─── A. Header ─── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4A843]/10 border border-[#D4A843]/20">
            <GitBranch className="h-5 w-5 text-[#D4A843]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Marketing Attribution
            </h2>
            <p className="text-sm text-muted-foreground">
              Understand which channels drive your conversions
            </p>
          </div>
        </div>
      </div>

      {/* ─── B. Model Comparison Cards ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.modelComparison.map((m) => {
          const Icon = modelIcons[m.model] ?? BarChart3;
          const isActive = activeModel === m.model;
          return (
            <Card
              key={m.model}
              onClick={() => setActiveModel(m.model)}
              className={`premium-card cursor-pointer transition-all duration-300 hover-scale-sm ${
                isActive
                  ? 'border-[#D4A843]/60 shadow-[0_0_20px_rgba(212,168,67,0.15)]'
                  : 'border-border/50'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 ${isActive ? 'text-[#D4A843]' : 'text-muted-foreground'}`}
                    />
                    <span
                      className={`text-sm font-medium ${isActive ? 'text-[#D4A843]' : 'text-muted-foreground'}`}
                    >
                      {m.model}
                    </span>
                  </div>
                  {isActive && (
                    <Badge className="badge-gold text-[10px] px-2 py-0">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">
                  {m.totalConversions.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-muted-foreground mb-2">conversions</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatINR(m.totalRevenue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Avg CAC</p>
                    <p className="text-sm font-semibold text-foreground">
                      {formatINR(m.avgCac)}
                    </p>
                  </div>
                </div>
                <Separator className="my-2 gold-divider" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    Top Channel:
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-[#D4A843]/30 text-[#D4A843]">
                    {m.topChannel}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ─── C. Channel Attribution Table ─── */}
      <Card className="premium-card">
        <CardHeader className="pb-3">
          <CardTitle className="section-heading text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#D4A843]" />
            Channel Attribution Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ScrollArea className="max-h-[350px]">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-[11px] text-muted-foreground font-medium">
                    Channel
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground font-medium text-center">
                    First Touch
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground font-medium text-center">
                    Last Touch
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground font-medium text-center">
                    Linear
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground font-medium text-center">
                    Time Decay
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground font-medium text-center">
                    Assisted
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground font-medium text-right">
                    Cost
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground font-medium text-right">
                    Revenue
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.channelData.map((ch) => (
                  <TableRow key={ch.channel} className="table-row-hover border-border/20">
                    <TableCell className="font-medium text-sm text-foreground py-2.5">
                      {ch.channel}
                    </TableCell>
                    {[
                      ch.firstTouchConversions,
                      ch.lastTouchConversions,
                      ch.linearConversions,
                      ch.timeDecayConversions,
                    ].map((val, i) => (
                      <TableCell key={i} className="py-2.5">
                        <div className="flex items-center gap-2 justify-center">
                          <span className="text-xs text-foreground w-8 text-right tabular-nums">
                            {val}
                          </span>
                          <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full rounded-full gold-gradient transition-all duration-500"
                              style={{ width: `${(val / maxConv) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    ))}
                    <TableCell className="text-center text-xs text-muted-foreground py-2.5">
                      {ch.assistedConversions}
                    </TableCell>
                    <TableCell className="text-right text-xs text-foreground py-2.5 tabular-nums">
                      {ch.cost > 0 ? formatINR(ch.cost) : '—'}
                    </TableCell>
                    <TableCell className="text-right text-xs font-medium text-foreground py-2.5 tabular-nums">
                      {formatINR(ch.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ─── D. Attribution Model Comparison Chart ─── */}
      <Card className="premium-card">
        <CardHeader className="pb-3">
          <CardTitle className="section-heading text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#D4A843]" />
            Model Comparison by Channel
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="chart-container h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={2} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis
                  dataKey="channel"
                  tick={{ fill: '#9a9080', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#9a9080', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid rgba(212,168,67,0.3)',
                    borderRadius: '8px',
                    color: '#e5e5e5',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    value.toLocaleString('en-IN'),
                    name,
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: '#9a9080' }}
                />
                {models.map((m) => (
                  <Bar
                    key={m}
                    dataKey={m}
                    fill={modelColors[m]}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={22}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ─── Sub-tabs: Journey Funnel / ROI Matrix / Monthly Trend ─── */}
      <Tabs value={subTab} onValueChange={setSubTab} className="space-y-4">
        <TabsList className="bg-zinc-900 border border-border/50">
          <TabsTrigger
            value="model-comparison"
            className="data-[state=active]:bg-[#D4A843]/10 data-[state=active]:text-[#D4A843] text-muted-foreground text-xs"
          >
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
            Monthly Trend
          </TabsTrigger>
          <TabsTrigger
            value="journey-funnel"
            className="data-[state=active]:bg-[#D4A843]/10 data-[state=active]:text-[#D4A843] text-muted-foreground text-xs"
          >
            <GitBranch className="h-3.5 w-3.5 mr-1.5" />
            Journey Funnel
          </TabsTrigger>
          <TabsTrigger
            value="roi-matrix"
            className="data-[state=active]:bg-[#D4A843]/10 data-[state=active]:text-[#D4A843] text-muted-foreground text-xs"
          >
            <Grid3X3 className="h-3.5 w-3.5 mr-1.5" />
            ROI Matrix
          </TabsTrigger>
        </TabsList>

        {/* ─── G. Monthly Attribution Trend ─── */}
        <TabsContent value="model-comparison">
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="section-heading text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#D4A843]" />
                Monthly Attribution Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="chart-container h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#9a9080', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#9a9080', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: '#1a1a1a',
                        border: '1px solid rgba(212,168,67,0.3)',
                        borderRadius: '8px',
                        color: '#e5e5e5',
                        fontSize: '12px',
                      }}
                      formatter={(value: number, name: string) => [
                        value.toLocaleString('en-IN'),
                        name,
                      ]}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', color: '#9a9080' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="firstTouch"
                      name="First Touch"
                      stroke={modelColors['First Touch']}
                      strokeWidth={2}
                      dot={{ r: 3, fill: modelColors['First Touch'] }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="lastTouch"
                      name="Last Touch"
                      stroke={modelColors['Last Touch']}
                      strokeWidth={2}
                      dot={{ r: 3, fill: modelColors['Last Touch'] }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="linear"
                      name="Linear"
                      stroke={modelColors['Linear']}
                      strokeWidth={2}
                      dot={{ r: 3, fill: modelColors['Linear'] }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="timeDecay"
                      name="Time Decay"
                      stroke={modelColors['Time Decay']}
                      strokeWidth={2}
                      dot={{ r: 3, fill: modelColors['Time Decay'] }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── E. Customer Journey Funnel ─── */}
        <TabsContent value="journey-funnel">
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="section-heading text-base flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-[#D4A843]" />
                Customer Journey Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ScrollArea className="w-full">
                <div className="flex flex-col gap-0 min-w-[800px]">
                  {data.touchPointDistribution.map((tp, idx) => {
                    const prevCount =
                      idx > 0 ? data.touchPointDistribution[idx - 1].count : 0;
                    const rate = convRate(prevCount, tp.count);
                    const StageIcon = stageIcons[tp.stage] ?? Activity;
                    const barWidth =
                      idx === 0
                        ? 100
                        : (tp.count / data.touchPointDistribution[0].count) *
                          100;

                    return (
                      <div key={tp.stage}>
                        {/* Stage row */}
                        <div className="flex items-center gap-3 py-2.5">
                          <div className="flex items-center gap-2 w-[140px] shrink-0">
                            <StageIcon className="h-4 w-4 text-[#D4A843] shrink-0" />
                            <span className="text-xs font-medium text-foreground truncate">
                              {tp.stage}
                            </span>
                          </div>
                          <div className="flex-1 flex items-center gap-3">
                            <div className="flex-1 h-7 rounded-md bg-zinc-800/60 overflow-hidden relative">
                              <div
                                className="h-full rounded-md gold-gradient transition-all duration-700 ease-out flex items-center justify-end pr-2"
                                style={{ width: `${Math.max(barWidth, 3)}%` }}
                              >
                                <span className="text-[10px] font-bold text-[#0a0a0a] whitespace-nowrap">
                                  {tp.count.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="w-[60px] shrink-0 text-right">
                            {idx > 0 ? (
                              <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                                {rate}
                              </span>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">
                                —
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Connector + drop-off */}
                        {idx < data.touchPointDistribution.length - 1 && (
                          <div className="flex items-center gap-3 py-0.5">
                            <div className="w-[140px] shrink-0" />
                            <div className="flex-1 flex items-center gap-1">
                              <div className="flex-1 flex items-center justify-center">
                                <div className="w-px h-4 bg-gradient-to-b from-[#D4A843]/40 to-[#D4A843]/10" />
                              </div>
                              {tp.dropoff > 0 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-900/20 border border-red-800/20">
                                  <ArrowDown className="h-3 w-3 text-red-400" />
                                  <span className="text-[10px] font-medium text-red-400 tabular-nums">
                                    {tp.dropoff.toFixed(1)}% drop
                                  </span>
                                </div>
                              )}
                              <div className="flex-1 flex items-center justify-center">
                                <div className="w-px h-4 bg-gradient-to-b from-[#D4A843]/10 to-[#D4A843]/40" />
                              </div>
                            </div>
                            <div className="w-[60px] shrink-0" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Funnel summary */}
              <Separator className="my-4 gold-divider" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Total Impressions
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {data.touchPointDistribution[0].count.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Final Purchases
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {data.touchPointDistribution[6].count.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Overall Conversion
                  </p>
                  <p className="text-sm font-bold text-[#D4A843]">
                    {convRate(
                      data.touchPointDistribution[0].count,
                      data.touchPointDistribution[6].count
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    Repeat Rate
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {convRate(
                      data.touchPointDistribution[6].count,
                      data.touchPointDistribution[7].count
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── F. ROI Matrix Heatmap ─── */}
        <TabsContent value="roi-matrix">
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="section-heading text-base flex items-center gap-2">
                  <Grid3X3 className="h-4 w-4 text-[#D4A843]" />
                  Channel × Model ROI Matrix
                </CardTitle>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-800/60" />
                    <span>ROI &ge;3x</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-amber-800/60" />
                    <span>1.5&ndash;3x</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-red-800/60" />
                    <span>&lt;1.5x</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto">
                <div className="min-w-[560px]">
                  {/* Header row */}
                  <div className="grid grid-cols-[140px_repeat(4,1fr)] gap-2 mb-2">
                    <div className="text-[11px] text-muted-foreground font-medium" />
                    {models.map((m) => (
                      <div
                        key={m}
                        className="text-[11px] text-center text-muted-foreground font-medium py-1"
                      >
                        {m}
                      </div>
                    ))}
                  </div>

                  {/* Data rows */}
                  {channels.map((ch) => (
                    <div
                      key={ch}
                      className="grid grid-cols-[140px_repeat(4,1fr)] gap-2 mb-2"
                    >
                      <div className="text-xs font-medium text-foreground flex items-center py-1">
                        {ch}
                      </div>
                      {models.map((m) => {
                        const roi = getRoi(ch, m);
                        return (
                          <div
                            key={`${ch}-${m}`}
                            className={`flex items-center justify-center rounded-lg border py-2.5 px-2 transition-all duration-200 hover:scale-[1.03] ${roiColor(roi)}`}
                          >
                            <span className="text-sm font-bold tabular-nums">
                              {roi === 0 ? '—' : `${roi.toFixed(2)}x`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}