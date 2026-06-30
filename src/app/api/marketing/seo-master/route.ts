import { NextRequest, NextResponse } from 'next/server';

function getKeywords() {
  return [
    { keyword: 'luxury jewellery online', currentPos: 3, prevPos: 5, searchVolume: 12100, difficulty: 42, cpc: 85, url: '/collections/gold', lastChecked: '2 hours ago' },
    { keyword: 'diamond necklace india', currentPos: 7, prevPos: 7, searchVolume: 8900, difficulty: 58, cpc: 120, url: '/products/diamond-necklace', lastChecked: '1 hour ago' },
    { keyword: 'gold bangles design', currentPos: 2, prevPos: 4, searchVolume: 6700, difficulty: 35, cpc: 65, url: '/collections/bangles', lastChecked: '3 hours ago' },
    { keyword: 'wedding jewellery sets', currentPos: 11, prevPos: 15, searchVolume: 15400, difficulty: 62, cpc: 95, url: '/collections/wedding', lastChecked: '2 hours ago' },
    { keyword: 'kundan jewellery', currentPos: 5, prevPos: 8, searchVolume: 9200, difficulty: 48, cpc: 72, url: '/collections/kundan', lastChecked: '1 hour ago' },
    { keyword: 'platinum rings online', currentPos: 18, prevPos: 22, searchVolume: 3200, difficulty: 71, cpc: 150, url: '/collections/platinum', lastChecked: '4 hours ago' },
    { keyword: 'temple jewellery', currentPos: 4, prevPos: 4, searchVolume: 5600, difficulty: 39, cpc: 55, url: '/collections/temple', lastChecked: '2 hours ago' },
    { keyword: 'engagement ring designs', currentPos: 9, prevPos: 12, searchVolume: 11000, difficulty: 55, cpc: 88, url: '/collections/engagement', lastChecked: '1 hour ago' },
    { keyword: 'antique gold jewellery', currentPos: 6, prevPos: 9, searchVolume: 4100, difficulty: 44, cpc: 78, url: '/blog/antique-gold', lastChecked: '3 hours ago' },
    { keyword: 'jewellery online shopping', currentPos: 14, prevPos: 18, searchVolume: 18700, difficulty: 68, cpc: 105, url: '/shop', lastChecked: '1 hour ago' },
    { keyword: 'designer earrings', currentPos: 8, prevPos: 6, searchVolume: 7800, difficulty: 51, cpc: 70, url: '/collections/earrings', lastChecked: '2 hours ago' },
    { keyword: 'gold coin investment', currentPos: 22, prevPos: 28, searchVolume: 24000, difficulty: 75, cpc: 180, url: '/blog/gold-investment', lastChecked: '4 hours ago' },
    { keyword: 'polki diamond necklace', currentPos: 3, prevPos: 3, searchVolume: 3400, difficulty: 32, cpc: 92, url: '/products/polki-necklace', lastChecked: '1 hour ago' },
    { keyword: 'bracelet for men', currentPos: 16, prevPos: 19, searchVolume: 14200, difficulty: 59, cpc: 62, url: '/collections/mens', lastChecked: '2 hours ago' },
    { keyword: 'silver anklet designs', currentPos: 10, prevPos: 13, searchVolume: 5900, difficulty: 41, cpc: 48, url: '/collections/anklets', lastChecked: '3 hours ago' },
  ];
}

export async function GET() {
  const keywords = getKeywords();
  const top3 = keywords.filter(k => k.currentPos <= 3).length;
  const top10 = keywords.filter(k => k.currentPos <= 10).length;
  const top20 = keywords.filter(k => k.currentPos <= 20).length;

  return NextResponse.json({
    keywords,
    rankDistribution: { top3, top10, top20, top50: 12, top100: 15 },
    healthScore: { overall: 78, performance: 82, accessibility: 91, seo: 85, security: 65, bestPractices: 72 },
    backlinks: { referringDomains: 245, total: 1840, domainAuthority: 42, topAnchors: [
      { text: 'Laxree Jewellery', count: 89, type: 'brand' },
      { text: 'luxury jewellery india', count: 45, type: 'keyword' },
      { text: 'gold necklace designs', count: 32, type: 'keyword' },
      { text: 'buy diamond online', count: 28, type: 'keyword' },
    ]},
    siteSpeed: { mobile: 3.2, desktop: 2.1, fcp: 1.8, lcp: 2.4, cls: 0.08, ttfb: 0.45 },
    weeklyTrend: [
      { week: 'W1', avgPos: 14.2 }, { week: 'W2', avgPos: 13.8 }, { week: 'W3', avgPos: 12.5 },
      { week: 'W4', avgPos: 11.9 }, { week: 'W5', avgPos: 11.2 }, { week: 'W6', avgPos: 10.8 },
      { week: 'W7', avgPos: 10.1 }, { week: 'W8', avgPos: 9.8 },
    ],
    contentSuggestions: [
      { title: '10 Timeless Gold Necklace Designs for 2025 Brides', type: 'blog', keyword: 'gold necklace designs', traffic: 5600, difficulty: 38, outline: ['Bridal gold trends', 'Top 10 designs', 'Choosing your necklace', 'Care tips'] },
      { title: 'Diamond Buying Guide: Everything You Need to Know', type: 'blog', keyword: 'diamond buying guide', traffic: 8900, difficulty: 52, outline: ['Understanding the 4Cs', 'Budget planning', 'Certification', 'Where to buy'] },
      { title: 'Kundan vs Polki: Which is Right for You?', type: 'comparison', keyword: 'kundan polki difference', traffic: 4200, difficulty: 35, outline: ['What is Kundan', 'What is Polki', 'Key differences', 'Price comparison'] },
      { title: 'How to Style Temple Jewellery for Modern Occasions', type: 'howto', keyword: 'temple jewellery styling', traffic: 3100, difficulty: 30, outline: ['Traditional meets modern', 'Office wear ideas', 'Festival styling', 'Storage'] },
      { title: 'Complete Guide to Gold Bangle Designs', type: 'listicle', keyword: 'gold bangle designs', traffic: 6700, difficulty: 35, outline: ['Classic designs', 'Modern trends', 'Size guide', 'Making process'] },
      { title: 'Platinum vs Gold: Investment Comparison 2025', type: 'comparison', keyword: 'platinum gold investment', traffic: 4500, difficulty: 55, outline: ['Market analysis', 'Price trends', 'ROI comparison', 'Expert tips'] },
    ],
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === 'ai-writer') {
    const { type, topic, keywords, tone } = body;
    await new Promise(r => setTimeout(r, 1500));
    return NextResponse.json({
      title: `${topic}: The Complete ${type === 'blog' ? 'Guide' : 'Overview'} by Laxree`,
      metaDescription: `Discover the finest ${topic.toLowerCase()} with Laxree's curated collection. Expert insights and 2025 trends.`,
      outline: [`Introduction to ${topic}`, `Why ${topic} matters in 2025`, `Top trends and insights`, `Laxree's curated selection`, `Expert recommendations`],
      body: `# ${topic}\n\nDiscover the world of ${topic.toLowerCase()} with Laxree Jewellery's expert guide. The Indian jewellery market, valued at over ₹5 lakh crore, continues to grow at 12% annually.\n\n## Our Expert Recommendations\n\nBased on years of expertise, Laxree presents its top picks for ${topic.toLowerCase()}. Each piece is certified for purity and craftsmanship.\n\n*Written in ${tone} tone covering ${keywords || 'luxury jewellery'}*\n\n[Laxree Jewellery — Timeless Elegance]`,
      suggestedKeywords: (keywords || '').split(',').map((k: string) => k.trim()).filter(Boolean),
      wordCount: 1000,
    });
  }
  if (body.action === 'analyze') {
    await new Promise(r => setTimeout(r, 1200));
    return NextResponse.json({
      score: 78, issues: [
        { type: 'Performance', severity: 'critical', description: 'Missing Alt Text on 12 Images', recommendation: 'Add descriptive alt text to all product images.' },
        { type: 'Performance', severity: 'warning', description: 'Large Images Not Compressed', recommendation: 'Use WebP format with quality 80.' },
        { type: 'Security', severity: 'critical', description: 'Mixed Content on 3 Pages', recommendation: 'Migrate all resources to HTTPS.' },
        { type: 'SEO', severity: 'warning', description: 'Missing Meta Descriptions on 8 Pages', recommendation: 'Add unique meta descriptions under 160 chars.' },
      ],
      opportunities: ['Add schema markup for products', 'Create topic cluster content', 'Optimize Core Web Vitals', 'Build more internal links'],
    });
  }
  return NextResponse.json({ ok: true });
}