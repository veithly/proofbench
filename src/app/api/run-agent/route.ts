import { NextResponse } from "next/server";
import { getAgent, QUOTE_GUARD_TASK, runAgentTask } from "@/lib/agents";
import type { AgentId } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { agentId?: AgentId; taskId?: string };
    if (!body.agentId) {
      return NextResponse.json({ error: "Choose an agent before running the task." }, { status: 400 });
    }
    if (body.taskId && body.taskId !== QUOTE_GUARD_TASK.taskId) {
      return NextResponse.json({ error: "Unknown quote-guard task." }, { status: 400 });
    }
    const agent = getAgent(body.agentId);
    const output = runAgentTask(agent.id);
    return NextResponse.json({ agent, output });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Agent run failed." },
      { status: 500 }
    );
  }
}
