'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Lightbulb,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronUp,
  Brain,
  Save,
  Filter,
  Plus,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParsedIdea {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface SavedIdea {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
  createdAt: string;
}

interface IdeasResponse {
  ideas: SavedIdea[];
  categories: string[];
  priorityCounts: Record<string, number>;
  statusCounts: Record<string, number>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Product', 'Campaign', 'Content', 'Strategy', 'Partnerships'];
const PRIORITIES = ['high', 'medium', 'low'] as const;
const STATUSES = ['All', 'New', 'In Review', 'Approved', 'Implemented'];

const PRIORITY_BADGE: Record<string, string> = {
  high: 'badge-red',
  medium: 'badge-yellow',
  low: 'badge-green',
};

const PRIORITY_DOT_COLOR: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseAIResponse(raw: string, selectedCategory: string): ParsedIdea[] {
  const ideas: ParsedIdea[] = [];

  // Split by numbered list items (1. 2. 3. etc.) or bullet points (-, *, •)
  const blocks = raw
    .split(/(?=(?:^|\n)\s*(?:\d+[\.\)]|[-*•])\s+)/i)
    .map((b) => b.trim())
    .filter(Boolean);

  const category =
    selectedCategory === 'All' ? 'Content' : selectedCategory;

  for (const block of blocks) {
    // Remove leading number/bullet
    const cleaned = block.replace(/^\s*\d+[\.\)]\s+|^\s*[-*•]\s+/, '').trim();
    if (!cleaned) continue;

    // Try to extract title: first line or text before colon/dash
    const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
    let title = '';
    let description = '';

    const firstLine = lines[0] || '';

    // Check for "Title: description" or "Title - description" pattern
    const colonIdx = firstLine.indexOf(':');
    const dashIdx = firstLine.indexOf(' - ');

    if (colonIdx > 3 && colonIdx < 80) {
      title = firstLine.slice(0, colonIdx).trim();
      description = firstLine.slice(colonIdx + 1).trim();
    } else if (dashIdx > 3 && dashIdx < 80) {
      title = firstLine.slice(0, dashIdx).trim();
      description = firstLine.slice(dashIdx + 3).trim();
    } else if (firstLine.length < 100) {
      title = firstLine;
      description = lines.slice(1).join(' ').trim();
    } else {
      // Take first sentence or up to 60 chars as title
      const sentenceEnd = firstLine.indexOf('.');
      title =
        sentenceEnd > 10 && sentenceEnd < 80
          ? firstLine.slice(0, sentenceEnd).trim()
          : firstLine.slice(0, 60).trim() + '…';
      description = firstLine;
    }

    // Append remaining lines to description
    if (lines.length > 1 && !description.includes(lines.slice(1).join(' '))) {
      description += (description ? ' ' : '') + lines.slice(1).join(' ');
    }

    // Guess priority from keywords
    const lower = (title + ' ' + description).toLowerCase();
    let priority: 'high' | 'medium' | 'low' = 'medium';
    if (
      lower.includes('urgent') ||
      lower.includes('critical') ||
      lower.includes('high priority') ||
      lower.includes('must') ||
      lower.includes('immediately') ||
      lower.includes('launch') ||
      lower.includes('breakthrough')
    ) {
      priority = 'high';
    } else if (
      lower.includes('quick win') ||
      lower.includes('simple') ||
      lower.includes('easy') ||
      lower.includes('later') ||
      lower.includes('future') ||
      lower.includes('explore')
    ) {
      priority = 'low';
    }

    ideas.push({
      title: title || 'Untitled Idea',
      description: description || '',
      priority,
      category,
    });
  }

  return ideas.length > 0
    ? ideas
    : [
        {
          title: 'Generated Ideas',
          description: raw,
          priority: 'medium',
          category,
        },
      ];
}

function extractCategory(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('product') || lower.includes('collection') || lower.includes('jewelry') || lower.includes('design')) return 'Product';
  if (lower.includes('campaign') || lower.includes('launch') || lower.includes('promotion') || lower.includes('offer')) return 'Campaign';
  if (lower.includes('content') || lower.includes('blog') || lower.includes('social') || lower.includes('video') || lower.includes('post') || lower.includes('reel')) return 'Content';
  if (lower.includes('strategy') || lower.includes('growth') || lower.includes('brand') || lower.includes('market')) return 'Strategy';
  if (lower.includes('partner') || lower.includes('collab') || lower.includes('influencer') || lower.includes('celebrity')) return 'Partnerships';
  return 'Content';
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function IdeaResearcherTab() {
  // AI generation state
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [parsedIdeas, setParsedIdeas] = useState<ParsedIdea[]>([]);
  const [rawResponse, setRawResponse] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  // Saved ideas state
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [priorityCounts, setPriorityCounts] = useState<Record<string, number>>({});
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(true);

  // Filters
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Expanded card
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ─── Fetch saved ideas ─────────────────────────────────────────────────────

  const fetchIdeas = useCallback(async () => {
    setIsLoadingIdeas(true);
    try {
      const res = await fetch('/api/marketing/ideas');
      if (res.ok) {
        const data: IdeasResponse = await res.json();
        setSavedIdeas(data.ideas || []);
        setCategories(data.categories || []);
        setPriorityCounts(data.priorityCounts || {});
        setStatusCounts(data.statusCounts || {});
      }
    } catch {
      // Silently fail — board just shows empty
    } finally {
      setIsLoadingIdeas(false);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  // ─── Generate ideas ────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (!query.trim() || isGenerating) return;
    setIsGenerating(true);
    setParsedIdeas([]);
    setRawResponse('');
    setHasGenerated(false);

    try {
      const res = await fetch('/api/marketing/ai-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          category: selectedCategory,
          context: 'Laxree luxury jewellery brand',
        }),
      });

      if (!res.ok) throw new Error('Failed to generate');

      const data = await res.json();
      const text = data.ideas || data.text || data.response || '';
      setRawResponse(text);
      const parsed = parseAIResponse(text, selectedCategory);
      setParsedIdeas(parsed);
      setHasGenerated(true);
    } catch {
      setRawResponse('Failed to generate ideas. Please try again.');
      setParsedIdeas([]);
      setHasGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Save idea to board ────────────────────────────────────────────────────

  const handleSaveIdea = async (idea: ParsedIdea, index: number) => {
    const key = `ai-${index}`;
    setSavingIds((prev) => new Set(prev).add(key));

    try {
      const res = await fetch('/api/marketing/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: idea.title,
          content: idea.description,
          category: idea.category,
          priority: idea.priority,
          status: 'New',
        }),
      });

      if (res.ok) {
        await fetchIdeas();
      }
    } catch {
      // Silently fail
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  // ─── Update idea ───────────────────────────────────────────────────────────

  const handleUpdateIdea = async (
    id: string,
    updates: { status?: string; priority?: string }
  ) => {
    try {
      const res = await fetch('/api/marketing/ideas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        await fetchIdeas();
      }
    } catch {
      // Silently fail
    }
  };

  // ─── Delete idea ───────────────────────────────────────────────────────────

  const handleDeleteIdea = async (id: string) => {
    try {
      const res = await fetch('/api/marketing/ideas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setExpandedId(null);
        await fetchIdeas();
      }
    } catch {
      // Silently fail
    }
  };

  // ─── Filtered ideas ────────────────────────────────────────────────────────

  const filteredIdeas = savedIdeas.filter((idea) => {
    if (filterCategory !== 'All' && idea.category !== filterCategory) return false;
    if (filterPriority !== 'All' && idea.priority !== filterPriority) return false;
    if (filterStatus !== 'All' && idea.status !== filterStatus) return false;
    return true;
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2.5">
          <Lightbulb className="h-5 w-5 text-[#D4A843]" />
          <h2 className="text-lg font-semibold text-foreground">
            Idea Researcher
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-Powered Marketing Idea Generator
        </p>
      </div>

      {/* ── AI Query Section ─────────────────────────────────────────────── */}
      <Card className="gold-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#D4A843]">
            <Brain className="h-4 w-4" />
            AI Idea Generation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., Content ideas for Diwali jewellery collection launch..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[120px] resize-y border-[rgba(212,168,67,0.2)] bg-[#111] text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-[#D4A843]/50 focus-visible:ring-[#D4A843]/20"
            disabled={isGenerating}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              disabled={isGenerating}
            >
              <SelectTrigger className="w-full border-[rgba(212,168,67,0.2)] bg-[#111] text-sm sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="border-[rgba(212,168,67,0.2)] bg-[#111]">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleGenerate}
              disabled={!query.trim() || isGenerating}
              className="w-full bg-gradient-to-r from-[#B8922F] via-[#D4A843] to-[#E8C46A] text-[#0a0a0a] font-semibold shadow-lg shadow-[#D4A843]/20 hover:from-[#D4A843] hover:via-[#E8C46A] hover:to-[#D4A843] sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <span className="inline-flex gap-1">
                    Generating ideas
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0a0a0a]" style={{ animation: 'goldPulse 1.4s infinite ease-in-out both', animationDelay: '0s' }} />
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0a0a0a]" style={{ animation: 'goldPulse 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0a0a0a]" style={{ animation: 'goldPulse 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
                  </span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Ideas
                </span>
              )}
            </Button>
          </div>

          {/* Pulse animation style */}
          <style>{`
            @keyframes goldPulse {
              0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
              40% { opacity: 1; transform: scale(1.2); }
            }
          `}</style>
        </CardContent>
      </Card>

      {/* ── Loading skeleton ─────────────────────────────────────────────── */}
      {isGenerating && (
        <div className="space-y-4">
          <Skeleton className="h-6 w-40 bg-[#1a1a1a]" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="gold-card border-0">
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4 bg-[#1a1a1a]" />
                  <Skeleton className="h-4 w-full bg-[#1a1a1a]" />
                  <Skeleton className="h-4 w-5/6 bg-[#1a1a1a]" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-5 w-16 bg-[#1a1a1a]" />
                    <Skeleton className="h-5 w-16 bg-[#1a1a1a]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Generated Ideas ──────────────────────────────────────────────── */}
      {hasGenerated && !isGenerating && parsedIdeas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#D4A843]" />
            Generated Ideas
            <Badge className="badge-gold px-2 py-0.5 text-xs">
              {parsedIdeas.length}
            </Badge>
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {parsedIdeas.map((idea, idx) => {
              const savingKey = `ai-${idx}`;
              const isSaving = savingIds.has(savingKey);
              return (
                <Card
                  key={idx}
                  className="gold-card gold-shimmer border-0"
                >
                  <CardContent className="p-5 space-y-3">
                    {/* Title */}
                    <h4 className="font-semibold text-[#D4A843] text-sm leading-snug">
                      {idea.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {idea.description}
                    </p>

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge className={`${PRIORITY_BADGE[idea.priority]} px-2 py-0.5 text-[10px] uppercase font-semibold`}>
                        {idea.priority}
                      </Badge>
                      <Badge className="badge-gold px-2 py-0.5 text-[10px]">
                        {idea.category}
                      </Badge>
                    </div>

                    {/* Save button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSaveIdea(idea, idx)}
                      disabled={isSaving}
                      className="mt-1 w-full border-[rgba(212,168,67,0.3)] text-[#D4A843] hover:bg-[rgba(212,168,67,0.1)] hover:text-[#D4A843] text-xs disabled:opacity-50"
                    >
                      {isSaving ? (
                        <span className="flex items-center gap-1.5">
                          <Save className="h-3 w-3 animate-pulse" />
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Plus className="h-3 w-3" />
                          Save to Board
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Saved Ideas Board ────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Save className="h-4 w-4 text-[#D4A843]" />
            Saved Ideas
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchIdeas}
            className="text-xs text-muted-foreground hover:text-[#D4A843] h-7"
          >
            Refresh
          </Button>
        </div>

        {/* Stats row */}
        {!isLoadingIdeas && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: 'Total Ideas',
                value: savedIdeas.length,
                color: 'text-foreground',
              },
              {
                label: 'High Priority',
                value: priorityCounts.high || 0,
                color: 'text-red-400',
              },
              {
                label: 'Medium',
                value: priorityCounts.medium || 0,
                color: 'text-yellow-400',
              },
              {
                label: 'Low',
                value: priorityCounts.low || 0,
                color: 'text-green-400',
              },
            ].map((stat) => (
              <Card key={stat.label} className="gold-card p-3 border-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                  {stat.label}
                </p>
                <p className={`text-xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-medium">Filters:</span>
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="h-8 border-[rgba(212,168,67,0.2)] bg-[#111] text-xs sm:w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="border-[rgba(212,168,67,0.2)] bg-[#111]">
              {['All', ...categories].map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="h-8 border-[rgba(212,168,67,0.2)] bg-[#111] text-xs sm:w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="border-[rgba(212,168,67,0.2)] bg-[#111]">
              {['All', 'high', 'medium', 'low'].map((p) => (
                <SelectItem key={p} value={p} className="text-xs capitalize">
                  {p === 'All' ? 'All Priorities' : p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 border-[rgba(212,168,67,0.2)] bg-[#111] text-xs sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-[rgba(212,168,67,0.2)] bg-[#111]">
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {s === 'All' ? 'All Statuses' : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading state */}
        {isLoadingIdeas && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="gold-card border-0">
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4 bg-[#1a1a1a]" />
                  <Skeleton className="h-4 w-full bg-[#1a1a1a]" />
                  <Skeleton className="h-4 w-2/3 bg-[#1a1a1a]" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-5 w-16 bg-[#1a1a1a]" />
                    <Skeleton className="h-5 w-16 bg-[#1a1a1a]" />
                    <Skeleton className="h-5 w-16 bg-[#1a1a1a]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Ideas grid */}
        {!isLoadingIdeas && filteredIdeas.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredIdeas.map((idea) => {
              const isExpanded = expandedId === idea.id;
              return (
                <Card
                  key={idea.id}
                  className="gold-card border-0 cursor-pointer transition-all"
                  onClick={() => setExpandedId(isExpanded ? null : idea.id)}
                >
                  <CardContent className="p-5 space-y-3">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-foreground leading-snug flex-1">
                        {idea.title}
                      </h4>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                    </div>

                    {/* Content preview / full */}
                    {!isExpanded ? (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {idea.content}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {idea.content}
                      </p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge className="badge-gold px-2 py-0.5 text-[10px]">
                        {idea.category}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-[10px]">
                        <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT_COLOR[idea.priority] || 'bg-gray-500'}`} />
                        <span className="capitalize text-muted-foreground">
                          {idea.priority}
                        </span>
                      </span>
                      <Badge
                        className="border-[rgba(212,168,67,0.15)] bg-[rgba(212,168,67,0.08)] text-[#D4A843] px-2 py-0.5 text-[10px]"
                      >
                        {idea.status}
                      </Badge>
                    </div>

                    {/* Expanded controls */}
                    {isExpanded && (
                      <div
                        className="space-y-3 pt-2 border-t border-[rgba(212,168,67,0.1)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="grid grid-cols-2 gap-3">
                          {/* Status dropdown */}
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                              Status
                            </label>
                            <Select
                              value={idea.status}
                              onValueChange={(val) =>
                                handleUpdateIdea(idea.id, { status: val })
                              }
                            >
                              <SelectTrigger className="h-8 border-[rgba(212,168,67,0.2)] bg-[#111] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="border-[rgba(212,168,67,0.2)] bg-[#111]">
                                {STATUSES.filter((s) => s !== 'All').map((s) => (
                                  <SelectItem key={s} value={s} className="text-xs">
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Priority dropdown */}
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                              Priority
                            </label>
                            <Select
                              value={idea.priority}
                              onValueChange={(val) =>
                                handleUpdateIdea(idea.id, { priority: val })
                              }
                            >
                              <SelectTrigger className="h-8 border-[rgba(212,168,67,0.2)] bg-[#111] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="border-[rgba(212,168,67,0.2)] bg-[#111]">
                                {PRIORITIES.map((p) => (
                                  <SelectItem
                                    key={p}
                                    value={p}
                                    className="text-xs capitalize"
                                  >
                                    {p}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Delete button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteIdea(idea.id)}
                          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400 text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1.5" />
                          Delete Idea
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoadingIdeas && filteredIdeas.length === 0 && (
          <Card className="gold-card border-0">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="h-10 w-10 text-[#D4A843]/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                {savedIdeas.length === 0
                  ? 'No saved ideas yet. Generate some ideas above!'
                  : 'No ideas match the selected filters.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}