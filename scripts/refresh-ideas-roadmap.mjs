#!/usr/bin/env node

// Snapshots roadmap ideas from the Fider board's public API into
// src/data/ideas-roadmap.json. The site is static, so the roadmap only changes
// when this runs and the result is committed. A failed fetch leaves the
// existing snapshot untouched rather than publishing an empty roadmap.
//
// Usage: npm run refresh:ideas [-- --board https://ideas.mage-os.org] [--dry-run]

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROADMAP_STATUSES = ['planned', 'started', 'completed'];
const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = resolve(rootDirectory, 'src/data/ideas-roadmap.json');

const args = process.argv.slice(2);
const boardArgIndex = args.indexOf('--board');
const board =
  (boardArgIndex >= 0 ? args[boardArgIndex + 1] : process.env.IDEAS_BOARD_URL) || 'https://ideas.mage-os.org';
const dryRun = args.includes('--dry-run');

const url = new URL('/api/v1/posts', board);
url.searchParams.set('view', 'most-wanted');
url.searchParams.set('statuses', ROADMAP_STATUSES.join(','));
url.searchParams.set('limit', '100');

const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20_000) });
if (!response.ok) {
  console.error(`Fider returned ${response.status} for ${url}; snapshot not changed.`);
  process.exit(1);
}

const posts = await response.json();
if (!Array.isArray(posts)) {
  console.error('Unexpected response shape from Fider; snapshot not changed.');
  process.exit(1);
}

const ideas = posts
  .filter((post) => ROADMAP_STATUSES.includes(post.status))
  .map((post) => ({
    number: post.number,
    title: post.title,
    slug: post.slug,
    status: post.status,
    votesCount: post.votesCount,
    tags: post.tags ?? [],
  }));

const snapshot = { fetchedAt: new Date().toISOString(), source: new URL(board).origin, ideas };

if (dryRun) {
  console.log(JSON.stringify(snapshot, null, 2));
} else {
  writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`Wrote ${ideas.length} roadmap ideas from ${snapshot.source} to src/data/ideas-roadmap.json`);
}
