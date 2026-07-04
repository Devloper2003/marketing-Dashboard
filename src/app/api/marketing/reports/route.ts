import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface ReportMetric {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
}

export async function GET() {
  try {
    const reports: Array<{
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
    }> = [];
    const timeline: Array<{ id: string; action: string; reportName: string; time: string; icon: string }> = [];

    return NextResponse.json({
      reports,
      stats: {
        total: 0,
        thisMonth: 0,
        mostPopularType: 'weekly',
      },
      timeline,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, dateRange, keyMetrics, summary } = body as {
      name: string;
      type: string;
      dateRange: string;
      keyMetrics?: Record<string, ReportMetric>;
      summary?: string;
    };

    const newReport = {
      id: `rpt-${String(Date.now()).slice(-6)}`,
      name: name || 'Untitled Report',
      type: (type || 'weekly') as 'weekly' | 'monthly' | 'quarterly' | 'campaign' | 'seo' | 'social' | 'competitor' | 'budget',
      status: 'ready' as const,
      generatedAt: new Date().toISOString(),
      dateRange: dateRange || 'Custom Range',
      size: 0,
      pages: 0,
      keyMetrics: keyMetrics || {},
      summary: summary || `${name || 'Untitled Report'} has been generated successfully.`,
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