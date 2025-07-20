import React from 'react';

export type ReportSummary = {
  id: number;
  title: string;
  createdAt: string;
};

type ReportsSidebarProps = {
  reports: ReportSummary[];
  selectedReportId: number | null;
  onSelectReport: (id: number) => void;
};

export function ReportsSidebar({ reports, selectedReportId, onSelectReport }: ReportsSidebarProps) {
  return (
    <aside className="w-64 shrink-0 overflow-y-auto border-r bg-white p-4">
      <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">Reports</h2>
      <ul className="space-y-2">
        {reports.map(report => (
          <li key={report.id}>
            <button
              type="button"
              className={`w-full rounded-md px-3 py-2 text-left font-medium transition ${selectedReportId === report.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
              onClick={() => onSelectReport(report.id)}
            >
              <div className="truncate font-semibold">{report.title}</div>
              <div className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleString()}</div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
