'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TitleBar } from '@/features/dashboard/TitleBar';

import { ComparisonMode } from './ComparisonMode';

type LLMResponse = {
  content: string;
  score: number;
  modelVersion?: string;
  processingTime?: number;
};

type DashboardMainContentProps = {
  responses: Record<string, Record<string, LLMResponse>>;
  loading: boolean;
  selectedSegment: string;
  error: string | null;
  onSaveReport?: (data: any) => void;
};

// Icon mapping for different categories
const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, string> = {
    'Marketing OKRs': '📊',
    'Strengths': '💪',
    'Weaknesses': '⚠️',
    'Opportunities': '🚀',
    'Threats': '🛡️',
    'Market Positioning': '🎯',
    'Buyer Persona': '👤',
    'Investment Opportunities': '💰',
    'Channels & Distribution': '📢',
  };
  return iconMap[category] || '📝';
};

// Display name mapping for categories
const getCategoryDisplayName = (category: string) => {
  const nameMap: Record<string, string> = {
    'Marketing OKRs': 'Marketing OKRs',
    'Strengths': 'Strengths',
    'Weaknesses': 'Weaknesses',
    'Opportunities': 'Opportunities',
    'Threats': 'Threats',
    'Market Positioning': 'Market Positioning',
    'Buyer Persona': 'Buyer Persona',
    'Investment Opportunities': 'Investment Opportunities',
    'Channels & Distribution': 'Channels & Distribution',
  };
  // Fallback: prettify the string
  return nameMap[category] || category.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
};

// Score color mapping
const getScoreColor = (score: number) => {
  if (score >= 80) {
    return 'text-green-600 bg-green-100';
  }
  if (score >= 60) {
    return 'text-yellow-600 bg-yellow-100';
  }
  return 'text-red-600 bg-red-100';
};

// Truncate text to specified length
const truncateText = (text: string, maxLength: number = 500) => {
  const trimmedText = text.trim();
  if (trimmedText.length <= maxLength) {
    return trimmedText;
  }
  return `${trimmedText.substring(0, maxLength).trim()}...`;
};

// Count words in text
const _countWords = (text: string) => {
  const trimmedText = text.trim();
  return trimmedText.split(/\s+/).filter(word => word.length > 0).length;
};

export function DashboardMainContent({
  responses,
  loading,
  selectedSegment,
  error,
  onSaveReport,
}: DashboardMainContentProps) {
  const t = useTranslations('DashboardIndex');
  const [showComparisonMode, setShowComparisonMode] = useState(false);
  const [savedComparisons, setSavedComparisons] = useState<any[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<{ category: string; content: string; score: number } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alreadySaved, setAlreadySaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    setShowSuccess(false);
    setAlreadySaved(false);
    setSaveMessage('');
  }, [selectedSegment, responses]);

  const segmentResponses = selectedSegment ? responses[selectedSegment] : null;

  const handleSaveReport = () => {
    if (alreadySaved) {
      setSaveMessage('This report is already saved.');
      setShowSuccess(false);
      return;
    }
    if (!responses[selectedSegment]) {
      return;
    }
    onSaveReport?.({
      title: `SWOT Analysis - ${selectedSegment}`,
      segment: selectedSegment,
      insights: Object.entries(responses[selectedSegment]).map(([category, response]) => ({
        category,
        content: response.content,
        score: response.score,
        modelVersion: response.modelVersion || 'unknown',
        processingTime: response.processingTime || 0,
      })),
      timestamp: new Date().toISOString(),
    });
    setShowSuccess(true);
    setAlreadySaved(true);
    setSaveMessage('Report saved successfully!');
    setTimeout(() => setShowSuccess(false), 2500);
  };

  const handleSaveComparison = (comparisonData: any) => {
    setSavedComparisons(prev => [...prev, { ...comparisonData, id: Date.now() }]);
  };

  const handleLoadComparison = (_id: number) => {
    // Load comparison logic here
  };

  const insightsForComparison = Object.entries(segmentResponses || {}).map(([category, response]) => ({
    category,
    text: response.content,
    segment: selectedSegment || '',
  }));

  const handleReadMore = (category: string, content: string, score: number) => {
    setSelectedInsight({ category, content, score });
    setIsModalOpen(true);
  };

  if (showComparisonMode) {
    return (
      <ComparisonMode
        insights={insightsForComparison}
        onSaveComparison={handleSaveComparison}
        onLoadComparison={handleLoadComparison}
        savedComparisons={savedComparisons}
      />
    );
  }

  return (
    <main className="flex-1 overflow-auto p-8">
      <div className="mb-6 flex items-center justify-between">
        <TitleBar title={t('title_bar')} description={t('title_bar_description')} />
        <div className="flex gap-2">
          {segmentResponses && !pathname.includes('/reports') && (
            <Button onClick={handleSaveReport} variant="outline" disabled={alreadySaved}>
              💾 Save Report
            </Button>
          )}
          {Object.keys(responses).length > 1 && (
            <Button onClick={() => setShowComparisonMode(true)} variant="outline">
              🔍 Comparison Mode
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {loading && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              <div className="size-2 animate-bounce rounded-full bg-blue-500"></div>
              <div className="size-2 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '0.1s' }}></div>
              <div className="size-2 animate-bounce rounded-full bg-blue-500" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-lg font-semibold text-blue-900">
                Generating Insights
              </h3>
              <p className="text-blue-700">
                Analyzing
                {' '}
                <span className="font-medium">{selectedSegment}</span>
                {' '}
                with AI-powered SWOT analysis...
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-blue-200">
            <div className="h-2 animate-pulse rounded-full bg-blue-500" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {!selectedSegment && (
        <div className="mb-10 flex h-96 items-center justify-center rounded-lg border-4 border-dashed border-gray-300 text-lg text-gray-400">
          Select a segment to view SWOT analysis here
        </div>
      )}

      {selectedSegment && !segmentResponses && !loading && (
        <div className="mb-10 flex h-96 items-center justify-center rounded-lg border-4 border-dashed border-gray-300 text-lg text-gray-400">
          Click "Generate Insights" to analyze
          {' '}
          {selectedSegment}
        </div>
      )}

      {segmentResponses && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {Object.entries(segmentResponses).map(([category, response]) => {
            const trimmedContent = response.content.trim();
            // You can choose between character count or word count
            const isLongContent = trimmedContent.length > 300; // Character count
            // const isLongContent = _countWords(trimmedContent) > 100; // Word count (uncomment to use)
            const displayContent = isLongContent ? truncateText(response.content) : response.content;

            return (
              <Card key={category} className="flex flex-col overflow-hidden">
                <CardHeader className="shrink-0 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-lg font-bold text-transparent">
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                      {getCategoryDisplayName(category)}
                    </CardTitle>
                    <div className={`rounded-full px-3 py-1 text-sm font-semibold ${getScoreColor(response.score)}`}>
                      {response.score}
                      %
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <div className="prose prose-sm max-w-none flex-1">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-3 leading-relaxed text-gray-700">{children}</p>,
                        ul: ({ children }) => <ul className="mb-3 list-inside list-disc space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-3 list-inside list-decimal space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-sm text-gray-700">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                        h1: ({ children }) => <h1 className="mb-2 text-lg font-bold text-gray-900">{children}</h1>,
                        h2: ({ children }) => <h2 className="mb-2 text-base font-semibold text-gray-900">{children}</h2>,
                        h3: ({ children }) => <h3 className="mb-1 text-sm font-semibold text-gray-900">{children}</h3>,
                      }}
                    >
                      {displayContent}
                    </ReactMarkdown>
                  </div>
                  {isLongContent && (
                    <Button
                      onClick={() => handleReadMore(category, response.content, response.score)}
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full shrink-0"
                    >
                      📖 Read Full Content
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full Content Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
              <span className="text-3xl">{selectedInsight ? getCategoryIcon(selectedInsight.category) : ''}</span>
              {selectedInsight?.category}
              {selectedInsight && (
                <div className={`ml-auto rounded-full px-3 py-1 text-sm font-semibold ${getScoreColor(selectedInsight.score)}`}>
                  {selectedInsight.score}
                  %
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-4 leading-relaxed text-gray-700">{children}</p>,
                ul: ({ children }) => <ul className="mb-4 list-inside list-disc space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="mb-4 list-inside list-decimal space-y-2">{children}</ol>,
                li: ({ children }) => <li className="text-base text-gray-700">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                h1: ({ children }) => <h1 className="mb-3 text-xl font-bold text-gray-900">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-3 text-lg font-semibold text-gray-900">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-2 text-base font-semibold text-gray-900">{children}</h3>,
              }}
            >
              {selectedInsight?.content || ''}
            </ReactMarkdown>
          </div>
        </DialogContent>
      </Dialog>

      {showSuccess && (
        <div className="animate-fade-in fixed right-6 top-6 z-50 rounded-lg bg-green-600 px-6 py-3 text-white shadow-lg">
          {saveMessage}
        </div>
      )}
      {saveMessage && !showSuccess && (
        <div className="animate-fade-in fixed right-6 top-6 z-50 rounded-lg bg-blue-600 px-6 py-3 text-white shadow-lg">
          {saveMessage}
        </div>
      )}
    </main>
  );
}
