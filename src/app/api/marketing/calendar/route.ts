import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const items = await db.contentCalendar.findMany({ orderBy: { scheduledAt: 'asc' } });
    const types = [...new Set(items.map(i => i.type))];
    const platforms = [...new Set(items.map(i => i.platform).filter(Boolean))] as string[];
    const statusCounts = {
      published: items.filter(i => i.status === 'published').length,
      scheduled: items.filter(i => i.status === 'scheduled').length,
      in_progress: items.filter(i => i.status === 'in_progress').length,
      planned: items.filter(i => i.status === 'planned').length,
      draft: items.filter(i => i.status === 'draft').length,
    };

    return NextResponse.json({ items, types, platforms, statusCounts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await db.contentCalendar.create({
      data: {
        title: body.title,
        type: body.type,
        platform: body.platform || null,
        status: body.status || 'planned',
        scheduledAt: new Date(body.scheduledAt),
        description: body.description || '',
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create calendar item' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const item = await db.contentCalendar.update({
      where: { id: body.id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.scheduledAt !== undefined && { scheduledAt: new Date(body.scheduledAt) }),
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update calendar item' }, { status: 500 });
  }
}