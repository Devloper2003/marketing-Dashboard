import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const defaultPipelineStages = [
  { id: 'new', name: 'New Lead', color: '#3b82f6', count: 0, value: 0 },
  { id: 'contacted', name: 'Contacted', color: '#a855f7', count: 0, value: 0 },
  { id: 'qualified', name: 'Qualified', color: '#D4A843', count: 0, value: 0 },
  { id: 'proposal', name: 'Proposal Sent', color: '#f97316', count: 0, value: 0 },
  { id: 'negotiation', name: 'Negotiation', color: '#eab308', count: 0, value: 0 },
  { id: 'won', name: 'Won', color: '#22c55e', count: 0, value: 0 },
  { id: 'lost', name: 'Lost', color: '#ef4444', count: 0, value: 0 },
];

function qualityToStage(quality: string | null): string {
  if (!quality) return 'new';
  const map: Record<string, string> = {
    HOT: 'qualified',
    WARM: 'contacted',
    COLD: 'new',
    WON: 'won',
    LOST: 'lost',
  };
  return map[quality.toUpperCase()] || 'new';
}

export async function GET() {
  try {
    const dbLeads = await db.lead.findMany({ orderBy: { createdAt: 'desc' } });

    const leads = dbLeads.map((l) => ({
      id: l.id,
      name: l.company || l.email || 'Unknown',
      company: l.company || null,
      email: l.email || null,
      phone: null,
      value: 0,
      stage: qualityToStage(l.quality),
      source: l.utmSource || null,
      quality: (l.quality || 'cold').toLowerCase(),
      assignedTo: null,
      createdAt: l.createdAt.toISOString().split('T')[0],
      lastFollowUp: null,
      nextFollowUp: null,
      followUpCount: 0,
      notes: null,
      tags: [],
      country: l.country || null,
      city: null,
    }));

    // Compute pipeline stages from actual lead data
    const pipelineStages = defaultPipelineStages.map((stage) => ({
      ...stage,
      count: leads.filter((l) => l.stage === stage.id).length,
      value: leads.filter((l) => l.stage === stage.id).reduce((sum, l) => sum + l.value, 0),
    }));

    const totalLeads = leads.length;
    const wonLeads = leads.filter((l) => l.stage === 'won');
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads.length / totalLeads) * 100) : 0;
    const hotLeads = leads.filter((l) => l.quality === 'hot').length;
    const warmLeads = leads.filter((l) => l.quality === 'warm').length;
    const coldLeads = leads.filter((l) => l.quality === 'cold').length;

    const stats = {
      totalLeads,
      thisMonth: 0,
      conversionRate,
      avgDealSize: 0,
      avgDaysToClose: 0,
      totalRevenue: 0,
      hotLeads,
      warmLeads,
      coldLeads,
    };

    return NextResponse.json({
      pipeline: { stages: pipelineStages },
      leads,
      followUps: [],
      stats,
      monthlyTrend: [],
      sourceBreakdown: [],
      teamPerformance: [],
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch lead pipeline data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === 'follow-up') {
      return NextResponse.json({
        success: true,
        followUp: {
          id: `FU${String(Date.now()).slice(-6)}`,
          ...body.data,
          status: 'scheduled',
        },
      });
    }

    const lead = await db.lead.create({
      data: {
        company: body.company || null,
        email: body.email || null,
        utmSource: body.source || null,
        quality: (body.quality || 'NEW').toUpperCase(),
        country: body.country || null,
      },
    });

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        ...body,
        createdAt: lead.createdAt.toISOString().split('T')[0],
        lastFollowUp: null,
        followUpCount: 0,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}