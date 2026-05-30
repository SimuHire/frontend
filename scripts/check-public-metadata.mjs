import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const layoutPath = resolve(root, 'src/app/layout.tsx');
const marketingPagePath = resolve(root, 'src/app/(marketing)/page.tsx');
const opengraphPath = resolve(root, 'src/app/opengraph-image.tsx');
const twitterPath = resolve(root, 'src/app/twitter-image.tsx');
const themeColorPath = resolve(root, 'public-theme-color.ts');

function read(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    fail(`Missing required file: ${path}`);
  }
}

function fail(message) {
  console.error(`metadata guardrail failed: ${message}`);
  process.exit(1);
}

function expect(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function expectMatch(source, regex, message) {
  expect(regex.test(source), message);
}

const layout = read(layoutPath);
const marketingPage = read(marketingPagePath);
const opengraph = read(opengraphPath);
const twitter = read(twitterPath);
const themeColorSource = read(themeColorPath);

for (const [label, source] of [
  ['layout', layout],
  ['marketing page', marketingPage],
]) {
  expectMatch(
    source,
    /metadataBase\s*:\s*new URL\(['"]https:\/\/winoe\.ai['"]\)/,
    `${label} must define metadataBase`,
  );
  expectMatch(
    source,
    /openGraph\s*:\s*{/,
    `${label} must define openGraph metadata`,
  );
  expectMatch(
    source,
    /openGraph[\s\S]*title\s*:/,
    `${label} must define openGraph.title`,
  );
  expectMatch(
    source,
    /openGraph[\s\S]*description\s*:/,
    `${label} must define openGraph.description`,
  );
  expectMatch(
    source,
    /twitter\s*:\s*{/,
    `${label} must define twitter metadata`,
  );
  expectMatch(
    source,
    /twitter[\s\S]*card\s*:\s*['"]summary_large_image['"]/,
    `${label} must use summary_large_image twitter card`,
  );
}

expectMatch(
  marketingPage,
  /alternates\s*:\s*{\s*canonical\s*:\s*['"]\/['"]\s*,?\s*}/s,
  'marketing page must define canonical alternates for the public root',
);

expectMatch(
  layout,
  /themeColor\s*:\s*PUBLIC_THEME_COLOR/,
  'layout themeColor must use the shared public theme color constant',
);
expectMatch(
  themeColorSource,
  /export const PUBLIC_THEME_COLOR\s*=\s*['"]#C9A66B['"]\s*as const;/,
  'public theme color constant must remain #C9A66B',
);

for (const [label, source] of [
  ['layout', layout],
  ['marketing page', marketingPage],
]) {
  expectMatch(
    source,
    /openGraph[\s\S]*images\s*:\s*\[/,
    `${label} must define openGraph.images`,
  );
  expectMatch(
    source,
    /twitter[\s\S]*images\s*:\s*\[/,
    `${label} must define twitter.images`,
  );
  expect(
    !/twitter[\s\S]*\/og-image\.svg/.test(source),
    `${label} twitter metadata must not reference /og-image.svg`,
  );
}

for (const [label, source] of [
  ['layout', layout],
  ['marketing page', marketingPage],
]) {
  expect(
    !/openGraph[\s\S]*images[\s\S]*url\s*:\s*['"][^'"]+\.(svg|webp|gif)(?:[?#][^'"]*)?['"]/i.test(
      source,
    ),
    `${label} openGraph.images must not reference SVG, WebP, or GIF`,
  );
  expect(
    !/twitter[\s\S]*images[\s\S]*url\s*:\s*['"][^'"]+\.(svg|webp|gif)(?:[?#][^'"]*)?['"]/i.test(
      source,
    ),
    `${label} twitter.images must not reference SVG, WebP, or GIF`,
  );
}

expect(existsSync(opengraphPath), 'src/app/opengraph-image.tsx must exist');
expect(existsSync(twitterPath), 'src/app/twitter-image.tsx must exist');

expectMatch(
  opengraph,
  /export const size\s*=\s*{\s*width:\s*1200\s*,\s*height:\s*630\s*,?\s*}/s,
  'opengraph-image.tsx must export 1200x630 size',
);
expectMatch(
  opengraph,
  /export const contentType\s*=\s*['"]image\/png['"]/,
  'opengraph-image.tsx must export image/png contentType',
);
expect(
  !/var\(--/i.test(opengraph),
  'opengraph-image.tsx must not use CSS variables',
);
expect(
  !/display\s*:\s*['"]grid['"]/i.test(opengraph),
  'opengraph-image.tsx must not use CSS grid',
);
expect(
  !/display\s*:\s*`grid`/i.test(opengraph),
  'opengraph-image.tsx must not use template-literal grid display',
);
expect(
  !/\bzIndex\b|z-index/i.test(opengraph),
  'opengraph-image.tsx must not use zIndex or z-index',
);

expectMatch(
  twitter,
  /export const size\s*=\s*{\s*width:\s*1200\s*,\s*height:\s*630\s*,?\s*}/s,
  'twitter-image.tsx must export 1200x630 size',
);
expectMatch(
  twitter,
  /export const contentType\s*=\s*['"]image\/png['"]/,
  'twitter-image.tsx must export image/png contentType',
);
expect(
  !/var\(--/i.test(twitter),
  'twitter-image.tsx must not use CSS variables',
);
expect(
  !/display\s*:\s*['"]grid['"]/i.test(twitter),
  'twitter-image.tsx must not use CSS grid',
);
expect(
  !/display\s*:\s*`grid`/i.test(twitter),
  'twitter-image.tsx must not use template-literal grid display',
);
expect(
  !/\bzIndex\b|z-index/i.test(twitter),
  'twitter-image.tsx must not use zIndex or z-index',
);

console.log('metadata guardrail passed');
