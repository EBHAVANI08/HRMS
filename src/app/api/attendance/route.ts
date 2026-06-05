import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const records = await db.attendance.findMany({
      include: { employee: true },
      orderBy: { date: 'desc' },
      take: 30,
    });
    return NextResponse.json({ success: true, data: records });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch attendance records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, date, checkIn, status, shift, location } = body;

    const record = await db.attendance.create({
      data: {
        employeeId,
        date: new Date(date),
        checkIn: checkIn ? new Date(checkIn) : null,
        status: status || 'present',
        shift: shift || 'general',
        location: location || null,
      },
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create attendance record' }, { status: 500 });
  }
}
