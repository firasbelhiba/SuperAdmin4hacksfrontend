import { Metadata } from "next";
import DiagnosticDetailClient from "./DiagnosticDetailClient";

export const metadata: Metadata = {
  title: "Hackathon Diagnostic | Health Dashboard",
  description: "Detailed diagnostic view for a specific hackathon",
};

export default async function DiagnosticDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DiagnosticDetailClient hackathonId={id} />;
}
