# Blockchain Inventory Management (Backend)

This backend provides inventory, order, supplier, and warehouse APIs with **blockchain-backed order approvals** on Sepolia. It uses an **async confirmation** flow: approvals/completions submit a blockchain transaction, then a worker confirms and updates order status.

## Requirements
- Node.js 18+ (for `fetch`)
- MongoDB running locally or a reachable URI

## Setup

Install dependencies:
```bash
npm install
```

Create a `.env` file (ignored by git). Minimal example:
```env
MONGO_URI=mongodb://127.0.0.1:27017/blockchain_inventory
MONGO_URI_TEST=mongodb://127.0.0.1:27017/blockchain_inventory_test
JWT_SECRET=your_secret
JWT_EXPIRES_IN=1d

# Blockchain (Sepolia)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<project_id>
SEPOLIA_PRIVATE_KEY=0x<your_test_wallet_private_key>
```

## Run the Server

In PowerShell:
```powershell
$env:NODE_ENV="development"; node index.js
```

If `NODE_ENV` is set to `test`, the server will not start.

## Core Workflow (Async Blockchain)

### 1) Create order + items
Use your API client (or the basic UI) to:
1. Register
2. Create Supplier
3. Create Warehouse
4. Create Product
5. Add Inventory
6. Create Order
7. Add Order Items
8. Assign Supplier

### 2) Approve order (submits blockchain tx)
```
PATCH /api/orders/:orderId/status
{ "status": "approved" }
```
Response (202) includes a `transactionHash`.

### 3) Reconcile blockchain tx (worker)
Run:
```bash
npm run chain:reconcile
```
If the tx is confirmed, the order status is updated to `approved` and inventory is reserved.

### 4) Complete order
```
PATCH /api/orders/:orderId/status
{ "status": "completed" }
```
Then run `npm run chain:reconcile` again to finalize inventory and set status to `completed`.

## One-Command Workflow Test
This runs the full flow and waits for confirmations:
```bash
npm run workflow:test
```

Requirements:
- Server running on `http://localhost:5000`
- Sepolia RPC + private key set in `.env`

## Blockchain Transaction Test
Send a real Sepolia tx and print the hash:
```bash
npm run chain:test
```

## Tests
```bash
npm test
```

## Notes
- User registration no longer requires a wallet address.
- Supplier creation still requires a wallet address.
- Approved/completed status changes are **async** in non-test environments.
