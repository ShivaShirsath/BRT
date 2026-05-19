export type AppView =
  | "classic-dashboard"
  | "dashboard"
  | "customers"
  | "suppliers"
  | "inward"
  | "outward"
  | "challans"
  | "stock-ledger"
  | "account-ledger"
  | "reports"
  | "dbf-explorer"
  | "erd-viewer"
  | "settings";

export type AppStage = "login" | "firm-selection" | "app";

export type NavItem = { key: AppView; label: string };

export type DbfFileSummary = {
  table: string;
  recordCount: number;
  fieldCount: number;
};

export type DbfField = {
  name: string;
  type: string;
  size: number;
};

export type DbfRelation = {
  key: string;
  targetTable: string;
  targetKey: string;
  relationType: string;
};

export type DbfTableResponse = {
  source: string;
  table: string;
  recordCount: number;
  fieldCount: number;
  fields: DbfField[];
  relations: DbfRelation[];
  page: number;
  pageSize: number;
  totalPages: number;
  rows: Record<string, unknown>[];
};
