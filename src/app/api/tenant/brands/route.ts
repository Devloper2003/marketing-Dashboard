import { db } from '@/lib/db';
import { hashPassword, jsonResponse } from '@/lib/tenant-helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return jsonResponse({ success: false, error: 'userId query param is required' }, 400);
    }

    // Verify the user is a platform_admin
    const user = await db.tenantUser.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'platform_admin' || !user.isActive) {
      return jsonResponse({ success: false, error: 'Unauthorized. Platform admin access required.' }, 403);
    }

    // Get all tenants with user counts
    const tenants = await db.tenant.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { users: { where: { isActive: true } } },
        },
      },
    });

    const data = tenants.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      logo: t.logo,
      primaryColor: t.primaryColor,
      secondaryColor: t.secondaryColor,
      bgAccent: t.bgAccent,
      isActive: t.isActive,
      plan: t.plan,
      maxUsers: t.maxUsers,
      userCount: t._count.users,
      createdAt: t.createdAt,
    }));

    return jsonResponse({ success: true, brands: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, primaryColor, logo, email, password, userName } = body;

    // Verify requester is platform_admin
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return jsonResponse({ success: false, error: 'x-user-id header is required' }, 400);
    }

    const admin = await db.tenantUser.findUnique({ where: { id: userId } });
    if (!admin || admin.role !== 'platform_admin' || !admin.isActive) {
      return jsonResponse({ success: false, error: 'Unauthorized. Platform admin access required.' }, 403);
    }

    if (!name || !slug || !email || !password || !userName) {
      return jsonResponse({ success: false, error: 'name, slug, email, password, and userName are required' }, 400);
    }

    // Check slug uniqueness
    const existing = await db.tenant.findUnique({ where: { slug } });
    if (existing) {
      return jsonResponse({ success: false, error: 'A tenant with this slug already exists' }, 409);
    }

    // Create tenant with owner user
    const tenant = await db.tenant.create({
      data: {
        name,
        slug,
        primaryColor: primaryColor || '#D4A843',
        logo: logo || null,
        users: {
          create: {
            email,
            name: userName,
            password: hashPassword(password),
            role: 'owner',
            designation: 'Brand Owner',
          },
        },
      },
      include: {
        users: true,
      },
    });

    return jsonResponse({
      success: true,
      brand: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        logo: tenant.logo,
        primaryColor: tenant.primaryColor,
        plan: tenant.plan,
        createdAt: tenant.createdAt,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}