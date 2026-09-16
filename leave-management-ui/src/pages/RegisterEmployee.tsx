import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Chip,
  InputAdornment,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { registerEmployee } from "../services/employeeService";

export default function RegisterEmployee() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    department: "Electrification",
    role: "Employee",
    temporaryPassword: "",
  });

  const [generatedCreds, setGeneratedCreds] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Smooth in-app notifications (replaces native alert popups)
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const generatePassword = () => {
    const randomPass = "Siemens@" + Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, temporaryPassword: randomPass }));
  };

  const handleRegister = async () => {
    if (!formData.fullName || !formData.email || !formData.temporaryPassword) {
      setToast({
        open: true,
        message: "Please enter full name, email, and password.",
        severity: "error",
      });
      return;
    }

    try {
      const res = await registerEmployee(formData);
      setGeneratedCreds(res?.employee || formData);
      setToast({
        open: true,
        message: "Employee registered successfully! Credentials issued.",
        severity: "success",
      });
    } catch (err: any) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Registration failed",
        severity: "error",
      });
    }
  };

  const handleCopy = () => {
    if (!generatedCreds) return;
    navigator.clipboard.writeText(
      `Email: ${generatedCreds.email}\nTemporary Password: ${generatedCreds.temporaryPassword}\nRole: ${generatedCreds.role}\nDepartment: ${generatedCreds.department}`
    );
    setCopied(true);
    setToast({
      open: true,
      message: "Credentials copied to clipboard!",
      severity: "info",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "14px",
      backgroundColor: "#FFFFFF",
      "& fieldset": {
        borderColor: "#E2E8F0",
      },
      "&:hover fieldset": {
        borderColor: "#CBD5E1",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#00B5B8",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#64748B",
      "&.Mui-focused": {
        color: "#00B5B8",
      },
    },
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", backgroundColor: "#F8FAFC", p: { xs: 2.5, md: 4 } }}>
      {/* Title */}
      <Typography
        sx={{
          fontSize: { xs: "36px", md: "52px" },
          fontWeight: 700,
          color: "#0F173B",
          lineHeight: 1.1,
        }}
      >
        Register Employee
      </Typography>
      <Typography sx={{ color: "#667085", mb: 4, mt: 1 }}>
        Add new team members, configure departmental roles, and issue initial access credentials.
      </Typography>

      {/* Hero Banner */}
      <Card
        sx={{
          mb: 4,
          borderRadius: "24px",
          color: "#FFFFFF",
          background: "linear-gradient(90deg,#140F35 0%,#171044 50%,#1A1450 100%)",
          boxShadow: "0 12px 28px rgba(20,15,53,0.28)",
        }}
      >
        <CardContent sx={{ p: { xs: 3.5, md: 5 } }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#00B5B8", textTransform: "uppercase", letterSpacing: "1.2px" }}>
            Workforce Onboarding
          </Typography>
          <Typography sx={{ fontSize: { xs: 30, md: 46 }, fontWeight: 800, mt: 1.2 }}>
            New Account Provisioning
          </Typography>
          <Typography sx={{ opacity: 0.85, mt: 1, maxWidth: 640 }}>
            Create secure accounts with immediate access to employee portals and automated credential generation.
          </Typography>
        </CardContent>
      </Card>

      {/* Main 2-Column Section */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.65fr 1fr" },
          gap: 4,
          alignItems: "stretch",
        }}
      >
        {/* Form Card */}
        <Card
          sx={{
            borderRadius: "24px",
            p: { xs: 3, md: 5 },
            boxShadow: "0 6px 22px rgba(0,0,0,0.06)",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} color="#0F173B" mb={0.5}>
              Employee Details
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={4}>
              Enter profile and organizational details to configure permissions.
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}
              >
                <TextField
                  label="Full Name"
                  placeholder="e.g. Rahul Sharma"
                  fullWidth
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  sx={inputStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeOutlinedIcon sx={{ color: "#94A3B8" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Official Email Address"
                  type="email"
                  placeholder="e.g. employee@siemens-energy.com"
                  fullWidth
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  sx={inputStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: "#94A3B8" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}
              >
                <TextField
                  select
                  fullWidth
                  label="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  sx={inputStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessOutlinedIcon sx={{ color: "#94A3B8" }} />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="Electrification">Electrification</MenuItem>
                  <MenuItem value="Automation">Automation</MenuItem>
                  <MenuItem value="Digitalisation">Digitalisation</MenuItem>
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  sx={inputStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AdminPanelSettingsOutlinedIcon sx={{ color: "#94A3B8" }} />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="Employee">Employee</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                </TextField>
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                label="Temporary Password"
                fullWidth
                value={formData.temporaryPassword}
                onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                placeholder="Click generate or enter password"
                sx={inputStyle}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        onClick={generatePassword}
                        variant="contained"
                        size="small"
                        startIcon={<AutoFixHighIcon />}
                        sx={{
                          borderRadius: "10px",
                          backgroundColor: "#00B5B8",
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: "13px",
                          px: 2,
                          py: 0.8,
                          boxShadow: "none",
                          "&:hover": { backgroundColor: "#009EA0", boxShadow: "none" },
                        }}
                      >
                        Auto-Generate
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PersonAddAlt1Icon />}
              onClick={handleRegister}
              sx={{
                py: 1.6,
                px: 4.5,
                borderRadius: "14px",
                backgroundColor: "#00B5B8",
                fontWeight: 700,
                fontSize: "15px",
                textTransform: "none",
                boxShadow: "0 8px 24px rgba(0,181,184,0.30)",
                "&:hover": { backgroundColor: "#009EA0" },
              }}
            >
              Register & Issue Account
            </Button>
          </Box>
        </Card>

        {/* Credentials Receipt Card */}
        <Card
          sx={{
            borderRadius: "24px",
            p: { xs: 3, md: 4.5 },
            boxShadow: "0 6px 22px rgba(0,0,0,0.06)",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" fontWeight={700} color="#0F173B">
              Access Pass Receipt
            </Typography>
            {generatedCreds && (
              <Chip
                label="Provisioned"
                size="small"
                color="success"
                icon={<CheckCircleRoundedIcon />}
                sx={{ fontWeight: 700, borderRadius: "8px" }}
              />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" mb={3}>
            Share these login credentials securely with the employee. They will use them for their first sign-in.
          </Typography>

          {generatedCreds ? (
            <Box
              sx={{
                borderRadius: "20px",
                p: 3,
                backgroundColor: "#F8FAFC",
                border: "2px dashed #00B5B8",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
                  <Typography variant="caption" fontWeight={800} color="#00B5B8" sx={{ letterSpacing: "1px" }}>
                    SIEMENS ENERGY ACCESS PASS
                  </Typography>
                  <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                    <IconButton size="small" onClick={handleCopy} sx={{ color: copied ? "#2E7D32" : "#64748B" }}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box display="flex" flexDirection="column" gap={2}>
                  <Box>
                    <Typography variant="caption" color="#64748B" fontWeight={600}>
                      Employee Name
                    </Typography>
                    <Typography fontWeight={700} color="#0F173B" fontSize={16}>
                      {generatedCreds.fullName}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="#64748B" fontWeight={600}>
                      Official Email
                    </Typography>
                    <Typography fontWeight={600} color="#0F173B">
                      {generatedCreds.email}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="#64748B" fontWeight={600}>
                      Temporary Password
                    </Typography>
                    <Box
                      sx={{
                        p: 1.2,
                        mt: 0.5,
                        backgroundColor: "#FFFFFF",
                        borderRadius: "10px",
                        border: "1px solid #E2E8F0",
                        fontFamily: "monospace",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#00B5B8",
                      }}
                    >
                      {generatedCreds.temporaryPassword}
                    </Box>
                  </Box>

                  <Box display="flex" gap={2} mt={1} flexWrap="wrap">
                    <Chip
                      label={`Role: ${generatedCreds.role}`}
                      size="small"
                      sx={{ backgroundColor: "#E9FAFA", color: "#007A7C", fontWeight: 700 }}
                    />
                    <Chip
                      label={generatedCreds.department}
                      size="small"
                      sx={{ backgroundColor: "#F1F5F9", color: "#475569", fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: "block" }}>
                * User can reset this password via their profile menu anytime after initial login.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                flex: 1,
                minHeight: 280,
                border: "2px dashed #E2E8F0",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 4,
                textAlign: "center",
                color: "#94A3B8",
              }}
            >
              <PersonAddAlt1Icon sx={{ fontSize: 44, color: "#CBD5E1", mb: 1.5 }} />
              <Typography fontWeight={600} color="#64748B">
                No active pass generated
              </Typography>
              <Typography variant="caption" sx={{ maxWidth: 220, mt: 0.5 }}>
                Fill out the employee details on the left and click submit to issue credentials.
              </Typography>
            </Box>
          )}
        </Card>
      </Box>

      {/* Replaces native browser alert with modern toast banner */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{
            borderRadius: "12px",
            fontWeight: 600,
            boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}