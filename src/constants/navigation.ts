import type { NavItem } from "../types/app";

export const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "customers", label: "Customer Master" },
  { key: "suppliers", label: "Supplier Master" },
  { key: "inward", label: "Inward Entry" },
  { key: "outward", label: "Outward Entry" },
  { key: "challans", label: "Order / Challan" },
  { key: "stock-ledger", label: "Stock Ledger" },
  { key: "account-ledger", label: "Account Ledger" },
  { key: "reports", label: "Reports" },
  { key: "dbf-explorer", label: "DBF Explorer" },
  { key: "erd-viewer", label: "ERD Viewer" },
  { key: "settings", label: "Settings" },
];
