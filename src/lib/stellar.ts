import {
  isConnected,
  isAllowed,
  setAllowed,
  requestAccess,
  getAddress,
  getNetworkDetails,
  signTransaction,
} from "@stellar/freighter-api";
import {
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
  Memo,
} from "@stellar/stellar-sdk";

// ---- Network config: this app only ever talks to Stellar Testnet ----
export const TESTNET_PASSPHRASE = Networks.TESTNET;
export const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";
export const FRIENDBOT_URL = "https://friendbot.stellar.org";

export const horizonServer = new Horizon.Server(HORIZON_TESTNET_URL);

export interface WalletState {
  isFreighterInstalled: boolean;
  publicKey: string | null;
  network: string | null;
}

/** Checks whether the Freighter browser extension is installed at all. */
export async function checkFreighterInstalled(): Promise<boolean> {
  const result = await isConnected();
  return !result.error;
}

/**
 * Connects to Freighter: requests the user's permission (if not already
 * granted) and returns their public key + the network Freighter is set to.
 */
export async function connectWallet(): Promise<{
  publicKey: string;
  network: string;
}> {
  const installed = await checkFreighterInstalled();
  if (!installed) {
    throw new Error(
      "Freighter wallet extension not found. Install it from freighter.app and refresh the page."
    );
  }

  const allowed = await isAllowed();
  if (!allowed.isAllowed) {
    const setAllowedResult = await setAllowed();
    if (setAllowedResult.error) {
      throw new Error(setAllowedResult.error.message);
    }
  }

  const access = await requestAccess();
  if (access.error) {
    throw new Error(access.error.message);
  }

  const addressResult = await getAddress();
  if (addressResult.error) {
    throw new Error(addressResult.error.message);
  }

  const networkDetails = await getNetworkDetails();
  if (networkDetails.error) {
    throw new Error(networkDetails.error.message);
  }

  if (networkDetails.networkPassphrase !== TESTNET_PASSPHRASE) {
    throw new Error(
      `Freighter is set to "${networkDetails.network}". Switch Freighter to Test Net in its network settings and reconnect.`
    );
  }

  return { publicKey: addressResult.address, network: networkDetails.network };
}

/**
 * "Disconnecting" a Freighter session is a client-side concept only -
 * Freighter itself doesn't expose a revoke call, so we just clear local state.
 */
export function disconnectWallet(): void {
  // No SDK-level teardown is needed; the caller clears its own React state.
  // Left as an explicit function so the disconnect flow is a first-class,
  // testable/loggable action rather than being implicit.
}

/** Fetches the native XLM balance for a given public key from Horizon testnet. */
export async function fetchXlmBalance(publicKey: string): Promise<string> {
  try {
    const account = await horizonServer.loadAccount(publicKey);
    const native = account.balances.find(
      (b) => b.asset_type === "native"
    ) as Horizon.HorizonApi.BalanceLineNative | undefined;
    return native?.balance ?? "0";
  } catch (err: any) {
    if (err?.response?.status === 404) {
      // Account doesn't exist on testnet yet (never funded).
      throw new Error(
        "Account not found on testnet. Fund it first using Friendbot."
      );
    }
    throw err;
  }
}

/** Requests testnet XLM for a public key from Friendbot (only works on testnet). */
export async function fundWithFriendbot(publicKey: string): Promise<void> {
  const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Friendbot funding failed: ${body}`);
  }
}

export interface SendPaymentResult {
  hash: string;
  ledger?: number;
}

/**
 * Builds a native XLM payment transaction, sends it to Freighter for signing,
 * then submits the signed transaction to Horizon testnet.
 */
export async function sendPayment(
  sourcePublicKey: string,
  destination: string,
  amount: string,
  memo?: string
): Promise<SendPaymentResult> {
  const sourceAccount = await horizonServer.loadAccount(sourcePublicKey);

  const txBuilder = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: TESTNET_PASSPHRASE,
  }).addOperation(
    Operation.payment({
      destination,
      asset: Asset.native(),
      amount,
    })
  );

  if (memo) {
    txBuilder.addMemo(Memo.text(memo));
  }

  const transaction = txBuilder.setTimeout(60).build();

  const signResult = await signTransaction(transaction.toXDR(), {
    address: sourcePublicKey,
    networkPassphrase: TESTNET_PASSPHRASE,
  });

  if (signResult.error) {
    throw new Error(signResult.error.message);
  }

  const signedTx = TransactionBuilder.fromXDR(
    signResult.signedTxXdr,
    TESTNET_PASSPHRASE
  );

  const submitResult = await horizonServer.submitTransaction(signedTx);

  return { hash: submitResult.hash, ledger: submitResult.ledger };
}

/** Basic format check before we even try to build a transaction. */
export function isValidStellarAddress(address: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(address.trim());
}
