import { NextResponse } from 'next/server';

const accounts = [
  {
    id: '1',
    platform: 'Instagram',
    handle: '@laxree.jewellery',
    avatar: null,
    followers: 135400,
    following: 890,
    posts: 342,
    engagementRate: 4.8,
    reach: 48200,
    impressions: 125000,
    profileViews: 8900,
    websiteClicks: 1200,
    monthlyGrowth: 3.2,
    topHashtag: '#LaxreeLuxury',
    connected: true,
    connectedAt: '2024-03-15',
    lastSync: '2 hours ago',
    category: 'Jewellery & Luxury',
    bio: 'Crafting timeless elegance since 2018.✨ Luxury jewellery for the modern connoisseur.',
  },
  {
    id: '2',
    platform: 'YouTube',
    handle: 'Laxree Jewellery',
    avatar: null,
    followers: 28500,
    subscribers: 28500,
    videos: 67,
    views: 1250000,
    watchHours: 18500,
    engagementRate: 6.2,
    monthlyGrowth: 5.1,
    topVideo: 'Diwali Collection 2025',
    connected: true,
    connectedAt: '2024-02-10',
    lastSync: '1 hour ago',
    category: 'Lifestyle',
    bio: 'Behind the craft — artisan stories, collection reveals & luxury jewellery inspiration.',
  },
  {
    id: '3',
    platform: 'Facebook',
    handle: 'LaxreeJewelleryOfficial',
    avatar: null,
    followers: 89200,
    pageLikes: 87600,
    posts: 456,
    engagementRate: 2.1,
    reach: 32400,
    monthlyGrowth: 1.8,
    connected: true,
    connectedAt: '2024-01-20',
    lastSync: '30 min ago',
    category: 'Jewellery & Luxury',
    bio: 'Official page of Laxree Jewellery — exquisite designs for every occasion.',
  },
  {
    id: '4',
    platform: 'Meta Business',
    handle: 'Laxree Ads Manager',
    avatar: null,
    followers: 0,
    adAccounts: 3,
    activeCampaigns: 5,
    totalSpend: 245000,
    monthlyGrowth: 0,
    connected: true,
    connectedAt: '2024-01-05',
    lastSync: '15 min ago',
    category: 'Business',
    bio: 'Meta Business Suite for Laxree Jewellery — managing ad accounts and campaigns.',
  },
  {
    id: '5',
    platform: 'Twitter',
    handle: '@laxree_official',
    avatar: null,
    followers: 42300,
    following: 1200,
    tweets: 1280,
    engagementRate: 1.9,
    reach: 18500,
    monthlyGrowth: 2.4,
    connected: true,
    connectedAt: '2024-04-01',
    lastSync: '3 hours ago',
    category: 'Jewellery & Luxury',
    bio: 'Official Twitter of Laxree Jewellery. Crafting elegance, one piece at a time.',
  },
  {
    id: '6',
    platform: 'LinkedIn',
    handle: 'Laxree Jewellery Pvt Ltd',
    avatar: null,
    followers: 15600,
    following: 450,
    posts: 89,
    engagementRate: 3.5,
    reach: 9200,
    monthlyGrowth: 4.7,
    connected: false,
    connectedAt: null,
    lastSync: null,
    category: 'Business',
    bio: 'Laxree Jewellery — India\'s premier luxury jewellery brand. Crafting heritage since 2018.',
  },
];

const growthData = [
  { month: 'Aug', Instagram: 118000, YouTube: 22000, Facebook: 81000, Twitter: 36000, LinkedIn: 11800 },
  { month: 'Sep', Instagram: 121500, YouTube: 23400, Facebook: 82800, Twitter: 37200, LinkedIn: 12400 },
  { month: 'Oct', Instagram: 125200, YouTube: 24800, Facebook: 84500, Twitter: 38500, LinkedIn: 13100 },
  { month: 'Nov', Instagram: 128900, YouTube: 26200, Facebook: 86200, Twitter: 39800, LinkedIn: 13800 },
  { month: 'Dec', Instagram: 132000, YouTube: 27400, Facebook: 87900, Twitter: 41000, LinkedIn: 14700 },
  { month: 'Jan', Instagram: 135400, YouTube: 28500, Facebook: 89200, Twitter: 42300, LinkedIn: 15600 },
];

const recentActivity = [
  { platform: 'Instagram', type: 'post', content: 'New Kundan collection reveal — 12 designs, 3 months in the making.', time: '25 min ago', metric: '2,847 likes', change: '+18%' },
  { platform: 'YouTube', type: 'video', content: 'Uploaded: "The Making of a Laxree Bridal Set"', time: '1 hour ago', metric: '4,230 views', change: '+24%' },
  { platform: 'Facebook', type: 'campaign', content: 'Festive Sale campaign reached 32,400 people in 48 hours.', time: '2 hours ago', metric: '₹12,400 spent', change: '' },
  { platform: 'Twitter', type: 'tweet', content: 'Announced collaboration with renowned designer Sabyasachi.', time: '3 hours ago', metric: '892 retweets', change: '+31%' },
  { platform: 'Instagram', type: 'story', content: 'Behind-the-scenes: Our artisans crafting gold jhumkas.', time: '4 hours ago', metric: '5,120 views', change: '+12%' },
  { platform: 'Meta Business', type: 'ad', content: 'New ad creative approved for "Akshaya Tritiya Collection".', time: '5 hours ago', metric: '₹8,500/day', change: '' },
  { platform: 'LinkedIn', type: 'post', content: 'Company milestone: 1,00,000+ happy customers served.', time: '6 hours ago', metric: '234 engagements', change: '+45%' },
  { platform: 'YouTube', type: 'milestone', content: 'Channel crossed 28,500 subscribers!', time: '8 hours ago', metric: '28.5K subs', change: '+5.1%' },
];

const topContent = [
  { platform: 'Instagram', type: 'Reel', caption: 'Bridal jewellery try-on — our most stunning collection yet! 💍✨ Every piece tells a story of love...', likes: 12450, comments: 892, shares: 2340, date: '2025-01-08', image: null },
  { platform: 'YouTube', type: 'Video', caption: 'Diwali Collection 2025 — Full Showcase | Luxury Indian Jewellery | Laxree', likes: 8920, comments: 1245, shares: 1890, date: '2025-01-05', image: null },
  { platform: 'Facebook', type: 'Post', caption: '✨ Introducing our Akshaya Tritiya Special Collection — 20% off on all gold pieces! Limited time offer...', likes: 6780, comments: 456, shares: 1230, date: '2025-01-03', image: null },
  { platform: 'Instagram', type: 'Post', caption: 'Behind every exquisite piece is 200+ hours of artisan craftsmanship. This Kundan necklace took 3 months...', likes: 9870, comments: 734, shares: 1560, date: '2024-12-28', image: null },
  { platform: 'Twitter', type: 'Tweet', caption: 'We are HIRING! Looking for talented jewellery designers to join our creative team. DM us your portfolio! 🎨💎', likes: 3450, comments: 890, shares: 2100, date: '2024-12-25', image: null },
];

export async function GET() {
  return NextResponse.json({
    accounts,
    growthData,
    recentActivity,
    topContent,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, accountId } = body;

    if (action === 'disconnect') {
      const account = accounts.find((a) => a.id === accountId);
      if (account) {
        return NextResponse.json({ success: true, message: `${account.platform} disconnected successfully` });
      }
      return NextResponse.json({ success: false, message: 'Account not found' }, { status: 404 });
    }

    if (action === 'connect') {
      return NextResponse.json({ success: true, message: 'Account connected successfully' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}