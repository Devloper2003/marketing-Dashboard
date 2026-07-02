'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Share2,
  Plus,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Activity,
  Eye,
  Clock,
  Link2,
  Unlink,
  Settings,
  ArrowUpRight,
  MessageSquare,
  Repeat2,
  Heart,
  Play,
  Camera,
  Megaphone,
  Award,
  Zap,
  Globe,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';

/* ──────────── Types ──────────── */
interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  avatar: string | null;
  followers: number;
  following?: number;
  posts?: number;
  engagementRate: number;
  reach?: number;
  impressions?: number;
  profileViews?: number;
  websiteClicks?: number;
  monthlyGrowth: number;
  topHashtag?: string;
  connected: boolean;
  connectedAt: string | null;
  lastSync: string | null;
  category?: string;
  bio?: string;
  subscribers?: number;
  videos?: number;
  views?: number;
  watchHours?: number;
  topVideo?: string;
  pageLikes?: number;
  tweets?: number;
  adAccounts?: number;
  activeCampaigns?: number;
  totalSpend?: number;
}

interface GrowthDataPoint {
  month: string;
  Instagram: number;
  YouTube: number;
  Facebook: number;
  Twitter: number;
  LinkedIn: number;
}

interface ActivityItem {
  platform: string;
  type: string;
  content: string;
  time: string;
  metric: string;
  change: string;
}

interface TopContentItem {
  platform: string;
  type: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  date: string;
  image: string | null;
}

interface SocialAccountsData {
  accounts: SocialAccount[];
  growthData: GrowthDataPoint[];
  recentActivity: ActivityItem[];
  topContent: TopContentItem[];
}

/* ──────────── Helpers ──────────── */
function formatINR(num: number): string {
  if (num >= 10000000) return (num / 10000000).toFixed(2) + ' Cr';
  if (num >= 100000) return (num / 100000).toFixed(2) + ' L';
  if (num >= 1000) return num.toLocaleString('en-IN');
  return num.toString();
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

/* Platform config */
const platformConfig: Record<string, { color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }>; gradient: string }> = {
  Instagram: { color: '#E1306C', bg: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]', border: 'border-[#DD2A7B]/30', icon: Camera, gradient: 'from-[#F58529] via-[#DD2A7B] to-[#8134AF]' },
  YouTube: { color: '#FF0000', bg: 'bg-red-600', border: 'border-red-500/30', icon: Play, gradient: 'from-red-500 to-red-700' },
  Facebook: { color: '#1877F2', bg: 'bg-blue-600', border: 'border-blue-500/30', icon: Globe, gradient: 'from-blue-500 to-blue-700' },
  'Meta Business': { color: '#0668E1', bg: 'bg-[#0668E1]', border: 'border-[#0668E1]/30', icon: Megaphone, gradient: 'from-[#1877F2] to-[#0054D6]' },
  Twitter: { color: '#1DA1F2', bg: 'bg-sky-500', border: 'border-sky-400/30', icon: MessageSquare, gradient: 'from-sky-400 to-sky-600' },
  LinkedIn: { color: '#0A66C2', bg: 'bg-[#0A66C2]', border: 'border-[#0A66C2]/30', icon: Users, gradient: 'from-[#0A66C2] to-[#004182]' },
};

const activityTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  post: Camera,
  video: Play,
  campaign: Megaphone,
  tweet: MessageSquare,
  story: Eye,
  ad: Zap,
  milestone: Award,
};

const typeColors: Record<string, string> = {
  Reel: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  Post: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Video: 'bg-red-500/15 text-red-400 border-red-500/30',
  Tweet: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
};

const growthChartColors: Record<string, string> = {
  Instagram: '#E1306C',
  YouTube: '#FF4444',
  Facebook: '#4A90D9',
  Twitter: '#38BDF8',
  LinkedIn: '#6B9FD4',
};

/* ──────────── Skeleton ──────────── */
function TabSkeleton() {
  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/* ──────────── Main Component ──────────── */
export default function SocialAccountsTab() {
  const [data, setData] = useState<SocialAccountsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [manageAccount, setManageAccount] = useState<SocialAccount | null>(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/social-accounts');
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Failed to load social accounts data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDisconnect = async (accountId: string, platform: string) => {
    try {
      const res = await fetch('/api/marketing/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect', accountId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`${platform} disconnected successfully`);
        setManageAccount(null);
        fetchData();
      }
    } catch {
      toast.error('Failed to disconnect account');
    }
  };

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/marketing/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Account connected successfully');
        setConnectDialogOpen(false);
        fetchData();
      }
    } catch {
      toast.error('Failed to connect account');
    }
  };

  const totalFollowers = data ? data.accounts.reduce((sum, a) => sum + a.followers, 0) : 0;
  const connectedCount = data ? data.accounts.filter(a => a.connected).length : 0;
  const avgEngagement = data
    ? data.accounts.filter(a => a.connected && a.engagementRate > 0).reduce((sum, a) => sum + a.engagementRate, 0) / Math.max(1, data.accounts.filter(a => a.connected && a.engagementRate > 0).length)
    : 0;
  const avgGrowth = data
    ? data.accounts.filter(a => a.connected && a.monthlyGrowth > 0).reduce((sum, a) => sum + a.monthlyGrowth, 0) / Math.max(1, data.accounts.filter(a => a.connected && a.monthlyGrowth > 0).length)
    : 0;

  if (loading) return <TabSkeleton />;
  if (!data) return <div className="p-8 text-center text-muted-foreground">Failed to load data</div>;

  /* ──────────── Account Card ──────────── */
  const AccountCard = ({ account }: { account: SocialAccount }) => {
    const config = platformConfig[account.platform] || { color: '#D4A843', bg: 'bg-[#D4A843]', border: 'border-[#D4A843]/30', icon: Globe, gradient: 'from-[#D4A843] to-[#B8912E]' };
    const PlatformIcon = config.icon;
    const isMeta = account.platform === 'Meta Business';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: parseInt(account.id) * 0.08 }}
        className="premium-card hover-sweep group relative overflow-hidden"
      >
        {/* Top accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />

        <CardContent className="p-5 pt-6">
          {/* Header row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-offset-background" style={{ ringColor: config.color }}>
                <AvatarFallback className={`bg-gradient-to-br ${config.gradient} text-white font-bold text-lg`}>
                  {account.platform.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <PlatformIcon className="h-4 w-4" style={{ color: config.color }} />
                  <h3 className="font-semibold text-foreground text-sm">{account.platform}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{account.handle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {account.connected ? (
                <Badge className="badge-dot-green text-[10px] px-2 py-0.5">Connected</Badge>
              ) : (
                <Badge className="badge-dot-yellow text-[10px] px-2 py-0.5">Disconnected</Badge>
              )}
            </div>
          </div>

          {/* Sync info */}
          {account.lastSync && (
            <div className="flex items-center gap-1.5 mb-4 text-[11px] text-muted-foreground/70">
              <RefreshCw className="h-3 w-3" />
              <span>Last synced: {account.lastSync}</span>
            </div>
          )}

          <Separator className="mb-4 opacity-30" />

          {/* Metrics */}
          {isMeta ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Ad Accounts</span>
                <span className="text-sm font-semibold text-foreground">{account.adAccounts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Active Campaigns</span>
                <span className="text-sm font-semibold text-foreground">{account.activeCampaigns}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Spend</span>
                <span className="text-sm font-semibold gold-gradient-text">₹{formatINR(account.totalSpend || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Category</span>
                <Badge variant="outline" className="text-[10px] border-[#D4A843]/30 text-[#D4A843]">{account.category}</Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{account.platform === 'YouTube' ? 'Subscribers' : 'Followers'}</span>
                <span className="text-sm font-semibold text-foreground">{formatNumber(account.followers || account.subscribers || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Engagement</span>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-[#D4A843]" />
                  <span className="text-sm font-semibold text-[#D4A843]">{account.engagementRate}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Monthly Growth</span>
                <div className="flex items-center gap-1">
                  {account.monthlyGrowth > 0 ? (
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  )}
                  <span className={`text-sm font-semibold ${account.monthlyGrowth > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {account.monthlyGrowth > 0 ? '+' : ''}{account.monthlyGrowth}%
                  </span>
                </div>
              </div>
              {account.topHashtag && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Top Hashtag</span>
                  <span className="text-xs font-medium text-[#D4A843]/80">{account.topHashtag}</span>
                </div>
              )}
              {account.topVideo && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Top Video</span>
                  <span className="text-xs font-medium text-foreground/80 truncate max-w-[140px]">{account.topVideo}</span>
                </div>
              )}
              {account.views && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Views</span>
                  <span className="text-sm font-semibold text-foreground">{formatNumber(account.views)}</span>
                </div>
              )}
            </div>
          )}

          <Separator className="my-4 opacity-30" />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs h-8 border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10 focus-gold"
              onClick={() => setManageAccount(account)}
            >
              <Settings className="h-3 w-3 mr-1" />
              Manage
            </Button>
            {account.connected && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                onClick={() => handleDisconnect(account.id, account.platform)}
              >
                <Unlink className="h-3 w-3 mr-1" />
                Disconnect
              </Button>
            )}
          </div>
        </CardContent>
      </motion.div>
    );
  };

  /* ──────────── Activity Feed ──────────── */
  const ActivityFeed = () => (
    <Card className="premium-card">
      <CardHeader className="pb-3">
        <CardTitle className="section-heading text-sm flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#D4A843]" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {data.recentActivity.map((item, idx) => {
            const config = platformConfig[item.platform];
            const TypeIcon = activityTypeIcons[item.type] || Activity;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.06 }}
                className="relative flex gap-3 py-3 group"
              >
                {/* Timeline line */}
                {idx < data.recentActivity.length - 1 && (
                  <div className="absolute left-[15px] top-[32px] bottom-0 w-px bg-border/40" />
                )}
                {/* Dot + Icon */}
                <div className="relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${config?.color || '#D4A843'}20`, border: `1.5px solid ${config?.color || '#D4A843'}40` }}>
                  <TypeIcon className="h-3.5 w-3.5" style={{ color: config?.color || '#D4A843' }} />
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/90 leading-relaxed line-clamp-2">{item.content}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] font-medium" style={{ color: config?.color }}>{item.platform}</span>
                    <span className="text-[11px] text-muted-foreground">{item.metric}</span>
                    {item.change && (
                      <span className={`text-[11px] font-medium ${item.change.startsWith('+') ? 'text-emerald-400' : ''}`}>
                        {item.change}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground/60 ml-auto">{item.time}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  /* ──────────── Overview Stats ──────────── */
  const OverviewStats = () => [
    { label: 'Total Followers', value: formatNumber(totalFollowers), icon: Users, color: 'text-[#D4A843]' },
    { label: 'Avg Engagement Rate', value: `${avgEngagement.toFixed(1)}%`, icon: Activity, color: 'text-[#D4A843]' },
    { label: 'Avg Monthly Growth', value: `+${avgGrowth.toFixed(1)}%`, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Accounts Connected', value: `${connectedCount}/${data.accounts.length}`, icon: Link2, color: 'text-sky-400' },
  ].map((stat, i) => (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.4 + i * 0.08 }}
    >
      <Card className="premium-card card-hover-border">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-[#D4A843]/10 flex items-center justify-center shrink-0">
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  ));

  /* ──────────── Content Performance ──────────── */
  const contentBreakdown = [
    { name: 'Reels', value: 35, color: '#E1306C' },
    { name: 'Posts', value: 25, color: '#4A90D9' },
    { name: 'Videos', value: 20, color: '#FF4444' },
    { name: 'Tweets', value: 12, color: '#38BDF8' },
    { name: 'Stories', value: 8, color: '#D4A843' },
  ];

  const ContentPerformance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Top content cards */}
        <div className="lg:col-span-2 space-y-3">
          {data.topContent.map((item, idx) => {
            const config = platformConfig[item.platform];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
              >
                <Card className="premium-card card-hover-border group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`text-[10px] px-2 py-0 ${typeColors[item.type] || 'bg-muted text-muted-foreground'}`}>
                          {item.type}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] px-2 py-0 border-border/50 text-muted-foreground">
                          {item.platform}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground/60">{item.date}</span>
                    </div>
                    <p className="text-sm text-foreground/85 leading-relaxed line-clamp-2 mb-3">{item.caption}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-pink-400" />
                        {formatNumber(item.likes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3 text-sky-400" />
                        {formatNumber(item.comments)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="h-3 w-3 text-emerald-400" />
                        {formatNumber(item.shares)}
                      </span>
                      <span className="ml-auto font-medium" style={{ color: config?.color || '#D4A843' }}>
                        {formatNumber(item.likes + item.comments + item.shares)} total
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Pie chart */}
        <div>
          <Card className="premium-card">
            <CardHeader className="pb-2">
              <CardTitle className="section-heading text-sm">Content Type Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-container h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contentBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {contentBreakdown.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} opacity={0.85} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(212,168,67,0.2)', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#e5e5e5' }}
                      formatter={(value: number) => [`${value}%`, '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-2">
                {contentBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  /* ──────────── Growth Analytics ──────────── */
  const GrowthAnalytics = () => {
    const platforms = ['Instagram', 'YouTube', 'Facebook', 'Twitter', 'LinkedIn'];
    return (
      <div className="space-y-6">
        {/* Multi-platform area chart */}
        <Card className="premium-card">
          <CardHeader className="pb-2">
            <CardTitle className="section-heading text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#D4A843]" />
              Follower Growth — 6 Month Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    {platforms.map((p) => (
                      <linearGradient key={p} id={`grad-${p}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={growthChartColors[p]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={growthChartColors[p]} stopOpacity={0.02} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} />
                  <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.5)' }} tickFormatter={(v) => formatNumber(v)} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(212,168,67,0.2)', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#e5e5e5' }}
                    formatter={(value: number, name: string) => [formatNumber(value), name]}
                    labelStyle={{ color: '#D4A843' }}
                  />
                  {platforms.map((p) => (
                    <Area
                      key={p}
                      type="monotone"
                      dataKey={p}
                      stroke={growthChartColors[p]}
                      strokeWidth={2}
                      fill={`url(#grad-${p})`}
                      dot={{ r: 3, fill: growthChartColors[p], strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: growthChartColors[p], strokeWidth: 2, stroke: '#0a0a0a' }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-border/20">
              {platforms.map((p) => (
                <div key={p} className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: growthChartColors[p] }} />
                  <span className="text-xs text-muted-foreground">{p}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison table */}
        <Card className="premium-card">
          <CardHeader className="pb-3">
            <CardTitle className="section-heading text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#D4A843]" />
              Platform Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[320px]">
              <div className="min-w-[600px]">
                {/* Table header */}
                <div className="grid grid-cols-5 gap-4 px-4 py-2.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border/30">
                  <span>Platform</span>
                  <span className="text-right">Followers</span>
                  <span className="text-right">Growth Rate</span>
                  <span className="text-right">Engagement</span>
                  <span className="text-right">Best Content</span>
                </div>
                {/* Table rows */}
                {data.accounts.filter(a => a.platform !== 'Meta Business').map((account, idx) => {
                  const config = platformConfig[account.platform];
                  return (
                    <motion.div
                      key={account.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.06 }}
                      className="grid grid-cols-5 gap-4 px-4 py-3 text-sm table-row-hover rounded-lg"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${config?.color}15` }}>
                          <config.icon className="h-3.5 w-3.5" style={{ color: config?.color }} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-xs">{account.platform}</p>
                          <p className="text-[10px] text-muted-foreground">{account.handle}</p>
                        </div>
                      </div>
                      <div className="text-right self-center">
                        <span className="font-semibold text-foreground text-xs">{formatNumber(account.followers)}</span>
                      </div>
                      <div className="text-right self-center">
                        <span className={`text-xs font-medium ${account.monthlyGrowth >= 3 ? 'text-emerald-400' : account.monthlyGrowth >= 2 ? 'text-yellow-400' : 'text-orange-400'}`}>
                          +{account.monthlyGrowth}%
                        </span>
                      </div>
                      <div className="text-right self-center">
                        <span className="text-xs font-medium text-[#D4A843]">{account.engagementRate}%</span>
                      </div>
                      <div className="text-right self-center">
                        <Badge variant="outline" className="text-[10px] border-border/40 text-muted-foreground">
                          {account.platform === 'YouTube' ? 'Videos' : account.platform === 'Twitter' ? 'Tweets' : 'Reels'}
                        </Badge>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  /* ──────────── Render ──────────── */
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-[#D4A843]/15">
            <Share2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Social Media Hub</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatNumber(totalFollowers)} total followers across {data.accounts.length} platforms
            </p>
          </div>
        </div>
        <Button className="btn-gold h-9 text-sm" onClick={() => setConnectDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Connect Account
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="bg-background/50 border border-border/30 p-1 h-10">
          <TabsTrigger value="accounts" className="text-xs h-8 px-4 data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843]">
            Connected Accounts
          </TabsTrigger>
          <TabsTrigger value="content" className="text-xs h-8 px-4 data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843]">
            Content Performance
          </TabsTrigger>
          <TabsTrigger value="growth" className="text-xs h-8 px-4 data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843]">
            Growth Analytics
          </TabsTrigger>
        </TabsList>

        {/* A. Connected Accounts */}
        <TabsContent value="accounts" className="space-y-6 mt-4">
          {/* Account cards grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <OverviewStats />
          </div>

          {/* Activity Feed */}
          <ActivityFeed />
        </TabsContent>

        {/* C. Content Performance */}
        <TabsContent value="content" className="mt-4">
          <ContentPerformance />
        </TabsContent>

        {/* D. Growth Analytics */}
        <TabsContent value="growth" className="mt-4">
          <GrowthAnalytics />
        </TabsContent>
      </Tabs>

      {/* Manage Account Dialog */}
      <Dialog open={!!manageAccount} onOpenChange={() => setManageAccount(null)}>
        <DialogContent className="max-w-md glass-premium border-[#D4A843]/20">
          <DialogHeader>
            <DialogTitle className="section-heading text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-[#D4A843]" />
              Manage {manageAccount?.platform}
            </DialogTitle>
          </DialogHeader>
          {manageAccount && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={`bg-gradient-to-br ${(platformConfig[manageAccount.platform]?.gradient || 'from-[#D4A843] to-[#B8912E]')} text-white font-bold`}>
                    {manageAccount.platform.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm text-foreground">{manageAccount.platform}</p>
                  <p className="text-xs text-muted-foreground">{manageAccount.handle}</p>
                </div>
                {manageAccount.connected ? (
                  <Badge className="badge-dot-green text-[10px] ml-auto">Connected</Badge>
                ) : (
                  <Badge className="badge-dot-yellow text-[10px] ml-auto">Disconnected</Badge>
                )}
              </div>

              {manageAccount.bio && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Bio</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">{manageAccount.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/20">
                  <p className="text-[11px] text-muted-foreground">Connected Since</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{manageAccount.connectedAt || '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/20">
                  <p className="text-[11px] text-muted-foreground">Category</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{manageAccount.category || '—'}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 btn-gold h-9 text-xs">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Sync Now
                </Button>
                {manageAccount.connected && (
                  <Button
                    variant="outline"
                    className="flex-1 h-9 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDisconnect(manageAccount.id, manageAccount.platform)}
                  >
                    <Unlink className="h-3 w-3 mr-1" />
                    Disconnect
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Connect Account Dialog */}
      <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
        <DialogContent className="max-w-md glass-premium border-[#D4A843]/20">
          <DialogHeader>
            <DialogTitle className="section-heading text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-[#D4A843]" />
              Connect Social Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Choose a platform to connect to your Laxree marketing dashboard.</p>
            <div className="space-y-2">
              {['Pinterest', 'TikTok', 'Snapchat'].map((platform) => (
                <Button
                  key={platform}
                  variant="outline"
                  className="w-full justify-start h-10 border-border/30 hover:border-[#D4A843]/30 hover:bg-[#D4A843]/5 text-sm"
                  onClick={handleConnect}
                >
                  <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
                  {platform}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}