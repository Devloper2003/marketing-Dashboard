import { db } from '@/lib/db';
import { hashPassword, jsonResponse } from '@/lib/tenant-helpers';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, name, password } = body;

    if (!token || !name || !password) {
      return jsonResponse({ success: false, error: 'token, name, and password are required' }, 400);
    }

    // Find the invitation
    const invitation = await db.invitation.findUnique({
      where: { token },
      include: { tenant: true },
    });

    if (!invitation) {
      return jsonResponse({ success: false, error: 'Invalid invitation token' }, 404);
    }

    if (invitation.acceptedAt) {
      return jsonResponse({ success: false, error: 'This invitation has already been accepted' }, 400);
    }

    if (invitation.expiresAt < new Date()) {
      return jsonResponse({ success: false, error: 'This invitation has expired' }, 400);
    }

    // Create the tenant user
    const user = await db.tenantUser.create({
      data: {
        tenantId: invitation.tenantId,
        email: invitation.email,
        name,
        password: hashPassword(password),
        role: invitation.role,
        designation: invitation.designation,
        invitedBy: invitation.invitedBy,
      },
    });

    // Mark invitation as accepted
    await db.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    return jsonResponse({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        designation: user.designation,
      },
      tenant: {
        id: invitation.tenant.id,
        name: invitation.tenant.name,
        slug: invitation.tenant.slug,
        logo: invitation.tenant.logo,
        primaryColor: invitation.tenant.primaryColor,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}