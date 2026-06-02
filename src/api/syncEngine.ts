import api from "./client";
import { db, type PurchaseCache } from "../lib/db";

let isSyncing = false;

// Generates a UUID V4 in browser environment
function generateUUID(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Saves a purchase locally to outbox and cache when offline
export async function saveOfflinePurchase(payload: any) {
  const id = payload.id || generateUUID();
  payload.id = id;

  const cacheRecord: PurchaseCache = {
    id,
    billNo: payload.voucherNo,
    note: payload.note,
    billDate: payload.businessDate,
    entryType: payload.entryType,
    cessCondition: payload.cessCondition,
    sellerId: payload.sellerId,
    vehicleNo: payload.vehicleNo,
    partyBillNo: payload.partyBillNo,
    items: payload.items || [],
    charges: payload.charges || {},
    synced: false,
  };

  // 1. Save to local cache
  await db.purchases.put(cacheRecord);

  // 2. Add to outbox (mutating actions queue)
  // Check if there is already a pending outbox entry for this bill to avoid duplicate outbox items
  const existingOutbox = await db.syncOutbox
    .filter((item) => item.type === "purchase" && item.payload.id === id)
    .first();

  if (existingOutbox && existingOutbox.id) {
    // Update existing outbox payload
    await db.syncOutbox.update(existingOutbox.id, {
      payload,
      createdAt: Date.now(),
    });
  } else {
    // Insert new outbox item
    await db.syncOutbox.add({
      type: "purchase",
      action: "POST",
      payload,
      createdAt: Date.now(),
    });
  }

  return {
    id,
    billNo: payload.voucherNo,
    amount: payload.charges?.netTotal || 0,
  };
}

// Retrieves a purchase from local cache by bill number
export async function getOfflinePurchase(billNo: string): Promise<any | null> {
  const cached = await db.purchases.where("billNo").equalsIgnoreCase(billNo.trim()).first();
  if (!cached) return null;

  // Convert cached format back to API response format
  return {
    id: cached.id,
    billNo: cached.billNo,
    note: cached.note,
    billDate: cached.billDate,
    entryType: cached.entryType,
    cessCondition: cached.cessCondition,
    sellerId: cached.sellerId,
    vehicleNo: cached.vehicleNo,
    partyBillNo: cached.partyBillNo,
    items: cached.items.map((it, idx) => ({
      itemNo: idx + 1,
      commodity: it.commodity,
      mark: it.mark,
      brand: it.brand,
      bags: it.bags,
      avgWeight: it.avgWeight,
      purchaseWeight: it.purchaseWeight,
      packingWeight: it.packingWeight,
      netWeight: it.netWeight,
      rate: it.rate,
      amount: it.amount,
    })),
    charges: {
      purchaseAmount: cached.charges.purchaseAmount || 0,
      mTax: cached.charges.mTax || 0,
      commission: cached.charges.commission || 0,
      purchaseCommission: cached.charges.purchaseCommission || 0,
      freight: cached.charges.freight || 0,
      packing: cached.charges.packing || 0,
      loading: cached.charges.loading || 0,
      levy: cached.charges.levy || 0,
      tolai: cached.charges.tolai || 0,
      hamali: cached.charges.hamali || 0,
      discount: cached.charges.discount || 0,
      igst: cached.charges.igst || 0,
      sgst: cached.charges.sgst || 0,
      cgst: cached.charges.cgst || 0,
      tds: cached.charges.tds || 0,
      khandani: cached.charges.khandani || 0,
      ourExpenses: cached.charges.ourExpenses || 0,
      exp2: cached.charges.exp2 || 0,
      exp3: cached.charges.exp3 || 0,
      exp4: cached.charges.exp4 || 0,
      total: cached.charges.total || 0,
      netTotal: cached.charges.netTotal || 0,
    },
  };
}

// Saves a sale locally to outbox and cache when offline
export async function saveOfflineSale(payload: any) {
  const id = payload.id || generateUUID();
  payload.id = id;

  const cacheRecord = {
    id,
    billNo: payload.voucherNo,
    synced: false,
    payload: payload,
  };

  // 1. Save to local cache
  await db.sales.put(cacheRecord);

  // 2. Add to outbox (mutating actions queue)
  const existingOutbox = await db.syncOutbox
    .filter((item) => item.type === "sale" && item.payload.id === id)
    .first();

  if (existingOutbox && existingOutbox.id) {
    // Update existing outbox payload
    await db.syncOutbox.update(existingOutbox.id, {
      payload,
      createdAt: Date.now(),
    });
  } else {
    // Insert new outbox item
    await db.syncOutbox.add({
      type: "sale",
      action: "POST",
      payload,
      createdAt: Date.now(),
    });
  }

  return {
    id,
    billNo: payload.voucherNo,
    amount: (Number(payload.qty) || 0) * (Number(payload.rate) || 0),
  };
}

// Triggers synchronization of all pending outbox items
export async function triggerSync(): Promise<void> {
  if (isSyncing || !navigator.onLine) return;
  isSyncing = true;

  try {
    const outboxItems = await db.syncOutbox.toArray();
    if (outboxItems.length === 0) return;

    // 1. Sync purchases
    const purchaseItems = outboxItems.filter((item) => item.type === "purchase");
    if (purchaseItems.length > 0) {
      const payloads = purchaseItems.map((item) => item.payload);
      try {
        const response = await api.post("/purchase/bulk", payloads);
        const results = response.data.results as Array<{
          id?: string;
          billNo?: string;
          status: "SUCCESS" | "ERROR";
          error?: string;
        }>;

        for (const result of results) {
          const outboxItem = purchaseItems.find(
            (item) => item.payload.id === result.id || item.payload.voucherNo === result.billNo
          );

          if (outboxItem && outboxItem.id) {
            if (result.status === "SUCCESS") {
              await db.syncOutbox.delete(outboxItem.id);
              if (result.id) {
                await db.purchases.update(result.id, {
                  synced: true,
                  syncError: undefined,
                });
              }
            } else {
              if (result.id) {
                await db.purchases.update(result.id, {
                  synced: false,
                  syncError: result.error || "Failed to sync",
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Bulk purchase sync request failed:", err);
      }
    }

    // 2. Sync sales
    const saleItems = outboxItems.filter((item) => item.type === "sale");
    if (saleItems.length > 0) {
      const payloads = saleItems.map((item) => item.payload);
      try {
        const response = await api.post("/sales/bulk", payloads);
        const results = response.data.results as Array<{
          id?: string;
          salePattiNo?: string;
          status: "SUCCESS" | "ERROR";
          error?: string;
        }>;

        for (const result of results) {
          const outboxItem = saleItems.find(
            (item) => item.payload.id === result.id || item.payload.voucherNo === result.salePattiNo
          );

          if (outboxItem && outboxItem.id) {
            if (result.status === "SUCCESS") {
              await db.syncOutbox.delete(outboxItem.id);
              if (result.id) {
                await db.sales.update(result.id, {
                  synced: true,
                  syncError: undefined,
                });
              }
            } else {
              if (result.id) {
                await db.sales.update(result.id, {
                  synced: false,
                  syncError: result.error || "Failed to sync",
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Bulk sales sync request failed:", err);
      }
    }
  } catch (error) {
    console.error("Background sync error:", error);
  } finally {
    isSyncing = false;
  }
}
