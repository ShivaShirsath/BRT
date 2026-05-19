# BRT Legacy Inventory (Source of Truth)

## Workspace Baseline
- Modernization workspace: `/Users/shiva/Downloads/wmarket/BRT`
- Legacy source roots:
  - `/Users/shiva/Downloads/wmarket/PROGRAM`
  - `/Users/shiva/Downloads/wmarket/DATA`

## Legacy Artifact Counts
- `PRG/prg`: 9
- `FXP`: 9
- `SCX/SCT`: 3 / 3
- `FRX/frx`: 73 total (57 + 16)
- `FRT`: 73
- `DBF/dbf` in `DATA`: 1362 total

## Core Workflow Programs (high-priority migration)
- Billing:
  - `BILLPR1.prg`
  - `BILLPR3.prg`
  - `billdedpr.PRG`
  - `billexp.PRG`
- Delivery/Challan:
  - `delypr.PRG`
  - `delypr1.prg`
- Patti:
  - `pattipr02.PRG`
- Posting/transactions:
  - `contpost.PRG`
- Data utilities:
  - `deldata.prg`

## Known Forms / Reports
- Forms/Screens (SCX/SCT):
  - `BILLPR.SCX/.SCT`
  - `DELYPR.SCX/.SCT`
  - `pattipr02.SCX/.SCT`
- Report families (FRX/FRT):
  - Bill print variants (`billpr*`, `billpronline*`)
  - Challan print variants (`DelyPr*`, `DELY*`, `ChlnEnvPr`)
  - Ledger/account (`gledgp8`, `GLedgp2_eng`, `Contledg_eng`)
  - Purchase/sales summaries (`purrep*`, `salesta*`, `stockrp2`)
  - Receipt/payment (`RECEIPTPR*`, `PAYVOU`, `vouprint`)

## Current BRT React Prototype Observations
- Existing views mapped from DBF:
  - Customers (`CUST2601.DBF`)
  - Suppliers (`SUPP2601.DBF`)
  - Inward/Outward/Challan (`CONT2601.DBF`)
  - Stock ledger (`STOK2601.DBF`)
  - Account ledger (`GL2601.DBF`)
- Existing DBF HTTP service prototype:
  - `scripts/dbf_server.mjs`
  - Includes login lookup (`MAST2601.DBF`) and table pagination

## Legacy-to-Modern Module Seeds
- Master data: Customer, Supplier, Item, Vehicle, User/Menu
- Transactions: Inward, Outward, Challan, Purchase/Sale posting
- Ledger: GL, account summaries, stock movement
- Reports/printing: bill/challan/voucher/ledger print templates
- Ops: backup, import/export, year lock, reminders

## Incremental Scope Recommendation
1. Freeze legacy workflows and establish PRG-to-API parity matrix.
2. Migrate master data and auth first.
3. Migrate transaction entry + posting.
4. Migrate print/report pipelines.
5. Decommission direct DBF runtime after parallel run success criteria.
