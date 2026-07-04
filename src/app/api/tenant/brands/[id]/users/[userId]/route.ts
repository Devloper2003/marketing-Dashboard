import { db } from '@/lib/db';
import { jsonResponse } from '@/lib/tenant-helpers';
import { NextRequest } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
    const body = await request.json();
    const { role, designation, isActive } = body;

    // Verify authorization: owner or admin of this tenant
    const requesterId = request.headers.get('x-user-id');
    if (!requesterId) {
      return jsonResponse({ success: false, error: 'x-user-id header is required' }, 400);
    }

    const requester = await db.tenantUser.findUnique({ where: { id: requesterId } });
    if (!requester || !requester.isActive) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 403);
    }

    if (requester.role !== 'platform_admin' && (requester.role !== 'owner' && requester.role !== 'admin')) {
      return jsonResponse({ success: false, error: 'Unauthorized. Owner or admin access required.' }, 403);
    }

    if (requester.role !== 'platform_admin' && requester.tenantId !== id) {
      return jsonResponse({ success: false, error: 'You do not belong to this tenant' }, 403);
    }

    // Find the target user
    const targetUser = await db.tenantUser.findUnique({
      where: { id: userId },
    });

    if (!targetUser || targetUser.tenantId !== id) {
      return jsonResponse({ success: false, error: 'User not found in this tenant' }, 404);
    }

    // Prevent demoting the owner
    if (targetUser.role === 'owner' && role && role !== 'owner') {
      return jsonResponse({ success: false, error: 'Cannot change the role of the tenant owner' }, 400);
    }

    // Prevent non-owners from managing other owners/admins
    if (requester.role === 'admin' && targetUser.role === 'owner') {
      return jsonResponse({ success: false, error: 'Admins cannot modify the owner' }, 403);
    }

    const updated = await db.tenantUser.update({
      where: { id: userId },
      data: {
        ...(role !== undefined && { role }),
        ...(designation !== undefined && { designation }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return jsonResponse({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        designation: updated.designation,
        avatar: updated.avatar,
        isActive: updated.isActive,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;

    // Verify authorization: owner or admin of this tenant
    const requesterId = request.headers.get('x-user-id');
    if (!requesterId) {
      return jsonResponse({ success: false, error: 'x-user-id header is required' }, 400);
    }

    const requester = await db.tenantUser.findUnique({ where: { id: requesterId } });
    if (!requester || !requester.isActive) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 403);
    }

    if (requester.role !== 'platform_admin' && (requester.role !== 'owner' && requester.role !== 'admin')) {
      return jsonResponse({ success: false, error: 'Unauthorized. Owner or admin access required.' }, 403);
    }

    if (requester.role !== 'platform_admin' && requester.tenantId !== id) {
      return jsonResponse({ success: false, error: 'You do not belong to this tenant' }, 403);
    }

    // Find the target user
    const targetUser = await db.tenantUser.findUnique({
      where: { id: userId },
    });

    if (!targetUser || targetUser.tenantId !== id) {
      return jsonResponse({ success: false, error: 'User not found in this tenant' }, 404);
    }

    // Cannot remove the owner
    if (targetUser.role === 'owner') {
      return jsonResponse({ success: false, error: 'Cannot remove the tenant owner' }, 400);
    }

    // Soft delete: set isActive to false
    await db.tenantUser.update({
      where: { id: userId },
      data: { isActive: false },
    });

    return jsonResponse({ success: true, message: 'User removed from tenant' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}