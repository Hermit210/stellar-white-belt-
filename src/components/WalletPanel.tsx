interface WalletPanelProps {
  publicKey: string | null;
  network: string | null;
  balance: string | null;
  balanceLoading: boolean;
  balanceError: string | null;
  connecting: boolean;
  connectError: string | null;
  funding: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefreshBalance: () => void;
  onFundWithFriendbot: () => void;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-6)}`;
}

export default function WalletPanel({
  publicKey,
  network,
  balance,
  balanceLoading,
  balanceError,
  connecting,
  connectError,
  funding,
  onConnect,
  onDisconnect,
  onRefreshBalance,
  onFundWithFriendbot,
}: WalletPanelProps) {
  return (
    <section className="panel wallet-panel">
      <h2 className="panel-title">
        <span className="panel-index">01</span> Wallet
      </h2>

      {!publicKey ? (
        <div className="wallet-empty">
          <p>Connect Freighter to load your testnet address and balance.</p>
          <button className="btn btn-primary" onClick={onConnect} disabled={connecting}>
            {connecting ? "Connecting…" : "Connect Freighter"}
          </button>
          {connectError && <p className="field-error">{connectError}</p>}
        </div>
      ) : (
        <div className="wallet-connected">
          <div className="wallet-row">
            <span className="wallet-label">Address</span>
            <span className="wallet-address" title={publicKey}>
              {truncateAddress(publicKey)}
            </span>
          </div>

          <div className="wallet-row">
            <span className="wallet-label">Network</span>
            <span className="status-chip">{network ?? "TESTNET"}</span>
          </div>

          <div className="balance-block">
            <span className="wallet-label">XLM Balance</span>
            {balanceLoading ? (
              <span className="balance-value balance-loading">fetching…</span>
            ) : balanceError ? (
              <div className="balance-error-block">
                <span className="field-error">{balanceError}</span>
                {balanceError.toLowerCase().includes("fund") && (
                  <button
                    className="btn btn-ghost btn-small"
                    onClick={onFundWithFriendbot}
                    disabled={funding}
                  >
                    {funding ? "Funding…" : "Fund with Friendbot"}
                  </button>
                )}
              </div>
            ) : (
              <span key={balance ?? "none"} className="balance-value">
                {Number(balance).toFixed(4)} XLM
              </span>
            )}
          </div>

          <div className="wallet-actions">
            <button className="btn btn-ghost" onClick={onRefreshBalance} disabled={balanceLoading}>
              Refresh balance
            </button>
            <button className="btn btn-outline" onClick={onDisconnect}>
              Disconnect
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
