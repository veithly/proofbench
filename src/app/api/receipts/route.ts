import { NextResponse } from "next/server";
import { getAgent, QUOTE_GUARD_TASK } from "@/lib/agents";
import { buildReceipt } from "@/lib/receipts";
import type { AgentOutput, EvaluationResult, GuestSession } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      session?: GuestSession;
      output?: AgentOutput;
      evaluation?: EvaluationResult;
      reputationBefore?: number;
    };
    if (!body.session?.sessionId || !body.output?.agentId || !body.evaluation) {
      return NextResponse.json({ error: "Missing receipt inputs." }, { status: 400 });
    }
    const agent = getAgent(body.output.agentId);
    const receipt = buildReceipt({
      session: body.session,
      task: QUOTE_GUARD_TASK,
      agent,
      output: body.output,
      evaluation: body.evaluation,
      reputationBefore: body.reputationBefore ?? agent.startingReputation
    });
    return NextResponse.json({ receipt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Receipt build failed." },
      { status: 500 }
    );
  }
}
