'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Plus,
  Users,
  Phone,
  Mail,
  MessageCircle,
  Video,
  Search,
  Download,
  Eye,
  CalendarClock,
  TrendingUp,
  IndianRupee,
  ArrowRight,
  GripVertical,
  Clock,
  CheckCircle2,
  Calendar,
  Target,
  UserPlus,
  Filter,
  ChevronRight,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/* ─── Types ─────────────────────────────────────────────── */

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  count: number;
  value: number;
}

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  stage: string;
  source: string;
  quality: string;
  assignedTo: string;
  createdAt: string;
  lastFollowUp: string | null;
  nextFollowUp: string | null;
  followUpCount: number;
  notes: string;
  tags: string[];
  country: string;
  city: string;
}

interface FollowUp {
  id: string;
  leadName: string;
  leadId: string;
  type: string;
  subject: string;
  date: string;
  time: string;
  status: string;
  notes: string;
  assignedTo: string;
}

interface Stats {
  totalLeads: number;
  thisMonth: number;
  conversionRate: number;
  avgDealSize: number;
  avgDaysToClose: number;
  totalRevenue: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
}

interface MonthlyTrend {
  month: string;
  new: number;
  won: number;
  revenue: number;
  conversionRate: number;
}

interface SourceBreakdown {
  source: string;
  count: number;
  percentage: number;
  revenue: number;
}

interface TeamPerformance {
  name: string;
  leads: number;
  won: number;
  revenue: number;
  avgDealDays: number;
}

interface PipelineData {
  pipeline: { stages: PipelineStage[] };
  leads: Lead[];
  followUps: FollowUp[];
  stats: Stats;
  monthlyTrend: MonthlyTrend[];
  sourceBreakdown: SourceBreakdown[];
  teamPerformance: TeamPerformance[];
}

/* ─── Helpers ───────────────────────────────────────────── */

function formatINR(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toLocaleString('en-IN')}`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const qualityColor = (q: string) => {
  switch (q) {
    case 'hot': return { dot: 'bg-red-500', badge: 'badge-dot-red', label: 'Hot' };
    case 'warm': return { dot: 'bg-yellow-500', badge: 'badge-dot-yellow', label: 'Warm' };
    default: return { dot: 'bg-blue-500', badge: 'badge-dot-blue', label: 'Cold' };
  }
};

const typeIcon = (t: string) => {
  switch (t) {
    case 'call': return <Phone className="h-3.5 w-3.5" />;
    case 'email': return <Mail className="h-3.5 w-3.5" />;
    case 'whatsapp': return <MessageCircle className="h-3.5 w-3.5" />;
    case 'meeting': return <Video className="h-3.5 w-3.5" />;
    default: return <Phone className="h-3.5 w-3.5" />;
  }
};

const typeColor = (t: string) => {
  switch (t) {
    case 'call': return 'border-l-green-500';
    case 'email': return 'border-l-blue-500';
    case 'whatsapp': return 'border-l-emerald-400';
    case 'meeting': return 'border-l-purple-500';
    default: return 'border-l-gray-500';
  }
};

const statusBadge = (s: string) => {
  switch (s) {
    case 'completed': return <Badge className="badge-dot-green text-[10px] px-2 py-0.5">Completed</Badge>;
    case 'pending': return <Badge className="badge-dot-yellow text-[10px] px-2 py-0.5">Pending</Badge>;
    case 'scheduled': return <Badge className="badge-dot-blue text-[10px] px-2 py-0.5">Scheduled</Badge>;
    default: return <Badge variant="outline" className="text-[10px] px-2 py-0.5">{s}</Badge>;
  }
};

const sourceColor = (s: string) => {
  switch (s) {
    case 'Google Ads': return 'badge-gold';
    case 'Facebook': return 'badge-cyan';
    case 'Website': return 'badge-green';
    case 'Referral': return 'badge-orange';
    case 'Instagram': return 'badge-red';
    case 'Email': return 'badge-yellow';
    default: return '';
  }
};

/* ─── Component ─────────────────────────────────────────── */

export default function LeadPipelineTab() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState('pipeline');

  // Filters for All Leads
  const [stageFilter, setStageFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialogs
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [viewLead, setViewLead] = useState<Lead | null>(null);

  // Lead form
  const [leadForm, setLeadForm] = useState({
    name: '', company: '', email: '', phone: '', value: '', stage: 'new', source: 'Google Ads', quality: 'warm', assignedTo: 'Priya Sharma', tags: '', city: '', country: 'India', notes: '',
  });

  // Follow-up form
  const [fuForm, setFuForm] = useState({
    leadId: '', type: 'call', subject: '', date: '', time: '', notes: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/lead-pipeline');
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Failed to load pipeline data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const leadsByStage = useMemo(() => {
    if (!data) return {};
    const map: Record<string, Lead[]> = {};
    data.pipeline.stages.forEach((s) => { map[s.id] = []; });
    data.leads.forEach((l) => {
      if (map[l.stage]) map[l.stage].push(l);
    });
    return map;
  }, [data]);

  const filteredLeads = useMemo(() => {
    if (!data) return [];
    return data.leads.filter((l) => {
      if (stageFilter !== 'all' && l.stage !== stageFilter) return false;
      if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
      if (qualityFilter !== 'all' && l.quality !== qualityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [data, stageFilter, sourceFilter, qualityFilter, searchQuery]);

  const fuStats = useMemo(() => {
    if (!data) return { today: 0, pending: 0, completed: 0 };
    const today = data.followUps.filter((f) => f.date === '2025-01-16').length;
    const pending = data.followUps.filter((f) => f.status === 'pending' || f.status === 'scheduled').length;
    const completed = data.followUps.filter((f) => f.status === 'completed').length;
    return { today, pending, completed };
  }, [data]);

  const handleSaveLead = async () => {
    if (!leadForm.name.trim()) { toast.error('Name is required'); return; }
    try {
      await fetch('/api/marketing/lead-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadForm),
      });
      toast.success('Lead saved successfully');
      setLeadDialogOpen(false);
      setLeadForm({ name: '', company: '', email: '', phone: '', value: '', stage: 'new', source: 'Google Ads', quality: 'warm', assignedTo: 'Priya Sharma', tags: '', city: '', country: 'India', notes: '' });
    } catch {
      toast.error('Failed to save lead');
    }
  };

  const handleSaveFollowUp = async () => {
    if (!fuForm.leadId || !fuForm.subject.trim()) { toast.error('Lead and subject are required'); return; }
    try {
      await fetch('/api/marketing/lead-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'follow-up', data: fuForm }),
      });
      toast.success('Follow-up scheduled');
      setFollowUpDialogOpen(false);
      setFuForm({ leadId: '', type: 'call', subject: '', date: '', time: '', notes: '' });
    } catch {
      toast.error('Failed to schedule follow-up');
    }
  };

  const handleMarkDone = (fuId: string) => {
    if (!data) return;
    const updated = data.followUps.map((f) => f.id === fuId ? { ...f, status: 'completed' } : f);
    setData({ ...data, followUps: updated as FollowUp[] });
    toast.success('Follow-up marked as completed');
  };

  const handleExportCSV = () => {
    if (!data) return;
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Value', 'Stage', 'Source', 'Quality', 'Assigned To', 'City', 'Country'];
    const rows = filteredLeads.map((l) => [l.name, l.company, l.email, l.phone, l.value, l.stage, l.source, l.quality, l.assignedTo, l.city, l.country]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laxree-leads.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  if (loading) {
    return (
      <div className="space-y-6 p-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const { pipeline, stats, monthlyTrend } = data;

  return (
    <div className="space-y-5 p-1 animate-fade-in-up">
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient shadow-lg shadow-[#D4A843]/20">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="section-heading text-lg">Lead Pipeline</h2>
            <p className="text-xs text-muted-foreground">Manage your complete sales pipeline</p>
          </div>
        </div>
        <Dialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-gold gap-2">
              <UserPlus className="h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111] border-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add New Lead</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
                  <Input className="focus-gold bg-[#0a0a0a] border-border" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} placeholder="Full name" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Company</label>
                  <Input className="focus-gold bg-[#0a0a0a] border-border" value={leadForm.company} onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })} placeholder="Company" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <Input className="focus-gold bg-[#0a0a0a] border-border" type="email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                  <Input className="focus-gold bg-[#0a0a0a] border-border" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Deal Value (₹)</label>
                  <Input className="focus-gold bg-[#0a0a0a] border-border" type="number" value={leadForm.value} onChange={(e) => setLeadForm({ ...leadForm, value: e.target.value })} placeholder="0" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Stage</label>
                  <Select value={leadForm.stage} onValueChange={(v) => setLeadForm({ ...leadForm, stage: v })}>
                    <SelectTrigger className="focus-gold bg-[#0a0a0a] border-border"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#111] border-border">
                      {pipeline.stages.filter((s) => s.id !== 'won' && s.id !== 'lost').map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Source</label>
                  <Select value={leadForm.source} onValueChange={(v) => setLeadForm({ ...leadForm, source: v })}>
                    <SelectTrigger className="focus-gold bg-[#0a0a0a] border-border"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#111] border-border">
                      {['Google Ads', 'Facebook', 'Website', 'Referral', 'Instagram', 'Email'].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Quality</label>
                  <Select value={leadForm.quality} onValueChange={(v) => setLeadForm({ ...leadForm, quality: v })}>
                    <SelectTrigger className="focus-gold bg-[#0a0a0a] border-border"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#111] border-border">
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cold">Cold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Assigned To</label>
                  <Select value={leadForm.assignedTo} onValueChange={(v) => setLeadForm({ ...leadForm, assignedTo: v })}>
                    <SelectTrigger className="focus-gold bg-[#0a0a0a] border-border"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#111] border-border">
                      {data.teamPerformance.map((t) => (
                        <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Tags (comma-separated)</label>
                  <Input className="focus-gold bg-[#0a0a0a] border-border" value={leadForm.tags} onChange={(e) => setLeadForm({ ...leadForm, tags: e.target.value })} placeholder="VIP, Diamond" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">City</label>
                    <Input className="focus-gold bg-[#0a0a0a] border-border" value={leadForm.city} onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })} placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Country</label>
                    <Input className="focus-gold bg-[#0a0a0a] border-border" value={leadForm.country} onChange={(e) => setLeadForm({ ...leadForm, country: e.target.value })} placeholder="India" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                <Textarea className="focus-gold bg-[#0a0a0a] border-border resize-none" rows={3} value={leadForm.notes} onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })} placeholder="Add notes..." />
              </div>
              <Button className="btn-gold w-full" onClick={handleSaveLead}>Save Lead</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Inline Stats ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'text-[#D4A843]' },
          { label: 'This Month', value: stats.thisMonth, icon: TrendingUp, color: 'text-green-400' },
          { label: 'Conversion', value: `${stats.conversionRate}%`, icon: Target, color: 'text-cyan-400' },
          { label: 'Revenue', value: formatINR(stats.totalRevenue), icon: IndianRupee, color: 'text-[#D4A843]' },
        ].map((s) => (
          <div key={s.label} className="premium-card p-3 flex items-center gap-3 group hover-scale-sm transition-transform duration-200">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D4A843]/10">
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
              <p className={`text-sm font-bold ${s.color} count-up-smooth`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Sub Tabs ───────────────────────────────────── */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="bg-[#111] border border-border/50 h-10">
          <TabsTrigger value="pipeline" className="text-xs data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843]">Pipeline</TabsTrigger>
          <TabsTrigger value="all-leads" className="text-xs data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843]">All Leads</TabsTrigger>
          <TabsTrigger value="follow-ups" className="text-xs data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843]">Follow-ups</TabsTrigger>
        </TabsList>

        {/* ═══ PIPELINE VIEW ═══════════════════════════ */}
        <TabsContent value="pipeline" className="space-y-5 mt-4">
          {/* ── Kanban Board ──────────────────────────── */}
          <Card className="premium-card overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#D4A843]" />
                  Sales Pipeline
                </CardTitle>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Won: {pipeline.stages.find((s) => s.id === 'won')?.count}</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Lost: {pipeline.stages.find((s) => s.id === 'lost')?.count}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="flex gap-0 p-4 min-w-[900px]">
                  {pipeline.stages.map((stage, idx) => {
                    const stageLeads = leadsByStage[stage.id] || [];
                    const maxShow = 3;
                    const shown = stageLeads.slice(0, maxShow);
                    const overflow = stageLeads.length - maxShow;
                    const isWon = stage.id === 'won';
                    const isLost = stage.id === 'lost';

                    return (
                      <div key={stage.id} className="flex items-stretch">
                        {/* Column */}
                        <div className={`flex flex-col w-[155px] shrink-0 rounded-xl ${isWon ? 'bg-green-500/5 border border-green-500/20' : isLost ? 'bg-red-500/5 border border-red-500/20' : 'bg-[#0a0a0a] border border-border/50'}`}>
                          {/* Stage Header */}
                          <div className="p-2.5 pb-2">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
                                <span className="text-[11px] font-semibold text-foreground truncate">{stage.name}</span>
                              </div>
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: stage.color }}
                              >
                                {stage.count}
                              </span>
                            </div>
                            {stage.value > 0 && (
                              <p className="text-[10px] text-muted-foreground font-medium">{formatINR(stage.value)}</p>
                            )}
                          </div>

                          {/* Lead Cards */}
                          <div className="flex-1 px-2 pb-2 space-y-1.5">
                            {shown.map((lead) => {
                              const qc = qualityColor(lead.quality);
                              return (
                                <div
                                  key={lead.id}
                                  className="p-2 rounded-lg bg-[#111]/80 border border-border/30 hover:border-[#D4A843]/30 transition-all duration-200 cursor-pointer group/card hover-scale-sm"
                                  onClick={() => setViewLead(lead)}
                                >
                                  <div className="flex items-start gap-1.5">
                                    <div className="h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold text-white mt-0.5" style={{ backgroundColor: stage.color + '40', color: stage.color }}>
                                      {getInitials(lead.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1">
                                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${qc.dot}`} />
                                        <p className="text-[10px] font-semibold text-foreground truncate">{lead.name}</p>
                                      </div>
                                      <p className="text-[9px] text-muted-foreground truncate">{lead.company}</p>
                                      {lead.value > 0 && (
                                        <p className="text-[9px] font-semibold text-[#D4A843] mt-0.5">{formatINR(lead.value)}</p>
                                      )}
                                      <Badge className={`${sourceColor(lead.source)} text-[8px] px-1 py-0 mt-1 h-3.5`}>
                                        {lead.source}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                    <GripVertical className="h-3 w-3 text-muted-foreground/40" />
                                  </div>
                                </div>
                              );
                            })}
                            {overflow > 0 && (
                              <button className="w-full text-center py-1.5 text-[10px] text-muted-foreground hover:text-[#D4A843] transition-colors rounded-md hover:bg-[#D4A843]/5">
                                +{overflow} more
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Arrow connector */}
                        {idx < pipeline.stages.length - 1 && (
                          <div className="flex items-center px-1.5 shrink-0">
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="w-4 h-px bg-gradient-to-r from-[#D4A843]/40 to-[#D4A843]/20" />
                              <ChevronRight className="h-3 w-3 text-[#D4A843]/40" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* ── Pipeline Value Funnel ──────────────────── */}
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Pipeline Value Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {pipeline.stages.filter((s) => s.id !== 'lost').map((stage) => {
                  const maxVal = pipeline.stages.reduce((m, s) => Math.max(m, s.value), 1);
                  const pct = maxVal > 0 ? (stage.value / maxVal) * 100 : 0;
                  return (
                    <div key={stage.id} className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground w-24 shrink-0 truncate">{stage.name}</span>
                      <div className="flex-1 h-5 bg-[#111] rounded-full overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${Math.max(pct, 4)}%`,
                            background: `linear-gradient(90deg, ${stage.color}40, ${stage.color})`,
                          }}
                        />
                        {stage.value > 0 && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-foreground">{formatINR(stage.value)}</span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold w-8 text-right" style={{ color: stage.color }}>{stage.count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ── Revenue Chart ──────────────────────────── */}
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#D4A843]" />
                Monthly Won vs Lost Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-container h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} tickFormatter={(v: number) => `${v / 100000}L`} />
                    <RechartsTooltip
                      contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 8, fontSize: 12 }}
                      formatter={(value: number) => [formatINR(value), '']}
                      labelStyle={{ color: '#D4A843' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="revenue" name="Won Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="new" name="New Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ ALL LEADS ═══════════════════════════════ */}
        <TabsContent value="all-leads" className="space-y-4 mt-4">
          {/* ── Filters Row ───────────────────────────── */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="h-8 w-[130px] text-xs bg-[#111] border-border focus-gold">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-border">
                <SelectItem value="all">All Stages</SelectItem>
                {pipeline.stages.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="h-8 w-[120px] text-xs bg-[#111] border-border focus-gold">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-border">
                <SelectItem value="all">All Sources</SelectItem>
                {['Google Ads', 'Facebook', 'Website', 'Referral', 'Instagram', 'Email'].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={qualityFilter} onValueChange={setQualityFilter}>
              <SelectTrigger className="h-8 w-[110px] text-xs bg-[#111] border-border focus-gold">
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-border">
                <SelectItem value="all">All Quality</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-xs bg-[#111] border-border focus-gold"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border hover:border-[#D4A843]/40 hover:text-[#D4A843]" onClick={handleExportCSV}>
              <Download className="h-3 w-3" /> Export CSV
            </Button>
          </div>

          {/* ── Leads Table ───────────────────────────── */}
          <Card className="premium-card overflow-hidden">
            <CardContent className="p-0">
              <ScrollArea className="max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-[10px] font-semibold text-muted-foreground">Name</TableHead>
                      <TableHead className="text-[10px] font-semibold text-muted-foreground hidden md:table-cell">Email</TableHead>
                      <TableHead className="text-[10px] font-semibold text-muted-foreground hidden lg:table-cell">Phone</TableHead>
                      <TableHead className="text-[10px] font-semibold text-muted-foreground">Value</TableHead>
                      <TableHead className="text-[10px] font-semibold text-muted-foreground">Stage</TableHead>
                      <TableHead className="text-[10px] font-semibold text-muted-foreground hidden sm:table-cell">Source</TableHead>
                      <TableHead className="text-[10px] font-semibold text-muted-foreground">Quality</TableHead>
                      <TableHead className="text-[10px] font-semibold text-muted-foreground hidden lg:table-cell">Assigned</TableHead>
                      <TableHead className="text-[10px] font-semibold text-muted-foreground hidden xl:table-cell">Last FU</TableHead>
                      <TableHead className="text-[10px] font-semibold text-muted-foreground hidden xl:table-cell">Tags</TableHead>
                      <TableHead className="text-[10px] font-semibold text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => {
                      const qc = qualityColor(lead.quality);
                      const stageObj = pipeline.stages.find((s) => s.id === lead.stage);
                      return (
                        <TableRow key={lead.id} className="table-row-hover border-border/30">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: (stageObj?.color || '#888') + '30', color: stageObj?.color }}>
                                {getInitials(lead.name)}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-foreground">{lead.name}</p>
                                <p className="text-[10px] text-muted-foreground">{lead.company}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground hidden md:table-cell">{lead.email}</TableCell>
                          <TableCell className="text-[11px] text-muted-foreground hidden lg:table-cell">{lead.phone}</TableCell>
                          <TableCell>
                            <span className="text-xs font-semibold text-[#D4A843]">
                              {lead.value > 0 ? formatINR(lead.value) : '—'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className="text-[9px] px-1.5 py-0 h-4 text-white"
                              style={{ backgroundColor: stageObj?.color || '#888' }}
                            >
                              {stageObj?.name || lead.stage}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className={`${sourceColor(lead.source)} text-[9px] px-1.5 py-0 h-4`}>
                              {lead.source}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${qc.badge} text-[9px] px-1.5 py-0 h-4`}>
                              {qc.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground hidden lg:table-cell">{lead.assignedTo}</TableCell>
                          <TableCell className="text-[11px] text-muted-foreground hidden xl:table-cell">{lead.lastFollowUp || '—'}</TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {lead.tags.slice(0, 2).map((t) => (
                                <Badge key={t} variant="outline" className="text-[8px] px-1 py-0 h-3.5 text-muted-foreground">{t}</Badge>
                              ))}
                              {lead.tags.length > 2 && <span className="text-[8px] text-muted-foreground">+{lead.tags.length - 2}</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[#D4A843]/10 text-muted-foreground hover:text-[#D4A843] transition-colors" title="View" onClick={() => setViewLead(lead)}>
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[#D4A843]/10 text-muted-foreground hover:text-[#D4A843] transition-colors" title="Follow-up" onClick={() => { setFuForm({ ...fuForm, leadId: lead.id }); setFollowUpDialogOpen(true); }}>
                                <CalendarClock className="h-3.5 w-3.5" />
                              </button>
                              <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[#D4A843]/10 text-muted-foreground hover:text-[#D4A843] transition-colors" title="Edit" onClick={() => { setLeadForm({ name: lead.name, company: lead.company, email: lead.email, phone: lead.phone, value: String(lead.value), stage: lead.stage, source: lead.source, quality: lead.quality, assignedTo: lead.assignedTo, tags: lead.tags.join(', '), city: lead.city, country: lead.country, notes: lead.notes }); setLeadDialogOpen(true); }}>
                                <Filter className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
              {filteredLeads.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Users className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">No leads match your filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ FOLLOW-UPS ══════════════════════════════ */}
        <TabsContent value="follow-ups" className="space-y-4 mt-4">
          {/* ── Follow-up Stats ───────────────────────── */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Today's Follow-ups", value: fuStats.today, icon: Calendar, color: 'text-[#D4A843]', bg: 'bg-[#D4A843]/10' },
              { label: 'Pending / Scheduled', value: fuStats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { label: 'Completed This Week', value: fuStats.completed, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
            ].map((s) => (
              <Card key={s.label} className="premium-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color} number-reveal`}>{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Schedule Follow-up Button ─────────────── */}
          <div className="flex justify-end">
            <Dialog open={followUpDialogOpen} onOpenChange={setFollowUpDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-gold gap-2">
                  <CalendarClock className="h-4 w-4" />
                  Schedule Follow-up
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#111] border-border max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Schedule Follow-up</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Lead *</label>
                    <Select value={fuForm.leadId} onValueChange={(v) => setFuForm({ ...fuForm, leadId: v })}>
                      <SelectTrigger className="focus-gold bg-[#0a0a0a] border-border"><SelectValue placeholder="Select lead" /></SelectTrigger>
                      <SelectContent className="bg-[#111] border-border max-h-48">
                        {data.leads.filter((l) => l.stage !== 'won' && l.stage !== 'lost').map((l) => (
                          <SelectItem key={l.id} value={l.id}>{l.name} — {l.company}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Type</label>
                    <Select value={fuForm.type} onValueChange={(v) => setFuForm({ ...fuForm, type: v })}>
                      <SelectTrigger className="focus-gold bg-[#0a0a0a] border-border"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#111] border-border">
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="meeting">In-Person Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Subject *</label>
                    <Input className="focus-gold bg-[#0a0a0a] border-border" value={fuForm.subject} onChange={(e) => setFuForm({ ...fuForm, subject: e.target.value })} placeholder="Follow-up subject" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Date</label>
                      <Input className="focus-gold bg-[#0a0a0a] border-border" type="date" value={fuForm.date} onChange={(e) => setFuForm({ ...fuForm, date: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Time</label>
                      <Input className="focus-gold bg-[#0a0a0a] border-border" type="time" value={fuForm.time} onChange={(e) => setFuForm({ ...fuForm, time: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
                    <Textarea className="focus-gold bg-[#0a0a0a] border-border resize-none" rows={3} value={fuForm.notes} onChange={(e) => setFuForm({ ...fuForm, notes: e.target.value })} placeholder="Add notes..." />
                  </div>
                  <Button className="btn-gold w-full" onClick={handleSaveFollowUp}>Schedule Follow-up</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* ── Follow-up Timeline ────────────────────── */}
          <div className="space-y-2">
            {data.followUps.map((fu) => (
              <Card key={fu.id} className={`glass-gold overflow-hidden border-l-2 ${typeColor(fu.type)}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D4A843]/15 text-[#D4A843]">
                          {typeIcon(fu.type)}
                        </div>
                        <span className="text-sm font-semibold text-foreground">{fu.leadName}</span>
                        {statusBadge(fu.status)}
                      </div>
                      <p className="text-xs font-medium text-foreground/80 ml-8">{fu.subject}</p>
                      <p className="text-[11px] text-muted-foreground ml-8 mt-0.5">{fu.notes}</p>
                      <div className="flex items-center gap-3 ml-8 mt-1.5">
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Calendar className="h-3 w-3" /> {fu.date}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" /> {fu.time}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{fu.assignedTo}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-8 sm:ml-0">
                      {fu.status !== 'completed' && (
                        <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => handleMarkDone(fu.id)}>
                          <CheckCircle2 className="h-3 w-3" /> Mark Done
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10" onClick={() => { setFuForm({ leadId: fu.leadId, type: fu.type, subject: fu.subject, date: fu.date, time: fu.time, notes: fu.notes }); setFollowUpDialogOpen(true); }}>
                        <ArrowRight className="h-3 w-3" /> Reschedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── View Lead Dialog ──────────────────────────── */}
      <Dialog open={!!viewLead} onOpenChange={() => setViewLead(null)}>
        <DialogContent className="bg-[#111] border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Lead Details</DialogTitle>
          </DialogHeader>
          {viewLead && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold gold-gradient text-primary-foreground">
                  {getInitials(viewLead.name)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{viewLead.name}</h3>
                  <p className="text-xs text-muted-foreground">{viewLead.company}</p>
                </div>
              </div>
              <Separator className="bg-border/50" />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[10px]">Email</p>
                  <p className="text-foreground">{viewLead.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Phone</p>
                  <p className="text-foreground">{viewLead.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Deal Value</p>
                  <p className="text-[#D4A843] font-semibold">{viewLead.value > 0 ? formatINR(viewLead.value) : '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Stage</p>
                  <Badge className="text-[9px] text-white px-1.5 py-0" style={{ backgroundColor: pipeline.stages.find((s) => s.id === viewLead.stage)?.color || '#888' }}>
                    {pipeline.stages.find((s) => s.id === viewLead.stage)?.name || viewLead.stage}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Source</p>
                  <Badge className={`${sourceColor(viewLead.source)} text-[9px] px-1.5 py-0`}>{viewLead.source}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Quality</p>
                  <Badge className={`${qualityColor(viewLead.quality).badge} text-[9px] px-1.5 py-0`}>{qualityColor(viewLead.quality).label}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Assigned To</p>
                  <p className="text-foreground">{viewLead.assignedTo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Location</p>
                  <p className="text-foreground">{viewLead.city}, {viewLead.country}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Follow-ups</p>
                  <p className="text-foreground">{viewLead.followUpCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Next Follow-up</p>
                  <p className="text-foreground">{viewLead.nextFollowUp || '—'}</p>
                </div>
              </div>
              {viewLead.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {viewLead.tags.map((t) => (
                    <Badge key={t} variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground">{t}</Badge>
                  ))}
                </div>
              )}
              {viewLead.notes && (
                <div className="bg-[#0a0a0a] rounded-lg p-3 border border-border/30">
                  <p className="text-[10px] text-muted-foreground mb-1">Notes</p>
                  <p className="text-xs text-foreground/80">{viewLead.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}