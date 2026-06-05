import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const requests = await db.leaveRequest.findMany({
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ success: true, data: requests });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch leave requests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, leaveType, fromDate, toDate, totalDays, halfDay, reason } = body;

    const leaveRequest = await db.leaveRequest.create({
      data: {
        employeeId,
        leaveType,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        totalDays: totalDays || 1,
        halfDay: halfDay || false,
        reason,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, data: leaveRequest }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create leave request' }, { status: 500 });
  }
}
