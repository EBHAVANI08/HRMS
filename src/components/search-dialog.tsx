"use client";

import * as React from "react";
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
  FileText,
  Settings,
  Calendar,
  ArrowRight,
  Shield,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAppStore } from "@/lib/store";
import type { UserRole } from "@/lib/store";

interface ModuleConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  roleLabels?: Partial<Record<UserRole, string>>;
}

const modules: ModuleConfig[] = [
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

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  module: string;
  roles: UserRole[];
}

const quickActions: QuickAction[] = [
  { id: "new-employee", label: "Add New Employee", icon: UserPlus, module: "core-hr", roles: ["hr_admin"] },
  { id: "new-job", label: "Create Job Posting", icon: Briefcase, module: "recruitment", roles: ["hr_admin", "recruiter"] },
  { id: "run-payroll", label: "Run Payroll", icon: Banknote, module: "payroll", roles: ["hr_admin"] },
  { id: "leave-request", label: "Request Leave", icon: Calendar, module: "attendance", roles: ["hr_admin", "manager", "employee"] },
  { id: "performance-review", label: "Start Performance Review", icon: TrendingUp, module: "performance", roles: ["hr_admin", "manager"] },
  { id: "view-applications", label: "View My Applications", icon: Briefcase, module: "recruitment", roles: ["applicant"] },
  { id: "interview-prep", label: "Interview Prep with AI", icon: Sparkles, module: "ai-assistant", roles: ["applicant"] },
];

interface RecentItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  module: string;
  roles: UserRole[];
}

const recentItems: RecentItem[] = [
  { id: "emp-001", label: "Ananya Iyer — Software Engineer", icon: Users, module: "core-hr", roles: ["hr_admin"] },
  { id: "job-fe", label: "Frontend Developer — Mumbai", icon: Briefcase, module: "recruitment", roles: ["hr_admin", "recruiter", "manager"] },
  { id: "payroll-mar", label: "March 2025 Payroll Run", icon: Banknote, module: "payroll", roles: ["hr_admin"] },
  { id: "policy-doc", label: "Leave Policy v3.2", icon: FileText, module: "core-hr", roles: ["hr_admin"] },
  { id: "my-leave", label: "My Leave Balance", icon: Calendar, module: "attendance", roles: ["employee", "manager"] },
  { id: "my-payslip", label: "Latest Payslip", icon: Banknote, module: "payroll", roles: ["employee"] },
  { id: "app-status", label: "Application Status Update", icon: Briefcase, module: "recruitment", roles: ["applicant"] },
];

export function SearchDialog() {
  const { searchOpen, setSearchOpen, setCurrentView, userRole } = useAppStore();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [searchOpen, setSearchOpen]);

  const runAction = (moduleId: string) => {
    setCurrentView(moduleId);
    setSearchOpen(false);
  };

  // Filter all items by current user role
  const filteredModules = modules
    .filter((mod) => mod.roles.includes(userRole))
    .map((mod) => ({
      ...mod,
      label: mod.roleLabels?.[userRole] || mod.label,
    }));

  const filteredActions = quickActions.filter((action) =>
    action.roles.includes(userRole)
  );

  const filteredRecent = recentItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <CommandDialog
      open={searchOpen}
      onOpenChange={setSearchOpen}
      title="Kam Command Palette"
      description="Search modules, actions, and recent items"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Modules">
          {filteredModules.map((mod) => (
            <CommandItem
              key={mod.id}
              onSelect={() => runAction(mod.id)}
              className="cursor-pointer"
            >
              <mod.icon className="size-4 text-[var(--saptta-accent)]" />
              <span>{mod.label}</span>
              <ArrowRight className="ml-auto size-3 opacity-40" />
            </CommandItem>
          ))}
        </CommandGroup>

        {filteredActions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Quick Actions">
              {filteredActions.map((action) => (
                <CommandItem
                  key={action.id}
                  onSelect={() => runAction(action.module)}
                  className="cursor-pointer"
                >
                  <action.icon className="size-4 text-[var(--saptta-accent-2)]" />
                  <span>{action.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredRecent.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent">
              {filteredRecent.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => runAction(item.module)}
                  className="cursor-pointer"
                >
                  <item.icon className="size-4 text-[var(--saptta-mute)]" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => runAction("dashboard")}
            className="cursor-pointer"
          >
            <Settings className="size-4" />
            <span>Preferences</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
