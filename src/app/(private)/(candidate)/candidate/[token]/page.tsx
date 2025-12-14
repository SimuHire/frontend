import { notFound } from "next/navigation";
import CandidateSimulationContent from "./CandidateSimulationContent";

export default function CandidatePage({ params }: { params: { token?: string } }) {
  const token = params?.token;

  if (!token) notFound();

  return <CandidateSimulationContent token={token} />;
}
