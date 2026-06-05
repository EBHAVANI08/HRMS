import { create } from "zustand";

export interface User {
  name: string;
  role: string;
  avatar: string;
  email: string;
}

export type CoreHrTab = "employees" | "orgchart" | "directory";
export type UserRole = "hr_admin" | "manager" | "employee" | "recruiter";

export interface Notification {
  id: string;
  type: "high_score_candidate" | "interview_reminder" | "offer_update" | "leave_request" | "system" | "candidate_applied";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  candidateId?: string;
  candidateName?: string;
  score?: number;
  jobId?: string;
  jobTitle?: string;
}

export interface AppState {
  currentView: string;
  sidebarCollapsed: boolean;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  tenant: string;
  user: User;
  userRole: UserRole;
  notifications: number;
  notificationList: Notification[];

  // Core HR
  selectedEmployeeId: string | null;
  coreHrTab: CoreHrTab;

  // Recruitment
  selectedJobId: string | null;
  recruitmentTab: "pipeline" | "candidates" | "jobs" | "ai-tools" | "resume-analyzer";
  shortlistThreshold: number;

  setCurrentView: (view: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setTenant: (tenant: string) => void;
  setNotifications: (count: number) => void;
  setUserRole: (role: UserRole) => void;

  // Notifications
  addNotification: (notification: Omit<Notification, "id" | "read">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Core HR actions
  setSelectedEmployeeId: (id: string | null) => void;
  setCoreHrTab: (tab: CoreHrTab) => void;

  // Recruitment actions
  setSelectedJobId: (id: string | null) => void;
  setRecruitmentTab: (tab: AppState["recruitmentTab"]) => void;
  setShortlistThreshold: (threshold: number) => void;
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
  userRole: "hr_admin",
  notifications: 5,
  notificationList: [
    {
      id: "n1",
      type: "high_score_candidate",
      title: "High-Scoring Candidate Detected",
      message: "Ananya Krishnan scored 92% match for Senior Frontend Developer. Shortlisted for next round?",
      timestamp: "2 min ago",
      read: false,
      candidateId: "c1",
      candidateName: "Ananya Krishnan",
      score: 92,
      jobId: "j1",
      jobTitle: "Senior Frontend Developer",
    },
    {
      id: "n2",
      type: "interview_reminder",
      title: "Interview Scheduled",
      message: "Rohan Patel's technical interview is tomorrow at 10:00 AM",
      timestamp: "1 hr ago",
      read: false,
      candidateId: "c2",
      candidateName: "Rohan Patel",
    },
    {
      id: "n3",
      type: "candidate_applied",
      title: "New Application",
      message: "Deepika Rao applied for Product Designer role via Naukri",
      timestamp: "3 hrs ago",
      read: false,
      candidateId: "c9",
      candidateName: "Deepika Rao",
      jobId: "j2",
      jobTitle: "Product Designer",
    },
    {
      id: "n4",
      type: "offer_update",
      title: "Offer Accepted",
      message: "Sneha Iyer has accepted the Sales Manager offer letter",
      timestamp: "5 hrs ago",
      read: true,
      candidateId: "c5",
      candidateName: "Sneha Iyer",
    },
    {
      id: "n5",
      type: "leave_request",
      title: "Leave Request",
      message: "Arjun Mehta requested 3 days leave starting March 1",
      timestamp: "1 day ago",
      read: true,
    },
  ],

  // Core HR
  selectedEmployeeId: null,
  coreHrTab: "employees",

  // Recruitment
  selectedJobId: null,
  recruitmentTab: "pipeline",
  shortlistThreshold: 75,

  setCurrentView: (view) => set({ currentView: view, selectedEmployeeId: null }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setTenant: (tenant) => set({ tenant }),
  setNotifications: (count) => set({ notifications: count }),
  setUserRole: (role) => set((state) => {
    const roleConfig: Record<UserRole, Partial<User>> = {
      hr_admin: { name: "Priya Sharma", role: "HR Director", email: "priya@saptta.io" },
      manager: { name: "Rajesh Kumar", role: "Engineering Manager", email: "rajesh@saptta.io" },
      employee: { name: "Anita Deshmukh", role: "Software Engineer", email: "anita@saptta.io" },
      recruiter: { name: "Kavitha Reddy", role: "Senior Recruiter", email: "kavitha@saptta.io" },
    };
    return {
      userRole: role,
      user: { ...state.user, ...roleConfig[role] },
    };
  }),

  // Notifications
  addNotification: (notification) => set((state) => ({
    notifications: state.notifications + 1,
    notificationList: [
      { ...notification, id: `n${Date.now()}`, read: false },
      ...state.notificationList,
    ],
  })),
  markNotificationRead: (id) => set((state) => ({
    notifications: Math.max(0, state.notifications - 1),
    notificationList: state.notificationList.map(n =>
      n.id === id ? { ...n, read: true } : n
    ),
  })),
  markAllNotificationsRead: () => set((state) => ({
    notifications: 0,
    notificationList: state.notificationList.map(n => ({ ...n, read: true })),
  })),
  clearNotifications: () => set({ notifications: 0, notificationList: [] }),

  // Core HR actions
  setSelectedEmployeeId: (id) => set({ selectedEmployeeId: id }),
  setCoreHrTab: (tab) => set({ coreHrTab: tab }),

  // Recruitment actions
  setSelectedJobId: (id) => set({ selectedJobId: id }),
  setRecruitmentTab: (tab) => set({ recruitmentTab: tab }),
  setShortlistThreshold: (threshold) => set({ shortlistThreshold: threshold }),
}));
