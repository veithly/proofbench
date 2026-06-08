import { encodeFunctionData } from "viem";
import { stableHash } from "@/lib/hash";
import type { AgentManifest, AgentOutput, EvaluationResult, MantleProof, ProofBenchReceipt, QuoteGuardTask } from "@/lib/types";

export const proofBenchReceiptEmitterAbi = [
  {
    type: "function",
    name: "recordReceipt",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentIdHash", type: "bytes32" },
      { name: "taskHash", type: "bytes32" },
      { name: "outputHash", type: "bytes32" },
      { name: "receiptHash", type: "bytes32" },
      { name: "verdict", type: "uint8" },
      { name: "payoutMnt", type: "uint256" },
      { name: "reputationDelta", type: "int256" }
    ],
    outputs: []
  }
] as const;

function bytes32(value: string) {
  if (/^0x[0-9a-fA-F]{64}$/.test(value)) return value as `0x${string}`;
  return stableHash(value) as `0x${string}`;
}

function verdictNumber(verdict: EvaluationResult["verdict"]) {
  if (verdict === "pass") return 1;
  if (verdict === "fail") return 2;
  return 3;
}

export function buildReceiptEventPayload({
  agent,
  task,
  output,
  evaluation,
  receiptHash
}: {
  agent: AgentManifest;
  task: QuoteGuardTask;
  output: AgentOutput;
  evaluation: EvaluationResult;
  receiptHash: string;
}): MantleProof["eventPayload"] {
  return {
    agentIdHash: stableHash(agent.id),
    taskHash: task.fixtureHash,
    outputHash: output.outputHash,
    receiptHash,
    verdict: evaluation.verdict,
    payoutMnt: evaluation.payoutMnt,
    reputationDelta: evaluation.reputationDelta
  };
}

export function buildReadyCalldata(payload: MantleProof["eventPayload"]) {
  return encodeFunctionData({
    abi: proofBenchReceiptEmitterAbi,
    functionName: "recordReceipt",
    args: [
      bytes32(payload.agentIdHash),
      bytes32(payload.taskHash),
      bytes32(payload.outputHash),
      bytes32(payload.receiptHash),
      verdictNumber(payload.verdict),
      BigInt(Math.round(payload.payoutMnt * 1_000_000)),
      BigInt(payload.reputationDelta)
    ]
  });
}

export function buildLedgerCalldata(receipt: ProofBenchReceipt) {
  return buildReadyCalldata(receipt.proof.eventPayload);
}
