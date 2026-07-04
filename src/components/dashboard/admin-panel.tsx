'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Building2,
  Users,
  Plus,
  Search,
  ChevronRight,
  ArrowLeft,
  Mail,
  UserPlus,
  Edit3,
  Trash2,
  Ban,
  Link2,
  Copy,
  Check,
  Loader2,
  Palette,
  Save,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ── Types ───────────────────────────────────────────────────────────
interface SessionUser {
  id?: string;
  email: string;
  name: string;
  role: string;
  designation?: string;
  avatar?: string;
}

interface SessionTenant {
  id?: string;
  name?: string;
  slug?: string;
  logo?: string;
  primaryColor?: string;
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
  users?: BrandUser[];
}

interface BrandUser {
  id: string;
  email: string;
  name: string;
  role: string;
  designation: string | null;
  avatar: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  isActive?: boolean;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  designation: string | null;
  token: string;
  expiresAt: string;
  createdAt: string;
  tenantName?: string;
  tenantSlug?: string;
}

interface AdminStats {
  totalBrands: number;
  totalUsers: number;
  activeBrands: number;
  inactiveBrands: number;
}

// ── Helpers ─────────────────────────────────────────────────────────
function getSession(): { user: SessionUser; tenant: SessionTenant } | null {
  if (typeof window === 'undefined') return null;
  try {
    // Try dashboard_session first (new format), then growthive_session (legacy)
    const raw = sessionStorage.getItem('dashboard_session') || sessionStorage.getItem('growthive_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // The session may store user/tenant nested or flat
    if (parsed?.user) {
      return { user: parsed.user, tenant: parsed.tenant || {} };
    }
    // Flat structure: { email, name, role, designation, avatar, tenant: { id, name, ... } }
    return {
      user: {
        email: parsed.email || '',
        name: parsed.name || '',
        role: parsed.role || '',
        designation: parsed.designation || undefined,
        avatar: parsed.avatar || undefined,
      },
      tenant: parsed.tenant
        ? { id: parsed.tenant.id, name: parsed.tenant.name, slug: parsed.tenant.slug, logo: parsed.tenant.logo, primaryColor: parsed.tenant.primaryColor }
        : {},
    };
  } catch {
    return null;
  }
}

function isAdminRole(role: string): boolean {
  return ['platform_admin', 'owner', 'admin'].includes(role);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function roleBadgeVariant(role: string) {
  switch (role) {
    case 'platform_admin':
      return 'bg-purple-500/15 text-purple-400 border-purple-500/20';
    case 'owner':
      return 'bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/20';
    case 'admin':
      return 'bg-blue-500/15 text-blue-400 border-blue-500/20';
    case 'manager':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    default:
      return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20';
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const ROLE_OPTIONS = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
];

const PLAN_COLORS: Record<string, string> = {
  enterprise: 'bg-purple-500/15 text-purple-400',
  pro: 'bg-[#D4A843]/15 text-[#D4A843]',
  starter: 'bg-emerald-500/15 text-emerald-400',
  free: 'bg-zinc-500/15 text-zinc-400',
};

// ── Stat Card ───────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <Card className="bg-[#111] border-[#D4A843]/10 hover:border-[#D4A843]/25 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4A843]/10">
              <Icon className="h-5 w-5 text-[#D4A843]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
              {sub && <p className="text-[10px] text-muted-foreground/60">{sub}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Platform Admin View ─────────────────────────────────────────────
function PlatformAdminView({ userId }: { userId: string }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brandDetail, setBrandDetail] = useState<Brand | null>(null);
  const [brandLoading, setBrandLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentInvitations, setRecentInvitations] = useState<Invitation[]>([]);

  // Dialog states
  const [addBrandOpen, setAddBrandOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editBrandingOpen, setEditBrandingOpen] = useState(false);

  // Form states
  const [addBrandForm, setAddBrandForm] = useState({
    name: '', slug: '', primaryColor: '#D4A843', logo: '',
    ownerName: '', ownerEmail: '', ownerPassword: '',
  });
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'staff', designation: '' });
  const [addUserForm, setAddUserForm] = useState({ name: '', email: '', password: '', role: 'staff', designation: '' });
  const [editUserForm, setEditUserForm] = useState({ role: '', designation: '', userId: '', name: '' });
  const [editBrandingForm, setEditBrandingForm] = useState({ name: '', primaryColor: '#D4A843', logo: '' });
  const [submitting, setSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tenant/brands?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setBrands(data.brands || []);
      } else {
        setError(data.error || 'Failed to load brands');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/tenant/admin/dashboard?userId=${userId}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentInvitations(data.recentInvitations || []);
      }
    } catch {
      // Silent fail for stats
    }
  }, [userId]);

  const fetchBrandDetail = useCallback(async (brandId: string) => {
    setBrandLoading(true);
    try {
      const res = await fetch(`/api/tenant/brands/${brandId}`);
      const data = await res.json();
      if (data.success) {
        setBrandDetail(data.brand);
        setSelectedBrand(data.brand);
      }
    } catch {
      // silent
    } finally {
      setBrandLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
    fetchStats();
  }, [fetchBrands, fetchStats]);

  // Filter brands
  const filteredBrands = useMemo(() => {
    if (!search) return brands;
    const q = search.toLowerCase();
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        b.plan.toLowerCase().includes(q)
    );
  }, [brands, search]);

  // ── Handlers ──
  const handleAddBrand = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/tenant/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(addBrandForm),
      });
      const data = await res.json();
      if (data.success) {
        setAddBrandOpen(false);
        setAddBrandForm({ name: '', slug: '', primaryColor: '#D4A843', logo: '', ownerName: '', ownerEmail: '', ownerPassword: '' });
        fetchBrands();
        fetchStats();
      } else {
        alert(data.error || 'Failed to create brand');
      }
    } catch {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedBrand) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tenant/brands/${selectedBrand.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(inviteForm),
      });
      const data = await res.json();
      if (data.success) {
        const link = `${window.location.origin}/invite/${data.invitation.token}`;
        setInviteLink(link);
        fetchBrandDetail(selectedBrand.id);
      } else {
        alert(data.error || 'Failed to send invitation');
      }
    } catch {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddUser = async () => {
    if (!selectedBrand) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tenant/brands/${selectedBrand.id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(addUserForm),
      });
      const data = await res.json();
      if (data.success) {
        setAddUserOpen(false);
        setAddUserForm({ name: '', email: '', password: '', role: 'staff', designation: '' });
        fetchBrandDetail(selectedBrand.id);
        fetchStats();
      } else {
        alert(data.error || 'Failed to add user');
      }
    } catch {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedBrand || !editUserForm.userId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tenant/brands/${selectedBrand.id}/users/${editUserForm.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ role: editUserForm.role, designation: editUserForm.designation }),
      });
      const data = await res.json();
      if (data.success) {
        setEditUserOpen(false);
        fetchBrandDetail(selectedBrand.id);
      } else {
        alert(data.error || 'Failed to update user');
      }
    } catch {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateUser = async (targetUserId: string) => {
    if (!selectedBrand) return;
    try {
      const res = await fetch(`/api/tenant/brands/${selectedBrand.id}/users/${targetUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ isActive: false }),
      });
      const data = await res.json();
      if (data.success) {
        fetchBrandDetail(selectedBrand.id);
        fetchStats();
      } else {
        alert(data.error || 'Failed to deactivate user');
      }
    } catch {
      alert('Network error');
    }
  };

  const handleRemoveUser = async (targetUserId: string) => {
    if (!selectedBrand) return;
    if (!confirm('Remove this user from the brand? They can be re-invited later.')) return;
    try {
      const res = await fetch(`/api/tenant/brands/${selectedBrand.id}/users/${targetUserId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId },
      });
      const data = await res.json();
      if (data.success) {
        fetchBrandDetail(selectedBrand.id);
        fetchStats();
      } else {
        alert(data.error || 'Failed to remove user');
      }
    } catch {
      alert('Network error');
    }
  };

  const handleEditBranding = async () => {
    if (!selectedBrand) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tenant/brands/${selectedBrand.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(editBrandingForm),
      });
      const data = await res.json();
      if (data.success) {
        setEditBrandingOpen(false);
        fetchBrandDetail(selectedBrand.id);
        fetchBrands();
      } else {
        alert(data.error || 'Failed to update branding');
      }
    } catch {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditUser = (user: BrandUser) => {
    setEditUserForm({ role: user.role, designation: user.designation || '', userId: user.id, name: user.name });
    setEditUserOpen(true);
  };

  const openEditBranding = (brand: Brand) => {
    setEditBrandingForm({ name: brand.name, primaryColor: brand.primaryColor || '#D4A843', logo: brand.logo || '' });
    setEditBrandingOpen(true);
  };

  const openInviteDialog = () => {
    setInviteForm({ email: '', role: 'staff', designation: '' });
    setInviteLink('');
    setInviteOpen(true);
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Brand Detail View ──
  if (brandDetail || brandLoading) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Button
            variant="ghost"
            onClick={() => { setSelectedBrand(null); setBrandDetail(null); }}
            className="text-muted-foreground hover:text-[#D4A843] gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Brands
          </Button>
        </motion.div>

        {brandLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : brandDetail ? (
          <>
            {/* Brand Header */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <Card className="bg-[#111] border-[#D4A843]/10">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white shrink-0"
                        style={{ backgroundColor: brandDetail.primaryColor || '#D4A843' }}
                      >
                        {brandDetail.logo ? (
                          <img src={brandDetail.logo} alt={brandDetail.name} className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          brandDetail.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{brandDetail.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">@{brandDetail.slug}</span>
                          <span className={PLAN_COLORS[brandDetail.plan] || 'bg-zinc-500/15 text-zinc-400'}>
                            <Badge variant="outline" className={PLAN_COLORS[brandDetail.plan] || 'bg-zinc-500/15 text-zinc-400 border-transparent text-[10px] font-semibold uppercase tracking-wider'}>
                              {brandDetail.plan}
                            </Badge>
                          </span>
                          <Badge variant="outline" className={brandDetail.isActive ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold' : 'bg-red-500/15 text-red-400 border-red-500/20 text-[10px] font-semibold'}>
                            {brandDetail.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">{brandDetail.userCount}/{brandDetail.maxUsers} users</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => openEditBranding(brandDetail)}
                      className="bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/20 hover:bg-[#D4A843]/20 gap-2 self-start sm:self-auto"
                    >
                      <Palette className="h-4 w-4" />
                      Edit Branding
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Users Section */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
              <Card className="bg-[#111] border-[#D4A843]/10">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#D4A843]" />
                      Team Members ({brandDetail.users?.length || 0})
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openInviteDialog}
                        className="border-[#D4A843]/20 text-[#D4A843] hover:bg-[#D4A843]/10 gap-1.5 text-xs"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Invite
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => { setAddUserForm({ name: '', email: '', password: '', role: 'staff', designation: '' }); setAddUserOpen(true); }}
                        className="bg-[#D4A843] text-black hover:bg-[#D4A843]/90 gap-1.5 text-xs font-semibold"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Add User
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {!brandDetail.users?.length ? (
                    <div className="py-12 text-center">
                      <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No team members yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/30 hover:bg-transparent">
                            <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">User</TableHead>
                            <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider hidden md:table-cell">Email</TableHead>
                            <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Role</TableHead>
                            <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider hidden lg:table-cell">Designation</TableHead>
                            <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider hidden xl:table-cell">Last Login</TableHead>
                            <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {brandDetail.users.map((u) => (
                            <TableRow key={u.id} className="border-border/20 hover:bg-white/[0.02]">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8 border border-[#D4A843]/20">
                                    <AvatarFallback className="bg-[#D4A843]/15 text-[#D4A843] text-[11px] font-bold">
                                      {u.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '??'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                                    <p className="text-xs text-muted-foreground md:hidden">{u.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{u.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`${roleBadgeVariant(u.role)} text-[10px] font-semibold uppercase tracking-wider border-transparent`}>
                                  {u.role === 'platform_admin' ? 'Plat. Admin' : u.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">{u.designation || '—'}</TableCell>
                              <TableCell className="text-xs text-muted-foreground hidden xl:table-cell">{formatDate(u.lastLoginAt)}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#D4A843]">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-border">
                                    <DropdownMenuItem onClick={() => openEditUser(u)} className="text-xs gap-2 cursor-pointer">
                                      <Edit3 className="h-3.5 w-3.5" />
                                      Edit Role / Designation
                                    </DropdownMenuItem>
                                    {u.role !== 'owner' && (
                                      <>
                                        <DropdownMenuItem onClick={() => handleDeactivateUser(u.id)} className="text-xs gap-2 text-yellow-400 cursor-pointer focus:text-yellow-400">
                                          <Ban className="h-3.5 w-3.5" />
                                          Deactivate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleRemoveUser(u.id)} className="text-xs gap-2 text-red-400 cursor-pointer focus:text-red-400">
                                          <Trash2 className="h-3.5 w-3.5" />
                                          Remove
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        ) : null}
      </div>
    );
  }

  // ── Brands Grid View ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#D4A843]" />
            Brand Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage all brands and their teams on the platform</p>
        </div>
        <Button
          onClick={() => setAddBrandOpen(true)}
          className="bg-[#D4A843] text-black hover:bg-[#D4A843]/90 gap-2 font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add New Brand
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard icon={Building2} label="Total Brands" value={stats.totalBrands} delay={0} />
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} delay={0.05} />
          <StatCard icon={Eye} label="Active Brands" value={stats.activeBrands} sub={`${stats.inactiveBrands} inactive`} delay={0.1} />
          <StatCard icon={Mail} label="Pending Invites" value={recentInvitations.length} delay={0.15} />
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search brands..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[#111] border-[#D4A843]/15 text-sm focus:border-[#D4A843]/40"
        />
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchBrands} className="mt-2 text-xs">Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      )}

      {/* Brands Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredBrands.map((brand, i) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Card
                  className="bg-[#111] border-[#D4A843]/10 hover:border-[#D4A843]/30 cursor-pointer transition-all group"
                  onClick={() => fetchBrandDetail(brand.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white shrink-0 transition-transform group-hover:scale-105"
                        style={{ backgroundColor: brand.primaryColor || '#D4A843' }}
                      >
                        {brand.logo ? (
                          <img src={brand.logo} alt={brand.name} className="h-9 w-9 rounded-lg object-cover" />
                        ) : (
                          brand.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground truncate">{brand.name}</h3>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-[#D4A843] transition-colors shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">@{brand.slug}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={`${PLAN_COLORS[brand.plan] || 'bg-zinc-500/15 text-zinc-400 border-transparent'} text-[9px] font-semibold uppercase tracking-wider`}>
                            {brand.plan}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {brand.userCount}
                          </span>
                          {!brand.isActive && (
                            <span className="text-[9px] font-semibold text-red-400 uppercase">Inactive</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && !error && filteredBrands.length === 0 && (
        <div className="py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search ? 'No brands match your search' : 'No brands created yet'}
          </p>
          {!search && (
            <Button
              onClick={() => setAddBrandOpen(true)}
              className="mt-4 bg-[#D4A843] text-black hover:bg-[#D4A843]/90 gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Create your first brand
            </Button>
          )}
        </div>
      )}

      {/* ── Add Brand Dialog ── */}
      <Dialog open={addBrandOpen} onOpenChange={setAddBrandOpen}>
        <DialogContent className="sm:max-w-lg bg-[#111] border-[#D4A843]/15 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#D4A843]" />
              Add New Brand
            </DialogTitle>
            <DialogDescription>Create a new brand and its owner account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Brand Name</Label>
              <Input
                value={addBrandForm.name}
                onChange={(e) => setAddBrandForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                placeholder="e.g. Luxora Jewels"
                className="bg-[#0a0a0a] border-border/50 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Slug</Label>
              <Input
                value={addBrandForm.slug}
                onChange={(e) => setAddBrandForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                placeholder="auto-generated"
                className="bg-[#0a0a0a] border-border/50 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={addBrandForm.primaryColor}
                    onChange={(e) => setAddBrandForm((f) => ({ ...f, primaryColor: e.target.value }))}
                    className="h-9 w-12 rounded border border-border/50 cursor-pointer bg-transparent"
                  />
                  <Input
                    value={addBrandForm.primaryColor}
                    onChange={(e) => setAddBrandForm((f) => ({ ...f, primaryColor: e.target.value }))}
                    className="bg-[#0a0a0a] border-border/50 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Logo URL</Label>
                <Input
                  value={addBrandForm.logo}
                  onChange={(e) => setAddBrandForm((f) => ({ ...f, logo: e.target.value }))}
                  placeholder="https://..."
                  className="bg-[#0a0a0a] border-border/50 text-sm"
                />
              </div>
            </div>
            <Separator className="bg-border/30" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Owner Account</p>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Owner Name</Label>
              <Input
                value={addBrandForm.ownerName}
                onChange={(e) => setAddBrandForm((f) => ({ ...f, ownerName: e.target.value }))}
                placeholder="John Doe"
                className="bg-[#0a0a0a] border-border/50 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Owner Email</Label>
              <Input
                type="email"
                value={addBrandForm.ownerEmail}
                onChange={(e) => setAddBrandForm((f) => ({ ...f, ownerEmail: e.target.value }))}
                placeholder="owner@brand.com"
                className="bg-[#0a0a0a] border-border/50 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Owner Password</Label>
              <Input
                type="password"
                value={addBrandForm.ownerPassword}
                onChange={(e) => setAddBrandForm((f) => ({ ...f, ownerPassword: e.target.value }))}
                placeholder="••••••••"
                className="bg-[#0a0a0a] border-border/50 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBrandOpen(false)} className="border-border/50 text-sm">
              Cancel
            </Button>
            <Button
              onClick={handleAddBrand}
              disabled={submitting || !addBrandForm.name || !addBrandForm.slug || !addBrandForm.ownerEmail || !addBrandForm.ownerPassword || !addBrandForm.ownerName}
              className="bg-[#D4A843] text-black hover:bg-[#D4A843]/90 gap-2 text-sm font-semibold"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Invite User Dialog ── */}
      <Dialog open={inviteOpen} onOpenChange={(v) => { setInviteOpen(v); if (!v) setInviteLink(''); }}>
        <DialogContent className="sm:max-w-md bg-[#111] border-[#D4A843]/15">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#D4A843]" />
              Invite User
            </DialogTitle>
            <DialogDescription>
              {inviteLink ? 'Copy this invitation link and share it with the user.' : `Send an invitation to join ${selectedBrand?.name || 'the brand'}`}
            </DialogDescription>
          </DialogHeader>
          {!inviteLink ? (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="user@example.com"
                  className="bg-[#0a0a0a] border-border/50 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <Select value={inviteForm.role} onValueChange={(v) => setInviteForm((f) => ({ ...f, role: v }))}>
                    <SelectTrigger className="bg-[#0a0a0a] border-border/50 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-border">
                      {ROLE_OPTIONS.filter((r) => r.value !== 'owner').map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Designation</Label>
                  <Input
                    value={inviteForm.designation}
                    onChange={(e) => setInviteForm((f) => ({ ...f, designation: e.target.value }))}
                    placeholder="Marketing Lead"
                    className="bg-[#0a0a0a] border-border/50 text-sm"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#0a0a0a] border border-[#D4A843]/15">
                <Link2 className="h-4 w-4 text-[#D4A843] shrink-0" />
                <span className="text-xs text-foreground break-all flex-1">{inviteLink}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyInviteLink}
                  className="shrink-0 text-[#D4A843] hover:text-[#D4A843] h-8"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                This link expires in 7 days. The user will choose their own password upon accepting.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setInviteOpen(false); setInviteLink(''); }} className="border-border/50 text-sm">
              {inviteLink ? 'Close' : 'Cancel'}
            </Button>
            {!inviteLink && (
              <Button
                onClick={handleInvite}
                disabled={submitting || !inviteForm.email}
                className="bg-[#D4A843] text-black hover:bg-[#D4A843]/90 gap-2 text-sm font-semibold"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Generate Invite Link
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add User Directly Dialog ── */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="sm:max-w-md bg-[#111] border-[#D4A843]/15">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#D4A843]" />
              Add User Directly
            </DialogTitle>
            <DialogDescription>Create a new user account for {selectedBrand?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <Input
                value={addUserForm.name}
                onChange={(e) => setAddUserForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jane Smith"
                className="bg-[#0a0a0a] border-border/50 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input
                type="email"
                value={addUserForm.email}
                onChange={(e) => setAddUserForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="jane@brand.com"
                className="bg-[#0a0a0a] border-border/50 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Password</Label>
              <Input
                type="password"
                value={addUserForm.password}
                onChange={(e) => setAddUserForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="bg-[#0a0a0a] border-border/50 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Role</Label>
                <Select value={addUserForm.role} onValueChange={(v) => setAddUserForm((f) => ({ ...f, role: v }))}>
                  <SelectTrigger className="bg-[#0a0a0a] border-border/50 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-border">
                    {ROLE_OPTIONS.filter((r) => r.value !== 'owner').map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Designation</Label>
                <Input
                  value={addUserForm.designation}
                  onChange={(e) => setAddUserForm((f) => ({ ...f, designation: e.target.value }))}
                  placeholder="Marketing Lead"
                  className="bg-[#0a0a0a] border-border/50 text-sm"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserOpen(false)} className="border-border/50 text-sm">
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={submitting || !addUserForm.name || !addUserForm.email || !addUserForm.password}
              className="bg-[#D4A843] text-black hover:bg-[#D4A843]/90 gap-2 text-sm font-semibold"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit User Dialog ── */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="sm:max-w-md bg-[#111] border-[#D4A843]/15">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-[#D4A843]" />
              Edit User — {editUserForm.name}
            </DialogTitle>
            <DialogDescription>Change role and designation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Select value={editUserForm.role} onValueChange={(v) => setEditUserForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger className="bg-[#0a0a0a] border-border/50 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-border">
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Designation</Label>
              <Input
                value={editUserForm.designation}
                onChange={(e) => setEditUserForm((f) => ({ ...f, designation: e.target.value }))}
                placeholder="Marketing Lead"
                className="bg-[#0a0a0a] border-border/50 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserOpen(false)} className="border-border/50 text-sm">
              Cancel
            </Button>
            <Button
              onClick={handleEditUser}
              disabled={submitting}
              className="bg-[#D4A843] text-black hover:bg-[#D4A843]/90 gap-2 text-sm font-semibold"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Branding Dialog ── */}
      <Dialog open={editBrandingOpen} onOpenChange={setEditBrandingOpen}>
        <DialogContent className="sm:max-w-md bg-[#111] border-[#D4A843]/15">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Palette className="h-5 w-5 text-[#D4A843]" />
              Edit Branding
            </DialogTitle>
            <DialogDescription>Update brand visual identity</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Brand Name</Label>
              <Input
                value={editBrandingForm.name}
                onChange={(e) => setEditBrandingForm((f) => ({ ...f, name: e.target.value }))}
                className="bg-[#0a0a0a] border-border/50 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Primary Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editBrandingForm.primaryColor}
                  onChange={(e) => setEditBrandingForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  className="h-9 w-12 rounded border border-border/50 cursor-pointer bg-transparent"
                />
                <Input
                  value={editBrandingForm.primaryColor}
                  onChange={(e) => setEditBrandingForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  className="bg-[#0a0a0a] border-border/50 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Logo URL</Label>
              <Input
                value={editBrandingForm.logo}
                onChange={(e) => setEditBrandingForm((f) => ({ ...f, logo: e.target.value }))}
                placeholder="https://..."
                className="bg-[#0a0a0a] border-border/50 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBrandingOpen(false)} className="border-border/50 text-sm">
              Cancel
            </Button>
            <Button
              onClick={handleEditBranding}
              disabled={submitting}
              className="bg-[#D4A843] text-black hover:bg-[#D4A843]/90 gap-2 text-sm font-semibold"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Branding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Brand Admin/Owner View ──────────────────────────────────────────
function BrandAdminView({ userId, tenantId, tenantName }: { userId: string; tenantId: string; tenantName: string }) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [editStaffOpen, setEditStaffOpen] = useState(false);
  const [editBrandingOpen, setEditBrandingOpen] = useState(false);

  // Form states
  const [addStaffForm, setAddStaffForm] = useState({ name: '', email: '', password: '', role: 'staff', designation: '' });
  const [editStaffForm, setEditStaffForm] = useState({ role: '', designation: '', userId: '', name: '' });
  const [editBrandingForm, setEditBrandingForm] = useState({ name: '', primaryColor: '#D4A843', logo: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchBrand = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tenant/brands/${tenantId}`);
      const data = await res.json();
      if (data.success) {
        setBrand(data.brand);
      } else {
        setError(data.error || 'Failed to load brand info');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchBrand();
  }, [fetchBrand]);

  const handleAddStaff = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tenant/brands/${tenantId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(addStaffForm),
      });
      const data = await res.json();
      if (data.success) {
        setAddStaffOpen(false);
        setAddStaffForm({ name: '', email: '', password: '', role: 'staff', designation: '' });
        fetchBrand();
      } else {
        alert(data.error || 'Failed to add staff');
      }
    } catch {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStaff = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tenant/brands/${tenantId}/users/${editStaffForm.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ role: editStaffForm.role, designation: editStaffForm.designation }),
      });
      const data = await res.json();
      if (data.success) {
        setEditStaffOpen(false);
        fetchBrand();
      } else {
        alert(data.error || 'Failed to update staff');
      }
    } catch {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBranding = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tenant/brands/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(editBrandingForm),
      });
      const data = await res.json();
      if (data.success) {
        setEditBrandingOpen(false);
        fetchBrand();
      } else {
        alert(data.error || 'Failed to update branding');
      }
    } catch {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateStaff = async (targetUserId: string) => {
    try {
      const res = await fetch(`/api/tenant/brands/${tenantId}/users/${targetUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ isActive: false }),
      });
      const data = await res.json();
      if (data.success) fetchBrand();
      else alert(data.error || 'Failed to deactivate');
    } catch {
      alert('Network error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="p-4">
          <p className="text-sm text-red-400">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchBrand} className="mt-2 text-xs">Retry</Button>
        </CardContent>
      </Card>
    );
  }

  if (!brand) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#D4A843]" />
            Brand Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your brand team and settings</p>
        </div>
      </div>

      {/* Brand Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-[#111] border-[#D4A843]/10">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white shrink-0"
                style={{ backgroundColor: brand.primaryColor || '#D4A843' }}
              >
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  brand.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">{brand.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">@{brand.slug}</span>
                  <Badge variant="outline" className={`${PLAN_COLORS[brand.plan] || 'bg-zinc-500/15 text-zinc-400 border-transparent'} text-[10px] font-semibold uppercase tracking-wider`}>
                    {brand.plan}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">{brand.users?.length || 0}/{brand.maxUsers} users</span>
                </div>
              </div>
              <Button
                onClick={() => { const c = brand.primaryColor || '#D4A843'; setEditBrandingForm({ name: brand.name, primaryColor: c, logo: brand.logo || '' }); setEditBrandingOpen(true); }}
                className="bg-[#D4A843]/10 text-[#D4A843] border border-[#D4A843]/20 hover:bg-[#D4A843]/20 gap-2 self-start sm:self-auto"
              >
                <Palette className="h-4 w-4" />
                Edit Branding
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Team Members */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-[#111] border-[#D4A843]/10">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-[#D4A843]" />
                Team Members ({brand.users?.length || 0})
              </CardTitle>
              <Button
                size="sm"
                onClick={() => { setAddStaffForm({ name: '', email: '', password: '', role: 'staff', designation: '' }); setAddStaffOpen(true); }}
                className="bg-[#D4A843] text-black hover:bg-[#D4A843]/90 gap-1.5 text-xs font-semibold"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Add Staff
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!brand.users?.length ? (
              <div className="py-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No team members yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">User</TableHead>
                      <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider hidden md:table-cell">Email</TableHead>
                      <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Role</TableHead>
                      <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider hidden lg:table-cell">Designation</TableHead>
                      <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider hidden xl:table-cell">Last Login</TableHead>
                      <TableHead className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brand.users.map((u) => (
                      <TableRow key={u.id} className="border-border/20 hover:bg-white/[0.02]">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-[#D4A843]/20">
                              <AvatarFallback className="bg-[#D4A843]/15 text-[#D4A843] text-[11px] font-bold">
                                {u.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || '??'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-foreground">{u.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{u.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${roleBadgeVariant(u.role)} text-[10px] font-semibold uppercase tracking-wider border-transparent`}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">{u.designation || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden xl:table-cell">{formatDate(u.lastLoginAt)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#D4A843]">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-border">
                              <DropdownMenuItem
                                onClick={() => { setEditStaffForm({ role: u.role, designation: u.designation || '', userId: u.id, name: u.name }); setEditStaffOpen(true); }}
                                className="text-xs gap-2 cursor-pointer"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                Edit Role / Designation
                              </DropdownMenuItem>
                              {u.role !== 'owner' && (
                                <DropdownMenuItem
                                  onClick={() => handleDeactivateStaff(u.id)}
                                  className="text-xs gap-2 text-yellow-400 cursor-pointer focus:text-yellow-400"
                                >
                                  <Ban className="h-3.5 w-3.5" />
                                  Deactivate
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Add Staff Dialog ── */}
      <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
        <DialogContent className="sm:max-w-md bg-[#111] border-[#D4A843]/15">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#D4A843]" />
              Add Staff Member
            </DialogTitle>
            <DialogDescription>Create a new team member for {brand.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <Input value={addStaffForm.name} onChange={(e) => setAddStaffForm((f) => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" className="bg-[#0a0a0a] border-border/50 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <Input type="email" value={addStaffForm.email} onChange={(e) => setAddStaffForm((f) => ({ ...f, email: e.target.value }))} placeholder="jane@brand.com" className="bg-[#0a0a0a] border-border/50 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Password</Label>
              <Input type="password" value={addStaffForm.password} onChange={(e) => setAddStaffForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" className="bg-[#0a0a0a] border-border/50 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Role</Label>
                <Select value={addStaffForm.role} onValueChange={(v) => setAddStaffForm((f) => ({ ...f, role: v }))}>
                  <SelectTrigger className="bg-[#0a0a0a] border-border/50 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-border">
                    {ROLE_OPTIONS.filter((r) => r.value !== 'owner').map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Designation</Label>
                <Input value={addStaffForm.designation} onChange={(e) => setAddStaffForm((f) => ({ ...f, designation: e.target.value }))} placeholder="Marketing Lead" className="bg-[#0a0a0a] border-border/50 text-sm" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStaffOpen(false)} className="border-border/50 text-sm">Cancel</Button>
            <Button onClick={handleAddStaff} disabled={submitting || !addStaffForm.name || !addStaffForm.email || !addStaffForm.password} className="bg-[#D4A843] text-black hover:bg-[#D4A843]/90 gap-2 text-sm font-semibold">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Add Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Staff Dialog ── */}
      <Dialog open={editStaffOpen} onOpenChange={setEditStaffOpen}>
        <DialogContent className="sm:max-w-md bg-[#111] border-[#D4A843]/15">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-[#D4A843]" />
              Edit Staff — {editStaffForm.name}
            </DialogTitle>
            <DialogDescription>Change role and designation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Select value={editStaffForm.role} onValueChange={(v) => setEditStaffForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger className="bg-[#0a0a0a] border-border/50 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-border">
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Designation</Label>
              <Input value={editStaffForm.designation} onChange={(e) => setEditStaffForm((f) => ({ ...f, designation: e.target.value }))} placeholder="Marketing Lead" className="bg-[#0a0a0a] border-border/50 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStaffOpen(false)} className="border-border/50 text-sm">Cancel</Button>
            <Button onClick={handleEditStaff} disabled={submitting} className="bg-[#D4A843] text-black hover:bg-[#D4A843]/90 gap-2 text-sm font-semibold">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Branding Dialog ── */}
      <Dialog open={editBrandingOpen} onOpenChange={setEditBrandingOpen}>
        <DialogContent className="sm:max-w-md bg-[#111] border-[#D4A843]/15">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Palette className="h-5 w-5 text-[#D4A843]" />
              Edit Branding
            </DialogTitle>
            <DialogDescription>Update your brand visual identity</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Brand Name</Label>
              <Input value={editBrandingForm.name} onChange={(e) => setEditBrandingForm((f) => ({ ...f, name: e.target.value }))} className="bg-[#0a0a0a] border-border/50 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Primary Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={editBrandingForm.primaryColor} onChange={(e) => setEditBrandingForm((f) => ({ ...f, primaryColor: e.target.value }))} className="h-9 w-12 rounded border border-border/50 cursor-pointer bg-transparent" />
                <Input value={editBrandingForm.primaryColor} onChange={(e) => setEditBrandingForm((f) => ({ ...f, primaryColor: e.target.value }))} className="bg-[#0a0a0a] border-border/50 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Logo URL</Label>
              <Input value={editBrandingForm.logo} onChange={(e) => setEditBrandingForm((f) => ({ ...f, logo: e.target.value }))} placeholder="https://..." className="bg-[#0a0a0a] border-border/50 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBrandingOpen(false)} className="border-border/50 text-sm">Cancel</Button>
            <Button onClick={handleEditBranding} disabled={submitting} className="bg-[#D4A843] text-black hover:bg-[#D4A843]/90 gap-2 text-sm font-semibold">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Branding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Main Admin Panel ────────────────────────────────────────────────
export default function AdminPanel() {
  // Read session once; derive initial state from it
  const [session] = useState<{ user: SessionUser; tenant: SessionTenant } | null>(() => {
    if (typeof window === 'undefined') return null;
    return getSession();
  });

  const sessionEmail = session?.user?.email;
  const hasIdInSession = !!session?.user?.id;
  const needsLookup = !hasIdInSession && !!sessionEmail;
  const [userId, setUserId] = useState<string>(() => session?.user?.id || '');
  const [resolved, setResolved] = useState(!needsLookup);
  const tenantId = session?.tenant?.id;

  // Only run async lookup when we have email but no user ID
  useEffect(() => {
    if (hasIdInSession || !sessionEmail) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/tenant/auth/lookup?email=${encodeURIComponent(sessionEmail)}`);
        const data = await res.json();
        if (!cancelled && data.success && data.user?.id) {
          setUserId(data.user.id);
        }
      } catch {
        // Will use empty userId
      }
      if (!cancelled) setResolved(true);
    })();
    return () => { cancelled = true; };
  }, [hasIdInSession, sessionEmail]);

  if (!resolved) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <Card className="bg-[#111] border-[#D4A843]/10">
        <CardContent className="py-16 text-center">
          <Shield className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Unable to load session data</p>
        </CardContent>
      </Card>
    );
  }

  const role = session.user.role;
  const isPlatformAdmin = role === 'platform_admin';
  const isBrandAdmin = role === 'owner' || role === 'admin';

  // Demo role mapping: treat 'admin' as platform_admin for demo
  const effectiveIsPlatformAdmin = isPlatformAdmin || role === 'admin';
  const effectiveIsBrandAdmin = isBrandAdmin;

  if (effectiveIsPlatformAdmin && userId) {
    return <PlatformAdminView userId={userId} />;
  }

  if (effectiveIsBrandAdmin && userId && tenantId) {
    return <BrandAdminView userId={userId} tenantId={tenantId} tenantName={session?.tenant?.name || ''} />;
  }

  // No admin access — show access denied
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#D4A843]" />
          Admin Panel
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Manage brands, teams, and settings</p>
      </div>
      <Card className="bg-[#111] border-[#D4A843]/10">
        <CardContent className="py-16 text-center">
          <Shield className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-1">Access Restricted</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You don&apos;t have permission to access this panel. Admin access is required (Platform Admin, Brand Owner, or Brand Admin role).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}