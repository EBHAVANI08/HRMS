import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

function generateHash(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode } = body;

    // ─── Log Score Override ───
    if (mode === 'score-override') {
      const { userId, userName, candidateId, candidateName, jobId, jobTitle, dimension, itemId, originalScore, newScore, reason } = body;

      if (!reason || reason.trim().length < 10) {
        return NextResponse.json(
          { success: false, error: 'Mandatory reason text must be at least 10 characters. This is required for compliance.' },
          { status: 400 }
        );
      }

      if (originalScore === newScore) {
        return NextResponse.json(
          { success: false, error: 'New score must differ from original score.' },
          { status: 400 }
        );
      }

      // Create audit log entry
      const details = JSON.stringify({
        candidateId, candidateName, jobId, jobTitle,
        dimension, itemId, originalScore, newScore, reason,
      });

      // Get previous hash for chain
      const lastLog = await prisma.auditLog.findFirst({ orderBy: { timestamp: 'desc' } });
      const previousHash = lastLog?.hash || 'genesis';

      const hash = generateHash(`${Date.now()}-${userId}-${candidateId}-${originalScore}-${newScore}`);

      const auditLog = await prisma.auditLog.create({
        data: {
          action: 'score_override',
          actor: 'human',
          actorId: userId,
          actorName: userName,
          targetType: 'score',
          targetId: candidateId,
          details,
          hash,
          previousHash,
        },
      });

      // Create score override record
      const scoreOverride = await prisma.scoreOverride.create({
        data: {
          userId,
          userName,
          candidateId,
          candidateName,
          jobId,
          jobTitle,
          dimension,
          itemId,
          originalScore,
          newScore,
          reason: reason.trim(),
          auditLogId: auditLog.id,
        },
      });

      return NextResponse.json({
        success: true,
        auditLogId: auditLog.id,
        scoreOverrideId: scoreOverride.id,
        hash: auditLog.hash,
        message: `Score override logged: ${dimension}/${itemId} changed from ${originalScore} to ${newScore}`,
      });
    }

    // ─── Log Resume Analysis ───
    if (mode === 'resume-analyzed') {
      const { candidateId, candidateName, jobId, jobTitle, overallScore, proposedAction, userId } = body;

      const details = JSON.stringify({
        candidateId, candidateName, jobId, jobTitle,
        overallScore, proposedAction,
      });

      const lastLog = await prisma.auditLog.findFirst({ orderBy: { timestamp: 'desc' } });
      const previousHash = lastLog?.hash || 'genesis';
      const hash = generateHash(`analysis-${Date.now()}-${candidateId}-${jobId}`);

      const auditLog = await prisma.auditLog.create({
        data: {
          action: 'resume_analyzed',
          actor: 'system',
          actorId: userId || 'ai-engine',
          targetType: 'candidate',
          targetId: candidateId,
          details,
          hash,
          previousHash,
        },
      });

      // Also create/update CandidateScore
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 180);

      await prisma.candidateScore.upsert({
        where: { candidateId },
        create: {
          candidateId,
          candidateName,
          jobId,
          jobTitle,
          overallScore,
          skillsScore: body.skillsScore || 0,
          experienceScore: body.experienceScore || 0,
          educationScore: body.educationScore || 0,
          cultureScore: body.cultureScore || 0,
          confidence: body.confidence || 0,
          riskLevel: body.riskLevel || 'medium',
          proposedAction,
          humanConfirmed: false,
          blindScore: body.blindScore || null,
          biasAlert: body.biasAlert || false,
          analysisJson: body.analysisJson || '{}',
          resumeHash: body.resumeHash || generateHash(body.resumeText || ''),
          retentionDays: 180,
          deletionDate,
        },
        update: {
          overallScore,
          proposedAction,
          riskLevel: body.riskLevel || 'medium',
          confidence: body.confidence || 0,
          analysisJson: body.analysisJson || '{}',
        },
      });

      return NextResponse.json({ success: true, auditLogId: auditLog.id });
    }

    // ─── Log Human Confirmation ───
    if (mode === 'human-confirm') {
      const { candidateId, userId, userName, action } = body;

      const details = JSON.stringify({ candidateId, action, confirmedBy: userName });
      const lastLog = await prisma.auditLog.findFirst({ orderBy: { timestamp: 'desc' } });
      const previousHash = lastLog?.hash || 'genesis';
      const hash = generateHash(`confirm-${Date.now()}-${candidateId}-${userId}`);

      const auditLog = await prisma.auditLog.create({
        data: {
          action: 'human_confirm',
          actor: 'human',
          actorId: userId,
          actorName: userName,
          targetType: 'candidate',
          targetId: candidateId,
          details,
          hash,
          previousHash,
        },
      });

      // Update CandidateScore
      await prisma.candidateScore.updateMany({
        where: { candidateId },
        data: {
          humanConfirmed: true,
          confirmedBy: userId,
          confirmedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, auditLogId: auditLog.id });
    }

    // ─── Log Blind Screening ───
    if (mode === 'blind-screening') {
      const { candidateId, scoreBeforeBlind, scoreAfterBlind, biasAlert, userId } = body;

      const details = JSON.stringify({ candidateId, scoreBeforeBlind, scoreAfterBlind, biasAlert });
      const lastLog = await prisma.auditLog.findFirst({ orderBy: { timestamp: 'desc' } });
      const previousHash = lastLog?.hash || 'genesis';
      const hash = generateHash(`blind-${Date.now()}-${candidateId}`);

      const auditLog = await prisma.auditLog.create({
        data: {
          action: 'blind_screening',
          actor: 'system',
          actorId: userId || 'blind-screening-engine',
          targetType: 'candidate',
          targetId: candidateId,
          details,
          hash,
          previousHash,
        },
      });

      return NextResponse.json({ success: true, auditLogId: auditLog.id });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid mode. Use "score-override", "resume-analyzed", "human-confirm", or "blind-screening"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Audit log error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create audit log entry' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode');

    // ─── Get Score Override History ───
    if (mode === 'overrides') {
      const candidateId = searchParams.get('candidateId');
      const jobId = searchParams.get('jobId');

      const where: Record<string, string> = {};
      if (candidateId) where.candidateId = candidateId;
      if (jobId) where.jobId = jobId;

      const overrides = await prisma.scoreOverride.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: 100,
      });

      return NextResponse.json({ success: true, overrides });
    }

    // ─── Get Audit Trail ───
    if (mode === 'trail') {
      const action = searchParams.get('action');
      const targetType = searchParams.get('targetType');

      const where: Record<string, string> = {};
      if (action) where.action = action;
      if (targetType) where.targetType = targetType;

      const logs = await prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: 200,
      });

      return NextResponse.json({ success: true, logs });
    }

    // ─── Get Candidate Scores ───
    if (mode === 'scores') {
      const jobId = searchParams.get('jobId');
      const proposedAction = searchParams.get('proposedAction');

      const where: Record<string, string> = {};
      if (jobId) where.jobId = jobId;
      if (proposedAction) where.proposedAction = proposedAction;

      const scores = await prisma.candidateScore.findMany({
        where,
        orderBy: { overallScore: 'desc' },
        include: { overrides: true },
      });

      return NextResponse.json({ success: true, scores });
    }

    // ─── Verify Audit Integrity ───
    if (mode === 'verify') {
      const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'asc' },
      });

      let valid = true;
      let prevHash = 'genesis';
      const issues: string[] = [];

      for (const log of logs) {
        if (log.previousHash !== prevHash) {
          valid = false;
          issues.push(`Chain break at ${log.id}: expected previousHash ${prevHash}, found ${log.previousHash}`);
        }
        prevHash = log.hash;
      }

      return NextResponse.json({
        success: true,
        integrityValid: valid,
        totalEntries: logs.length,
        issues,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid mode. Use "overrides", "trail", "scores", or "verify"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Audit GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve audit data' },
      { status: 500 }
    );
  }
}
