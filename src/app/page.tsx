'use client';

import React from 'react';
import { AppShell } from '@/components/app-shell';
import { useAppStore } from '@/lib/store';
import { DashboardView } from '@/components/dashboard-view';
import { CoreHRView as CoreHrView } from '@/components/core-hr-view';
import { RecruitmentView } from '@/components/recruitment-view';
import { AttendanceView } from '@/components/attendance-view';
import { PayrollView } from '@/components/payroll-view';
import { PerformanceView } from '@/components/performance-view';
import { OnboardingView } from '@/components/onboarding-view';
import { EngagementView } from '@/components/engagement-view';
import { AnalyticsView } from '@/components/analytics-view';
import { AIAssistantView as AiAssistantView } from '@/components/ai-assistant-view';

const viewMap: Record<string, React.ComponentType> = {
  dashboard: DashboardView,
  'core-hr': CoreHrView,
  recruitment: RecruitmentView,
  attendance: AttendanceView,
  payroll: PayrollView,
  performance: PerformanceView,
  onboarding: OnboardingView,
  engagement: EngagementView,
  analytics: AnalyticsView,
  'ai-assistant': AiAssistantView,
};

export default function HomePage() {
  const { currentView } = useAppStore();
  const ViewComponent = viewMap[currentView] || DashboardView;

  return (
    <AppShell>
      <ViewComponent />
    </AppShell>
  );
}
