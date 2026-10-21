/**
 * WebMCP: exposes three site tools to AI agents in the browser through
 * `navigator.modelContext` (https://webmachinelearning.github.io/webmcp/).
 *
 * - Runs only in a browser that has `navigator.modelContext.registerTool`.
 * - `registerWebMcpWhenIdle` waits for an idle moment, so it never competes
 *   with the first paint.
 * - The tool bodies load on the first call (`./tools`), so registering costs
 *   only the schemas below.
 * - Never throws: one failed registration does not stop the others.
 *
 * Same tools as the old site: search_properties, schedule_visit,
 * calculate_emi. The old site registered them with `registerTool(tool,
 * { signal })` and did not use `provideContext`; this does the same.
 */

type Tool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean };
  execute: (input: unknown) => Promise<unknown>;
};

type ModelContext = { registerTool: (tool: Tool, options?: { signal?: AbortSignal }) => unknown };

const run = (name: 'searchProperties' | 'scheduleVisit' | 'calculateEmi') => async (input: unknown) => (await import('./tools'))[name](input);

export const TOOLS: Tool[] = [
  {
    name: 'search_properties',
    description: 'Search verified property listings on 360Ghar by text, city, purpose, maximum budget and minimum bedrooms. Returns up to 10 listings with links.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Text search, for example "2 BHK in DLF Phase 3"' },
        city: { type: 'string', description: 'City, for example "gurgaon"' },
        purpose: { type: 'string', enum: ['buy', 'rent', 'pg'], description: 'Buy, rent, or PG (paying guest)' },
        price_max: { type: 'number', description: 'Maximum budget in INR (sale price, or rent per month)' },
        bedrooms_min: { type: 'integer', description: 'Minimum number of bedrooms' },
      },
    },
    annotations: { readOnlyHint: true },
    execute: run('searchProperties'),
  },
  {
    name: 'schedule_visit',
    description:
      'Start a property visit request on 360Ghar. This does NOT book the visit. It checks that the user is signed in and that the property is available, then returns the property page where the user picks a time and confirms. If the user is not signed in it returns a sign_in_required error with a sign-in link.',
    inputSchema: {
      type: 'object',
      properties: {
        property_id: { type: 'string', description: 'ID of the property to visit' },
        scheduled_date: { type: 'string', description: 'Wanted day for the visit, YYYY-MM-DD' },
        special_requirements: { type: 'string', description: 'Any special requirements for the visit' },
      },
      required: ['property_id', 'scheduled_date'],
    },
    execute: run('scheduleVisit'),
  },
  {
    name: 'calculate_emi',
    description: 'Calculate the monthly instalment (EMI), total payment and total interest of a home loan.',
    inputSchema: {
      type: 'object',
      properties: {
        principal: { type: 'number', description: 'Loan amount in INR' },
        rate: { type: 'number', description: 'Yearly interest rate in percent, for example 8.5' },
        tenure_years: { type: 'integer', description: 'Loan tenure in years' },
      },
      required: ['principal', 'rate', 'tenure_years'],
    },
    annotations: { readOnlyHint: true },
    execute: run('calculateEmi'),
  },
];

type WebMcpNavigator = { modelContext?: Partial<ModelContext> };

/** Browsers do not type `navigator.modelContext` yet. */
const browserNav = (): WebMcpNavigator | undefined => (typeof navigator === 'undefined' ? undefined : (navigator as unknown as WebMcpNavigator));

/**
 * Registers the tools now. Returns a function that removes them again (it
 * aborts the signal), or null when this is not a browser with WebMCP.
 */
export function registerWebMcp(nav: WebMcpNavigator | undefined = browserNav()): (() => void) | null {
  const context = nav?.modelContext;
  if (typeof context?.registerTool !== 'function') return null;
  const controller = new AbortController();
  for (const tool of TOOLS) {
    try {
      // A tool with this name may already exist (a second call, or another script). Skip it.
      void Promise.resolve(context.registerTool(tool, { signal: controller.signal })).catch(() => undefined);
    } catch {
      // Ignored on purpose: WebMCP is an extra, never a reason to break the page.
    }
  }
  return () => controller.abort();
}

/** Registers after the browser is idle. Safe on the server and without WebMCP: it does nothing. */
export function registerWebMcpWhenIdle(): void {
  if (typeof window === 'undefined' || !browserNav()?.modelContext) return;
  const start = () => void registerWebMcp();
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(start, { timeout: 4000 });
  else globalThis.setTimeout(start, 2000);
}
