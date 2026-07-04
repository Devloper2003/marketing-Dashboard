'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, Calendar, Target, Search, Share2, Wallet, FileBarChart,
  Plus, Eye, Download, Clock, CheckCircle2, Share, FileText,
  ArrowRight, TrendingUp, Sparkles, ArrowUpRight, ArrowDownRight,
  Loader2, X, CalendarDays, BarChart2, PieChart as PieChartIcon,
  LineChart as LineChartIcon, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { toast } from 'sonner';

const GOLD = '#D4A843';
const GOLD_LIGHT = '#E8C46A';
const GOLD_DARK = '#B8922F';
const MUTED_GOLD = 'rgba(212,168,67,0.2)';

// ── Types ────────────────────────────────────────────────
type ReportType = 'weekly' | 'monthly' | 'quarterly' | 'campaign' | 'seo' | 'social' | 'competitor' | 'budget';
type ReportStatus = 'ready' | 'generating' | 'scheduled';

interface ReportMetric {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

interface Report {
  id: string;
  name: string;
  type: ReportType;
  status: ReportStatus;
  generatedAt: string;
  dateRange: string;
  size: number;
  pages: number;
  keyMetrics: Record<string, ReportMetric>;
  summary: string;
}

interface TimelineItem {
  id: string;
  action: string;
  reportName: string;
  time: string;
  icon: string;
}

// ── Helpers ──────────────────────────────────────────────
const typeLabels: Record<ReportType, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  campaign: 'Campaign',
  seo: 'SEO',
  social: 'Social',
  competitor: 'Competitor',
  budget: 'Budget',
};

const typeBadgeClass: Record<ReportType, string> = {
  weekly: 'badge-gold',
  monthly: 'badge-green',
  quarterly: 'badge-yellow',
  campaign: 'badge-red',
  seo: 'badge-gold',
  social: 'badge-green',
  competitor: 'badge-yellow',
  budget: 'badge-red',
};

function StatusBadge({ status }: { status: ReportStatus }) {
  if (status === 'ready') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-green-400">
        <span className="status-dot-green" />
        Ready
      </span>
    );
  }
  if (status === 'generating') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#D4A843]">
        <span className="h-2 w-2 rounded-full bg-[#D4A843] animate-pulse" />
        Generating
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-yellow-400">
      <span className="status-dot-yellow" />
      Scheduled
    </span>
  );
}

// ── Report Template Cards ────────────────────────────────
const reportTemplates = [
  { type: 'weekly' as ReportType, title: 'Weekly Performance Summary', description: 'Track KPIs, traffic trends, and conversion data', icon: BarChart3, accent: 'from-[#D4A843]/20 to-[#D4A843]/5', border: 'border-[#D4A843]/20 hover:border-[#D4A843]/50', iconColor: 'text-[#D4A843]' },
  { type: 'monthly' as ReportType, title: 'Monthly Marketing Review', description: 'Comprehensive monthly spend, ROAS, and channel analysis', icon: Calendar, accent: 'from-green-500/15 to-green-500/5', border: 'border-green-500/20 hover:border-green-500/50', iconColor: 'text-green-400' },
  { type: 'campaign' as ReportType, title: 'Campaign Deep Dive', description: 'Detailed campaign performance across all channels', icon: Target, accent: 'from-red-500/15 to-red-500/5', border: 'border-red-500/20 hover:border-red-500/50', iconColor: 'text-red-400' },
  { type: 'seo' as ReportType, title: 'SEO Performance Report', description: 'Keyword rankings, organic traffic, and backlink analysis', icon: Search, accent: 'from-[#D4A843]/20 to-[#D4A843]/5', border: 'border-[#D4A843]/20 hover:border-[#D4A843]/50', iconColor: 'text-[#D4A843]' },
  { type: 'social' as ReportType, title: 'Social Media Audit', description: 'Platform-wise engagement, growth, and content analysis', icon: Share2, accent: 'from-green-500/15 to-green-500/5', border: 'border-green-500/20 hover:border-green-500/50', iconColor: 'text-green-400' },
  { type: 'budget' as ReportType, title: 'Budget Analysis', description: 'Spend allocation, utilization, and ROI breakdown', icon: Wallet, accent: 'from-red-500/15 to-red-500/5', border: 'border-red-500/20 hover:border-red-500/50', iconColor: 'text-red-400' },
];

// ── Chart Data Generators ────────────────────────────────
function getWeeklyChartData() {
  return [];
}

function getCampaignChartData() {
  return [];
}

function getSeoChartData() {
  return [];
}

function getSocialChartData() {
  return [];
}

function getBudgetChartData() {
  return [];
}

// ── Chart Tooltip ────────────────────────────────────────
function GoldTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#D4A843]/20 bg-[#141414] px-3 py-2 shadow-xl">
      <p className="text-[11px] font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[12px] font-semibold" style={{ color: p.color || GOLD }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}
        </p>
      ))}
    </div>
  );
}

// ── Preview Charts by Type ──────────────────────────────
function ReportCharts({ type }: { type: ReportType }) {
  if (type === 'weekly' || type === 'monthly') {
    const data = getWeeklyChartData();
    return (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <LineChartIcon className="h-4 w-4 text-[#D4A843]" />
            Performance Trend
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip content={<GoldTooltip />} />
                <Line type="monotone" dataKey="visits" name="Visits" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, r: 4 }} />
                <Line type="monotone" dataKey="conversions" name="Conversions" stroke={GOLD_LIGHT} strokeWidth={2} dot={{ fill: GOLD_LIGHT, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-[#D4A843]" />
            Daily Revenue
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<GoldTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill={GOLD} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'campaign') {
    const data = getCampaignChartData();
    return (
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#D4A843]" />
          Channel Performance
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: '#888', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
              <YAxis type="category" dataKey="channel" tick={{ fill: '#aaa', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} width={100} />
              <Tooltip content={<GoldTooltip />} />
              <Bar dataKey="impressions" name="Impressions" fill={GOLD} radius={[0, 4, 4, 0]} />
              <Bar dataKey="clicks" name="Clicks" fill={GOLD_LIGHT} radius={[0, 4, 4, 0]} />
              <Bar dataKey="conversions" name="Conversions" fill={GOLD_DARK} radius={[0, 4, 4, 0]} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#888' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === 'seo') {
    const data = getSeoChartData();
    return (
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-[#D4A843]" />
          Keyword Position Distribution
        </h4>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="position" tick={{ fill: '#888', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Tooltip content={<GoldTooltip />} />
              <Bar dataKey="count" name="Keywords" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={[GOLD, GOLD_LIGHT, GOLD_DARK, 'rgba(212,168,67,0.4)', 'rgba(212,168,67,0.25)'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === 'social') {
    const data = getSocialChartData();
    return (
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-[#D4A843]" />
          Engagement Breakdown
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name" label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#555' }}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11, color: '#aaa' }} />
              <Tooltip content={<GoldTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (type === 'budget') {
    const data = getBudgetChartData();
    return (
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-[#D4A843]" />
          Allocated vs Spent
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: '#888', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="category" tick={{ fill: '#aaa', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} width={85} />
              <Tooltip content={<GoldTooltip />} />
              <Bar dataKey="allocated" name="Allocated" fill="rgba(212,168,67,0.3)" stroke={GOLD} strokeWidth={1} radius={[0, 4, 4, 0]} />
              <Bar dataKey="spent" name="Spent" fill={GOLD} radius={[0, 4, 4, 0]} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#888' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Default for quarterly/competitor
  const defaultData: { day: string; visits: number; conversions: number; revenue: number }[] = [];
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-[#D4A843]" />
        Trend Overview
      </h4>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={defaultData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <Tooltip content={<GoldTooltip />} />
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke={GOLD} strokeWidth={2} dot={{ fill: GOLD, r: 4 }} />
            <Line type="monotone" dataKey="conversions" name="Conversions" stroke={GOLD_LIGHT} strokeWidth={2} dot={{ fill: GOLD_LIGHT, r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────
export default function ReportsTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewReport, setPreviewReport] = useState<Report | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<string>('');
  const [formRange, setFormRange] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/reports');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setReports(json.reports);
      setTimeline(json.timeline);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerate = async () => {
    if (!formName.trim()) {
      toast.error('Please enter a report name');
      return;
    }
    if (!formType) {
      toast.error('Please select a report type');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/marketing/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, type: formType, dateRange: formRange || 'This Week' }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const json = await res.json();
      toast.success(json.message);
      setReports((prev) => [json.report, ...prev]);
      setGenerateOpen(false);
      setFormName('');
      setFormType('');
      setFormRange('');
      setFormSchedule('one-time');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleQuickGenerate = (template: typeof reportTemplates[0]) => {
    setFormName(template.title);
    setFormType(template.type);
    setFormRange('This Week');
    setGenerateOpen(true);
  };

  const handleDownload = (report: Report) => {
    if (report.status !== 'ready') {
      toast.info('Report is not ready for download');
      return;
    }
    toast.success(`Downloading "${report.name}"...`);
  };

  const handleShare = (report: Report) => {
    toast.success(`Share link copied for "${report.name}"`);
  };

  // ── Timeline Icon ──
  function TimelineIcon({ icon, action }: { icon: string; action: string }) {
    const cls = 'h-3.5 w-3.5 shrink-0';
    if (icon === 'check-circle' || action === 'generated') return <CheckCircle2 className={`${cls} text-green-400`} />;
    if (icon === 'clock' || action === 'scheduled') return <Clock className={`${cls} text-yellow-400`} />;
    if (icon === 'download' || action === 'downloaded') return <Download className={`${cls} text-[#D4A843]`} />;
    if (icon === 'share' || action === 'shared') return <Share2 className={`${cls} text-blue-400`} />;
    return <RefreshCw className={`${cls} text-muted-foreground`} />;
  }

  if (loading) {
    return (
      <div className="space-y-6 p-1 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-48 rounded bg-white/5 animate-pulse" />
            <div className="h-4 w-72 mt-2 rounded bg-white/5 animate-pulse" />
          </div>
          <div className="h-10 w-36 rounded-lg bg-white/5 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  const stats = {
    total: reports.length,
    ready: reports.filter((r) => r.status === 'ready').length,
    thisMonth: reports.filter((r) => {
      const d = new Date(r.generatedAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── A. Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-[#D4A843]" />
            Marketing Reports
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Auto-generated insights and analytics summaries</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 mr-2">
            <div className="text-center">
              <p className="text-lg font-bold gold-gradient-text">{stats.total}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </div>
            <Separator orientation="vertical" className="h-8 bg-border/50" />
            <div className="text-center">
              <p className="text-lg font-bold text-green-400">{stats.ready}</p>
              <p className="text-[10px] text-muted-foreground">Ready</p>
            </div>
            <Separator orientation="vertical" className="h-8 bg-border/50" />
            <div className="text-center">
              <p className="text-lg font-bold text-[#D4A843]">{stats.thisMonth}</p>
              <p className="text-[10px] text-muted-foreground">This Month</p>
            </div>
          </div>
          <Button
            onClick={() => { setFormName(''); setFormType(''); setFormRange(''); setGenerateOpen(true); }}
            className="gold-gradient text-primary-foreground hover:opacity-90 transition-opacity gap-2"
          >
            <Plus className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* ── B. Quick Report Templates ─────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-[#D4A843]" />
          <h3 className="text-sm font-semibold text-foreground">Quick Report Templates</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {reportTemplates.map((tpl) => {
            const Icon = tpl.icon;
            return (
              <Card
                key={tpl.type}
                className={`min-w-[200px] max-w-[220px] shrink-0 border ${tpl.border} bg-gradient-to-br ${tpl.accent} hover:shadow-lg hover:shadow-black/30 transition-all duration-300 cursor-pointer group card-lift`}
                onClick={() => handleQuickGenerate(tpl)}
              >
                <CardContent className="p-4">
                  <div className={`h-9 w-9 rounded-lg bg-black/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-4 w-4 ${tpl.iconColor}`} />
                  </div>
                  <h4 className="text-[13px] font-semibold text-foreground leading-tight mb-1">{tpl.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 mb-3">{tpl.description}</p>
                  <Button variant="ghost" size="sm" className="text-[11px] text-[#D4A843] hover:text-[#E8C46A] hover:bg-[#D4A843]/10 px-0 h-auto">
                    Generate <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── C. Recent Reports Table ───────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-[#D4A843]" />
          <h3 className="text-sm font-semibold text-foreground">Recent Reports</h3>
          <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/50 ml-1">{reports.length}</Badge>
        </div>
        <Card className="border-border/50 bg-[#0d0d0d]">
          <div className="max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold text-muted-foreground">Report Name</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground">Type</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground hidden md:table-cell">Date Range</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground hidden lg:table-cell">Size</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground hidden lg:table-cell">Pages</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground hidden xl:table-cell">Key Metrics</TableHead>
                  <TableHead className="text-[11px] font-semibold text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => {
                  const metrics = Object.values(report.keyMetrics);
                  return (
                    <TableRow key={report.id} className="table-row-hover border-border/20">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-[#D4A843]/10 flex items-center justify-center shrink-0">
                            <FileBarChart className="h-3.5 w-3.5 text-[#D4A843]" />
                          </div>
                          <span className="text-[13px] font-medium text-foreground truncate max-w-[180px]">{report.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge className={`${typeBadgeClass[report.type]} text-[10px]`}>
                          {typeLabels[report.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-[12px] text-muted-foreground hidden md:table-cell">{report.dateRange}</TableCell>
                      <TableCell className="py-3">
                        <StatusBadge status={report.status} />
                      </TableCell>
                      <TableCell className="py-3 text-[12px] text-muted-foreground hidden lg:table-cell">
                        {report.size > 0 ? `${report.size} KB` : '—'}
                      </TableCell>
                      <TableCell className="py-3 text-[12px] text-muted-foreground hidden lg:table-cell">
                        {report.pages > 0 ? report.pages : '—'}
                      </TableCell>
                      <TableCell className="py-3 hidden xl:table-cell">
                        <div className="flex items-center gap-2">
                          {metrics.slice(0, 2).map((m, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className="text-[11px] text-muted-foreground">{m.label}:</span>
                              <span className="text-[11px] font-semibold text-foreground">{m.value}</span>
                              {m.change && m.positive !== undefined && (
                                <span className={`text-[10px] ${m.positive ? 'text-green-400' : 'text-red-400'}`}>
                                  {m.positive ? <ArrowUpRight className="h-2.5 w-2.5 inline" /> : <ArrowDownRight className="h-2.5 w-2.5 inline" />}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-[#D4A843] hover:bg-[#D4A843]/10"
                            onClick={() => setPreviewReport(report)}
                            title="View report"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-[#D4A843] hover:bg-[#D4A843]/10"
                            onClick={() => handleDownload(report)}
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      {/* ── D. Report Preview Dialog ──────────────────────── */}
      <Dialog open={!!previewReport} onOpenChange={(open) => { if (!open) setPreviewReport(null); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-[#0d0d0d] border-[#D4A843]/20 p-0">
          {previewReport && (
            <>
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 border-b border-border/30">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A843]/40 to-transparent" />
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${typeBadgeClass[previewReport.type]} text-[10px]`}>
                        {typeLabels[previewReport.type]}
                      </Badge>
                      <StatusBadge status={previewReport.status} />
                    </div>
                    <DialogTitle className="text-lg font-bold text-foreground">{previewReport.name}</DialogTitle>
                    <p className="text-[12px] text-muted-foreground mt-1">{previewReport.dateRange}</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                      Generated: {new Date(previewReport.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {previewReport.size > 0 && ` · ${previewReport.size} KB · ${previewReport.pages} pages`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setPreviewReport(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Key Metrics Cards */}
                {Object.keys(previewReport.keyMetrics).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[#D4A843]" />
                      Key Metrics
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.values(previewReport.keyMetrics).map((metric, i) => (
                        <Card key={i} className="bg-[#111] border-border/30 gold-card-hover">
                          <CardContent className="p-4">
                            <p className="text-[11px] text-muted-foreground mb-1">{metric.label}</p>
                            <p className="text-lg font-bold text-foreground">{metric.value}</p>
                            {metric.change && (
                              <p className={`text-[11px] mt-1 flex items-center gap-0.5 ${metric.positive ? 'text-green-400' : 'text-red-400'}`}>
                                {metric.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {metric.change}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Executive Summary */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#D4A843]" />
                    Executive Summary
                  </h4>
                  <div className="rounded-lg bg-[#111] border border-border/30 p-4">
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{previewReport.summary}</p>
                  </div>
                </div>

                {/* Charts */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#D4A843]" />
                    Data Visualizations
                  </h4>
                  <Card className="bg-[#111] border-border/30">
                    <CardContent className="p-4">
                      <ReportCharts type={previewReport.type} />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-border/30 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  className="border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10 gap-2"
                  onClick={() => handleShare(previewReport)}
                  disabled={previewReport.status !== 'ready'}
                >
                  <Share className="h-4 w-4" />
                  Share
                </Button>
                <Button
                  className="gold-gradient text-primary-foreground hover:opacity-90 gap-2"
                  onClick={() => handleDownload(previewReport)}
                  disabled={previewReport.status !== 'ready'}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── E. Generate Report Dialog ─────────────────────── */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-w-md bg-[#0d0d0d] border-[#D4A843]/20">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#D4A843]" />
              Generate New Report
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Report Name</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Weekly Performance Summary"
                className="bg-[#111] border-border/50 focus-gold h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Report Type</label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger className="bg-[#111] border-border/50 focus-gold h-9 text-sm">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-border">
                  <SelectItem value="weekly">Weekly Performance</SelectItem>
                  <SelectItem value="monthly">Monthly Marketing Review</SelectItem>
                  <SelectItem value="quarterly">Quarterly Report</SelectItem>
                  <SelectItem value="campaign">Campaign Deep Dive</SelectItem>
                  <SelectItem value="seo">SEO Performance</SelectItem>
                  <SelectItem value="social">Social Media Audit</SelectItem>
                  <SelectItem value="competitor">Competitor Benchmark</SelectItem>
                  <SelectItem value="budget">Budget Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">Date Range</label>
              <Select value={formRange} onValueChange={setFormRange}>
                <SelectTrigger className="bg-[#111] border-border/50 focus-gold h-9 text-sm">
                  <SelectValue placeholder="Select range..." />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-border">
                  <SelectItem value="This Week">This Week</SelectItem>
                  <SelectItem value="Last Week">Last Week</SelectItem>
                  <SelectItem value="This Month">This Month</SelectItem>
                  <SelectItem value="Last Month">Last Month</SelectItem>
                  <SelectItem value="Last 90 Days">Last 90 Days</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                className="border-border/50 text-muted-foreground hover:text-foreground"
                onClick={() => setGenerateOpen(false)}
                disabled={generating}
              >
                Cancel
              </Button>
              <Button
                className="gold-gradient text-primary-foreground hover:opacity-90 gap-2"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── F. Report Activity Timeline ───────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-[#D4A843]" />
          <h3 className="text-sm font-semibold text-foreground">Report Activity</h3>
        </div>
        <Card className="border-border/50 bg-[#0d0d0d]">
          <CardContent className="p-4">
            <div className="space-y-0">
              {timeline.map((item, i) => (
                <div key={item.id} className="flex items-start gap-3 group">
                  <div className="relative flex flex-col items-center">
                    <div className="h-7 w-7 rounded-full bg-[#111] border border-border/50 flex items-center justify-center shrink-0 group-hover:border-[#D4A843]/30 transition-colors">
                      <TimelineIcon icon={item.icon} action={item.action} />
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="w-px flex-1 bg-border/30 my-1" />
                    )}
                  </div>
                  <div className="pb-4 min-w-0">
                    <p className="text-[13px] text-foreground leading-snug">
                      <span className="font-medium">{item.reportName}</span>
                      <span className="text-muted-foreground"> {item.action} </span>
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}