import { NextResponse } from 'next/server';

import { getInsightsByReportId, getReportsByUserId } from '@/libs/DB';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  try {
    const reports = await getReportsByUserId(userId);
    // Fetch insights for each report
    const detailedReports = await Promise.all(
      reports.map(async (report: any) => {
        const insights = await getInsightsByReportId(report.id);
        return { ...report, insights };
      }),
    );
    return NextResponse.json({ reports: detailedReports });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
