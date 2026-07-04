'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Clock,
  Check,
  X,
  Loader2,
  Ban,
  UserCheck,
  MoreHorizontal,
  Eye,
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
  tenant: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    primaryColor: string;
  };
}

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
  designation: string | null;
  avatar: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  isOwner?: boolean;
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

function formatRelativeTime(d: string | null): string {
  if (!d) return 'Never';
  const now = new Date();
  const date = new Date(d);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-[#D4A843]/15 text-[#D4A843] border-[#D4A843]/20',
  admin: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  manager: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  analyst: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  viewer: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
  staff: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
};

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  analyst: 'Analyst',
  viewer: 'Viewer',
  staff: 'Staff',
};

const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  owner: Shield,
  admin: ShieldCheck,
  manager: ShieldAlert,
  analyst: Eye,
  viewer: Eye,
  staff: Users,
};

/* ─── Animation variants ─────────────────────────────────────── */
const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

/* ─── Main Component ─────────────────────────────────────────── */
export default function StaffManagementTab() {
  const [session] = useState<SessionUser | null>(() => getSession());
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  // Dialog states
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Form states
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'staff',
    designation: '',
  });
  const [editForm, setEditForm] = useState({
    role: '',
    designation: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tenantId = session?.tenant?.id;
  const isOwnerOrAdmin = session?.role === 'owner' || session?.role === 'admin' || session?.role === 'platform_admin';
  const accentColor = session?.tenant?.primaryColor || '#D4A843';

  /* ── Fetch team members ─────────────────────────────────────── */
  const fetchMembers = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tenant/brands/${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.brand?.users) {
          setMembers(
            data.brand.users.map((u: TeamMember & { role: string }) => ({
              ...u,
              isOwner: u.role === 'owner',
            }))
          );
        }
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  /* ── Invite team member ─────────────────────────────────────── */
  const handleInvite = async () => {
    setError('');
    if (!tenantId || !inviteForm.email) {
      setError('Email is required');
      return;
    }
    setActionLoading('invite');
    try {
      const res = await fetch(`/api/tenant/brands/${tenantId}/invite`, {
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
      setInviteForm({ email: '', role: 'staff', designation: '' });
      setSuccess('Invitation sent successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setActionLoading('');
    }
  };

  /* ── Edit member ────────────────────────────────────────────── */
  const openEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setEditForm({ role: member.role, designation: member.designation || '' });
    setEditOpen(true);
    setError('');
  };

  const handleEdit = async () => {
    setError('');
    if (!selectedMember || !tenantId) return;
    setActionLoading('edit');
    try {
      const res = await fetch(`/api/tenant/brands/${tenantId}/users/${selectedMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': session?.id || '' },
        body: JSON.stringify({
          role: editForm.role,
          designation: editForm.designation || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update member');
      setEditOpen(false);
      setSuccess('Member updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member');
    } finally {
      setActionLoading('');
    }
  };

  /* ── Toggle active/suspended ────────────────────────────────── */
  const handleToggleActive = async (member: TeamMember) => {
    if (!tenantId || member.isOwner) return;
    setActionLoading(`toggle-${member.id}`);
    try {
      const res = await fetch(`/api/tenant/brands/${tenantId}/users/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': session?.id || '' },
        body: JSON.stringify({ isActive: !member.isActive }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update member status');
      }
      fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading('');
    }
  };

  /* ── Remove member ──────────────────────────────────────────── */
  const openRemove = (member: TeamMember) => {
    setSelectedMember(member);
    setRemoveOpen(true);
  };

  const handleRemove = async () => {
    if (!selectedMember || !tenantId) return;
    setActionLoading('remove');
    try {
      const res = await fetch(`/api/tenant/brands/${tenantId}/users/${selectedMember.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-user-id': session?.id || '' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove member');
      setRemoveOpen(false);
      setSuccess('Member removed successfully!');
      setTimeout(() => setSuccess(''), 3000);
      fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading('');
    }
  };

  /* ── Stats ──────────────────────────────────────────────────── */
  const activeMembers = members.filter((m) => m.isActive).length;
  const totalSlots = 10; // Default max users

  /* ── Loading state ──────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#D4A843]/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-[#D4A843] animate-pulse" />
          </div>
          <div>
            <div className="h-5 w-40 bg-[#1a1a1a] rounded animate-pulse" />
            <div className="h-3 w-56 bg-[#1a1a1a] rounded animate-pulse mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[#1a1a1a] animate-pulse" />
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
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ background: `${accentColor}15` }}
          >
            <Users className="h-5 w-5" style={{ color: accentColor }} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Team Management
            </h2>
            <p className="text-xs text-muted-foreground/60">
              Manage team members for {session?.tenant?.name || 'your brand'}
            </p>
          </div>
        </div>
        {isOwnerOrAdmin && (
          <Button
            size="sm"
            className="gap-2 border-0 font-semibold"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
              color: '#0a0a0a',
            }}
            onClick={() => { setInviteForm({ email: '', role: 'staff', designation: '' }); setInviteOpen(true); setError(''); }}
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Invite Member</span>
          </Button>
        )}
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
        {error && !inviteOpen && !editOpen && !removeOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 flex items-center gap-2"
          >
            <X className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div {...fadeIn}>
          <Card className="border-border/50 overflow-hidden relative">
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
            />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider">Team Size</p>
                  <p className="text-2xl font-bold text-foreground mt-1.5">{activeMembers}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">of {totalSlots} seats</p>
                </div>
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${accentColor}15` }}
                >
                  <Users className="h-5 w-5" style={{ color: accentColor }} />
                </div>
              </div>
              {/* Usage bar */}
              <div className="mt-3 h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((activeMembers / totalSlots) * 100, 100)}%`,
                    background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn}>
          <Card className="border-border/50 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider">Active Now</p>
                  <p className="text-2xl font-bold text-foreground mt-1.5">
                    {members.filter((m) => m.isActive && m.lastLoginAt && (Date.now() - new Date(m.lastLoginAt).getTime()) < 86400000).length}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">Logged in today</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div {...fadeIn}>
          <Card className="border-border/50 overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground/70 font-medium uppercase tracking-wider">Invited</p>
                  <p className="text-2xl font-bold text-foreground mt-1.5">
                    {members.length - activeMembers}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">Awaiting acceptance</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Team Members List */}
      <motion.div {...fadeIn}>
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">Team Members</CardTitle>
                <Badge variant="outline" className="text-[10px] border-border/50" style={{ color: accentColor, borderColor: `${accentColor}30`, background: `${accentColor}10` }}>
                  {members.length} members
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/20">
              {members.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground/60">No team members yet</p>
                  {isOwnerOrAdmin && (
                    <Button
                      size="sm"
                      className="mt-4 gap-2 border-0 font-semibold"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
                        color: '#0a0a0a',
                      }}
                      onClick={() => { setInviteForm({ email: '', role: 'staff', designation: '' }); setInviteOpen(true); setError(''); }}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Invite your first team member
                    </Button>
                  )}
                </div>
              ) : (
                members.map((member, idx) => {
                  const RoleIcon = ROLE_ICONS[member.role] || Users;
                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.03 }}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div
                          className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                          style={{
                            background: `${accentColor}20`,
                            color: accentColor,
                          }}
                        >
                          {member.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                        </div>
                        {/* Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {member.name}
                              {member.id === session?.id && (
                                <span className="ml-1.5 text-[10px] text-muted-foreground/50 font-normal">(you)</span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[11px] text-muted-foreground/60 truncate">{member.email}</p>
                            {member.designation && (
                              <>
                                <span className="text-muted-foreground/30">·</span>
                                <p className="text-[11px] text-muted-foreground/50 truncate">{member.designation}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        {/* Role Badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${ROLE_COLORS[member.role] || ROLE_COLORS.staff}`}>
                          <RoleIcon className="h-2.5 w-2.5" />
                          {ROLE_LABELS[member.role] || member.role}
                        </span>

                        {/* Last login */}
                        <span className="text-[11px] text-muted-foreground/50 hidden lg:flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(member.lastLoginAt)}
                        </span>

                        {/* Status */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            member.isActive
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${member.isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          {member.isActive ? 'Active' : 'Suspended'}
                        </span>

                        {/* Actions */}
                        {isOwnerOrAdmin && !member.isOwner && member.id !== session?.id && (
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEdit(member)}
                              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleActive(member)}
                              disabled={actionLoading === `toggle-${member.id}`}
                              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 transition-colors disabled:opacity-50"
                              title={member.isActive ? 'Suspend' : 'Activate'}
                            >
                              {actionLoading === `toggle-${member.id}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : member.isActive ? (
                                <Ban className="h-3.5 w-3.5" />
                              ) : (
                                <UserCheck className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => openRemove(member)}
                              className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                              title="Remove"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ INVITE DIALOG ═══ */}
      <Dialog open={inviteOpen} onOpenChange={(open) => { setInviteOpen(open); if (!open) setError(''); }}>
        <DialogContent className="sm:max-w-md bg-[#111] border-border/50 p-0 gap-0">
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
          />
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${accentColor}15` }}
                >
                  <UserPlus className="h-4 w-4" style={{ color: accentColor }} />
                </div>
                Invite Team Member
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Send an invitation to join {session?.tenant?.name || 'your brand'}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">{error}</div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Email Address *</label>
              <Input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="colleague@company.com"
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
              className="gap-2 font-semibold border-0 text-[#0a0a0a]"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }}
              onClick={handleInvite}
              disabled={actionLoading === 'invite'}
            >
              {actionLoading === 'invite' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══ EDIT MEMBER DIALOG ═══ */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setError(''); }}>
        <DialogContent className="sm:max-w-md bg-[#111] border-border/50 p-0 gap-0">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <div className="p-6 pb-0">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Pencil className="h-4 w-4 text-blue-400" />
                </div>
                Edit Team Member
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update role and designation for {selectedMember?.name}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400">{error}</div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0a0a] border border-border/30">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: `${accentColor}20`, color: accentColor }}
              >
                {selectedMember?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{selectedMember?.name}</p>
                <p className="text-[11px] text-muted-foreground/60">{selectedMember?.email}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Role</label>
              <Select
                value={editForm.role}
                onValueChange={(v) => setEditForm((p) => ({ ...p, role: v }))}
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
                value={editForm.designation}
                onChange={(e) => setEditForm((p) => ({ ...p, designation: e.target.value }))}
                placeholder="Marketing Manager"
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

      {/* ═══ REMOVE CONFIRMATION DIALOG ═══ */}
      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent className="sm:max-w-sm bg-[#111] border-border/50 p-0 gap-0">
          <div className="p-6">
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-base">Remove Team Member</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-2">
                Are you sure you want to remove <strong className="text-foreground">{selectedMember?.name}</strong> ({selectedMember?.email}) from the team?
                They will lose access to the dashboard immediately.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex items-center justify-end gap-2 p-6 pt-0">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setRemoveOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold border-0"
              onClick={handleRemove}
              disabled={actionLoading === 'remove'}
            >
              {actionLoading === 'remove' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Remove Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}