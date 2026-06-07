"use client";

import * as React from "react";
import Image from "next/image";
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
  Mail,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Calendar,
  ArrowRight,
  Star,
  Eye,
  Shield,
  FileText,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import type { UserRole } from "@/lib/store";

export type NavItemConfig = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  roleLabels?: Partial<Record<UserRole, string>>;
};

export const allNavItems: NavItemConfig[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["hr_admin", "manager", "employee", "recruiter", "applicant"], roleLabels: { applicant: "My Dashboard" } },
  { id: "core-hr", label: "Core HR", icon: Users, roles: ["hr_admin"] },
  { id: "recruitment", label: "Recruitment", icon: Briefcase, roles: ["hr_admin", "recruiter", "manager", "applicant"], roleLabels: { applicant: "My Applications", recruiter: "ATS & Recruitment" } },
  { id: "attendance", label: "Attendance & Leave", icon: Clock, roles: ["hr_admin", "manager", "employee"], roleLabels: { employee: "My Attendance" } },
  { id: "payroll", label: "Payroll", icon: Banknote, roles: ["hr_admin", "employee"], roleLabels: { employee: "My Payslips", hr_admin: "Payroll Management" } },
  { id: "performance", label: "Performance", icon: TrendingUp, roles: ["hr_admin", "manager", "employee"], roleLabels: { employee: "My Performance", manager: "Team Performance" } },
  { id: "onboarding", label: "Onboarding", icon: UserPlus, roles: ["hr_admin", "manager"] },
  { id: "engagement", label: "Engagement", icon: Heart, roles: ["hr_admin", "manager"], roleLabels: { manager: "Team Engagement" } },
  { id: "analytics", label: "Analytics", icon: BarChart3, roles: ["hr_admin", "manager", "recruiter"], roleLabels: { recruiter: "Recruiting Analytics" } },
  { id: "compliance", label: "Compliance", icon: Shield, roles: ["hr_admin", "recruiter", "applicant"] },
  { id: "ai-assistant", label: "AI Assistant", icon: Sparkles, roles: ["hr_admin", "manager", "employee", "recruiter", "applicant"], roleLabels: { applicant: "AI Career Coach" } },
];

const tenants = [
  "Kam Global",
  "Acme Corp",
  "Stellar Labs",
];

function getScoreColor(score: number): string {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#00509d";
  if (score >= 50) return "#fdc500";
  return "#ef4444";
}

function getNotifIcon(type: string) {
  switch (type) {
    case "high_score_candidate": return <Star className="size-3.5 text-[#fdc500]" />;
    case "interview_reminder": return <Calendar className="size-3.5 text-[#8b5cf6]" />;
    case "interview_scheduled": return <Calendar className="size-3.5 text-[#8b5cf6]" />;
    case "offer_update": return <CheckCircle2 className="size-3.5 text-[#22c55e]" />;
    case "candidate_applied": return <UserPlus className="size-3.5 text-[#3b82f6]" />;
    case "application_status": return <FileText className="size-3.5 text-[#3b82f6]" />;
    case "leave_request": return <Clock className="size-3.5 text-[#f59e0b]" />;
    default: return <AlertCircle className="size-3.5 text-[var(--saptta-mute)]" />;
  }
}

function KamLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center px-3 py-1">
      <AnimatePresence mode="wait" initial={false}>
        {collapsed ? (
          <motion.div
            key="icon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex size-9 shrink-0 items-center justify-center"
          >
            <Image
              src="/kam-logo.png"
              alt="Kam"
              width={36}
              height={36}
              className="object-contain"
              style={{ filter: "drop-shadow(0 1px 3px rgba(0,41,107,0.18))" }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Image
              src="/kam-logo.png"
              alt="Kam Global for Digital AI Media Solutions Pvt. Ltd."
              width={160}
              height={52}
              className="object-contain"
              style={{ filter: "drop-shadow(0 1px 3px rgba(0,41,107,0.12))" }}
            />
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
  item: NavItemConfig & { label: string };
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
  const { currentView, setCurrentView, userRole } = useAppStore();

  // Filter nav items based on user role & apply role-specific labels
  const navItems = allNavItems
    .filter((item) => item.roles.includes(userRole))
    .map((item) => ({
      ...item,
      label: item.roleLabels?.[userRole] || item.label,
    }));

  // Adjust sidebar AI assistant text based on role
  const aiText = userRole === "applicant" ? "AI Career Coach" : "AI Assistant";
  const aiDesc = userRole === "applicant" ? "Get interview tips, resume feedback, and career guidance from AI." : "Ask Kam AI anything about your HR data, policies, or analytics.";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-5">
        <KamLogo collapsed={collapsed} />
      </div>

      <Separator className="mx-4 w-auto" />

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

      <div className="p-3">
        {!collapsed && (
          <div className="rounded-xl bg-[var(--saptta-accent)]/5 border border-[var(--saptta-accent)]/10 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-4 text-[var(--saptta-accent)]" />
              <span className="text-xs font-semibold text-[var(--saptta-accent)]">
                {aiText}
              </span>
            </div>
            <p className="text-[11px] text-[var(--saptta-mute)] leading-relaxed">
              {aiDesc}
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

/* ──── Notification Panel ──── */

function NotificationPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { notificationList, markNotificationRead, markAllNotificationsRead, setCurrentView } = useAppStore();

  const NOTIF_ROUTES: Record<string, string> = {
    high_score_candidate: "recruitment",
    interview_reminder: "recruitment",
    interview_scheduled: "recruitment",
    offer_update: "recruitment",
    candidate_applied: "recruitment",
    application_status: "recruitment",
    leave_request: "attendance",
  };

  function handleNotifClick(notif: typeof notificationList[0]) {
    markNotificationRead(notif.id);
    const route = NOTIF_ROUTES[notif.type];
    if (route) {
      setCurrentView(route);
      onOpenChange(false);
    }
  }
  const [emailDialogOpen, setEmailDialogOpen] = React.useState(false);
  const [selectedNotif, setSelectedNotif] = React.useState<typeof notificationList[0] | null>(null);

  const unread = notificationList.filter(n => !n.read);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg rounded-[24px] p-0">
          <DialogHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-[var(--saptta-ink)]">Notifications</DialogTitle>
              {unread.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[var(--saptta-accent)] h-7"
                  onClick={markAllNotificationsRead}
                >
                  Mark all read
                </Button>
              )}
            </div>
            <DialogDescription className="text-xs text-[var(--saptta-mute)]">
              {unread.length} unread notification{unread.length !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[500px]">
            <div className="px-5 pb-5 space-y-2">
              {notificationList.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="size-8 text-[var(--saptta-mute)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--saptta-mute)]">No notifications</p>
                </div>
              ) : (
                notificationList.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      rounded-xl p-3.5 transition-colors cursor-pointer
                      ${!notif.read ? 'bg-[var(--saptta-accent)]/5 border border-[var(--saptta-accent)]/10' : 'bg-[var(--saptta-bg-2)] border border-transparent'}
                    `}
                    onClick={() => handleNotifClick(notif)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {getNotifIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-tight ${!notif.read ? 'font-semibold text-[var(--saptta-ink)]' : 'text-[var(--saptta-ink-2)]'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <div className="size-2 rounded-full bg-[var(--saptta-accent)] shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--saptta-mute)] mt-1 leading-relaxed">
                          {notif.message}
                        </p>

                        {/* Score badge for high-score candidates */}
                        {notif.score && (
                          <div className="mt-2 flex items-center gap-2">
                            <Badge
                              className="rounded-full text-[10px] font-bold border-0 px-2.5"
                              style={{
                                backgroundColor: `${getScoreColor(notif.score)}15`,
                                color: getScoreColor(notif.score),
                              }}
                            >
                              {notif.score}% Match
                            </Badge>
                            {notif.jobTitle && (
                              <span className="text-[10px] text-[var(--saptta-mute)]">
                                {notif.jobTitle}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action buttons for high-score candidates */}
                        {notif.type === "high_score_candidate" && notif.candidateName && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <Button
                              size="sm"
                              className="h-7 rounded-full text-[10px] bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90 px-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentView("recruitment");
                                onOpenChange(false);
                              }}
                            >
                              <Eye className="size-3 mr-1" />
                              View Profile
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 rounded-full text-[10px] border-[var(--saptta-line)] px-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNotif(notif);
                                setEmailDialogOpen(true);
                              }}
                            >
                              <Mail className="size-3 mr-1" />
                              Email Candidate
                            </Button>
                          </div>
                        )}

                        {/* Action buttons for applicant notifications */}
                        {(notif.type === "application_status" || notif.type === "interview_scheduled") && notif.jobTitle && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <Button
                              size="sm"
                              className="h-7 rounded-full text-[10px] bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90 px-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentView("recruitment");
                                onOpenChange(false);
                              }}
                            >
                              <Eye className="size-3 mr-1" />
                              View Application
                            </Button>
                            {notif.type === "interview_scheduled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 rounded-full text-[10px] border-[var(--saptta-line)] px-3"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentView("recruitment");
                                  onOpenChange(false);
                                }}
                              >
                                <Calendar className="size-3 mr-1" />
                                Prepare
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Timestamp */}
                        <p className="text-[10px] text-[var(--saptta-mute)] mt-2">{notif.timestamp}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Email Candidate Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[var(--saptta-ink)]">
              Email Candidate
            </DialogTitle>
            <DialogDescription className="text-sm text-[var(--saptta-mute)]">
              Send a shortlist notification to {selectedNotif?.candidateName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--saptta-ink-2)] mb-1 block">To</label>
              <Input
                className="rounded-xl border-[var(--saptta-line)] text-sm"
                value={selectedNotif?.candidateName ? `${selectedNotif.candidateName.toLowerCase().replace(/\s/g, '.')}@gmail.com` : ''}
                readOnly
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--saptta-ink-2)] mb-1 block">Subject</label>
              <Input
                className="rounded-xl border-[var(--saptta-line)] text-sm"
                value={selectedNotif?.jobTitle ? `Congratulations! You've been shortlisted for ${selectedNotif.jobTitle}` : ''}
                readOnly
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--saptta-ink-2)] mb-1 block">Message</label>
              <Textarea
                className="rounded-xl border-[var(--saptta-line)] text-sm min-h-[160px]"
                value={selectedNotif ? `Dear ${selectedNotif.candidateName},

We are pleased to inform you that your profile has been shortlisted for the position of ${selectedNotif.jobTitle || 'the open role'} at Kam Global.

Your application stood out with a strong match score, and we would like to invite you for the next round of our selection process.

Next Steps:
- Technical Discussion Round (Date to be confirmed)
- The interview will be conducted via Google Meet / In-person
- Duration: ~60 minutes

Please confirm your availability by replying to this email.

We look forward to speaking with you soon.

Best regards,
Kam Global HR Team` : ''}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-full border-[var(--saptta-line)]"
              onClick={() => setEmailDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full bg-[var(--saptta-accent)] text-white hover:bg-[var(--saptta-accent)]/90"
              onClick={() => {
                // In production, this would call the API to send the email
                setEmailDialogOpen(false);
              }}
            >
              <Mail className="size-4 mr-1.5" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ──── Main App Shell ──── */

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    currentView,
    setCurrentView,
    sidebarCollapsed,
    toggleSidebar,
    searchOpen,
    setSearchOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    user,
    userRole,
    tenant,
    setTenant,
    notifications,
    notificationList,
    logout,
  } = useAppStore();

  const [notifPanelOpen, setNotifPanelOpen] = React.useState(false);

  // Filter nav items based on role & apply role-specific labels
  const navItems = allNavItems
    .filter((item) => item.roles.includes(userRole))
    .map((item) => ({
      ...item,
      label: item.roleLabels?.[userRole] || item.label,
    }));

  const currentNavLabel =
    navItems.find((n) => n.id === currentView)?.label ?? "Dashboard";

  // Hide tenant switcher for applicants
  const showTenantSwitcher = userRole !== "applicant";

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
            <span className="text-[var(--saptta-mute)]">Kam</span>
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

            {/* Tenant Switcher - hidden for applicants */}
            {showTenantSwitcher && (
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
            )}

            {/* Notifications with Panel */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-xl hover:bg-[var(--saptta-bg-2)]"
                  onClick={() => setNotifPanelOpen(true)}
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
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => logout()}
                  className="cursor-pointer"
                >
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

      {/* ── Notification Panel ── */}
      <NotificationPanel open={notifPanelOpen} onOpenChange={setNotifPanelOpen} />
    </div>
  );
}
