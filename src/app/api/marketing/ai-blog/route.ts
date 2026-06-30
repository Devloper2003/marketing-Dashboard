import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: Request) {
  try {
    const { topic, category, tone } = await request.json();
    if (!topic) return NextResponse.json({ error: 'Topic is required' }, { status: 400 });

    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a content strategist for Laxree, a luxury jewellery brand. Suggest 3 blog post ideas with titles, brief outlines (3-4 bullet points each), target keywords, and estimated SEO difficulty (Low/Medium/High).' },
        { role: 'user', content: `Suggest blog post ideas about: ${topic}\nCategory: ${category || 'General'}\nTone: ${tone || 'Professional'}\n\nFor each idea provide:\n1. Title (catchy, SEO-optimized)\n2. Outline (3-4 bullet points)\n3. Target Keywords (3-5 keywords)\n4. SEO Difficulty (Low/Medium/High)\n\nFormat each idea with --- separator.` },
      ],
    });

    const content = response.choices[0]?.message?.content || 'Unable to generate suggestions.';
    return NextResponse.json({ suggestions: content });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}