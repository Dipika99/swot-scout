// app/api/generate-insights/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 },
      );
    }

    const openaiApiKey = process.env.AZURE_OPENAI_KEY;
    const openaiDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
    const azureOpenAIEndpoint = `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`;

    if (!openaiApiKey || !openaiDeploymentName || !azureOpenAIEndpoint) {
      return NextResponse.json(
        { error: 'OpenAI API key, deployment name, or endpoint not configured' },
        { status: 500 },
      );
    }

    const openai = new OpenAI({
      apiKey: openaiApiKey,
      baseURL: azureOpenAIEndpoint,
      defaultQuery: { 'api-version': '2024-05-01-preview' },
      defaultHeaders: { 'api-key': openaiApiKey },
    });

    // --- Step 1: Generate the main content ---
    const contentCompletion = await openai.chat.completions.create({
      model: 'gpt-4.1', // Use your primary deployment (e.g., GPT-4)
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    const content = contentCompletion.choices[0]?.message?.content?.trim() || '';

    // --- Step 2: Generate the confidence score ---
    const scoringPrompt = `On a scale of 1 to 100, how strategically sound is the following text for the prompt "${prompt}"? Respond with only a number. Text: "${content}"`;

    const scoringCompletion = await openai.chat.completions.create({
      // IMPORTANT: Use a faster, cheaper model for scoring if available.
      // If not, use your primary deployment name again.
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: scoringPrompt }],
      temperature: 0,
      max_tokens: 5,
    });

    const scoreText = scoringCompletion.choices[0]?.message?.content?.trim() || '75';
    const score = Number.parseInt(scoreText.replace(/\D/g, ''), 10) || 75; // Clean non-digits and parse

    return NextResponse.json({
      content,
      score,
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong' },
      { status: 500 },
    );
  }
}
