import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const ideas = await db.ideaNote.findMany({ orderBy: { createdAt: 'desc' } });
    const categories = [...new Set(ideas.map(i => i.category).filter(Boolean))] as string[];
    const priorityCounts = {
      high: ideas.filter(i => i.priority === 'high').length,
      medium: ideas.filter(i => i.priority === 'medium').length,
      low: ideas.filter(i => i.priority === 'low').length,
    };
    const statusCounts = {
      new: ideas.filter(i => i.status === 'new').length,
      in_progress: ideas.filter(i => i.status === 'in_progress').length,
      planned: ideas.filter(i => i.status === 'planned').length,
      completed: ideas.filter(i => i.status === 'completed').length,
    };

    return NextResponse.json({ ideas, categories, priorityCounts, statusCounts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idea = await db.ideaNote.create({
      data: {
        title: body.title,
        content: body.content || '',
        category: body.category || 'General',
        priority: body.priority || 'medium',
        status: body.status || 'new',
      },
    });
    return NextResponse.json(idea, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const idea = await db.ideaNote.update({
      where: { id: body.id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
      },
    });
    return NextResponse.json(idea);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await db.ideaNote.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete idea' }, { status: 500 });
  }
}