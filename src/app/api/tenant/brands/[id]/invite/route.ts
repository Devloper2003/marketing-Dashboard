import { db } from '@/lib/db';
import { generateToken, jsonResponse } from '@/lib/tenant-helpers';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, role, designation } = body;

    // Verify authorization: owner or admin of this tenant
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return jsonResponse({ success: false, error: 'x-user-id header is required' }, 400);
    }

    const inviter = await db.tenantUser.findUnique({ where: { id: userId } });
    if (!inviter || !inviter.isActive) {
      return jsonResponse({ success: false, error: 'Unauthorized' }, 403);
    }

    if (inviter.role !== 'platform_admin' && (inviter.role !== 'owner' && inviter.role !== 'admin')) {
      return jsonResponse({ success: false, error: 'Unauthorized. Owner or admin access required.' }, 403);
    }

    if (inviter.role !== 'platform_admin' && inviter.tenantId !== id) {
      return jsonResponse({ success: false, error: 'You do not belong to this tenant' }, 403);
    }

    const tenant = await db.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return jsonResponse({ success: false, error: 'Tenant not found' }, 404);
    }

    if (!email) {
      return jsonResponse({ success: false, error: 'email is required' }, 400);
    }

    // Check if user already exists in this tenant
    const existingUser = await db.tenantUser.findFirst({
      where: { tenantId: id, email },
    });
    if (existingUser) {
      return jsonResponse({ success: false, error: 'User already exists in this tenant' }, 409);
    }

    // Check for pending invitation
    const existingInvitation = await db.invitation.findFirst({
      where: {
        tenantId: id,
        email,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (existingInvitation) {
      return jsonResponse({ success: false, error: 'A pending invitation already exists for this email' }, 409);
    }

    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await db.invitation.create({
      data: {
        tenantId: id,
        email,
        role: role || 'staff',
        designation: designation || null,
        token,
        expiresAt,
        invitedBy: userId,
      },
    });

    return jsonResponse({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        designation: invitation.designation,
        token: invitation.token,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}