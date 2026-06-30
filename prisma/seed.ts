import { db } from '@/lib/db';

async function main() {
  // Clear existing data
  await db.campaign.deleteMany();
  await db.blogPost.deleteMany();
  await db.socialPost.deleteMany();
  await db.contentCalendar.deleteMany();
  await db.seoKeyword.deleteMany();
  await db.lead.deleteMany();
  await db.ideaNote.deleteMany();
  await db.channelGoal.deleteMany();

  // Seed Campaigns
  await db.campaign.createMany({
    data: [
      { name: 'Diwali Collection Launch', channel: 'Google Ads', spend: 12460, conversions: 1280, cac: 9.72, roas: 5.1, status: 'active', performance: 'Strong performance' },
      { name: 'Instagram Reels Push', channel: 'Instagram', spend: 8340, conversions: 920, cac: 9.07, roas: 4.8, status: 'active', performance: 'Good engagement' },
      { name: 'Email Holiday Sale', channel: 'Email', spend: 3200, conversions: 1850, cac: 1.73, roas: 8.2, status: 'active', performance: 'Excellent open rate' },
      { name: 'YouTube Brand Video', channel: 'YouTube', spend: 15600, conversions: 640, cac: 24.38, roas: 2.1, status: 'at_risk', performance: 'Performance drop - high CPM' },
      { name: 'Facebook Retargeting', channel: 'Facebook', spend: 6780, conversions: 1120, cac: 6.05, roas: 6.3, status: 'active', performance: 'Steady conversions' },
      { name: 'Influencer Collab Q4', channel: 'Instagram', spend: 22000, conversions: 2100, cac: 10.48, roas: 3.9, status: 'completed', performance: 'Completed successfully' },
      { name: 'SEO Content Push', channel: 'Organic', spend: 4500, conversions: 890, cac: 5.06, roas: 7.1, status: 'active', performance: 'Growing steadily' },
      { name: 'WhatsApp Broadcast', channel: 'WhatsApp', spend: 800, conversions: 420, cac: 1.9, roas: 9.5, status: 'active', performance: 'High conversion rate' },
    ],
  });

  // Seed Blog Posts
  await db.blogPost.createMany({
    data: [
      { title: '10 Luxe Jewellery Trends for 2025', content: 'Explore the top jewellery trends...', status: 'published', author: 'Priya Sharma', category: 'Trends', tags: 'jewellery,trends,2025', seoScore: 92, publishDate: new Date('2025-01-15') },
      { title: 'How to Style Gold Bangles for Every Occasion', content: 'Gold bangles are versatile...', status: 'published', author: 'Anita Desai', category: 'Styling', tags: 'bangles,gold,styling', seoScore: 88, publishDate: new Date('2025-01-20') },
      { title: 'The Art of Choosing Diamond Necklaces', content: 'Selecting the perfect diamond necklace...', status: 'published', author: 'Priya Sharma', category: 'Guide', tags: 'diamond,necklace,guides', seoScore: 85, publishDate: new Date('2025-02-01') },
      { title: 'Laxree Behind the Scenes: Crafting Excellence', content: 'A look into our workshop...', status: 'published', author: 'Rahul Mehta', category: 'Brand Story', tags: 'brand,craftsmanship,behind-scenes', seoScore: 78, publishDate: new Date('2025-02-10') },
      { title: 'Complete Guide to Kundan Jewellery', content: 'Everything you need to know about Kundan...', status: 'draft', author: 'Anita Desai', category: 'Guide', tags: 'kundan,guide,jewellery', seoScore: 65 },
      { title: 'Wedding Jewellery Checklist 2025', content: 'Plan your perfect wedding jewellery...', status: 'in_review', author: 'Priya Sharma', category: 'Wedding', tags: 'wedding,checklist,planning', seoScore: 72 },
      { title: 'Caring for Your Precious Gems', content: 'Maintenance tips for fine jewellery...', status: 'draft', author: 'Rahul Mehta', category: 'Care', tags: 'care,maintenance,gems', seoScore: 55 },
      { title: 'Silver vs Gold: Making the Right Choice', content: 'A comprehensive comparison...', status: 'published', author: 'Anita Desai', category: 'Guide', tags: 'silver,gold,comparison', seoScore: 90, publishDate: new Date('2025-02-20') },
    ],
  });

  // Seed Social Posts
  await db.socialPost.createMany({
    data: [
      { platform: 'Instagram', content: '✨ New Arrivals - Festive Collection 2025 ✨ Shop now at laxree.com #Laxree #Jewellery', status: 'published', scheduledAt: new Date('2025-02-25T10:00:00'), likes: 697, comments: 22, shares: 71, saves: 566 },
      { platform: 'Instagram', content: 'Behind the craft: Watch our artisans create magic 💫 #Handmade #Craftsmanship', status: 'published', scheduledAt: new Date('2025-02-20T14:00:00'), likes: 1245, comments: 89, shares: 156, saves: 892 },
      { platform: 'Instagram', content: 'Customer spotlight: @meera_j wearing our Kundan set 🌟 Share your looks with #LaxreeStyle', status: 'scheduled', scheduledAt: new Date('2025-03-05T12:00:00') },
      { platform: 'Facebook', content: 'Grand Sale! Up to 30% off on select collections. Limited time offer! 🎉', status: 'published', scheduledAt: new Date('2025-02-18T09:00:00'), likes: 432, comments: 67, shares: 234, saves: 178 },
      { platform: 'Twitter', content: 'Excited to announce our new Platinum collection! Crafted with precision and passion. #Laxree #NewCollection', status: 'published', scheduledAt: new Date('2025-02-22T08:00:00'), likes: 156, comments: 12, shares: 89, saves: 34 },
      { platform: 'Instagram', content: 'Reel: 5 ways to style our layered necklaces 📿✨ #StylingTips #Laxree', status: 'draft' },
      { platform: 'Pinterest', content: 'Wedding Inspiration Board - Bridal Jewellery Ideas 💍', status: 'published', scheduledAt: new Date('2025-02-15T11:00:00'), likes: 89, comments: 5, shares: 345, saves: 1234 },
      { platform: 'Instagram', content: 'Flash Sale Alert! 24 hours only on our bestsellers ⚡', status: 'scheduled', scheduledAt: new Date('2025-03-01T18:00:00') },
    ],
  });

  // Seed Content Calendar
  const today = new Date();
  await db.contentCalendar.createMany({
    data: [
      { title: 'Festive Collection Launch Post', type: 'social', platform: 'Instagram', status: 'published', scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 10, 0), description: 'Launch post for new festive collection' },
      { title: 'Blog: Wedding Trends 2025', type: 'blog', platform: 'Website', status: 'published', scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 9, 0), description: 'SEO-optimized blog post about wedding jewellery trends' },
      { title: 'Customer Testimonial Video', type: 'video', platform: 'Instagram', status: 'in_progress', scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 14, 0), description: 'Video compilation of customer reviews' },
      { title: 'Email: Monthly Newsletter', type: 'email', platform: 'Email', status: 'scheduled', scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 8, 0), description: 'Monthly newsletter with new arrivals and offers' },
      { title: 'Pinterest Board: Summer Collection', type: 'social', platform: 'Pinterest', status: 'planned', scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 11, 0), description: 'Curate Pinterest board for summer collection' },
      { title: 'Blog: Gold Care Guide', type: 'blog', platform: 'Website', status: 'draft', scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 9, 0), description: 'Comprehensive guide on caring for gold jewellery' },
      { title: 'Reel: Behind the Scenes', type: 'video', platform: 'Instagram', status: 'planned', scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 16, 0), description: 'Workshop behind-the-scenes content' },
      { title: 'Facebook: Festive Giveaway', type: 'social', platform: 'Facebook', status: 'scheduled', scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0), description: 'Festive season giveaway contest' },
      { title: 'YouTube: Collection Showcase', type: 'video', platform: 'YouTube', status: 'in_progress', scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8, 12, 0), description: 'Full collection showcase video' },
      { title: 'Twitter: Trending Jewellery Tips', type: 'social', platform: 'Twitter', status: 'draft', scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 9, 30), description: 'Quick tips thread about jewellery styling' },
      { title: 'Instagram Story: Poll - Favorite Piece', type: 'story', platform: 'Instagram', status: 'planned', scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0), description: 'Interactive story poll' },
      { title: 'Blog: Kundan History', type: 'blog', platform: 'Website', status: 'draft', scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14, 9, 0), description: 'Historical piece about Kundan jewellery' },
    ],
  });

  // Seed SEO Keywords
  await db.seoKeyword.createMany({
    data: [
      { keyword: 'luxury jewellery online india', position: 3, volume: 12400, difficulty: 72, url: '/collections/luxury', change: 2 },
      { keyword: 'gold necklace designs', position: 7, volume: 18900, difficulty: 65, url: '/collections/gold-necklaces', change: -1 },
      { keyword: 'diamond earrings online', position: 5, volume: 9800, difficulty: 68, url: '/collections/diamond-earrings', change: 3 },
      { keyword: 'bridal jewellery set', position: 12, volume: 22300, difficulty: 78, url: '/collections/bridal', change: -2 },
      { keyword: 'kundan jewellery online', position: 8, volume: 8900, difficulty: 62, url: '/collections/kundan', change: 5 },
      { keyword: 'silver anklets design', position: 15, volume: 6700, difficulty: 55, url: '/collections/silver-anklets', change: 1 },
      { keyword: 'platinum rings for women', position: 9, volume: 11200, difficulty: 70, url: '/collections/platinum-rings', change: 0 },
      { keyword: 'temple jewellery collection', position: 6, volume: 7600, difficulty: 58, url: '/collections/temple', change: 4 },
      { keyword: 'artificial jewellery sets', position: 22, volume: 34500, difficulty: 45, url: '/collections/artificial', change: -3 },
      { keyword: 'laxree jewellery review', position: 1, volume: 1200, difficulty: 12, url: '/reviews', change: 0 },
      { keyword: 'gold bangles designs 2025', position: 4, volume: 15600, difficulty: 60, url: '/blog/gold-bangles-2025', change: 6 },
      { keyword: 'wedding jewellery checklist', position: 11, volume: 9400, difficulty: 52, url: '/blog/wedding-checklist', change: 2 },
    ],
  });

  // Seed Leads
  await db.lead.createMany({
    data: [
      { company: 'Tata Group', email: 'procurement@tata.com', utmSource: 'google_ads', quality: 'HOT', country: 'India', date: new Date('2025-02-28') },
      { company: 'Reliance Retail', email: 'partnerships@reliance.in', utmSource: 'organic', quality: 'WARM', country: 'India', date: new Date('2025-02-27') },
      { company: 'Helpdesk Inc', email: 'contact@helpdesk.com', utmSource: 'linkedin', quality: 'NEEDS_REVIEW', country: 'USA', date: new Date('2025-02-26') },
      { company: 'Jewel Palace', email: 'info@jewelpalace.com', utmSource: 'instagram', quality: 'HOT', country: 'UAE', date: new Date('2025-02-25') },
      { company: 'Mumbai Diamonds', email: 'sales@mumbaidiamonds.in', utmSource: 'referral', quality: 'WARM', country: 'India', date: new Date('2025-02-24') },
      { company: 'WeddingSutra', email: 'collab@weddingsutra.com', utmSource: 'email', quality: 'COLD', country: 'India', date: new Date('2025-02-23') },
      { company: 'Luxury Brands Co', email: 'buyer@luxurybrands.co.uk', utmSource: 'facebook', quality: 'WARM', country: 'UK', date: new Date('2025-02-22') },
      { company: 'Crystal Clear Gems', email: 'hello@crystalclear.com', utmSource: 'google_ads', quality: 'HOT', country: 'India', date: new Date('2025-02-21') },
      { company: 'Bridal Boutique', email: 'orders@bridalboutique.com', utmSource: 'pinterest', quality: 'COLD', country: 'Australia', date: new Date('2025-02-20') },
      { company: 'Royal Jewellers', email: 'contact@royaljewellers.in', utmSource: 'organic', quality: 'WARM', country: 'India', date: new Date('2025-02-19') },
    ],
  });

  // Seed Idea Notes
  await db.ideaNote.createMany({
    data: [
      { title: 'AR Try-On Feature for Website', content: 'Implement augmented reality try-on for necklaces and earrings. Partner with a AR SDK provider.', category: 'Product', priority: 'high', status: 'new' },
      { title: 'Festive Gift Guide Campaign', content: 'Create curated gift guides for Diwali, Christmas, and Valentine\'s Day with influencer collaborations.', category: 'Campaign', priority: 'high', status: 'in_progress' },
      { title: 'Customer Loyalty Program', content: 'Launch a tiered loyalty program with points for purchases, reviews, and referrals.', category: 'Strategy', priority: 'medium', status: 'new' },
      { title: 'YouTube Jewelry Making Series', content: 'Behind-the-scenes series showing the crafting process. 8-episode season.', category: 'Content', priority: 'medium', status: 'planned' },
      { title: 'WhatsApp Commerce Integration', content: 'Enable direct shopping through WhatsApp with catalog and payment integration.', category: 'Product', priority: 'low', status: 'new' },
      { title: 'Sustainability Storytelling', content: 'Content series highlighting ethical sourcing and sustainable practices.', category: 'Content', priority: 'medium', status: 'new' },
    ],
  });

  // Seed Channel Goals
  await db.channelGoal.createMany({
    data: [
      { channel: 'Google Ads', metric: 'CPC Target', current: 1200, target: 1500, status: 'on_track' },
      { channel: 'Google Ads', metric: 'Conversion Rate', current: 3.2, target: 4.0, status: 'at_risk' },
      { channel: 'Instagram', metric: 'Follower Growth', current: 8500, target: 10000, status: 'on_track' },
      { channel: 'Instagram', metric: 'Engagement Rate', current: 4.8, target: 5.5, status: 'at_risk' },
      { channel: 'Email', metric: 'Open Rate', current: 28.5, target: 30, status: 'on_track' },
      { channel: 'Organic', metric: 'Monthly Traffic', current: 45000, target: 60000, status: 'off_track' },
      { channel: 'Facebook', metric: 'ROAS', current: 5.8, target: 6.0, status: 'on_track' },
      { channel: 'YouTube', metric: 'Subscribers', current: 3200, target: 5000, status: 'off_track' },
    ],
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });