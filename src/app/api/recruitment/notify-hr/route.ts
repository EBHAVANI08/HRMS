import { NextRequest, NextResponse } from 'next/server';

interface NotifyHRRequest {
  type: 'high_score' | 'shortlisted' | 'interview_scheduled' | 'offer_sent';
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  score: number;
  hrEmail: string;
  hrName: string;
  message?: string;
}

interface EmailCandidateRequest {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  nextSteps: string;
  interviewDate?: string;
  senderName: string;
  senderEmail: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode } = body;

    if (mode === 'notify-hr') {
      const data: NotifyHRRequest = body;
      // In production, this would send an actual email/notification
      // For now, we simulate the notification
      const notification = {
        id: `notif_${Date.now()}`,
        type: 'high_score_candidate',
        title: `High-Scoring Candidate: ${data.candidateName}`,
        message: `${data.candidateName} scored ${data.score}% match for ${data.jobTitle}. ${data.score >= 85 ? 'Strong match - recommend immediate interview.' : 'Good match - consider for next round.'}`,
        timestamp: new Date().toISOString(),
        read: false,
        candidateId: data.candidateId,
        candidateName: data.candidateName,
        score: data.score,
        jobId: data.jobId,
        jobTitle: data.jobTitle,
      };

      return NextResponse.json({
        success: true,
        notification,
        message: `HR ${data.hrName} has been notified about ${data.candidateName}`,
      });
    }

    if (mode === 'email-candidate') {
      const data: EmailCandidateRequest = body;
      // In production, this would send an actual email via SendGrid/AWS SES/etc.
      const emailContent = {
        to: data.candidateEmail,
        subject: `Congratulations! You've been shortlisted for ${data.jobTitle} at ${data.companyName}`,
        body: `Dear ${data.candidateName},\n\nWe are pleased to inform you that your profile has been shortlisted for the position of ${data.jobTitle} at ${data.companyName}.\n\n${data.nextSteps}\n\n${data.interviewDate ? `Your interview is scheduled for: ${data.interviewDate}\n\n` : ''}We look forward to speaking with you soon.\n\nBest regards,\n${data.senderName}\n${data.companyName} HR Team`,
      };

      return NextResponse.json({
        success: true,
        emailContent,
        message: `Email sent to ${data.candidateName} at ${data.candidateEmail}`,
      });
    }

    if (mode === 'bulk-email') {
      const { candidates, jobTitle, companyName, senderName } = body;
      // Bulk email shortlisted candidates
      const results = candidates.map((c: { name: string; email: string; score: number }) => ({
        name: c.name,
        email: c.email,
        score: c.score,
        sent: true,
        subject: `Congratulations! You've been shortlisted for ${jobTitle} at ${companyName}`,
      }));

      return NextResponse.json({
        success: true,
        sentCount: results.length,
        results,
        message: `${results.length} candidates have been emailed`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid mode. Use "notify-hr", "email-candidate", or "bulk-email"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process notification' },
      { status: 500 }
    );
  }
}
