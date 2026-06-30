'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Trophy,
  Target,
  ExternalLink,
  Globe,
  Search,
  Plus,
  Shield,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Lightbulb,
  Swords,
  Crown,
  Eye,
  Wifi,
  BarChart3,
} from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  website: string | null;
  category: string | null;
  marketShare: number;
  avgPriceRange: string | null;
  socialFollowers: number;
  monthlyTraffic: number;
  seoAuthority: number;
  strengths: string | null;
  weaknesses: string | null;
  notes: string | null;
}

interface MarketShareItem {
  name: string;
  marketShare: number;
  isLaxree: boolean;
}

interface RadarPoint {
  metric: string;
  Laxree: number;
  Tanishq: number;
  CaratLane: number;
  Kalyan: number;
}

interface PricingPoint {
  brand: string;
  gold: number;
  diamond: number;
  platinum: number;
}

interface SocialMediaData {
  [brand: string]: {
    instagram: number;
    facebook: number;
    youtube: number;
    twitter: number;
  };
}

interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface CompetitorsResponse {
  competitors: Competitor[];
  laxree: {
    name: string;
    marketShare: number;
    avgPriceRange: string;
    socialFollowers: number;
    monthlyTraffic: number;
    seoAuthority: number;
    category: string;
  };
  marketShareChart: MarketShareItem[];
  radarData: RadarPoint[];
  socialMedia: SocialMediaData;
  pricingComparison: PricingPoint[];
  swotData: SwotData;
  summary: {
    totalCompetitors: number;
    avgMarketShare: number;
    laxreePosition: string;
    industryGrowthRate: number;
  };
}

function formatNumber(n: number): string {
  if (n >= 10000000) return (n / 10000000).toFixed(1) + 'Cr';
  if (n >= 100000) return (n / 100000).toFixed(1) + 'L';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function formatFollowers(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

const GOLD = '#D4A843';
const GOLD_LIGHT = '#E8C46A';
const MUTED_COLORS = ['#4a4030', '#3d3828', '#353025', '#2d2820', '#282318', '#23201a', '#1e1b16', '#1a1815'];

export default function CompetitorTab() {
  const [data, setData] = useState<CompetitorsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    website: '',
    category: '',
    marketShare: '',
    avgPriceRange: '',
    socialFollowers: '',
    monthlyTraffic: '',
    seoAuthority: '',
    strengths: '',
    weaknesses: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/competitors');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Failed to load competitor data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddCompetitor = async () => {
    if (!newCompetitor.name.trim()) {
      toast.error('Competitor name is required');
      return;
    }
    try {
      const res = await fetch('/api/marketing/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCompetitor,
          marketShare: parseFloat(newCompetitor.marketShare) || 0,
          socialFollowers: parseInt(newCompetitor.socialFollowers) || 0,
          monthlyTraffic: parseInt(newCompetitor.monthlyTraffic) || 0,
          seoAuthority: parseInt(newCompetitor.seoAuthority) || 0,
        }),
      });
      if (!res.ok) throw new Error('Failed to create');
      toast.success('Competitor added successfully');
      setAddDialogOpen(false);
      setNewCompetitor({
        name: '', website: '', category: '', marketShare: '', avgPriceRange: '',
        socialFollowers: '', monthlyTraffic: '', seoAuthority: '',
        strengths: '', weaknesses: '', notes: '',
      });
      fetchData();
    } catch {
      toast.error('Failed to add competitor');
    }
  };

  const getSocialColor = (value: number, max: number) => {
    const ratio = value / max;
    if (ratio > 0.6) return 'bg-green-500/10 text-green-400';
    if (ratio > 0.3) return 'bg-yellow-500/10 text-yellow-400';
    return 'bg-red-500/10 text-red-400';
  };

  if (loading || !data) {
    return (
      <div className="space-y-6 p-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const maxInsta = Math.max(...Object.values(data.socialMedia).map((s) => s.instagram));

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Competitor Analysis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track market position, pricing, and digital presence</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient text-primary-foreground hover:opacity-90 gap-2">
              <Plus className="h-4 w-4" />
              Add Competitor
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111] border-border max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="gold-gradient-text text-lg">Add New Competitor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-xs font-medium text-muted-foreground">Name *</label>
                <Input
                  value={newCompetitor.name}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
                  placeholder="e.g. Joyalukkas"
                  className="bg-[#1a1a1a] border-border focus-gold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Website</label>
                  <Input
                    value={newCompetitor.website}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, website: e.target.value })}
                    placeholder="example.com"
                    className="bg-[#1a1a1a] border-border focus-gold"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <Select
                    value={newCompetitor.category}
                    onValueChange={(v) => setNewCompetitor({ ...newCompetitor, category: v })}
                  >
                    <SelectTrigger className="bg-[#1a1a1a] border-border focus-gold">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-border">
                      <SelectItem value="Organised Retail Chain">Retail Chain</SelectItem>
                      <SelectItem value="D2C Online">D2C Online</SelectItem>
                      <SelectItem value="Luxury D2C">Luxury D2C</SelectItem>
                      <SelectItem value="Fashion / Artificial">Fashion</SelectItem>
                      <SelectItem value="Regional Player">Regional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Market Share (%)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newCompetitor.marketShare}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, marketShare: e.target.value })}
                    placeholder="0.0"
                    className="bg-[#1a1a1a] border-border focus-gold"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-muted-foreground">SEO Authority</label>
                  <Input
                    type="number"
                    value={newCompetitor.seoAuthority}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, seoAuthority: e.target.value })}
                    placeholder="0-100"
                    className="bg-[#1a1a1a] border-border focus-gold"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-muted-foreground">Avg Price Range</label>
                <Input
                  value={newCompetitor.avgPriceRange}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, avgPriceRange: e.target.value })}
                  placeholder="₹10,000 - ₹1,00,000"
                  className="bg-[#1a1a1a] border-border focus-gold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Social Followers</label>
                  <Input
                    type="number"
                    value={newCompetitor.socialFollowers}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, socialFollowers: e.target.value })}
                    placeholder="0"
                    className="bg-[#1a1a1a] border-border focus-gold"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Monthly Traffic</label>
                  <Input
                    type="number"
                    value={newCompetitor.monthlyTraffic}
                    onChange={(e) => setNewCompetitor({ ...newCompetitor, monthlyTraffic: e.target.value })}
                    placeholder="0"
                    className="bg-[#1a1a1a] border-border focus-gold"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-muted-foreground">Strengths (comma-separated)</label>
                <Input
                  value={newCompetitor.strengths}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, strengths: e.target.value })}
                  placeholder="Strong brand, Good designs"
                  className="bg-[#1a1a1a] border-border focus-gold"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-muted-foreground">Weaknesses (comma-separated)</label>
                <Input
                  value={newCompetitor.weaknesses}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, weaknesses: e.target.value })}
                  placeholder="Limited online, High pricing"
                  className="bg-[#1a1a1a] border-border focus-gold"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-muted-foreground">Notes</label>
                <Input
                  value={newCompetitor.notes}
                  onChange={(e) => setNewCompetitor({ ...newCompetitor, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="bg-[#1a1a1a] border-border focus-gold"
                />
              </div>
              <Button onClick={handleAddCompetitor} className="gold-gradient text-primary-foreground hover:opacity-90 w-full mt-2">
                Add Competitor
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* A. Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        <Card className="gold-card-hover rounded-xl p-4 relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Competitors</p>
              <p className="text-2xl font-bold text-foreground mt-1 gold-glow">{data.summary.totalCompetitors}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Brands tracked</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4A843]/10">
              <Users className="h-5 w-5 text-[#D4A843]" />
            </div>
          </div>
        </Card>
        <Card className="gold-card-hover rounded-xl p-4 relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Avg Market Share</p>
              <p className="text-2xl font-bold text-foreground mt-1 gold-glow">{data.summary.avgMarketShare}%</p>
              <p className="text-[11px] text-muted-foreground mt-1">Across all brands</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4A843]/10">
              <BarChart3 className="h-5 w-5 text-[#D4A843]" />
            </div>
          </div>
        </Card>
        <Card className="gold-card-hover rounded-xl p-4 relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Laxree&apos;s Position</p>
              <p className="text-2xl font-bold text-foreground mt-1 gold-glow">{data.summary.laxreePosition}</p>
              <p className="text-[11px] text-muted-foreground mt-1">By market share</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4A843]/10">
              <Trophy className="h-5 w-5 text-[#D4A843]" />
            </div>
          </div>
        </Card>
        <Card className="gold-card-hover rounded-xl p-4 relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Industry Growth</p>
              <p className="text-2xl font-bold text-green-400 mt-1 gold-glow">
                {data.summary.industryGrowthRate}%
                <ArrowUpRight className="inline h-4 w-4 ml-1" />
              </p>
              <p className="text-[11px] text-green-400/70 mt-1">Year-over-year CAGR</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-[#111] border border-border/50 rounded-lg p-1 h-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843] text-muted-foreground rounded-md px-4 py-2 text-xs font-medium">
            Market Overview
          </TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843] text-muted-foreground rounded-md px-4 py-2 text-xs font-medium">
            Pricing
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843] text-muted-foreground rounded-md px-4 py-2 text-xs font-medium">
            Social Media
          </TabsTrigger>
          <TabsTrigger value="swot" className="data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843] text-muted-foreground rounded-md px-4 py-2 text-xs font-medium">
            SWOT Analysis
          </TabsTrigger>
        </TabsList>

        {/* ──── Market Overview Tab ──── */}
        <TabsContent value="overview" className="space-y-6">
          {/* B. Market Share Horizontal Bar Chart */}
          <Card className="gold-card-hover rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-[#D4A843]" />
                Market Share Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.marketShareChart}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2520" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: '#9a9080', fontSize: 11 }}
                      axisLine={{ stroke: '#2a2520' }}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tick={{ fill: '#9a9080', fontSize: 12 }}
                      axisLine={{ stroke: '#2a2520' }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: '#1a1a1a',
                        border: '1px solid rgba(212,168,67,0.25)',
                        borderRadius: '8px',
                        color: '#f5f0e8',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`${value}%`, 'Market Share']}
                    />
                    <Bar dataKey="marketShare" radius={[0, 6, 6, 0]} barSize={20}>
                      {data.marketShareChart.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isLaxree ? GOLD : MUTED_COLORS[index % MUTED_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Radar Chart + Laxree Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 gold-card-hover rounded-xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Swords className="h-4 w-4 text-[#D4A843]" />
                  Competitive Radar — Laxree vs Top Players
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data.radarData} outerRadius="70%">
                      <PolarGrid stroke="#2a2520" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#9a9080', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Laxree" dataKey="Laxree" stroke={GOLD} fill={GOLD} fillOpacity={0.15} strokeWidth={2} />
                      <Radar name="Tanishq" dataKey="Tanishq" stroke="#ef4444" fill="#ef4444" fillOpacity={0.05} strokeWidth={1.5} />
                      <Radar name="CaratLane" dataKey="CaratLane" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} strokeWidth={1.5} />
                      <Radar name="Kalyan" dataKey="Kalyan" stroke="#22c55e" fill="#22c55e" fillOpacity={0.05} strokeWidth={1.5} />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', color: '#9a9080' }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          background: '#1a1a1a',
                          border: '1px solid rgba(212,168,67,0.25)',
                          borderRadius: '8px',
                          color: '#f5f0e8',
                          fontSize: '12px',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Laxree Quick Stats */}
            <Card className="glass-gold rounded-xl p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient">
                  <Crown className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-base font-bold gold-gradient-text">Laxree</h3>
                  <p className="text-[11px] text-muted-foreground">{data.laxree.category}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Market Share</span>
                    <span className="text-foreground font-semibold">{data.laxree.marketShare}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full gold-progress rounded-full" style={{ width: `${(data.laxree.marketShare / 20) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">SEO Authority</span>
                    <span className="text-foreground font-semibold">{data.laxree.seoAuthority}/100</span>
                  </div>
                  <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4A843]/70 rounded-full" style={{ width: `${data.laxree.seoAuthority}%` }} />
                  </div>
                </div>
                <div className="pt-2 border-t border-border/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Social Followers
                    </span>
                    <span className="text-sm font-semibold text-foreground">{formatFollowers(data.laxree.socialFollowers)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Monthly Traffic
                    </span>
                    <span className="text-sm font-semibold text-foreground">{formatNumber(data.laxree.monthlyTraffic)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" /> Avg Price Range
                    </span>
                    <span className="text-sm font-semibold text-foreground">{data.laxree.avgPriceRange}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* C. Competitor Cards Grid */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-[#D4A843]" />
              Competitor Profiles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
              {data.competitors.map((c) => (
                <Card key={c.id} className="gold-card-hover rounded-xl overflow-hidden group">
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-foreground group-hover:text-[#D4A843] transition-colors">{c.name}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{c.category}</p>
                      </div>
                      {c.website && (
                        <a
                          href={`https://${c.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-[#D4A843] transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Price Range */}
                    {c.avgPriceRange && (
                      <p className="text-xs text-[#D4A843] font-medium mb-3">{c.avgPriceRange}</p>
                    )}

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-[#1a1a1a] rounded-lg p-2 text-center">
                        <p className="text-[10px] text-muted-foreground">Followers</p>
                        <p className="text-xs font-bold text-foreground mt-0.5">{formatFollowers(c.socialFollowers)}</p>
                      </div>
                      <div className="bg-[#1a1a1a] rounded-lg p-2 text-center">
                        <p className="text-[10px] text-muted-foreground">Traffic</p>
                        <p className="text-xs font-bold text-foreground mt-0.5">{formatNumber(c.monthlyTraffic)}</p>
                      </div>
                      <div className="bg-[#1a1a1a] rounded-lg p-2 text-center">
                        <p className="text-[10px] text-muted-foreground">SEO</p>
                        <p className="text-xs font-bold text-foreground mt-0.5">{c.seoAuthority}</p>
                      </div>
                    </div>

                    {/* Market Share Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-muted-foreground">Market Share</span>
                        <span className="text-foreground font-semibold">{c.marketShare}%</span>
                      </div>
                      <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(c.marketShare / 20) * 100}%`,
                            background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Strengths */}
                    {c.strengths && (
                      <div className="mb-2">
                        <p className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mb-1.5">Strengths</p>
                        <div className="flex flex-wrap gap-1">
                          {c.strengths.split(',').slice(0, 3).map((s, i) => (
                            <Badge key={i} className="badge-green text-[10px] px-2 py-0 rounded-full border-0 font-normal">
                              {s.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {c.weaknesses && (
                      <div>
                        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1.5">Weaknesses</p>
                        <div className="flex flex-wrap gap-1">
                          {c.weaknesses.split(',').slice(0, 3).map((w, i) => (
                            <Badge key={i} className="badge-red text-[10px] px-2 py-0 rounded-full border-0 font-normal">
                              {w.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ──── Pricing Tab ──── */}
        <TabsContent value="pricing" className="space-y-6">
          {/* D. Pricing Comparison Bar Chart */}
          <Card className="gold-card-hover rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#D4A843]" />
                Average Pricing by Category
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Gold, Diamond &amp; Platinum average prices across brands (₹)</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[420px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.pricingComparison} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2520" />
                    <XAxis
                      dataKey="brand"
                      tick={{ fill: '#9a9080', fontSize: 10 }}
                      axisLine={{ stroke: '#2a2520' }}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fill: '#9a9080', fontSize: 11 }}
                      axisLine={{ stroke: '#2a2520' }}
                      tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: '#1a1a1a',
                        border: '1px solid rgba(212,168,67,0.25)',
                        borderRadius: '8px',
                        color: '#f5f0e8',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="gold" name="Gold" fill={GOLD} radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="diamond" name="Diamond" fill="#E8C46A" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="platinum" name="Platinum" fill="#B8922F" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Table */}
          <Card className="gold-card-hover rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Pricing Summary Table</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="gold-table-header">
                      <TableHead className="text-xs font-semibold text-[#D4A843]">Brand</TableHead>
                      <TableHead className="text-xs font-semibold text-[#D4A843] text-right">Gold Avg</TableHead>
                      <TableHead className="text-xs font-semibold text-[#D4A843] text-right">Diamond Avg</TableHead>
                      <TableHead className="text-xs font-semibold text-[#D4A843] text-right">Platinum Avg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.pricingComparison.map((p) => (
                      <TableRow key={p.brand} className={`table-row-hover ${p.brand === 'Laxree' ? 'bg-[#D4A843]/5' : ''}`}>
                        <TableCell className="text-xs font-medium">
                          {p.brand === 'Laxree' && (
                            <span className="inline-flex items-center gap-1">
                              <Crown className="h-3 w-3 text-[#D4A843]" />
                              <span className="gold-gradient-text font-bold">{p.brand}</span>
                            </span>
                          )}
                          {p.brand !== 'Laxree' && <span className="text-foreground">{p.brand}</span>}
                        </TableCell>
                        <TableCell className="text-xs text-right text-muted-foreground">
                          ₹{p.gold.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-xs text-right text-muted-foreground">
                          ₹{p.diamond.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-xs text-right text-muted-foreground">
                          ₹{p.platinum.toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──── Social Media Tab ──── */}
        <TabsContent value="social" className="space-y-6">
          {/* E. Social Media Comparison Table */}
          <Card className="gold-card-hover rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Wifi className="h-4 w-4 text-[#D4A843]" />
                Social Media Follower Comparison
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Cross-platform follower counts with color-coded performance</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="gold-table-header">
                      <TableHead className="text-xs font-semibold text-[#D4A843]">Brand</TableHead>
                      <TableHead className="text-xs font-semibold text-[#D4A843] text-right">Instagram</TableHead>
                      <TableHead className="text-xs font-semibold text-[#D4A843] text-right">Facebook</TableHead>
                      <TableHead className="text-xs font-semibold text-[#D4A843] text-right">YouTube</TableHead>
                      <TableHead className="text-xs font-semibold text-[#D4A843] text-right">Twitter</TableHead>
                      <TableHead className="text-xs font-semibold text-[#D4A843] text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(data.socialMedia)
                      .sort(([, a], [, b]) => {
                        const totalA = a.instagram + a.facebook + a.youtube + a.twitter;
                        const totalB = b.instagram + b.facebook + b.youtube + b.twitter;
                        return totalB - totalA;
                      })
                      .map(([brand, social]) => {
                        const total = social.instagram + social.facebook + social.youtube + social.twitter;
                        const isLaxree = brand === 'Laxree';
                        return (
                          <TableRow
                            key={brand}
                            className={`table-row-hover ${isLaxree ? 'bg-[#D4A843]/5' : ''}`}
                          >
                            <TableCell className="text-xs font-medium">
                              {isLaxree ? (
                                <span className="inline-flex items-center gap-1">
                                  <Crown className="h-3 w-3 text-[#D4A843]" />
                                  <span className="gold-gradient-text font-bold">{brand}</span>
                                </span>
                              ) : (
                                <span className="text-foreground">{brand}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md ${getSocialColor(social.instagram, maxInsta)}`}>
                                {formatFollowers(social.instagram)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md ${getSocialColor(social.facebook, 1500000)}`}>
                                {formatFollowers(social.facebook)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md ${getSocialColor(social.youtube, 380000)}`}>
                                {formatFollowers(social.youtube)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md ${getSocialColor(social.twitter, 120000)}`}>
                                {formatFollowers(social.twitter)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-xs font-bold text-foreground">{formatFollowers(total)}</span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Bar Chart */}
          <Card className="gold-card-hover rounded-xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Instagram Followers — Visual Comparison</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(data.socialMedia)
                    .map(([brand, social]) => ({ brand, instagram: social.instagram }))
                    .sort((a, b) => b.instagram - a.instagram)}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2520" />
                    <XAxis
                      dataKey="brand"
                      tick={{ fill: '#9a9080', fontSize: 10 }}
                      axisLine={{ stroke: '#2a2520' }}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fill: '#9a9080', fontSize: 11 }}
                      axisLine={{ stroke: '#2a2520' }}
                      tickFormatter={(v: number) => formatFollowers(v)}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        background: '#1a1a1a',
                        border: '1px solid rgba(212,168,67,0.25)',
                        borderRadius: '8px',
                        color: '#f5f0e8',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [formatFollowers(value), 'Instagram Followers']}
                    />
                    <Bar dataKey="instagram" radius={[6, 6, 0, 0]} barSize={24}>
                      {Object.entries(data.socialMedia)
                        .map(([brand, social]) => ({ brand, instagram: social.instagram }))
                        .sort((a, b) => b.instagram - a.instagram)
                        .map((entry, index) => (
                          <Cell
                            key={`insta-${index}`}
                            fill={entry.brand === 'Laxree' ? GOLD : MUTED_COLORS[index % MUTED_COLORS.length]}
                          />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──── SWOT Analysis Tab ──── */}
        <TabsContent value="swot" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
            {/* Strengths */}
            <Card className="glass-gold rounded-xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-green-500/20">
                <CardTitle className="text-sm font-bold text-green-400 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2.5">
                  {data.swotData.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                      <span className="text-xs text-muted-foreground leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="glass-gold rounded-xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-red-500/20">
                <CardTitle className="text-sm font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2.5">
                  {data.swotData.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                      <span className="text-xs text-muted-foreground leading-relaxed">{w}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card className="glass-gold rounded-xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-blue-500/20">
                <CardTitle className="text-sm font-bold text-blue-400 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2.5">
                  {data.swotData.opportunities.map((o, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                      <span className="text-xs text-muted-foreground leading-relaxed">{o}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Threats */}
            <Card className="glass-gold rounded-xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-yellow-500/20">
                <CardTitle className="text-sm font-bold text-yellow-400 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Threats
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2.5">
                  {data.swotData.threats.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-400 shrink-0" />
                      <span className="text-xs text-muted-foreground leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Key Insight */}
          <Card className="glass-gold rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gold-gradient shrink-0 mt-0.5">
                <Crown className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Strategic Insight</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Laxree occupies a unique position between mass-market D2C brands (CaratLane, BlueStone) and traditional retail chains (Tanishq, Kalyan).
                  The primary growth lever is <span className="text-[#D4A843] font-medium">digital presence amplification</span> — closing the gap in social followers
                  (135K vs 2-3M+ leaders) and web traffic (45K vs 5-18M) would significantly improve market positioning. The luxury D2C segment
                  is growing at <span className="text-green-400 font-medium">12.5% CAGR</span>, presenting a window for Laxree to capture market share
                  through influencer marketing, SEO investment, and AR-enabled try-on features.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}