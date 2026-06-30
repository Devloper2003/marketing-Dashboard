import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const posts = await db.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
    const categories = [...new Set(posts.map(p => p.category).filter(Boolean))] as string[];
    const statusCounts = {
      published: posts.filter(p => p.status === 'published').length,
      draft: posts.filter(p => p.status === 'draft').length,
      in_review: posts.filter(p => p.status === 'in_review').length,
    };
    const avgSeoScore = posts.length > 0
      ? Math.round(posts.reduce((sum, p) => sum + p.seoScore, 0) / posts.length)
      : 0;

    return NextResponse.json({ posts, categories, statusCounts, avgSeoScore });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const post = await db.blogPost.create({
      data: {
        title: body.title,
        content: body.content || '',
        status: body.status || 'draft',
        author: body.author || 'Laxree Team',
        category: body.category || 'General',
        tags: body.tags || '',
        seoScore: body.seoScore || 0,
        publishDate: body.publishDate ? new Date(body.publishDate) : null,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const post = await db.blogPost.update({
      where: { id: body.id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.seoScore !== undefined && { seoScore: body.seoScore }),
        ...(body.publishDate !== undefined && { publishDate: body.publishDate ? new Date(body.publishDate) : null }),
      },
    });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}