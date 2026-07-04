import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const reportTemplates = [
  { id: '1', name: 'Executive Summary', description: 'High-level overview for C-suite', sections: ['KPI Overview', 'Revenue Breakdown', 'Campaign Performance', 'Recommendations'], pages: 8, type: 'executive' },
  { id: '2', name: 'Monthly Marketing Report', description: 'Complete monthly performance review', sections: ['Traffic & Engagement', 'Social Media Analytics', 'SEO Performance', 'Lead Generation', 'Budget Utilization', 'Next Month Plan'], pages: 15, type: 'monthly' },
  { id: '3', name: 'Campaign Deep Dive', description: 'Detailed campaign analysis', sections: ['Campaign Overview', 'Channel Performance', 'A/B Test Results', 'ROI Analysis', 'Optimization Tips'], pages: 10, type: 'campaign' },
  { id: '4', name: 'SEO Audit Report', description: 'Website SEO health check', sections: ['Technical SEO', 'Content Analysis', 'Backlink Profile', 'Keyword Rankings', 'Competitor Comparison', 'Action Items'], pages: 12, type: 'seo' },
  { id: '5', name: 'Social Media Audit', description: 'Social presence analysis', sections: ['Platform Overview', 'Content Performance', 'Audience Demographics', 'Engagement Analysis', 'Growth Strategy'], pages: 11, type: 'social' },
  { id: '6', name: 'Competitor Analysis', description: 'Market competitive landscape', sections: ['Market Position', 'SWOT Analysis', 'Pricing Comparison', 'Social Presence', 'SEO Gap Analysis'], pages: 14, type: 'competitor' },
];

export async function GET() {
  try {
    const recentReports: Array<{
      id: string;
      name: string;
      template: string;
      generatedAt: string;
      dateRange: string;
      pages: number;
      format: string;
      size: string;
      status: string;
    }> = [];

    const auditData = {
      overallScore: 0,
      categories: [
        { name: 'Performance', score: 0, icon: 'Zap', issues: 0, color: '#22c55e' },
        { name: 'Accessibility', score: 0, icon: 'Eye', issues: 0, color: '#22c55e' },
        { name: 'SEO', score: 0, icon: 'Search', issues: 0, color: '#22c55e' },
        { name: 'Security', score: 0, icon: 'Shield', issues: 0, color: '#eab308' },
        { name: 'Best Practices', score: 0, icon: 'CheckCircle', issues: 0, color: '#D4A843' },
      ],
      criticalIssues: [],
      warnings: [],
      passedChecks: [],
    };

    return NextResponse.json({
      reportTemplates,
      recentReports,
      auditData,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch report builder data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, dateRange, format } = body as {
      templateId: string;
      dateRange: string;
      format: string;
      brandSettings?: Record<string, unknown>;
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
      pages: template?.pages || 0,
      format: format || 'pdf',
      size: '0 MB',
      status: 'ready' as const,
    };

    return NextResponse.json({
      success: true,
      report: newReport,
      message: `Report "${newReport.name}" generated successfully`,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}