'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Edit3,
  Trash2,
  Send,
  TrendingUp,
  FileText,
  Eye,
  PenLine,
  Sparkles,
  Loader2,
  Tag,
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
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

// ─── Types ───────────────────────────────────────────────────────────
interface BlogPost {
  id: string;
  title: string;
  content: string | null;
  status: string;
  author: string | null;
  category: string | null;
  tags: string | null;
  seoScore: number;
  publishDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BlogData {
  posts: BlogPost[];
  categories: string[];
  statusCounts: {
    published: number;
    draft: number;
    in_review: number;
  };
  avgSeoScore: number;
}

type ViewMode = 'grid' | 'list';

interface AISuggestion {
  title: string;
  outline: string[];
  keywords: string[];
  seoDifficulty: string;
}

const AI_CATEGORIES = ['Trends', 'Styling', 'Guide', 'Brand Story', 'Wedding', 'Care', 'How-to'];
const AI_TONES = ['Professional', 'Casual', 'Luxurious', 'Educational'];

// ─── Helpers ─────────────────────────────────────────────────────────
const SEO_COLOR = (score: number) => {
  if (score >= 80) return 'badge-green';
  if (score >= 60) return 'badge-yellow';
  return 'badge-red';
};

const SEO_LABEL = (score: number) => {
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Needs Work';
  return 'Poor';
};

const SEO_TEXT_COLOR = (score: number) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-400';
};

const STATUS_BADGE: Record<string, string> = {
  published: 'badge-green',
  draft: 'badge-red',
  in_review: 'badge-yellow',
};

const BAR_COLORS: Record<string, string> = {
  'Good (80-100)': '#22c55e',
  'Needs Work (60-79)': '#eab308',
  'Poor (0-59)': '#ef4444',
};

const BLOG_CATEGORIES = [
  'Jewellery Trends',
  'Care & Maintenance',
  'Brand Story',
  'Product Spotlight',
  'Gift Guide',
  'Sustainability',
  'Style Tips',
  'Behind the Scenes',
];

const BLOG_STATUSES = ['draft', 'in_review', 'published'];

// ─── Circular Progress ──────────────────────────────────────────────
function CircularProgress({ value, size = 80, strokeWidth = 6 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 80 ? '#22c55e' : value >= 60 ? '#eab308' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2a2520"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-lg font-bold ${value >= 80 ? 'text-green-500' : value >= 60 ? 'text-yellow-500' : 'text-red-400'}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export default function BlogPlannerTab() {
  const [data, setData] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('Jewellery Trends');
  const [formTags, setFormTags] = useState('');
  const [formAuthor, setFormAuthor] = useState('Laxree Team');
  const [formStatus, setFormStatus] = useState('draft');
  const [formPublishDate, setFormPublishDate] = useState('');

  // AI Suggester state
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState('Trends');
  const [aiTone, setAiTone] = useState('Professional');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/marketing/blogs');
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Failed to load blog data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Unique authors
  const authors = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.posts.map((p) => p.author).filter(Boolean))] as string[];
  }, [data]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    if (!data) return [];
    return data.posts.filter((post) => {
      if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (categoryFilter !== 'all' && post.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && post.status !== statusFilter) return false;
      if (authorFilter !== 'all' && post.author !== authorFilter) return false;
      return true;
    });
  }, [data, searchQuery, categoryFilter, statusFilter, authorFilter]);

  // SEO Score Distribution
  const seoDistribution = useMemo(() => {
    if (!data) return [];
    const good = data.posts.filter((p) => p.seoScore >= 80).length;
    const needsWork = data.posts.filter((p) => p.seoScore >= 60 && p.seoScore < 80).length;
    const poor = data.posts.filter((p) => p.seoScore < 60).length;
    return [
      { range: 'Good (80-100)', count: good },
      { range: 'Needs Work (60-79)', count: needsWork },
      { range: 'Poor (0-59)', count: poor },
    ].filter((d) => d.count > 0);
  }, [data]);

  const chartConfig = {
    count: { label: 'Posts', color: '#D4A843' },
  };

  // ─── AI Suggester Handlers ────────────────────────────────────────
  const parseAISuggestions = (text: string): AISuggestion[] => {
    const blocks = text.split(/\n*---+\n*/).filter(Boolean);
    return blocks.map((block) => {
      const lines = block.trim().split('\n');
      let title = '';
      const outline: string[] = [];
      const keywords: string[] = [];
      let seoDifficulty = 'Medium';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.match(/^1\.\s*Title/i) || trimmed.match(/^Title:/i)) {
          title = trimmed.replace(/^1\.\s*Title[:\s]*/i, '').replace(/^Title[:\s]*/i, '').trim();
        } else if (trimmed.match(/^2\.\s*Outline/i) || trimmed.match(/^Outline:/i)) {
          continue;
        } else if (trimmed.match(/^3\.\s*Target\s*Keywords/i) || trimmed.match(/^Target\s*Keywords:/i)) {
          const kwText = trimmed.replace(/^3\.\s*Target\s*Keywords[:\s]*/i, '').replace(/^Target\s*Keywords[:\s]*/i, '').trim();
          kwText.split(/[,;]/).forEach((kw) => {
            const k = kw.trim().replace(/^[-•*]\s*/, '');
            if (k) keywords.push(k);
          });
        } else if (trimmed.match(/^4\.\s*SEO\s*Difficulty/i) || trimmed.match(/^SEO\s*Difficulty:/i)) {
          const d = trimmed.replace(/^4\.\s*SEO\s*Difficulty[:\s]*/i, '').replace(/^SEO\s*Difficulty[:\s]*/i, '').trim();
          if (d.match(/low/i)) seoDifficulty = 'Low';
          else if (d.match(/high/i)) seoDifficulty = 'High';
          else seoDifficulty = 'Medium';
        } else if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+\.\s/)) {
          if (title && keywords.length === 0 && outline.length < 5) {
            outline.push(trimmed.replace(/^[-•*\d.]\s*/, '').trim());
          }
        } else if (!title) {
          title = trimmed;
        }
      }

      return { title: title || 'Untitled Suggestion', outline: outline.slice(0, 4), keywords: keywords.slice(0, 5), seoDifficulty };
    }).filter((s) => s.title !== 'Untitled Suggestion');
  };

  const handleAISuggest = async () => {
    if (!aiTopic.trim() || aiLoading) return;
    try {
      setAiLoading(true);
      setAiSuggestions([]);
      const res = await fetch('/api/marketing/ai-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic, category: aiCategory, tone: aiTone }),
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      const parsed = parseAISuggestions(json.suggestions);
      setAiSuggestions(parsed.length > 0 ? parsed : [{ title: aiTopic, outline: [json.suggestions.substring(0, 200)], keywords: [], seoDifficulty: 'Medium' }]);
    } catch {
      toast.error('Failed to generate AI suggestions');
    } finally {
      setAiLoading(false);
    }
  };

  const handleUseAsDraft = (suggestion: AISuggestion) => {
    setEditingPost(null);
    resetForm();
    setFormTitle(suggestion.title);
    setFormContent(suggestion.outline.map((p) => `• ${p}`).join('\n'));
    setFormTags(suggestion.keywords.join(', '));
    if (aiCategory) {
      const catMap: Record<string, string> = {
        Trends: 'Jewellery Trends',
        Styling: 'Style Tips',
        Guide: 'Product Spotlight',
        'Brand Story': 'Brand Story',
        Wedding: 'Gift Guide',
        Care: 'Care & Maintenance',
        'How-to': 'Care & Maintenance',
      };
      setFormCategory(catMap[aiCategory] || 'Jewellery Trends');
    }
    setDialogOpen(true);
  };

  // ─── Form Handlers ────────────────────────────────────────────────
  const openCreateDialog = () => {
    setEditingPost(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormContent(post.content || '');
    setFormCategory(post.category || 'Jewellery Trends');
    setFormTags(post.tags || '');
    setFormAuthor(post.author || 'Laxree Team');
    setFormStatus(post.status);
    setFormPublishDate(post.publishDate ? format(parseISO(post.publishDate), 'yyyy-MM-dd') : '');
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormCategory('Jewellery Trends');
    setFormTags('');
    setFormAuthor('Laxree Team');
    setFormStatus('draft');
    setFormPublishDate('');
  };

  const handleSubmit = async () => {
    if (!formTitle.trim()) {
      toast.error('Please enter a title');
      return;
    }
    try {
      setSubmitting(true);
      const method = editingPost ? 'PUT' : 'POST';
      const body: Record<string, unknown> = {
        title: formTitle,
        content: formContent,
        category: formCategory,
        tags: formTags,
        author: formAuthor,
        status: formStatus,
        publishDate: formPublishDate || null,
      };
      if (editingPost) body.id = editingPost.id;

      const res = await fetch('/api/marketing/blogs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(editingPost ? 'Post updated' : 'Post created');
      setDialogOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to save post');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (post: BlogPost) => {
    try {
      const res = await fetch('/api/marketing/blogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: post.id,
          status: 'published',
          publishDate: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Post published');
      fetchData();
    } catch {
      toast.error('Failed to publish post');
    }
  };

  const handleDelete = async (post: BlogPost) => {
    // The API doesn't have DELETE, so we just inform the user
    toast.info('Delete functionality coming soon');
  };

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold gold-gradient-text">Blog Planner</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your luxury jewellery blog content and SEO performance
          </p>
          {data && !loading && (
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{data.posts.length} Total Posts</span>
              <span>•</span>
              <span>Avg SEO Score: <span className={SEO_TEXT_COLOR(data.avgSeoScore)}>{data.avgSeoScore}</span></span>
              <span>•</span>
              <span>{data.statusCounts.published} Published</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            variant="outline"
            size="sm"
            className="gap-2 border-[#2a2520] hover:border-[#D4A843] hover:text-[#D4A843] transition-colors"
          >
            {viewMode === 'grid' ? <List className="size-4" /> : <Grid3X3 className="size-4" />}
            {viewMode === 'grid' ? 'List' : 'Grid'}
          </Button>
          <Button
            onClick={openCreateDialog}
            className="gap-2 bg-[#D4A843] text-[#0a0a0a] hover:bg-[#E8C46A] font-semibold"
          >
            <Plus className="size-4" />
            New Blog Post
          </Button>
        </div>
      </div>

      {/* AI Content Suggester */}
      <Card className="gold-card gold-shimmer rounded-xl overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex items-center justify-center size-10 rounded-lg bg-gradient-to-br from-[#D4A843] to-[#B8922F] shrink-0">
              <Sparkles className="size-5 text-[#0a0a0a]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold flex items-center gap-2">
                AI Content Suggester
                <span className="badge-gold text-[10px] px-1.5 py-0.5 rounded-md border font-medium">AI</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Get AI-powered blog topic and outline suggestions</p>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Topic / Keywords</Label>
              <Input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g. gold necklace layering, diamond care tips..."
                className="border-[#2a2520] bg-[#111] focus-visible:border-[#D4A843] h-9"
                onKeyDown={(e) => e.key === 'Enter' && handleAISuggest()}
              />
            </div>
            <div className="w-[150px]">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Category</Label>
              <Select value={aiCategory} onValueChange={setAiCategory}>
                <SelectTrigger className="h-9 border-[#2a2520] bg-[#111]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {AI_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[140px]">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Tone</Label>
              <Select value={aiTone} onValueChange={setAiTone}>
                <SelectTrigger className="h-9 border-[#2a2520] bg-[#111]">
                  <SelectValue placeholder="Tone" />
                </SelectTrigger>
                <SelectContent>
                  {AI_TONES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAISuggest}
              disabled={aiLoading || !aiTopic.trim()}
              className="h-9 gap-2 bg-gradient-to-r from-[#D4A843] to-[#E8C46A] text-[#0a0a0a] hover:from-[#E8C46A] hover:to-[#D4A843] font-semibold disabled:opacity-50"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating<span className="dot-pulse">...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Suggest
                </>
              )}
            </Button>
          </div>

          {aiSuggestions.length > 0 && (
            <div className="mt-4 space-y-3 animate-fade-in">
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Suggestions</div>
              {aiSuggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#2a2520] bg-[#0d0d0d] p-4 space-y-3 hover:border-[rgba(212,168,67,0.3)] transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center size-6 rounded-full bg-gradient-to-br from-[#D4A843] to-[#B8922F] text-xs font-bold text-[#0a0a0a]">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-semibold leading-snug">{suggestion.title}</h4>
                    </div>
                    <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                      suggestion.seoDifficulty === 'Low' ? 'badge-green' :
                      suggestion.seoDifficulty === 'Medium' ? 'badge-yellow' : 'badge-red'
                    }`}>
                      {suggestion.seoDifficulty} SEO
                    </span>
                  </div>

                  <ul className="space-y-1 ml-8">
                    {suggestion.outline.map((point, pIdx) => (
                      <li key={pIdx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-[#D4A843] mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between ml-8">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Tag className="size-3 text-[#D4A843]" />
                      {suggestion.keywords.map((kw, kIdx) => (
                        <span key={kIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(212,168,67,0.1)] text-[#D4A843] border border-[rgba(212,168,67,0.2)]">
                          {kw}
                        </span>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1.5 border-[#D4A843] text-[#D4A843] hover:bg-[#D4A843] hover:text-[#0a0a0a]"
                      onClick={() => handleUseAsDraft(suggestion)}
                    >
                      <PenLine className="size-3" />
                      Use as Draft
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {aiLoading && aiSuggestions.length === 0 && (
            <div className="mt-4 flex items-center justify-center py-8 text-sm text-muted-foreground">
              <span>Generating suggestions</span>
              <span className="dot-pulse text-[#D4A843]">...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="pl-9 border-[#2a2520] bg-[#111] focus-visible:border-[#D4A843]"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] border-[#2a2520] bg-[#111]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {BLOG_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] border-[#2a2520] bg-[#111]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {BLOG_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={authorFilter} onValueChange={setAuthorFilter}>
          <SelectTrigger className="w-[150px] border-[#2a2520] bg-[#111]">
            <SelectValue placeholder="Author" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Authors</SelectItem>
            {authors.map((a) => (
              <SelectItem key={a} value={a!}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Row */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Published */}
          <div className="gold-card gold-shimmer rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="size-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Published</span>
            </div>
            <div className="text-3xl font-bold text-green-500 gold-glow stat-animate">
              {data.statusCounts.published}
            </div>
          </div>

          {/* In Review */}
          <div className="gold-card gold-shimmer rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="size-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">In Review</span>
            </div>
            <div className="text-3xl font-bold text-yellow-500 gold-glow stat-animate">
              {data.statusCounts.in_review}
            </div>
          </div>

          {/* Draft */}
          <div className="gold-card gold-shimmer rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <PenLine className="size-4 text-red-400" />
              <span className="text-xs text-muted-foreground">Drafts</span>
            </div>
            <div className="text-3xl font-bold text-red-400 gold-glow stat-animate">
              {data.statusCounts.draft}
            </div>
          </div>

          {/* Avg SEO Score */}
          <div className="gold-card gold-shimmer rounded-xl p-4 flex items-center gap-4">
            <CircularProgress value={data.avgSeoScore} size={64} strokeWidth={5} />
            <div>
              <div className="text-xs text-muted-foreground mb-1">Avg SEO Score</div>
              <div className={`text-sm font-semibold ${SEO_TEXT_COLOR(data.avgSeoScore)}`}>
                {SEO_LABEL(data.avgSeoScore)}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* SEO Distribution Chart */}
      {data && seoDistribution.length > 0 && !loading && (
        <Card className="gold-card overflow-hidden">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">SEO Score Distribution</h3>
            <ChartContainer config={chartConfig} className="h-[120px] w-full">
              <BarChart data={seoDistribution} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="range" tick={{ fontSize: 11, fill: '#9a9080' }} width={150} />
                <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(212,168,67,0.05)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {seoDistribution.map((entry, index) => (
                    <Cell key={index} fill={BAR_COLORS[entry.range] || '#D4A843'} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Blog Posts Content */}
      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-52 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        )
      ) : viewMode === 'grid' ? (
        /* ─── Grid View ──────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              No blog posts found
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="gold-card gold-shimmer rounded-xl p-5 flex flex-col gap-3 group cursor-pointer
                  hover:!border-[rgba(212,168,67,0.5)] hover:!shadow-[0_0_25px_rgba(212,168,67,0.15)] transition-all duration-300"
                onClick={() => openEditDialog(post)}
              >
                {/* Top row: badges */}
                <div className="flex items-center justify-between">
                  {post.category && (
                    <span className="badge-gold text-xs px-2 py-0.5 rounded-md border font-medium">
                      {post.category}
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-md border font-medium capitalize ${STATUS_BADGE[post.status] || 'badge-gold'}`}
                  >
                    {post.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[#D4A843] transition-colors">
                  {post.title}
                </h3>

                {/* Author & Date */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{post.author || 'Laxree Team'}</span>
                  {post.publishDate && (
                    <>
                      <span>•</span>
                      <span>{format(parseISO(post.publishDate), 'MMM dd, yyyy')}</span>
                    </>
                  )}
                </div>

                {/* SEO Score */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#2a2520]">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`size-3.5 ${SEO_TEXT_COLOR(post.seoScore)}`} />
                    <span className={`text-xs font-medium ${SEO_TEXT_COLOR(post.seoScore)}`}>
                      SEO: {post.seoScore}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${SEO_COLOR(post.seoScore)}`}>
                      {SEO_LABEL(post.seoScore)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground hover:text-[#D4A843]"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(post);
                    }}
                  >
                    <Edit3 className="size-3" /> Edit
                  </Button>
                  {post.status !== 'published' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-muted-foreground hover:text-green-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePublish(post);
                      }}
                    >
                      <Send className="size-3" /> Publish
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground hover:text-red-400 ml-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post);
                    }}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* ─── List View ──────────────────────────────────────────── */
        <Card className="gold-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="gold-table-header border-[#2a2520] hover:bg-transparent">
                    <TableHead className="text-[#D4A843]">Title</TableHead>
                    <TableHead className="text-[#D4A843]">Category</TableHead>
                    <TableHead className="text-[#D4A843]">Author</TableHead>
                    <TableHead className="text-[#D4A843]">Status</TableHead>
                    <TableHead className="text-[#D4A843]">SEO Score</TableHead>
                    <TableHead className="text-[#D4A843]">Published</TableHead>
                    <TableHead className="text-[#D4A843]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No blog posts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post) => (
                      <TableRow
                        key={post.id}
                        className="border-[#2a2520] hover:bg-[rgba(212,168,67,0.05)] transition-colors"
                      >
                        <TableCell className="font-medium max-w-[220px] truncate">
                          {post.title}
                        </TableCell>
                        <TableCell>
                          {post.category ? (
                            <span className="badge-gold text-xs px-2 py-0.5 rounded-md border">
                              {post.category}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {post.author || 'Laxree Team'}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-md border font-medium capitalize ${STATUS_BADGE[post.status] || 'badge-gold'}`}
                          >
                            {post.status.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TrendingUp className={`size-3.5 ${SEO_TEXT_COLOR(post.seoScore)}`} />
                            <span className={`text-sm font-semibold ${SEO_TEXT_COLOR(post.seoScore)}`}>
                              {post.seoScore}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${SEO_COLOR(post.seoScore)}`}>
                              {SEO_LABEL(post.seoScore)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {post.publishDate
                            ? format(parseISO(post.publishDate), 'MMM dd, yyyy')
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-[#D4A843]"
                              onClick={() => openEditDialog(post)}
                            >
                              <Edit3 className="size-3.5" />
                            </Button>
                            {post.status !== 'published' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7 text-muted-foreground hover:text-green-500"
                                onClick={() => handlePublish(post)}
                              >
                                <Send className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Blog Post Dialog ─────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#111] border-[#2a2520]">
          <DialogHeader>
            <DialogTitle className="gold-gradient-text">
              {editingPost ? 'Edit Blog Post' : 'New Blog Post'}
            </DialogTitle>
            <DialogDescription>
              {editingPost ? 'Update the blog post details' : 'Create a new blog post for the Laxree journal'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-foreground/80">Title</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter post title..."
                className="border-[#2a2520] bg-[#0a0a0a] focus-visible:border-[#D4A843]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground/80">Content</Label>
              <Textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Write your blog content..."
                rows={6}
                className="border-[#2a2520] bg-[#0a0a0a] focus-visible:border-[#D4A843] min-h-[140px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="border-[#2a2520] bg-[#0a0a0a] w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOG_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground/80">Author</Label>
                <Input
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  placeholder="Author name"
                  className="border-[#2a2520] bg-[#0a0a0a] focus-visible:border-[#D4A843]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground/80">Tags</Label>
              <Input
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="luxury, gold, diamond (comma separated)"
                className="border-[#2a2520] bg-[#0a0a0a] focus-visible:border-[#D4A843]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/80">Status</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger className="border-[#2a2520] bg-[#0a0a0a] w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOG_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground/80">Publish Date</Label>
                <Input
                  type="date"
                  value={formPublishDate}
                  onChange={(e) => setFormPublishDate(e.target.value)}
                  className="border-[#2a2520] bg-[#0a0a0a] focus-visible:border-[#D4A843]"
                />
              </div>
            </div>

            {/* SEO Score Display */}
            {editingPost && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-[#0a0a0a] border border-[#2a2520]">
                <CircularProgress value={editingPost.seoScore} size={56} strokeWidth={4} />
                <div>
                  <div className="text-xs text-muted-foreground">SEO Score</div>
                  <div className={`text-lg font-bold ${SEO_TEXT_COLOR(editingPost.seoScore)}`}>
                    {editingPost.seoScore}/100 — {SEO_LABEL(editingPost.seoScore)}
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
              disabled={submitting}
              className="bg-[#D4A843] text-[#0a0a0a] hover:bg-[#E8C46A] font-semibold"
            >
              {submitting ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}