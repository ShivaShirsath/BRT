import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useViewport } from "../hooks/useViewport";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

export function DataEntryPage() {
  const navigate = useNavigate();
  const { viewportHeight } = useViewport();
  const selectedFirm = useAuthStore((s) => s.selectedFirm);

  const col1 = [
    "Delivery Challan Entry",
    "Purchase Bill",
    "Sales Patti Entry",
    "Dalal Payment 1",
    "Dalal Payment",
    "Cash Deposit",
    "Cash Withdrawal",
    "Customer Receipt",
    "Miscellaneous Receipt",
    "Payment Voucher",
  ];
  const col2 = [
    "Account Generation",
    "Journal Voucher",
    "Vapasi Entry",
    "Opening Balance",
    "Parcel Expense Entry",
    "Bank Reconciliation",
    "Product Master",
    "Release Records (LAN)",
    "Contract Entry",
    "Grading",
  ];
  const col3 = [
    "Dispatch Entry",
    "Cheque Return Entry",
    "Customer Expenses",
    "Stall Expenses Entry",
    "Multiple Bank / Address",
    "Opening Stock Entry",
    "Railway Freight Entry",
    "Dockt Entry",
    "Update Stock",
    "Exit",
  ];

  function routeFor(title: string) {
    if (title === "Purchase Bill") return "/purchase";
    if (title === "Sales Patti Entry") return "/sales";
    if (title === "Opening Balance") return "/opening-balances";
    if (title === "Product Master") return "/product-entry";
    if (title === "Exit") return "/menu";
    return null;
  }

  return (
    <div className="bg-background text-foreground flex flex-col overflow-hidden" style={{ height: viewportHeight }}>
      <header className="sticky top-0 z-40 shrink-0 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 text-card-foreground shadow-sm py-6 px-6 text-center space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          {selectedFirm?.name?.toUpperCase() || "BRT TRADING CO."}
        </h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Financial Year: 01.04.2025 to 31.03.2026
        </p>
      </header>

      <main className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-col items-center border-b pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight">Data Entry Menu</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {[col1, col2, col3].map((col, ci) => (
              <div key={ci} className="flex flex-col space-y-2">
                {col.map((title) => {
                  const route = routeFor(title);
                  const enabled = Boolean(route);
                  return (
                    <Button
                      key={title}
                      variant={enabled ? "outline" : "ghost"}
                      disabled={!enabled}
                      onClick={() => route && navigate(route)}
                      className="w-full justify-start h-12 text-sm font-medium px-4 border"
                    >
                      {title}
                    </Button>
                  );
                })}
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
