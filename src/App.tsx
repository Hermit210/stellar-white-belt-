import { useCallback, useEffect, useState } from "react";
import "./App.css";
import {
  connectWallet,
  disconnectWallet,
  fetchXlmBalance,
  fundWithFriendbot,
  sendPayment,
  isValidStellarAddress,
  type SendPaymentResult,
} from "./lib/stellar";
import WalletPanel from "./components/WalletPanel";
import SendPaymentForm from "./components/SendPaymentForm";
import TxFeedback from "./components/TxFeedback";

export type TxState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "success"; result: SendPaymentResult; note?: string }
  | { status: "error"; message: string };

function App() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [funding, setFunding] = useState(false);
  const [txState, setTxState] = useState<TxState>({ status: "idle" });

  const refreshBalance = useCallback(async (key: string) => {
    setBalanceLoading(true);
    setBalanceError(null);
    try {
      const bal = await fetchXlmBalance(key);
      setBalance(bal);
    } catch (err: any) {
      setBalanceError(err.message ?? "Failed to fetch balance.");
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (publicKey) {
      refreshBalance(publicKey);
    }
  }, [publicKey, refreshBalance]);

  const handleConnect = async () => {
    setConnecting(true);
    setConnectError(null);
    try {
      const { publicKey: pk, network: net } = await connectWallet();
      setPublicKey(pk);
      setNetwork(net);
    } catch (err: any) {
      setConnectError(err.message ?? "Failed to connect wallet.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setPublicKey(null);
    setNetwork(null);
    setBalance(null);
    setBalanceError(null);
    setTxState({ status: "idle" });
  };

  const handleSend = async (destination: string, amount: string, memo: string) => {
    if (!publicKey) return;

    if (!isValidStellarAddress(destination)) {
      setTxState({
        status: "error",
        message:
          "That doesn't look like a valid Stellar address (should start with G and be 56 characters).",
      });
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setTxState({ status: "error", message: "Enter an amount greater than 0." });
      return;
    }

    setTxState({ status: "pending" });
    try {
      const result = await sendPayment(publicKey, destination.trim(), amount, memo || undefined);
      setTxState({ status: "success", result, note: memo.trim() || undefined });
      refreshBalance(publicKey);
    } catch (err: any) {
      setTxState({
        status: "error",
        message: err.message ?? "Transaction failed. Please try again.",
      });
    }
  };

  const handleFundWithFriendbot = async () => {
    if (!publicKey) return;
    setFunding(true);
    try {
      await fundWithFriendbot(publicKey);
      await refreshBalance(publicKey);
    } catch (err: any) {
      setBalanceError(err.message ?? "Friendbot funding failed. Try again in a moment.");
    } finally {
      setFunding(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="orbit-field" aria-hidden="true">
        <span className="orbit-dot dot-a" />
        <span className="orbit-dot dot-b" />
        <span className="orbit-dot dot-c" />
      </div>

      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span className="brand-name">SplitStellar</span>
        </div>
        <span className="network-pill">Stellar Testnet</span>
      </header>

      <main className="app-main">
        <section className="hero">
          <p className="eyebrow">White Belt · Level 1</p>
          <h1>Send XLM without leaving the tab open to Horizon docs.</h1>
          <p className="hero-sub">
            Connect Freighter, check your testnet balance, and fire off a payment —
            with the transaction hash to prove it happened. First payment primitive
            for SplitStellar's group-payments journey.
          </p>
        </section>

        <div className="panel-grid">
          <WalletPanel
            publicKey={publicKey}
            network={network}
            balance={balance}
            balanceLoading={balanceLoading}
            balanceError={balanceError}
            connecting={connecting}
            connectError={connectError}
            funding={funding}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onRefreshBalance={() => publicKey && refreshBalance(publicKey)}
            onFundWithFriendbot={handleFundWithFriendbot}
          />

          <SendPaymentForm
            disabled={!publicKey || txState.status === "pending"}
            sending={txState.status === "pending"}
            onSend={handleSend}
          />
        </div>

        <TxFeedback state={txState} />
      </main>

      <footer className="app-footer">
        <p>
          Built for Stellar Journey to Mastery (White Belt) · Testnet only, no
          real funds involved.
        </p>
      </footer>
    </div>
  );
}

export default App;
