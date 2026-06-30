import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: Request) {
  try {
    const { query, category, context } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const systemPrompt = `You are a marketing idea researcher and strategist for Laxree, a luxury jewellery brand. 
Generate creative, actionable marketing ideas based on the user's request.
Focus on: content marketing, social media campaigns, SEO strategies, influencer collaborations, seasonal promotions, and brand growth.
Always provide ideas in a structured format with title, description, priority (high/medium/low), and category.
Be specific, practical, and aligned with luxury jewellery branding.`;

    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `${context ? `Context: ${context}\n\n` : ''}${category ? `Category: ${category}\n\n` : ''}Generate marketing ideas for: ${query}\n\nProvide 3-5 specific, actionable ideas. For each idea include:\n- Title\n- Description (2-3 sentences)\n- Priority (high/medium/low)\n- Category\n- Expected impact (brief)`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || 'No ideas generated';

    return NextResponse.json({ ideas: content });
  } catch (error) {
    console.error('AI Idea generation error:', error);
    return NextResponse.json({ error: 'Failed to generate ideas' }, { status: 500 });
  }
}