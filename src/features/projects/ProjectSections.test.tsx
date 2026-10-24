import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import ProjectSections from './ProjectSections';
import { text } from './text';
import type { ProjectDetail } from './types';

/** The smallest project the API can return: identity only, every sub-record empty. */
const bare: ProjectDetail = {
  id: 1,
  slug: 'a-project',
  rera_number: 'HARERA-GGM-1',
  project_name: 'A Project',
  developer_name: null,
  developer_slug: null,
  location: null,
  district: 'Gurugram',
  stage: null,
  total_units: null,
  towers: null,
  land_area_acres: null,
  proposed_far: null,
  proposed_completion_date: null,
  current_price_per_sqft: null,
  possession_date: null,
  status: null,
  complaint_count: 0,
  source_url: null,
  updated_at: '2025-01-01T00:00:00Z',
  provenance: null,
  profile: null,
  land_usage: [],
  cost: null,
  expenditure: [],
  documents: [],
  statutory: null,
  facilities: [],
  nocs: [],
  people: [],
  bank_account: null,
  unit_configs: [],
  specifications: [],
  nearby: [],
  price_history: [],
  faq: [],
};

describe('project detail sections', () => {
  it('renders no section, table or placeholder when every sub-record is empty', () => {
    const html = renderToStaticMarkup(<ProjectSections locale="en" project={bare} />);

    expect(html).not.toMatch(/<table/);
    expect(html).not.toMatch(/<section/);
    expect(html).not.toContain('No ');
  });

  it('renders a section, and only the sections that have rows', () => {
    const html = renderToStaticMarkup(
      <ProjectSections
        locale="en"
        project={{
          ...bare,
          cost: { land_cost: 1_000_000, construction_cost: null, infrastructure_cost: null, other_cost: null, total_cost: null },
          facilities: [{ facility: 'Clubhouse', estimated_cost: null, status: 'approved' }],
          bank_account: { bank_name: 'A Bank', branch_name: null, ifsc: null, micr: null, branch_code: null },
        }}
      />,
    );

    const t = text('en');
    expect(html).toContain(t.costTitle);
    expect(html).toContain(t.facilitiesTitle);
    expect(html).toContain(t.bankTitle);
    // The empty heads are absent, and so are their tables.
    expect(html).not.toContain(t.landUsageTitle);
    expect(html).not.toContain(t.expenditureTitle);
    expect(html).not.toContain(t.unitsTitle);
    expect(html).not.toContain(t.nocsTitle);
    // The bank account number is not part of the contract and never rendered.
    expect(html).not.toMatch(/account_number/i);
  });

  it('translates the section headings in Hindi', () => {
    const html = renderToStaticMarkup(
      <ProjectSections locale="hi" project={{ ...bare, cost: { land_cost: 5, construction_cost: null, infrastructure_cost: null, other_cost: null, total_cost: null } }} />,
    );

    expect(html).toContain(text('hi').costTitle);
    expect(html).not.toContain(text('en').costTitle);
  });
});
