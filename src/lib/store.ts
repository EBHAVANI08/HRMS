import { create } from "zustand";

export interface User {
  name: string;
  role: string;
  avatar: string;
  email: string;
}

export type CoreHrTab = "employees" | "orgchart" | "directory";

export interface AppState {
  currentView: string;
  sidebarCollapsed: boolean;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  tenant: string;
  user: User;
  notifications: number;

  // Core HR
  selectedEmployeeId: string | null;
  coreHrTab: CoreHrTab;

  setCurrentView: (view: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setTenant: (tenant: string) => void;
  setNotifications: (count: number) => void;

  // Core HR actions
  setSelectedEmployeeId: (id: string | null) => void;
  setCoreHrTab: (tab: CoreHrTab) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: "dashboard",
  sidebarCollapsed: false,
  searchOpen: false,
  mobileMenuOpen: false,
  tenant: "saptta Inc.",
  user: {
    name: "Priya Sharma",
    role: "HR Director",
    avatar: "",
    email: "priya@saptta.io",
  },
  notifications: 5,

  // Core HR
  selectedEmployeeId: null,
  coreHrTab: "employees",

  setCurrentView: (view) => set({ currentView: view, selectedEmployeeId: null }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setTenant: (tenant) => set({ tenant }),
  setNotifications: (count) => set({ notifications: count }),

  // Core HR actions
  setSelectedEmployeeId: (id) => set({ selectedEmployeeId: id }),
  setCoreHrTab: (tab) => set({ coreHrTab: tab }),
}));
