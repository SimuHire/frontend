import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        backgroundColor: 'rgb(18, 15, 11)',
        color: 'rgb(247, 241, 227)',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-160px',
          right: '-80px',
          width: '420px',
          height: '420px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(201, 166, 107, 0.24)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-180px',
          left: '-120px',
          width: '360px',
          height: '360px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '18px',
              height: '72px',
              borderRadius: '9999px',
              backgroundColor: 'rgb(201, 166, 107)',
              boxShadow: '0 0 0 6px rgba(201, 166, 107, 0.14)',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                fontSize: '54px',
                lineHeight: '1',
                fontWeight: 700,
                letterSpacing: '-0.04em',
              }}
            >
              Winoe
            </div>
            <div
              style={{
                fontSize: '18px',
                lineHeight: '1',
                color: 'rgb(217, 196, 155)',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              Winoe AI
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 18px',
            borderRadius: '9999px',
            border: '1px solid rgba(201, 166, 107, 0.45)',
            backgroundColor: 'rgba(201, 166, 107, 0.12)',
            color: 'rgb(247, 241, 227)',
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          Talent Intelligence Agent
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
          maxWidth: '860px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '18px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgb(217, 196, 155)',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '1px',
              backgroundColor: 'rgb(201, 166, 107)',
            }}
          />
          Reveal the real hire
        </div>

        <div
          style={{
            fontSize: '72px',
            lineHeight: '1.02',
            fontWeight: 700,
            letterSpacing: '-0.05em',
            color: 'rgb(255, 248, 236)',
            maxWidth: '900px',
          }}
        >
          Prove it with work.
        </div>

        <div
          style={{
            fontSize: '28px',
            lineHeight: '1.4',
            color: 'rgb(232, 220, 192)',
            maxWidth: '760px',
          }}
        >
          Winoe Reports, Winoe Scores, and an Evidence Trail that makes each
          Trial measurable.
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '20px',
          color: 'rgb(217, 196, 155)',
        }}
      >
        <div>Real-work Trials for hiring</div>
        <div style={{ color: 'rgb(255, 248, 236)' }}>winoe.ai</div>
      </div>
    </div>,
    {
      ...size,
    },
  );
}
