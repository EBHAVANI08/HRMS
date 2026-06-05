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

const modules = [
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

const quickActions = [
  { id: "new-employee", label: "Add New Employee", icon: UserPlus, module: "core-hr" },
  { id: "new-job", label: "Create Job Posting", icon: Briefcase, module: "recruitment" },
  { id: "run-payroll", label: "Run Payroll", icon: Banknote, module: "payroll" },
  { id: "leave-request", label: "Request Leave", icon: Calendar, module: "attendance" },
  { id: "performance-review", label: "Start Performance Review", icon: TrendingUp, module: "performance" },
];

const recentItems = [
  { id: "emp-001", label: "Ananya Iyer — Software Engineer", icon: Users, module: "core-hr" },
  { id: "job-fe", label: "Frontend Developer — Mumbai", icon: Briefcase, module: "recruitment" },
  { id: "payroll-mar", label: "March 2025 Payroll Run", icon: Banknote, module: "payroll" },
  { id: "policy-doc", label: "Leave Policy v3.2", icon: FileText, module: "core-hr" },
];

export function SearchDialog() {
  const { searchOpen, setSearchOpen, setCurrentView } = useAppStore();

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

  return (
    <CommandDialog
      open={searchOpen}
      onOpenChange={setSearchOpen}
      title="saptta Command Palette"
      description="Search modules, actions, and recent items"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Modules">
          {modules.map((mod) => (
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

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => (
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

        <CommandSeparator />

        <CommandGroup heading="Recent">
          {recentItems.map((item) => (
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
