import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 4/5ths Rule calculation
function calculateFourFifths(selectionRates: Record<string, number>): {
  impactRatios: Record<string, number>;
  passFourFifths: Record<string, boolean>;
  highestRate: number;
} {
  const rates = Object.values(selectionRates);
  const highestRate = Math.max(...rates);
  const impactRatios: Record<string, number> = {};
  const passFourFifths: Record<string, boolean> = {};

  for (const [group, rate] of Object.entries(selectionRates)) {
    impactRatios[group] = highestRate > 0 ? rate / highestRate : 0;
    passFourFifths[group] = impactRatios[group] >= 0.8;
  }

  return { impactRatios, passFourFifths, highestRate };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode } = body;

    // ─── Run 4/5ths Rule Test ───
    if (mode === 'four-fifths-test') {
      const { demographicData } = body;
      // demographicData: { group: string, category: string, total: number, selected: number }[]

      const results = [];
      const groups: Record<string, Record<string, { total: number; selected: number }>> = {};

      for (const item of demographicData) {
        if (!groups[item.group]) groups[item.group] = {};
        groups[item.group][item.category] = { total: item.total, selected: item.selected };
      }

      const allBiasMetrics = [];

      for (const [groupName, categories] of Object.entries(groups)) {
        const selectionRates: Record<string, number> = {};
        for (const [cat, data] of Object.entries(categories)) {
          selectionRates[cat] = data.total > 0 ? data.selected / data.total : 0;
        }

        const { impactRatios, passFourFifths, highestRate } = calculateFourFifths(selectionRates);

        for (const [cat, data] of Object.entries(categories)) {
          const metric = {
            demographicGroup: groupName,
            category: cat,
            totalCandidates: data.total,
            selectedCount: data.selected,
            selectionRate: selectionRates[cat],
            impactRatio: impactRatios[cat],
            passFourFifths: passFourFifths[cat],
            remediationNeeded: !passFourFifths[cat],
            auditPeriod: body.auditPeriod || new Date().getFullYear() + '-Q' + Math.ceil((new Date().getMonth() + 1) / 3),
          };

          results.push(metric);

          // Save to database
          allBiasMetrics.push(
            prisma.biasMetric.create({ data: metric })
          );
        }
      }

      await Promise.all(allBiasMetrics);

      return NextResponse.json({
        success: true,
        testDate: new Date().toISOString(),
        results,
        overallCompliant: results.every(r => r.passFourFifths),
        summary: {
          totalGroups: Object.keys(groups).length,
          totalCategories: results.length,
          passingCategories: results.filter(r => r.passFourFifths).length,
          failingCategories: results.filter(r => !r.passFourFifths).length,
          remediationNeeded: results.some(r => r.remediationNeeded),
        },
      });
    }

    // ─── Ground-Truth Calibration ───
    if (mode === 'calibration') {
      const { calibrationData } = body;
      // calibrationData: { candidateId: string, candidateName: string, aiScore: number, humanScore: number }[]

      // Calculate Pearson correlation
      const n = calibrationData.length;
      const aiScores = calibrationData.map((d: { aiScore: number }) => d.aiScore);
      const humanScores = calibrationData.map((d: { humanScore: number }) => d.humanScore);

      const meanAi = aiScores.reduce((a: number, b: number) => a + b, 0) / n;
      const meanHuman = humanScores.reduce((a: number, b: number) => a + b, 0) / n;

      let numerator = 0;
      let denomAi = 0;
      let denomHuman = 0;

      for (let i = 0; i < n; i++) {
        const diffAi = aiScores[i] - meanAi;
        const diffHuman = humanScores[i] - meanHuman;
        numerator += diffAi * diffHuman;
        denomAi += diffAi * diffAi;
        denomHuman += diffHuman * diffHuman;
      }

      const correlation = (denomAi > 0 && denomHuman > 0)
        ? numerator / Math.sqrt(denomAi * denomHuman)
        : 0;

      // Calculate mean absolute error
      const mae = calibrationData.reduce((sum: number, d: { aiScore: number; humanScore: number }) =>
        sum + Math.abs(d.aiScore - d.humanScore), 0) / n;

      // Calculate agreement rate (within 0.5 points)
      const agreementRate = calibrationData.filter((d: { aiScore: number; humanScore: number }) =>
        Math.abs(d.aiScore - d.humanScore) <= 0.5).length / n;

      return NextResponse.json({
        success: true,
        calibrationDate: new Date().toISOString(),
        correlation: Math.round(correlation * 1000) / 1000,
        mae: Math.round(mae * 100) / 100,
        agreementRate: Math.round(agreementRate * 100),
        targetCorrelation: 0.85,
        meetsTarget: correlation >= 0.85,
        sampleSize: n,
        recommendations: correlation < 0.85 ? [
          'Consider adjusting dimension weights',
          'Review semantic adjacency mappings',
          'Increase evidence confidence thresholds',
          'Run manual review of outlier candidates',
        ] : ['Current calibration meets the 0.85 correlation target.'],
        data: calibrationData.map((d: { candidateId: string; candidateName: string; aiScore: number; humanScore: number }) => ({
          ...d,
          delta: Math.round((d.aiScore - d.humanScore) * 100) / 100,
          withinThreshold: Math.abs(d.aiScore - d.humanScore) <= 0.5,
        })),
      });
    }

    // ─── Data Retention Cleanup ───
    if (mode === 'retention-cleanup') {
      const now = new Date();

      // Find expired candidate scores
      const expiredScores = await prisma.candidateScore.findMany({
        where: { deletionDate: { lte: now } },
      });

      // In production, this would anonymize or delete the data
      // For now, we just mark it
      const results = expiredScores.map(s => ({
        candidateId: s.candidateId,
        candidateName: s.candidateName,
        deletionDate: s.deletionDate,
        action: 'would_be_anonymized',
      }));

      return NextResponse.json({
        success: true,
        cleanupDate: now.toISOString(),
        expiredRecords: expiredScores.length,
        results,
      });
    }

    // ─── Schedule Compliance Assessment ───
    if (mode === 'schedule-assessment') {
      const { framework, nextAssessmentDate, assessorName } = body;

      const assessment = await prisma.complianceAssessment.create({
        data: {
          framework,
          status: 'partially_compliant',
          nextAssessment: new Date(nextAssessmentDate),
          findings: JSON.stringify({ scheduled: true }),
          assessorName: assessorName || 'Pending Assignment',
          version: '1.0.0',
        },
      });

      return NextResponse.json({
        success: true,
        assessmentId: assessment.id,
        scheduledDate: nextAssessmentDate,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid mode. Use "four-fifths-test", "calibration", "retention-cleanup", or "schedule-assessment"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Bias audit error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process bias audit request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    // ─── Get Bias Metrics ───
    if (mode === 'metrics') {
      const auditPeriod = searchParams.get('auditPeriod');
      const where: Record<string, string> = {};
      if (auditPeriod) where.auditPeriod = auditPeriod;

      const metrics = await prisma.biasMetric.findMany({
        where,
        orderBy: { auditDate: 'desc' },
      });

      return NextResponse.json({ success: true, metrics });
    }

    // ─── Get Compliance Assessments ───
    if (mode === 'assessments') {
      const framework = searchParams.get('framework');
      const where: Record<string, string> = {};
      if (framework) where.framework = framework;

      const assessments = await prisma.complianceAssessment.findMany({
        where,
        orderBy: { assessmentDate: 'desc' },
      });

      return NextResponse.json({ success: true, assessments });
    }

    // ─── Get Retention Policies ───
    if (mode === 'retention-policies') {
      const policies = await prisma.dataRetentionPolicy.findMany();
      return NextResponse.json({ success: true, policies });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid mode. Use "metrics", "assessments", or "retention-policies"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Bias audit GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve bias audit data' },
      { status: 500 }
    );
  }
}
