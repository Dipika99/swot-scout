'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type InsightData = {
  category: string;
  text: string;
  segment: string;
};

type ComparisonModeProps = {
  insights: InsightData[];
  onSaveComparison: (data: any) => void;
  onLoadComparison: (id: number) => void;
  savedComparisons: any[];
};

export function ComparisonMode({
  insights,
  onSaveComparison,
  onLoadComparison,
  savedComparisons,
}: ComparisonModeProps) {
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [comparisonTitle, setComparisonTitle] = useState('');
  const [activeTab, setActiveTab] = useState('side-by-side');

  const uniqueSegments = [...new Set(insights.map(i => i.segment))];
  const categories = [...new Set(insights.map(i => i.category))];

  const filteredInsights = insights.filter(insight =>
    selectedSegments.length === 0 || selectedSegments.includes(insight.segment),
  );

  const handleSaveComparison = () => {
    if (!comparisonTitle.trim()) {
      return;
    }

    onSaveComparison({
      title: comparisonTitle,
      insights: filteredInsights,
      segments: selectedSegments,
      timestamp: new Date().toISOString(),
    });

    setComparisonTitle('');
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Comparison Mode</h2>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          ← Back to Dashboard
        </Button>
      </div> */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="segments">Select Segments</Label>
          <Select
            value={selectedSegments[0] || ''}
            onValueChange={value => setSelectedSegments([value])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose segments to compare" />
            </SelectTrigger>
            <SelectContent>
              {uniqueSegments.map(segment => (
                <SelectItem key={segment} value={segment}>
                  {segment}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="title">Comparison Title</Label>
          <Input
            id="title"
            value={comparisonTitle}
            onChange={e => setComparisonTitle(e.target.value)}
            placeholder="Enter comparison title"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSaveComparison} disabled={!comparisonTitle.trim()}>
          Save Comparison
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
          <TabsTrigger value="by-category">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="side-by-side" className="space-y-4">
          {categories.map(category => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredInsights
                    .filter(insight => insight.category === category)
                    .map(insight => (
                      <Card key={`${insight.segment}-${category}`} className="border-2">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{insight.segment}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-2">{children}</p>,
                                ul: ({ children }) => <ul className="mb-2 list-inside list-disc">{children}</ul>,
                                ol: ({ children }) => <ol className="mb-2 list-inside list-decimal">{children}</ol>,
                                li: ({ children }) => <li className="text-sm">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                              }}
                            >
                              {insight.text}
                            </ReactMarkdown>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="by-category" className="space-y-4">
          {filteredInsights.map(insight => (
            <Card key={`${insight.segment}-${insight.category}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {insight.category}
                    {' '}
                    -
                    {insight.segment}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2">{children}</p>,
                      ul: ({ children }) => <ul className="mb-2 list-inside list-disc">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 list-inside list-decimal">{children}</ol>,
                      li: ({ children }) => <li className="text-sm">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                    }}
                  >
                    {insight.text}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
