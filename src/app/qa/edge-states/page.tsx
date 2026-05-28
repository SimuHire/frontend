import { notFound } from 'next/navigation';
import EdgeStatesClient from './EdgeStatesClient';
import { qaEdgeStatesEnabled } from './qaEdgeStatesGate';

export default function QaEdgeStatesPage() {
  if (!qaEdgeStatesEnabled()) {
    notFound();
  }

  return <EdgeStatesClient />;
}
