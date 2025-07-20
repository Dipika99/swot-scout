import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { createInsight, createReport } from '@/libs/DB';

export async function POST(req: NextRequest) {
  try {
    const { reportData, insights } = await req.json();

    if (!reportData || !insights) {
      return NextResponse.json(
        { error: 'Report data and insights are required' },
        { status: 400 },
      );
    }

    // Create the report
    const report = await createReport({
      userId: reportData.userId || 'current-user',
      title: reportData.title,
      product: reportData.product,
      objective: reportData.objective,
      segment: reportData.segment,
      metadata: reportData.metadata,
    });

    if (!report || report.length === 0) {
      throw new Error('Failed to create report');
    }

    const reportId = report[0]?.id;
    if (!reportId) {
      throw new Error('Invalid report ID');
    }

    // Create individual insights
    for (const insight of insights) {
      const responseText = insight.text || insight.response || insight.content || '';
      await createInsight({
        reportId,
        category: insight.category,
        prompt: insight.prompt,
        response: responseText,
        modelVersion: insight.modelVersion || 'unknown',
        processingTime: insight.processingTime || 0,
        score: insight.score ?? null,
      });
    }

    return NextResponse.json({
      success: true,
      reportId,
      message: 'Report saved successfully',
    });
  } catch (error: any) {
    console.error('Failed to save report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save report' },
      { status: 500 },
    );
  }
}
