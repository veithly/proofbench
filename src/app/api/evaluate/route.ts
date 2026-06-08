import { NextResponse } from "next/server";
import { evaluateOutput } from "@/lib/agents";
import type { AgentOutput, EvaluatorMode } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { output?: AgentOutput; mode?: EvaluatorMode };
    if (!body.output?.outputHash) {
      return NextResponse.json({ error: "Missing agent output." }, { status: 400 });
    }
    const evaluation = evaluateOutput(body.output, body.mode || "standard");
    return NextResponse.json({ evaluation });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Evaluation failed." },
      { status: 500 }
    );
  }
}
