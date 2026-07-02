import { db } from '@/lib/db';
import { generateToken, jsonResponse } from '@/lib/tenant-helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tenant = await db.tenant.findUnique({
      where: { id },
      include: {
        users: {
          where: { isActive: true },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            designation: true,
            avatar: true,
            lastLoginAt: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!tenant) {
      return jsonResponse({ success: false, error: 'Tenant not found' }, 404);
    }

    return jsonResponse({
      success: true,
      brand: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        logo: tenant.logo,
        primaryColor: tenant.primaryColor,
        secondaryColor: tenant.secondaryColor,
        bgAccent: tenant.bgAccent,
        isActive: tenant.isActive,
        plan: tenant.plan,
        maxUsers: tenant.maxUsers,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        users: tenant.users,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, logo, primaryColor, secondaryColor, bgAccent, isActive } = body;

    // Verify authorization: owner or admin of this tenant
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return jsonResponse({ success: false, error: 'x-user-id header is required' }, 400);
    }

    const user = await db.tenantUser.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'owner' && user.role !== 'admin' && user.role !== 'platform_admin') || !user.isActive) {
      return jsonResponse({ success: false, error: 'Unauthorized. Owner or admin access required.' }, 403);
    }

    if (user.role !== 'platform_admin' && user.tenantId !== id) {
      return jsonResponse({ success: false, error: 'You do not belong to this tenant' }, 403);
    }

    const tenant = await db.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return jsonResponse({ success: false, error: 'Tenant not found' }, 404);
    }

    const updated = await db.tenant.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(logo !== undefined && { logo }),
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor !== undefined && { secondaryColor }),
        ...(bgAccent !== undefined && { bgAccent }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return jsonResponse({
      success: true,
      brand: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        logo: updated.logo,
        primaryColor: updated.primaryColor,
        secondaryColor: updated.secondaryColor,
        bgAccent: updated.bgAccent,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return jsonResponse({ success: false, error: 'x-user-id header is required' }, 400);
    }

    const user = await db.tenantUser.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'platform_admin' || !user.isActive) {
      return jsonResponse({ success: false, error: 'Unauthorized. Platform admin access required.' }, 403);
    }

    const tenant = await db.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return jsonResponse({ success: false, error: 'Tenant not found' }, 404);
    }

    // Delete all related data in order (cascade)
    await db.invitation.deleteMany({ where: { tenantId: id } });
    await db.tenantUser.deleteMany({ where: { tenantId: id } });
    await db.tenant.delete({ where: { id } });

    return jsonResponse({ success: true, message: 'Brand deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}