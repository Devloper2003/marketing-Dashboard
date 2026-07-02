'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  Users,
  Mail,
  Crown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Power,
  PowerOff,
  Send,
  XCircle,
  RefreshCw,
  ChevronDown,
  Check,
  Loader2,
  Eye,
  UserPlus,
  TrendingUp,
  DollarSign,
  Clock,
  Shield,
  Copy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Types ──────────────────────────────────────────────────── */
interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenant: { id: string; slug: string; primaryColor: string };
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  primaryColor: string;
  secondaryColor: string | null;
  bgAccent: string | null;
  isActive: boolean;
  plan: string;
  maxUsers: number;
  userCount: number;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  designation: string | null;
  tenantName: string;
  tenantSlug: string;
  expiresAt: string;
  createdAt: string;
}

interface DashboardStats {
  totalBrands: number;
  totalUsers: number;
  activeBrands: number;
  inactiveBrands: number;
}

/* ─── Helpers ────────────────────────────────────────────────── */
function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const s = sessionStorage.getItem('dashboard_session');
    if (!s) return null;
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  pro: 'bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/20',
  enterprise: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
};

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-[#D4A843]/15 text-[#D4A843]',
  admin: 'bg-blue-500/15 text-blue-400',
  manager: 'bg-emerald-500/15 text-emerald-400',
  analyst: 'bg-orange-500/15 text-orange-400',
  viewer: 'bg-gray-500/15 text-gray-400',
  staff: 'bg-gray-500/15 text-gray-400',
};

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  analyst: 'Analyst',
  viewer: 'Viewer',
  staff: 'Staff',
};

/* ─── Animation variants ─────────────────────────────────────── */
const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
};

/* ─── Stat Card ──────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  sub?: string;
}) {
  return (
    <motion.div {...fadeIn}>
      <Card className="gold-card border-border/50 overflow-hidden relative">
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-bold text-foreground mt-1.5">{value}</p>
              {sub && <p className="text-[11px] text-muted-foreground/60 mt-1">{sub}</p>}
            </div>
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ background: `${color}15` }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function BrandManagementTab() {
  const [session] = useState<SessionUser | null>(() => getSession());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // Form states
  const [form, setForm] = useState({
    name: '',
    slug: '',
    primaryColor: '#D4A843',
    logo: '',
    ownerEmail: '',
    ownerName: '',
    ownerPassword: '',
    plan: 'pro',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    primaryColor: '',
    logo: '',
  });
  const [inviteForm, setInviteForm] = useState({
    brandId: '',
    email: '',
    role: 'staff',
    designation: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* ── Data fetching ─────────────────────────────────────────── */
  const fetchAll = useCallback(async () => {
    if (!session?.id) return;
    setLoading(true);
    try {
      const [dashRes, brandsRes] = await Promise.all([
        fetch(`/api/tenant/admin/dashboard?userId=${session.id}`),
        fetch(`/api/tenant/brands?userId=${session.id}`),
      ]);

      const dashData = dashRes.ok ? await dashRes.json() : null;
      const brandsData = brandsRes.ok ? await brandsRes.json() : null;

      if (dashData?.success) {
        setStats(dashData.stats);
        setInvitations(dashData.recentInvitations || []);
      }
      if (brandsData?.success) {
        setBrands(brandsData.brands || []);
      }
    } catch (err) {
      console.error('Failed to fetch brand data:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* ── Create Brand ──────────────────────────────────────────── */
  const handleCreate = async () => {
    setError('');
    if (!form.name || !form.slug || !form.ownerEmail || !form.ownerName || !form.ownerPassword) {
      setError('All fields are required');
      return;
    }
    setActionLoading('create');
    try {
      const res = await fetch('/api/tenant/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': session?.id || '' },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          primaryColor: form.primaryColor,
          logo: form.logo || null,
          email: form.ownerEmail,
          userName: form.ownerName,
          password: form.ownerPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create brand');
      setCreateOpen(false);
      setForm({ name: '', slug: '', primaryColor: '#D4A843', logo: '', ownerEmail: '', ownerName: '', ownerPassword: '', plan: 'pro' });
      setSuccess('Brand created successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create brand');
    } finally {
      setActionLoading('');
    }
  };

  /* ── Edit Brand ────────────────────────────────────────────── */
  const openEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setEditForm({ name: brand.name, primaryColor: brand.primaryColor, logo: brand.logo || '' });
    setEditOpen(true);
    setError('');
  };

  const handleEdit = async () => {
    setError('');
    if (!selectedBrand || !editForm.name) {
      setError('Name is required');
      return;
    }
    setActionLoading('edit');
    try {
      const res = await fetch(`/api/tenant/brands/${selectedBrand.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': session?.id || '' },
        body: JSON.stringify({
          name: editForm.name,
          primaryColor: editForm.primaryColor || undefined,
          logo: editForm.logo || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update brand');
      setEditOpen(false);
      setSuccess('Brand updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update brand');
    } finally {
      setActionLoading('');
    }
  };

  /* ── Toggle Active ─────────────────────────────────────────── */
  const handleToggleActive = async (brand: Brand) => {
    setActionLoading(`toggle-${brand.id}`);
    try {
      const res = await fetch(`/api/tenant/brands/${brand.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': session?.id || '' },
        body: JSON.stringify({ isActive: !brand.isActive }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to toggle brand status');
      }
      fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle brand');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading('');
    }
  };

  /* ── Delete Brand ──────────────────────────────────────────── */
  const openDelete = (brand: Brand) => {
    setSelectedBrand(brand);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedBrand) return;
    setActionLoading('delete');
    try {
      const res = await fetch(`/api/tenant/brands/${selectedBrand.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-user-id': session?.id || '' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete brand');
      setDeleteOpen(false);
      setSuccess('Brand deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete brand');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading('');
    }
  };

  /* ── Invite Staff ──────────────────────────────────────────── */
  const handleInvite = async () => {
    setError('');
    if (!inviteForm.brandId || !inviteForm.email) {
      setError('Brand and email are required');
      return;
    }
    setActionLoading('invite');
    try {
      const res = await fetch(`/api/tenant/brands/${inviteForm.brandId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': session?.id || '' },
        body: JSON.stringify({
          email: inviteForm.email,
          role: inviteForm.role,
          designation: inviteForm.designation || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invitation');
      setInviteOpen(false);
      setInviteForm({ brandId: '', email: '', role: 'staff', designation: '' });
      setSuccess('Invitation sent successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setActionLoading('');
    }
  };

  /* ── Auto-slug from name ───────────────────────────────────── */
  const handleNameChange = (name: string) => {
    setForm((prev) => ({ ...prev, name, slug: slugify(name) }));
  };

  /* ── Loading State ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-[#D4A843] animate-pulse" />
          </div>
          <div>
            <div className="h-5 w-40 bg-[#1a1a1a] rounded animate-pulse" />
            <div className="h-3 w-56 bg-[#1a1a1a] rounded animate-pulse mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-[#1a1a1a] animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-[#1a1a1a] animate-pulse" />
      </div>
    );
  }

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div {...fadeIn} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#D4A843]/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-[#D4A843]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Brand Management</h2>
            <p className="text-xs text-muted-foreground/60">Create and manage brands on the Laxree platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-border/50 text-muted-foreground hover:text-[#D4A843] hover:border-[#D4A843]/30 gap-2"
            onClick={() => { setInviteForm({ brandId: '', email: '', role: 'staff', designation: '' }); setInviteOpen(true); setError(''); }}
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Invite Staff</span>
          </Button>
          <Button
            size="sm"
            className="gap-2 gold-gradient text-[#0a0a0a] font-semibold border-0"
            onClick={() => { setForm({ name: '', slug: '', primaryColor: '#D4A843', logo: '', ownerEmail: '', ownerName: '', ownerPassword: '', plan: 'pro' }); setCreateOpen(true); setError(''); }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Brand</span>
          </Button>
        </div>
      </motion.div>

      {/* Success / Error Toast */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 text-sm text-emerald-400 flex items-center gap-2"
          >
            <Check className="h-4 w-4 shrink-0" />
            {success}
          </motion.div>
        )}
        {error && !createOpen && !editOpen && !inviteOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 flex items-center gap-2"
          >
            <XCircle className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Brands"
          value={stats?.totalBrands ?? 0}
          icon={Building2}
          color="#D4A843"
          sub={`${stats?.activeBrands ?? 0} active`}
        />
        <StatCard
          label="Active Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          color="#22c55e"
          sub="Across all brands"
        />
        <StatCard
          label="Pending Invites"
          value={invitations.length}
          icon={Mail}
          color="#f59e0b"
          sub="Awaiting acceptance"
        />
        <StatCard
          label="MRR Revenue"
          value="$4,850"
          icon={DollarSign}
          color="#8b5cf6"
          sub="+12.5% from last month"
        />
      </div>

      {/* Brand List Table */}
      <motion.div {...fadeIn}>
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">All Brands</CardTitle>
                <Badge variant="outline" className="text-[10px] bg-[#D4A843]/10 text-[#D4A843] border-[#D4A843]/20">
                  {brands.length}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-[#D4A843]"
                onClick={fetchAll}
                disabled={loading}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-5 py-3">Brand</th>
                    <th className="text-left text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Slug</th>
                    <th className="text-left text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Plan</th>
                    <th className="text-left text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Users</th>
                    <th className="text-left text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-5 py-3 hidden xl:table-cell">Created</th>
                    <th className="text-left text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-right text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <Building2 className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground/60">No brands created yet</p>
                        <Button
                          size="sm"
                          className="mt-4 gap-2 gold-gradient text-[#0a0a0a] font-semibold border-0"
                          onClick={() => { setForm({ name: '', slug: '', primaryColor: '#D4A843', logo: '', ownerEmail: '', ownerName: '', ownerPassword: '', plan: 'pro' }); setCreateOpen(true); setError(''); }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Create your first brand
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    brands.map((brand, idx) => (
                      <motion.tr
                        key={brand.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.03 }}
                        className="border-b border-border/20 last:border-0 hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-[#0a0a0a] font-bold text-xs"
                              style={{
                                background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.primaryColor}99)`,
                              }}
                            >
                              {brand.logo ? (
                                <img
                                  src={brand.logo}
                                  alt={brand.name}
                                  className="h-5 w-5 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : (
                                <span className="hidden">{brand.name[0]}</span>
                              )}
                              {!brand.logo && <span>{brand.name[0]}</span>}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{brand.name}</p>
                              <p className="text-[11px] text-muted-foreground/50 md:hidden">{brand.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <code className="text-xs text-muted-foreground/60 bg-[#1a1a1a] px-2 py-0.5 rounded">{brand.slug}</code>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${PLAN_COLORS[brand.plan] || PLAN_COLORS.free}`}>
                            {brand.plan}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {brand.userCount}/{brand.maxUsers}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden xl:table-cell">
                          <span className="text-xs text-muted-foreground/60">{formatDate(brand.createdAt)}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              brand.isActive
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-red-500/15 text-red-400'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${brand.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            {brand.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(brand)}
                              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-[#D4A843] hover:bg-[#D4A843]/10 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(brand)}
                              disabled={actionLoading === `toggle-${brand.id}`}
                              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors disabled:opacity-50"
                              title={brand.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {actionLoading === `toggle-${brand.id}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : brand.isActive ? (
                                <PowerOff className="h-3.5 w-3.5" />
                              ) : (
                                <Power className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => openDelete(brand)}
                              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Invitations */}
      <motion.div {...fadeIn}>
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">Recent Invitations</CardTitle>
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                  {invitations.length} pending
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {invitations.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Mail className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground/60">No pending invitations</p>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {invitations.map((inv) => {
                  const isExpired = new Date(inv.expiresAt) < new Date();
                  return (
                    <div key={inv.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-[#D4A843]/10 flex items-center justify-center shrink-0">
                          <Mail className="h-3.5 w-3.5 text-[#D4A843]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-foreground truncate">{inv.email}</p>
                          <p className="text-[11px] text-muted-foreground/60">
                            {inv.tenantName} · <span className={ROLE_COLORS[inv.role] ? '' : ''}>{ROLE_LABELS[inv.role] || inv.role}</span>
                            {inv.designation && ` · ${inv.designation}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isExpired
                              ? 'bg-red-500/15 text-red-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}
                        >
                          <Clock className="h-2.5 w-2.5" />
                          {isExpired ? 'Expired' : `Expires ${formatDate(inv.expiresAt)}`}
                        </span>
                        <button className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-[#D4A843] hover:bg-[#D4A843]/10 transition-colors">
                          <Send className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ CREATE BRAND DIALOG ═══ */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) setError(''); }}>
        <DialogContent className="sm:max-w-lg bg-[#111] border-border/50 p-0 gap-0 max-h-[90vh] overflow-y-auto">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A843]/50 to-transparent" />
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg gold-gradient flex items-center justify-center">
                  <Plus className="h-4 w-4 text-[#0a0a0a]" />
                </div>
                Create New Brand
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set up a new brand on the Laxree platform. The owner will receive full access.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs text-muted-foreground font-medium">Brand Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="h-9 bg-[#0a0a0a] border-border/50 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Slug *</label>
                <code className="block text-[11px] text-muted-foreground/50 mb-1">{form.slug || 'auto-generated'}</code>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="brand-slug"
                  className="h-9 bg-[#0a0a0a] border-border/50 text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                    className="h-9 w-12 rounded-lg border border-border/50 bg-transparent cursor-pointer"
                  />
                  <Input
                    value={form.primaryColor}
                    onChange={(e) => setForm((p) => ({ ...p, primaryColor: e.target.value }))}
                    placeholder="#D4A843"
                    className="h-9 bg-[#0a0a0a] border-border/50 text-sm font-mono flex-1"
                  />
                </div>
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs text-muted-foreground font-medium">Logo URL</label>
                <Input
                  value={form.logo}
                  onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))}
                  placeholder="https://example.com/logo.svg"
                  className="h-9 bg-[#0a0a0a] border-border/50 text-sm"
                />
              </div>
            </div>

            <Separator className="bg-border/30" />

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-3 w-3" /> Owner Account
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Owner Name *</label>
                <Input
                  value={form.ownerName}
                  onChange={(e) => setForm((p) => ({ ...p, ownerName: e.target.value }))}
                  placeholder="John Doe"
                  className="h-9 bg-[#0a0a0a] border-border/50 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Owner Email *</label>
                <Input
                  type="email"
                  value={form.ownerEmail}
                  onChange={(e) => setForm((p) => ({ ...p, ownerEmail: e.target.value }))}
                  placeholder="owner@brand.com"
                  className="h-9 bg-[#0a0a0a] border-border/50 text-sm"
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs text-muted-foreground font-medium">Owner Password *</label>
                <Input
                  type="password"
                  value={form.ownerPassword}
                  onChange={(e) => setForm((p) => ({ ...p, ownerPassword: e.target.value }))}
                  placeholder="Minimum 8 characters"
                  className="h-9 bg-[#0a0a0a] border-border/50 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Plan</label>
                <Select value={form.plan} onValueChange={(v) => setForm((p) => ({ ...p, plan: v }))}>
                  <SelectTrigger className="h-9 bg-[#0a0a0a] border-border/50 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-border">
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 p-6 pt-0">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gap-2 gold-gradient text-[#0a0a0a] font-semibold border-0"
              onClick={handleCreate}
              disabled={actionLoading === 'create'}
            >
              {actionLoading === 'create' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Brand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ EDIT BRAND DIALOG ═══ */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setError(''); }}>
        <DialogContent className="sm:max-w-md bg-[#111] border-border/50 p-0 gap-0">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A843]/50 to-transparent" />
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Pencil className="h-4 w-4 text-blue-400" />
                </div>
                Edit Brand
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update {selectedBrand?.name} settings
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">{error}</div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Brand Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                className="h-9 bg-[#0a0a0a] border-border/50 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editForm.primaryColor}
                  onChange={(e) => setEditForm((p) => ({ ...p, primaryColor: e.target.value }))}
                  className="h-9 w-12 rounded-lg border border-border/50 bg-transparent cursor-pointer"
                />
                <Input
                  value={editForm.primaryColor}
                  onChange={(e) => setEditForm((p) => ({ ...p, primaryColor: e.target.value }))}
                  className="h-9 bg-[#0a0a0a] border-border/50 text-sm font-mono flex-1"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Logo URL</label>
              <Input
                value={editForm.logo}
                onChange={(e) => setEditForm((p) => ({ ...p, logo: e.target.value }))}
                className="h-9 bg-[#0a0a0a] border-border/50 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 p-6 pt-0">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold border-0"
              onClick={handleEdit}
              disabled={actionLoading === 'edit'}
            >
              {actionLoading === 'edit' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ INVITE STAFF DIALOG ═══ */}
      <Dialog open={inviteOpen} onOpenChange={(open) => { setInviteOpen(open); if (!open) setError(''); }}>
        <DialogContent className="sm:max-w-md bg-[#111] border-border/50 p-0 gap-0">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A843]/50 to-transparent" />
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-emerald-400" />
                </div>
                Invite Staff Member
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Send an invitation to join a brand team
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">{error}</div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Brand *</label>
              <Select
                value={inviteForm.brandId}
                onValueChange={(v) => setInviteForm((p) => ({ ...p, brandId: v }))}
              >
                <SelectTrigger className="h-9 bg-[#0a0a0a] border-border/50 text-sm">
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent className="bg-[#111] border-border">
                  {brands.filter((b) => b.isActive).map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded"
                          style={{ background: b.primaryColor }}
                        />
                        {b.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Email *</label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="staff@brand.com"
                className="h-9 bg-[#0a0a0a] border-border/50 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Role</label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(v) => setInviteForm((p) => ({ ...p, role: v }))}
                >
                  <SelectTrigger className="h-9 bg-[#0a0a0a] border-border/50 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-border">
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Designation</label>
                <Input
                  value={inviteForm.designation}
                  onChange={(e) => setInviteForm((p) => ({ ...p, designation: e.target.value }))}
                  placeholder="Marketing Manager"
                  className="h-9 bg-[#0a0a0a] border-border/50 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 p-6 pt-0">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold border-0"
              onClick={handleInvite}
              disabled={actionLoading === 'invite'}
            >
              {actionLoading === 'invite' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE CONFIRMATION DIALOG ═══ */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm bg-[#111] border-border/50 p-0 gap-0">
          <div className="p-6">
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-base">Delete Brand</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-2">
                Are you sure you want to delete <strong className="text-foreground">{selectedBrand?.name}</strong>?
                This will permanently remove the brand and all its data. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex items-center justify-end gap-2 p-6 pt-0">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold border-0"
              onClick={handleDelete}
              disabled={actionLoading === 'delete'}
            >
              {actionLoading === 'delete' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Brand
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}