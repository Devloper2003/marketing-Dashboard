import { db } from '@/lib/db';
import { hashPassword, jsonResponse } from '@/lib/tenant-helpers';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, name, password, role, designation } = body;

    // Verify authorization: owner or admin of this tenant
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return jsonResponse({ success: false, error: 'x-user-id header is required' }, 400);
    }

    const admin = await db.tenantUser.findUnique({ where: { id: userId } });
    if (!admin || !admin.isActive) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 403);
    }

    if (admin.role !== 'platform_admin' && (admin.role !== 'owner' && admin.role !== 'admin')) {
      return jsonResponse({ success: false, error: 'Unauthorized. Owner or admin access required.' }, 403);
    }

    if (admin.role !== 'platform_admin' && admin.tenantId !== id) {
      return jsonResponse({ success: false, error: 'You do not belong to this tenant' }, 403);
    }

    const tenant = await db.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return jsonResponse({ success: false, error: 'Tenant not found' }, 404);
    }

    if (!email || !name || !password) {
      return jsonResponse({ success: false, error: 'email, name, and password are required' }, 400);
    }

    // Check if user already exists
    const existingUser = await db.tenantUser.findFirst({
      where: { tenantId: id, email },
    });
    if (existingUser) {
      return jsonResponse({ success: false, error: 'User already exists in this tenant' }, 409);
    }

    // Check max users
    const userCount = await db.tenantUser.count({
      where: { tenantId: id, isActive: true },
    });
    if (userCount >= tenant.maxUsers) {
      return jsonResponse({ success: false, error: `Maximum user limit (${tenant.maxUsers}) reached for this tenant` }, 400);
    }

    const user = await db.tenantUser.create({
      data: {
        tenantId: id,
        email,
        name,
        password: hashPassword(password),
        role: role || 'staff',
        designation: designation || null,
        invitedBy: userId,
      },
    });

    return jsonResponse({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        designation: user.designation,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}