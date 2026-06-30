'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  Loader2,
  Lightbulb,
  FileEdit,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from 'date-fns';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ContentItem {
  id: string;
  title: string;
  type: string;
  platform: string;
  status: string;
  scheduledAt: string;
  description: string;
}

interface StatusCounts {
  published: number;
  scheduled: number;
  in_progress: number;
  planned: number;
  draft: number;
}

interface CalendarData {
  items: ContentItem[];
  types: string[];
  platforms: string[];
  statusCounts: StatusCounts;
}

type ViewMode = 'calendar' | 'list';

// ─── Constants ───────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Blog: 'bg-[#D4A843]/20 text-[#D4A843]',
  Social: 'bg-green-500/20 text-green-400',
  Video: 'bg-purple-500/20 text-purple-400',
  Email: 'bg-blue-500/20 text-blue-400',
  Story: 'bg-pink-500/20 text-pink-400',
};

const TYPE_DOT_COLORS: Record<string, string> = {
  Blog: 'bg-[#D4A843]',
  Social: 'bg-green-400',
  Video: 'bg-purple-400',
  Email: 'bg-blue-400',
  Story: 'bg-pink-400',
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  published: 'badge-green',
  scheduled: 'badge-blue',
  in_progress: 'badge-yellow',
  planned: 'badge-gold',
  draft: 'badge-red',
};

const STATUS_LABELS: Record<string, string> = {
  published: 'Published',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  planned: 'Planned',
  draft: 'Draft',
};

const STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  published: CheckCircle2,
  scheduled: Clock,
  in_progress: Loader2,
  planned: Lightbulb,
  draft: FileEdit,
};

const STATUS_ICON_COLORS: Record<string, string> = {
  published: 'text-green-400',
  scheduled: 'text-blue-400',
  in_progress: 'text-yellow-400',
  planned: 'text-[#D4A843]',
  draft: 'text-red-400',
};

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TYPE_OPTIONS = ['All', 'Blog', 'Social', 'Video', 'Email', 'Story'];
const PLATFORM_OPTIONS = [
  'All',
  'Instagram',
  'Facebook',
  'Twitter',
  'Pinterest',
  'Website',
  'Email',
  'YouTube',
];
const STATUS_OPTIONS = [
  'All',
  'Published',
  'Scheduled',
  'In Progress',
  'Planned',
  'Draft',
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function CalendarTab() {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [filterType, setFilterType] = useState('All');
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // ── Dialog form state ──
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('');
  const [formPlatform, setFormPlatform] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('');

  // ── Fetch data ──
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/calendar');
      const json = await res.json();
      setData(json);
    } catch {
      console.error('Failed to fetch calendar data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Navigation ──
  const goToPrevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const goToNextMonth = () => setCurrentMonth((m) => addMonths(m, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // ── Calendar grid days ──
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // ── Get items for a specific day ──
  const getItemsForDay = useCallback(
    (day: Date) => {
      if (!data) return [];
      return data.items.filter((item) => isSameDay(new Date(item.scheduledAt), day));
    },
    [data]
  );

  // ── Filtered items ──
  const filteredItems = useMemo(() => {
    if (!data) return [];
    let list = [...data.items];
    if (filterType !== 'All') list = list.filter((i) => i.type === filterType);
    if (filterPlatform !== 'All')
      list = list.filter((i) => i.platform === filterPlatform);
    if (filterStatus !== 'All') {
      const statusVal = filterStatus.toLowerCase().replace(/\s+/g, '_');
      list = list.filter((i) => i.status === statusVal);
    }
    return list.sort((a, b) => {
      const dateA = new Date(a.scheduledAt).getTime();
      const dateB = new Date(b.scheduledAt).getTime();
      return sortDir === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [data, filterType, filterPlatform, filterStatus, sortDir]);

  // ── Status counts (fallback) ──
  const statusCounts = useMemo<StatusCounts>(() => {
    if (data?.statusCounts) return data.statusCounts;
    if (!data) return { published: 0, scheduled: 0, in_progress: 0, planned: 0, draft: 0 };
    const counts: StatusCounts = { published: 0, scheduled: 0, in_progress: 0, planned: 0, draft: 0 };
    data.items.forEach((item) => {
      const key = item.status as keyof StatusCounts;
      if (key in counts) counts[key]++;
    });
    return counts;
  }, [data]);

  // ── Reset form ──
  const resetForm = () => {
    setFormTitle('');
    setFormType('');
    setFormPlatform('');
    setFormDate('');
    setFormDescription('');
    setFormStatus('');
  };

  // ── Handle save ──
  const handleSave = async () => {
    if (!formTitle || !formType || !formPlatform || !formDate || !formStatus) return;
    setSaving(true);
    try {
      await fetch('/api/marketing/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          type: formType,
          platform: formPlatform,
          scheduledAt: formDate,
          description: formDescription,
          status: formStatus.toLowerCase().replace(/\s+/g, '_'),
        }),
      });
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch {
      console.error('Failed to save content item');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle sort ──
  const toggleSort = () => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));

  // ─── Loading Skeleton ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="mb-1 h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        {/* Filters skeleton */}
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        {/* Calendar skeleton */}
        <Card className="gold-card border-0">
          <CardContent className="p-4">
            <Skeleton className="mx-auto mb-4 h-6 w-40" />
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Content Calendar</h2>
          <p className="text-sm text-muted-foreground">
            Plan and schedule your content across all platforms
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="mt-2 bg-gradient-to-r from-[#B8922F] to-[#D4A843] text-black font-medium hover:from-[#D4A843] hover:to-[#E8C46A] sm:mt-0"
        >
          <Plus className="size-4" />
          Add Content
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {(
          [
            { key: 'published', label: 'Published', Icon: CheckCircle2, color: 'text-green-400' },
            { key: 'scheduled', label: 'Scheduled', Icon: Clock, color: 'text-blue-400' },
            { key: 'in_progress', label: 'In Progress', Icon: Loader2, color: 'text-yellow-400' },
            { key: 'planned', label: 'Planned', Icon: Lightbulb, color: 'text-[#D4A843]' },
            { key: 'draft', label: 'Draft', Icon: FileEdit, color: 'text-red-400' },
          ] as const
        ).map(({ key, label, Icon, color }) => (
          <Card key={key} className="gold-card border-0 gold-shimmer">
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/5 ${color}`}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="stat-animate text-xl font-bold text-foreground">
                  {statusCounts[key as keyof StatusCounts] ?? 0}
                </p>
                <p className="truncate text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Type filter */}
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger size="sm" className="w-[130px] border-white/10 bg-white/5 text-xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t} className="text-xs">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Platform filter */}
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger size="sm" className="w-[130px] border-white/10 bg-white/5 text-xs">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              {PLATFORM_OPTIONS.map((p) => (
                <SelectItem key={p} value={p} className="text-xs">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger size="sm" className="w-[130px] border-white/10 bg-white/5 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-[#D4A843]/20 text-[#D4A843]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="size-3.5" />
            <span className="hidden sm:inline">Calendar View</span>
            <span className="sm:hidden">Calendar</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-[#D4A843]/20 text-[#D4A843]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="size-3.5" />
            <span className="hidden sm:inline">List View</span>
            <span className="sm:hidden">List</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════ Calendar View ═══════════════════ */}
      {viewMode === 'calendar' && (
        <Card className="gold-card border-0">
          <CardContent className="p-4">
            {/* Month Navigation */}
            <div className="mb-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevMonth}
                className="size-8 text-muted-foreground hover:text-[#D4A843]"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <button
                onClick={goToToday}
                className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-[#D4A843] transition-colors"
              >
                <Calendar className="size-4 text-[#D4A843]" />
                {format(currentMonth, 'MMMM yyyy')}
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
                className="size-8 text-muted-foreground hover:text-[#D4A843]"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* Day-of-week headers */}
            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="py-1.5 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const inMonth = isSameMonth(day, currentMonth);
                const today = isToday(day);
                const dayItems = getItemsForDay(day);
                const hasEvents = dayItems.length > 0;

                // Apply filters to day items
                let filteredDayItems = dayItems;
                if (filterType !== 'All')
                  filteredDayItems = filteredDayItems.filter((i) => i.type === filterType);
                if (filterPlatform !== 'All')
                  filteredDayItems = filteredDayItems.filter(
                    (i) => i.platform === filterPlatform
                  );
                if (filterStatus !== 'All') {
                  const statusVal = filterStatus.toLowerCase().replace(/\s+/g, '_');
                  filteredDayItems = filteredDayItems.filter((i) => i.status === statusVal);
                }

                const hasFilteredEvents = filteredDayItems.length > 0;

                return (
                  <div
                    key={day.toISOString()}
                    className={`calendar-day relative min-h-[72px] rounded-md border border-transparent p-1.5 transition-colors sm:min-h-[90px] ${
                      !inMonth ? 'opacity-30' : ''
                    } ${today ? 'calendar-day-today' : ''} ${
                      hasEvents ? 'calendar-day-has-event' : ''
                    }`}
                  >
                    <span
                      className={`text-[11px] font-medium sm:text-xs ${
                        today ? 'text-[#D4A843] font-bold' : inMonth ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {hasFilteredEvents && (
                      <div className="mt-0.5 flex flex-col gap-0.5">
                        {filteredDayItems.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className={`truncate rounded px-1.5 py-px text-[9px] font-medium leading-tight sm:text-[10px] ${
                              TYPE_COLORS[item.type] || 'bg-white/10 text-foreground'
                            }`}
                            title={item.title}
                          >
                            {item.title}
                          </div>
                        ))}
                        {filteredDayItems.length > 3 && (
                          <span className="text-[9px] text-muted-foreground pl-1">
                            +{filteredDayItems.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    {hasEvents && !hasFilteredEvents && inMonth && (
                      <div className="mt-0.5 flex flex-col gap-0.5">
                        <span className="text-[9px] text-muted-foreground/50 pl-1 italic">
                          filtered out
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════ List View ═══════════════════ */}
      {viewMode === 'list' && (
        <Card className="gold-card border-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="gold-table-header border-0">
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Title
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Type
                    </TableHead>
                    <TableHead className="hidden text-[11px] uppercase tracking-wider text-muted-foreground md:table-cell">
                      Platform
                    </TableHead>
                    <TableHead
                      className="cursor-pointer text-[11px] uppercase tracking-wider text-muted-foreground"
                      onClick={toggleSort}
                    >
                      <span className="inline-flex items-center gap-1">
                        Scheduled Date
                        {sortDir === 'asc' ? (
                          <ChevronUp className="size-3" />
                        ) : (
                          <ChevronDown className="size-3" />
                        )}
                      </span>
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="w-10 text-[11px] uppercase tracking-wider text-muted-foreground">
                      <span className="sr-only">Expand</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        <Calendar className="mx-auto mb-2 size-8 text-[#D4A843]/30" />
                        <p className="text-sm">No content items found</p>
                        <p className="text-xs">Try adjusting your filters or add new content</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => {
                      const isExpanded = expandedRow === item.id;
                      const StatusIcon = STATUS_ICONS[item.status] || FileEdit;
                      return (
                        <TableRow
                          key={item.id}
                          className="border-0 border-b border-white/5 hover:bg-white/[0.03]"
                        >
                          {/* Title */}
                          <TableCell className="font-medium text-foreground text-sm max-w-[200px] sm:max-w-[280px]">
                            <span className="block truncate">{item.title}</span>
                            {/* Mobile: show platform here */}
                            <span className="block text-[10px] text-muted-foreground md:hidden">
                              {item.platform}
                            </span>
                          </TableCell>

                          {/* Type */}
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5 text-xs">
                              <span
                                className={`size-2 rounded-full ${
                                  TYPE_DOT_COLORS[item.type] || 'bg-gray-400'
                                }`}
                              />
                              {item.type}
                            </span>
                          </TableCell>

                          {/* Platform */}
                          <TableCell className="hidden md:table-cell">
                            <span className="text-xs text-muted-foreground">{item.platform}</span>
                          </TableCell>

                          {/* Date */}
                          <TableCell>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(item.scheduledAt), 'MMM d, yyyy')}
                            </span>
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                STATUS_BADGE_CLASS[item.status] || ''
                              }`}
                            >
                              <StatusIcon className="size-3" />
                              {STATUS_LABELS[item.status] || item.status}
                            </Badge>
                          </TableCell>

                          {/* Expand */}
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() =>
                                setExpandedRow(isExpanded ? null : item.id)
                              }
                            >
                              {isExpanded ? (
                                <ChevronUp className="size-3.5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="size-3.5 text-muted-foreground" />
                              )}
                            </Button>
                          </TableCell>

                          {/* Expanded description row */}
                          {isExpanded && (
                            <TableCell colSpan={6} className="border-0 bg-white/[0.02] px-6 py-3">
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Description</p>
                                <p className="text-sm text-foreground/80 leading-relaxed">
                                  {item.description || 'No description provided.'}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <span className={`size-1.5 rounded-full ${TYPE_DOT_COLORS[item.type] || 'bg-gray-400'}`} />
                                    {item.type}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">·</span>
                                  <span className="text-[10px] text-muted-foreground">{item.platform}</span>
                                  <span className="text-[10px] text-muted-foreground">·</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {format(new Date(item.scheduledAt), 'MMMM d, yyyy')}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════ Add Content Dialog ═══════════════════ */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="border-white/10 bg-[#111111] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Content</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Enter content title..."
                className="border-white/10 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:border-[#D4A843]/50 focus-visible:ring-[#D4A843]/20"
              />
            </div>

            {/* Type + Platform row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger className="border-white/10 bg-white/5 text-sm text-foreground">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.filter((t) => t !== 'All').map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Platform</label>
                <Select value={formPlatform} onValueChange={setFormPlatform}>
                  <SelectTrigger className="border-white/10 bg-white/5 text-sm text-foreground">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORM_OPTIONS.filter((p) => p !== 'All').map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date + Status row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Scheduled Date</label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="border-white/10 bg-white/5 text-sm text-foreground focus-visible:border-[#D4A843]/50 focus-visible:ring-[#D4A843]/20 [color-scheme:dark]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Status</label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger className="border-white/10 bg-white/5 text-sm text-foreground">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter((s) => s !== 'All').map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe this content item..."
                rows={3}
                className="border-white/10 bg-white/5 text-sm text-foreground placeholder:text-muted-foreground/50 focus-visible:border-[#D4A843]/50 focus-visible:ring-[#D4A843]/20 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formTitle || !formType || !formPlatform || !formDate || !formStatus}
              className="bg-gradient-to-r from-[#B8922F] to-[#D4A843] text-black font-medium hover:from-[#D4A843] hover:to-[#E8C46A] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}