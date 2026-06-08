import { NextResponse } from "next/server";
import { QUOTE_GUARD_TASK } from "@/lib/agents";

export async function GET() {
  return NextResponse.json({ task: QUOTE_GUARD_TASK });
}
