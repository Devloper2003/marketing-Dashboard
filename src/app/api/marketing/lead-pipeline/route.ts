import { NextRequest, NextResponse } from 'next/server';

const pipelineStages = [
  { id: 'new', name: 'New Lead', color: '#3b82f6', count: 24, value: 0 },
  { id: 'contacted', name: 'Contacted', color: '#a855f7', count: 18, value: 0 },
  { id: 'qualified', name: 'Qualified', color: '#D4A843', count: 12, value: 285000 },
  { id: 'proposal', name: 'Proposal Sent', color: '#f97316', count: 8, value: 520000 },
  { id: 'negotiation', name: 'Negotiation', color: '#eab308', count: 5, value: 380000 },
  { id: 'won', name: 'Won', color: '#22c55e', count: 32, value: 2860000 },
  { id: 'lost', name: 'Lost', color: '#ef4444', count: 15, value: 0 },
];

const leads = [
  { id: 'L001', name: 'Vikram Malhotra', company: 'Malhotra Enterprises', email: 'vikram@malhotra.co.in', phone: '+91 98765 43210', value: 350000, stage: 'new', source: 'Google Ads', quality: 'hot', assignedTo: 'Priya Sharma', createdAt: '2025-01-15', lastFollowUp: '2025-01-16', nextFollowUp: '2025-01-20', followUpCount: 1, notes: 'Interested in diamond necklace collection', tags: ['VIP', 'Diamond'], country: 'India', city: 'Mumbai' },
  { id: 'L002', name: 'Ananya Kapoor', company: 'Kapoor Holdings', email: 'ananya@kapoor.com', phone: '+91 87654 32109', value: 180000, stage: 'new', source: 'Website', quality: 'warm', assignedTo: 'Rahul Verma', createdAt: '2025-01-14', lastFollowUp: '2025-01-15', nextFollowUp: '2025-01-19', followUpCount: 0, notes: 'Browsing gold bangles section', tags: ['Gold'], country: 'India', city: 'Delhi' },
  { id: 'L003', name: 'Arjun Reddy', company: 'Reddy Jewellers', email: 'arjun@reddyj.com', phone: '+91 76543 21098', value: 520000, stage: 'new', source: 'Referral', quality: 'hot', assignedTo: 'Priya Sharma', createdAt: '2025-01-13', lastFollowUp: null, nextFollowUp: '2025-01-18', followUpCount: 0, notes: 'Referred by existing client Mehta Group', tags: ['VIP', 'Bridal'], country: 'India', city: 'Hyderabad' },
  { id: 'L004', name: 'Meera Patel', company: 'Patel & Sons', email: 'meera@patelsons.in', phone: '+91 65432 10987', value: 95000, stage: 'new', source: 'Instagram', quality: 'cold', assignedTo: 'Neha Gupta', createdAt: '2025-01-12', lastFollowUp: null, nextFollowUp: '2025-01-22', followUpCount: 0, notes: 'Liked Instagram post about Kundan sets', tags: ['Kundan'], country: 'India', city: 'Ahmedabad' },
  { id: 'L005', name: 'Rohan Shah', company: 'Shah Diamonds', email: 'rohan@shahd.com', phone: '+91 54321 09876', value: 750000, stage: 'new', source: 'Facebook', quality: 'warm', assignedTo: 'Rahul Verma', createdAt: '2025-01-11', lastFollowUp: null, nextFollowUp: '2025-01-21', followUpCount: 0, notes: 'Engaged with Facebook ad campaign', tags: ['Diamond', 'Corporate'], country: 'India', city: 'Surat' },
  { id: 'L006', name: 'Kavita Nair', company: 'Nair Group', email: 'kavita@nairgroup.in', phone: '+91 43210 98765', value: 220000, stage: 'contacted', source: 'Google Ads', quality: 'hot', assignedTo: 'Priya Sharma', createdAt: '2025-01-10', lastFollowUp: '2025-01-14', nextFollowUp: '2025-01-18', followUpCount: 3, notes: 'Called about platinum engagement ring', tags: ['Platinum', 'Engagement'], country: 'India', city: 'Chennai' },
  { id: 'L007', name: 'Sanjay Mehta', company: 'Mehta Jewellers', email: 'sanjay@mehtaj.com', phone: '+91 32109 87654', value: 125000, stage: 'contacted', source: 'Email', quality: 'warm', assignedTo: 'Neha Gupta', createdAt: '2025-01-09', lastFollowUp: '2025-01-13', nextFollowUp: '2025-01-17', followUpCount: 2, notes: 'Responded to email newsletter promotion', tags: ['Newsletter'], country: 'India', city: 'Jaipur' },
  { id: 'L008', name: 'Divya Iyer', company: 'Iyer & Co', email: 'divya@iyerco.in', phone: '+91 21098 76543', value: 480000, stage: 'contacted', source: 'Referral', quality: 'hot', assignedTo: 'Rahul Verma', createdAt: '2025-01-08', lastFollowUp: '2025-01-12', nextFollowUp: '2025-01-16', followUpCount: 4, notes: 'Looking for bridal jewellery set', tags: ['VIP', 'Bridal', 'South'], country: 'India', city: 'Bangalore' },
  { id: 'L009', name: 'Aditya Joshi', company: 'Joshi Traders', email: 'aditya@joshi.in', phone: '+91 10987 65432', value: 85000, stage: 'contacted', source: 'Website', quality: 'cold', assignedTo: 'Priya Sharma', createdAt: '2025-01-07', lastFollowUp: '2025-01-11', nextFollowUp: '2025-01-20', followUpCount: 2, notes: 'General inquiry about custom designs', tags: ['Custom'], country: 'India', city: 'Pune' },
  { id: 'L010', name: 'Ritu Singh', company: 'Singh Estates', email: 'ritu@singhestates.com', phone: '+91 99887 76655', value: 650000, stage: 'qualified', source: 'Google Ads', quality: 'hot', assignedTo: 'Neha Gupta', createdAt: '2025-01-06', lastFollowUp: '2025-01-14', nextFollowUp: '2025-01-17', followUpCount: 5, notes: 'Qualified for premium diamond collection', tags: ['VIP', 'Diamond', 'Premium'], country: 'India', city: 'Delhi' },
  { id: 'L011', name: 'Nikhil Agarwal', company: 'Agarwal Industries', email: 'nikhil@agarwal.in', phone: '+91 88776 65544', value: 320000, stage: 'qualified', source: 'Referral', quality: 'warm', assignedTo: 'Rahul Verma', createdAt: '2025-01-05', lastFollowUp: '2025-01-13', nextFollowUp: '2025-01-18', followUpCount: 3, notes: 'Interested in gold investment pieces', tags: ['Gold', 'Investment'], country: 'India', city: 'Kolkata' },
  { id: 'L012', name: 'Pooja Deshmukh', company: 'Deshmukh Corp', email: 'pooja@deshmukh.com', phone: '+91 77665 54433', value: 195000, stage: 'qualified', source: 'Facebook', quality: 'warm', assignedTo: 'Priya Sharma', createdAt: '2025-01-04', lastFollowUp: '2025-01-12', nextFollowUp: '2025-01-19', followUpCount: 2, notes: 'Looking for anniversary gift options', tags: ['Anniversary'], country: 'India', city: 'Nagpur' },
  { id: 'L013', name: 'Rajesh Kumar', company: 'Kumar Diamonds', email: 'rajesh@kumard.in', phone: '+91 66554 43322', value: 890000, stage: 'proposal', source: 'Google Ads', quality: 'hot', assignedTo: 'Neha Gupta', createdAt: '2024-12-28', lastFollowUp: '2025-01-15', nextFollowUp: '2025-01-18', followUpCount: 8, notes: 'Proposal sent for 5-carat solitaire ring', tags: ['VIP', 'Diamond', 'Solitaire'], country: 'India', city: 'Mumbai' },
  { id: 'L014', name: 'Sunita Choudhary', company: 'Choudhary Group', email: 'sunita@choudhary.in', phone: '+91 55443 32211', value: 340000, stage: 'proposal', source: 'Referral', quality: 'warm', assignedTo: 'Rahul Verma', createdAt: '2024-12-25', lastFollowUp: '2025-01-14', nextFollowUp: '2025-01-17', followUpCount: 6, notes: 'Proposal sent for bridal necklace set', tags: ['Bridal', 'Gold'], country: 'India', city: 'Jaipur' },
  { id: 'L015', name: 'Amit Banerjee', company: 'Banerjee & Sons', email: 'amit@banerjee.in', phone: '+91 44332 21100', value: 275000, stage: 'proposal', source: 'Website', quality: 'warm', assignedTo: 'Priya Sharma', createdAt: '2024-12-20', lastFollowUp: '2025-01-13', nextFollowUp: '2025-01-16', followUpCount: 5, notes: 'Custom emerald ring proposal', tags: ['Emerald', 'Custom'], country: 'India', city: 'Kolkata' },
  { id: 'L016', name: 'Lakshmi Venkataraman', company: 'Venkataraman Holdings', email: 'lakshmi@venkat.co.in', phone: '+91 33221 10099', value: 1200000, stage: 'negotiation', source: 'Referral', quality: 'hot', assignedTo: 'Neha Gupta', createdAt: '2024-12-15', lastFollowUp: '2025-01-15', nextFollowUp: '2025-01-17', followUpCount: 10, notes: 'Negotiating on heritage temple jewellery set', tags: ['VIP', 'Heritage', 'Temple'], country: 'India', city: 'Chennai' },
  { id: 'L017', name: 'Deepak Chopra', company: 'Chopra Luxe', email: 'deepak@chopraluxe.com', phone: '+91 22110 09988', value: 580000, stage: 'negotiation', source: 'Google Ads', quality: 'hot', assignedTo: 'Rahul Verma', createdAt: '2024-12-10', lastFollowUp: '2025-01-14', nextFollowUp: '2025-01-16', followUpCount: 7, notes: 'Price negotiation on platinum tennis bracelet', tags: ['Platinum', 'Tennis'], country: 'India', city: 'Delhi' },
  { id: 'L018', name: 'Sneha Pillai', company: 'Pillai Enterprises', email: 'sneha@pillai.co.in', phone: '+91 11009 98877', value: 420000, stage: 'won', source: 'Referral', quality: 'hot', assignedTo: 'Priya Sharma', createdAt: '2024-11-20', lastFollowUp: '2025-01-10', nextFollowUp: null, followUpCount: 12, notes: 'Closed! Bridal set — 18K gold + diamonds', tags: ['VIP', 'Bridal', 'Closed'], country: 'India', city: 'Kochi' },
  { id: 'L019', name: 'Manish Tandon', company: 'Tandon Group', email: 'manish@tandon.in', phone: '+91 90088 77666', value: 680000, stage: 'won', source: 'Google Ads', quality: 'hot', assignedTo: 'Rahul Verma', createdAt: '2024-11-15', lastFollowUp: '2025-01-08', nextFollowUp: null, followUpCount: 9, notes: 'Closed! Diamond earrings + matching pendant', tags: ['Diamond', 'Closed'], country: 'India', city: 'Mumbai' },
  { id: 'L020', name: 'Anita Saxena', company: 'Saxena Jewels', email: 'anita@saxenaj.com', phone: '+91 80077 66555', value: 150000, stage: 'won', source: 'Instagram', quality: 'warm', assignedTo: 'Neha Gupta', createdAt: '2024-12-01', lastFollowUp: '2025-01-05', nextFollowUp: null, followUpCount: 6, notes: 'Closed! Gold bangle set for wedding', tags: ['Gold', 'Bridal', 'Closed'], country: 'India', city: 'Lucknow' },
  { id: 'L021', name: 'Karthik Rao', company: 'Rao Diamonds', email: 'karthik@raod.in', phone: '+91 70066 55444', value: 920000, stage: 'won', source: 'Website', quality: 'hot', assignedTo: 'Priya Sharma', createdAt: '2024-10-25', lastFollowUp: '2024-12-28', nextFollowUp: null, followUpCount: 14, notes: 'Closed! 3-carat diamond ring + wedding band', tags: ['VIP', 'Diamond', 'Closed'], country: 'India', city: 'Bangalore' },
  { id: 'L022', name: 'Prachi Gupta', company: 'Gupta & Co', email: 'prachi@guptaco.in', phone: '+91 60055 44333', value: 85000, stage: 'lost', source: 'Facebook', quality: 'cold', assignedTo: 'Rahul Verma', createdAt: '2024-12-05', lastFollowUp: '2024-12-20', nextFollowUp: null, followUpCount: 3, notes: 'Lost to competitor — price sensitivity', tags: ['Lost'], country: 'India', city: 'Indore' },
  { id: 'L023', name: 'Harsh Vardhan', company: 'Vardhan Estates', email: 'harsh@vardhan.in', phone: '+91 50044 33222', value: 210000, stage: 'lost', source: 'Email', quality: 'warm', assignedTo: 'Neha Gupta', createdAt: '2024-11-28', lastFollowUp: '2024-12-18', nextFollowUp: null, followUpCount: 4, notes: 'Lost — decided to go with local jeweller', tags: ['Lost'], country: 'India', city: 'Gurgaon' },
  { id: 'L024', name: 'Ishita Mukherjee', company: 'Mukherjee Arts', email: 'ishita@mukherjee.in', phone: '+91 40033 22111', value: 460000, stage: 'won', source: 'Referral', quality: 'hot', assignedTo: 'Priya Sharma', createdAt: '2024-10-10', lastFollowUp: '2024-12-15', nextFollowUp: null, followUpCount: 11, notes: 'Closed! Heritage gold temple jewellery', tags: ['VIP', 'Heritage', 'Closed'], country: 'India', city: 'Kolkata' },
  { id: 'L025', name: 'Varun Khanna', company: 'Khanna Luxe', email: 'varun@khannaluxe.com', phone: '+91 30022 11000', value: 380000, stage: 'lost', source: 'Google Ads', quality: 'cold', assignedTo: 'Rahul Verma', createdAt: '2024-11-10', lastFollowUp: '2024-12-10', nextFollowUp: null, followUpCount: 3, notes: 'Lost — no response after initial contact', tags: ['Lost'], country: 'India', city: 'Delhi' },
];

const followUps = [
  { id: 'FU001', leadName: 'Rajesh Kumar', leadId: 'L013', type: 'meeting', subject: 'Solitaire Ring — Final Pricing Review', date: '2025-01-16', time: '11:00 AM', status: 'scheduled', notes: 'Discuss final pricing for 5-carat solitaire. Client wants certification details.', assignedTo: 'Neha Gupta' },
  { id: 'FU002', leadName: 'Lakshmi Venkataraman', leadId: 'L016', type: 'call', subject: 'Temple Jewellery — Counter Offer', date: '2025-01-16', time: '2:30 PM', status: 'scheduled', notes: 'Present counter offer on heritage set. Highlight craftsmanship and GIA certification.', assignedTo: 'Neha Gupta' },
  { id: 'FU003', leadName: 'Deepak Chopra', leadId: 'L017', type: 'whatsapp', subject: 'Platinum Bracelet — Update', date: '2025-01-15', time: '10:00 AM', status: 'completed', notes: 'Sent updated pricing. Client reviewing with spouse.', assignedTo: 'Rahul Verma' },
  { id: 'FU004', leadName: 'Ritu Singh', leadId: 'L010', type: 'email', subject: 'Premium Diamond Collection — Catalogue', date: '2025-01-15', time: '9:15 AM', status: 'completed', notes: 'Sent premium collection PDF. Follow up on Thursday.', assignedTo: 'Neha Gupta' },
  { id: 'FU005', leadName: 'Vikram Malhotra', leadId: 'L001', type: 'call', subject: 'Diamond Necklace — Initial Introduction', date: '2025-01-16', time: '4:00 PM', status: 'pending', notes: 'First call with lead. Present brand story and diamond expertise.', assignedTo: 'Priya Sharma' },
  { id: 'FU006', leadName: 'Divya Iyer', leadId: 'L008', type: 'meeting', subject: 'Bridal Set — Design Consultation', date: '2025-01-17', time: '11:30 AM', status: 'scheduled', notes: 'In-store consultation for bridal set. Bring Kundan and Polki samples.', assignedTo: 'Rahul Verma' },
  { id: 'FU007', leadName: 'Kavita Nair', leadId: 'L006', type: 'whatsapp', subject: 'Platinum Ring — Follow Up', date: '2025-01-14', time: '3:00 PM', status: 'completed', notes: 'Sent ring images and specifications. Client interested in 2-carat option.', assignedTo: 'Priya Sharma' },
  { id: 'FU008', leadName: 'Arjun Reddy', leadId: 'L003', type: 'email', subject: 'Welcome + Bridal Collection', date: '2025-01-16', time: '8:00 AM', status: 'pending', notes: 'Send welcome email with bridal collection link. Reference Mehta Group.', assignedTo: 'Priya Sharma' },
  { id: 'FU009', leadName: 'Sunita Choudhary', leadId: 'L014', type: 'call', subject: 'Proposal Feedback', date: '2025-01-15', time: '5:00 PM', status: 'completed', notes: 'Client liked the proposal. Requested minor design modifications.', assignedTo: 'Rahul Verma' },
  { id: 'FU010', leadName: 'Amit Banerjee', leadId: 'L015', type: 'meeting', subject: 'Custom Emerald Ring — Design Review', date: '2025-01-18', time: '10:00 AM', status: 'scheduled', notes: 'Review CAD designs for custom emerald ring. Bring stone samples.', assignedTo: 'Priya Sharma' },
];

const stats = {
  totalLeads: 114,
  thisMonth: 28,
  conversionRate: 28,
  avgDealSize: 89375,
  avgDaysToClose: 18,
  totalRevenue: 2860000,
  hotLeads: 12,
  warmLeads: 18,
  coldLeads: 24,
};

const monthlyTrend = [
  { month: 'Aug', new: 32, won: 8, revenue: 420000, conversionRate: 25 },
  { month: 'Sep', new: 28, won: 10, revenue: 580000, conversionRate: 36 },
  { month: 'Oct', new: 35, won: 12, revenue: 720000, conversionRate: 34 },
  { month: 'Nov', new: 42, won: 15, revenue: 890000, conversionRate: 36 },
  { month: 'Dec', new: 38, won: 18, revenue: 1050000, conversionRate: 47 },
  { month: 'Jan', new: 28, won: 14, revenue: 2860000, conversionRate: 28 },
];

const sourceBreakdown = [
  { source: 'Google Ads', count: 38, percentage: 33, revenue: 1280000 },
  { source: 'Referral', count: 28, percentage: 25, revenue: 980000 },
  { source: 'Website', count: 22, percentage: 19, revenue: 420000 },
  { source: 'Facebook', count: 14, percentage: 12, revenue: 180000 },
  { source: 'Instagram', count: 8, percentage: 7, revenue: 95000 },
  { source: 'Email', count: 4, percentage: 4, revenue: 45000 },
];

const teamPerformance = [
  { name: 'Priya Sharma', leads: 38, won: 14, revenue: 1420000, avgDealDays: 16 },
  { name: 'Rahul Verma', leads: 32, won: 10, revenue: 880000, avgDealDays: 20 },
  { name: 'Neha Gupta', leads: 28, won: 8, revenue: 560000, avgDealDays: 19 },
  { name: 'Amit Singh', leads: 16, won: 5, revenue: 320000, avgDealDays: 22 },
];

export async function GET() {
  return NextResponse.json({
    pipeline: { stages: pipelineStages },
    leads,
    followUps,
    stats,
    monthlyTrend,
    sourceBreakdown,
    teamPerformance,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === 'follow-up') {
      return NextResponse.json({
        success: true,
        followUp: {
          id: `FU${String(followUps.length + 1).padStart(3, '0')}`,
          ...body.data,
          status: 'scheduled',
        },
      });
    }

    return NextResponse.json({
      success: true,
      lead: {
        id: `L${String(leads.length + 1).padStart(3, '0')}`,
        ...body,
        createdAt: new Date().toISOString().split('T')[0],
        lastFollowUp: null,
        followUpCount: 0,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}