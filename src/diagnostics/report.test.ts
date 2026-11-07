import { describe, expect, it } from 'vitest';
import { buildIssueUrl, toReport } from './report';

const env = { platform: 'android', osVersion: '15', appVersion: '1.0.0' };

describe('crash report', () => {
  it('builds a report from an Error', () => {
    const r = toReport(new Error('boom'), true, 'global', env);
    expect(r.message).toBe('boom');
    expect(r.isFatal).toBe(true);
    expect(r.stack).toContain('boom');
  });

  it('handles non-Error values', () => {
    expect(toReport('oops', false, 'boundary', env).message).toBe('oops');
    expect(toReport(null, false, 'boundary', env).message).toBe('unknown error');
  });

  it('creates a bounded GitHub issue URL', () => {
    const r = toReport(new Error('x'.repeat(500)), true, 'global', env);
    r.stack = 'y'.repeat(20000);
    const url = buildIssueUrl(r);
    expect(url.startsWith('https://github.com/jeong-jihyun/arena-brawl-mobile/issues/new?')).toBe(true);
    expect(url.length).toBeLessThan(12000);
    expect(url).toContain('labels=crash');
  });
});
