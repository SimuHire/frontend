import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = join(process.cwd(), 'qa_verifications/landing-page');
mkdirSync(outDir, { recursive: true });

const baseUrl = process.env.LANDING_QA_BASE_URL ?? 'http://127.0.0.1:3456';

const viewports = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 900 },
  { name: 'mobile-375', width: 375, height: 812 },
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const viewport of viewports) {
  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height,
  });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
  await page.screenshot({
    path: join(outDir, `landing-${viewport.name}.png`),
    fullPage: true,
  });
}

await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle' });
await page.screenshot({
  path: join(outDir, 'login-page-1280.png'),
  fullPage: true,
});

await browser.close();
console.log(`Saved landing QA screenshots to ${outDir}`);
