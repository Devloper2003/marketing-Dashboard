import { NextRequest, NextResponse } from 'next/server';

const reportTemplates = [
  { id: '1', name: 'Executive Summary', description: 'High-level overview for C-suite', sections: ['KPI Overview', 'Revenue Breakdown', 'Campaign Performance', 'Recommendations'], pages: 8, type: 'executive' },
  { id: '2', name: 'Monthly Marketing Report', description: 'Complete monthly performance review', sections: ['Traffic & Engagement', 'Social Media Analytics', 'SEO Performance', 'Lead Generation', 'Budget Utilization', 'Next Month Plan'], pages: 15, type: 'monthly' },
  { id: '3', name: 'Campaign Deep Dive', description: 'Detailed campaign analysis', sections: ['Campaign Overview', 'Channel Performance', 'A/B Test Results', 'ROI Analysis', 'Optimization Tips'], pages: 10, type: 'campaign' },
  { id: '4', name: 'SEO Audit Report', description: 'Website SEO health check', sections: ['Technical SEO', 'Content Analysis', 'Backlink Profile', 'Keyword Rankings', 'Competitor Comparison', 'Action Items'], pages: 12, type: 'seo' },
  { id: '5', name: 'Social Media Audit', description: 'Social presence analysis', sections: ['Platform Overview', 'Content Performance', 'Audience Demographics', 'Engagement Analysis', 'Growth Strategy'], pages: 11, type: 'social' },
  { id: '6', name: 'Competitor Analysis', description: 'Market competitive landscape', sections: ['Market Position', 'SWOT Analysis', 'Pricing Comparison', 'Social Presence', 'SEO Gap Analysis'], pages: 14, type: 'competitor' },
];

const recentReports = [
  { id: 'r1', name: 'June 2025 Monthly Report', template: 'monthly', generatedAt: '2025-06-28', dateRange: 'Jun 1 - Jun 30', pages: 15, format: 'pdf', size: '2.4 MB', status: 'ready' },
  { id: 'r2', name: 'Q2 Executive Summary', template: 'executive', generatedAt: '2025-06-25', dateRange: 'Apr 1 - Jun 30', pages: 8, format: 'pdf', size: '1.8 MB', status: 'ready' },
  { id: 'r3', name: 'Diwali Campaign Report', template: 'campaign', generatedAt: '2025-06-20', dateRange: 'Oct 15 - Nov 15', pages: 10, format: 'excel', size: '890 KB', status: 'ready' },
  { id: 'r4', name: 'Website SEO Audit', template: 'seo', generatedAt: '2025-06-15', dateRange: 'Last 30 days', pages: 12, format: 'pdf', size: '3.1 MB', status: 'ready' },
];

const auditData = {
  overallScore: 78,
  categories: [
    { name: 'Performance', score: 82, icon: 'Zap', issues: 2, color: '#22c55e' },
    { name: 'Accessibility', score: 91, icon: 'Eye', issues: 1, color: '#22c55e' },
    { name: 'SEO', score: 85, icon: 'Search', issues: 3, color: '#22c55e' },
    { name: 'Security', score: 65, icon: 'Shield', issues: 5, color: '#eab308' },
    { name: 'Best Practices', score: 72, icon: 'CheckCircle', issues: 4, color: '#D4A843' },
  ],
  criticalIssues: [
    { title: 'Missing Alt Text on 12 Images', category: 'Accessibility', severity: 'critical', impact: 'SEO & Screen Readers', recommendation: 'Add descriptive alt text to all product images' },
    { title: 'Render-Blocking JavaScript', category: 'Performance', severity: 'critical', impact: 'Page Load Speed', recommendation: 'Defer non-critical JS and use async loading' },
    { title: 'Mixed Content on 3 Pages', category: 'Security', severity: 'critical', impact: 'User Trust & SEO', recommendation: 'Migrate all HTTP resources to HTTPS' },
  ],
  warnings: [
    { title: 'Large Images Not Compressed', category: 'Performance', severity: 'warning', impact: 'Load Time', recommendation: 'Use WebP format with quality 80' },
    { title: 'Missing Meta Descriptions on 8 Pages', category: 'SEO', severity: 'warning', impact: 'Click-Through Rate', recommendation: 'Add unique meta descriptions under 160 chars' },
  ],
  passedChecks: [
    { title: 'HTTPS Enabled', category: 'Security' },
    { title: 'Mobile Responsive', category: 'Performance' },
    { title: 'XML Sitemap Found', category: 'SEO' },
    { title: 'Robots.txt Configured', category: 'SEO' },
  ],
};

export async function GET() {
  return NextResponse.json({
    reportTemplates,
    recentReports,
    auditData,
  });
}

export async function POST(request: NextRequest) {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const body = await request.json();
  const { templateId, dateRange, format, brandSettings } = body as {
    templateId: string;
    dateRange: string;
    format: string;
    brandSettings?: {
      companyName?: string;
      tagline?: string;
      accentColor?: string;
      includeLogo?: boolean;
      includeFooter?: boolean;
    };
  };

  const template = reportTemplates.find((t) => t.id === templateId);

  const newReport = {
    id: `r-${Date.now()}`,
    name: template
      ? `${template.name} - ${dateRange || 'Custom'}`
      : `Custom Report - ${dateRange || 'Custom'}`,
    template: template?.type || 'custom',
    generatedAt: new Date().toISOString().split('T')[0],
    dateRange: dateRange || 'Custom',
    pages: template?.pages || 10,
    format: format || 'pdf',
    size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
    status: 'ready' as const,
  };

  return NextResponse.json({
    success: true,
    report: newReport,
    message: `Report "${newReport.name}" generated successfully`,
  });
}