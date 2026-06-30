import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: Request) {
  try {
    const { platform, topic, tone, context } = await request.json();

    if (!platform || !topic) {
      return NextResponse.json({ error: 'Platform and topic are required' }, { status: 400 });
    }

    const zai = await ZAI.create();

    const platformGuides: Record<string, string> = {
      Instagram: 'Create an engaging Instagram caption with relevant hashtags (5-8), emojis, and a call-to-action. Keep it under 2200 characters.',
      Facebook: 'Write a Facebook post that encourages engagement. Use a conversational tone, ask a question, and keep it under 500 characters.',
      Twitter: 'Write a concise Twitter/X post under 280 characters. Make it punchy and use 2-3 relevant hashtags.',
      Pinterest: 'Write a Pinterest pin description that is SEO-friendly with keywords. Include a clear call-to-action.',
    };

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a social media content writer for Laxree, a luxury jewellery brand known for exquisite gold, diamond, and Kundan jewellery. Your tone should be elegant yet approachable. Always highlight craftsmanship, quality, and the emotional value of jewellery.`,
        },
        {
          role: 'user',
          content: `Generate a ${platform} post about: ${topic}
${tone ? `Tone: ${tone}` : 'Tone: Luxurious and inviting'}
${context ? `Additional context: ${context}` : ''}
${platformGuides[platform] || platformGuides.Instagram}

Provide 2 post variations. Format each as:
---
POST 1:
[caption text]
---
POST 2:
[caption text]
---`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content || 'Unable to generate posts.';

    return NextResponse.json({ posts: content });
  } catch (error) {
    console.error('AI Social post error:', error);
    return NextResponse.json({ error: 'Failed to generate social post' }, { status: 500 });
  }
}