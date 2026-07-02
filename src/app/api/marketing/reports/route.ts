import { NextRequest, NextResponse } from 'next/server';

interface ReportMetric {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

interface MockReport {
  id: string;
  name: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'campaign' | 'seo' | 'social' | 'competitor' | 'budget';
  status: 'ready' | 'generating' | 'scheduled';
  generatedAt: string;
  dateRange: string;
  size: number;
  pages: number;
  keyMetrics: Record<string, ReportMetric>;
  summary: string;
}

const reports: MockReport[] = [
  {
    id: 'rpt-001',
    name: 'Weekly Performance Summary',
    type: 'weekly',
    status: 'ready',
    generatedAt: '2026-06-14T10:30:00Z',
    dateRange: 'Jun 8 - Jun 14, 2026',
    size: 245,
    pages: 12,
    keyMetrics: {
      totalVisits: { label: 'Total Visits', value: '24.8K', change: '+12.3%', positive: true },
      conversions: { label: 'Conversions', value: '142', change: '+8.1%', positive: true },
      revenue: { label: 'Revenue', value: '₹3.6L', change: '+15.4%', positive: true },
      bounceRate: { label: 'Bounce Rate', value: '32.1%', change: '-3.2%', positive: true },
    },
    summary: 'This week saw strong growth across all channels with a 12.3% increase in total visits driven primarily by social media campaigns. Conversion rates improved to 2.8% with the new product launch landing page outperforming previous pages by 40%. Revenue hit ₹3.6L, exceeding the weekly target by 18%.',
  },
  {
    id: 'rpt-002',
    name: 'Monthly Marketing Review - May 2026',
    type: 'monthly',
    status: 'ready',
    generatedAt: '2026-06-01T09:00:00Z',
    dateRange: 'May 1 - May 31, 2026',
    size: 412,
    pages: 24,
    keyMetrics: {
      totalSpend: { label: 'Total Spend', value: '₹6.48L', change: '+5.2%', positive: false },
      totalRevenue: { label: 'Revenue', value: '₹14.2L', change: '+18.7%', positive: true },
      roas: { label: 'ROAS', value: '2.19x', change: '+0.32x', positive: true },
      newLeads: { label: 'New Leads', value: '1,247', change: '+22.1%', positive: true },
    },
    summary: 'May 2026 was a standout month with ROAS reaching 2.19x, the highest in Q2. Paid ads contributed 52% of total revenue while organic channels showed 30% YoY growth. The Diwali early-bird campaign drove 380 new leads alone. Budget utilization was 89.5% with video production slightly under-spent.',
  },
  {
    id: 'rpt-003',
    name: 'Diwali Collection Campaign Deep Dive',
    type: 'campaign',
    status: 'ready',
    generatedAt: '2026-06-13T14:15:00Z',
    dateRange: 'May 15 - Jun 13, 2026',
    size: 389,
    pages: 18,
    keyMetrics: {
      impressions: { label: 'Impressions', value: '1.2M', change: '+45%', positive: true },
      clicks: { label: 'Clicks', value: '38.4K', change: '+32%', positive: true },
      cpc: { label: 'Avg CPC', value: '₹18.40', change: '-8.5%', positive: true },
      conversions: { label: 'Conversions', value: '412', change: '+28%', positive: true },
    },
    summary: 'The Diwali Collection campaign continues to exceed expectations with ROAS of 3.4x across Google Ads and Meta platforms. Instagram Reels creative drove the highest engagement at 6.2% CTR. YouTube brand video achieved 89% completion rate. Budget is 78% utilized with 2 weeks remaining.',
  },
  {
    id: 'rpt-004',
    name: 'SEO Performance Report',
    type: 'seo',
    status: 'generating',
    generatedAt: '2026-06-14T08:00:00Z',
    dateRange: 'Jun 1 - Jun 14, 2026',
    size: 198,
    pages: 15,
    keyMetrics: {
      organicTraffic: { label: 'Organic Traffic', value: '8.2K', change: '+14.2%', positive: true },
      avgPosition: { label: 'Avg Position', value: '8.4', change: '-1.8', positive: true },
      top3Keywords: { label: 'Top 3 Keywords', value: '24', change: '+4', positive: true },
      backlinks: { label: 'New Backlinks', value: '18', change: '+6', positive: true },
    },
    summary: 'Organic traffic showed consistent growth at 14.2% WoW with "gold necklace designs" jumping to position #3. Technical SEO audit identified 6 new issues including 2 critical Core Web Vitals failures on product pages. Content optimization of top 10 pages yielded 22% improvement in CTR from SERPs.',
  },
  {
    id: 'rpt-005',
    name: 'Social Media Audit Q2 2026',
    type: 'social',
    status: 'ready',
    generatedAt: '2026-06-10T11:00:00Z',
    dateRange: 'Apr 1 - Jun 10, 2026',
    size: 520,
    pages: 28,
    keyMetrics: {
      totalFollowers: { label: 'Total Followers', value: '287K', change: '+18.4%', positive: true },
      engagementRate: { label: 'Engagement Rate', value: '4.8%', change: '+0.9%', positive: true },
      topPostReach: { label: 'Top Post Reach', value: '45.2K', change: '+120%', positive: true },
      storiesViewRate: { label: 'Stories View Rate', value: '72%', change: '+5%', positive: true },
    },
    summary: 'Q2 social media performance was exceptional with Instagram growing by 22K followers. Reels content generated 3.2x more engagement than static posts. Pinterest emerged as a strong referral channel driving 12% of website traffic. The Karva Chauth campaign video went viral reaching 45.2K views.',
  },
  {
    id: 'rpt-006',
    name: 'Budget Analysis Q2 2026',
    type: 'budget',
    status: 'ready',
    generatedAt: '2026-06-12T16:45:00Z',
    dateRange: 'Apr 1 - Jun 12, 2026',
    size: 310,
    pages: 16,
    keyMetrics: {
      totalAllocated: { label: 'Total Allocated', value: '₹21.5L', change: '+10%', positive: false },
      totalSpent: { label: 'Total Spent', value: '₹18.9L', change: '+8.2%', positive: false },
      savings: { label: 'Savings', value: '₹2.6L', change: '+34%', positive: true },
      roi: { label: 'ROI', value: '186%', change: '+22%', positive: true },
    },
    summary: 'Q2 budget utilization stands at 87.9% with paid ads consuming 42% of total spend. Video production is 15% under budget while influencer marketing exceeded allocation by 8%. Overall ROI improved to 186% from 164% in Q1, primarily driven by better ad targeting and organic content performance.',
  },
  {
    id: 'rpt-007',
    name: 'Weekly Performance Summary',
    type: 'weekly',
    status: 'scheduled',
    generatedAt: '2026-06-15T10:30:00Z',
    dateRange: 'Jun 15 - Jun 21, 2026',
    size: 0,
    pages: 12,
    keyMetrics: {},
    summary: 'This report is scheduled for auto-generation on Monday, June 15, 2026 at 10:30 AM IST.',
  },
  {
    id: 'rpt-008',
    name: 'Competitor Benchmark Report',
    type: 'competitor',
    status: 'ready',
    generatedAt: '2026-06-09T09:30:00Z',
    dateRange: 'May 2026',
    size: 275,
    pages: 20,
    keyMetrics: {
      marketShare: { label: 'Laxree Market Share', value: '4.2%', change: '+0.3%', positive: true },
      digitalPresence: { label: 'Digital Presence Score', value: '78/100', change: '+5', positive: true },
      priceCompete: { label: 'Price Competitiveness', value: '72/100', change: '-2', positive: false },
      socialGrowth: { label: 'Social Growth Rate', value: '18.4%', change: '+3.1%', positive: true },
    },
    summary: 'Laxree gained 0.3% market share this month, closing the gap with PC Jeweller. Digital presence score improved to 78 driven by strong Instagram and YouTube growth. However, pricing competitiveness dipped slightly as competitors launched aggressive discount campaigns. Social media growth rate of 18.4% leads the segment.',
  },
];

const timeline = [
  { id: 'tl-1', action: 'generated', reportName: 'Weekly Performance Summary', time: '2 hours ago', icon: 'check-circle' },
  { id: 'tl-2', action: 'scheduled', reportName: 'Campaign Deep Dive', time: '5 hours ago', icon: 'clock' },
  { id: 'tl-3', action: 'downloaded', reportName: 'Monthly Marketing Review', time: '1 day ago', icon: 'download' },
  { id: 'tl-4', action: 'generated', reportName: 'Social Media Audit Q2', time: '2 days ago', icon: 'check-circle' },
  { id: 'tl-5', action: 'generated', reportName: 'Budget Analysis Q2', time: '3 days ago', icon: 'check-circle' },
  { id: 'tl-6', action: 'shared', reportName: 'Diwali Campaign Report', time: '4 days ago', icon: 'share' },
];

export async function GET() {
  const totalReports = reports.length;
  const thisMonth = reports.filter((r) => {
    const d = new Date(r.generatedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const typeCounts: Record<string, number> = {};
  for (const r of reports) {
    typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
  }
  const mostPopularType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'weekly';

  return NextResponse.json({
    reports,
    stats: {
      total: totalReports,
      thisMonth,
      mostPopularType,
    },
    timeline,
  });
}

export async function POST(request: NextRequest) {
  // Simulate a brief delay for generation
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const body = await request.json();
  const { name, type, dateRange } = body as { name: string; type: string; dateRange: string };

  const newReport: MockReport = {
    id: `rpt-${String(Date.now()).slice(-6)}`,
    name: name || 'Untitled Report',
    type: (type || 'weekly') as MockReport['type'],
    status: 'ready',
    generatedAt: new Date().toISOString(),
    dateRange: dateRange || 'Custom Range',
    size: Math.floor(Math.random() * 300) + 100,
    pages: Math.floor(Math.random() * 15) + 8,
    keyMetrics: {
      metric1: { label: 'Total Impressions', value: `${(Math.random() * 500 + 100).toFixed(1)}K`, change: `+${(Math.random() * 20 + 5).toFixed(1)}%`, positive: true },
      metric2: { label: 'Conversions', value: String(Math.floor(Math.random() * 200 + 50)), change: `+${(Math.random() * 15 + 3).toFixed(1)}%`, positive: true },
      metric3: { label: 'Revenue', value: `₹${(Math.random() * 5 + 1).toFixed(1)}L`, change: `+${(Math.random() * 25 + 5).toFixed(1)}%`, positive: true },
    },
    summary: `${name || 'Untitled Report'} has been generated successfully for ${dateRange || 'the selected date range'}. The report contains comprehensive analysis of marketing performance metrics with actionable insights for the Laxree marketing team. Key findings indicate positive growth trends across all major channels.`,
  };

  return NextResponse.json({
    success: true,
    report: newReport,
    message: `Report "${newReport.name}" generated successfully`,
  });
}