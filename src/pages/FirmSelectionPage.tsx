import { useEffect, useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import api from "../api/client";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

type Firm = { code: string; name: string };

export function FirmSelectionPage() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selected, setSelected] = useState<Firm | null>(null);
  const [error, setError] = useState("");
  const setFirm = useAuthStore((s) => s.setFirm);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/firms");
        const list = (data.firms ?? []) as Firm[];
        setFirms(list);
        setSelected(list[0] ?? null);
      } catch (e: any) {
        setError(e?.response?.data?.error ?? "Unable to load firms");
      }
    })();
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f2f7ff" }}>
      <Box
        sx={{
          height: "74px",
          bgcolor: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, md: 4 },
        }}
      >
        <Typography sx={{ color: "#172e57", fontSize: 34, fontWeight: 700 }}>BRT Trading Platform</Typography>
        <Typography sx={{ color: "#73859e", fontSize: 22, fontWeight: 600 }}>Select Firm</Typography>
      </Box>

      <Box sx={{ display: "grid", placeItems: "center", p: 3, pt: 8 }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: "860px",
            minHeight: "589px",
            bgcolor: "#fff",
            border: "1px solid #d4e3f5",
            borderRadius: "20px",
            boxShadow: "0 18px 40px rgba(20,51,97,0.12)",
            p: 4,
            position: "relative",
          }}
        >
          <Button
            onClick={() => {
              logout();
              navigate("/auth");
            }}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              minWidth: "53px",
              height: "52px",
              bgcolor: "#edf2fc",
              border: "1px solid #b5c7e5",
              color: "#2b4066",
              fontSize: 24,
              fontWeight: 600,
              borderRadius: "12px",
              textTransform: "none",
            }}
          >
            X
          </Button>

          <Typography sx={{ color: "#172947", fontSize: 48, fontWeight: 700, lineHeight: 1.2 }}>Choose Your Firm</Typography>
          <Typography sx={{ color: "#6e7d91", fontSize: 22, mt: 1 }}>
            Same workflow as legacy app: user must select one firm before entering dashboard.
          </Typography>

          {error ? <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert> : null}

          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: "14px",
              border: "1px solid #d6e3f2",
              bgcolor: "#f7faff",
              maxHeight: "340px",
              overflowY: "auto",
            }}
          >
            {(firms.length ? firms : []).map((firm) => {
              const active = selected?.code === firm.code;
              return (
                <Button
                  key={firm.code}
                  fullWidth
                  onClick={() => setSelected(firm)}
                  sx={{
                    justifyContent: "flex-start",
                    mb: 1,
                    height: "54px",
                    borderRadius: "10px",
                    border: `1px solid ${active ? "#1470e5" : "#dee5f2"}`,
                    bgcolor: active ? "#1470e5" : "#fff",
                    color: active ? "#fff" : "#1a2433",
                    fontWeight: 600,
                    fontSize: 25,
                    textTransform: "none",
                    px: 2,
                    "&:hover": { bgcolor: active ? "#1367d1" : "#f6f9ff" },
                  }}
                >
                  {firm.name}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              disabled={!selected}
              onClick={() => {
                if (!selected) return;
                setFirm(selected);
                navigate("/menu");
              }}
              sx={{
                width: "146px",
                height: "52px",
                borderRadius: "12px",
                fontSize: 22,
                fontWeight: 600,
                textTransform: "none",
                bgcolor: "#0088ff",
              }}
            >
              Continue
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
