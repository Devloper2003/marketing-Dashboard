import { db } from '@/lib/db';
import { jsonResponse } from '@/lib/tenant-helpers';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return jsonResponse({ success: false, error: 'email query param is required' }, 400);
    }

    const user = await db.tenantUser.findFirst({
      where: { email, isActive: true },
      select: { id: true, tenantId: true, name: true, email: true, role: true, designation: true },
    });

    if (!user) {
      return jsonResponse({ success: false, error: 'User not found' }, 404);
    }

    return jsonResponse({ success: true, user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}