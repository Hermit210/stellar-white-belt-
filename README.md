# SplitStellar — White Belt Payment dApp

A minimal "Simple Payment dApp" built for **Stellar Journey to Mastery — White Belt (Level 1)**, and the first building block of **SplitStellar** — a Stellar-native group-payments app (bill splitting + recurring payments via Soroban escrow) that I'll extend through Yellow and Orange Belt.

Connect a Freighter wallet, view your live XLM balance on **Stellar Testnet**, and send an XLM payment to any address — with clear success/failure feedback and the transaction hash.

## Requirements checklist

**1. Wallet Setup**
- [x] Freighter wallet integration
- [x] Stellar Testnet only (app blocks connection on any other network)

**2. Wallet Connection**
- [x] Wallet connect functionality
- [x] Wallet disconnect functionality

**3. Balance Handling**
- [x] Fetch connected wallet's XLM balance from Horizon Testnet
- [x] Balance displayed clearly in the UI

**4. Transaction Flow**
- [x] Send an XLM transaction on Stellar Testnet
- [x] Success/failure state shown to the user
- [x] Transaction hash / confirmation message shown on success

**5. Development Standards**
- [x] Clean UI with clear separation of concerns (wallet logic, balance logic, transaction
      logic, and UI components are all separate files/modules)
- [x] Error handling for: Freighter not installed, wrong network, unfunded account,
      invalid destination address, rejected signature, and failed submission

**6. Git History**
- [x] 10+ meaningful, atomic commits

**7. Submission**
- [ ] Public GitHub repository
- [x] README with project description, setup instructions, and screenshots

## Features

- **Wallet connect / disconnect** via the [Freighter](https://freighter.app) browser extension
- **Network guard** — refuses to proceed unless Freighter is set to Testnet
- **Live XLM balance** fetched from Horizon Testnet, with a manual refresh button
- **Send XLM** to any Stellar (`G...`) address, with an optional memo
- **Friendbot funding fallback** — if your account isn't funded yet, one click funds it on testnet
- **Transaction feedback** — pending / success / error states, with the tx hash linked to [stellar.expert](https://stellar.expert/explorer/testnet)
- Basic input validation (address format, positive amount) and error handling (unfunded accounts, wrong network, rejected signature, failed submission)

## Tech stack

- [React](https://react.dev) + TypeScript + [Vite](https://vitejs.dev)
- [`@stellar/freighter-api`](https://www.npmjs.com/package/@stellar/freighter-api) — wallet connection & transaction signing
- [`@stellar/stellar-sdk`](https://www.npmjs.com/package/@stellar/stellar-sdk) — building/submitting transactions and querying Horizon Testnet

## Project structure

```
src/
  lib/stellar.ts             # All Freighter + Horizon logic (connect, balance, send payment)
  components/
    WalletPanel.tsx           # Connect/disconnect + balance UI
    SendPaymentForm.tsx       # Destination/amount/memo form
    TxFeedback.tsx            # Pending/success/error transaction feedback
  App.tsx                     # Wires state + components together
  App.css                     # Design tokens & styling
```

## Setup instructions (run locally)

**Prerequisites**

- [Node.js](https://nodejs.org) 18+
- The [Freighter](https://www.freighter.app/) browser extension, set to **Test Net** (Freighter → Settings → Preferences → Network)
- A Freighter account funded with testnet XLM (the app will tell you if it isn't — you can fund it via [Friendbot](https://friendbot.stellar.org/?addr=YOUR_PUBLIC_KEY) or the "Fund with Friendbot" option in Freighter itself)

**Install & run**

```bash
git clone https://github.com/Hermit210/stellar-white-belt-.git
cd stellar-white-belt-
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`) in a browser that has the Freighter extension installed.

**Build for production**

```bash
npm run build
npm run preview
```

## How to test the full flow

1. Click **Connect Freighter** and approve the connection popup.
2. Confirm your address and XLM balance appear in the Wallet panel.
3. In the Send panel, paste a second testnet address (e.g. a second Freighter account, or any `G...` address) and an amount.
4. Click **Send XLM**, approve the signature request in Freighter.
5. Watch the feedback panel move from *pending* → *confirmed*, with a link to the transaction on Stellar Expert.
6. Click **Disconnect** to clear the session.

## Screenshots

> Screenshots below demonstrate the required states: wallet connected, balance displayed, a successful testnet transaction, and the transaction result shown to the user.

### Wallet connected state
![Wallet connected](./screenshots/wallet-connected.png)

### Balance displayed
![Balance displayed](./screenshots/balance-displayed.png)

### Successful testnet transaction
![Sending transaction](./screenshots/transaction-pending.png)

### Transaction result shown to the user
![Transaction confirmed](./screenshots/transaction-success.png)

## Notes

- This app only ever targets **Stellar Testnet** — it will not connect if Freighter is switched to Public/Mainnet.
- No private keys ever touch this app's code; all signing happens inside the Freighter extension.
- Part of my Stellar Journey to Mastery build track — next up is multi-wallet bill splitting via a Soroban escrow contract for Yellow Belt.
