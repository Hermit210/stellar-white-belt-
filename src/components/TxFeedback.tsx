import type { TxState } from "../App";

interface TxFeedbackProps {
  state: TxState;
}

export default function TxFeedback({ state }: TxFeedbackProps) {
  if (state.status === "idle") return null;

  return (
    <section className={`tx-feedback tx-${state.status}`} role="status">
      {state.status === "pending" && (
        <>
          <span className="tx-dot tx-dot-pending" />
          <div>
            <p className="tx-title">Submitting transaction…</p>
            <p className="tx-sub">Waiting on your signature in Freighter, then Horizon.</p>
          </div>
        </>
      )}

      {state.status === "success" && (
        <>
          <span className="tx-dot tx-dot-success" />
          <div>
            <p className="tx-title">Payment confirmed</p>
            <p className="tx-sub">
              Hash:{" "}
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${state.result.hash}`}
                target="_blank"
                rel="noreferrer"
                className="tx-hash-link"
              >
                {state.result.hash}
              </a>
            </p>
          </div>
        </>
      )}

      {state.status === "error" && (
        <>
          <span className="tx-dot tx-dot-error" />
          <div>
            <p className="tx-title">Transaction failed</p>
            <p className="tx-sub">{state.message}</p>
          </div>
        </>
      )}
    </section>
  );
}
