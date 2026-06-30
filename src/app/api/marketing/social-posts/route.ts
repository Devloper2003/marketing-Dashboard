import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const posts = await db.socialPost.findMany({ orderBy: { createdAt: 'desc' } });
    const platforms = [...new Set(posts.map(p => p.platform))];
    const statusCounts = {
      published: posts.filter(p => p.status === 'published').length,
      scheduled: posts.filter(p => p.status === 'scheduled').length,
      draft: posts.filter(p => p.status === 'draft').length,
    };
    const totalEngagement = posts.reduce((sum, p) => sum + p.likes + p.comments + p.shares + p.saves, 0);

    return NextResponse.json({ posts, platforms, statusCounts, totalEngagement });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch social posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const post = await db.socialPost.create({
      data: {
        platform: body.platform,
        content: body.content || '',
        status: body.status || 'draft',
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create social post' }, { status: 500 });
  }
}