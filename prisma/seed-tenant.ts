import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Seeding tenant data...\n');

  // ── Platform Admin Tenant (Laxree) ──
  const laxree = await prisma.tenant.upsert({
    where: { slug: 'laxree' },
    update: {},
    create: {
      name: 'Laxree',
      slug: 'laxree',
      logo: '/logos/laxree.svg',
      primaryColor: '#D4A843',
      plan: 'enterprise',
      maxUsers: 100,
    },
  });

  const laxreeAdmin = await prisma.tenantUser.upsert({
    where: {
      tenantId_email: {
        tenantId: laxree.id,
        email: 'admin@laxree.com',
      },
    },
    update: { role: 'platform_admin', designation: 'Platform Administrator', name: 'Laxree Admin' },
    create: {
      tenantId: laxree.id,
      email: 'admin@laxree.com',
      name: 'Laxree Admin',
      password: hashPassword('laxree2024'),
      role: 'platform_admin',
      designation: 'Platform Administrator',
      isActive: true,
    },
  });

  console.log(`✅ Created tenant: ${laxree.name} (${laxree.slug})`);
  console.log(`   └─ User: ${laxreeAdmin.email} [${laxreeAdmin.role}]\n`);

  // ── Client Brand Tenant (Brand A) ──
  const brandA = await prisma.tenant.upsert({
    where: { slug: 'branda' },
    update: {},
    create: {
      name: 'Brand A',
      slug: 'branda',
      logo: null,
      primaryColor: '#3b82f6',
      plan: 'pro',
      maxUsers: 10,
    },
  });

  const brandAAdmin = await prisma.tenantUser.upsert({
    where: {
      tenantId_email: {
        tenantId: brandA.id,
        email: 'admin@branda.com',
      },
    },
    update: {},
    create: {
      tenantId: brandA.id,
      email: 'admin@branda.com',
      name: 'Brand A Owner',
      password: hashPassword('branda2024'),
      role: 'owner',
      designation: 'Brand Owner',
      isActive: true,
    },
  });

  console.log(`✅ Created tenant: ${brandA.name} (${brandA.slug})`);
  console.log(`   └─ User: ${brandAAdmin.email} [${brandAAdmin.role}]\n`);

  // ── Staff member for Brand A ──
  const brandAStaff = await prisma.tenantUser.upsert({
    where: {
      tenantId_email: {
        tenantId: brandA.id,
        email: 'staff@branda.com',
      },
    },
    update: {},
    create: {
      tenantId: brandA.id,
      email: 'staff@branda.com',
      name: 'Rahul Sharma',
      password: hashPassword('staff2024'),
      role: 'staff',
      designation: 'Marketing Executive',
      isActive: true,
      invitedBy: brandAAdmin.id,
    },
  });

  console.log(`✅ Created staff user: ${brandAStaff.email} [${brandAStaff.role}]`);
  console.log(`   └─ Designation: ${brandAStaff.designation}\n`);

  console.log('🎉 Seed complete!\n');
  console.log('Login credentials:');
  console.log('  Laxree Admin:   admin@laxree.com / laxree2024');
  console.log('  Brand A Admin:  admin@branda.com / branda2024');
  console.log('  Brand A Staff:  staff@branda.com / staff2024');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });