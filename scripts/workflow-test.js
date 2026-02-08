require('dotenv').config();
const { reconcileTransactions } = require('./reconcile-transactions');

const API_BASE = process.env.API_BASE || 'http://localhost:5000';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const api = async (path, { method = 'GET', token, body } = {}) => {
  const headers = {};
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (err) {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
  }
  return { status: res.status, data };
};

const waitForOrderStatus = async (token, orderId, targetStatus, attempts = 10, delayMs = 8000) => {
  for (let i = 0; i < attempts; i += 1) {
    const summary = await reconcileTransactions();
    console.log('Reconcile:', summary);
    const ordersRes = await api('/api/orders', { token });
    const order = ordersRes.data.orders.find((o) => o._id === orderId);
    if (order && order.status === targetStatus) {
      return true;
    }
    await sleep(delayMs);
  }
  return false;
};

const run = async () => {
  if (typeof fetch !== 'function') {
    console.error('Node 18+ is required for fetch.');
    process.exit(1);
  }

  const suffix = Date.now();
  const email = `workflow${suffix}@test.com`;
  const password = 'password123';

  console.log('Registering user...');
  const registerRes = await api('/api/auth/register', {
    method: 'POST',
    body: {
      name: `Workflow User ${suffix}`,
      email,
      password
    }
  });
  const token = registerRes.data.token;

  console.log('Creating supplier...');
  const supplierRes = await api('/api/suppliers', {
    method: 'POST',
    token,
    body: {
      name: `Workflow Supplier ${suffix}`,
      contactInfo: `workflow${suffix}@supplier.com`,
      walletAddress: `0xSUP${suffix}`
    }
  });
  const supplierId = supplierRes.data._id;

  console.log('Creating warehouse...');
  const warehouseRes = await api('/api/warehouses', {
    method: 'POST',
    token,
    body: {
      name: `Workflow Warehouse ${suffix}`,
      location: 'Test Location'
    }
  });
  const warehouseId = warehouseRes.data._id;

  console.log('Creating product...');
  const productRes = await api('/api/products', {
    method: 'POST',
    token,
    body: {
      name: `Workflow Product ${suffix}`,
      description: 'Workflow product',
      category: 'Test'
    }
  });
  const productId = productRes.data._id;

  console.log('Adding inventory...');
  await api('/api/inventory', {
    method: 'POST',
    token,
    body: {
      warehouseId,
      productId,
      quantity: 25
    }
  });

  console.log('Creating order...');
  const orderRes = await api('/api/orders', {
    method: 'POST',
    token,
    body: {
      orderType: 'sale',
      warehouseId
    }
  });
  const orderId = orderRes.data.order._id;

  console.log('Adding order item...');
  await api(`/api/orders/${orderId}/items`, {
    method: 'POST',
    token,
    body: {
      productId,
      quantity: 5
    }
  });

  console.log('Assigning supplier...');
  await api(`/api/orders/${orderId}/assign-supplier`, {
    method: 'PATCH',
    token,
    body: { supplierId }
  });

  console.log('Requesting approval (submits blockchain tx)...');
  const approveRes = await api(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    token,
    body: { status: 'approved' }
  });
  console.log('Approval response:', approveRes.data);

  console.log('Waiting for approval confirmation...');
  const approved = await waitForOrderStatus(token, orderId, 'approved');
  if (!approved) {
    console.error('Order did not reach approved status in time.');
    process.exit(1);
  }

  console.log('Requesting completion (submits blockchain tx)...');
  const completeRes = await api(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    token,
    body: { status: 'completed' }
  });
  console.log('Completion response:', completeRes.data);

  console.log('Waiting for completion confirmation...');
  const completed = await waitForOrderStatus(token, orderId, 'completed');
  if (!completed) {
    console.error('Order did not reach completed status in time.');
    process.exit(1);
  }

  console.log('Workflow completed successfully.');
};

run().catch((err) => {
  console.error('Workflow failed:', err.message || err);
  process.exit(1);
});
