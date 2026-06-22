#!/usr/bin/env node
/**
 * Generates public/marketing/winoe-report-preview.png — a high-fidelity
 * Winoe Report placeholder for the public landing page.
 *
 * Color literals mirror src/app/globals.css Warm-Wheat + semantic tokens
 * (ImageResponse cannot consume CSS variables).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { ImageResponse } from 'next/og.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../public/marketing');
const outPath = join(outDir, 'winoe-report-preview.png');

// Warm-Wheat scale — mirrors :root --wheat-* in globals.css
const WHEAT_50 = '#fbf7ee';
const WHEAT_300 = '#e2c189';
const WHEAT_500 = '#c9a66b';
const WHEAT_700 = '#9a7750';
const WHEAT_900 = '#4e3b25';

// Semantic surfaces — mirrors :root --bg-* / --text-* / --border-* in globals.css
const BG_PRIMARY = '#fafaf7';
const BG_ELEVATED = '#ffffff';
const TEXT_PRIMARY = '#0f172a';
const TEXT_SECONDARY = '#475569';
const TEXT_TERTIARY = '#94a3b8';
const BORDER_SUBTLE = 'rgba(15, 23, 42, 0.08)';

mkdirSync(outDir, { recursive: true });

const dimensions = [
  { name: 'Architecture & Design', score: 88 },
  { name: 'Implementation Quality', score: 86 },
  { name: 'Testing Discipline', score: 79 },
  { name: 'Communication', score: 82 },
];

const evidence = [
  'Commit 41 · layered project scaffold before business logic',
  'Design doc §3 · scalability tradeoffs documented',
  'Demo transcript 02:14 · API error handling walkthrough',
];

function DimensionBar({ name, score }) {
  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 16,
        borderRadius: 16,
        border: `1px solid ${BORDER_SUBTLE}`,
        backgroundColor: BG_ELEVATED,
      },
    },
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      },
      React.createElement(
        'div',
        {
          style: {
            fontSize: 14,
            fontWeight: 600,
            color: TEXT_PRIMARY,
          },
        },
        name,
      ),
      React.createElement(
        'div',
        {
          style: {
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: TEXT_SECONDARY,
          },
        },
        `${score}`,
      ),
    ),
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          height: 6,
          borderRadius: 9999,
          backgroundColor: WHEAT_50,
          overflow: 'hidden',
        },
      },
      React.createElement('div', {
        style: {
          width: `${score}%`,
          height: '100%',
          borderRadius: 9999,
          background: `linear-gradient(90deg, ${WHEAT_300}, ${WHEAT_700})`,
        },
      }),
    ),
  );
}

function EvidenceItem({ text }) {
  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        fontSize: 13,
        lineHeight: 1.5,
        color: TEXT_SECONDARY,
      },
    },
    React.createElement('div', {
      style: {
        width: 8,
        height: 8,
        marginTop: 6,
        borderRadius: 9999,
        backgroundColor: WHEAT_500,
        flexShrink: 0,
      },
    }),
    React.createElement('div', null, text),
  );
}

const element = React.createElement(
  'div',
  {
    style: {
      display: 'flex',
      width: '100%',
      height: '100%',
      backgroundColor: BG_PRIMARY,
      padding: 40,
      fontFamily: 'Inter, Arial, sans-serif',
    },
  },
  React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        borderRadius: 20,
        border: `1px solid ${BORDER_SUBTLE}`,
        backgroundColor: BG_ELEVATED,
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
      },
    },
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 32px',
          borderBottom: `1px solid ${BORDER_SUBTLE}`,
        },
      },
      React.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
        React.createElement(
          'div',
          {
            style: {
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: TEXT_SECONDARY,
            },
          },
          'Winoe Report',
        ),
        React.createElement(
          'div',
          {
            style: {
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: TEXT_PRIMARY,
            },
          },
          'Jordan Lee · Mid-Level Backend Engineer',
        ),
        React.createElement(
          'div',
          { style: { fontSize: 14, color: TEXT_SECONDARY } },
          'Generated May 26, 2026',
        ),
      ),
      React.createElement(
        'div',
        {
          style: {
            padding: '10px 16px',
            borderRadius: 8,
            border: `1px solid ${WHEAT_300}`,
            backgroundColor: WHEAT_50,
            color: WHEAT_900,
            fontSize: 13,
            fontWeight: 600,
          },
        },
        'Evidence Trail attached',
      ),
    ),
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          flex: 1,
          padding: 32,
          gap: 32,
        },
      },
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 320,
            flexShrink: 0,
          },
        },
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            },
          },
          React.createElement(
            'svg',
            {
              width: 220,
              height: 220,
              viewBox: '0 0 220 220',
            },
            React.createElement('circle', {
              cx: 110,
              cy: 110,
              r: 96,
              fill: 'none',
              stroke: BORDER_SUBTLE,
              strokeWidth: 12,
            }),
            React.createElement('circle', {
              cx: 110,
              cy: 110,
              r: 96,
              fill: 'none',
              stroke: WHEAT_500,
              strokeWidth: 12,
              strokeLinecap: 'round',
              strokeDasharray: 603,
              strokeDashoffset: 96,
              transform: 'rotate(-90 110 110)',
            }),
          ),
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: -150,
              },
            },
            React.createElement(
              'div',
              {
                style: {
                  fontSize: 56,
                  fontWeight: 700,
                  color: TEXT_PRIMARY,
                  lineHeight: 1,
                },
              },
              '84',
            ),
            React.createElement(
              'div',
              {
                style: {
                  marginTop: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: TEXT_SECONDARY,
                },
              },
              'Winoe Score',
            ),
          ),
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                padding: '6px 12px',
                borderRadius: 9999,
                border: `1px solid ${WHEAT_300}`,
                backgroundColor: WHEAT_50,
                color: WHEAT_900,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              },
            },
            'Strong signal',
          ),
        ),
      ),
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            gap: 20,
          },
        },
        React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
          React.createElement(
            'div',
            {
              style: {
                fontSize: 20,
                fontWeight: 700,
                color: TEXT_PRIMARY,
              },
            },
            'Dimensional Breakdown',
          ),
          React.createElement(
            'div',
            { style: { fontSize: 14, color: TEXT_SECONDARY } },
            'Eight dimensions, one artifact-backed view of the Trial.',
          ),
        ),
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            },
          },
          ...dimensions.map((item) =>
            React.createElement(DimensionBar, {
              key: item.name,
              name: item.name,
              score: item.score,
            }),
          ),
        ),
      ),
    ),
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '20px 32px 28px',
          borderTop: `1px solid ${BORDER_SUBTLE}`,
          backgroundColor: WHEAT_50,
        },
      },
      React.createElement(
        'div',
        {
          style: {
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: WHEAT_700,
          },
        },
        'Evidence Trail · cited artifacts',
      ),
      ...evidence.map((item) =>
        React.createElement(EvidenceItem, { key: item, text: item }),
      ),
      React.createElement(
        'div',
        {
          style: {
            marginTop: 4,
            fontSize: 12,
            color: TEXT_TERTIARY,
          },
        },
        'Every sub-score links to inspectable work from the five-day Trial.',
      ),
    ),
  ),
);

const response = new ImageResponse(element, {
  width: 1400,
  height: 900,
});

const buffer = Buffer.from(await response.arrayBuffer());
writeFileSync(outPath, buffer);
console.log(`Wrote ${outPath} (${buffer.length} bytes)`);
