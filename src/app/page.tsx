'use client';

import React from 'react';
import { AppShell } from '@/components/app-shell';
import { useAppStore } from '@/lib/store';
import { LoginPage } from '@/components/auth/login-page';
import { RoleBasedDashboardView } from '@/components/role-based-dashboard';
import { CoreHRView as CoreHrView } from '@/components/core-hr-view';
import { EnhancedRecruitmentView } from '@/components/recruitment/enhanced-recruitment';
import { AttendanceView } from '@/components/attendance-view';
import { PayrollView } from '@/components/payroll-view';
import { PerformanceView } from '@/components/performance-view';
import { OnboardingView } from '@/components/onboarding-view';
import { EngagementView } from '@/components/engagement-view';
import { AnalyticsView } from '@/components/analytics-view';
import { AIAssistantView as AiAssistantView } from '@/components/ai-assistant-view';
import { ComplianceDashboard } from '@/components/compliance/compliance-dashboard';
import { ApplicantDashboard } from '@/components/applicant-dashboard';

const viewMap: Record<string, React.ComponentType> = {
  dashboard: RoleBasedDashboardView,
  'core-hr': CoreHrView,
  recruitment: EnhancedRecruitmentView,
  attendance: AttendanceView,
  payroll: PayrollView,
  performance: PerformanceView,
  onboarding: OnboardingView,
  engagement: EngagementView,
  analytics: AnalyticsView,
  'ai-assistant': AiAssistantView,
  compliance: ComplianceDashboard,
};

export default function HomePage() {
  const { isAuthenticated, currentView, userRole } = useAppStore();

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Applicants get their own dedicated dashboard for all views
  if (userRole === 'applicant') {
    const applicantViewMap: Record<string, React.ComponentType> = {
      dashboard: ApplicantDashboard,
      recruitment: ApplicantDashboard, // Applicants see their application tracker
      'ai-assistant': AiAssistantView,
      compliance: ComplianceDashboard,
    };
    const ViewComponent = applicantViewMap[currentView] || ApplicantDashboard;
    return (
      <AppShell>
        <ViewComponent />
      </AppShell>
    );
  }

  // Internal users (hr_admin, manager, employee, recruiter)
  const ViewComponent = viewMap[currentView] || RoleBasedDashboardView;
  return (
    <AppShell>
      <ViewComponent />
    </AppShell>
  );
}
