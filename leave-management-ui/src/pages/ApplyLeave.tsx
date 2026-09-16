import { useState, useEffect } from "react";
import { Dayjs } from "dayjs";
import {
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Box,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { applyLeave, getLeaveHistory } from "../services/leaveService";
import { getBalance } from "../services/dashboardService";

function ApplyLeave() {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const [balance, setBalance] = useState<{
    totalLeaves: number;
    usedLeaves: number;
    remainingLeaves: number;
  }>({
    totalLeaves: 24,
    usedLeaves: 0,
    remainingLeaves: 24,
  });
  const [pendingCount, setPendingCount] = useState(0);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setFetchingData(true);
      const [balanceData, historyData] = await Promise.allSettled([
        getBalance(),
        getLeaveHistory(),
      ]);

      if (balanceData.status === "fulfilled" && balanceData.value) {
        setBalance(balanceData.value);
      }

      if (historyData.status === "fulfilled" && Array.isArray(historyData.value)) {
        // Correctly counts only the authenticated employee's pending records
        const pending = historyData.value.filter(
          (l: any) => l.status === "Pending"
        ).length;
        setPendingCount(pending);
      }
    } catch (err) {
      console.error("Failed to load user live leave stats:", err);
    } finally {
      setFetchingData(false);
    }
  };

  const handleApplyLeave = async () => {
    if (!leaveType) {
      setSnackbar({
        open: true,
        message: "Please select a leave type.",
        severity: "warning",
      });
      return;
    }

    if (!startDate || !endDate) {
      setSnackbar({
        open: true,
        message: "Please specify both start and end dates.",
        severity: "warning",
      });
      return;
    }

    if (endDate.isBefore(startDate)) {
      setSnackbar({
        open: true,
        message: "End date cannot be prior to start date.",
        severity: "error",
      });
      return;
    }

    if (!reason.trim()) {
      setSnackbar({
        open: true,
        message: "Please provide a brief reason for your leave request.",
        severity: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      await applyLeave(
        leaveType,
        startDate.format("YYYY-MM-DD"),
        endDate.format("YYYY-MM-DD"),
        reason
      );

      setSnackbar({
        open: true,
        message: "Leave request submitted successfully for approval.",
        severity: "success",
      });

      setLeaveType("");
      setStartDate(null);
      setEndDate(null);
      setReason("");

      await loadData();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Unable to submit leave request. Please verify your session and try again.";
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const statsCard = {
    borderRadius: "20px",
    p: 3,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    backgroundColor: "#FFFFFF",
    height: "100%",
  };

  const cardLabel = {
    color: "#667085",
    fontSize: 14,
    fontWeight: 600,
  };

  const cardValue = {
    mt: 1,
    color: "#0F173B",
    fontSize: 32,
    fontWeight: 800,
  };

  const dynamicLeaveBalances = [
    {
      title: "Annual Leave",
      balance: `${balance.remainingLeaves} Days Available`,
      color: "#00B5B8",
      bg: "#E6F8F8",
    },
    {
      title: "Used Entitlement",
      balance: `${balance.usedLeaves} Days Consumed`,
      color: "#FF9800",
      bg: "#FFF5E6",
    },
    {
      title: "Total Annual Quota",
      balance: `${balance.totalLeaves} Days Total`,
      color: "#7C4DFF",
      bg: "#F3EFFF",
    },
  ];

  const guidelines = [
    {
      title: "Advance Notice",
      detail: "Apply at least 3 days before your planned leave.",
      color: "#00B5B8",
    },
    {
      title: "Manager Review",
      detail: "Manager approval is required before leave is granted.",
      color: "#FF9800",
    },
    {
      title: "Leave Limits",
      detail: "Maximum 15 consecutive leave days are permitted.",
      color: "#4CAF50",
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          width: "100%",
          p: 4,
          backgroundColor: "#F8FAFC",
          minHeight: "100vh",
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: "40px", md: "58px" },
            fontWeight: 700,
            color: "#0F173B",
            lineHeight: 1.1,
          }}
        >
          Apply Leave
        </Typography>

        <Typography sx={{ color: "#667085", mb: 4, mt: 1 }}>
          Submit leave requests and track approvals.
        </Typography>

        {/* Hero Banner */}
        <Card
          sx={{
            mb: 4,
            borderRadius: "22px",
            color: "#FFFFFF",
            background:
              "linear-gradient(90deg,#140F35 0%,#171044 50%,#1A1450 100%)",
            boxShadow: "0 12px 28px rgba(20,15,53,0.28)",
          }}
        >
          <CardContent sx={{ p: 5 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 600 }}>
              Apply For Leave
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: 34, md: 56 },
                fontWeight: 800,
                mt: 2,
              }}
            >
              Leave Request
            </Typography>

            <Typography sx={{ opacity: 0.85, mt: 1, mb: 4 }}>
              Request time-off quickly and efficiently with manager notification.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
              {fetchingData ? (
                <CircularProgress size={24} sx={{ color: "#00B5B8" }} />
              ) : (
                <>
                  <Chip
                    label={`${balance.remainingLeaves} Available`}
                    sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 700 }}
                  />
                  <Chip
                    label={`${balance.usedLeaves} Used`}
                    sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 700 }}
                  />
                  <Chip
                    label={`${pendingCount} Pending`}
                    sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 700 }}
                  />
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={statsCard}>
              <Typography sx={cardLabel}>Available Leave</Typography>
              <Typography sx={cardValue}>
                {fetchingData ? <CircularProgress size={24} /> : balance.remainingLeaves}
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={statsCard}>
              <Typography sx={cardLabel}>Used Leave</Typography>
              <Typography sx={cardValue}>
                {fetchingData ? <CircularProgress size={24} /> : balance.usedLeaves}
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={statsCard}>
              <Typography sx={cardLabel}>Pending Requests</Typography>
              <Typography sx={{ ...cardValue, color: "#00B5B8" }}>
                {fetchingData ? <CircularProgress size={24} /> : pendingCount}
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={statsCard}>
              <Typography sx={cardLabel}>Leave Year</Typography>
              <Typography sx={cardValue}>2026</Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Leave Request Form */}
        <Card
          sx={{
            width: "100%",
            borderRadius: "24px",
            background: "#FFFFFF",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            mb: 4,
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Typography variant="h5" sx={{ color: "#0F173B", fontWeight: 700, mb: 1 }}>
              Leave Request Form
            </Typography>

            <Typography sx={{ color: "#6B7280", mb: 4 }}>
              Submit your request details for supervisory verification.
            </Typography>

            <TextField
              select
              fullWidth
              label="Leave Type"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": { borderRadius: "14px" },
              }}
            >
              <MenuItem value="Casual">Casual Leave</MenuItem>
              <MenuItem value="Sick">Sick Leave</MenuItem>
              <MenuItem value="Earned">Earned Leave</MenuItem>
              <MenuItem value="Annual Leave">Annual Leave</MenuItem>
              <MenuItem value="Medical Leave">Medical Leave</MenuItem>
              <MenuItem value="Maternity Leave">Maternity Leave</MenuItem>
              <MenuItem value="Paternity Leave">Paternity Leave</MenuItem>
              <MenuItem value="Vacation Leave">Vacation Leave</MenuItem>
              <MenuItem value="Emergency Leave">Emergency Leave</MenuItem>
              <MenuItem value="Work From Home">Work From Home</MenuItem>
            </TextField>

            <Grid container spacing={3} sx={{ mb: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          backgroundColor: "#FAFBFC",
                        },
                      },
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "14px",
                          backgroundColor: "#FAFBFC",
                        },
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              label="Reason"
              multiline
              rows={4}
              fullWidth
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State reason for absence..."
              sx={{
                mt: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  backgroundColor: "#FAFBFC",
                },
              }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 4 }}>
              <Button
                variant="contained"
                disabled={loading}
                onClick={handleApplyLeave}
                sx={{
                  px: 5,
                  py: 1.6,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "15px",
                  background: "#00B5B8",
                  boxShadow: "0 8px 20px rgba(0,181,184,0.30)",
                  "&:hover": { background: "#009EA0" },
                }}
              >
                {loading ? "Submitting..." : "Submit Leave Request"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Bottom Information Cards */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: "20px", height: "100%", boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 3, color: "#0F173B" }}>
                  Leave Balance
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {dynamicLeaveBalances.map((item) => (
                    <Card
                      key={item.title}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: "14px",
                        borderLeft: `5px solid ${item.color}`,
                        backgroundColor: "#FFFFFF",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography fontWeight={700} color="#0F173B">
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Full Pay Allowance
                        </Typography>
                      </Box>
                      <Chip
                        label={item.balance}
                        sx={{
                          backgroundColor: item.bg,
                          color: item.color,
                          fontWeight: 700,
                          borderRadius: "10px",
                        }}
                      />
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ borderRadius: "20px", height: "100%", boxShadow: "0 6px 18px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 3, color: "#0F173B" }}>
                  Leave Guidelines
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {guidelines.map((guide, idx) => (
                    <Card
                      key={idx}
                      variant="outlined"
                      sx={{
                        p: 2.2,
                        borderRadius: "14px",
                        borderLeft: `5px solid ${guide.color}`,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <Typography fontWeight={700} sx={{ color: "#0F173B", mb: 0.5 }}>
                        {guide.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {guide.detail}
                      </Typography>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            severity={snackbar.severity}
            variant="filled"
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            sx={{ borderRadius: "12px", fontWeight: 600 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

export default ApplyLeave;