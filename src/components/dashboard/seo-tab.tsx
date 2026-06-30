'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Search,
  TrendingUp,
  TrendingDown,
  Globe,
  Zap,
  Shield,
  Smartphone,
  FileWarning,
  FileCheck,
  BarChart3,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface SeoKeyword {
  id: string;
  keyword: string;
  position: number;
  volume: number;
  difficulty: number;
  url: string | null;
  change: number;
}

interface TechnicalSeo {
  pageSpeed: number;
  mobileFriendly: boolean;
  httpsEnabled: boolean;
  coreWebVitals: { lcp: number; fid: number; cls: number };
  crawlErrors: number;
  indexedPages: number;
  sitemapStatus: string;
  robotsTxtStatus: string;
}

interface Backlinks {
  total: number;
  referringDomains: number;
  dofollow: number;
  nofollow: number;
  topReferrers: { domain: string; links: number; da: number }[];
}

interface SeoData {
  keywords: SeoKeyword[];
  stats: {
    avgPosition: number;
    totalVolume: number;
    top3: number;
    top10: number;
    improved: number;
    declined: number;
    totalKeywords: number;
  };
  technicalSeo: TechnicalSeo;
  backlinks: Backlinks;
}

function formatVolume(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function getPositionColor(pos: number): string {
  if (pos <= 3) return 'text-green-400';
  if (pos <= 10) return 'text-gold';
  if (pos <= 20) return 'text-yellow-400';
  return 'text-red-400';
}

function getDifficultyColor(d: number): string {
  if (d <= 30) return 'bg-green-500';
  if (d <= 60) return 'bg-gold';
  return 'bg-red-400';
}

function CircularProgress({ value, size = 80 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 80 ? '#22c55e' : value >= 50 ? '#D4A843' : '#ef4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(212, 168, 67, 0.15)"
          strokeWidth="5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-foreground">{value}</span>
      </div>
    </div>
  );
}

type SortKey = 'keyword' | 'position' | 'volume' | 'difficulty' | 'change';
type SortDir = 'asc' | 'desc';

export default function SeoTab() {
  const [data, setData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('position');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/seo');
      const json = await res.json();
      setData(json);
    } catch {
      console.error('Failed to fetch SEO data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'position' || key === 'difficulty' ? 'asc' : 'desc');
    }
  };

  const filteredKeywords = (data?.keywords || [])
    .filter((k) => k.keyword.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

  const positionDistribution = data
    ? [
        { range: '1-3', count: data.stats.top3, fill: '#22c55e' },
        { range: '4-10', count: data.stats.top10 - data.stats.top3, fill: '#D4A843' },
        { range: '11-20', count: data.keywords.filter(k => k.position > 10 && k.position <= 20).length, fill: '#eab308' },
        { range: '21-50', count: data.keywords.filter(k => k.position > 20 && k.position <= 50).length, fill: '#f97316' },
        { range: '50+', count: data.keywords.filter(k => k.position > 50).length, fill: '#ef4444' },
      ]
    : [];

  const backlinkPie = data
    ? [
        { name: 'DoFollow', value: data.backlinks.dofollow },
        { name: 'NoFollow', value: data.backlinks.nofollow },
      ]
    : [];

  const PIE_COLORS = ['#D4A843', '#4a4535'];

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

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-muted">
          <Globe className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">SEO Dashboard</h2>
          <p className="text-sm text-muted-foreground">Search engine optimization analytics &amp; performance</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="gold-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Average Position</p>
          <p className="text-2xl font-bold text-gold gold-glow stat-animate">#{data.stats.avgPosition}</p>
          <p className="text-xs text-muted-foreground mt-1">Across {data.stats.totalKeywords} keywords</p>
        </Card>
        <Card className="gold-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Search Volume</p>
          <p className="text-2xl font-bold text-foreground stat-animate">{formatVolume(data.stats.totalVolume)}</p>
          <p className="text-xs text-muted-foreground mt-1">Monthly searches</p>
        </Card>
        <Card className="gold-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Top 3 Keywords</p>
          <p className="text-2xl font-bold text-green-400 stat-animate">{data.stats.top3}</p>
          <p className="text-xs text-muted-foreground mt-1">Ranking in top 3</p>
        </Card>
        <Card className="gold-card p-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Improved</p>
              <p className="text-lg font-bold text-green-400 stat-animate">+{data.stats.improved}</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Declined</p>
              <p className="text-lg font-bold text-red-400 stat-animate">-{data.stats.declined}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Keywords Table */}
      <Card className="gold-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-gold" />
              Keyword Rankings
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search keywords..."
                className="border-border bg-secondary/50 pl-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[400px] overflow-y-auto rounded-lg border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="gold-table-header hover:bg-transparent">
                  <TableHead
                    className="cursor-pointer text-xs font-semibold text-gold"
                    onClick={() => handleSort('keyword')}
                  >
                    <span className="flex items-center gap-1">Keyword <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-xs font-semibold text-gold"
                    onClick={() => handleSort('position')}
                  >
                    <span className="flex items-center gap-1">Position <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-xs font-semibold text-gold"
                    onClick={() => handleSort('volume')}
                  >
                    <span className="flex items-center gap-1">Volume <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-xs font-semibold text-gold"
                    onClick={() => handleSort('difficulty')}
                  >
                    <span className="flex items-center gap-1">Difficulty <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-gold">URL</TableHead>
                  <TableHead
                    className="cursor-pointer text-xs font-semibold text-gold"
                    onClick={() => handleSort('change')}
                  >
                    <span className="flex items-center gap-1">Change <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeywords.map((kw) => (
                  <TableRow key={kw.id} className="border-border/30 hover:bg-gold-muted/30 transition-colors">
                    <TableCell className="font-medium text-foreground text-sm">{kw.keyword}</TableCell>
                    <TableCell>
                      <span className={`font-bold text-sm ${getPositionColor(kw.position)}`}>#{kw.position}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatVolume(kw.volume)}</TableCell>
                    <TableCell className="w-28">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getDifficultyColor(kw.difficulty)} transition-all duration-500`}
                            style={{ width: `${kw.difficulty}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-7 text-right">{kw.difficulty}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {kw.url ? (
                        <a href={kw.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:underline flex items-center gap-1 truncate max-w-[140px]">
                          <span className="truncate">{kw.url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {kw.change > 0 ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-400">
                          <TrendingUp className="h-3.5 w-3.5" />+{kw.change}
                        </span>
                      ) : kw.change < 0 ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-400">
                          <TrendingDown className="h-3.5 w-3.5" />{kw.change}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Technical SEO + Backlinks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Technical SEO */}
        <Card className="gold-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-gold" />
              Technical SEO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Page Speed */}
            <div className="flex items-center gap-5">
              <CircularProgress value={data.technicalSeo.pageSpeed} />
              <div>
                <p className="text-sm font-semibold text-foreground">Page Speed</p>
                <p className="text-xs text-muted-foreground">{data.technicalSeo.pageSpeed}/100 — Good</p>
              </div>
            </div>

            {/* Core Web Vitals */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Core Web Vitals</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-secondary/40 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1">LCP</p>
                  <p className={`text-sm font-bold ${data.technicalSeo.coreWebVitals.lcp < 2.5 ? 'text-green-400' : 'text-red-400'}`}>
                    {data.technicalSeo.coreWebVitals.lcp}s
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/40 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1">FID</p>
                  <p className={`text-sm font-bold ${data.technicalSeo.coreWebVitals.fid < 100 ? 'text-green-400' : 'text-red-400'}`}>
                    {data.technicalSeo.coreWebVitals.fid}ms
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/40 p-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1">CLS</p>
                  <p className={`text-sm font-bold ${data.technicalSeo.coreWebVitals.cls < 0.1 ? 'text-green-400' : 'text-red-400'}`}>
                    {data.technicalSeo.coreWebVitals.cls}
                  </p>
                </div>
              </div>
            </div>

            {/* Checks */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-400" />
                <div>
                  <p className="text-xs font-medium text-foreground">HTTPS</p>
                  <p className="text-[10px] text-green-400">Enabled</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-green-400" />
                <div>
                  <p className="text-xs font-medium text-foreground">Mobile Friendly</p>
                  <p className="text-[10px] text-green-400">Yes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {data.technicalSeo.crawlErrors > 0 ? (
                  <FileWarning className="h-4 w-4 text-yellow-400" />
                ) : (
                  <FileCheck className="h-4 w-4 text-green-400" />
                )}
                <div>
                  <p className="text-xs font-medium text-foreground">Crawl Errors</p>
                  <p className={`text-[10px] ${data.technicalSeo.crawlErrors > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {data.technicalSeo.crawlErrors}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-green-400" />
                <div>
                  <p className="text-xs font-medium text-foreground">Indexed Pages</p>
                  <p className="text-[10px] text-muted-foreground">{data.technicalSeo.indexedPages}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-green-400" />
                <div>
                  <p className="text-xs font-medium text-foreground">Sitemap</p>
                  <p className="text-[10px] text-green-400 capitalize">{data.technicalSeo.sitemapStatus}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-green-400" />
                <div>
                  <p className="text-xs font-medium text-foreground">Robots.txt</p>
                  <p className="text-[10px] text-green-400 capitalize">{data.technicalSeo.robotsTxtStatus}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backlink Profile */}
        <Card className="gold-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ExternalLink className="h-5 w-5 text-gold" />
              Backlink Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-[10px] text-muted-foreground">Total Backlinks</p>
                <p className="text-lg font-bold text-foreground">{data.backlinks.total.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-[10px] text-muted-foreground">Referring Domains</p>
                <p className="text-lg font-bold text-foreground">{data.backlinks.referringDomains}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-[10px] text-muted-foreground">DoFollow</p>
                <p className="text-lg font-bold text-gold">{data.backlinks.dofollow.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-[10px] text-muted-foreground">NoFollow</p>
                <p className="text-lg font-bold text-muted-foreground">{data.backlinks.nofollow.toLocaleString()}</p>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="flex items-center justify-center">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={backlinkPie}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      dataKey="value"
                      stroke="none"
                    >
                      {backlinkPie.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#111111',
                        border: '1px solid rgba(212, 168, 67, 0.3)',
                        borderRadius: '8px',
                        color: '#f5f0e8',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      formatter={(value: string) => (
                        <span className="text-xs text-muted-foreground">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Referring Domains */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Top Referring Domains</p>
              <div className="space-y-1.5">
                {data.backlinks.topReferrers.map((ref) => (
                  <div key={ref.domain} className="flex items-center justify-between rounded-md bg-secondary/30 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">{ref.domain}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-xs text-muted-foreground">{ref.links} links</span>
                      <Badge className="badge-gold px-1.5 py-0.5 text-[10px]">DA {ref.da}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position Distribution Chart */}
      <Card className="gold-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-gold" />
            Keyword Position Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={positionDistribution} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 168, 67, 0.1)" />
                <XAxis
                  dataKey="range"
                  tick={{ fill: '#9a9080', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(212, 168, 67, 0.2)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#9a9080', fontSize: 12 }}
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
                />
                <Bar dataKey="count" name="Keywords" radius={[6, 6, 0, 0]}>
                  {positionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}