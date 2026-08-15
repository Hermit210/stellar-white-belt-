import { useState, type FormEvent } from "react";

interface SendPaymentFormProps {
  disabled: boolean;
  sending: boolean;
  onSend: (destination: string, amount: string, memo: string) => void;
}

export default function SendPaymentForm({ disabled, sending, onSend }: SendPaymentFormProps) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSend(destination, amount, memo);
  };

  return (
    <section className="panel send-panel">
      <h2 className="panel-title">
        <span className="panel-index">02</span> Send payment
      </h2>

      <form className="send-form" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Destination address</span>
          <input
            type="text"
            placeholder="GABC...WXYZ"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            disabled={disabled}
            spellCheck={false}
            autoComplete="off"
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Amount (XLM)</span>
          <input
            type="number"
            step="0.0000001"
            min="0"
            placeholder="1.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={disabled}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Memo (optional)</span>
          <input
            type="text"
            placeholder="Builders on Court dues"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={disabled}
            maxLength={28}
          />
        </label>

        <button className="btn btn-primary btn-block" type="submit" disabled={disabled}>
          {sending ? "Sending…" : "Send XLM"}
        </button>

        {!disabled ? null : (
          <p className="field-hint">Connect your wallet to enable sending.</p>
        )}
      </form>
    </section>
  );
}
