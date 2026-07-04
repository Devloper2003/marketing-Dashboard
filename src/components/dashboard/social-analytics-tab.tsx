'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Users,
  Clock,
  ArrowUpRight,
  Instagram,
  Twitter,
  Facebook,
  Megaphone,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

// ─── Types ───────────────────────────────────────────────────────────
interface SocialPost {
  id: string;
  platform: string;
  content: string | null;
  status: string;
  scheduledAt: string | null;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

interface SocialData {
  posts: SocialPost[];
  platforms: string[];
  statusCounts: {
    published: number;
    scheduled: number;
    draft: number;
  };
  totalEngagement: number;
}

// ─── Constants ───────────────────────────────────────────────────────

const PLATFORM_CONFIG: Record<
  string,
  {
    name: string;
    icon: React.ReactNode;
    color: string;
    badgeClass: string;
    areaColor: string;
    areaFill: string;
  }
> = {
  Instagram: {
    name: 'Instagram',
    icon: <Instagram className="size-4" />,
    color: '#E1306C',
    badgeClass: 'bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] text-white border-none',
    areaColor: '#E1306C',
    areaFill: 'rgba(225, 48, 108, 0.15)',
  },
  Twitter: {
    name: 'Twitter / X',
    icon: <Twitter className="size-4" />,
    color: '#38BDF8',
    badgeClass: 'bg-[#1a1a1a] text-sky-400 border border-sky-400/50',
    areaColor: '#38BDF8',
    areaFill: 'rgba(56, 189, 248, 0.15)',
  },
  Facebook: {
    name: 'Facebook',
    icon: <Facebook className="size-4" />,
    color: '#3B82F6',
    badgeClass: 'bg-[#1877F2] text-white border-none',
    areaColor: '#3B82F6',
    areaFill: 'rgba(59, 130, 246, 0.15)',
  },
  Pinterest: {
    name: 'Pinterest',
    icon: <Megaphone className="size-4" />,
    color: '#E60023',
    badgeClass: 'bg-[#E60023] text-white border-none',
    areaColor: '#E60023',
    areaFill: 'rgba(230, 0, 35, 0.15)',
  },
};

const TOP_STATS = [
  {
    label: 'Total Followers',
    value: '0',
    change: '+0 this month',
    positive: true,
    icon: <Users className="size-5" />,
  },
  {
    label: 'Total Engagement',
    value: '0',
    change: '+0%',
    positive: true,
    icon: <Heart className="size-5" />,
  },
  {
    label: 'Avg. Engagement Rate',
    value: '0%',
    change: '+0%',
    positive: true,
    icon: <TrendingUp className="size-5" />,
  },
  {
    label: 'Total Posts',
    value: '0',
    change: 'published this month',
    positive: null,
    icon: <BarChart3 className="size-5" />,
  },
];

const PLATFORM_STATS = [
  {
    platform: 'Instagram',
    followers: 0,
    posts: 0,
    engagementRate: 0,
  },
  {
    platform: 'Twitter',
    followers: 0,
    posts: 0,
    engagementRate: 0,
  },
  {
    platform: 'Facebook',
    followers: 0,
    posts: 0,
    engagementRate: 0,
  },
  {
    platform: 'Pinterest',
    followers: 0,
    posts: 0,
    engagementRate: 0,
  },
];

const FOLLOWER_GROWTH_DATA: { month: string; Instagram: number; Twitter: number; Facebook: number; Pinterest: number }[] = [];

const BEST_TIMES = [
  {
    platform: 'Instagram',
    times: ['N/A'],
    badgeClass: PLATFORM_CONFIG.Instagram.badgeClass,
    icon: PLATFORM_CONFIG.Instagram.icon,
  },
  {
    platform: 'Facebook',
    times: ['N/A'],
    badgeClass: PLATFORM_CONFIG.Facebook.badgeClass,
    icon: PLATFORM_CONFIG.Facebook.icon,
  },
  {
    platform: 'Twitter',
    times: ['N/A'],
    badgeClass: PLATFORM_CONFIG.Twitter.badgeClass,
    icon: PLATFORM_CONFIG.Twitter.icon,
  },
  {
    platform: 'Pinterest',
    times: ['N/A'],
    badgeClass: PLATFORM_CONFIG.Pinterest.badgeClass,
    icon: PLATFORM_CONFIG.Pinterest.icon,
  },
];

// Gold palette for stacked bars
const BAR_COLORS = {
  Likes: '#D4A843',
  Comments: '#E8C46A',
  Shares: '#F5ECD0',
  Saves: '#B8922F',
};

// ─── Custom Tooltip ──────────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#2a2520] bg-[#111111] px-3 py-2 shadow-xl">
      <p className="mb-1.5 text-xs font-medium text-[#f5f0e8]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#9a9080]">{entry.name}:</span>
          <span className="font-medium text-[#f5f0e8]">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="mb-1.5 h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="gold-card border-0">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="size-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Platform cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="gold-card border-0">
            <CardContent className="p-5">
              <Skeleton className="mb-4 h-5 w-28" />
              <Skeleton className="mb-2 h-7 w-24" />
              <Skeleton className="mb-1 h-3.5 w-32" />
              <Skeleton className="mb-3 h-3.5 w-20" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="gold-card border-0">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card className="gold-card border-0">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-56" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
      {/* Table + Best Time */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="gold-card border-0 lg:col-span-2">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
        <Card className="gold-card border-0">
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Time Slot Visual ────────────────────────────────────────────────
const HOURS = [
  '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
  '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM',
  '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM',
];

function isOptimal(hour: string, times: string[]): boolean {
  const hourNum = parseInt(hour, 10);
  let startAM = 0, startPM = 0;
  // Parse time ranges
  for (const t of times) {
    const parts = t.split('–').map((s) => s.trim());
    if (parts.length !== 2) continue;
    const [s, e] = parts.map((p) => {
      const [num, ampm] = p.split(' ');
      let h = parseInt(num, 10);
      if (ampm === 'PM' && h !== 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return h;
    });
    if (s > e) {
      // Spans midnight (not in our data but handle)
      if (hourNum >= s || hourNum < e) return true;
    } else {
      if (hourNum >= s && hourNum < e) return true;
    }
  }
  return false;
}

function formatHour(h: string): string {
  return h;
}

// ─── Main Component ──────────────────────────────────────────────────
export default function SocialAnalyticsTab() {
  const [data, setData] = useState<SocialData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/marketing/social-posts');
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setData(json);
    } catch {
      // Silently handle – use mock data for charts
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Derived data ──

  // Engagement breakdown per platform (from API data, fallback to mock)
  const engagementByPlatform = useMemo(() => {
    const platforms = ['Instagram', 'Twitter', 'Facebook', 'Pinterest'];
    if (data && data.posts.length > 0) {
      return platforms.map((p) => {
        const posts = data.posts.filter((post) => post.platform === p && post.status === 'published');
        return {
          platform: p,
          Likes: posts.reduce((s, post) => s + post.likes, 0),
          Comments: posts.reduce((s, post) => s + post.comments, 0),
          Shares: posts.reduce((s, post) => s + post.shares, 0),
          Saves: posts.reduce((s, post) => s + post.saves, 0),
        };
      });
    }
    // Fallback: no data
    return [
      { platform: 'Instagram', Likes: 0, Comments: 0, Shares: 0, Saves: 0 },
      { platform: 'Twitter', Likes: 0, Comments: 0, Shares: 0, Saves: 0 },
      { platform: 'Facebook', Likes: 0, Comments: 0, Shares: 0, Saves: 0 },
      { platform: 'Pinterest', Likes: 0, Comments: 0, Shares: 0, Saves: 0 },
    ];
  }, [data]);

  // Top performing posts (from API, sorted by total engagement)
  const topPosts = useMemo(() => {
    if (!data || data.posts.length === 0) return [];
    return data.posts
      .filter((p) => p.status === 'published')
      .map((p) => ({
        ...p,
        totalEngagement: p.likes + p.comments + p.shares + p.saves,
      }))
      .sort((a, b) => b.totalEngagement - a.totalEngagement);
  }, [data]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Social Analytics</h2>
        <p className="text-sm text-muted-foreground">Deep dive into social media performance</p>
      </div>

      {/* ── Top Stats Row ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TOP_STATS.map((stat) => (
          <Card key={stat.label} className="gold-card border-0 gold-shimmer">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-foreground gold-glow">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {stat.positive === true && (
                      <ArrowUpRight className="size-3.5 text-emerald-400" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        stat.positive === true
                          ? 'text-emerald-400'
                          : stat.positive === false
                            ? 'text-red-400'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[rgba(212,168,67,0.12)] text-[#D4A843]">
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Platform Comparison Cards ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLATFORM_STATS.map((p) => {
          const config = PLATFORM_CONFIG[p.platform] || PLATFORM_CONFIG.Instagram;
          return (
            <Card key={p.platform} className="gold-card border-0">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2.5">
                  <div
                    className="flex size-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                  >
                    {config.icon}
                  </div>
                  <span className="text-sm font-semibold text-foreground">{config.name}</span>
                </div>
                <p className="mb-1 text-xl font-bold text-foreground gold-glow">
                  {p.followers.toLocaleString()}
                </p>
                <p className="mb-3 text-xs text-muted-foreground">
                  {p.posts} {p.posts === 1 ? 'post' : 'posts'} this month
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Engagement Rate</span>
                    <span className="font-semibold text-[#D4A843]">{p.engagementRate}%</span>
                  </div>
                  <Progress
                    value={p.engagementRate * 10}
                    className="h-1.5 bg-[#1a1a1a]"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Engagement Breakdown Chart */}
        <Card className="gold-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Engagement Breakdown
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Likes, comments, shares &amp; saves by platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={engagementByPlatform}
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2520" vertical={false} />
                  <XAxis
                    dataKey="platform"
                    tick={{ fill: '#9a9080', fontSize: 12 }}
                    axisLine={{ stroke: '#2a2520' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#9a9080', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'rgba(212, 168, 67, 0.05)' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: '#9a9080' }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar dataKey="Likes" stackId="a" fill={BAR_COLORS.Likes} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Comments" stackId="a" fill={BAR_COLORS.Comments} />
                  <Bar dataKey="Shares" stackId="a" fill={BAR_COLORS.Shares} />
                  <Bar dataKey="Saves" stackId="a" fill={BAR_COLORS.Saves} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Follower Growth Chart */}
        <Card className="gold-card border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Follower Growth
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Last 6 months follower trend per platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={FOLLOWER_GROWTH_DATA}
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="gradInstagram" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PLATFORM_CONFIG.Instagram.areaColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={PLATFORM_CONFIG.Instagram.areaColor} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradTwitter" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PLATFORM_CONFIG.Twitter.areaColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={PLATFORM_CONFIG.Twitter.areaColor} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradFacebook" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PLATFORM_CONFIG.Facebook.areaColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={PLATFORM_CONFIG.Facebook.areaColor} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradPinterest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PLATFORM_CONFIG.Pinterest.areaColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={PLATFORM_CONFIG.Pinterest.areaColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2520" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#9a9080', fontSize: 12 }}
                    axisLine={{ stroke: '#2a2520' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#9a9080', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                    width={40}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: '#9a9080' }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Area
                    type="monotone"
                    dataKey="Instagram"
                    stroke={PLATFORM_CONFIG.Instagram.areaColor}
                    fill="url(#gradInstagram)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Twitter"
                    stroke={PLATFORM_CONFIG.Twitter.areaColor}
                    fill="url(#gradTwitter)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Facebook"
                    stroke={PLATFORM_CONFIG.Facebook.areaColor}
                    fill="url(#gradFacebook)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Pinterest"
                    stroke={PLATFORM_CONFIG.Pinterest.areaColor}
                    fill="url(#gradPinterest)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Table + Best Time to Post ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Top Performing Posts Table */}
        <Card className="gold-card border-0 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Top Performing Posts
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Published posts ranked by total engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="gold-table-header hover:bg-transparent">
                    <TableHead className="text-xs font-semibold text-[#9a9080]">Platform</TableHead>
                    <TableHead className="text-xs font-semibold text-[#9a9080]">Content</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-[#9a9080]">
                      <Heart className="mr-1 inline size-3" />
                      Likes
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold text-[#9a9080]">
                      <MessageCircle className="mr-1 inline size-3" />
                      Comments
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold text-[#9a9080]">
                      <Share2 className="mr-1 inline size-3" />
                      Shares
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold text-[#9a9080]">
                      <Bookmark className="mr-1 inline size-3" />
                      Saves
                    </TableHead>
                    <TableHead className="text-right text-xs font-semibold text-[#9a9080]">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-xs text-muted-foreground">
                        No published posts yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    topPosts.map((post, idx) => {
                      const config = PLATFORM_CONFIG[post.platform] || PLATFORM_CONFIG.Instagram;
                      return (
                        <TableRow
                          key={post.id}
                          className={
                            idx === 0
                              ? 'border-b border-[#2a2520] border-l-2 border-l-[#D4A843] bg-[rgba(212,168,67,0.04)]'
                              : 'border-b border-[#2a2520]'
                          }
                        >
                          <TableCell className="py-3 pr-3">
                            <Badge
                              variant="outline"
                              className={`gap-1.5 text-[10px] font-medium ${config.badgeClass}`}
                            >
                              {config.icon}
                              {config.name}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate py-3 pr-3 text-xs text-[#f5f0e8]">
                            {post.content || '—'}
                          </TableCell>
                          <TableCell className="py-3 text-right text-xs font-medium text-[#f5f0e8]">
                            {post.likes.toLocaleString()}
                          </TableCell>
                          <TableCell className="py-3 text-right text-xs font-medium text-[#f5f0e8]">
                            {post.comments.toLocaleString()}
                          </TableCell>
                          <TableCell className="py-3 text-right text-xs font-medium text-[#f5f0e8]">
                            {post.shares.toLocaleString()}
                          </TableCell>
                          <TableCell className="py-3 text-right text-xs font-medium text-[#f5f0e8]">
                            {post.saves.toLocaleString()}
                          </TableCell>
                          <TableCell className="py-3 text-right text-xs font-bold text-[#D4A843]">
                            {post.totalEngagement.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Best Time to Post */}
        <Card className="gold-card border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-[#D4A843]" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Best Time to Post
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Optimal posting windows per platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {BEST_TIMES.map((bt) => (
                <div
                  key={bt.platform}
                  className="rounded-lg border border-[#2a2520] bg-[#0d0d0d] p-3.5"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`gap-1.5 text-[10px] font-medium ${bt.badgeClass}`}
                    >
                      {bt.icon}
                      {bt.platform}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {bt.times.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-md bg-[rgba(212,168,67,0.1)] px-2.5 py-1 text-xs font-medium text-[#D4A843] border border-[rgba(212,168,67,0.2)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {/* Timeline Visual */}
              <div className="mt-5 rounded-lg border border-[#2a2520] bg-[#0d0d0d] p-3.5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Daily Schedule Overview
                </p>
                <div className="relative">
                  {/* Hour grid */}
                  <div className="flex gap-0.5">
                    {HOURS.map((hour) => {
                      // Check if any platform is optimal at this hour
                      const activePlatforms = BEST_TIMES.filter((bt) =>
                        isOptimal(hour, bt.times)
                      );
                      const isAny = activePlatforms.length > 0;

                      return (
                        <div
                          key={hour}
                          className="group relative flex flex-1 flex-col items-center"
                        >
                          {/* Bar */}
                          <div
                            className="mb-1 w-full rounded-sm transition-all"
                            style={{
                              height: isAny ? `${12 + activePlatforms.length * 8}px` : '4px',
                              backgroundColor: isAny
                                ? 'rgba(212, 168, 67, 0.5)'
                                : 'rgba(42, 37, 32, 0.6)',
                            }}
                          />
                          {/* Label */}
                          <span
                            className={`text-center text-[8px] leading-tight ${
                              isAny ? 'font-semibold text-[#D4A843]' : 'text-[#4a4538]'
                            }`}
                          >
                            {hour.replace(' ', '')}
                          </span>
                          {/* Tooltip */}
                          {isAny && (
                            <div className="pointer-events-none absolute -top-16 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-[#2a2520] bg-[#111111] px-2 py-1 text-[9px] text-[#f5f0e8] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                              {activePlatforms.map((p) => p.platform).join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}