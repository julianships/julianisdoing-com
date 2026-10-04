import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/components/typewriter.tsx', import.meta.url), 'utf8');

test('tracker shows one total and a small auto-updating indicator without diagnostic copy', () => {
  assert.equal(/captured baseline|Measured after|sources current|partial lower bound|Last sync|Live feed offline|about-usage-live-meta/.test(source), false);
  assert.ok(source.includes('tokens used'));
  assert.ok(source.includes('Auto-updating'));
  assert.equal(/`Since|about-usage-live-value/.test(source), false);
  assert.match(source, /className="about-usage-live-dot"/);
});

test('historical chart retains its original May 2025 start and all twelve original points', () => {
  const trend = source.split('const aboutUsageTrend = [')[1].split('] as const;')[0];
  const points = [...trend.matchAll(/date: "([^"]+)", month: "([^"]+)", cumulative: (\d+)/g)]
    .map(([, date, month, total]) => ({ date, month, total: Number(total) }));
  assert.equal(points[0].date, '2025-05-01');
  assert.deepEqual(points.map(p => p.total), [0,277286568,1213970146,1276077379,1543081436,1548065964,1549592483,1749530909,3963400865,6731271332,21300888908,30957682820]);
  assert.match(source, /usageTrend\[0\]\.date\.slice\(0, 4\)/);
});

test('clean tracker still subscribes to the feed and renders live totals and chart', () => {
  assert.match(source, /const usage = useTokenUsage\(\)/);
  assert.match(source, /formatTokenCount\(usage\.totalTokens, true\)/);
  assert.equal(source.includes('formatTokenCount(usage.observed.tokens)'), false);
  assert.match(source, /const usageTrend = \[\.\.\.aboutUsageTrend, \.\.\.liveTrend\]/);
});
