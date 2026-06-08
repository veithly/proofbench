import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    project: "ProofBench",
    chain: {
      name: "Mantle Sepolia",
      chainId: 5003,
      rpcUrl: process.env.MANTLE_SEPOLIA_RPC_URL || "https://rpc.sepolia.mantle.xyz",
      explorerUrl: "https://explorer.sepolia.mantle.xyz"
    },
    contract: {
      emitterAddress: process.env.PROOFBENCH_EMITTER_ADDRESS || "",
      configured: Boolean(process.env.PROOFBENCH_EMITTER_ADDRESS && process.env.PRIVATE_KEY)
    },
    evaluator: {
      id: "quote_guard_evaluator",
      version: "v1.0.0"
    }
  });
}
