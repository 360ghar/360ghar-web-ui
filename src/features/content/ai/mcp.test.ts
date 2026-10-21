import { describe, expect, it } from 'vitest';
import { MCP_TOOLS } from './mcp';

describe('MCP tool list', () => {
  it('has 37 unique backend tool names, 7 usable without sign-in', () => {
    const names = MCP_TOOLS.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toHaveLength(37);
    expect(MCP_TOOLS.filter((t) => t.open)).toHaveLength(7);
    // The old page listed tools that do not exist.
    for (const fake of ['property_search', 'schedule_visit', 'manage_tenants', 'get_documents']) expect(names).not.toContain(fake);
  });
});
