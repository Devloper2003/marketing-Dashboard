import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const keywords = await db.seoKeyword.findMany({ orderBy: { position: 'asc' } });
    const avgPosition = keywords.length > 0
      ? Math.round(keywords.reduce((sum, k) => sum + k.position, 0) / keywords.length)
      : 0;
    const totalVolume = keywords.reduce((sum, k) => sum + k.volume, 0);
    const top3 = keywords.filter(k => k.position <= 3).length;
    const top10 = keywords.filter(k => k.position <= 10).length;
    const improved = keywords.filter(k => k.change > 0).length;
    const declined = keywords.filter(k => k.change < 0).length;

    // Page speed & technical SEO (mock data)
    const technicalSeo = {
      pageSpeed: 87,
      mobileFriendly: true,
      httpsEnabled: true,
      coreWebVitals: { lcp: 2.1, fid: 45, cls: 0.08 },
      crawlErrors: 3,
      indexedPages: 156,
      sitemapStatus: 'healthy',
      robotsTxtStatus: 'healthy',
    };

    // Backlink profile (mock)
    const backlinks = {
      total: 1240,
      referringDomains: 340,
      dofollow: 890,
      nofollow: 350,
      topReferrers: [
        { domain: 'jewellerytimes.com', links: 45, da: 68 },
        { domain: 'fashionindia.com', links: 32, da: 72 },
        { domain: 'weddingplanner.in', links: 28, da: 65 },
        { domain: 'lifestylemag.com', links: 22, da: 71 },
        { domain: 'indiatimes.com', links: 18, da: 85 },
      ],
    };

    return NextResponse.json({
      keywords,
      stats: { avgPosition, totalVolume, top3, top10, improved, declined, totalKeywords: keywords.length },
      technicalSeo,
      backlinks,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch SEO data' }, { status: 500 });
  }
}