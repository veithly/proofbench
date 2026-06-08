import { NextResponse } from "next/server";
import { evaluateOutput } from "@/lib/agents";
import type { EvaluatorMode, ProofBenchReceipt } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { receipt?: ProofBenchReceipt; mode?: EvaluatorMode };
    if (!body.receipt?.output?.outputHash) {
      return NextResponse.json({ error: "Missing receipt to replay." }, { status: 400 });
    }
    const mode = body.mode || "strict";
    const evaluation = evaluateOutput(body.receipt.output, mode);
    return NextResponse.json({
      replay: {
        originalReceiptId: body.receipt.id,
        mode,
        evaluation,
        changed: evaluation.verdict !== body.receipt.verdict || evaluation.score !== body.receipt.evaluation.score
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Replay failed." },
      { status: 500 }
    );
  }
}
