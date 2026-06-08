import { NextResponse } from "next/server";
import { createPublicClient, formatEther, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

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

export async function GET() {
  const privateKeyValue = process.env.PRIVATE_KEY;
  const privateKey = privateKeyValue ? (privateKeyValue.startsWith("0x") ? privateKeyValue : `0x${privateKeyValue}`) as `0x${string}` : undefined;
  const emitterAddress = process.env.PROOFBENCH_EMITTER_ADDRESS || "";
  if (!privateKey) {
    return NextResponse.json({
      ok: false,
      chain: mantleSepolia.name,
      chainId: mantleSepolia.id,
      emitterAddress,
      configured: false,
      limitation: "PRIVATE_KEY is not configured, so ProofBench can generate calldata but cannot submit a Sepolia event."
    });
  }

  try {
    const account = privateKeyToAccount(privateKey);
    const client = createPublicClient({
      chain: mantleSepolia,
      transport: http(process.env.MANTLE_SEPOLIA_RPC_URL || "https://rpc.sepolia.mantle.xyz")
    });
    const balance = await client.getBalance({ address: account.address });
    return NextResponse.json({
      ok: true,
      chain: mantleSepolia.name,
      chainId: mantleSepolia.id,
      address: account.address,
      explorerUrl: `${mantleSepolia.blockExplorers.default.url}/address/${account.address}`,
      balanceWei: balance.toString(),
      balanceNative: formatEther(balance),
      emitterAddress,
      emitterExplorerUrl: emitterAddress ? `${mantleSepolia.blockExplorers.default.url}/address/${emitterAddress}` : "",
      configured: Boolean(emitterAddress && balance > 0n),
      limitation: emitterAddress ? "" : "PROOFBENCH_EMITTER_ADDRESS is missing, so receipts stop at ready calldata."
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Demo wallet status failed." },
      { status: 500 }
    );
  }
}
