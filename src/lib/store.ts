import { create } from "zustand";

export interface User {
  id?: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  department?: string;
  designation?: string;
  phone?: string;
}

export type CoreHrTab = "employees" | "orgchart" | "directory";
export type UserRole = "hr_admin" | "manager" | "employee" | "recruiter" | "applicant";

export interface Notification {
  id: string;
  type: "high_score_candidate" | "interview_reminder" | "offer_update" | "leave_request" | "system" | "candidate_applied" | "application_status" | "interview_scheduled";
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

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  status: "applied" | "screening" | "interview" | "offered" | "rejected" | "withdrawn";
  matchScore?: number;
  appliedAt: string;
  lastUpdatedAt: string;
  notes?: string;
}

export interface AppState {
  // Auth
  isAuthenticated: boolean;
  isLoading: boolean;

  // Navigation
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

  // Applicant
  jobApplications: JobApplication[];

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setIsLoading: (loading: boolean) => void;

  // Navigation actions
  setCurrentView: (view: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setTenant: (tenant: string) => void;
  setNotifications: (count: number) => void;
  setUserRole: (role: UserRole) => void;
  updateUser: (updates: Partial<User>) => void;

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

  // Applicant actions
  addJobApplication: (application: Omit<JobApplication, "id">) => void;
  updateApplicationStatus: (id: string, status: JobApplication["status"]) => void;
}

const roleConfig: Record<UserRole, Partial<User>> = {
  hr_admin: { name: "Priya Sharma", role: "HR Director", email: "priya@kamglobal.io", department: "Human Resources", designation: "HR Director" },
  manager: { name: "Rajesh Kumar", role: "Engineering Manager", email: "rajesh@kamglobal.io", department: "Engineering", designation: "Engineering Manager" },
  employee: { name: "Anita Deshmukh", role: "Software Engineer", email: "anita@kamglobal.io", department: "Engineering", designation: "Software Engineer" },
  recruiter: { name: "Kavitha Reddy", role: "Senior Recruiter", email: "kavitha@kamglobal.io", department: "Human Resources", designation: "Senior Recruiter" },
  applicant: { name: "Arun Venkatesh", role: "Job Applicant", email: "arun@gmail.com", designation: "Frontend Developer" },
};

const applicantNotifications: Notification[] = [
  {
    id: "an1",
    type: "application_status",
    title: "Application Under Review",
    message: "Your application for Senior Frontend Developer at Kam Global is being reviewed by the hiring team.",
    timestamp: "2 hrs ago",
    read: false,
    jobId: "j1",
    jobTitle: "Senior Frontend Developer",
  },
  {
    id: "an2",
    type: "interview_scheduled",
    title: "Interview Scheduled",
    message: "Congratulations! You've been shortlisted for a technical interview for the React Developer position at Acme Corp.",
    timestamp: "1 day ago",
    read: false,
    jobId: "j3",
    jobTitle: "React Developer",
  },
  {
    id: "an3",
    type: "application_status",
    title: "Application Received",
    message: "Your application for Full Stack Engineer at Stellar Labs has been received and is being processed.",
    timestamp: "3 days ago",
    read: true,
    jobId: "j5",
    jobTitle: "Full Stack Engineer",
  },
];

const sampleApplications: JobApplication[] = [
  {
    id: "app1",
    jobTitle: "Senior Frontend Developer",
    company: "Kam Global",
    status: "screening",
    matchScore: 88,
    appliedAt: "2025-05-28",
    lastUpdatedAt: "2025-06-03",
    notes: "Resume matched 88% with JD keywords. Under review by HR.",
  },
  {
    id: "app2",
    jobTitle: "React Developer",
    company: "Acme Corp",
    status: "interview",
    matchScore: 92,
    appliedAt: "2025-05-20",
    lastUpdatedAt: "2025-06-04",
    notes: "Technical interview scheduled for Jun 6 at 10:00 AM.",
  },
  {
    id: "app3",
    jobTitle: "Full Stack Engineer",
    company: "Stellar Labs",
    status: "applied",
    matchScore: 76,
    appliedAt: "2025-06-01",
    lastUpdatedAt: "2025-06-01",
  },
  {
    id: "app4",
    jobTitle: "UI/UX Developer",
    company: "DesignHub Pvt Ltd",
    status: "rejected",
    matchScore: 54,
    appliedAt: "2025-05-10",
    lastUpdatedAt: "2025-05-25",
    notes: "Position filled with another candidate.",
  },
  {
    id: "app5",
    jobTitle: "Frontend Lead",
    company: "TechNova Solutions",
    status: "offered",
    matchScore: 95,
    appliedAt: "2025-04-15",
    lastUpdatedAt: "2025-06-02",
    notes: "Offer letter sent. Awaiting response.",
  },
  {
    id: "app6",
    jobTitle: "Angular Developer",
    company: "DataSys Inc.",
    status: "withdrawn",
    matchScore: 68,
    appliedAt: "2025-04-28",
    lastUpdatedAt: "2025-05-15",
    notes: "Withdrawn by candidate.",
  },
];

// Demo users for login (in production, this would hit the API)
const demoUsers: Record<string, { password: string; role: UserRole; user: Partial<User> }> = {
  "priya@kamglobal.io": { password: "admin123", role: "hr_admin", user: roleConfig.hr_admin },
  "rajesh@kamglobal.io": { password: "manager123", role: "manager", user: roleConfig.manager },
  "anita@kamglobal.io": { password: "employee123", role: "employee", user: roleConfig.employee },
  "kavitha@kamglobal.io": { password: "recruiter123", role: "recruiter", user: roleConfig.recruiter },
  "arun@gmail.com": { password: "applicant123", role: "applicant", user: roleConfig.applicant },
};

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  isAuthenticated: false,
  isLoading: false,

  // Navigation
  currentView: "dashboard",
  sidebarCollapsed: false,
  searchOpen: false,
  mobileMenuOpen: false,
  tenant: "Kam Global",
  user: {
    name: "Priya Sharma",
    role: "HR Director",
    avatar: "",
    email: "priya@kamglobal.io",
    department: "Human Resources",
    designation: "HR Director",
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

  // Applicant
  jobApplications: sampleApplications,

  // Auth actions
  login: async (email: string, password: string) => {
    set({ isLoading: true });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const demoUser = demoUsers[email];
    if (demoUser && demoUser.password === password) {
      const isApplicant = demoUser.role === "applicant";
      const newState: Partial<AppState> = {
        isAuthenticated: true,
        isLoading: false,
        userRole: demoUser.role,
        user: {
          id: `user_${demoUser.role}`,
          name: demoUser.user.name || "",
          role: demoUser.user.role || "",
          avatar: "",
          email,
          department: demoUser.user.department,
          designation: demoUser.user.designation,
        },
        currentView: "dashboard",
        notifications: isApplicant ? 2 : 5,
        notificationList: isApplicant ? applicantNotifications : get().notificationList,
      };
      set(newState);
      return true;
    }

    set({ isLoading: false });
    return false;
  },

  logout: () => {
    set({
      isAuthenticated: false,
      isLoading: false,
      currentView: "dashboard",
      sidebarCollapsed: false,
      selectedEmployeeId: null,
      selectedJobId: null,
    });
  },

  setIsLoading: (loading: boolean) => set({ isLoading: loading }),

  // Navigation actions
  setCurrentView: (view) => set({ currentView: view, selectedEmployeeId: null }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setTenant: (tenant) => set({ tenant }),
  setNotifications: (count) => set({ notifications: count }),
  updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
  setUserRole: (role) => set((state) => {
    const isApplicant = role === "applicant";
    return {
      userRole: role,
      user: { ...state.user, ...roleConfig[role] },
      currentView: "dashboard",
      notifications: isApplicant ? 2 : state.notifications,
      notificationList: isApplicant ? applicantNotifications : state.notificationList,
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

  // Applicant actions
  addJobApplication: (application) => set((state) => ({
    jobApplications: [
      { ...application, id: `app_${Date.now()}` },
      ...state.jobApplications,
    ],
  })),
  updateApplicationStatus: (id, status) => set((state) => ({
    jobApplications: state.jobApplications.map(app =>
      app.id === id ? { ...app, status, lastUpdatedAt: new Date().toISOString().split("T")[0] } : app
    ),
  })),
}));
