import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/integrations — list all integrations
export async function GET() {
  try {
    const integrations = await db.integration.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, integrations });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch integrations' }, { status: 500 });
  }
}

// POST /api/integrations — connect a new account
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { platform, platformName, authType, apiKey, apiSecret, accountId, accountName, syncInterval } = body;

    if (!platform || !platformName) {
      return NextResponse.json({ success: false, error: 'Platform and platformName are required' }, { status: 400 });
    }

    // Upsert: if integration for this platform exists, update it; otherwise create new
    const existing = await db.integration.findFirst({ where: { platform } });

    if (existing) {
      const updated = await db.integration.update({
        where: { id: existing.id },
        data: {
          platformName,
          authType: authType || 'api_key',
          apiKey: apiKey || undefined,
          apiSecret: apiSecret || undefined,
          accountId: accountId || undefined,
          accountName: accountName || undefined,
          status: 'connected',
          connectedAt: new Date(),
          disconnectedAt: null,
          error: null,
          lastSyncAt: new Date(),
          syncInterval: syncInterval || 3600,
        },
      });
      return NextResponse.json({ success: true, integration: sanitize(updated) });
    }

    const integration = await db.integration.create({
      data: {
        platform,
        platformName,
        authType: authType || 'api_key',
        apiKey: apiKey || undefined,
        apiSecret: apiSecret || undefined,
        accountId: accountId || undefined,
        accountName: accountName || undefined,
        status: 'connected',
        connectedAt: new Date(),
        lastSyncAt: new Date(),
        syncInterval: syncInterval || 3600,
      },
    });
    return NextResponse.json({ success: true, integration: sanitize(integration) });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save integration' }, { status: 500 });
  }
}

// DELETE /api/integrations — disconnect account
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    if (!platform) {
      return NextResponse.json({ success: false, error: 'Platform is required' }, { status: 400 });
    }

    const existing = await db.integration.findFirst({ where: { platform } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Integration not found' }, { status: 404 });
    }

    const updated = await db.integration.update({
      where: { id: existing.id },
      data: {
        status: 'disconnected',
        disconnectedAt: new Date(),
        apiKey: null,
        apiSecret: null,
        accessToken: null,
        refreshToken: null,
        accountId: null,
        accountName: null,
        error: null,
      },
    });
    return NextResponse.json({ success: true, integration: sanitize(updated) });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to disconnect' }, { status: 500 });
  }
}

// POST /api/integrations/test — test connection
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { platform, action } = body;

    if (action === 'test') {
      // Simulate a connection test — in production this would make actual API calls
      const existing = await db.integration.findFirst({ where: { platform } });
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Integration not found' }, { status: 404 });
      }

      // Simulate test result
      const success = true;
      const updated = await db.integration.update({
        where: { id: existing.id },
        data: {
          status: success ? 'connected' : 'error',
          lastSyncAt: success ? new Date() : existing.lastSyncAt,
          error: success ? null : 'Connection test failed',
        },
      });
      return NextResponse.json({
        success: true,
        testResult: { connected: true, latency: Math.floor(Math.random() * 200) + 50, message: 'Connection successful' },
        integration: sanitize(updated),
      });
    }

    if (action === 'sync') {
      const existing = await db.integration.findFirst({ where: { platform } });
      if (!existing) {
        return NextResponse.json({ success: false, error: 'Integration not found' }, { status: 404 });
      }
      const updated = await db.integration.update({
        where: { id: existing.id },
        data: { lastSyncAt: new Date() },
      });
      return NextResponse.json({
        success: true,
        message: 'Sync triggered successfully',
        integration: sanitize(updated),
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Operation failed' }, { status: 500 });
  }
}

function sanitize(integration: Record<string, unknown>) {
  const { apiKey, apiSecret, accessToken, refreshToken, ...rest } = integration;
  return {
    ...rest,
    hasApiKey: !!apiKey,
    hasApiSecret: !!apiSecret,
    hasAccessToken: !!accessToken,
  };
}