import { describe, expect, it } from 'vitest';

import { buildAiDiscoveryArtifacts } from './aiDiscovery';

describe('buildAiDiscoveryArtifacts', () => {
  it('cross-links ai.txt, llms assets, and the LLM feed from one shared source of truth', () => {
    const artifacts = buildAiDiscoveryArtifacts();
    const apiCatalogEntry = artifacts.apiCatalog.linkset.find(
      ({ anchor }) => anchor === 'https://360ghar.com/.well-known/api-catalog'
    );
    const mcpEntry = artifacts.apiCatalog.linkset.find(
      ({ anchor }) => anchor === 'https://api.360ghar.com/mcp'
    );
    const restEntry = artifacts.apiCatalog.linkset.find(
      ({ anchor }) => anchor === 'https://api.360ghar.com/api/v1'
    );

    expect(artifacts.aiTxt).toContain('https://360ghar.com/llms.txt');
    expect(artifacts.aiTxt).toContain('https://360ghar.com/data/llm-feed.json');
    expect(artifacts.aiTxt).toContain('https://360ghar.com/.well-known/api-catalog');
    expect(artifacts.llmsTxt).toContain('For AI Assistants: https://360ghar.com/for-ai');
    expect(artifacts.llmsTxt).toContain('API Catalog: https://360ghar.com/.well-known/api-catalog');
    expect(artifacts.llmsFullTxt).toContain('AI Crawler Policy: https://360ghar.com/.well-known/ai.txt');
    expect(artifacts.llmsFullTxt).toContain('API Catalog: https://360ghar.com/.well-known/api-catalog');
    expect(artifacts.llmFeed.important_pages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'For AI Assistants', url: 'https://360ghar.com/for-ai' }),
        expect.objectContaining({ title: 'AI Agent', url: 'https://360ghar.com/ai-agent' }),
      ])
    );
    expect(artifacts.apiCatalog).toBeDefined();
    expect(apiCatalogEntry?.item).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: 'https://api.360ghar.com/mcp' }),
        expect.objectContaining({ href: 'https://api.360ghar.com/api/v1' }),
      ])
    );
    expect(mcpEntry?.['service-doc']).toEqual([
      expect.objectContaining({ href: 'https://360ghar.com/for-ai', type: 'text/html' }),
    ]);
    expect(mcpEntry?.['service-meta']).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: 'https://360ghar.com/data/llm-feed.json', type: 'application/json' }),
        expect.objectContaining({ href: 'https://360ghar.com/.well-known/ai.txt', type: 'text/plain' }),
      ])
    );
    expect(restEntry?.['service-desc']).toEqual([
      expect.objectContaining({
        href: 'https://api.360ghar.com/api/v1/openapi.json',
        type: 'application/openapi+json',
      }),
    ]);
    expect(restEntry?.['service-doc']).toEqual([
      expect.objectContaining({ href: 'https://api.360ghar.com/api/v1/docs', type: 'text/html' }),
    ]);
  });
});
