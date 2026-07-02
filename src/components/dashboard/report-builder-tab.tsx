'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  FileBarChart2,
  FileText,
  FileSpreadsheet,
  Download,
  Share2,
  Trash2,
  Plus,
  Sparkles,
  Zap,
  Eye,
  Search,
  Shield,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Settings,
  ImageIcon,
  BookOpen,
  BarChart3,
  Target,
  Users,
  TrendingUp,
  Check,
  X,
  ChevronRight,
  Loader2,
  Clock,
  HardDrive,
  File,
  ArrowRight,
  Palette,
  Type,
  Stamp,
  Printer,
  Lock,
  Globe2,
  CalendarDays,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  pages: number;
  type: string;
}

interface RecentReport {
  id: string;
  name: string;
  template: string;
  generatedAt: string;
  dateRange: string;
  pages: number;
  format: string;
  size: string;
  status: string;
}

interface AuditCategory {
  name: string;
  score: number;
  icon: string;
  issues: number;
  color: string;
}

interface AuditIssue {
  title: string;
  category: string;
  severity: string;
  impact: string;
  recommendation: string;
}

interface PassedCheck {
  title: string;
  category: string;
}

interface AuditData {
  overallScore: number;
  categories: AuditCategory[];
  criticalIssues: AuditIssue[];
  warnings: AuditIssue[];
  passedChecks: PassedCheck[];
}

interface ApiResponse {
  reportTemplates: ReportTemplate[];
  recentReports: RecentReport[];
  auditData: AuditData;
}

// ─── Template icon map ───────────────────────────────────────

const templateIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  executive: TrendingUp,
  monthly: BarChart3,
  campaign: Target,
  seo: Search,
  social: Users,
  competitor: Globe2,
};

const templateTypeLabels: Record<string, string> = {
  executive: 'Executive',
  monthly: 'Monthly',
  campaign: 'Campaign',
  seo: 'SEO',
  social: 'Social',
  competitor: 'Competitor',
};

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Eye,
  Search,
  Shield,
  CheckCircle,
};

// ─── Circular Gauge Component ────────────────────────────────

function AuditGauge({ score }: { score: number }) {
  const radius = 80;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#22c55e';
    if (s >= 60) return '#D4A843';
    if (s >= 40) return '#eab308';
    return '#ef4444';
  };

  const color = getScoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border/30"
        />
        {/* Glow filter */}
        <defs>
          <filter id="gauge-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4A843" />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor="#D4A843" />
          </linearGradient>
        </defs>
        {/* Progress ring */}
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="url(#gauge-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          filter="url(#gauge-glow)"
        />
        {/* Tick marks */}
        {Array.from({ length: 20 }).map((_, i) => {
          const angle = (i / 20) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x1 = 100 + (radius + 15) * Math.cos(rad);
          const y1 = 100 + (radius + 15) * Math.sin(rad);
          const x2 = 100 + (radius + 20) * Math.cos(rad);
          const y2 = 100 + (radius + 20) * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 5 === 0 ? '#D4A843' : 'currentColor'}
              strokeWidth={i % 5 === 0 ? 2 : 1}
              className="text-border/40"
            />
          );
        })}
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-5xl font-bold tracking-tight"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">
          out of 100
        </span>
      </div>
    </div>
  );
}

// ─── Report Cover Preview ────────────────────────────────────

function ReportPreview({
  reportName,
  dateRange,
  pages,
  companyName,
  tagline,
  accentColor,
  includeLogo,
}: {
  reportName: string;
  dateRange: string;
  pages: number;
  companyName: string;
  tagline: string;
  accentColor: string;
  includeLogo: boolean;
}) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="premium-card overflow-hidden max-w-sm mx-auto">
      {/* Page frame */}
      <div className="bg-[#fafaf8] rounded-lg shadow-2xl aspect-[8.5/11] relative overflow-hidden flex flex-col">
        {/* Gold gradient header bar */}
        <div
          className="h-3 w-full"
          style={{
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88, ${accentColor})`,
          }}
        />
        {/* Confidential watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] pointer-events-none select-none">
          <span className="text-7xl font-bold text-black/[0.03] tracking-[0.3em] uppercase">Confidential</span>
        </div>
        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
          {/* Logo area */}
          {includeLogo && (
            <div className="mb-6">
              <div
                className="h-16 w-16 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
              >
                <span className="text-white font-bold text-2xl tracking-wider">L</span>
              </div>
            </div>
          )}
          {/* Company name */}
          <p className="text-lg font-semibold tracking-[0.3em] uppercase" style={{ color: accentColor }}>
            {companyName}
          </p>
          {/* Tagline */}
          <p className="text-[10px] text-gray-500 tracking-wider mt-1">{tagline}</p>
          {/* Divider */}
          <div className="w-16 h-px my-6" style={{ backgroundColor: accentColor }} />
          {/* Report title */}
          <h3 className="text-xl font-bold text-gray-900 text-center leading-tight">{reportName || 'Untitled Report'}</h3>
          {/* Date range */}
          <p className="text-sm text-gray-500 mt-3">{dateRange || 'Select a date range'}</p>
          {/* Meta info */}
          <div className="flex items-center gap-4 mt-6 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <File className="h-3 w-3" /> {pages} pages
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {today}
            </span>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-[8px] text-gray-300 tracking-wider uppercase">Generated by Laxree Marketing Suite</span>
          <div className="h-1 w-12 rounded-full" style={{ backgroundColor: accentColor }} />
        </div>
        {/* Side accent */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: `linear-gradient(180deg, ${accentColor}, transparent, ${accentColor})` }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export default function ReportBuilderTab() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Builder state
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportName, setReportName] = useState('');
  const [dateRange, setDateRange] = useState('this-month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [format, setFormat] = useState('pdf');
  const [brandingOn, setBrandingOn] = useState(true);
  const [companyName, setCompanyName] = useState('Laxree Jewellery');
  const [tagline, setTagline] = useState('Timeless Elegance, Crafted with Passion');
  const [accentColor, setAccentColor] = useState('#D4A843');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [includeFooter, setIncludeFooter] = useState(true);

  // Audit state
  const [auditing, setAuditing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/marketing/report-builder');
      const json = await res.json();
      setData(json);
    } catch {
      toast.error('Failed to load report builder data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerateReport = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/marketing/report-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          dateRange:
            dateRange === 'custom'
              ? `${customFrom} to ${customTo}`
              : dateRange,
          format,
          brandSettings: brandingOn
            ? { companyName, tagline, accentColor, includeLogo, includeFooter }
            : undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        // Add to recent reports locally
        if (data) {
          setData({
            ...data,
            recentReports: [json.report, ...data.recentReports],
          });
        }
      }
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (report: RecentReport) => {
    toast.success(`Report downloaded: ${report.name}.${report.format}`);
  };

  const handleShare = (report: RecentReport) => {
    toast.success(`Share link copied for: ${report.name}`);
  };

  const handleDelete = (report: RecentReport) => {
    if (data) {
      setData({
        ...data,
        recentReports: data.recentReports.filter((r) => r.id !== report.id),
      });
      toast.success(`Report deleted: ${report.name}`);
    }
  };

  const handleRunAudit = () => {
    setAuditing(true);
    setTimeout(() => {
      setAuditing(false);
      toast.success('Full audit completed successfully');
    }, 3000);
  };

  const getDateRangeLabel = (value: string) => {
    const map: Record<string, string> = {
      custom: 'Custom',
      'last-7': 'Last 7 Days',
      'last-30': 'Last 30 Days',
      'last-90': 'Last 90 Days',
      'this-month': 'This Month',
      'last-month': 'Last Month',
      'this-quarter': 'This Quarter',
      'this-year': 'This Year',
    };
    return map[value] || value;
  };

  // ─── Loading ──────────────────────────────────────────────

  if (loading || !data) {
    return (
      <div className="space-y-6 p-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const templateList = data.reportTemplates;
  const recentList = data.recentReports;
  const audit = data.auditData;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center shadow-lg shadow-[#D4A843]/20">
            <ClipboardList className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Report Builder & Audit</h1>
            <p className="text-sm text-muted-foreground">Create reports & audit your website</p>
          </div>
        </div>
        <Button
          onClick={handleGenerateReport}
          disabled={generating || !selectedTemplate}
          className="btn-gold hover-scale-sm"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Generate New Report
        </Button>
      </div>

      {/* Sub-tabs */}
      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="bg-[#111] border border-border/50 p-1 h-auto">
          <TabsTrigger value="builder" className="data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843] text-muted-foreground px-4 py-2 text-sm gap-2 transition-all">
            <FileBarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Report Builder</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843] text-muted-foreground px-4 py-2 text-sm gap-2 transition-all">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Website Audit</span>
          </TabsTrigger>
          <TabsTrigger value="generated" className="data-[state=active]:bg-[#D4A843]/15 data-[state=active]:text-[#D4A843] text-muted-foreground px-4 py-2 text-sm gap-2 transition-all">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Generated Reports</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── REPORT BUILDER SUB-TAB ──────────────────────── */}
        <TabsContent value="builder" className="space-y-8 animate-fade-in-up">
          {/* Template Selection */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-[#D4A843]" />
              <h2 className="text-lg font-semibold text-foreground section-heading">Choose a Template</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {templateList.map((tmpl) => {
                const Icon = templateIcons[tmpl.type] || FileText;
                const isSelected = selectedTemplate?.id === tmpl.id;
                return (
                  <motion.div
                    key={tmpl.id}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      className={`card-hover-border relative cursor-pointer transition-all duration-300 ${
                        isSelected ? 'border-[#D4A843]/60 bg-[#D4A843]/5 shadow-lg shadow-[#D4A843]/10' : ''
                      }`}
                      onClick={() => {
                        setSelectedTemplate(tmpl);
                        setReportName(`${tmpl.name} - ${getDateRangeLabel(dateRange)}`);
                      }}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <div className="h-5 w-5 rounded-full gold-gradient flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'gold-gradient' : 'bg-[#D4A843]/10'}`}>
                            <Icon className={`h-5 w-5 ${isSelected ? 'text-primary-foreground' : 'text-[#D4A843]'}`} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground text-sm">{tmpl.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{tmpl.description}</p>
                          </div>
                        </div>
                        {/* Section badges */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {tmpl.sections.slice(0, 3).map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px] px-2 py-0 border-border/50 text-muted-foreground">
                              {s}
                            </Badge>
                          ))}
                          {tmpl.sections.length > 3 && (
                            <Badge variant="outline" className="text-[10px] px-2 py-0 border-[#D4A843]/30 text-[#D4A843]">
                              +{tmpl.sections.length - 3}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <File className="h-3 w-3" /> {tmpl.pages} pages
                          </span>
                          <Badge className={`text-[10px] ${isSelected ? 'badge-gold' : 'bg-[#1a1a1a] text-muted-foreground border border-border/50'}`}>
                            {templateTypeLabels[tmpl.type] || tmpl.type}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Customize Panel */}
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass-premium rounded-2xl border border-border/50 overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-[#D4A843]" />
                  <h2 className="text-lg font-semibold text-foreground">Customize Report</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Form */}
                  <div className="space-y-5">
                    {/* Report Name */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Report Name</Label>
                      <Input
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        placeholder="Enter report name"
                        className="bg-[#111] border-border/50 focus-gold"
                      />
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Date Range</Label>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="bg-[#111] border-border/50 focus-gold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom</SelectItem>
                          <SelectItem value="last-7">Last 7 Days</SelectItem>
                          <SelectItem value="last-30">Last 30 Days</SelectItem>
                          <SelectItem value="last-90">Last 90 Days</SelectItem>
                          <SelectItem value="this-month">This Month</SelectItem>
                          <SelectItem value="last-month">Last Month</SelectItem>
                          <SelectItem value="this-quarter">This Quarter</SelectItem>
                          <SelectItem value="this-year">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Custom date inputs */}
                    {dateRange === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 gap-3"
                      >
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">From</Label>
                          <Input
                            type="date"
                            value={customFrom}
                            onChange={(e) => setCustomFrom(e.target.value)}
                            className="bg-[#111] border-border/50 focus-gold text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">To</Label>
                          <Input
                            type="date"
                            value={customTo}
                            onChange={(e) => setCustomTo(e.target.value)}
                            className="bg-[#111] border-border/50 focus-gold text-sm"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Format */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Format</Label>
                      <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger className="bg-[#111] border-border/50 focus-gold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="both">Both (PDF + Excel)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Branding Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#111] border border-border/30">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-[#D4A843]" />
                        <Label className="text-sm text-foreground">Include Laxree branding</Label>
                      </div>
                      <button
                        onClick={() => setBrandingOn(!brandingOn)}
                        className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${brandingOn ? 'bg-[#D4A843]' : 'bg-border'}`}
                      >
                        <motion.div
                          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md"
                          animate={{ left: brandingOn ? '22px' : '2px' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>

                    {/* Brand Settings */}
                    <AnimatePresence>
                      {brandingOn && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 overflow-hidden"
                        >
                          <Separator className="bg-border/30" />
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Brand Settings</p>

                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Type className="h-3 w-3" /> Company Name
                            </Label>
                            <Input
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              className="bg-[#111] border-border/50 focus-gold text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Stamp className="h-3 w-3" /> Tagline
                            </Label>
                            <Input
                              value={tagline}
                              onChange={(e) => setTagline(e.target.value)}
                              className="bg-[#111] border-border/50 focus-gold text-sm"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Palette className="h-3 w-3" /> Accent Color
                            </Label>
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <input
                                  type="color"
                                  value={accentColor}
                                  onChange={(e) => setAccentColor(e.target.value)}
                                  className="h-9 w-14 cursor-pointer rounded-lg border border-border/50 bg-transparent"
                                />
                              </div>
                              <Input
                                value={accentColor}
                                onChange={(e) => setAccentColor(e.target.value)}
                                className="bg-[#111] border-border/50 focus-gold text-sm font-mono max-w-[140px]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0a0a] border border-border/20">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <ImageIcon className="h-3 w-3" /> Include Logo
                            </Label>
                            <button
                              onClick={() => setIncludeLogo(!includeLogo)}
                              className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${includeLogo ? 'bg-[#D4A843]' : 'bg-border'}`}
                            >
                              <motion.div
                                className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
                                animate={{ left: includeLogo ? '18px' : '2px' }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0a0a0a] border border-border/20">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Printer className="h-3 w-3" /> Include Footer
                            </Label>
                            <button
                              onClick={() => setIncludeFooter(!includeFooter)}
                              className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${includeFooter ? 'bg-[#D4A843]' : 'bg-border'}`}
                            >
                              <motion.div
                                className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
                                animate={{ left: includeFooter ? '18px' : '2px' }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                              />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Generate Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleGenerateReport}
                        disabled={generating}
                        className="w-full gold-gradient text-primary-foreground font-semibold py-5 text-sm hover:shadow-lg hover:shadow-[#D4A843]/25 transition-shadow duration-300"
                      >
                        {generating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Report...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate Report
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>

                  {/* Right: Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[#D4A843]" />
                      <h3 className="text-sm font-medium text-muted-foreground">Cover Page Preview</h3>
                    </div>
                    <ReportPreview
                      reportName={reportName}
                      dateRange={dateRange === 'custom' ? `${customFrom || '...'} to ${customTo || '...'}` : getDateRangeLabel(dateRange)}
                      pages={selectedTemplate.pages}
                      companyName={brandingOn ? companyName : 'Custom Brand'}
                      tagline={brandingOn ? tagline : ''}
                      accentColor={brandingOn ? accentColor : '#888888'}
                      includeLogo={brandingOn && includeLogo}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </TabsContent>

        {/* ─── WEBSITE AUDIT SUB-TAB ───────────────────────── */}
        <TabsContent value="audit" className="space-y-8 animate-fade-in-up">
          {/* Overall Score */}
          <Card className="glass-premium border-border/50 overflow-hidden">
            <CardContent className="p-8 flex flex-col lg:flex-row items-center gap-8">
              <div className="flex flex-col items-center">
                <AuditGauge score={audit.overallScore} />
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Based on <span className="text-[#D4A843] font-semibold">45 checks</span> across{' '}
                  <span className="text-[#D4A843] font-semibold">5 categories</span>
                </p>
              </div>
              <div className="flex-1 w-full">
                <h3 className="text-lg font-semibold text-foreground mb-4">Category Breakdown</h3>
                <div className="space-y-4">
                  {audit.categories.map((cat) => {
                    const CatIcon = categoryIconMap[cat.icon] || Zap;
                    return (
                      <div key={cat.name} className="flex items-center gap-4">
                        <div className="flex items-center gap-2 w-32 shrink-0">
                          <CatIcon className="h-4 w-4" style={{ color: cat.color }} />
                          <span className="text-sm text-muted-foreground">{cat.name}</span>
                        </div>
                        <div className="flex-1">
                          <div className="h-2.5 rounded-full bg-border/30 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: cat.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${cat.score}%` }}
                              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-bold w-10 text-right" style={{ color: cat.color }}>
                          {cat.score}
                        </span>
                        <Badge variant="outline" className={`text-[10px] ${cat.issues > 3 ? 'border-red-500/30 text-red-400' : cat.issues > 1 ? 'border-[#D4A843]/30 text-[#D4A843]' : 'border-green-500/30 text-green-400'}`}>
                          {cat.issues} {cat.issues === 1 ? 'issue' : 'issues'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Score Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 stagger-children">
            {audit.categories.map((cat) => {
              const CatIcon = categoryIconMap[cat.icon] || Zap;
              return (
                <Card key={cat.name} className="premium-card hover-scale-sm transition-all duration-300">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cat.color}15` }}>
                      <CatIcon className="h-5 w-5" style={{ color: cat.color }} />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{cat.name}</span>
                    <span className="text-2xl font-bold" style={{ color: cat.color }}>
                      {cat.score}
                    </span>
                    <div className="w-full h-1.5 rounded-full bg-border/30 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.score}%` }}
                        transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                    <Badge variant="outline" className="text-[10px] border-border/30 text-muted-foreground">
                      {cat.issues} issues
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Critical Issues */}
          <div className="relative corner-accent rounded-2xl overflow-hidden">
            <Card className="border-red-500/20 bg-red-500/[0.03]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  Critical Issues
                  <Badge className="badge-red text-[10px] ml-2">{audit.criticalIssues.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {audit.criticalIssues.map((issue, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-xl bg-[#111] border border-red-500/10 hover:border-red-500/25 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-sm">{issue.title}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className="badge-red text-[10px]">
                            {issue.category}
                          </Badge>
                          <span className="text-xs text-red-400/70">Impact: {issue.impact}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
                          <ArrowRight className="h-3 w-3 mt-0.5 text-[#D4A843] shrink-0" />
                          {issue.recommendation}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 shrink-0 text-xs"
                      >
                        Fix Now
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Warnings */}
          <Card className="border-[#eab308]/20 bg-[#eab308]/[0.03]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[#eab308]">
                <AlertTriangle className="h-5 w-5" />
                Warnings
                <Badge className="badge-yellow text-[10px] ml-2">{audit.warnings.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {audit.warnings.map((issue, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  className="p-4 rounded-xl bg-[#111] border border-[#eab308]/10 hover:border-[#eab308]/25 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-sm">{issue.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="outline" className="badge-yellow text-[10px]">
                          {issue.category}
                        </Badge>
                        <span className="text-xs text-[#eab308]/70">Impact: {issue.impact}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
                        <ArrowRight className="h-3 w-3 mt-0.5 text-[#D4A843] shrink-0" />
                        {issue.recommendation}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#eab308]/30 text-[#eab308] hover:bg-[#eab308]/10 shrink-0 text-xs"
                    >
                      Review
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Passed Checks */}
          <Card className="border-green-500/20 bg-green-500/[0.03]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-5 w-5" />
                Passed Checks
                <Badge className="badge-green text-[10px] ml-2">{audit.passedChecks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {audit.passedChecks.map((check, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 + 0.5 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#111] border border-green-500/10"
                  >
                    <div className="h-7 w-7 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{check.title}</p>
                      <p className="text-[10px] text-muted-foreground">{check.category}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Run Full Audit */}
          <div className="flex justify-center">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={handleRunAudit}
                disabled={auditing}
                className="btn-gold hover-scale-sm px-8 py-6 text-sm"
              >
                {auditing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running Full Audit...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Full Audit
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </TabsContent>

        {/* ─── GENERATED REPORTS SUB-TAB ───────────────────── */}
        <TabsContent value="generated" className="space-y-6 animate-fade-in-up">
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            <Card className="premium-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3 w-3" /> Total Reports
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">{recentList.length}</p>
              </CardContent>
            </Card>
            <Card className="premium-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3" /> This Month
                </p>
                <p className="text-2xl font-bold text-[#D4A843] mt-1">
                  {recentList.filter((r) => r.generatedAt.startsWith('2025-06')).length}
                </p>
              </CardContent>
            </Card>
            <Card className="premium-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3" /> Avg Pages
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {Math.round(recentList.reduce((a, r) => a + r.pages, 0) / recentList.length)}
                </p>
              </CardContent>
            </Card>
            <Card className="premium-card">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <HardDrive className="h-3 w-3" /> Storage Used
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {(recentList.reduce((a, r) => {
                    const num = parseFloat(r.size);
                    return a + (isNaN(num) ? 0 : num);
                  }, 0)).toFixed(1)}{' '}
                  <span className="text-sm font-normal text-muted-foreground">MB</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Reports Table */}
          <Card className="glass-premium border-border/50 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#D4A843]" />
                All Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="text-xs text-muted-foreground">Name</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Template</TableHead>
                      <TableHead className="text-xs text-muted-foreground hidden sm:table-cell">Date Range</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Format</TableHead>
                      <TableHead className="text-xs text-muted-foreground hidden md:table-cell">Size</TableHead>
                      <TableHead className="text-xs text-muted-foreground hidden md:table-cell">Pages</TableHead>
                      <TableHead className="text-xs text-muted-foreground">Status</TableHead>
                      <TableHead className="text-xs text-muted-foreground hidden lg:table-cell">Generated</TableHead>
                      <TableHead className="text-xs text-muted-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentList.map((report) => (
                      <TableRow key={report.id} className="table-row-hover border-border/20">
                        <TableCell className="font-medium text-sm text-foreground">
                          <div className="flex items-center gap-2">
                            {report.format === 'pdf' ? (
                              <FileText className="h-4 w-4 text-red-400 shrink-0" />
                            ) : (
                              <FileSpreadsheet className="h-4 w-4 text-green-400 shrink-0" />
                            )}
                            <span className="truncate max-w-[180px]">{report.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] border-[#D4A843]/30 text-[#D4A843]">
                            {templateTypeLabels[report.template] || report.template}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                          {report.dateRange}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] ${
                              report.format === 'pdf'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-green-500/10 text-green-400 border border-green-500/20'
                            }`}
                          >
                            {report.format.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                          {report.size}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                          {report.pages}
                        </TableCell>
                        <TableCell>
                          <Badge className={`badge-dot-green text-[10px]`}>Ready</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                          {report.generatedAt}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-[#D4A843] hover:bg-[#D4A843]/10"
                              onClick={() => handleDownload(report)}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-[#D4A843] hover:bg-[#D4A843]/10"
                              onClick={() => handleShare(report)}
                            >
                              <Share2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => handleDelete(report)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}