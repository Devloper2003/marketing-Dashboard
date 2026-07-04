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

    // Technical SEO
    const technicalSeo = {
      pageSpeed: 0,
      mobileFriendly: false,
      httpsEnabled: false,
      coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
      crawlErrors: 0,
      indexedPages: 0,
      sitemapStatus: 'unknown' as string,
      robotsTxtStatus: 'unknown' as string,
    };

    // Backlink profile
    const backlinks = {
      total: 0,
      referringDomains: 0,
      dofollow: 0,
      nofollow: 0,
      topReferrers: [] as { domain: string; links: number; da: number }[],
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