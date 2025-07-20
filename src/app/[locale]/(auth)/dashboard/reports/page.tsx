'use client';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

import { DashboardMainContent } from '../components/DashboardMainContent';
import type { ReportSummary } from '../components/ReportsSidebar';
import { ReportsSidebar } from '../components/ReportsSidebar';

type Insight = {
  category: string;
  response: string;
  score?: number;
};

type Report = ReportSummary & {
  segment: string;
  insights: Insight[];
};

export default function ReportsPage() {
  const { user } = useUser();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      return;
    }
    setLoading(true);
    fetch(`/api/reports?userId=${encodeURIComponent(user.primaryEmailAddress.emailAddress)}`)
      .then(res => res.json())
      .then((data) => {
        if (data.reports && data.reports.length > 0) {
          // Sort by createdAt descending
          const sorted: Report[] = [...data.reports].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          setReports(sorted);
          // Safely access the first item
          const firstReport = sorted[0];
          if (firstReport) {
            setSelectedReportId(firstReport.id);
            setSelectedReport(firstReport);
          } else {
            // This branch is very unlikely, but good to be safe
            setSelectedReportId(null);
            setSelectedReport(null);
          }
        } else {
          // If there are no reports
          setReports([]);
          setSelectedReportId(null);
          setSelectedReport(null);
        }
      })
      .finally(() => setLoading(false));
  }, [user?.primaryEmailAddress?.emailAddress]);

  useEffect(() => {
    if (!selectedReportId) {
      return;
    }
    const report = reports.find(r => r.id === selectedReportId) || null;
    setSelectedReport(report);
  }, [selectedReportId, reports]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ReportsSidebar
        reports={reports}
        selectedReportId={selectedReportId}
        onSelectReport={setSelectedReportId}
      />
      <div className="flex-1 p-8">
        {loading && <div>Loading...</div>}
        {!loading && selectedReport && (
          <DashboardMainContent
            responses={{ [selectedReport.segment]: Object.fromEntries(selectedReport.insights.map(i => [i.category, { content: i.response, score: i.score ?? 75 }])) }}
            loading={false}
            selectedSegment={selectedReport.segment}
            error={null}
          />
        )}
        {!loading && !selectedReport && <div>No reports found.</div>}
      </div>
    </div>
  );
}
