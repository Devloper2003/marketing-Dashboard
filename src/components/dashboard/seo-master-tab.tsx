'use client';

import { useState, useEffect } from 'react';
import {
  Wand2, Search, TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight,
  FileText, Lightbulb, Shield, Zap, Eye, CheckCircle2, AlertTriangle, Info,
  Sparkles, Globe, ExternalLink, BarChart3, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { toast } from 'sonner';

const GOLD = '#D4A843';
const GOLD_LIGHT = '#E8C46A';

interface Keyword { keyword: string; currentPos: number; prevPos: number; searchVolume: number; difficulty: number; cpc: number; url: string; lastChecked: string; }
interface HealthScore { overall: number; performance: number; accessibility: number; seo: number; security: number; bestPractices: number; }
interface ContentSuggestion { title: string; type: string; keyword: string; traffic: number; difficulty: number; outline: string[]; }

function ScoreCircle({ score, size = 160, label }: { score: number; size?: number; label?: string }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  const offset = circ * 0.25;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(212,168,67,0.1)" strokeWidth="8" />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={offset + circ * (1 - pct)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground number-reveal">{score}</span>
          {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
        </div>
      </div>
    </div>
  );
}

function formatINR(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v}`;
}

export default function SeoMasterTab() {
  const [data, setData] = useState<{
    keywords: Keyword[]; rankDistribution: Record<string, number>; healthScore: HealthScore;
    backlinks: Record<string, unknown>; siteSpeed: Record<string, number>;
    weeklyTrend: { week: string; avgPos: number }[];
    contentSuggestions: ContentSuggestion[];
  } | null>(null);
  const [aiType, setAiType] = useState('blog');
  const [aiTopic, setAiTopic] = useState('');
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const [aiLength, setAiLength] = useState('medium');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    fetch('/api/marketing/seo-master').then(r => r.json()).then(setData);
  }, []);

  const handleAiGenerate = async () => {
    if (!aiTopic) { toast.error('Enter a topic'); return; }
    setAiLoading(true); setAiResult(null);
    try {
      const res = await fetch('/api/marketing/seo-master', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'ai-writer', type: aiType, topic: aiTopic, keywords: aiKeywords, tone: aiTone, length: aiLength }) });
      const r = await res.json();
      setAiResult(r); toast.success('Content generated!');
    } catch { toast.error('Generation failed'); }
    setAiLoading(false);
  };

  const handleAnalyze = async () => {
    toast.info('Running full website audit...');
    try {
      const res = await fetch('/api/marketing/seo-master', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'analyze' }) });
      const r = await res.json();
      toast.success(`Audit complete! Score: ${r.score}/100`);
    } catch { toast.error('Audit failed'); }
  };

  if (!data) return <div className="grid grid-cols-1 gap-4 p-1">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 skeleton-gold-bar rounded-xl" />)}</div>;

  const posDistData = [
    { name: 'Top 3', value: data.rankDistribution.top3, fill: '#22c55e' },
    { name: 'Top 10', value: data.rankDistribution.top10 - data.rankDistribution.top3, fill: GOLD_LIGHT },
    { name: 'Top 20', value: data.rankDistribution.top20 - data.rankDistribution.top10, fill: GOLD },
    { name: 'Top 50', value: data.rankDistribution.top50 - data.rankDistribution.top20, fill: '#9A7B24' },
    { name: 'Top 100', value: data.rankDistribution.top100 - data.rankDistribution.top50, fill: '#6B5B2E' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="section-heading"><Wand2 className="h-5 w-5 text-[#D4A843]" /> <h2 className="text-xl font-bold">AI SEO Master</h2></div>
          <p className="text-sm text-muted-foreground mt-1">AI-powered SEO optimization & content intelligence</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rank-tracker">
        <TabsList className="bg-[#111]/50 border-border/30 p-1 h-auto w-fit flex-wrap gap-1">
          <TabsTrigger value="rank-tracker" className="data-[state=active]:bg-[#D4A843]/10 data-[state=active]:text-[#D8A84B] text-muted-foreground text-xs px-3 py-1.5 rounded-lg transition-all">Rank Tracker</TabsTrigger>
          <TabsTrigger value="ai-writer" className="data-[state=active]:bg-[#D4A843]/10 data-[state=active]:text-[#D8A84B] text-muted-foreground text-xs px-3 py-1.5 rounded-lg transition-all">AI Content Writer</TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-[#D4A843]/10 data-[state=active]:text-[#D8A84B] text-muted-foreground text-xs px-3 py-1.5 rounded-lg transition-all">Website Audit</TabsTrigger>
          <TabsTrigger value="backlinks" className="data-[state=active]:bg-[#D4A843]/10 data-[state=active]:text-[#D8A84B] text-muted-foreground text-xs px-3 py-1.5 rounded-lg transition-all">Backlinks</TabsTrigger>
        </TabsList>

        {/* RANK TRACKER */}
        <TabsContent value="rank-tracker" className="space-y-6">
          {/* Health + Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 grid-fade-in">
            <div className="lg:col-span-2 premium-card p-6 flex items-center gap-6 justify-center">
              <ScoreCircle score={data.healthScore.overall} size={180} label={data.healthScore.overall >= 80 ? 'Excellent' : data.healthScore.overall >= 60 ? 'Good' : 'Needs Work'} />
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Website Health</p>
                <p className="text-lg font-semibold text-glow-gold-sm number-reveal">{data.keywords.length} Keywords Tracked</p>
              </div>
            </div>
            {[
              { label: 'Top 3 Keywords', value: data.rankDistribution.top3, icon: <TrendingUp className="h-4 w-4" />, color: 'text-green-400' },
              { label: 'Avg Position', value: (data.keywords.reduce((s, k) => s + k.currentPos, 0) / data.keywords.length).toFixed(1), icon: <BarChart3 className="h-4 w-4" />, color: 'text-[#D4A843]' },
              { label: 'Improved', value: data.keywords.filter(k => k.currentPos < k.prevPos).length, icon: <ArrowUpRight className="h-4 w-4" />, color: 'text-green-400' },
            ].map((s, i) => (
              <div key={i} className="premium-card p-4 metric-sparkle flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4A843]/10">{s.icon}</div>
                <div><p className="text-[11px] text-muted-foreground">{s.label}</p><p className={`text-xl font-bold ${s.color} count-up-smooth`}>{s.value}</p></div>
              </div>
            ))}
          </div>

          {/* Position Distribution */}
          <div className="premium-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-[#D4A843]" /> Position Distribution</h3>
            <div className="space-y-2">
              {posDistData.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16 text-right">{d.name}</span>
                  <div className="flex-1 h-6 rounded-full bg-[#1a1a1a] overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${(d.value / data.keywords.length) * 100}%`, background: d.fill }} /></div>
                  <span className="text-xs font-semibold text-foreground w-8">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords Table */}
          <div className="premium-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Keyword Rankings</h3>
            <ScrollArea className="max-h-[380px]">
              <table className="w-full text-sm">
                <thead><tr className="gold-table-header text-xs text-muted-foreground">
                  <th className="text-left py-2 px-3 font-medium">Keyword</th>
                  <th className="text-center py-2 px-2 font-medium">Pos</th>
                  <th className="text-center py-2 px-2 font-medium">Change</th>
                  <th className="text-right py-2 px-2 font-medium">Volume</th>
                  <th className="text-center py-2 px-2 font-medium">Difficulty</th>
                  <th className="text-right py-2 px-2 font-medium">CPC</th>
                </tr></thead>
                <tbody>
                  {data.keywords.map((kw, i) => {
                    const change = kw.prevPos - kw.currentPos;
                    return (
                      <tr key={i} className="table-row-hover border-b border-border/20 last:border-0">
                        <td className="py-2.5 px-3"><span className="text-foreground font-medium">{kw.keyword}</span></td>
                        <td className="text-center py-2.5 px-2">
                          <span className={`inline-flex items-center justify-center h-6 min-w-[24px] rounded-md text-xs font-bold ${kw.currentPos <= 3 ? 'bg-green-500/15 text-green-400' : kw.currentPos <= 10 ? 'bg-[#D4A843]/15 text-[#D4A843]' : kw.currentPos <= 20 ? 'bg-yellow-500/15 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
                            #{kw.currentPos}
                          </span>
                        </td>
                        <td className="text-center py-2.5 px-2">
                          {change > 0 ? (
                            <span className="inline-flex items-center gap-0.5 text-green-400 text-xs font-medium"><ArrowUpRight className="h-3 w-3" />+{change}</span>
                          ) : change < 0 ? (
                            <span className="inline-flex items-center gap-0.5 text-red-400 text-xs font-medium"><ArrowDownRight className="h-3 w-3" />{change}</span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-muted-foreground text-xs"><Minus className="h-3 w-3" />0</span>
                          )}
                        </td>
                        <td className="text-right py-2.5 px-2 text-muted-foreground">{kw.searchVolume.toLocaleString()}</td>
                        <td className="text-center py-2.5 px-2"><div className="w-16 mx-auto"><Progress value={kw.difficulty} className="h-1.5 progress-gold" /></div></td>
                        <td className="text-right py-2.5 px-2 text-muted-foreground">{formatINR(kw.cpc)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollArea>
          </div>

          {/* Weekly Trend */}
          <div className="chart-container p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#D4A843]" /> Average Position Trend (8 Weeks)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.weeklyTrend}>
                <defs><linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={GOLD} stopOpacity={0.3} /><stop offset="100%" stopColor={GOLD} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212,168,67,0.06)" />
                <XAxis dataKey="week" tick={{ fill: '#9a9080', fontSize: 10 }} axisLine={{ stroke: 'rgba(212,168,67,0.1)' }} />
                <YAxis reversed domain={[25, 0]} tick={{ fill: '#9a9080', fontSize: 10 }} axisLine={false} />
                <Tooltip contentStyle={{ background: '#141414', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="avgPos" stroke={GOLD} strokeWidth={2} fill="url(#posGrad)" dot={{ r: 4, fill: GOLD, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* AI CONTENT WRITER */}
        <TabsContent value="ai-writer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Writer Form */}
            <div className="glass-premium rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#D4A843]" /> AI Content Writer</h3>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5">Content Type</label>
                <Select value={aiType} onValueChange={setAiType}>
                  <SelectTrigger className="gold-input w-full"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="blog">Blog Post</SelectItem><SelectItem value="product">Product Description</SelectItem><SelectItem value="listicle">Listicle</SelectItem><SelectItem value="howto">How-To Guide</SelectItem><SelectItem value="comparison">Comparison</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5">Topic</label>
                <Input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g., Gold Necklace Trends 2025" className="gold-input w-full" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5">Target Keywords</label>
                <Input value={aiKeywords} onChange={(e) => setAiKeywords(e.target.value)} placeholder="gold, luxury, necklace" className="gold-input w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5">Tone</label>
                  <Select value={aiTone} onValueChange={setAiTone}>
                    <SelectTrigger className="gold-input w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="professional">Professional</SelectItem><SelectItem value="luxurious">Luxurious</SelectItem><SelectItem value="casual">Casual</SelectItem><SelectItem value="educational">Educational</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5">Length</label>
                  <Select value={aiLength} onValueChange={setAiLength}>
                    <SelectTrigger className="gold-input w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="short">Short (500w)</SelectItem><SelectItem value="medium">Medium (1000w)</SelectItem><SelectItem value="long">Long (2000w)</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAiGenerate} disabled={aiLoading} className="btn-gold w-full py-5 text-sm">
                {aiLoading ? <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse" /><span className="h-2 w-2 rounded-full bg-primary-foreground animate-pulse" style={{ animationDelay: '150ms' }} /><span>Generating with AI...</span></span> : <><Sparkles className="h-4 w-4 mr-2" />Generate with AI</>}
              </Button>
            </div>

            {/* Content Suggestions */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Lightbulb className="h-4 w-4 text-[#D4A843]" /> Content Suggestions</h3>
              <div className="space-y-2 grid-fade-in">
                {data.contentSuggestions.map((s, i) => (
                  <div key={i} className="premium-card p-4 hover-scale-sm cursor-pointer" onClick={() => { setAiTopic(s.keyword); setAiType(s.type); setAiKeywords(s.keyword); }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-foreground leading-tight">{s.title}</h4>
                      <Badge className="badge-dot-gold text-[10px] shrink-0">{s.type}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span><Search className="h-3 w-3 inline mr-1" />{s.keyword}</span>
                      <span><TrendingUp className="h-3 w-3 inline mr-1" />{s.traffic.toLocaleString()} est. traffic</span>
                      <span>Diff: {s.difficulty}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Result */}
          {aiResult && (
            <div className="animated-border rounded-xl p-0 overflow-hidden">
              <div className="bg-[#111] p-5 border-b border-[#D4A843]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold gold-gradient-text">{aiResult.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{aiResult.metaDescription}</p>
                  </div>
                  <Badge className="badge-dot-green">AI Generated</Badge>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Suggested Keywords</p>
                  <div className="flex flex-wrap gap-2">{aiResult.suggestedKeywords.map((k, i) => <Badge key={i} className="badge-gold">{k}</Badge>)}</div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Outline</p>
                  <ol className="space-y-1">{aiResult.outline.map((o, i) => <li key={i} className="flex items-start gap-2 text-sm text-foreground/80"><span className="text-[#D4A843] font-bold shrink-0">{i + 1}.</span>{o}</li>)}</ol>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
                  <div className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap bg-[#0a0a0a] rounded-lg p-4 max-h-[200px] overflow-y-auto table-scroll-gold">{aiResult.body}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-[#D4A843]/30 text-[#D4A843]">{aiResult.wordCount} words</Badge>
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => { navigator.clipboard.writeText(aiResult.body); toast.success('Content copied!'); }}>Copy</Button>
                  <Button size="sm" className="btn-gold text-xs px-3" onClick={() => toast.info('Opening blog planner...')}>Save to Blog</Button>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* WEBSITE AUDIT */}
        <TabsContent value="audit" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 grid-fade-in">
            <div className="lg:col-span-1 flex flex-col items-center gap-2 premium-card p-6">
              <ScoreCircle score={data.healthScore.overall} size={200} label="Overall Score" />
              <p className="text-xs text-center text-muted-foreground">Based on 45 checks across 5 categories</p>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'Performance', score: data.healthScore.performance, icon: <Zap className="h-5 w-5" />, issues: 2, color: '#22c55e' },
                { name: 'Accessibility', score: data.healthScore.accessibility, icon: <Eye className="h-5 w-5" />, issues: 1, color: '#22c55e' },
                { name: 'SEO', score: data.healthScore.seo, icon: <Search className="h-5 w-5" />, issues: 3, color: '#22c55e' },
                { name: 'Security', score: data.healthScore.security, icon: <Shield className="h-5 w-5" />, issues: 5, color: '#eab308' },
                { name: 'Best Practices', score: data.healthScore.bestPractices, icon: <CheckCircle2 className="h-5 w-5" />, issues: 4, color: GOLD },
              ].map((cat, i) => (
                <div key={i} className="premium-card p-4 hover-scale-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${cat.color}15` }}><span style={{ color: cat.color }}>{cat.icon}</span></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{cat.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={cat.score} className="h-1.5 flex-1 progress-gold" />
                        <span className="text-xs font-bold" style={{ color: cat.color }}>{cat.score}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${cat.issues > 3 ? 'border-red-400/40 text-red-400' : cat.issues > 0 ? 'border-yellow-400/40 text-yellow-400' : 'border-green-400/30 text-green-400'}`}>{cat.issues} issues</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleAnalyze} className="btn-gold"><RefreshCw className="h-4 w-4 mr-2" />Run Full Audit</Button>
        </TabsContent>

        {/* BACKLINKS */}
        <TabsContent value="backlinks" className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 grid-fade-in">
            {[
              { label: 'Referring Domains', value: (data.backlinks.referringDomains as number).toLocaleString(), icon: <Globe className="h-4 w-4" />, sub: '+12 this month' },
              { label: 'Total Backlinks', value: (data.backlinks.total as number).toLocaleString(), icon: <ExternalLink className="h-4 w-4" />, sub: '+180 this month' },
              { label: 'Domain Authority', value: data.backlinks.domainAuthority + '/100', icon: <BarChart3 className="h-4 w-4" />, sub: 'DA Score' },
              { label: 'New This Month', value: '180', icon: <TrendingUp className="h-4 w-4" />, sub: '+12.5%' },
            ].map((s, i) => (
              <div key={i} className="premium-card metric-sparkle p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4A843]/10 mb-3 text-[#D4A843]">{s.icon}</div>
                <p className="text-2xl font-bold gold-glow number-reveal">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                <p className="text-[10px] text-green-400 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Top Anchors */}
          <div className="premium-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><ExternalLink className="h-4 w-4 text-[#D4A843]" /> Top Anchor Texts</h3>
            <ScrollArea className="max-h-[250px]">
              <table className="w-full text-sm">
                <thead><tr className="gold-table-header text-xs"><th className="text-left py-2 px-4 font-medium">Anchor Text</th><th className="text-center py-2 px-4 font-medium">Backlinks</th><th className="text-left py-2 px-4 font-medium">Type</th></tr></thead>
                <tbody>
                  {(data.backlinks.topAnchors as { text: string; count: number; type: string }[]).map((a, i) => (
                    <tr key={i} className="table-row-hover border-b border-border/20 last:border-0">
                      <td className="py-2.5 px-4 text-foreground font-medium">{a.text}</td>
                      <td className="py-2.5 px-4 text-center"><Badge className="badge-gold">{a.count}</Badge></td>
                      <td className="py-2.5 px-4"><Badge className={a.type === 'brand' ? 'badge-gold' : 'badge-cyan'}>{a.type}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>

          {/* Site Speed */}
          <div className="premium-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Zap className="h-4 w-4 text-[#D4A843]" /> Core Web Vitals</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { label: 'FCP', value: data.siteSpeed.fcp + 's', desc: 'First Contentful Paint', score: data.siteSpeed.fcp, max: 2.5 },
                { label: 'LCP', value: data.siteSpeed.lcp + 's', desc: 'Largest Contentful Paint', score: data.siteSpeed.lcp, max: 4.0 },
                { label: 'CLS', value: data.siteSpeed.cls, desc: 'Cumulative Layout Shift', score: data.siteSpeed.cls, max: 0.1 },
                { label: 'TTFB', value: data.siteSpeed.ttfb + 's', desc: 'Time to First Byte', score: data.siteSpeed.ttfb, max: 0.8 },
                { label: 'Mobile', value: data.siteSpeed.mobile + 's', desc: 'Mobile Load Time', score: data.siteSpeed.mobile, max: 3.0 },
                { label: 'Desktop', value: data.siteSpeed.desktop + 's', desc: 'Desktop Load Time', score: data.siteSpeed.desktop, max: 3.0 },
              ].map((m, i) => {
                const ok = m.score <= m.max;
                const pct = Math.min((m.score / m.max) * 100, 100);
                return (
                  <div key={i} className="rounded-lg border border-border/30 bg-[#0d0d0d] p-3 hover-scale-sm transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-foreground">{m.label}</span>
                      <span className={`text-lg font-bold ${ok ? 'text-green-400' : 'text-red-400'}`}>{m.value}</span>
                    </div>
                    <Progress value={pct} className={`h-1.5 ${ok ? 'progress-gold' : ''}`} style={!ok ? { '--tw-progress-color': '#ef4444' } : {}} />
                    <p className="text-[10px] text-muted-foreground mt-1">{m.desc} (max {m.max})</p>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}