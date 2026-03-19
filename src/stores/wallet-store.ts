/**
 * LUCIA Wallet Store
 * Multi-chain HD wallet using ethers (Ethereum) + @solana/web3.js (Solana)
 * Mnemonic generation via bip39, encrypted storage via IndexedDB (idb)
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ethers } from "ethers";
import { Keypair, Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as bip39 from "bip39";
import bs58 from "bs58";
import { openDB, type IDBPDatabase } from "idb";
import { v4 as uuidv4 } from "uuid";

// ── Types ──
export type ChainId = "ethereum" | "solana" | "thekie";

export interface WalletToken {
  symbol: string;
  name: string;
  chain: ChainId;
  balance: number;
  decimals: number;
  usdPrice: number;
  icon: string; // color code or emoji
  contractAddress?: string;
}

export interface WalletTx {
  id: string;
  chain: ChainId;
  type: "send" | "receive" | "swap" | "stake" | "settlement" | "reward";
  from: string;
  to: string;
  amount: number;
  symbol: string;
  timestamp: number;
  hash: string;
  status: "confirmed" | "pending" | "failed";
  fee?: number;
  memo?: string;
}

export interface WalletAccount {
  id: string;
  name: string;
  ethAddress: string;
  solAddress: string;
  tkAddress: string; // THEKIE Chain address
  createdAt: number;
}

export interface SecuritySettings {
  hasPassword: boolean;
  hasBiometric: boolean;
  has2FA: boolean;
  hasBackup: boolean;
  kycVerified: boolean;
  autoLockMinutes: number;
  connectedApps: { name: string; url: string; permissions: string[]; connectedAt: number }[];
}

// ── DB helpers ──
const DB_NAME = "lucia-wallet";
const DB_VERSION = 1;

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("keystore")) {
        db.createObjectStore("keystore");
      }
      if (!db.objectStoreNames.contains("accounts")) {
        db.createObjectStore("accounts", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings");
      }
    },
  });
}

// Simple XOR-based encryption for prototype (production would use AES-GCM via Web Crypto API)
function encryptData(data: string, password: string): string {
  const encoded = new TextEncoder().encode(data);
  const key = new TextEncoder().encode(password.padEnd(encoded.length, password));
  const encrypted = new Uint8Array(encoded.length);
  for (let i = 0; i < encoded.length; i++) {
    encrypted[i] = encoded[i] ^ key[i % key.length];
  }
  return btoa(String.fromCharCode(...encrypted));
}

function decryptData(encrypted: string, password: string): string {
  const data = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
  const key = new TextEncoder().encode(password.padEnd(data.length, password));
  const decrypted = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    decrypted[i] = data[i] ^ key[i % key.length];
  }
  return new TextDecoder().decode(decrypted);
}

// ── Store ──
export const useWalletStore = defineStore("wallet", () => {
  // State
  const isInitialized = ref(false);
  const isLocked = ref(true);
  const isCreating = ref(false);
  const currentAccount = ref<WalletAccount | null>(null);
  const mnemonic = ref<string | null>(null);
  const tokens = ref<WalletToken[]>([]);
  const transactions = ref<WalletTx[]>([]);
  const network = ref<"mainnet" | "testnet" | "devnet">("mainnet");
  const security = ref<SecuritySettings>({
    hasPassword: false,
    hasBiometric: false,
    has2FA: false,
    hasBackup: false,
    kycVerified: false,
    autoLockMinutes: 5,
    connectedApps: [],
  });

  // Computed
  const totalBalanceKRW = computed(() => {
    const krwRate = 1350; // USD to KRW
    return tokens.value.reduce((sum, t) => sum + t.balance * t.usdPrice * krwRate, 0);
  });

  const totalBalanceUSD = computed(() => {
    return tokens.value.reduce((sum, t) => sum + t.balance * t.usdPrice, 0);
  });

  const securityScore = computed(() => {
    let score = 0;
    if (security.value.hasPassword) score += 25;
    if (security.value.has2FA) score += 25;
    if (security.value.hasBackup) score += 25;
    if (security.value.kycVerified) score += 25;
    return score;
  });

  const tokensByChain = computed(() => {
    const grouped: Record<ChainId, WalletToken[]> = {
      ethereum: [],
      solana: [],
      thekie: [],
    };
    tokens.value.forEach(t => {
      grouped[t.chain].push(t);
    });
    return grouped;
  });

  // ── Wallet creation ──

  function generateMnemonic(): string {
    return bip39.generateMnemonic();
  }

  function validateMnemonic(phrase: string): boolean {
    return bip39.validateMnemonic(phrase);
  }

  async function createWallet(password: string, mnemonicPhrase?: string): Promise<WalletAccount> {
    isCreating.value = true;
    try {
      const phrase = mnemonicPhrase || generateMnemonic();

      // Ethereum HD wallet from mnemonic
      const ethWallet = ethers.HDNodeWallet.fromPhrase(phrase);

      // Solana keypair from seed
      const seed = await bip39.mnemonicToSeed(phrase);
      const solKeypair = Keypair.fromSeed(seed.slice(0, 32));

      // THEKIE chain address (derived from ETH address with TK prefix)
      const tkAddr = "TK" + ethWallet.address.slice(2, 42);

      const account: WalletAccount = {
        id: uuidv4(),
        name: "LUCIA Wallet #1",
        ethAddress: ethWallet.address,
        solAddress: solKeypair.publicKey.toBase58(),
        tkAddress: tkAddr,
        createdAt: Date.now(),
      };

      // Encrypt and store the mnemonic
      const db = await getDB();
      const encryptedMnemonic = encryptData(phrase, password);
      await db.put("keystore", encryptedMnemonic, "mnemonic");
      await db.put("keystore", encryptData(ethWallet.privateKey, password), "ethPrivateKey");
      await db.put("keystore", encryptData(bs58.encode(solKeypair.secretKey), password), "solPrivateKey");
      await db.put("accounts", account);
      await db.put("settings", password ? true : false, "hasPassword");

      // Set state
      currentAccount.value = account;
      mnemonic.value = phrase;
      isLocked.value = false;
      isInitialized.value = true;
      security.value.hasPassword = true;

      // Load mock token balances
      loadMockTokens();
      loadMockTransactions();

      return account;
    } finally {
      isCreating.value = false;
    }
  }

  async function importWallet(phrase: string, password: string): Promise<WalletAccount> {
    if (!validateMnemonic(phrase)) {
      throw new Error("Invalid mnemonic phrase");
    }
    return createWallet(password, phrase);
  }

  async function unlockWallet(password: string): Promise<boolean> {
    try {
      const db = await getDB();
      const encrypted = await db.get("keystore", "mnemonic");
      if (!encrypted) return false;

      const decrypted = decryptData(encrypted, password);
      if (!validateMnemonic(decrypted)) return false;

      mnemonic.value = decrypted;
      isLocked.value = false;

      // Load account
      const accounts = await db.getAll("accounts");
      if (accounts.length > 0) {
        currentAccount.value = accounts[0];
      }

      loadMockTokens();
      loadMockTransactions();
      return true;
    } catch {
      return false;
    }
  }

  function lockWallet() {
    isLocked.value = true;
    mnemonic.value = null;
  }

  async function checkExistingWallet(): Promise<boolean> {
    try {
      const db = await getDB();
      const encrypted = await db.get("keystore", "mnemonic");
      if (encrypted) {
        isInitialized.value = true;
        const accounts = await db.getAll("accounts");
        if (accounts.length > 0) {
          currentAccount.value = accounts[0];
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function deleteWallet(): Promise<void> {
    const db = await getDB();
    await db.clear("keystore");
    await db.clear("accounts");
    await db.clear("settings");
    currentAccount.value = null;
    mnemonic.value = null;
    tokens.value = [];
    transactions.value = [];
    isInitialized.value = false;
    isLocked.value = true;
    security.value = {
      hasPassword: false,
      hasBiometric: false,
      has2FA: false,
      hasBackup: false,
      kycVerified: false,
      autoLockMinutes: 5,
      connectedApps: [],
    };
  }

  // ── Token & balance management ──

  function loadMockTokens() {
    tokens.value = [
      {
        symbol: "ETH",
        name: "Ethereum",
        chain: "ethereum",
        balance: 1.2847,
        decimals: 18,
        usdPrice: 3452.80,
        icon: "#627EEA",
      },
      {
        symbol: "SOL",
        name: "Solana",
        chain: "solana",
        balance: 24.5,
        decimals: 9,
        usdPrice: 178.40,
        icon: "#9945FF",
      },
      {
        symbol: "TKE",
        name: "THEKIE Token",
        chain: "thekie",
        balance: 15000,
        decimals: 18,
        usdPrice: 2.85,
        icon: "#4F6AF5",
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        chain: "ethereum",
        balance: 5234.50,
        decimals: 6,
        usdPrice: 1.0,
        icon: "#26A17B",
        contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      },
      {
        symbol: "REC",
        name: "REC 인증서",
        chain: "thekie",
        balance: 42,
        decimals: 0,
        usdPrice: 31.48,
        icon: "#4ECDC4",
      },
      {
        symbol: "KAU",
        name: "한국탄소배출권",
        chain: "thekie",
        balance: 8,
        decimals: 0,
        usdPrice: 6.67,
        icon: "#FF6B6B",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        chain: "solana",
        balance: 1200.00,
        decimals: 6,
        usdPrice: 1.0,
        icon: "#2775CA",
        contractAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      },
    ];
  }

  function loadMockTransactions() {
    const now = Date.now();
    const hour = 3600000;
    const day = 86400000;
    const addr = currentAccount.value;

    transactions.value = [
      {
        id: uuidv4(),
        chain: "thekie",
        type: "settlement",
        from: "THEKIE Settlement Pool",
        to: addr?.tkAddress || "TK...",
        amount: 234500,
        symbol: "KRW",
        timestamp: now - 2 * hour,
        hash: "0x" + Array.from({ length: 16 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""),
        status: "confirmed",
        memo: "1월 정산금 — 용인 푸르지오 태양광",
      },
      {
        id: uuidv4(),
        chain: "thekie",
        type: "reward",
        from: "REC Registry",
        to: addr?.tkAddress || "TK...",
        amount: 5,
        symbol: "REC",
        timestamp: now - 6 * hour,
        hash: "0x" + Array.from({ length: 16 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""),
        status: "confirmed",
        memo: "REC 발급 — 음성 솔라파크",
      },
      {
        id: uuidv4(),
        chain: "ethereum",
        type: "receive",
        from: "0x3a9F...c8D2",
        to: addr?.ethAddress || "0x...",
        amount: 0.5,
        symbol: "ETH",
        timestamp: now - 1 * day,
        hash: "0x" + Array.from({ length: 16 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""),
        status: "confirmed",
      },
      {
        id: uuidv4(),
        chain: "solana",
        type: "receive",
        from: "7xKX...m4Dp",
        to: addr?.solAddress || "...",
        amount: 10.0,
        symbol: "SOL",
        timestamp: now - 1.5 * day,
        hash: Array.from({ length: 16 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""),
        status: "confirmed",
      },
      {
        id: uuidv4(),
        chain: "ethereum",
        type: "send",
        from: addr?.ethAddress || "0x...",
        to: "0xB7f8...4E21",
        amount: 1000,
        symbol: "USDT",
        timestamp: now - 2 * day,
        hash: "0x" + Array.from({ length: 16 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""),
        status: "confirmed",
        fee: 3.45,
      },
      {
        id: uuidv4(),
        chain: "thekie",
        type: "stake",
        from: addr?.tkAddress || "TK...",
        to: "THEKIE Staking Pool",
        amount: 5000,
        symbol: "TKE",
        timestamp: now - 3 * day,
        hash: "0x" + Array.from({ length: 16 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""),
        status: "confirmed",
        memo: "TKE 스테이킹 — 90일 락업",
      },
      {
        id: uuidv4(),
        chain: "solana",
        type: "swap",
        from: addr?.solAddress || "...",
        to: "Jupiter Aggregator",
        amount: 500,
        symbol: "USDC",
        timestamp: now - 4 * day,
        hash: Array.from({ length: 16 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""),
        status: "confirmed",
        memo: "USDC → SOL 스왑",
      },
      {
        id: uuidv4(),
        chain: "thekie",
        type: "settlement",
        from: "THEKIE Settlement Pool",
        to: addr?.tkAddress || "TK...",
        amount: 189200,
        symbol: "KRW",
        timestamp: now - 5 * day,
        hash: "0x" + Array.from({ length: 16 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join(""),
        status: "confirmed",
        memo: "12월 정산금 — 영덕 바람언덕 풍력",
      },
    ];
  }

  // ── Address utilities ──

  function shortenAddress(address: string, chars = 4): string {
    if (!address) return "";
    if (address.startsWith("0x") || address.startsWith("TK")) {
      return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
    }
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  }

  function getExplorerUrl(chain: ChainId, hash: string): string {
    switch (chain) {
      case "ethereum":
        return `https://etherscan.io/tx/${hash}`;
      case "solana":
        return `https://solscan.io/tx/${hash}`;
      case "thekie":
        return `#/transparency/tx/${hash}`;
      default:
        return "#";
    }
  }

  // ── Security ──

  function toggleSecurity(key: keyof Pick<SecuritySettings, "has2FA" | "hasBackup" | "hasBiometric">) {
    security.value[key] = !security.value[key];
  }

  function addConnectedApp(name: string, url: string, permissions: string[]) {
    security.value.connectedApps.push({
      name,
      url,
      permissions,
      connectedAt: Date.now(),
    });
  }

  function removeConnectedApp(index: number) {
    security.value.connectedApps.splice(index, 1);
  }

  // Initialize — check if wallet exists on store creation
  async function init() {
    await checkExistingWallet();
    if (isInitialized.value) {
      // Load security settings
      security.value.hasPassword = true;
      security.value.kycVerified = true; // mock
      security.value.hasBackup = false;
      security.value.has2FA = false;
      security.value.connectedApps = [
        { name: "THEKIE Platform", url: "thekie.com", permissions: ["view_balance", "sign_transactions"], connectedAt: Date.now() - 86400000 * 7 },
        { name: "Jupiter DEX", url: "jup.ag", permissions: ["swap_tokens"], connectedAt: Date.now() - 86400000 * 3 },
      ];
    }
  }

  return {
    // State
    isInitialized,
    isLocked,
    isCreating,
    currentAccount,
    mnemonic,
    tokens,
    transactions,
    network,
    security,
    // Computed
    totalBalanceKRW,
    totalBalanceUSD,
    securityScore,
    tokensByChain,
    // Actions
    generateMnemonic,
    validateMnemonic,
    createWallet,
    importWallet,
    unlockWallet,
    lockWallet,
    checkExistingWallet,
    deleteWallet,
    shortenAddress,
    getExplorerUrl,
    toggleSecurity,
    addConnectedApp,
    removeConnectedApp,
    init,
  };
});
