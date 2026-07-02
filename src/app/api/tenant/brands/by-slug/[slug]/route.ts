import { db } from '@/lib/db';
import { jsonResponse } from '@/lib/tenant-helpers';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return jsonResponse({ success: false, error: 'Slug parameter is required' }, 400);
    }

    const tenant = await db.tenant.findUnique({
      where: { slug },
    });

    if (!tenant || !tenant.isActive) {
      return jsonResponse({ success: false, error: 'Brand not found' }, 404);
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
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return jsonResponse({ success: false, error: message }, 500);
  }
}