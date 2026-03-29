import { describe, expect, it } from 'vitest';

import { buildAiDiscoveryArtifacts } from './aiDiscovery';

describe('buildAiDiscoveryArtifacts', () => {
  it('cross-links ai.txt, llms assets, and the LLM feed from one shared source of truth', () => {
    const artifacts = buildAiDiscoveryArtifacts();

    expect(artifacts.aiTxt).toContain('https://360ghar.com/llms.txt');
    expect(artifacts.aiTxt).toContain('https://360ghar.com/data/llm-feed.json');
    expect(artifacts.llmsTxt).toContain('For AI Assistants: https://360ghar.com/for-ai');
    expect(artifacts.llmsFullTxt).toContain('AI Crawler Policy: https://360ghar.com/.well-known/ai.txt');
    expect(artifacts.llmFeed.important_pages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'For AI Assistants', url: 'https://360ghar.com/for-ai' }),
        expect.objectContaining({ title: 'AI Agent', url: 'https://360ghar.com/ai-agent' }),
      ])
    );
  });
});
