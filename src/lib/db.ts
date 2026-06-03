import Dexie, { type Table } from "dexie";

export interface SyncItem {
  id?: number;
  type: "purchase" | "sale";
  action: "POST" | "PUT" | "DELETE";
  payload: any;
  createdAt: number;
}

export interface PurchaseCache {
  id: string; // client UUID
  billNo: string;
  note?: string;
  billDate?: string;
  entryType?: string;
  cessCondition?: string;
  sellerId?: number | null;
  vehicleNo?: string;
  partyBillNo?: string;
  items: any[];
  charges: any;
  synced: boolean;
  syncError?: string;
  createdAt?: string;
}

export interface SaleCache {
  id: string;
  billNo: string;
  synced: boolean;
  syncError?: string;
  payload: any;
}

class AppDatabase extends Dexie {
  syncOutbox!: Table<SyncItem, number>;
  purchases!: Table<PurchaseCache, string>;
  sales!: Table<SaleCache, string>;

  constructor() {
    super("BrtAppOfflineDB");
    this.version(1).stores({
      syncOutbox: "++id, type, action, createdAt",
      purchases: "id, billNo, synced",
      sales: "id, billNo, synced",
    });
  }
}

export const db = new AppDatabase();
