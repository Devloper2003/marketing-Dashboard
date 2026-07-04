import { db } from '@/lib/db';
import { hashPassword, jsonResponse } from '@/lib/tenant-helpers';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, slug } = body;

    if (!email || !password) {
      return jsonResponse({ success: false, error: 'Email and password are required' }, 400);
    }

    const hashedPassword = hashPassword(password);

    // Find user by email, optionally filter by tenant slug
    const where: Record<string, unknown> = {
      email,
      password: hashedPassword,
      isActive: true,
    };

    if (slug) {
      where.tenant = { slug };
    }

    const user = await db.tenantUser.findFirst({
      where,
      include: {
        tenant: true,
      },
    });

    if (!user) {
      return jsonResponse({ success: false, error: 'Invalid credentials' }, 401);
    }

    // Update last login
    await db.tenantUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return jsonResponse({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        avatar: user.avatar,
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
        logo: user.tenant.logo,
        primaryColor: user.tenant.primaryColor,
        secondaryColor: user.tenant.secondaryColor,
        bgAccent: user.tenant.bgAccent,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}