'use client';

import { useState, useEffect } from 'react';
import {
  Plug,
  Key,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Shield,
  Clock,
  Zap,
  AlertCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Link2,
  Unplug,
  Settings,
  ArrowRight,
  Globe,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

interface PlatformConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  authType: 'oauth' | 'api_key' | 'both';
  docsUrl: string;
  fields: { key: string; label: string; placeholder: string; type: 'text' | 'password'; required: boolean }[];
  capabilities: string[];
  category: string;
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'google_ads',
    name: 'Google Ads',
    description: 'Run ad campaigns, track conversions, and optimize spend across Google Search, Display, and YouTube.',
    icon: 'G',
    color: '#4285F4',
    bgColor: 'rgba(66,133,244,0.1)',
    borderColor: 'rgba(66,133,244,0.3)',
    authType: 'both',
    docsUrl: 'https://developers.google.com/google-ads/api/docs/start',
    fields: [
      { key: 'apiKey', label: 'Client ID', placeholder: 'xxxxxx.apps.googleusercontent.com', type: 'text', required: true },
      { key: 'apiSecret', label: 'Client Secret', placeholder: 'GOCSPX-xxxxxxxx', type: 'password', required: true },
      { key: 'accountId', label: 'Customer ID', placeholder: '123-456-7890', type: 'text', required: false },
    ],
    capabilities: ['Ad Performance', 'Conversion Tracking', 'Spend Analytics', 'ROAS'],
    category: 'Advertising',
  },
  {
    id: 'meta',
    name: 'Meta (Facebook)',
    description: 'Connect Facebook & Instagram ad accounts for campaign analytics and audience insights.',
    icon: 'M',
    color: '#1877F2',
    bgColor: 'rgba(24,119,242,0.1)',
    borderColor: 'rgba(24,119,242,0.3)',
    authType: 'oauth',
    docsUrl: 'https://developers.facebook.com/docs/marketing-apis/',
    fields: [
      { key: 'apiKey', label: 'App ID', placeholder: '123456789012345', type: 'text', required: true },
      { key: 'apiSecret', label: 'App Secret', placeholder: 'abcdef1234567890', type: 'password', required: true },
      { key: 'accountId', label: 'Ad Account ID', placeholder: 'act_1234567890', type: 'text', required: false },
    ],
    capabilities: ['Ad Campaigns', 'Audience Insights', 'Pixel Data', 'Conversions'],
    category: 'Advertising',
  },
  {
    id: 'instagram',
    name: 'Instagram Business',
    description: 'Track engagement, followers growth, and content performance for your Instagram business profile.',
    icon: 'I',
    color: '#E4405F',
    bgColor: 'rgba(228,64,95,0.1)',
    borderColor: 'rgba(228,64,95,0.3)',
    authType: 'oauth',
    docsUrl: 'https://developers.facebook.com/docs/instagram-api/',
    fields: [
      { key: 'apiKey', label: 'Instagram Business ID', placeholder: '17841400xxxxx', type: 'text', required: true },
      { key: 'apiSecret', label: 'Access Token', placeholder: 'IGQVJX...', type: 'password', required: true },
    ],
    capabilities: ['Post Analytics', 'Stories Insights', 'Reels Data', 'Follower Demographics'],
    category: 'Social Media',
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics 4',
    description: 'Website traffic analysis, user behavior, conversion funnels, and real-time reporting.',
    icon: 'GA',
    color: '#F9AB00',
    bgColor: 'rgba(249,171,0,0.1)',
    borderColor: 'rgba(249,171,0,0.3)',
    authType: 'both',
    docsUrl: 'https://developers.google.com/analytics/devguides/reporting/data/v1',
    fields: [
      { key: 'apiKey', label: 'Measurement ID', placeholder: 'G-XXXXXXXXXX', type: 'text', required: true },
      { key: 'apiSecret', label: 'API Secret', placeholder: 'your-api-secret', type: 'password', required: true },
      { key: 'accountId', label: 'Property ID', placeholder: '123456789', type: 'text', required: false },
    ],
    capabilities: ['Traffic Analysis', 'User Behavior', 'Conversion Funnels', 'Real-time Data'],
    category: 'Analytics',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Channel analytics, video performance, subscriber growth, and revenue tracking.',
    icon: 'YT',
    color: '#FF0000',
    bgColor: 'rgba(255,0,0,0.08)',
    borderColor: 'rgba(255,0,0,0.25)',
    authType: 'oauth',
    docsUrl: 'https://developers.google.com/youtube/v3',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'AIzaSy...', type: 'text', required: true },
      { key: 'accountId', label: 'Channel ID', placeholder: 'UCxxxxxxxx', type: 'text', required: false },
    ],
    capabilities: ['Video Analytics', 'Subscriber Growth', 'Revenue', 'Audience Retention'],
    category: 'Social Media',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid Email',
    description: 'Email delivery analytics, campaign performance, and subscriber management.',
    icon: 'SG',
    color: '#1A82E2',
    bgColor: 'rgba(26,130,226,0.1)',
    borderColor: 'rgba(26,130,226,0.3)',
    authType: 'api_key',
    docsUrl: 'https://docs.sendgrid.com/api-reference/',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'SG.xxxxxxxx.xxxxxxxx', type: 'password', required: true },
    ],
    capabilities: ['Email Delivery', 'Open/Click Tracking', 'Bounce Analysis', 'List Management'],
    category: 'Email',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing campaigns, audience segments, and automation analytics.',
    icon: 'MC',
    color: '#FFE01B',
    bgColor: 'rgba(255,224,27,0.08)',
    borderColor: 'rgba(255,224,27,0.25)',
    authType: 'api_key',
    docsUrl: 'https://mailchimp.com/developer/marketing/api/',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'xxxxxxxxxxxxxxxx-us1', type: 'password', required: true },
      { key: 'accountId', label: 'Audience ID', placeholder: 'abc123def4', type: 'text', required: false },
    ],
    capabilities: ['Campaign Analytics', 'Audience Segments', 'Automation', 'E-commerce'],
    category: 'Email',
  },
  {
    id: 'semrush',
    name: 'SEMrush',
    description: 'SEO analysis, keyword research, competitor tracking, and backlink monitoring.',
    icon: 'SE',
    color: '#FF662F',
    bgColor: 'rgba(255,102,47,0.1)',
    borderColor: 'rgba(255,102,47,0.3)',
    authType: 'api_key',
    docsUrl: 'https://www.semrush.com/api-docs/',
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password', required: true },
    ],
    capabilities: ['Keyword Research', 'Site Audit', 'Backlink Analysis', 'Position Tracking'],
    category: 'SEO',
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'E-commerce analytics, order tracking, revenue data, and customer insights.',
    icon: 'SH',
    color: '#96BF48',
    bgColor: 'rgba(150,191,72,0.1)',
    borderColor: 'rgba(150,191,72,0.3)',
    authType: 'api_key',
    docsUrl: 'https://shopify.dev/docs/api/admin',
    fields: [
      { key: 'apiKey', label: 'Store Domain', placeholder: 'your-store.myshopify.com', type: 'text', required: true },
      { key: 'apiSecret', label: 'Access Token', placeholder: 'shpat_xxxxxxxxxxxxxxxx', type: 'password', required: true },
    ],
    capabilities: ['Order Analytics', 'Revenue Tracking', 'Customer Data', 'Product Performance'],
    category: 'E-Commerce',
  },
  {
    id: 'google_search_console',
    name: 'Google Search Console',
    description: 'Search performance, indexing status, sitemap monitoring, and Core Web Vitals.',
    icon: 'SC',
    color: '#34A853',
    bgColor: 'rgba(52,168,83,0.1)',
    borderColor: 'rgba(52,168,83,0.3)',
    authType: 'oauth',
    docsUrl: 'https://developers.google.com/webmaster-tools/search-console-api-original',
    fields: [
      { key: 'apiKey', label: 'Site URL', placeholder: 'https://www.laxree.com', type: 'text', required: true },
      { key: 'apiSecret', label: 'Verification Token', placeholder: 'your-verification-token', type: 'password', required: false },
    ],
    capabilities: ['Search Queries', 'Index Coverage', 'Page Experience', 'Sitemap Status'],
    category: 'SEO',
  },
];

interface StoredIntegration {
  id: string;
  platform: string;
  platformName: string;
  status: string;
  authType: string;
  accountId?: string;
  accountName?: string;
  lastSyncAt?: string;
  syncInterval: number;
  connectedAt?: string;
  error?: string;
  hasApiKey?: boolean;
  hasApiSecret?: boolean;
  hasAccessToken?: boolean;
}

function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<StoredIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectDialog, setConnectDialog] = useState<PlatformConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { ok: boolean; latency?: number; message?: string }>>({});
  const [syncing, setSyncing] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/integrations');
        const data = await res.json();
        if (!cancelled && data.success) setIntegrations(data.integrations);
      } catch { /* ignore */ }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [fetchKey]);

  const refresh = () => setFetchKey(k => k + 1);

  const getIntegration = (platformId: string) => integrations.find(i => i.platform === platformId);

  const getConnectedCount = () => integrations.filter(i => i.status === 'connected').length;

  const handleConnect = (platform: PlatformConfig) => {
    const existing = getIntegration(platform.id);
    if (existing) {
      setFormData({
        apiKey: '',
        apiSecret: '',
        accountId: existing.accountId || '',
      });
    } else {
      setFormData({});
    }
    setShowSecrets({});
    setTestResult(prev => ({ ...prev, [platform.id]: undefined }));
    setConnectDialog(platform);
  };

  const handleSave = async () => {
    if (!connectDialog) return;
    setSaving(true);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: connectDialog.id,
          platformName: connectDialog.name,
          authType: connectDialog.authType === 'oauth' ? 'oauth' : 'api_key',
          ...formData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConnectDialog(null);
        refresh();
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      await fetch(`/api/integrations?platform=${platformId}`, { method: 'DELETE' });
      refresh();
    } catch { /* ignore */ }
  };

  const handleTest = async (platformId: string) => {
    setTesting(platformId);
    try {
      const res = await fetch('/api/integrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformId, action: 'test' }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(prev => ({ ...prev, [platformId]: { ok: true, latency: data.testResult.latency, message: data.testResult.message } }));
        refresh();
      } else {
        setTestResult(prev => ({ ...prev, [platformId]: { ok: false, message: data.error || 'Test failed' } }));
      }
    } catch {
      setTestResult(prev => ({ ...prev, [platformId]: { ok: false, message: 'Network error' } }));
    }
    setTesting(null);
  };

  const handleSync = async (platformId: string) => {
    setSyncing(platformId);
    try {
      await fetch('/api/integrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platformId, action: 'sync' }),
      });
      refresh();
    } catch { /* ignore */ }
    setSyncing(null);
  };

  const categories = ['all', ...Array.from(new Set(PLATFORMS.map(p => p.category)))];
  const filteredPlatforms = filter === 'all' ? PLATFORMS : PLATFORMS.filter(p => p.category === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4A843]/15">
              <Plug className="h-5 w-5 text-[#D4A843]" />
            </div>
            Account Integrations
          </h2>
          <p className="text-muted-foreground text-sm mt-1.5">
            Connect your real marketing accounts for live data sync and advanced analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4A843]/10 border border-[#D4A843]/20">
            <div className="h-2 w-2 rounded-full bg-[#D4A843] animate-pulse" />
            <span className="text-sm font-semibold text-[#D4A843]">{getConnectedCount()}</span>
            <span className="text-xs text-muted-foreground">/ {PLATFORMS.length} Connected</span>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      <AnimatePresence>
        {getConnectedCount() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#D4A843]/10 via-[#D4A843]/5 to-transparent border border-[#D4A843]/20"
          >
            <CheckCircle2 className="h-5 w-5 text-[#D4A843] shrink-0" />
            <p className="text-sm text-foreground/90">
              <span className="font-semibold text-[#D4A843]">{getConnectedCount()} account{getConnectedCount() > 1 ? 's' : ''}</span> connected
              — Live data is being pulled from your connected platforms. Data refreshes automatically.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How It Works */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#D4A843]" />
            How Real Account Linking Works
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '1', title: 'Choose Platform', desc: 'Select the marketing platform you want to connect', icon: Globe },
              { step: '2', title: 'Enter Credentials', desc: 'Add API key or authorize via OAuth', icon: Key },
              { step: '3', title: 'Test Connection', desc: 'Verify credentials and check data access', icon: Shield },
              { step: '4', title: 'Live Data', desc: 'Dashboard auto-syncs data from all accounts', icon: RefreshCw },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D4A843]/10 text-[#D4A843] text-sm font-bold">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              filter === cat
                ? 'bg-[#D4A843]/15 text-[#D4A843] border border-[#D4A843]/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
            }`}
          >
            {cat === 'all' ? 'All Platforms' : cat}
          </button>
        ))}
      </div>

      {/* Platform Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-card/50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPlatforms.map((platform, idx) => {
            const integration = getIntegration(platform.id);
            const isConnected = integration?.status === 'connected';
            const isTesting = testing === platform.id;
            const isSyncing = syncing === platform.id;
            const test = testResult[platform.id];

            return (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <Card className={`relative overflow-hidden border transition-all duration-300 hover:shadow-lg group ${
                  isConnected
                    ? 'border-[#D4A843]/30 bg-card/80'
                    : 'border-border/50 bg-card/30 hover:border-border'
                }`}>
                  {/* Top color bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 opacity-60"
                    style={{ background: `linear-gradient(90deg, ${platform.color}, transparent)` }}
                  />

                  <CardContent className="p-5">
                    {/* Platform Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-xl text-xs font-bold text-white shrink-0 shadow-md"
                          style={{ background: platform.color }}
                        >
                          {platform.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground text-sm">{platform.name}</h3>
                            {isConnected && (
                              <Badge className="h-5 px-1.5 text-[9px] bg-green-500/15 text-green-400 border-green-500/20 hover:bg-green-500/20">
                                <CheckCircle2 className="h-3 w-3 mr-0.5" /> Live
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{platform.category}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-border/50 text-muted-foreground">
                        {platform.authType === 'oauth' ? 'OAuth' : platform.authType === 'both' ? 'OAuth / Key' : 'API Key'}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                      {platform.description}
                    </p>

                    {/* Capabilities */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {platform.capabilities.map(cap => (
                        <span key={cap} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 text-muted-foreground/80">
                          {cap}
                        </span>
                      ))}
                    </div>

                    {/* Connected Account Info */}
                    {isConnected && integration && (
                      <div className="mb-4 p-3 rounded-lg bg-[#D4A843]/5 border border-[#D4A843]/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs font-medium text-foreground">
                              {integration.accountName || `${platform.name} Account`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(integration.lastSyncAt)}
                          </div>
                        </div>
                        {test && (
                          <AnimatePresence>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className={`mt-2 text-[10px] flex items-center gap-1.5 ${test.ok ? 'text-green-400' : 'text-red-400'}`}
                            >
                              {test.ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {test.ok ? `Connected (${test.latency}ms)` : test.message}
                            </motion.div>
                          </AnimatePresence>
                        )}
                      </div>
                    )}

                    <Separator className="mb-4 opacity-50" />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs border-border/50 hover:bg-white/5"
                            onClick={() => handleTest(platform.id)}
                            disabled={isTesting}
                          >
                            {isTesting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            ) : (
                              <Shield className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs border-[#D4A843]/30 text-[#D4A843] hover:bg-[#D4A843]/10"
                            onClick={() => handleSync(platform.id)}
                            disabled={isSyncing}
                          >
                            {isSyncing ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            Sync Now
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                            onClick={() => handleDisconnect(platform.id)}
                          >
                            <Unplug className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs gold-gradient text-primary-foreground hover:opacity-90 shadow-md shadow-[#D4A843]/15"
                            onClick={() => handleConnect(platform)}
                          >
                            <Link2 className="h-3.5 w-3.5 mr-1.5" />
                            Connect Account
                          </Button>
                          <a
                            href={platform.docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 w-8 flex items-center justify-center rounded-md border border-border/50 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Security Notice */}
      <Card className="border-border/30 bg-card/30 overflow-hidden">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-[#D4A843] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Secure Credential Storage</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              All API keys and OAuth tokens are encrypted and stored securely in your database. Credentials are never exposed to the client.
              In production, we recommend using a secrets manager (AWS Secrets Manager, HashiCorp Vault) for additional security.
              Data is transmitted over HTTPS and refresh tokens are used for long-lived OAuth connections.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Connect Dialog */}
      <Dialog open={!!connectDialog} onOpenChange={(open) => { if (!open) setConnectDialog(null); }}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 bg-[#111] border-[#D4A843]/15 shadow-2xl shadow-black/60 rounded-xl overflow-hidden">
          {connectDialog && (
            <>
              {/* Dialog Header with color bar */}
              <div className="relative">
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${connectDialog.color}, ${connectDialog.color}44, transparent)` }} />
                <div className="p-6 pb-4">
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white shadow-md"
                        style={{ background: connectDialog.color }}
                      >
                        {connectDialog.icon}
                      </div>
                      <div>
                        <DialogTitle className="text-lg font-bold text-foreground">
                          Connect {connectDialog.name}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                          {connectDialog.authType === 'oauth'
                            ? 'Enter your OAuth credentials to authorize access'
                            : connectDialog.authType === 'both'
                            ? 'Use OAuth or API key authentication'
                            : 'Enter your API credentials to establish connection'}
                        </DialogDescription>
                      </div>
                    </div>
                  </DialogHeader>
                </div>
              </div>

              <div className="px-6 pb-2">
                <Separator className="opacity-30" />
              </div>

              <div className="p-6 pt-4 space-y-4 max-h-[400px] overflow-y-auto">
                {/* OAuth notice for OAuth platforms */}
                {connectDialog.authType === 'oauth' && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-500/10 border border-blue-500/15">
                    <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-300">OAuth 2.0 Required</p>
                      <p className="text-[11px] text-blue-400/70 mt-0.5">
                        This platform uses OAuth for secure authorization. You&apos;ll need to create an app in the
                        platform&apos;s developer console and obtain the credentials below.
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Fields */}
                {connectDialog.fields.map(field => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                      {field.label}
                      {field.required && <span className="text-red-400">*</span>}
                    </label>
                    <div className="relative">
                      <Input
                        type={showSecrets[field.key] ? 'text' : field.type}
                        placeholder={field.placeholder}
                        value={formData[field.key] || ''}
                        onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="h-9 text-sm bg-white/5 border-border/50 focus:border-[#D4A843]/50 focus:ring-[#D4A843]/20 pr-10"
                      />
                      {field.type === 'password' && (
                        <button
                          type="button"
                          onClick={() => setShowSecrets(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showSecrets[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Account name (optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/80">Account Label <span className="text-muted-foreground">(optional)</span></label>
                  <Input
                    type="text"
                    placeholder={`e.g., "Laxree ${connectDialog.name}"`}
                    value={formData.accountName || ''}
                    onChange={e => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                    className="h-9 text-sm bg-white/5 border-border/50 focus:border-[#D4A843]/50 focus:ring-[#D4A843]/20"
                  />
                </div>

                {/* Sync Interval */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground/80">Sync Interval</label>
                  <div className="flex gap-2">
                    {[
                      { label: '15 min', value: 900 },
                      { label: '1 hour', value: 3600 },
                      { label: '6 hours', value: 21600 },
                      { label: '24 hours', value: 86400 },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, syncInterval: String(opt.value) }))}
                        className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                          (formData.syncInterval || '3600') === String(opt.value)
                            ? 'bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/30'
                            : 'bg-white/3 text-muted-foreground border-border/30 hover:border-border/50 hover:text-foreground'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 pt-2 border-t border-border/30 bg-black/20">
                <div className="flex items-center justify-between">
                  <a
                    href={connectDialog.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#D4A843] transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View API Documentation
                    <ChevronRight className="h-3 w-3" />
                  </a>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setConnectDialog(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 text-xs gold-gradient text-primary-foreground hover:opacity-90 shadow-md shadow-[#D4A843]/15 min-w-[100px]"
                      onClick={handleSave}
                      disabled={saving || connectDialog.fields.some(f => f.required && !formData[f.key])}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}