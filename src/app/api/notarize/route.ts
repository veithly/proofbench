import { NextResponse } from "next/server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { buildLedgerCalldata } from "@/lib/ledger";
import type { ProofBenchReceipt } from "@/lib/types";

const mantleSepolia = {
  id: 5003,
  name: "Mantle Sepolia",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.MANTLE_SEPOLIA_RPC_URL || "https://rpc.sepolia.mantle.xyz"] }
  },
  blockExplorers: {
    default: { name: "Mantle Sepolia Explorer", url: "https://explorer.sepolia.mantle.xyz" }
  }
} as const;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { receipt?: ProofBenchReceipt };
    if (!body.receipt?.receiptHash) {
      return NextResponse.json({ error: "Missing receipt to notarize." }, { status: 400 });
    }

    const calldata = buildLedgerCalldata(body.receipt);
    const address = process.env.PROOFBENCH_EMITTER_ADDRESS as `0x${string}` | undefined;
    const privateKey = process.env.PRIVATE_KEY as `0x${string}` | undefined;

    if (!address || !privateKey) {
      return NextResponse.json({
        proof: {
          ...body.receipt.proof,
          status: "ready_calldata",
          calldata,
          limitation: "Set PROOFBENCH_EMITTER_ADDRESS and PRIVATE_KEY to submit this receipt on Mantle Sepolia."
        }
      });
    }

    const account = privateKeyToAccount(privateKey);
    const client = createWalletClient({
      account,
      chain: mantleSepolia,
      transport: http(process.env.MANTLE_SEPOLIA_RPC_URL || "https://rpc.sepolia.mantle.xyz")
    });
    const txHash = await client.sendTransaction({ to: address, data: calldata, value: 0n });

    return NextResponse.json({
      proof: {
        ...body.receipt.proof,
        status: "sepolia_anchored",
        calldata,
        txHash,
        explorerUrl: `https://explorer.sepolia.mantle.xyz/tx/${txHash}`,
        limitation: ""
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Notarization failed." },
      { status: 500 }
    );
  }
}
