type QaEdgeStatesEnv = Partial<
  Pick<
    NodeJS.ProcessEnv,
    'NODE_ENV' | 'NEXT_PUBLIC_WINOE_ENABLE_QA_EDGE_STATES' | 'VERCEL_ENV'
  >
>;

export function qaEdgeStatesEnabled(env: QaEdgeStatesEnv = process.env) {
  return env.NODE_ENV !== 'production';
}
