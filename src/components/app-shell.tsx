"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Clock,
  Banknote,
  TrendingUp,
  UserPlus,
  Heart,
  BarChart3,
  Sparkles,
  Search,
  Bell,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Settings,
  User,
  Building2,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/lib/store";
import { SearchDialog } from "@/components/search-dialog";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "core-hr", label: "Core HR", icon: Users },
  { id: "recruitment", label: "Recruitment", icon: Briefcase },
  { id: "attendance", label: "Attendance & Leave", icon: Clock },
  { id: "payroll", label: "Payroll", icon: Banknote },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "onboarding", label: "Onboarding", icon: UserPlus },
  { id: "engagement", label: "Engagement", icon: Heart },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "ai-assistant", label: "AI Assistant", icon: Sparkles },
];

const tenants = [
  "saptta Inc.",
  "Acme Corp",
  "Stellar Labs",
];

function SapttaLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-1">
      <div className="relative flex size-9 shrink-0 items-center justify-center rounded-[16px] bg-[var(--saptta-accent)] text-white font-bold text-lg shadow-md">
        <span className="relative z-10" style={{ fontFamily: "var(--font-inter)" }}>
          s
        </span>
        <div className="absolute inset-0 rounded-[16px] bg-gradient-to-br from-[var(--saptta-accent)] to-[#e04a0c] opacity-100" />
        <span className="relative z-10 text-white font-bold text-lg">s</span>
      </div>
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 0.8, 0.22, 1] }}
            className="overflow-hidden whitespace-nowrap"
          >
            <span className="text-xl font-bold tracking-tight text-[var(--saptta-ink)]">
              saptta
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: (typeof navItems)[number];
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const isActive = active;

  const button = (
    <button
      onClick={onClick}
      className={`
        group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5
        text-sm font-medium transition-all duration-300
        ${
          isActive
            ? "bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)]"
            : "text-[var(--saptta-ink-2)] hover:bg-[var(--saptta-bg-2)] hover:text-[var(--saptta-ink)]"
        }
        ${collapsed ? "justify-center px-2" : ""}
      `}
      style={{
        borderLeft: isActive
          ? "3px solid var(--saptta-accent)"
          : "3px solid transparent",
      }}
    >
      <item.icon
        className={`size-5 shrink-0 transition-transform duration-300 ${
          isActive
            ? "text-[var(--saptta-accent)]"
            : "text-[var(--saptta-mute)] group-hover:text-[var(--saptta-ink)]"
        }`}
      />
      <AnimatePresence mode="wait">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 0.8, 0.22, 1] }}
            className="overflow-hidden whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={12}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const { currentView, setCurrentView } = useAppStore();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-5">
        <SapttaLogo collapsed={collapsed} />
      </div>

      <Separator className="mx-4 w-auto" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={currentView === item.id}
              collapsed={collapsed}
              onClick={() => setCurrentView(item.id)}
            />
          ))}
        </nav>
      </ScrollArea>

      <Separator className="mx-4 w-auto" />

      {/* Bottom section */}
      <div className="p-3">
        {!collapsed && (
          <div className="rounded-xl bg-[var(--saptta-accent)]/5 border border-[var(--saptta-accent)]/10 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-4 text-[var(--saptta-accent)]" />
              <span className="text-xs font-semibold text-[var(--saptta-accent)]">
                AI Assistant
              </span>
            </div>
            <p className="text-[11px] text-[var(--saptta-mute)] leading-relaxed">
              Ask saptta AI anything about your HR data, policies, or analytics.
            </p>
            <Button
              size="sm"
              className="mt-2 h-7 w-full rounded-lg bg-[var(--saptta-accent)] text-white text-xs hover:bg-[var(--saptta-accent)]/90"
              onClick={() => setCurrentView("ai-assistant")}
            >
              Open AI
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    currentView,
    sidebarCollapsed,
    toggleSidebar,
    searchOpen,
    setSearchOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    user,
    tenant,
    setTenant,
    notifications,
  } = useAppStore();

  const currentNavLabel =
    navItems.find((n) => n.id === currentView)?.label ?? "Dashboard";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* ── Desktop Sidebar ── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 72 : 280 }}
        transition={{ duration: 0.3, ease: [0.22, 0.8, 0.22, 1] }}
        className="hidden md:flex flex-col border-r border-[var(--saptta-line)] bg-background z-30"
      >
        <SidebarContent collapsed={sidebarCollapsed} />

        {/* Collapse toggle */}
        <div className="border-t border-[var(--saptta-line)] p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-full h-9 rounded-lg hover:bg-[var(--saptta-bg-2)]"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="size-4 text-[var(--saptta-mute)]" />
            ) : (
              <PanelLeftClose className="size-4 text-[var(--saptta-mute)]" />
            )}
          </Button>
        </div>
      </motion.aside>

      {/* ── Mobile Sidebar (Sheet) ── */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>

      {/* ── Main Area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── Top Bar ── */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[var(--saptta-line)] bg-background px-4 md:px-6 z-20">
          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--saptta-mute)]">saptta</span>
            <span className="text-[var(--saptta-mute)]">/</span>
            <span className="font-medium text-[var(--saptta-ink)]">
              {currentNavLabel}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1.5 md:gap-2">
            {/* Search trigger */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex h-9 items-center gap-2 rounded-xl border-[var(--saptta-line)] bg-[var(--saptta-bg-2)] text-[var(--saptta-mute)] hover:bg-[var(--saptta-bg-2)]/80 hover:text-[var(--saptta-ink)] px-3"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="size-4" />
                  <span className="text-xs">Search</span>
                  <kbd className="pointer-events-none ml-2 inline-flex h-5 select-none items-center gap-1 rounded border border-[var(--saptta-line)] bg-background px-1.5 font-mono text-[10px] font-medium text-[var(--saptta-mute)]">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search (⌘K)</TooltipContent>
            </Tooltip>

            {/* Mobile search */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-4 text-[var(--saptta-mute)]" />
            </Button>

            {/* Tenant Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden lg:flex h-9 items-center gap-1.5 rounded-xl border-[var(--saptta-line)] bg-[var(--saptta-bg-2)] text-[var(--saptta-ink-2)] hover:bg-[var(--saptta-bg-2)]/80 px-3"
                >
                  <Building2 className="size-3.5 text-[var(--saptta-mute)]" />
                  <span className="max-w-[120px] truncate text-xs font-medium">
                    {tenant}
                  </span>
                  <ChevronDown className="size-3 text-[var(--saptta-mute)]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Organizations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {tenants.map((t) => (
                  <DropdownMenuItem
                    key={t}
                    onClick={() => setTenant(t)}
                    className={t === tenant ? "bg-[var(--saptta-accent)]/5" : ""}
                  >
                    <Building2 className="size-4 mr-2 text-[var(--saptta-mute)]" />
                    <span className="text-sm">{t}</span>
                    {t === tenant && (
                      <span className="ml-auto size-2 rounded-full bg-[var(--saptta-accent)]" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-xl hover:bg-[var(--saptta-bg-2)]"
                >
                  <Bell className="size-4 text-[var(--saptta-mute)]" />
                  {notifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--saptta-accent)] text-[10px] font-bold text-white">
                      {notifications}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>

            {/* AI Assistant FAB (Topbar) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className="relative h-9 w-9 rounded-xl bg-[var(--saptta-accent)] text-white shadow-md hover:bg-[var(--saptta-accent)]/90 saptta-card-glow"
                  onClick={() => setCurrentView("ai-assistant")}
                >
                  <Sparkles className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI Assistant</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-1 h-6" />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-9 px-2 rounded-xl hover:bg-[var(--saptta-bg-2)]"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg bg-[var(--saptta-accent)]/10 text-[var(--saptta-accent)] text-xs font-semibold">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-xs font-medium text-[var(--saptta-ink)] leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-[var(--saptta-mute)] leading-tight">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="hidden md:block size-3 text-[var(--saptta-mute)]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-[var(--saptta-mute)]">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="size-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="size-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <LogOut className="size-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── Content Area ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 0.8, 0.22, 1] }}
            className="p-4 md:p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* ── Search Dialog ── */}
      <SearchDialog />
    </div>
  );
}
