import { describe, expect, it } from 'vitest';
import { isoDay } from './slots';
import { VISIT_WINDOW_DAYS, visitDayFromParam } from './visitDay';

// Tuesday 29 September 2026, 10:00.
const now = new Date(2026, 8, 29, 10, 0);
const plus = (n: number) => isoDay(new Date(2026, 8, 29 + n));

describe('visitDayFromParam', () => {
  it('accepts every day of the window: today and the next six', () => {
    for (let i = 0; i < VISIT_WINDOW_DAYS; i += 1) expect(visitDayFromParam(plus(i), now)).toBe(plus(i));
    expect(plus(6)).toBe('2026-10-05');
  });

  it('ignores past days and days beyond the window', () => {
    expect(visitDayFromParam(plus(-1), now)).toBeNull();
    expect(visitDayFromParam('2020-01-01', now)).toBeNull();
    expect(visitDayFromParam(plus(VISIT_WINDOW_DAYS), now)).toBeNull();
    expect(visitDayFromParam('2099-12-31', now)).toBeNull();
  });

  it('ignores today when every slot has closed', () => {
    const late = new Date(2026, 8, 29, 19, 0);
    expect(visitDayFromParam('2026-09-29', late)).toBeNull();
    expect(visitDayFromParam('2026-09-30', late)).toBe('2026-09-30');
  });

  it('ignores impossible dates and wrong formats', () => {
    for (const bad of ['2026-02-30', '2026-13-01', '2026-00-10', '2026-9-30', '30-09-2026', '2026/09/30', '20260930', '2026-09-30T10:00', ' 2026-09-30', '2026-09-30 ', '']) {
      expect(visitDayFromParam(bad, now), JSON.stringify(bad)).toBeNull();
    }
  });

  it('ignores injection-looking and non-string values', () => {
    for (const bad of ['"><script>alert(1)</script>', "2026-09-30' OR 1=1--", '2026-09-30&next=//evil.example', 'javascript:alert(1)', '2026-09-30\n2026-10-01', '%32026-09-30', null, undefined, 5, ['2026-09-30'], { a: 1 }]) {
      expect(visitDayFromParam(bad, now)).toBeNull();
    }
  });

  it('works across a month end', () => {
    const eom = new Date(2026, 9, 30, 8, 0);
    expect(visitDayFromParam('2026-11-05', eom)).toBe('2026-11-05');
    expect(visitDayFromParam('2026-11-06', eom)).toBeNull();
  });
});
