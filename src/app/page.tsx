'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import {
  Wand2,
  LayoutDashboard,
  Calendar,
  FileText,
  Share2,
  Lightbulb,
  Search,
  Target,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
  Menu,
  Gem,
  Swords,
  Mail,
  Bell,
  Search as SearchIcon,
  X,
  Zap,
  FilePlus2,
  Clock,
  Sparkles,
  BarChart,
  TrendingUp,
  AlertTriangle,
  Check,
  Eye,
  Wallet,
  FlaskConical,
  FileBarChart,
  Filter,
  GitBranch,
  Globe,
  ClipboardList,
  Contact,
  LogOut,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Lazy load tab components
import dynamic from 'next/dynamic';
import LoginPage from '@/components/login-page';

const OverviewTab = dynamic(() => import('@/components/dashboard/overview-tab'), {
  loading: () => <TabSkeleton />,
});
const CalendarTab = dynamic(() => import('@/components/dashboard/calendar-tab'), {
  loading: () => <TabSkeleton />,
});
const BlogPlannerTab = dynamic(() => import('@/components/dashboard/blog-planner-tab'), {
  loading: () => <TabSkeleton />,
});
const SocialPlannerTab = dynamic(() => import('@/components/dashboard/social-planner-tab'), {
  loading: () => <TabSkeleton />,
});
const IdeaResearcherTab = dynamic(() => import('@/components/dashboard/idea-researcher-tab'), {
  loading: () => <TabSkeleton />,
});
const SeoTab = dynamic(() => import('@/components/dashboard/seo-tab'), {
  loading: () => <TabSkeleton />,
});
const CampaignsTab = dynamic(() => import('@/components/dashboard/campaigns-tab'), {
  loading: () => <TabSkeleton />,
});
const SocialAnalyticsTab = dynamic(() => import('@/components/dashboard/social-analytics-tab'), {
  loading: () => <TabSkeleton />,
});
const LeadsTab = dynamic(() => import('@/components/dashboard/leads-tab'), {
  loading: () => <TabSkeleton />,
});
const CompetitorTab = dynamic(() => import('@/components/dashboard/competitor-tab'), {
  loading: () => <TabSkeleton />,
});
const BudgetTab = dynamic(() => import('@/components/dashboard/budget-tab'), {
  loading: () => <TabSkeleton />,
});
const EmailTab = dynamic(() => import('@/components/dashboard/email-tab'), {
  loading: () => <TabSkeleton />,
});
const ReportsTab = dynamic(() => import('@/components/dashboard/reports-tab'), {
  loading: () => <TabSkeleton />,
});
const AbTestingTab = dynamic(() => import('@/components/dashboard/ab-testing-tab'), {
  loading: () => <TabSkeleton />,
});
const AttributionTab = dynamic(() => import('@/components/dashboard/attribution-tab'), {
  loading: () => <TabSkeleton />,
});
const SeoMasterTab = dynamic(() => import('@/components/dashboard/seo-master-tab'), {
  loading: () => <TabSkeleton />,
});
const ReportBuilderTab = dynamic(() => import('@/components/dashboard/report-builder-tab'), {
  loading: () => <TabSkeleton />,
});
const FunnelTab = dynamic(() => import('@/components/dashboard/funnel-tab'), {
  loading: () => <TabSkeleton />,
});
const SocialAccountsTab = dynamic(() => import('@/components/dashboard/social-accounts-tab'), {
  loading: () => <TabSkeleton />,
});
const LeadPipelineTab = dynamic(() => import('@/components/dashboard/lead-pipeline-tab'), {
  loading: () => <TabSkeleton />,
});

type TabKey = 'overview' | 'calendar' | 'blogs' | 'social-planner' | 'ideas' | 'seo' | 'campaigns' | 'social-analytics' | 'leads' | 'report-builder' | 'budget' | 'competitors' | 'email' | 'ab-testing' | 'reports' | 'funnel' | 'attribution' | 'social-accounts' | 'seo-master' | 'lead-pipeline';

interface NavItem {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category?: string;
  shortcut?: string;
  badge?: string;
}

const navItems: NavItem[] = [
  // Core
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, category: 'Core', shortcut: '1' },
  // Content & Planning
  { key: 'calendar', label: 'Content Calendar', icon: Calendar, category: 'Content & Planning', shortcut: '2' },
  { key: 'blogs', label: 'Blog Planner', icon: FileText, category: 'Content & Planning', shortcut: '3', badge: '3' },
  { key: 'social-planner', label: 'Social Planner', icon: Share2, category: 'Content & Planning', shortcut: '4' },
  { key: 'ideas', label: 'Idea Researcher', icon: Lightbulb, category: 'Content & Planning', shortcut: '5', badge: 'AI' },
  // Performance
  { key: 'seo', label: 'SEO Dashboard', icon: Search, category: 'Performance', shortcut: '6' },
  { key: 'campaigns', label: 'Campaigns', icon: Target, category: 'Performance', shortcut: '7', badge: '5' },
  { key: 'social-analytics', label: 'Social Analytics', icon: BarChart3, category: 'Performance', shortcut: '8' },
  { key: 'leads', label: 'Leads & Revenue', icon: Users, category: 'Performance', shortcut: '9', badge: '12' },
  // Analytics & Insights
  { key: 'report-builder', label: 'Report Builder', icon: ClipboardList, category: 'Analytics', shortcut: '0' },
  { key: 'budget', label: 'Budget Planner', icon: Wallet, category: 'Analytics' },
  { key: 'competitors', label: 'Competitor Analysis', icon: Swords, category: 'Analytics' },
  { key: 'attribution', label: 'Attribution', icon: GitBranch, category: 'Analytics' },
  { key: 'funnel', label: 'Funnel', icon: Filter, category: 'Analytics' },
  // Outreach
  { key: 'email', label: 'Email Campaigns', icon: Mail, category: 'Outreach' },
  { key: 'reports', label: 'Reports', icon: FileBarChart, category: 'Outreach', badge: '2' },
  { key: 'ab-testing', label: 'A/B Testing', icon: FlaskConical, category: 'Outreach' },
  // Advanced
  { key: 'social-accounts', label: 'Social Accounts', icon: Globe, category: 'Advanced' },
  { key: 'seo-master', label: 'AI SEO Master', icon: Wand2, category: 'Advanced', badge: 'AI' },
  { key: 'lead-pipeline', label: 'Lead Pipeline', icon: Contact, category: 'Advanced', badge: '8' },
];

function TabSkeleton() {
  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-60 rounded-xl" />
    </div>
  );
}

function SidebarContent({
  activeTab,
  onTabChange,
  collapsed,
  onLogout,
  scrollRef,
  user,
}: {
  activeTab: TabKey;
  onTabChange: (key: TabKey) => void;
  collapsed: boolean;
  onLogout?: () => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  user?: { email: string; name: string; role: string } | null;
}) {
  const activeItemRef = useRef<HTMLButtonElement | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  // Smooth scroll active nav item into view
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeTab]);

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-border/50 relative">
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-[#D4A843]/20 via-[#D4A843]/10 to-transparent" />
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gold-gradient shadow-md shadow-[#D4A843]/15">
          <Gem className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold gold-gradient-text tracking-wider text-glow-gold-sm">LAXREE</h1>
            <p className="text-[9px] text-muted-foreground/70 -mt-0.5 tracking-[0.25em] uppercase">Marketing Suite</p>
          </div>
        )}
      </div>

      {/* Navigation - Smooth Animated Scroll with Categories */}
      <ScrollArea className="flex-1 py-3 scroll-smooth">
        <nav className="px-3" ref={scrollRef as React.RefObject<HTMLElement>}>
          {navItems.reduce<React.ReactNode[]>((acc, item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            const prevItem = navItems[navItems.indexOf(item) - 1];
            const showCategory = !collapsed && item.category && (!prevItem || prevItem.category !== item.category);
            const badgeColor = item.badge === 'AI' ? 'bg-[#D4A843]/20 text-[#D4A843]' : 'bg-[#D4A843]/10 text-[#D4A843]/70';

            if (collapsed) {
              acc.push(
                <TooltipProvider key={item.key} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        ref={isActive ? activeItemRef : undefined}
                        onClick={() => onTabChange(item.key)}
                        className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300 ease-out mx-auto nav-item-hover focus-ring-gold my-0.5 ${
                          isActive
                            ? 'bg-[#D4A843]/15 text-[#D4A843] sidebar-glow-active'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full gold-gradient" />
                        )}
                        <Icon className="h-[18px] w-[18px]" />
                        {item.badge && (
                          <span className={`absolute -top-0.5 -right-0.5 h-3.5 min-w-3.5 flex items-center justify-center rounded-full px-1 text-[8px] font-bold ${badgeColor}`}>{item.badge}</span>
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-card border-border text-foreground">
                      <div className="flex items-center gap-2">
                        {item.label}
                        {item.shortcut && <span className="text-[10px] text-muted-foreground/50 ml-2">⌘{item.shortcut}</span>}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            } else {
              acc.push(
                <div key={item.key}>
                  {showCategory && (
                    <div className="flex items-center gap-2 mt-4 mb-1.5 first:mt-0">
                      <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">{item.category}</span>
                      <div className="flex-1 h-px bg-border/30" />
                    </div>
                  )}
                  <button
                    ref={isActive ? activeItemRef : undefined}
                    onClick={() => onTabChange(item.key)}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-300 ease-out w-full focus-ring-gold my-0.5 group ${
                      isActive
                        ? 'bg-[#D4A843]/10 text-[#D4A843] sidebar-glow-active'
                        : 'text-muted-foreground/80 hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full gold-gradient" />
                    )}
                    <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                    <span className="truncate flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={`h-5 min-w-5 flex items-center justify-center rounded-full px-1.5 text-[9px] font-bold ${badgeColor}`}>{item.badge}</span>
                    )}
                    {item.shortcut && (
                      <span className="text-[10px] text-muted-foreground/30 font-mono group-hover:text-muted-foreground/50 transition-colors">{item.shortcut}</span>
                    )}
                  </button>
                </div>
              );
            }
            return acc;
          }, [])}
        </nav>
      </ScrollArea>

      {/* Quick Stats */}
      <div className={"border-t border-border/50 px-3 pt-3 pb-1" + (collapsed ? ' px-2' : '')}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] font-bold text-muted-foreground">8</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              <span className="text-[10px] font-bold text-muted-foreground">12</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span className="text-[10px] font-bold text-muted-foreground">3</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-2 pb-1">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="text-[10px] font-semibold text-muted-foreground">8 <span className="text-[9px] text-muted-foreground/60">Active</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              <span className="text-[10px] font-semibold text-muted-foreground">12 <span className="text-[9px] text-muted-foreground/60">Pending</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span className="text-[10px] font-semibold text-muted-foreground">3 <span className="text-[9px] text-muted-foreground/60">Alerts</span></span>
            </div>
          </div>
        )}
      </div>

      {/* User Section with Logout */}
      <div className="relative border-t border-border/30 p-3" ref={userMenuRef}>
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-[#D4A843]/15 via-[#D4A843]/8 to-transparent" />
        {!collapsed ? (
          <div className="space-y-1">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 transition-all duration-200 cursor-pointer group w-full text-left"
            >
              <Avatar className="h-8 w-8 border border-[#D4A843]/30 group-hover:border-[#D4A843]/50 transition-colors">
                <AvatarFallback className="bg-[#D4A843]/20 text-[#D4A843] text-xs font-bold">{user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'LT'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name || 'Laxree Team'}</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] text-muted-foreground/70 truncate">{user?.role === 'admin' ? 'Administrator' : user?.role === 'manager' ? 'Marketing Manager' : 'Analytics Viewer'}</p>
                  {user?.role === 'admin' && (
                    <span className="h-3.5 px-1.5 rounded-full bg-[#D4A843]/15 text-[8px] font-bold text-[#D4A843] tracking-wider uppercase">Admin</span>
                  )}
                </div>
              </div>
              <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground/50 transition-transform duration-200 ${userMenuOpen ? 'rotate-90' : ''}`} />
            </button>
            {/* User dropdown menu */}
            <AnimatePresence>
              {userMenuOpen && onLogout && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="rounded-lg border border-[#D4A843]/15 bg-[#0a0a0a] p-1">
                    <div className="px-3 py-2 border-b border-border/30 mb-1">
                      <p className="text-[11px] text-muted-foreground truncate">{user?.email || ''}</p>
                    </div>
                    <button
                      onClick={() => { onLogout(); setUserMenuOpen(false); }}
                      className="flex items-center gap-2.5 w-full rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => { if (onLogout) onLogout(); }}
                  className="flex justify-center"
                >
                  <Avatar className="h-8 w-8 border border-[#D4A843]/30 cursor-pointer hover:border-red-500/50 hover:opacity-80 transition-all">
                    <AvatarFallback className="bg-[#D4A843]/20 text-[#D4A843] text-xs font-bold">{user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'LT'}</AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card border-border text-foreground">
                {user?.name || 'Laxree Team'} — Click to sign out
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

const notifications = [
  { id: 1, title: 'Diwali Collection campaign ROAS increased by 15%', time: '2 hours ago', type: 'success' as const },
  { id: 2, title: 'New lead from Tata Group via Google Ads', time: '5 hours ago', type: 'info' as const },
  { id: 3, title: "Blog '10 Luxe Jewellery Trends' hit #3 on Google", time: '1 day ago', type: 'success' as const },
  { id: 4, title: 'YouTube Brand Video campaign is at risk', time: '1 day ago', type: 'warning' as const },
  { id: 5, title: 'Instagram milestone: 135K followers reached!', time: '2 days ago', type: 'info' as const },
  { id: 6, title: 'Monthly SEO report is ready for review', time: '3 days ago', type: 'info' as const },
];

const notifDotColor = { success: 'bg-green-500', warning: 'bg-red-500', info: 'bg-[#D4A843]' };

const quickActions = [
  { label: 'New Blog Post', tab: 'blogs' as TabKey, icon: FilePlus2 },
  { label: 'Schedule Post', tab: 'social-planner' as TabKey, icon: Clock },
  { label: 'Add Calendar Event', tab: 'calendar' as TabKey, icon: Calendar },
  { label: 'Generate Ideas', tab: 'ideas' as TabKey, icon: Sparkles },
  { label: 'View SEO Report', tab: 'seo' as TabKey, icon: BarChart },
];

export default function Home() {
  // Auth state - use lazy initializer to read session without useEffect setState
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return !!sessionStorage.getItem('laxree_session');
      } catch { return false; }
    }
    return false;
  });
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const s = sessionStorage.getItem('laxree_session');
        return s ? JSON.parse(s) : null;
      } catch { return null; }
    }
    return null;
  });
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const navScrollRef = useRef<HTMLDivElement>(null);

  const handleLogin = useCallback((loggedInUser: { email: string; name: string; role: string }) => {
    setIsLoggedIn(true);
    setUser(loggedInUser);
    sessionStorage.setItem('laxree_session', JSON.stringify(loggedInUser));
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    sessionStorage.removeItem('laxree_session');
  }, []);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');

  const activeNavItem = navItems.find((n) => n.key === activeTab);

  // Handle tab change with smooth scroll & mobile sheet close
  const handleTabChange = useCallback((key: TabKey) => {
    setActiveTab(key);
    setMobileSheetOpen(false);
  }, []);

  // Command palette: filter nav items
  const filteredNavItems = cmdQuery
    ? navItems.filter((n) => n.label.toLowerCase().includes(cmdQuery.toLowerCase()))
    : navItems;

  // Cmd+K shortcut + Alt+number for quick nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
        setCmdQuery('');
      }
      if (e.key === 'Escape') {
        setCmdOpen(false);
        setFabOpen(false);
      }
      // Alt+1 through Alt+0 for quick navigation
      if (e.altKey && !e.metaKey && !e.ctrlKey) {
        const shortcutItem = navItems.find(n => n.shortcut === e.key);
        if (shortcutItem) {
          e.preventDefault();
          handleTabChange(shortcutItem.key);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Show login if not authenticated
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'calendar': return <CalendarTab />;
      case 'blogs': return <BlogPlannerTab />;
      case 'social-planner': return <SocialPlannerTab />;
      case 'ideas': return <IdeaResearcherTab />;
      case 'seo': return <SeoTab />;
      case 'campaigns': return <CampaignsTab />;
      case 'social-analytics': return <SocialAnalyticsTab />;
      case 'leads': return <LeadsTab />;
      case 'report-builder': return <ReportBuilderTab />;
      case 'budget': return <BudgetTab />;
      case 'competitors': return <CompetitorTab />;
      case 'email': return <EmailTab />;
      case 'ab-testing': return <AbTestingTab />;
      case 'reports': return <ReportsTab />;
      case 'funnel': return <FunnelTab />;
      case 'social-accounts': return <SocialAccountsTab />;
      case 'attribution': return <AttributionTab />;
      case 'seo-master': return <SeoMasterTab />;
      case 'lead-pipeline': return <LeadPipelineTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border/50 bg-[#0d0d0d] transition-all duration-300 shrink-0 ${
          sidebarCollapsed ? 'w-[70px]' : 'w-[260px]'
        }`}
      >
        <SidebarContent
          activeTab={activeTab}
          onTabChange={handleTabChange}
          collapsed={sidebarCollapsed}
          onLogout={handleLogout}
          scrollRef={navScrollRef}
          user={user}
        />
        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-5 z-10 hidden lg:flex items-center justify-center h-6 w-6 rounded-full bg-[#1a1a1a] border border-border/50 text-muted-foreground hover:text-[#D4A843] hover:border-[#D4A843]/30 transition-all"
          style={{ left: sidebarCollapsed ? '52px' : '242px' }}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>

      {/* Mobile Sidebar (Controlled) */}
      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-3 left-3 z-50 lg:hidden text-muted-foreground hover:text-[#D4A843] bg-[#111]/80 backdrop-blur-sm border border-border/50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 bg-[#0d0d0d] border-border/50">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent
            activeTab={activeTab}
            onTabChange={handleTabChange}
            collapsed={false}
            onLogout={handleLogout}
            user={user}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="relative sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/50 bg-[#0a0a0a]/95 backdrop-blur-md px-4 lg:px-6 shrink-0">
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4A843]/30 to-transparent" />
          <div className="flex items-center gap-3 lg:gap-4 pl-12 lg:pl-0">
            {activeNavItem && (
              <>
                <activeNavItem.icon className="h-4 w-4 text-[#D4A843] shrink-0" />
                <h2 className="text-sm font-semibold text-foreground hidden sm:block truncate">
                  {activeNavItem.label}
                </h2>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Command Palette Trigger */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-[#D4A843] h-8 px-3 border border-border/40 hover:border-[#D4A843]/30 bg-[#111]/30 transition-all"
              onClick={() => { setCmdOpen(true); setCmdQuery(''); }}
            >
              <SearchIcon className="h-3.5 w-3.5" />
              <span className="text-xs">Search...</span>
              <kbd className="ml-1 inline-flex h-5 items-center gap-0.5 rounded border border-border/60 bg-[#0a0a0a] px-1.5 text-[10px] font-mono text-muted-foreground/70">
                ⌘K
              </kbd>
            </Button>
            {/* Mobile search */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden text-muted-foreground hover:text-[#D4A843] h-8 w-8"
              onClick={() => { setCmdOpen(true); setCmdQuery(''); }}
            >
              <SearchIcon className="h-4 w-4" />
            </Button>

            {/* Date Range */}
            <Select defaultValue="30d">
              <SelectTrigger className="h-8 w-auto gap-1.5 border-border/50 bg-[#111]/50 text-xs text-muted-foreground focus:ring-[#D4A843]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111] border-border">
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-muted-foreground hover:text-[#D4A843] h-8 w-8"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#D4A843] ring-2 ring-[#0a0a0a] notif-pulse" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 bg-[#111] border-[#D4A843]/20 rounded-xl shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-[#D4A843]" />
                    <span className="text-sm font-semibold text-foreground">Notifications</span>
                    <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-[#D4A843]/20 text-[10px] font-bold text-[#D4A843]">{notifications.length}</span>
                  </div>
                  <button className="text-[11px] text-[#D4A843] hover:underline">Mark all read</button>
                </div>
                <ScrollArea className="max-h-[340px]">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      className="flex items-start gap-3 w-full px-4 py-3 text-left transition-colors hover:bg-[#D4A843]/5 border-b border-border/20 last:border-0"
                    >
                      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${notifDotColor[n.type]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-foreground leading-snug">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">{n.time}</p>
                      </div>
                      <Eye className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-1" />
                    </button>
                  ))}
                </ScrollArea>
                <div className="px-4 py-2.5 border-t border-border/50">
                  <button className="text-[12px] text-[#D4A843] hover:underline flex items-center gap-1">
                    View all notifications
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            {/* User name badge (desktop) */}
            {user && (
              <div className="hidden md:flex items-center gap-2 mr-1">
                <div className="h-5 px-2 rounded-full bg-[#D4A843]/10 border border-[#D4A843]/15 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-sm shadow-green-500/30" />
                  <span className="text-[11px] font-medium text-[#D4A843]/80">{user.name}</span>
                </div>
              </div>
            )}
            <Separator orientation="vertical" className="h-5 bg-border/50 mx-1" />

            {/* User Avatar (mobile) */}
            <Avatar className="h-7 w-7 border border-[#D4A843]/20 lg:hidden">
              <AvatarFallback className="bg-[#D4A843]/15 text-[#D4A843] text-[10px] font-bold">{user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'LT'}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1440px] p-4 lg:p-6">
            {renderTab()}
          </div>

          {/* Footer */}
          <footer className="relative border-t border-border/20 mt-8 bg-gradient-to-t from-[#080808] to-transparent">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A843]/15 to-transparent" />
            <div className="mx-auto max-w-[1440px] flex h-10 items-center justify-between px-4 lg:px-6">
              <p className="text-[11px] text-muted-foreground/60">
                © {new Date().getFullYear()} <span className="text-[#D4A843]/50 font-medium">Laxree</span> Jewellery — Marketing Analytics Platform
              </p>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 dot-pulse shadow-sm shadow-green-500/30" />
                <span className="text-[11px] text-muted-foreground/60">All systems operational</span>
              </div>
            </div>
          </footer>
        </main>

        {/* ── Quick Actions FAB ──────────────────────────────────────── */}
        <div className="fixed bottom-20 right-6 z-50 flex flex-col-reverse items-end gap-3">
          {/* FAB Button */}
          <button
            onClick={() => setFabOpen(!fabOpen)}
            className="pulse-gold flex h-14 w-14 items-center justify-center rounded-full gold-gradient text-primary-foreground shadow-lg shadow-[#D4A843]/20 transition-transform duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A843]/50"
            aria-label="Quick Actions"
          >
            <motion.div
              animate={{ rotate: fabOpen ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Zap className="h-6 w-6" />
            </motion.div>
          </button>

          {/* Expanded Menu */}
          <AnimatePresence>
            {fabOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex flex-col gap-2"
              >
                {quickActions.map((action, i) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15, delay: i * 0.04 }}
                    onClick={() => {
                      setActiveTab(action.tab);
                      setFabOpen(false);
                    }}
                    className="group flex items-center gap-3 rounded-xl bg-[#141414] border border-[#D4A843]/15 px-4 py-3 shadow-lg shadow-black/40 transition-all duration-200 hover:border-[#D4A843]/40 hover:bg-[#1a1a1a] hover:shadow-[#D4A843]/5 hover:shadow-xl"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#D4A843]/10 transition-colors group-hover:bg-[#D4A843]/20">
                      <action.icon className="h-4 w-4 text-[#D4A843]" />
                    </div>
                    <span className="text-sm font-medium text-foreground whitespace-nowrap">
                      {action.label}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Command Palette (⌘K) ─────────────────────────────────── */}
      <Dialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 bg-[#111] border-[#D4A843]/15 shadow-2xl shadow-black/60 rounded-xl overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
            <SearchIcon className="h-4 w-4 text-[#D4A843] shrink-0" />
            <input
              autoFocus
              value={cmdQuery}
              onChange={(e) => setCmdQuery(e.target.value)}
              placeholder="Search tabs, actions..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <kbd className="inline-flex h-5 items-center rounded border border-border/60 bg-[#0a0a0a] px-1.5 text-[10px] font-mono text-muted-foreground/50">ESC</kbd>
          </div>
          <div className="max-h-[320px] overflow-y-auto py-2 px-2">
            <p className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Navigation</p>
            <div className="space-y-0.5">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setActiveTab(item.key); setCmdOpen(false); }}
                    className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-[#D4A843]/10 text-[#D4A843]'
                        : 'text-foreground hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-60" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && <span className="text-[10px] text-[#D4A843]/60">Current</span>}
                  </button>
                );
              })}
            </div>
            {cmdQuery && filteredNavItems.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">No results found</div>
            )}
            <div className="gold-divider my-2" />
            <p className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">Quick Actions</p>
            <div className="space-y-0.5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => { setActiveTab(action.tab); setCmdOpen(false); }}
                    className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-white/5 transition-all duration-150"
                  >
                    <Icon className="h-4 w-4 shrink-0 opacity-60" />
                    <span className="flex-1 text-left">{action.label}</span>
                    <Zap className="h-3 w-3 text-[#D4A843]/40" />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="border-t border-border/30 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
              <span className="flex items-center gap-1"><kbd className="inline-flex h-4 items-center rounded border border-border/40 bg-[#0a0a0a] px-1 text-[9px]">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="inline-flex h-4 items-center rounded border border-border/40 bg-[#0a0a0a] px-1 text-[9px]">↵</kbd> Select</span>
            </div>
            <span className="text-[10px] text-muted-foreground/40">Laxree Marketing Suite</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}