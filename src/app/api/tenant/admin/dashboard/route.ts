import { db } from '@/lib/db';
import { jsonResponse } from '@/lib/tenant-helpers';
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

    const [totalBrands, totalUsers, activeBrands, recentInvitations] = await Promise.all([
      db.tenant.count(),
      db.tenantUser.count({ where: { isActive: true } }),
      db.tenant.count({ where: { isActive: true } }),
      db.invitation.findMany({
        where: { acceptedAt: null, expiresAt: { gt: new Date() } },
        include: {
          tenant: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return jsonResponse({
      success: true,
      stats: {
        totalBrands,
        totalUsers,
        activeBrands,
        inactiveBrands: totalBrands - activeBrands,
      },
      recentInvitations: recentInvitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        designation: inv.designation,
        tenantName: inv.tenant.name,
        tenantSlug: inv.tenant.slug,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}