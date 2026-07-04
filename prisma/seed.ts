import { db } from '@/lib/db';

async function main() {
  // Clear all existing data for clean start
  await db.campaign.deleteMany();
  await db.blogPost.deleteMany();
  await db.socialPost.deleteMany();
  await db.contentCalendar.deleteMany();
  await db.seoKeyword.deleteMany();
  await db.lead.deleteMany();
  await db.ideaNote.deleteMany();
  await db.channelGoal.deleteMany();
  await db.budgetItem.deleteMany();
  await db.competitor.deleteMany();
  await db.emailCampaign.deleteMany();

  console.log('✓ All tables cleared — ready for live data');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });