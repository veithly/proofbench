import { stableHash } from "@/lib/hash";
import { buildReadyCalldata, buildReceiptEventPayload } from "@/lib/ledger";
import type { AgentManifest, AgentOutput, EvaluationResult, GuestSession, ProofBenchReceipt, QuoteGuardTask } from "@/lib/types";

export function makeReceiptId(receiptHash: string) {
  return `pb_${receiptHash.replace(/^0x/, "").slice(0, 12)}`;
}

export function buildReceipt({
  session,
  task,
  agent,
  output,
  evaluation,
  reputationBefore
}: {
  session: GuestSession;
  task: QuoteGuardTask;
  agent: AgentManifest;
  output: AgentOutput;
  evaluation: EvaluationResult;
  reputationBefore: number;
}): ProofBenchReceipt {
  const createdAt = new Date().toISOString();
  const payoutState = evaluation.verdict === "pass" ? "paid" : "no_payout";
  const reputationAfter = Math.max(0, reputationBefore + evaluation.reputationDelta);
  const canonical = {
    createdAtBucket: createdAt.slice(0, 16),
    sessionId: session.sessionId,
    ownerId: session.ownerId,
    taskHash: task.fixtureHash,
    agentId: agent.id,
    agentManifestHash: agent.manifestHash,
    outputHash: output.outputHash,
    evaluatorRulesHash: evaluation.evaluator.rulesHash,
    verdict: evaluation.verdict,
    score: evaluation.score,
    payoutState,
    payoutMnt: evaluation.payoutMnt,
    reputationDelta: evaluation.reputationDelta
  };
  const receiptHash = stableHash(canonical);
  const eventPayload = buildReceiptEventPayload({
    agent,
    task,
    output,
    evaluation,
    receiptHash
  });

  return {
    id: makeReceiptId(receiptHash),
    createdAt,
    sessionId: session.sessionId,
    userId: session.userId,
    ownerId: session.ownerId,
    task,
    agent,
    output,
    evaluation,
    verdict: evaluation.verdict,
    payoutState,
    payoutMnt: evaluation.payoutMnt,
    reputationBefore,
    reputationDelta: evaluation.reputationDelta,
    reputationAfter,
    receiptHash,
    proof: {
      chainId: 5003,
      chainName: "Mantle Sepolia",
      status: "ready_calldata",
      calldata: buildReadyCalldata(eventPayload),
      eventPayload,
      limitation: "Relayer key not configured; receipt is ready to notarize on Mantle Sepolia."
    }
  };
}

export function verdictLabel(verdict: ProofBenchReceipt["verdict"]) {
  if (verdict === "pass") return "PASS";
  if (verdict === "fail") return "FAIL";
  return "ERROR";
}
