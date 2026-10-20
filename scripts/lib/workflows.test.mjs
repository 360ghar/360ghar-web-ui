import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const dir = '.github/workflows';
const files = readdirSync(dir).filter((f) => f.endsWith('.yml'));
const read = (f) => readFileSync(`${dir}/${f}`, 'utf8');
/** Workflow text without comment lines, so a comment cannot trip a check. */
const code = (f) => read(f).split('\n').filter((l) => !/^\s*#/.test(l)).join('\n');

describe('workflows', () => {
  it('exist', () => {
    expect(files.sort()).toEqual(expect.arrayContaining(['ci.yml', 'indexnow.yml', 'post-deploy-smoke.yml']));
  });

  it('call only package scripts that exist', () => {
    for (const f of files) {
      for (const m of code(f).matchAll(/\bpnpm (?!install\b|exec\b|add\b|dlx\b)([\w:-]+)/g)) {
        expect(pkg.scripts, `${f}: pnpm ${m[1]}`).toHaveProperty(m[1]);
      }
    }
  });

  it('run only node scripts that exist', () => {
    for (const f of files) {
      for (const m of code(f).matchAll(/node (scripts\/[\w./-]+\.mjs)/g)) {
        expect(() => readFileSync(m[1]), `${f}: ${m[1]}`).not.toThrow();
      }
    }
  });

  it('have least-privilege permissions and use no secrets', () => {
    for (const f of files) {
      const text = code(f);
      expect(text, f).toMatch(/^permissions:\n {2}contents: read\n/m);
      expect(text, f).not.toMatch(/\$\{\{\s*secrets\./);
      expect(text, f).not.toMatch(/GITHUB_TOKEN/);
    }
  });

  it('use the pnpm version of package.json and Node 22', () => {
    expect(pkg.packageManager).toMatch(/^pnpm@/);
    expect(pkg.engines.node).toBe('>=22.12.0');
    const ci = read('ci.yml');
    expect(ci).toContain('pnpm/action-setup@v4'); // v4 reads "packageManager"; it fails if a version is also given
    expect(ci).not.toMatch(/pnpm\/action-setup@v4\n\s+with:\n\s+version:/);
    for (const f of files.filter((x) => /setup-node/.test(read(x)))) expect(read(f), f).toMatch(/node-version: '22'/);
  });

  it('runs the e2e job with one dev server, an --output folder and a variable switch', () => {
    const ci = read('ci.yml');
    expect(ci.match(/pnpm dev\b/g)).toHaveLength(1);
    expect(ci).toMatch(/playwright test --output=/);
    expect(ci).toContain('playwright install --with-deps chrome');
    expect(ci).toContain("vars.E2E_DISABLED != 'true'");
    expect(ci).toContain('pnpm check:pseo'); // after the unit tests
    expect(ci.indexOf('pnpm check:pseo')).toBeGreaterThan(ci.indexOf('pnpm test'));
  });

  it('retries the smoke checks up to 10 times, 30 s apart', () => {
    const smoke = read('post-deploy-smoke.yml');
    expect(smoke).toContain('seq 1 10');
    expect(smoke).toContain('sleep 30');
  });

  it('submits to IndexNow only from a manual run with an explicit yes', () => {
    const t = read('indexnow.yml');
    expect(t).toMatch(/^on:\n {2}workflow_dispatch:/m);
    expect(t).not.toMatch(/^ {2}(push|schedule|workflow_run|pull_request):/m);
    expect(t).toContain('"$SUBMIT" = "yes"');
  });
});
