import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const atRisk = await db.campaign.findMany({ where: { status: 'at_risk' } });
    const offTrack = await db.campaign.findMany({ where: { status: 'off_track' } });
    const alerts = [...atRisk, ...offTrack].map(c => ({
      id: c.id,
      campaign: c.name,
      channel: c.channel,
      roas: c.roas,
      performance: c.performance || 'No details available',
      status: c.status,
    }));
    return NextResponse.json({ alerts, total: alerts.length });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}