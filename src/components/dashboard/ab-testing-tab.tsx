'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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
import { toast } from 'sonner';
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
import {
  FlaskConical,
  Plus,
  Trophy,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Zap,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  CircleDot,
  Calendar,
  Layers,
  GitCompareArrows,
  Percent,
  IndianRupee,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Sparkles,
} from 'lucide-react';

/* ──────────── Types ──────────── */
interface Variant {
  name: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  cr: number;
  ctr: number;
}

interface ABTest {
  id: string;
  name: string;
  variantA: Variant;
  variantB: Variant;
  status: 'running' | 'completed' | 'paused';
  winner: 'variant_a' | 'variant_b' | 'inconclusive' | null;
  startDate: string;
  endDate: string | null;
  confidenceLevel: number;
  statisticalSignificance: boolean;
  metricType: 'ctr' | 'conversion' | 'revenue' | 'engagement';
  channel: string;
  uplift: number;
}

interface Summary {
  totalTests: number;
  running: number;
  completed: number;
  avgUplift: number;
  totalRevenueImpact: number;
  significanceRate: number;
}

/* ──────────── Helpers ──────────── */
function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
}

function formatNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return value.toLocaleString('en-IN');
}

const statusConfig: Record<string, { label: string; badgeClass: string; icon: React.ComponentType<{ className?: string }> }> = {
  running: { label: 'Running', badgeClass: 'badge-gold', icon: CircleDot },
  completed: { label: 'Completed', badgeClass: 'badge-green', icon: CheckCircle2 },
  paused: { label: 'Paused', badgeClass: 'badge-yellow', icon: PauseCircle },
};

const channelColors: Record<string, string> = {
  'Google Ads': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Facebook: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  Instagram: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  Email: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Website: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'Landing Page': 'bg-violet-500/15 text-violet-400 border-violet-500/20',
};

const metricLabels: Record<string, string> = {
  ctr: 'CTR',
  conversion: 'Conversion Rate',
  revenue: 'Revenue',
  engagement: 'Engagement',
};

/* ──────────── Custom Tooltip ──────────── */
function GoldTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#D4A843]/20 bg-[#141414] p-3 shadow-xl shadow-black/40">
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">
            {p.name === 'avgUplift' || p.name === 'Uplift' ? `${p.value}%` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ──────────── Main Component ──────────── */
export default function AbTestingTab() {
  const [data, setData] = useState<{ tests: ABTest[]; summary: Summary; upliftTrend: Array<{ month: string; avgUplift: number }>; dailyData: Record<string, Array<{ date: string; variantA: number; variantB: number }>> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  // Create test form
  const [newName, setNewName] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const [newMetric, setNewMetric] = useState('');
  const [newVarAName, setNewVarAName] = useState('');
  const [newVarADesc, setNewVarADesc] = useState('');
  const [newVarBName, setNewVarBName] = useState('');
  const [newVarBDesc, setNewVarBDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/ab-tests');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Failed to load A/B test data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateTest = async () => {
    if (!newName.trim() || !newChannel || !newMetric) {
      toast.error('Please fill in test name, channel, and metric type');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/marketing/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          channel: newChannel,
          metricType: newMetric,
          variantAName: newVarAName || 'Variant A',
          variantADesc: newVarADesc,
          variantBName: newVarBName || 'Variant B',
          variantBDesc: newVarBDesc,
        }),
      });
      if (!res.ok) throw new Error('Failed to create');
      toast.success('A/B test created successfully');
      setCreateOpen(false);
      setNewName('');
      setNewChannel('');
      setNewMetric('');
      setNewVarAName('');
      setNewVarADesc('');
      setNewVarBName('');
      setNewVarBDesc('');
      fetchData();
    } catch {
      toast.error('Failed to create A/B test');
    } finally {
      setCreating(false);
    }
  };

  const openDetail = (test: ABTest) => {
    setSelectedTest(test);
    setDetailOpen(true);
  };

  const filteredTests = (data?.tests || []).filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (channelFilter !== 'all' && t.channel !== channelFilter) return false;
    return true;
  });

  /* ──── Loading Skeleton ──── */
  if (loading) {
    return (
      <div className="space-y-6 p-1 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const { tests, summary, upliftTrend, dailyData } = data;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── A. Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gold-gradient">
            <FlaskConical className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">A/B Testing Lab</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Optimize campaigns with data-driven experiments</p>
          </div>
          <Badge className="badge-gold text-[10px] font-bold ml-1">{summary.totalTests} Tests</Badge>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-primary-foreground hover:opacity-90 transition-opacity gap-2">
              <Plus className="h-4 w-4" />
              New Test
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111] border-[#D4A843]/20 max-w-lg">
            <DialogHeader>
              <DialogTitle className="gold-gradient-text text-lg">Create New A/B Test</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Test Name</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Hero Banner CTA Test"
                  className="bg-[#1a1a1a] border-border/50 focus-gold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Channel</label>
                  <Select value={newChannel} onValueChange={setNewChannel}>
                    <SelectTrigger className="bg-[#1a1a1a] border-border/50 focus-gold">
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-border">
                      <SelectItem value="Google Ads">Google Ads</SelectItem>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Instagram">Instagram</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Landing Page">Landing Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Metric Type</label>
                  <Select value={newMetric} onValueChange={setNewMetric}>
                    <SelectTrigger className="bg-[#1a1a1a] border-border/50 focus-gold">
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-border">
                      <SelectItem value="ctr">CTR</SelectItem>
                      <SelectItem value="conversion">Conversion Rate</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator className="bg-border/30" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#D4A843] flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> Variant A
                  </p>
                  <Input
                    value={newVarAName}
                    onChange={(e) => setNewVarAName(e.target.value)}
                    placeholder="Variant A name"
                    className="bg-[#1a1a1a] border-border/50 focus-gold text-sm"
                  />
                  <Input
                    value={newVarADesc}
                    onChange={(e) => setNewVarADesc(e.target.value)}
                    placeholder="Description (optional)"
                    className="bg-[#1a1a1a] border-border/50 focus-gold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#D4A843] flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" /> Variant B
                  </p>
                  <Input
                    value={newVarBName}
                    onChange={(e) => setNewVarBName(e.target.value)}
                    placeholder="Variant B name"
                    className="bg-[#1a1a1a] border-border/50 focus-gold text-sm"
                  />
                  <Input
                    value={newVarBDesc}
                    onChange={(e) => setNewVarBDesc(e.target.value)}
                    placeholder="Description (optional)"
                    className="bg-[#1a1a1a] border-border/50 focus-gold text-sm"
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateTest}
                disabled={creating}
                className="w-full gold-gradient text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {creating ? 'Creating...' : 'Create A/B Test'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── B. Summary Cards ─────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        <Card className="bg-[#111] border-border/50 gold-card-hover card-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4A843]/10">
                <FlaskConical className="h-4 w-4 text-[#D4A843]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 status-dot-green" />
                <span className="text-[10px] font-semibold text-muted-foreground">{summary.running} running</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{summary.totalTests}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Tests <span className="text-muted-foreground/60">({summary.completed} completed)</span></p>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-border/50 gold-card-hover card-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              {summary.avgUplift > 0 && (
                <div className="flex items-center gap-1 text-green-400">
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="text-[10px] font-semibold">+2.4%</span>
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">{summary.avgUplift}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Average Uplift</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-border/50 gold-card-hover card-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4A843]/10">
                <IndianRupee className="h-4 w-4 text-[#D4A843]" />
              </div>
              {summary.totalRevenueImpact > 0 && (
                <div className="flex items-center gap-1 text-green-400">
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="text-[10px] font-semibold">Positive</span>
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(summary.totalRevenueImpact)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Revenue Impact</p>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-border/50 gold-card-hover card-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4A843]/10">
                <Target className="h-4 w-4 text-[#D4A843]" />
              </div>
              <Badge className={`text-[10px] font-bold ${summary.significanceRate >= 80 ? 'badge-green' : summary.significanceRate >= 60 ? 'badge-gold' : 'badge-red'}`}>
                {summary.significanceRate}%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-foreground">{summary.significanceRate}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Statistical Significance Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* ── C. Active Tests Table ─────────────────────── */}
      <Card className="bg-[#111] border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <GitCompareArrows className="h-4 w-4 text-[#D4A843]" />
              Test Results
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-auto gap-1.5 border-border/50 bg-[#1a1a1a] text-xs text-muted-foreground focus-gold">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="h-8 w-auto gap-1.5 border-border/50 bg-[#1a1a1a] text-xs text-muted-foreground focus-gold">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-border">
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="Google Ads">Google Ads</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Landing Page">Landing Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold text-muted-foreground">Test Name</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Channel</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center">Variants (A / B)</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-right">Uplift</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center">Confidence</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground text-center">Winner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.map((test) => {
                  const sc = statusConfig[test.status];
                  const StatusIcon = sc.icon;
                  const isWinnerA = test.winner === 'variant_a';
                  const isWinnerB = test.winner === 'variant_b';

                  return (
                    <TableRow
                      key={test.id}
                      className="table-row-hover border-border/20 cursor-pointer"
                      onClick={() => openDetail(test)}
                    >
                      <TableCell className="py-3">
                        <div className="max-w-[220px]">
                          <p className="text-sm font-medium text-foreground truncate">{test.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {metricLabels[test.metricType]} • {test.startDate}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge className={`text-[10px] font-medium border ${channelColors[test.channel] || 'bg-muted text-muted-foreground border-border'}`}>
                          {test.channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <div className="flex items-center justify-center gap-3 text-xs">
                          <div className={`px-2 py-1 rounded-md ${isWinnerA ? 'bg-[#D4A843]/10 ring-1 ring-[#D4A843]/30' : 'bg-muted/30'}`}>
                            <p className="font-semibold text-foreground">{test.variantA.name.length > 16 ? test.variantA.name.slice(0, 16) + '...' : test.variantA.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {test.metricType === 'ctr' ? `${test.variantA.ctr}% CTR` :
                               test.metricType === 'revenue' ? formatCurrency(test.variantA.revenue) :
                               `${test.variantA.cr}% CR`}
                            </p>
                          </div>
                          <span className="text-muted-foreground text-[10px]">vs</span>
                          <div className={`px-2 py-1 rounded-md ${isWinnerB ? 'bg-[#D4A843]/10 ring-1 ring-[#D4A843]/30' : 'bg-muted/30'}`}>
                            <p className="font-semibold text-foreground">{test.variantB.name.length > 16 ? test.variantB.name.slice(0, 16) + '...' : test.variantB.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {test.metricType === 'ctr' ? `${test.variantB.ctr}% CTR` :
                               test.metricType === 'revenue' ? formatCurrency(test.variantB.revenue) :
                               `${test.variantB.cr}% CR`}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <div className={`inline-flex items-center gap-1 text-sm font-semibold ${test.uplift > 0 ? 'text-green-400' : test.uplift < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                          {test.uplift > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : test.uplift < 0 ? <ArrowDownRight className="h-3.5 w-3.5" /> : null}
                          {test.uplift > 0 ? '+' : ''}{test.uplift}%
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col items-center gap-1.5 px-2">
                          <Progress
                            value={test.confidenceLevel}
                            className="h-1.5 w-full bg-muted/30 [&>div]:bg-[#D4A843]"
                          />
                          <span className={`text-[10px] font-semibold ${test.confidenceLevel >= 95 ? 'text-green-400' : test.confidenceLevel >= 80 ? 'text-[#D4A843]' : 'text-muted-foreground'}`}>
                            {test.confidenceLevel}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <Badge className={`${sc.badgeClass} text-[10px] font-semibold`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {sc.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        {test.winner === 'inconclusive' ? (
                          <Badge className="bg-muted/30 text-muted-foreground text-[10px]">Inconclusive</Badge>
                        ) : test.winner ? (
                          <div className="inline-flex items-center gap-1 text-[#D4A843]">
                            <Trophy className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">{test.winner === 'variant_a' ? test.variantA.name : test.variantB.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredTests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-sm">
                      No tests found matching the filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ── E. Uplift Trend Chart ────────────────────── */}
      <Card className="bg-[#111] border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#D4A843]" />
            Uplift Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={upliftTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="upliftGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4A843" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#D4A843" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} axisLine={{ stroke: '#333' }} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={{ stroke: '#333' }} tickFormatter={(v) => `${v}%`} />
                <RechartsTooltip content={<GoldTooltip />} />
                <Area
                  type="monotone"
                  dataKey="avgUplift"
                  name="avgUplift"
                  stroke="#D4A843"
                  strokeWidth={2}
                  fill="url(#upliftGradient)"
                  dot={{ fill: '#D4A843', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#D4A843', stroke: '#0a0a0a', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ── D. Test Detail Dialog ────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-[#111] border-[#D4A843]/20 max-w-4xl max-h-[90vh] overflow-hidden">
          {selectedTest && (
            <>
              <DialogHeader>
                <DialogTitle className="gold-gradient-text text-lg flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  {selectedTest.name}
                </DialogTitle>
              </DialogHeader>

              <ScrollArea className="max-h-[calc(90vh-80px)] pr-1">
                <div className="space-y-5 pb-4">
                  {/* Test Overview */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#1a1a1a] rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Channel</p>
                      <Badge className={`mt-1 text-[10px] font-medium border ${channelColors[selectedTest.channel] || ''}`}>
                        {selectedTest.channel}
                      </Badge>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Metric</p>
                      <p className="text-sm font-semibold text-foreground mt-1">{metricLabels[selectedTest.metricType]}</p>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
                      <Badge className={`${statusConfig[selectedTest.status].badgeClass} mt-1 text-[10px] font-semibold`}>
                        {statusConfig[selectedTest.status].label}
                      </Badge>
                    </div>
                    <div className="bg-[#1a1a1a] rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Duration</p>
                      <p className="text-sm font-semibold text-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {selectedTest.startDate} {selectedTest.endDate ? `→ ${selectedTest.endDate}` : '→ Ongoing'}
                      </p>
                    </div>
                  </div>

                  {/* Variant Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Variant A */}
                    <div className={`rounded-xl border p-4 ${selectedTest.winner === 'variant_a' ? 'border-[#D4A843]/40 bg-[#D4A843]/5' : 'border-border/30 bg-[#1a1a1a]'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-foreground">Variant A</p>
                        {selectedTest.winner === 'variant_a' && (
                          <div className="flex items-center gap-1 text-[#D4A843]">
                            <Trophy className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold">Winner</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{selectedTest.variantA.name}</p>
                      <div className="space-y-2.5">
                        {[
                          { label: 'Impressions', value: formatNumber(selectedTest.variantA.impressions), max: Math.max(selectedTest.variantA.impressions, selectedTest.variantB.impressions), pct: 100 },
                          { label: 'Clicks', value: formatNumber(selectedTest.variantA.clicks), max: Math.max(selectedTest.variantA.clicks, selectedTest.variantB.clicks), pct: (selectedTest.variantA.clicks / Math.max(selectedTest.variantA.clicks, selectedTest.variantB.clicks)) * 100 },
                          { label: 'Conversions', value: formatNumber(selectedTest.variantA.conversions), max: Math.max(selectedTest.variantA.conversions, selectedTest.variantB.conversions), pct: (selectedTest.variantA.conversions / Math.max(selectedTest.variantA.conversions, selectedTest.variantB.conversions)) * 100 },
                          { label: 'Revenue', value: formatCurrency(selectedTest.variantA.revenue), max: Math.max(selectedTest.variantA.revenue, selectedTest.variantB.revenue), pct: (selectedTest.variantA.revenue / Math.max(selectedTest.variantA.revenue, selectedTest.variantB.revenue)) * 100 },
                          { label: 'CTR', value: `${selectedTest.variantA.ctr}%`, max: Math.max(selectedTest.variantA.ctr, selectedTest.variantB.ctr), pct: (selectedTest.variantA.ctr / Math.max(selectedTest.variantA.ctr, selectedTest.variantB.ctr)) * 100 },
                          { label: 'Conv. Rate', value: `${selectedTest.variantA.cr}%`, max: Math.max(selectedTest.variantA.cr, selectedTest.variantB.cr), pct: (selectedTest.variantA.cr / Math.max(selectedTest.variantA.cr, selectedTest.variantB.cr)) * 100 },
                        ].map((m) => (
                          <div key={m.label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] text-muted-foreground">{m.label}</span>
                              <span className="text-[11px] font-semibold text-foreground">{m.value}</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                              <div className="h-full bg-[#D4A843]/60 rounded-full transition-all" style={{ width: `${m.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Variant B */}
                    <div className={`rounded-xl border p-4 ${selectedTest.winner === 'variant_b' ? 'border-[#D4A843]/40 bg-[#D4A843]/5' : 'border-border/30 bg-[#1a1a1a]'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-foreground">Variant B</p>
                        {selectedTest.winner === 'variant_b' && (
                          <div className="flex items-center gap-1 text-[#D4A843]">
                            <Trophy className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold">Winner</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{selectedTest.variantB.name}</p>
                      <div className="space-y-2.5">
                        {[
                          { label: 'Impressions', value: formatNumber(selectedTest.variantB.impressions), max: Math.max(selectedTest.variantA.impressions, selectedTest.variantB.impressions), pct: (selectedTest.variantB.impressions / Math.max(selectedTest.variantA.impressions, selectedTest.variantB.impressions)) * 100 },
                          { label: 'Clicks', value: formatNumber(selectedTest.variantB.clicks), max: Math.max(selectedTest.variantA.clicks, selectedTest.variantB.clicks), pct: (selectedTest.variantB.clicks / Math.max(selectedTest.variantA.clicks, selectedTest.variantB.clicks)) * 100 },
                          { label: 'Conversions', value: formatNumber(selectedTest.variantB.conversions), max: Math.max(selectedTest.variantA.conversions, selectedTest.variantB.conversions), pct: (selectedTest.variantB.conversions / Math.max(selectedTest.variantA.conversions, selectedTest.variantB.conversions)) * 100 },
                          { label: 'Revenue', value: formatCurrency(selectedTest.variantB.revenue), max: Math.max(selectedTest.variantA.revenue, selectedTest.variantB.revenue), pct: (selectedTest.variantB.revenue / Math.max(selectedTest.variantA.revenue, selectedTest.variantB.revenue)) * 100 },
                          { label: 'CTR', value: `${selectedTest.variantB.ctr}%`, max: Math.max(selectedTest.variantA.ctr, selectedTest.variantB.ctr), pct: (selectedTest.variantB.ctr / Math.max(selectedTest.variantA.ctr, selectedTest.variantB.ctr)) * 100 },
                          { label: 'Conv. Rate', value: `${selectedTest.variantB.cr}%`, max: Math.max(selectedTest.variantA.cr, selectedTest.variantB.cr), pct: (selectedTest.variantB.cr / Math.max(selectedTest.variantA.cr, selectedTest.variantB.cr)) * 100 },
                        ].map((m) => (
                          <div key={m.label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] text-muted-foreground">{m.label}</span>
                              <span className="text-[11px] font-semibold text-foreground">{m.value}</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                              <div className="h-full bg-[#D4A843] rounded-full transition-all" style={{ width: `${m.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Uplift Summary */}
                  <div className="bg-[#1a1a1a] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Zap className="h-4 w-4 text-[#D4A843]" />
                        Variant B Uplift over A
                      </p>
                      <span className={`text-lg font-bold ${selectedTest.uplift > 0 ? 'text-green-400' : selectedTest.uplift < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                        {selectedTest.uplift > 0 ? '+' : ''}{selectedTest.uplift}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedTest.uplift > 0
                        ? `Variant B outperformed A by ${selectedTest.uplift}% on ${metricLabels[selectedTest.metricType]}`
                        : selectedTest.uplift < 0
                        ? `Variant A outperformed B by ${Math.abs(selectedTest.uplift)}% on ${metricLabels[selectedTest.metricType]}`
                        : 'Both variants performed similarly'}
                    </p>
                  </div>

                  {/* Confidence Interval Visualization */}
                  <div className="bg-[#1a1a1a] rounded-xl p-4">
                    <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Target className="h-4 w-4 text-[#D4A843]" />
                      Statistical Confidence
                    </p>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-muted-foreground">Confidence Level</span>
                          <span className={`text-sm font-bold ${selectedTest.confidenceLevel >= 95 ? 'text-green-400' : selectedTest.confidenceLevel >= 80 ? 'text-[#D4A843]' : 'text-muted-foreground'}`}>
                            {selectedTest.confidenceLevel}%
                          </span>
                        </div>
                        <div className="relative h-3 w-full bg-muted/30 rounded-full overflow-hidden">
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full transition-all ${selectedTest.confidenceLevel >= 95 ? 'bg-green-500' : selectedTest.confidenceLevel >= 80 ? 'bg-[#D4A843]' : 'bg-yellow-500'}`}
                            style={{ width: `${selectedTest.confidenceLevel}%` }}
                          />
                          {/* 95% significance threshold marker */}
                          <div className="absolute inset-y-0 w-[2px] bg-white/30" style={{ left: '95%' }} />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">0%</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <span className="h-1.5 w-[2px] bg-white/30 inline-block" />
                            95% threshold
                          </span>
                          <span className="text-[10px] text-muted-foreground">100%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {selectedTest.statisticalSignificance ? (
                          <Badge className="badge-green text-[10px] font-semibold">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Statistically Significant
                          </Badge>
                        ) : (
                          <Badge className="badge-yellow text-[10px] font-semibold">
                            <XCircle className="h-3 w-3 mr-1" />
                            Not Yet Significant
                          </Badge>
                        )}
                        <Badge className={`text-[10px] font-semibold ${selectedTest.confidenceLevel >= 95 ? 'badge-green' : 'badge-gold'}`}>
                          <Percent className="h-3 w-3 mr-1" />
                          {selectedTest.confidenceLevel}% confidence
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Daily Conversion Rate Chart */}
                  {dailyData[selectedTest.id] && dailyData[selectedTest.id].length > 0 && (
                    <div className="bg-[#1a1a1a] rounded-xl p-4">
                      <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#D4A843]" />
                        Daily {selectedTest.metricType === 'ctr' ? 'CTR' : selectedTest.metricType === 'revenue' ? 'Conversion' : 'Conversion'} Rate Trend
                      </p>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dailyData[selectedTest.id]} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                            <XAxis
                              dataKey="date"
                              tick={{ fontSize: 10, fill: '#666' }}
                              axisLine={{ stroke: '#333' }}
                              tickFormatter={(v) => {
                                const d = v.split('-');
                                return `${d[2]}/${d[1]}`;
                              }}
                            />
                            <YAxis tick={{ fontSize: 10, fill: '#666' }} axisLine={{ stroke: '#333' }} tickFormatter={(v) => `${v}%`} />
                            <RechartsTooltip content={<GoldTooltip />} />
                            <Legend
                              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="variantA"
                              name="Variant A"
                              stroke="#888"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4, fill: '#888' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="variantB"
                              name="Variant B"
                              stroke="#D4A843"
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4, fill: '#D4A843', stroke: '#0a0a0a', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}