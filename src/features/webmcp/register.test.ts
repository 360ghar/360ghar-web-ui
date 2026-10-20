import { describe, expect, it, vi } from 'vitest';
import { registerWebMcp, registerWebMcpWhenIdle, TOOLS } from './register';

describe('tool definitions', () => {
  it('has the three tools of the old site, with object schemas', () => {
    expect(TOOLS.map((t) => t.name)).toEqual(['search_properties', 'schedule_visit', 'calculate_emi']);
    for (const t of TOOLS) {
      expect(t.description.length).toBeGreaterThan(20);
      expect(t.inputSchema.type).toBe('object');
      expect(typeof t.execute).toBe('function');
    }
    const by = Object.fromEntries(TOOLS.map((t) => [t.name, t]));
    expect(by.schedule_visit!.inputSchema.required).toEqual(['property_id', 'scheduled_date']);
    expect(by.calculate_emi!.inputSchema.required).toEqual(['principal', 'rate', 'tenure_years']);
    expect((by.search_properties!.inputSchema.properties as Record<string, { enum?: string[] }>).purpose?.enum).toEqual(['buy', 'rent', 'pg']);
  });

  it('says plainly that schedule_visit does not book, and marks the read-only tools', () => {
    const by = Object.fromEntries(TOOLS.map((t) => [t.name, t]));
    expect(by.schedule_visit!.description).toContain('does NOT book');
    expect(by.schedule_visit!.annotations).toBeUndefined();
    expect(by.search_properties!.annotations).toEqual({ readOnlyHint: true });
    expect(by.calculate_emi!.annotations).toEqual({ readOnlyHint: true });
  });
});

describe('registerWebMcp', () => {
  it('registers every tool with an abort signal, and the returned function aborts it', () => {
    const registerTool = vi.fn();
    const dispose = registerWebMcp({ modelContext: { registerTool } });
    expect(registerTool).toHaveBeenCalledTimes(3);
    const signal = registerTool.mock.calls[0]![1].signal as AbortSignal;
    expect(signal.aborted).toBe(false);
    dispose!();
    expect(signal.aborted).toBe(true);
    expect(registerTool.mock.calls.every((c) => c[1].signal === signal)).toBe(true);
  });

  it('does nothing without WebMCP', () => {
    expect(registerWebMcp({})).toBeNull();
    expect(registerWebMcp({ modelContext: {} })).toBeNull();
    expect(registerWebMcp(undefined)).toBeNull();
  });

  it('never throws, and one failed registration does not stop the others', async () => {
    const registerTool = vi.fn((tool: { name: string }) => {
      if (tool.name === 'search_properties') throw new Error('duplicate tool');
      if (tool.name === 'schedule_visit') return Promise.reject(new Error('rejected'));
      return undefined;
    });
    expect(() => registerWebMcp({ modelContext: { registerTool } })).not.toThrow();
    expect(registerTool).toHaveBeenCalledTimes(3);
    await Promise.resolve();
  });

  it('is a no-op on the server', () => {
    expect(typeof window).toBe('undefined');
    expect(() => registerWebMcpWhenIdle()).not.toThrow();
  });
});
