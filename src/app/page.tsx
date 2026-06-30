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
  Bell,
  Search as SearchIcon,
  X,
} from 'lucide-react';
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

type TabKey = 'overview' | 'calendar' | 'blogs' | 'social-planner' | 'ideas' | 'seo' | 'campaigns' | 'social-analytics' | 'leads';

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
      <div className="flex h-16 items-center gap-3 px-4 border-b border-border/50">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gold-gradient">
          <Gem className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold gold-gradient-text tracking-wide">LAXREE</h1>
            <p className="text-[9px] text-muted-foreground -mt-0.5 tracking-[0.2em] uppercase">Marketing Suite</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;

            if (collapsed) {
              return (
                <TooltipProvider key={item.key} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onTabChange(item.key)}
                        className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 mx-auto ${
                          isActive
                            ? 'bg-[#D4A843]/15 text-[#D4A843]'
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
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full ${
                  isActive
                    ? 'bg-[#D4A843]/10 text-[#D4A843]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full gold-gradient" />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t border-border/50 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 transition-colors cursor-pointer">
            <Avatar className="h-8 w-8 border border-[#D4A843]/30">
              <AvatarFallback className="bg-[#D4A843]/20 text-[#D4A843] text-xs font-bold">LT</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Laxree Team</p>
              <p className="text-[11px] text-muted-foreground truncate">Marketing Manager</p>
            </div>
          </div>
        ) : (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                  <Avatar className="h-8 w-8 border border-[#D4A843]/30 cursor-pointer">
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/50 bg-[#0a0a0a]/95 backdrop-blur-md px-4 lg:px-6 shrink-0">
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
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-[#D4A843] h-8 w-8"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#D4A843] ring-2 ring-[#0a0a0a]" />
            </Button>

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
          <footer className="border-t border-border/30 mt-8">
            <div className="mx-auto max-w-[1440px] flex h-10 items-center justify-between px-4 lg:px-6">
              <p className="text-[11px] text-muted-foreground">
                © {new Date().getFullYear()} Laxree Jewellery — Marketing Analytics Platform
              </p>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 dot-pulse" />
                <span className="text-[11px] text-muted-foreground">All systems operational</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}