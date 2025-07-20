'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

import { DashboardMainContent } from './components/DashboardMainContent';
import { DashboardSidebar } from './components/DashboardSidebar';

const initialProducts = ['Electric Cars', 'Coffee', 'Smartphones'];
const initialObjectives = ['Increase Awareness', 'Increase Consideration', 'Increase Sales'];
const initialSegments = ['Gen Z Creators', 'Urban Parents', 'Senior Citizens', 'Tech Enthusiasts'];

type PromptTemplate = (product: string, objective: string, segment: string) => string;

const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  'Marketing OKRs': (product, objective, segment) => `What are 3 measurable marketing OKRs for ${product} to achieve the objective "${objective}" among ${segment}?`,
  'Strengths': (product, objective, segment) => `What strengths of ${product} are most important for the objective "${objective}" when targeting ${segment}?`,
  'Weaknesses': (product, objective, segment) => `What weaknesses or concerns might ${segment} have about ${product} when aiming for "${objective}"?`,
  'Opportunities': (product, objective, segment) => `What product or brand opportunities can we unlock for ${product} by targeting ${segment} with the objective "${objective}"?`,
  'Threats': (product, objective, segment) => `What risks might prevent ${segment} from adopting or staying loyal to ${product} in the context of "${objective}"?`,
  'Market Positioning': (product, objective, segment) => `How should we position ${product} to resonate with ${segment} and achieve the objective "${objective}"?`,
  'Buyer Persona': (product, objective, segment) => `Write a sample persona for a typical ${segment} customer for ${product} with the objective "${objective}" in mind.`,
  'Investment Opportunities': (product, objective, segment) => `Why is the segment ${segment} strategically valuable for ${product} from a growth/investment perspective, considering the objective "${objective}"?`,
  'Channels & Distribution': (product, objective, segment) => `How should we reach and activate ${segment} for ${product} to achieve the objective "${objective}"?`,
};

const PROMPT_CATEGORIES = Object.keys(PROMPT_TEMPLATES);

type LLMResponse = {
  content: string;
  score: number;
  modelVersion?: string;
  processingTime?: number;
};

const DashboardIndexPage = () => {
  const { user } = useUser();
  const [product, setProduct] = useState<string>('');
  const [objective, setObjective] = useState<string>('');
  const [segment, setSegment] = useState<string>('');

  const [products, setProducts] = useState(() =>
    [...initialProducts].sort((a, b) => a.localeCompare(b)),
  );
  const [objectives, setObjectives] = useState(() =>
    [...initialObjectives].sort((a, b) => a.localeCompare(b)),
  );
  const [segments, setSegments] = useState(() =>
    [...initialSegments].sort((a, b) => a.localeCompare(b)),
  );

  const [responses, setResponses] = useState<Record<string, Record<string, LLMResponse>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToListAndSelect = (
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string,
    selectSetter: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    if (!list.includes(trimmed)) {
      setter([...list, trimmed]);
    }

    selectSetter(trimmed);
  };

  const handleSetProduct = (value: string) =>
    addToListAndSelect(products, setProducts, value, setProduct);

  const handleSetObjective = (value: string) =>
    addToListAndSelect(objectives, setObjectives, value, setObjective);

  const handleSetSegment = (value: string) =>
    addToListAndSelect(segments, setSegments, value, setSegment);

  async function callOpenAI(prompt: string): Promise<LLMResponse> {
    const res = await fetch('/api/generate-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'OpenAI API request failed');
    }
    return {
      content: data.content,
      score: data.score,
      modelVersion: data.modelVersion,
      processingTime: data.processingTime,
    };
  }

  const runLLMPrompts = async () => {
    if (!segment) {
      setError('Please select a segment before running prompts.');
      return;
    }

    // Clear previous responses for the selected segment before generating new ones
    setResponses((prev) => {
      const updated = { ...prev };
      delete updated[segment];
      return updated;
    });

    setLoading(true);
    setError(null);
    const segmentResponses: Record<string, LLMResponse> = {};

    try {
      for (const category of PROMPT_CATEGORIES) {
        const templateFn = PROMPT_TEMPLATES[category];
        if (!templateFn) {
          throw new Error(`Unknown prompt category: ${category}`);
        }
        const prompt = templateFn(product, objective, segment);
        const response = await callOpenAI(prompt);
        segmentResponses[category] = response;
      }

      setResponses(prev => ({
        ...prev,
        [segment]: segmentResponses,
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch from OpenAI');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    runLLMPrompts();
  };

  const handleSaveReport = async (reportData: any) => {
    try {
      const insights = Object.entries(reportData.insights).map(([category, insight]: [string, any]) => ({
        category,
        prompt: PROMPT_TEMPLATES[category]?.(product, objective, reportData.segment) || '',
        response: insight.content || insight.text || '',
        score: insight.score ?? null,
        modelVersion: insight.modelVersion || 'unknown',
        processingTime: insight.processingTime || 0,
      }));

      const res = await fetch('/api/save-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportData: {
            userId: user?.primaryEmailAddress?.emailAddress || 'anonymous',
            title: reportData.title,
            product,
            objective,
            segment: reportData.segment,
            status: 'draft',
            metadata: reportData.metadata || {},
          },
          insights,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save report');
      }

      setError(null);
    } catch (error: any) {
      console.error('Failed to save report:', error);
      setError('Failed to save report to database');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar
        products={products}
        objectives={objectives}
        segments={segments}
        product={product}
        objective={objective}
        segment={segment}
        setProduct={handleSetProduct}
        setObjective={handleSetObjective}
        setSegment={handleSetSegment}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <DashboardMainContent
        responses={responses}
        loading={loading}
        selectedSegment={segment}
        error={error}
        onSaveReport={handleSaveReport}
      />
    </div>
  );
};

export default DashboardIndexPage;
