import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// The function signature is updated to be more robust.
export async function GET(
  _request: Request,
  { params }: { params: { reportId: string } },
) {
  try {
    // The reportId is now guaranteed to be on the params object.
    const { reportId } = params;

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      include: {
        insights: true, // Also fetch the related insights
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Failed to fetch report:', error);
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}
