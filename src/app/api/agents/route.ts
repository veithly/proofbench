import { NextResponse } from "next/server";
import { AGENT_MANIFESTS } from "@/lib/agents";

export async function GET() {
  return NextResponse.json({ agents: AGENT_MANIFESTS });
}
