import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const campaigns = await db.emailCampaign.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const sentCampaigns = campaigns.filter((c) => c.status === 'sent');
    const totalSent = sentCampaigns.reduce((sum, c) => sum + c.listSize, 0);
    const avgOpenRate = sentCampaigns.length > 0
      ? sentCampaigns.reduce((sum, c) => sum + c.openRate, 0) / sentCampaigns.length
      : 0;
    const totalRevenue = sentCampaigns.reduce((sum, c) => sum + c.revenue, 0);
    const totalConversions = sentCampaigns.reduce((sum, c) => sum + c.conversions, 0);
    const avgClickRate = sentCampaigns.length > 0
      ? sentCampaigns.reduce((sum, c) => sum + c.clickRate, 0) / sentCampaigns.length
      : 0;
    const avgBounceRate = sentCampaigns.length > 0
      ? sentCampaigns.reduce((sum, c) => sum + c.bounceRate, 0) / sentCampaigns.length
      : 0;

    const weeklyTrend: { week: string; openRate: number; clickRate: number }[] = [];

    const totalOpens = Math.round(totalSent * (avgOpenRate / 100));
    const totalClicks = Math.round(totalSent * (avgClickRate / 100));
    const funnel = [
      { stage: 'Emails Sent', value: totalSent, pct: 100 },
      { stage: 'Opened', value: totalOpens, pct: avgOpenRate },
      { stage: 'Clicked', value: totalClicks, pct: avgClickRate },
      { stage: 'Converted', value: totalConversions, pct: totalSent > 0 ? (totalConversions / totalSent) * 100 : 0 },
    ];

    return NextResponse.json({
      campaigns,
      summary: {
        totalSent,
        avgOpenRate: Math.round(avgOpenRate * 10) / 10,
        totalRevenue,
        totalConversions,
        avgClickRate: Math.round(avgClickRate * 10) / 10,
        avgBounceRate: Math.round(avgBounceRate * 10) / 10,
        sentCount: sentCampaigns.length,
        scheduledCount: campaigns.filter((c) => c.status === 'scheduled').length,
        draftCount: campaigns.filter((c) => c.status === 'draft').length,
      },
      weeklyTrend,
      funnel,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch email campaigns' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const campaign = await db.emailCampaign.create({
      data: {
        name: body.name || 'Untitled Campaign',
        subject: body.subject,
        status: body.status || 'draft',
        listSize: body.listSize || 0,
      },
    });
    return NextResponse.json(campaign);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create email campaign' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const campaign = await db.emailCampaign.update({
      where: { id: body.id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.subject !== undefined && { subject: body.subject }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });
    return NextResponse.json(campaign);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update email campaign' }, { status: 500 });
  }
}