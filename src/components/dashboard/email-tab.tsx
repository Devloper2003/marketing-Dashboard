'use client';

import { useState, useEffect } from 'react';
import {
  Mail, MailOpen, MousePointerClick, TrendingUp, ArrowUpRight, ArrowDownRight,
  Send, Clock, Filter, Eye, Users, Zap, CircleDot, BarChart3, DollarSign,
  Plus, ChevronRight, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { toast } from 'sonner';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string | null;
  status: string;
  sentAt: string | null;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  conversions: number;
  revenue: number;
  listSize: number;
}

const GOLD = '#D4A843';
const GOLD_LIGHT = '#E8C46A';
const GOLD_DARK = '#B8922F';
const MUTED_GOLD = 'rgba(212,168,67,0.2)';

function formatCurrency(val: number) {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
}

function formatNumber(val: number) {
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toString();
}

const statusColor: Record<string, string> = {
  sent: 'badge-green',
  scheduled: 'badge-yellow',
  draft: 'badge-gold',
};

function RateBadge({ value, threshold = 35 }: { value: number; threshold?: number }) {
  if (value >= threshold) return <span className="text-green-400 font-medium">{value}%</span>;
  if (value >= 25) return <span className="text-yellow-400 font-medium">{value}%</span>;
  return <span className="text-red-400 font-medium">{value}%</span>;
}

export default function EmailTab() {
  const [data, setData] = useState<{
    campaigns: EmailCampaign[];
    summary: Record<string, number>;
    weeklyTrend: { week: string; openRate: number; clickRate: number }[];
    funnel: { stage: string; value: number; pct: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortField, setSortField] = useState<string>('sentAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    fetch('/api/marketing/email-campaigns')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/marketing/email-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, subject: newSubject, status: 'draft', listSize: 10000 }),
      });
      const created = await res.json();
      if (data) {
        setData({
          ...data,
          campaigns: [created, ...data.campaigns],
        });
      }
      setNewName('');
      setNewSubject('');
      setDialogOpen(false);
      toast.success('Campaign created successfully');
    } catch {
      toast.error('Failed to create campaign');
    }
  };

  const filteredCampaigns = (data?.campaigns || [])
    .filter((c) => filter === 'all' || c.status === filter)
    .sort((a, b) => {
      const aVal = a[sortField as keyof EmailCampaign] ?? 0;
      const bVal = b[sortField as keyof EmailCampaign] ?? 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

  if (loading || !data) {
    return (
      <div className="space-y-6 p-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-gold h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Email Campaigns</h2>
          <p className="text-sm text-muted-foreground">Track email marketing performance & revenue</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-8 w-[130px] border-border/50 bg-[#111]/50 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#111] border-border">
              <SelectItem value="all">All ({data.campaigns.length})</SelectItem>
              <SelectItem value="sent">Sent ({s.sentCount})</SelectItem>
              <SelectItem value="scheduled">Scheduled ({s.scheduledCount})</SelectItem>
              <SelectItem value="draft">Draft ({s.draftCount})</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-8 gold-gradient text-primary-foreground text-xs gap-1.5 hover:opacity-90">
                <Plus className="h-3.5 w-3.5" /> New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#111] border-[#D4A843]/20">
              <DialogHeader>
                <DialogTitle className="gold-gradient-text text-lg">New Email Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="focus-gold rounded-lg border border-border/50">
                  <Input
                    placeholder="Campaign name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="focus-gold rounded-lg border border-border/50">
                  <Input
                    placeholder="Subject line"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="border-0 bg-transparent text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button onClick={handleCreate} className="w-full gold-gradient text-primary-foreground">
                  Create Campaign
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children count-animate">
        <Card className="gold-card-hover p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4A843]/10">
              <Send className="h-5 w-5 text-[#D4A843]" />
            </div>
            <Badge className="badge-green text-[10px]">+12%</Badge>
          </div>
          <p className="text-2xl font-bold text-foreground gold-glow">{formatNumber(s.totalSent)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Emails Sent</p>
        </Card>
        <Card className="gold-card-hover p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4A843]/10">
              <MailOpen className="h-5 w-5 text-[#D4A843]" />
            </div>
            <Badge className="badge-green text-[10px]">+4.2%</Badge>
          </div>
          <p className="text-2xl font-bold text-foreground gold-glow">{s.avgOpenRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">Avg Open Rate</p>
        </Card>
        <Card className="gold-card-hover p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4A843]/10">
              <DollarSign className="h-5 w-5 text-[#D4A843]" />
            </div>
            <Badge className="badge-green text-[10px]">+18%</Badge>
          </div>
          <p className="text-2xl font-bold text-foreground gold-glow">{formatCurrency(s.totalRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Revenue</p>
        </Card>
        <Card className="gold-card-hover p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4A843]/10">
              <Users className="h-5 w-5 text-[#D4A843]" />
            </div>
            <Badge className="badge-green text-[10px]">+22%</Badge>
          </div>
          <p className="text-2xl font-bold text-foreground gold-glow">{formatNumber(s.totalConversions)}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Conversions</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Trend */}
        <Card className="glass-gold">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#D4A843]" />
              Email Performance Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weeklyTrend}>
                  <defs>
                    <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="lightGoldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={GOLD_LIGHT} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={GOLD_LIGHT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,168,67,0.08)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9a9080' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9a9080' }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#f5f0e8' }}
                  />
                  <Area type="monotone" dataKey="openRate" stroke={GOLD} fill="url(#goldAreaGrad)" strokeWidth={2} name="Open Rate" />
                  <Area type="monotone" dataKey="clickRate" stroke={GOLD_LIGHT} fill="url(#lightGoldAreaGrad)" strokeWidth={2} name="Click Rate" />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#9a9080' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Campaign */}
        <Card className="glass-gold">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#D4A843]" />
              Revenue by Campaign
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.campaigns.filter((c) => c.status === 'sent').map((c) => ({ name: c.name.length > 18 ? c.name.slice(0, 18) + '…' : c.name, revenue: c.revenue }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,168,67,0.08)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#9a9080' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#9a9080' }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {data.campaigns.filter((c) => c.status === 'sent').map((_, i) => (
                      <Cell key={i} fill={i === 0 ? GOLD : `rgba(212,168,67,${0.9 - i * 0.1})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Funnel */}
      <Card className="glass-gold">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CircleDot className="h-4 w-4 text-[#D4A843]" />
            Email Engagement Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.funnel.map((step, i) => {
              const widthPct = Math.max(step.pct, 8);
              return (
                <div key={step.stage} className="flex items-center gap-4">
                  <div className="w-28 shrink-0 text-right">
                    <p className="text-sm font-medium text-foreground">{step.stage}</p>
                    <p className="text-xs text-muted-foreground">{formatNumber(step.value)}</p>
                  </div>
                  <div className="flex-1">
                    <div className="relative h-10 rounded-lg overflow-hidden bg-[#1a1a1a]">
                      <div
                        className="h-full rounded-lg transition-all duration-700 flex items-center px-3"
                        style={{
                          width: `${widthPct}%`,
                          background: `linear-gradient(90deg, ${GOLD_DARK}, ${GOLD}, ${GOLD_LIGHT})`,
                          opacity: 1 - i * 0.15,
                        }}
                      >
                        <span className="text-xs font-bold text-primary-foreground whitespace-nowrap">
                          {step.pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {i < data.funnel.length - 1 && (
                    <div className="w-20 shrink-0 text-center">
                      <span className="text-[11px] text-red-400 font-medium">
                        -{((data.funnel[i].pct - data.funnel[i + 1].pct) / data.funnel[i].pct * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Performance Table */}
      <Card className="glass-gold">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4 text-[#D4A843]" />
            Campaign Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="gold-table-header border-border/30 hover:bg-transparent">
                  <TableHead className="text-xs cursor-pointer hover:text-[#D4A843]" onClick={() => handleSort('name')}>
                    Campaign {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Subject</TableHead>
                  <TableHead className="text-xs cursor-pointer hover:text-[#D4A843]" onClick={() => handleSort('status')}>
                    Status {sortField === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-xs text-right cursor-pointer hover:text-[#D4A843]" onClick={() => handleSort('listSize')}>
                    List {sortField === 'listSize' && (sortDir === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-xs text-right cursor-pointer hover:text-[#D4A843]" onClick={() => handleSort('openRate')}>
                    Open {sortField === 'openRate' && (sortDir === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-xs text-right cursor-pointer hover:text-[#D4A843]" onClick={() => handleSort('clickRate')}>
                    Click {sortField === 'clickRate' && (sortDir === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-xs text-right hidden lg:table-cell">Bounce</TableHead>
                  <TableHead className="text-xs text-right cursor-pointer hover:text-[#D4A843]" onClick={() => handleSort('conversions')}>
                    Conv. {sortField === 'conversions' && (sortDir === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-xs text-right cursor-pointer hover:text-[#D4A843]" onClick={() => handleSort('revenue')}>
                    Revenue {sortField === 'revenue' && (sortDir === 'asc' ? '↑' : '↓')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((c) => (
                  <TableRow key={c.id} className="table-row-hover border-border/20">
                    <TableCell className="font-medium text-sm text-foreground py-3">{c.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[200px] truncate">{c.subject}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColor[c.status] || 'badge-gold'} text-[10px]`}>
                        {c.status === 'sent' && <CheckCircle2 className="h-2.5 w-2.5 mr-1" />}
                        {c.status === 'scheduled' && <Clock className="h-2.5 w-2.5 mr-1" />}
                        {c.status === 'draft' && <Zap className="h-2.5 w-2.5 mr-1" />}
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{formatNumber(c.listSize)}</TableCell>
                    <TableCell className="text-right">
                      <RateBadge value={c.openRate} threshold={35} />
                    </TableCell>
                    <TableCell className="text-right">
                      <RateBadge value={c.clickRate} threshold={8} />
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">
                      <span className={c.bounceRate > 2 ? 'text-red-400' : 'text-muted-foreground'}>{c.bounceRate}%</span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-foreground font-medium">{c.conversions.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm text-[#D4A843] font-semibold">{formatCurrency(c.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Cards Grid */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Eye className="h-4 w-4 text-[#D4A843]" />
          Campaign Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
          {data.campaigns.slice(0, 6).map((c) => {
            const isHighPerformer = c.openRate > 40;
            const ringColor = isHighPerformer ? 'border-green-500/50' : c.openRate > 30 ? 'border-yellow-500/50' : 'border-red-500/50';
            return (
              <Card key={c.id} className={`gold-card-hover p-4 border-l-4 ${ringColor}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-foreground truncate">{c.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.subject || 'No subject'}</p>
                  </div>
                  <Badge className={`${statusColor[c.status] || 'badge-gold'} text-[10px] shrink-0 ml-2`}>{c.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Open Rate</p>
                    <p className={`text-lg font-bold ${isHighPerformer ? 'text-green-400' : 'text-foreground'}`}>{c.openRate}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Click Rate</p>
                    <p className="text-lg font-bold text-foreground">{c.clickRate}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Conversions</p>
                    <p className="text-sm font-medium text-foreground">{c.conversions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Revenue</p>
                    <p className="text-sm font-semibold text-[#D4A843]">{formatCurrency(c.revenue)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {formatNumber(c.listSize)} recipients
                  </span>
                  {c.sentAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(c.sentAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass-gold p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Avg Bounce Rate</p>
          <p className="text-xl font-bold text-foreground">{s.avgBounceRate}%</p>
          <p className="text-[10px] text-green-400 flex items-center justify-center gap-1 mt-1">
            <ArrowDownRight className="h-3 w-3" /> Below 2% target
          </p>
        </Card>
        <Card className="glass-gold p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Revenue per Email</p>
          <p className="text-xl font-bold text-[#D4A843]">₹{s.totalSent > 0 ? (s.totalRevenue / s.totalSent).toFixed(1) : '0'}</p>
          <p className="text-[10px] text-green-400 flex items-center justify-center gap-1 mt-1">
            <ArrowUpRight className="h-3 w-3" /> +8% vs last month
          </p>
        </Card>
        <Card className="glass-gold p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Best Campaign</p>
          <p className="text-sm font-bold text-foreground mt-1">Flash Sale</p>
          <p className="text-[10px] text-[#D4A843] mt-1">52.3% open rate</p>
        </Card>
        <Card className="glass-gold p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Active Lists</p>
          <p className="text-xl font-bold text-foreground">3</p>
          <p className="text-[10px] text-muted-foreground mt-1">VIP, Standard, Prospects</p>
        </Card>
      </div>
    </div>
  );
}