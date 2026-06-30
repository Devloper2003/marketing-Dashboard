'use client';

import { useState } from 'react';
import { Suspense } from 'react';
import {
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Lazy load tab components
import dynamic from 'next/dynamic';

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

type TabKey = 'overview' | 'calendar' | 'blogs' | 'social-planner' | 'ideas' | 'seo' | 'campaigns' | 'social-analytics' | 'leads' | 'budget' | 'competitors' | 'email' | 'ab-testing' | 'reports';

interface NavItem {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'calendar', label: 'Content Calendar', icon: Calendar },
  { key: 'blogs', label: 'Blog Planner', icon: FileText },
  { key: 'social-planner', label: 'Social Planner', icon: Share2 },
  { key: 'ideas', label: 'Idea Researcher', icon: Lightbulb },
  { key: 'seo', label: 'SEO Dashboard', icon: Search },
  { key: 'campaigns', label: 'Campaigns', icon: Target },
  { key: 'social-analytics', label: 'Social Analytics', icon: BarChart3 },
  { key: 'leads', label: 'Leads & Revenue', icon: Users },
  { key: 'budget', label: 'Budget Planner', icon: Wallet },
  { key: 'competitors', label: 'Competitor Analysis', icon: Swords },
  { key: 'email', label: 'Email Campaigns', icon: Mail },
  { key: 'reports', label: 'Reports', icon: FileBarChart },
  { key: 'ab-testing', label: 'A/B Testing', icon: FlaskConical },
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
}: {
  activeTab: TabKey;
  onTabChange: (key: TabKey) => void;
  collapsed: boolean;
}) {
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

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-0.5 px-3">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            const showDivider = idx === 9; // Divider before Budget/Competitor/Email/Reports/A-B Testing

            if (collapsed) {
              return (
                <TooltipProvider key={item.key} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onTabChange(item.key)}
                        className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 mx-auto nav-item-hover focus-ring-gold ${
                          isActive
                            ? 'bg-[#D4A843]/15 text-[#D4A843] sidebar-glow-active'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                        }`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full gold-gradient" />
                        )}
                        <Icon className="h-[18px] w-[18px]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-card border-border text-foreground">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            }

            return (
              <div key={item.key}>
                {showDivider && (
                  <div className="gold-divider my-2.5" />
                )}
                <button
                  onClick={() => onTabChange(item.key)}
                  className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full focus-ring-gold ${
                    isActive
                      ? 'bg-[#D4A843]/10 text-[#D4A843] sidebar-glow-active'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full gold-gradient" />
                  )}
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              </div>
            );
          })}
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

      {/* User Section */}
      <div className="relative border-t border-border/30 p-3">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-[#D4A843]/15 via-[#D4A843]/8 to-transparent" />
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 transition-all duration-200 cursor-pointer group">
            <Avatar className="h-8 w-8 border border-[#D4A843]/30 group-hover:border-[#D4A843]/50 transition-colors">
              <AvatarFallback className="bg-[#D4A843]/20 text-[#D4A843] text-xs font-bold">LT</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Laxree Team</p>
              <p className="text-[11px] text-muted-foreground/70 truncate">Marketing Manager</p>
            </div>
            <div className="h-2 w-2 rounded-full bg-[#D4A843]/50 group-hover:bg-[#D4A843] transition-colors" />
          </div>
        ) : (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                  <Avatar className="h-8 w-8 border border-[#D4A843]/30 cursor-pointer hover:border-[#D4A843]/50 transition-colors">
                    <AvatarFallback className="bg-[#D4A843]/20 text-[#D4A843] text-xs font-bold">LT</AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-card border-border text-foreground">
                Laxree Team
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
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fabOpen, setFabOpen] = useState(false);

  const activeNavItem = navItems.find((n) => n.key === activeTab);

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
      case 'budget': return <BudgetTab />;
      case 'competitors': return <CompetitorTab />;
      case 'email': return <EmailTab />;
      case 'ab-testing': return <AbTestingTab />;
      case 'reports': return <ReportsTab />;
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
          onTabChange={setActiveTab}
          collapsed={sidebarCollapsed}
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

      {/* Mobile Sidebar */}
      <Sheet>
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
            onTabChange={(key) => {
              setActiveTab(key);
            }}
            collapsed={false}
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
            {/* Search */}
            {searchOpen ? (
              <div className="flex items-center gap-2 bg-[#111] border border-[#D4A843]/30 rounded-lg px-3 py-1.5 animate-in fade-in duration-200">
                <SearchIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-40 sm:w-56"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-[#D4A843] h-8 w-8"
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon className="h-4 w-4" />
              </Button>
            )}

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

            <Separator orientation="vertical" className="h-5 bg-border/50 mx-1" />

            {/* User Avatar (mobile) */}
            <Avatar className="h-7 w-7 border border-[#D4A843]/20 lg:hidden">
              <AvatarFallback className="bg-[#D4A843]/15 text-[#D4A843] text-[10px] font-bold">LT</AvatarFallback>
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
    </div>
  );
}