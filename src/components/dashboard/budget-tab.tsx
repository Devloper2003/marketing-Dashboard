'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  Plus,
  PieChart as PieChartIcon,
  IndianRupee,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
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
  PieChart,
  Pie,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────

interface BudgetItem {
  id: string;
  category: string;
  channel: string | null;
  allocated: number;
  spent: number;
  period: string | null;
  status: string;
}

interface CategoryBreakdown {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilization: number;
}

interface MonthlyTrend {
  month: string;
  allocated: number;
  spent: number;
}

interface BudgetAlert {
  id: string;
  category: string;
  channel: string | null;
  allocated: number;
  spent: number;
  utilization: number;
  status: string;
  recommendation: string;
}

interface BudgetData {
  items: BudgetItem[];
  summary: {
    totalAllocated: number;
    totalSpent: number;
    remaining: number;
    utilization: number;
  };
  byCategory: CategoryBreakdown[];
  monthlyTrend: MonthlyTrend[];
  alerts: BudgetAlert[];
}

// ── Helpers ────────────────────────────────────────────────────────

const GOLD_COLORS = ['#D4A843', '#E8C46A', '#B8922F', '#F0D78C', '#9A7B24', '#C4A34A', '#D9B85A', '#A68530'];

function formatINR(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatINRFull(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

const statusBadge: Record<string, string> = {
  on_track: 'badge-green',
  at_risk: 'badge-yellow',
  over_budget: 'badge-red',
};

const statusLabel: Record<string, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  over_budget: 'Over Budget',
};

const categories = [
  'Paid Ads',
  'Content Marketing',
  'Social Media',
  'Email Marketing',
  'SEO',
  'Influencer Marketing',
  'Events',
  'Video Production',
];

const channels = ['Google Ads', 'Instagram', 'Facebook', 'YouTube', 'Email', 'WhatsApp'];
const periods = ['June 2026', 'Q2 2026', 'Q3 2026', 'July 2026'];
const statuses = ['on_track', 'at_risk', 'over_budget'];

// ── Custom Tooltip ─────────────────────────────────────────────────

function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#D4A843]/20 bg-[#141414] px-3 py-2 shadow-xl shadow-black/50">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {formatINRFull(p.value)}
        </p>
      ))}
    </div>
  );
}

// ── Circular Progress ──────────────────────────────────────────────

function CircularProgress({ value, size = 80 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 90 ? '#ef4444' : value >= 75 ? '#eab308' : '#D4A843';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(212,168,67,0.12)" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>
        {value.toFixed(0)}%
      </span>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────

export default function BudgetTab() {
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formCategory, setFormCategory] = useState('');
  const [formChannel, setFormChannel] = useState('');
  const [formAllocated, setFormAllocated] = useState('');
  const [formSpent, setFormSpent] = useState('0');
  const [formPeriod, setFormPeriod] = useState('');
  const [formStatus, setFormStatus] = useState('on_track');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/budget');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Failed to load budget data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!formCategory || !formAllocated) {
      toast.error('Category and allocated amount are required');
      return;
    }
    try {
      const res = await fetch('/api/marketing/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formCategory,
          channel: formChannel || null,
          allocated: formAllocated,
          spent: formSpent || 0,
          period: formPeriod || null,
          status: formStatus,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Budget item created successfully');
      setDialogOpen(false);
      setFormCategory('');
      setFormChannel('');
      setFormAllocated('');
      setFormSpent('0');
      setFormPeriod('');
      setFormStatus('on_track');
      fetchData();
    } catch {
      toast.error('Failed to create budget item');
    }
  };

  // ── Donut data ──
  const donutData = data?.byCategory.map((c, i) => ({
    name: c.category,
    value: c.spent,
    color: GOLD_COLORS[i % GOLD_COLORS.length],
  })) || [];

  // ── Bar chart data ──
  const barData = data?.byCategory.map((c) => ({
    category: c.category.length > 12 ? c.category.slice(0, 12) + '…' : c.category,
    fullCategory: c.category,
    Allocated: c.allocated,
    Spent: c.spent,
    utilization: c.utilization,
  })) || [];

  // ── Trend data ──
  const trendData = data?.monthlyTrend.map((t) => ({
    ...t,
    month: t.month.replace(' 2026', ''),
  })) || [];

  // ── Render ──

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, items, byCategory, alerts } = data;

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Budget Planner</h1>
          <p className="text-sm text-muted-foreground">Track and optimize marketing spend across channels</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-primary-foreground hover:opacity-90 gap-2">
              <Plus className="h-4 w-4" />
              Add Budget Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#141414] border-[#D4A843]/20 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add Budget Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Category *</label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="bg-[#0d0d0d] border-border focus-gold">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-border">
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Channel</label>
                <Select value={formChannel} onValueChange={setFormChannel}>
                  <SelectTrigger className="bg-[#0d0d0d] border-border focus-gold">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] border-border">
                    {channels.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Allocated (₹) *</label>
                  <Input
                    type="number"
                    value={formAllocated}
                    onChange={(e) => setFormAllocated(e.target.value)}
                    placeholder="e.g. 50000"
                    className="bg-[#0d0d0d] border-border focus-gold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Spent (₹)</label>
                  <Input
                    type="number"
                    value={formSpent}
                    onChange={(e) => setFormSpent(e.target.value)}
                    placeholder="0"
                    className="bg-[#0d0d0d] border-border focus-gold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Period</label>
                  <Select value={formPeriod} onValueChange={setFormPeriod}>
                    <SelectTrigger className="bg-[#0d0d0d] border-border focus-gold">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141414] border-border">
                      {periods.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <SelectTrigger className="bg-[#0d0d0d] border-border focus-gold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141414] border-border">
                      {statuses.map((s) => (
                        <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full gold-gradient text-primary-foreground hover:opacity-90 mt-2">
                Create Budget Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── A. Budget Summary Cards ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        {/* Total Allocated */}
        <Card className="gold-card-hover rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Allocated</p>
                <p className="text-2xl font-bold gold-gradient-text">{formatINR(summary.totalAllocated)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">across {items.length} items</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D4A843]/10">
                <Wallet className="h-5 w-5 text-[#D4A843]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Spent */}
        <Card className="gold-card-hover rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-foreground">{formatINR(summary.totalSpent)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  <ArrowUpRight className="inline h-3 w-3 text-[#D4A843]" />
                  {' '}{summary.utilization}% utilized
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D4A843]/10">
                <DollarSign className="h-5 w-5 text-[#D4A843]" />
              </div>
            </div>
            <Progress value={Math.min(summary.utilization, 100)} className="h-1.5 progress-gold" />
          </CardContent>
        </Card>

        {/* Remaining Budget */}
        <Card className="gold-card-hover rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Remaining Budget</p>
                <p className={`text-2xl font-bold ${summary.remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatINR(Math.abs(summary.remaining))}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {summary.remaining >= 0 ? (
                    <>
                      <ArrowDownRight className="inline h-3 w-3 text-green-400" />
                      {' '}Available
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="inline h-3 w-3 text-red-400" />
                      {' '}Over budget
                    </>
                  )}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
                <IndianRupee className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Utilization */}
        <Card className="gold-card-hover rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Budget Utilization</p>
                <div className="mt-1">
                  <CircularProgress value={summary.utilization} size={64} />
                </div>
              </div>
              <div className="text-right">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4A843]/10 ml-auto">
                  <TrendingUp className="h-5 w-5 text-[#D4A843]" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {summary.utilization < 75 ? 'Healthy' : summary.utilization < 90 ? 'Watch' : 'Critical'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── B & C. Charts Row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* B. Donut Chart */}
        <Card className="gold-card rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-[#D4A843]" />
              <CardTitle className="text-sm font-semibold text-foreground">Budget Allocation by Category</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">Spend distribution across marketing categories</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-2 w-full px-2">
                {donutData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-[11px] text-muted-foreground truncate">{d.name}</span>
                    <span className="text-[11px] font-semibold text-foreground ml-auto">{formatINR(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* C. Bar Chart: Allocated vs Spent */}
        <Card className="gold-card rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4 text-[#D4A843]" />
              <CardTitle className="text-sm font-semibold text-foreground">Allocated vs Spent</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">Budget comparison by category — red marker at &gt;90% utilization</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} barGap={4} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,168,67,0.08)" />
                <XAxis dataKey="category" tick={{ fill: '#9a9080', fontSize: 10 }} axisLine={{ stroke: 'rgba(212,168,67,0.15)' }} />
                <YAxis tick={{ fill: '#9a9080', fontSize: 10 }} axisLine={false} tickFormatter={(v: number) => formatINR(v)} width={55} />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div className="rounded-lg border border-[#D4A843]/20 bg-[#141414] px-3 py-2 shadow-xl shadow-black/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">{d?.fullCategory}</p>
                        {payload.map((p, i) => (
                          <p key={i} className="text-xs font-semibold" style={{ color: (p as { color: string }).color }}>
                            {String(p.name ?? '')}: {formatINRFull(Number(p.value ?? 0))}
                          </p>
                        ))}
                        {d?.utilization >= 90 && (
                          <p className="text-[10px] text-red-400 mt-1">⚠ {d.utilization}% utilized</p>
                        )}
                      </div>
                    );
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', color: '#9a9080' }}
                />
                <Bar dataKey="Allocated" fill="none" stroke="#D4A843" strokeWidth={2} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.utilization >= 90 ? '#ef4444' : 'rgba(212,168,67,0.7)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── D. Budget Items Table ───────────────────────────────── */}
      <Card className="gold-card rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">Budget Items</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Detailed breakdown of all budget allocations</CardDescription>
            </div>
            <Badge variant="outline" className="badge-gold text-[11px]">
              {items.length} items
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="gold-table-header border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold text-muted-foreground">Category</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground">Channel</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground text-right">Allocated</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground text-right">Spent</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground text-right">Remaining</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground">Utilization</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const remaining = item.allocated - item.spent;
                  const util = item.allocated > 0 ? Math.round((item.spent / item.allocated) * 100) : 0;
                  const isOver = util >= 90;
                  return (
                    <TableRow key={item.id} className="table-row-hover border-border/30">
                      <TableCell className="text-xs font-medium text-foreground py-3">{item.category}</TableCell>
                      <TableCell className="text-xs text-muted-foreground py-3">
                        {item.channel || <span className="text-muted-foreground/50">—</span>}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground text-right py-3">
                        {formatINRFull(item.allocated)}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-foreground text-right py-3">
                        {formatINRFull(item.spent)}
                      </TableCell>
                      <TableCell className={`text-xs font-medium text-right py-3 ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatINRFull(Math.abs(remaining))}
                        {remaining < 0 && ' ⚠'}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : 'gold-progress'}`}
                              style={{ width: `${Math.min(util, 100)}%` }}
                            />
                          </div>
                          <span className={`text-[11px] font-semibold ${isOver ? 'text-red-400' : 'text-[#D4A843]'}`}>
                            {util}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge[item.status] || 'badge-gold'}`}>
                          {statusLabel[item.status] || item.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── E. Monthly Budget Trend ─────────────────────────────── */}
      <Card className="gold-card rounded-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#D4A843]" />
            <CardTitle className="text-sm font-semibold text-foreground">Monthly Budget Trend</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">Allocated vs actual spend over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="gradAllocated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(212,168,67,0.15)" />
                  <stop offset="95%" stopColor="rgba(212,168,67,0)" />
                </linearGradient>
                <linearGradient id="gradSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A843" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#D4A843" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,168,67,0.08)" />
              <XAxis dataKey="month" tick={{ fill: '#9a9080', fontSize: 11 }} axisLine={{ stroke: 'rgba(212,168,67,0.15)' }} />
              <YAxis tick={{ fill: '#9a9080', fontSize: 11 }} axisLine={false} tickFormatter={(v: number) => formatINR(v)} width={55} />
              <RechartsTooltip content={<ChartTooltipContent />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#9a9080' }} />
              <Area type="monotone" dataKey="allocated" stroke="rgba(212,168,67,0.4)" strokeWidth={2} fill="url(#gradAllocated)" />
              <Area type="monotone" dataKey="spent" stroke="#D4A843" strokeWidth={2.5} fill="url(#gradSpent)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── F. Budget Alerts ────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <h3 className="text-sm font-semibold text-foreground">Budget Alerts</h3>
            <Badge variant="outline" className="badge-red text-[10px] ml-1">{alerts.length}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 stagger-children">
            {alerts.map((alert) => {
              const isOver = alert.status === 'over_budget';
              return (
                <Card
                  key={alert.id}
                  className={`rounded-xl border-l-4 ${
                    isOver
                      ? 'border-l-red-500 bg-red-500/5 border border-red-500/20'
                      : 'border-l-yellow-500 bg-yellow-500/5 border border-yellow-500/20'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isOver ? 'bg-red-500/15' : 'bg-yellow-500/15'}`}>
                          <AlertTriangle className={`h-4 w-4 ${isOver ? 'text-red-400' : 'text-yellow-400'}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs font-semibold text-foreground">{alert.category}</p>
                            {alert.channel && (
                              <span className="badge-gold text-[10px] rounded-full px-1.5 py-0.5">{alert.channel}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[11px] text-muted-foreground">
                              Spent: <span className="font-medium text-foreground">{formatINRFull(alert.spent)}</span> / {formatINRFull(alert.allocated)}
                            </span>
                            <span className={`text-[11px] font-bold ${isOver ? 'text-red-400' : 'text-yellow-400'}`}>
                              {alert.utilization}%
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                            {alert.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}