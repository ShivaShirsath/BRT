import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  Box,
  Typography,
} from "@mui/material";

interface ValidationErrorsDialogProps {
  open: boolean;
  onClose: () => void;
  errors: string[];
}

function ErrorIcon({ size = 42 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#d32f2f"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block" }}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function ValidationErrorsDialog({ open, onClose, errors }: ValidationErrorsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "16px",
          bgcolor: "#fcfdfe",
          border: "2px solid #ffcdd2",
          boxShadow: "0 8px 24px rgba(211, 47, 47, 0.15)",
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: "#ffebee", py: 2.5, borderBottom: "1px solid #ffcdcc" }}>
        <ErrorIcon size={42} />
        <Typography sx={{ fontSize: 36, fontWeight: 700, color: "#c62828" }}>
          Validation Failed
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3, mt: 1 }}>
        <Typography sx={{ fontSize: 26, mb: 2, color: "#555", fontWeight: 500 }}>
          Please correct the following issues before saving:
        </Typography>
        <List sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {errors.map((err, idx) => (
            <ListItem key={idx} disableGutters sx={{ alignItems: "flex-start", py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32, mt: 1.2 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#d32f2f" }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: 28, color: "#2c3e50", lineHeight: 1.4 }}>
                {err}
              </Typography>
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: "1px solid #eef2f6", bgcolor: "#f8f9fa", justifyContent: "flex-end" }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="error"
          sx={{
            textTransform: "none",
            fontSize: 28,
            px: 4,
            py: 1,
            borderRadius: "10px",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
              bgcolor: "#b71c1c",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
