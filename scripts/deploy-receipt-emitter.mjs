#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import solc from "solc";
import { createPublicClient, createWalletClient, formatEther, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const SOURCE_PATH = join(ROOT, "contracts", "ProofBenchReceiptEmitter.sol");
const OUT_PATH = join(ROOT, "contracts", "deployments", "mantle-sepolia.json");

function readEnvFile(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

function pickEnv(name) {
  const local = process.env[name];
  if (local) return local.trim();
  const envText = `${readEnvFile(join(ROOT, ".env.local"))}\n${readEnvFile(`${process.env.HOME}/use_key.txt`)}`;
  const match = envText.match(new RegExp(`^${name}=(.+)$`, "m"));
  return match?.[1]?.trim();
}

function requireEnv(name) {
  const value = pickEnv(name);
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function compile() {
  const source = readFileSync(SOURCE_PATH, "utf8");
  const input = {
    language: "Solidity",
    sources: {
      "ProofBenchReceiptEmitter.sol": {
        content: source
      }
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"]
        }
      }
    }
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = output.errors?.filter((item) => item.severity === "error") || [];
  if (errors.length) throw new Error(errors.map((item) => item.formattedMessage).join("\n"));
  const contract = output.contracts["ProofBenchReceiptEmitter.sol"].ProofBenchReceiptEmitter;
  return {
    abi: contract.abi,
    bytecode: `0x${contract.evm.bytecode.object}`
  };
}

const mantleSepolia = {
  id: 5003,
  name: "Mantle Sepolia",
  nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
  rpcUrls: {
    default: { http: [pickEnv("MANTLE_SEPOLIA_RPC_URL") || "https://rpc.sepolia.mantle.xyz"] }
  },
  blockExplorers: {
    default: { name: "Mantle Sepolia Explorer", url: "https://explorer.sepolia.mantle.xyz" }
  }
};

async function main() {
  const privateKeyRaw = requireEnv("PRIVATE_KEY");
  const privateKey = privateKeyRaw.startsWith("0x") ? privateKeyRaw : `0x${privateKeyRaw}`;
  const account = privateKeyToAccount(privateKey);
  const rpcUrl = mantleSepolia.rpcUrls.default.http[0];
  const transport = http(rpcUrl);
  const publicClient = createPublicClient({ chain: mantleSepolia, transport });
  const walletClient = createWalletClient({ account, chain: mantleSepolia, transport });
  const before = await publicClient.getBalance({ address: account.address });
  if (before === 0n) throw new Error(`Relayer ${account.address} has 0 MNT on Mantle Sepolia`);

  const { abi, bytecode } = compile();
  const hash = await walletClient.deployContract({ abi, bytecode, args: [] });
  const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
  if (!receipt.contractAddress) throw new Error("Deployment receipt did not include a contract address");
  const after = await publicClient.getBalance({ address: account.address });
  const artifact = {
    network: "mantle-sepolia",
    chainId: 5003,
    rpcUrl,
    deployer: account.address,
    contractName: "ProofBenchReceiptEmitter",
    contractAddress: receipt.contractAddress,
    deploymentTxHash: hash,
    deploymentExplorerUrl: `${mantleSepolia.blockExplorers.default.url}/tx/${hash}`,
    contractExplorerUrl: `${mantleSepolia.blockExplorers.default.url}/address/${receipt.contractAddress}`,
    blockNumber: receipt.blockNumber.toString(),
    gasUsed: receipt.gasUsed.toString(),
    balanceBeforeMnt: formatEther(before),
    balanceAfterMnt: formatEther(after),
    deployedAt: new Date().toISOString()
  };
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, `${JSON.stringify(artifact, null, 2)}\n`);
  console.log(JSON.stringify(artifact, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
