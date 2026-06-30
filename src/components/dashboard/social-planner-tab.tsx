'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Plus,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Edit3,
  Trash2,
  Copy,
  Instagram,
  Facebook,
  Twitter,
  Megaphone,
  Users,
  ThumbsUp,
  TrendingUp,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

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
  createdAt: string;
  updatedAt: string;
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
const PLATFORM_TABS = ['all', 'instagram', 'facebook', 'twitter', 'pinterest'];
const STATUS_FILTERS = ['all', 'published', 'scheduled', 'draft'];

const PLATFORM_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string; bgClass: string; followers: string; handle: string }
> = {
  instagram: {
    icon: <Instagram className="size-4" />,
    color: '#E1306C',
    bgClass: 'bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] text-white',
    followers: '135K',
    handle: '@laxree.jewels',
  },
  facebook: {
    icon: <Facebook className="size-4" />,
    color: '#1877F2',
    bgClass: 'bg-[#1877F2] text-white',
    followers: '28.9K',
    handle: 'Laxree Jewels',
  },
  twitter: {
    icon: <Twitter className="size-4" />,
    color: '#D4A843',
    bgClass: 'bg-[#1a1a1a] border border-[#D4A843] text-[#D4A843]',
    followers: '45K',
    handle: '@laxree',
  },
  pinterest: {
    icon: <Megaphone className="size-4" />,
    color: '#E60023',
    bgClass: 'bg-[#E60023] text-white',
    followers: '12.8K',
    handle: 'LaxreeJewels',
  },
};

const PLATFORM_STATUS_BADGE: Record<string, string> = {
  instagram: 'bg-gradient-to-r from-[#f09433] via-[#e6683c] to-[#bc1888] text-white border-none',
  facebook: 'bg-[#1877F2] text-white border-none',
  twitter: 'bg-[#1a1a1a] text-[#D4A843] border border-[#D4A843]',
  pinterest: 'bg-[#E60023] text-white border-none',
};

const POST_STATUS_BADGE: Record<string, string> = {
  published: 'badge-green',
  scheduled: 'badge-blue',
  draft: 'badge-red',
};

const MAX_CHAR = 280;

// ─── Main Component ──────────────────────────────────────────────────
export default function SocialPlannerTab() {
  const [data, setData] = useState<SocialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [platformTab, setPlatformTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formPlatform, setFormPlatform] = useState('instagram');
  const [formContent, setFormContent] = useState('');
  const [formScheduleDate, setFormScheduleDate] = useState('');
  const [formScheduleTime, setFormScheduleTime] = useState('12:00');
  const [formStatus, setFormStatus] = useState('draft');

  // AI Generator state
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiPlatform, setAiPlatform] = useState('Instagram');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/marketing/social-posts');
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Failed to load social posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    if (!data) return [];
    return data.posts.filter((post) => {
      if (platformTab !== 'all' && post.platform.toLowerCase() !== platformTab) return false;
      if (statusFilter !== 'all' && post.status !== statusFilter) return false;
      return true;
    });
  }, [data, platformTab, statusFilter]);

  // Platform stats computed from data
  const platformStats = useMemo(() => {
    if (!data) return {};
    const stats: Record<string, { posts: number; engagement: number; rate: string }> = {};
    const keys = ['instagram', 'facebook', 'twitter', 'pinterest'];
    const followers: Record<string, number> = {
      instagram: 135000,
      facebook: 28900,
      twitter: 45000,
      pinterest: 12800,
    };

    keys.forEach((key) => {
      const posts = data.posts.filter((p) => p.platform.toLowerCase() === key);
      const published = posts.filter((p) => p.status === 'published');
      const totalEng = published.reduce((s, p) => s + p.likes + p.comments + p.shares + p.saves, 0);
      const avgRate =
        published.length > 0
          ? ((totalEng / published.length / followers[key]) * 100).toFixed(2)
          : '0.00';
      stats[key] = { posts: posts.length, engagement: totalEng, rate: avgRate };
    });

    return stats;
  }, [data]);

  // Engagement chart data
  const engagementChartData = useMemo(() => {
    return ['instagram', 'facebook', 'twitter', 'pinterest'].map((key) => ({
      platform: key.charAt(0).toUpperCase() + key.slice(1),
      engagement: platformStats[key]?.engagement || 0,
    }));
  }, [platformStats]);

  const chartConfig = {
    engagement: { label: 'Engagement', color: '#D4A843' },
  };

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formContent.trim()) {
      toast.error('Please enter post content');
      return;
    }
    try {
      setSubmitting(true);
      const scheduledAt =
        formScheduleDate && formScheduleTime
          ? `${formScheduleDate}T${formScheduleTime}:00`
          : null;

      const res = await fetch('/api/marketing/social-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: formPlatform,
          content: formContent,
          status: formStatus,
          scheduledAt,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Post created successfully');
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch {
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormPlatform('instagram');
    setFormContent('');
    setFormScheduleDate('');
    setFormScheduleTime('12:00');
    setFormStatus('draft');
  };

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) { toast.error('Enter a topic for the AI'); return; }
    try {
      setAiGenerating(true);
      setAiResult('');
      const res = await fetch('/api/marketing/ai-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: aiPlatform, topic: aiTopic, tone: aiTone || undefined }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setAiResult(json.posts);
      toast.success('Posts generated!');
    } catch {
      toast.error('Failed to generate posts');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleDuplicate = (post: SocialPost) => {
    setFormPlatform(post.platform);
    setFormContent(post.content || '');
    setFormStatus('draft');
    setFormScheduleDate('');
    setFormScheduleTime('12:00');
    setDialogOpen(true);
  };

  const formatEngagement = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold gold-gradient-text">Social Media Planner</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Plan, schedule and track your jewellery brand social content
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="gap-2 bg-[#D4A843] text-[#0a0a0a] hover:bg-[#E8C46A] font-semibold"
        >
          <Plus className="size-4" />
          Create Post
        </Button>
      </div>

      {/* Platform Tabs */}
      <Tabs value={platformTab} onValueChange={setPlatformTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="bg-[#1a1a1a] border border-[#2a2520]">
            {PLATFORM_TABS.map((p) => (
              <TabsTrigger
                key={p}
                value={p}
                className="capitalize data-[state=active]:bg-[#D4A843] data-[state=active]:text-[#0a0a0a] transition-colors"
              >
                {p}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            {STATUS_FILTERS.map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? 'default' : 'outline'}
                size="sm"
                className={
                  statusFilter === s
                    ? 'bg-[#D4A843] text-[#0a0a0a] hover:bg-[#E8C46A] capitalize'
                    : 'border-[#2a2520] text-muted-foreground hover:text-[#D4A843] hover:border-[#D4A843] capitalize'
                }
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        {/* Platform Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {(['instagram', 'facebook', 'twitter', 'pinterest'] as const).map((key) => {
              const cfg = PLATFORM_CONFIG[key];
              const stat = platformStats[key];
              if (!cfg || !stat) return null;
              return (
                <div key={key} className="gold-card gold-shimmer rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bgClass}`}
                    >
                      {cfg.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-sm capitalize">{key}</div>
                      <div className="text-xs text-muted-foreground">{cfg.followers} followers</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold gold-glow">{stat.posts}</div>
                      <div className="text-[10px] text-muted-foreground">Posts</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold gold-glow">
                        {formatEngagement(stat.engagement)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">Engage</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold gold-glow">{stat.rate}%</div>
                      <div className="text-[10px] text-muted-foreground">Avg Rate</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Engagement Overview Chart */}
        {!loading && engagementChartData.some((d) => d.engagement > 0) && (
          <Card className="gold-card overflow-hidden mt-4">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                Engagement Overview by Platform
              </h3>
              <ChartContainer config={chartConfig} className="h-[140px] w-full">
                <BarChart data={engagementChartData} margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                  <XAxis
                    dataKey="platform"
                    tick={{ fontSize: 11, fill: '#9a9080' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: 'rgba(212,168,67,0.05)' }}
                  />
                  <Bar dataKey="engagement" radius={[6, 6, 0, 0]} barSize={40}>
                    {engagementChartData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          PLATFORM_CONFIG[entry.platform.toLowerCase()]?.color || '#D4A843'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        {loading ? (
          <div className="space-y-3 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No social posts found
              </div>
            ) : (
              filteredPosts.map((post) => {
                const cfg = PLATFORM_CONFIG[post.platform.toLowerCase()];
                const isPublished = post.status === 'published';
                const totalEng = post.likes + post.comments + post.shares + post.saves;

                return (
                  <div
                    key={post.id}
                    className="gold-card gold-shimmer rounded-xl p-4 sm:p-5 flex flex-col gap-3"
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {cfg && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${PLATFORM_STATUS_BADGE[post.platform.toLowerCase()] || 'badge-gold'}`}
                          >
                            {cfg.icon}
                            {post.platform}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md border font-medium capitalize ${POST_STATUS_BADGE[post.status] || 'badge-gold'}`}
                        >
                          {post.status}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="text-xs text-muted-foreground">
                        {post.scheduledAt
                          ? format(parseISO(post.scheduledAt), 'MMM dd, yyyy HH:mm')
                          : format(parseISO(post.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3">
                      {post.content || 'No content'}
                    </p>

                    {/* Engagement metrics (published only) */}
                    {isPublished && (
                      <div className="flex items-center gap-4 sm:gap-6 py-2 px-3 rounded-lg bg-[#0a0a0a] border border-[#2a2520]">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Heart className="size-3.5 text-red-400" />
                          <span className="text-muted-foreground">{post.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <MessageCircle className="size-3.5 text-[#D4A843]" />
                          <span className="text-muted-foreground">{post.comments.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Share2 className="size-3.5 text-green-500" />
                          <span className="text-muted-foreground">{post.shares.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Bookmark className="size-3.5 text-purple-400" />
                          <span className="text-muted-foreground">{post.saves.toLocaleString()}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5 text-xs">
                          <TrendingUp className="size-3.5 text-[#D4A843]" />
                          <span className="text-[#D4A843] font-medium">
                            {totalEng.toLocaleString()} total
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-[#D4A843]"
                        onClick={() => {
                          setFormPlatform(post.platform);
                          setFormContent(post.content || '');
                          setFormStatus(post.status);
                          setFormScheduleDate(
                            post.scheduledAt
                              ? format(parseISO(post.scheduledAt), 'yyyy-MM-dd')
                              : ''
                          );
                          setDialogOpen(true);
                        }}
                      >
                        <Edit3 className="size-3" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-[#D4A843]"
                        onClick={() => handleDuplicate(post)}
                      >
                        <Copy className="size-3" /> Duplicate
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-red-400 ml-auto"
                        onClick={() => toast.info('Delete is not available in this demo')}
                      >
                        <Trash2 className="size-3" /> Delete
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </Tabs>

      {/* ─── AI Post Generator ────────────────────────────────────── */}
      <Card className="gold-card border-0 mt-6 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4A843]/15">
              <Wand2 className="h-4.5 w-4.5 text-[#D4A843]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Post Generator</h3>
              <p className="text-[11px] text-muted-foreground">Generate engaging social media content with AI</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <Input
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="e.g., Diwali collection launch"
              className="border-[#2a2520] bg-[#0a0a0a] focus-visible:border-[#D4A843] h-9 text-sm"
            />
            <Select value={aiPlatform} onValueChange={setAiPlatform}>
              <SelectTrigger className="border-[#2a2520] bg-[#0a0a0a] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-border">
                {['Instagram', 'Facebook', 'Twitter', 'Pinterest'].map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value)}
                placeholder="Tone (optional)"
                className="border-[#2a2520] bg-[#0a0a0a] focus-visible:border-[#D4A843] h-9 text-sm flex-1"
              />
              <Button
                onClick={handleAiGenerate}
                disabled={aiGenerating || !aiTopic.trim()}
                className="h-9 px-4 bg-gradient-to-r from-[#B8922F] to-[#D4A843] text-[#0a0a0a] hover:from-[#D4A843] hover:to-[#E8C46A] font-semibold text-xs shrink-0"
              >
                {aiGenerating ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0a0a0a] animate-pulse" />
                    Generating
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate
                  </span>
                )}
              </Button>
            </div>
          </div>

          {aiResult && (
            <div className="mt-3 rounded-xl border border-[#D4A843]/15 bg-[#0a0a0a] p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#D4A843]">Generated Posts</span>
                <div className="flex gap-2">
                  {aiResult.split('---').filter((s: string) => s.includes('POST')).map((post: string, i: number) => {
                    const content = post.replace(/POST \d+:\s*/g, '').trim();
                    if (!content) return null;
                    return (
                      <button
                        key={i}
                        onClick={() => { setFormContent(content); setFormPlatform(aiPlatform.toLowerCase()); setDialogOpen(true); }}
                        className="text-[11px] text-[#D4A843] hover:underline flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Use Post {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {aiResult}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Create Post Dialog ─────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto bg-[#111] border-[#2a2520]">
          <DialogHeader>
            <DialogTitle className="gold-gradient-text">Create Social Post</DialogTitle>
            <DialogDescription>
              Compose and schedule your social media content
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Platform</Label>
                <Select value={formPlatform} onValueChange={setFormPlatform}>
                  <SelectTrigger className="border-[#2a2520] bg-[#0a0a0a] w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['instagram', 'facebook', 'twitter', 'pinterest'].map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground/80">Status</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger className="border-[#2a2520] bg-[#0a0a0a] w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_FILTERS.filter((s) => s !== 'all').map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-foreground/80">Content</Label>
                <span
                  className={`text-xs ${
                    formContent.length > MAX_CHAR ? 'text-red-400' : 'text-muted-foreground'
                  }`}
                >
                  {formContent.length}/{MAX_CHAR}
                </span>
              </div>
              <Textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="What's on your mind? Share your luxury jewellery content..."
                rows={4}
                className={`border-[#2a2520] bg-[#0a0a0a] focus-visible:border-[#D4A843] ${
                  formContent.length > MAX_CHAR ? 'border-red-400/50' : ''
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Schedule Date</Label>
                <Input
                  type="date"
                  value={formScheduleDate}
                  onChange={(e) => setFormScheduleDate(e.target.value)}
                  className="border-[#2a2520] bg-[#0a0a0a] focus-visible:border-[#D4A843]"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80">Schedule Time</Label>
                <Input
                  type="time"
                  value={formScheduleTime}
                  onChange={(e) => setFormScheduleTime(e.target.value)}
                  className="border-[#2a2520] bg-[#0a0a0a] focus-visible:border-[#D4A843]"
                />
              </div>
            </div>

            {/* Preview Panel */}
            {formContent.trim() && (
              <div className="space-y-2">
                <Label className="text-foreground/80">Preview</Label>
                <div className="rounded-xl border border-[#2a2520] bg-[#0a0a0a] p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {PLATFORM_CONFIG[formPlatform] && (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${PLATFORM_CONFIG[formPlatform].bgClass}`}
                      >
                        {PLATFORM_CONFIG[formPlatform].icon}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold">Laxree Jewels</div>
                      <div className="text-xs text-muted-foreground">
                        {PLATFORM_CONFIG[formPlatform]?.handle || ''}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {formContent}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-[#2a2520]">
                    <Heart className="size-3.5" /> <MessageCircle className="size-3.5" />{' '}
                    <Share2 className="size-3.5" /> <Bookmark className="size-3.5" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-[#2a2520] hover:border-[#D4A843]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || formContent.length > MAX_CHAR || !formContent.trim()}
              className="bg-[#D4A843] text-[#0a0a0a] hover:bg-[#E8C46A] font-semibold"
            >
              {submitting ? 'Creating...' : 'Create Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}