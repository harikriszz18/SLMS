import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Box,
  TableContainer,
  Paper,
} from "@mui/material";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import InsightsIcon from "@mui/icons-material/Insights";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import axios from "axios";
import {
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getAllLeaves,
} from "../services/managerService";

function ManagerDashboard() {
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  if (role !== "Manager") {
    return <Navigate to="/dashboard" />;
  }

  const [leaves, setLeaves] = useState<any[]>([]);
  const [allLeaves, setAllLeaves] = useState<any[]>([]);
  const [deptStats, setDeptStats] = useState({
    department: "",
    totalWorkforce: 0,
    presentToday: 0,
    absentToday: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const token = localStorage.getItem("token");

      // 1. Fetch pending & all leaves
      const [pending, all] = await Promise.all([
        getPendingLeaves(),
        getAllLeaves(),
      ]);

      setLeaves(Array.isArray(pending) ? pending : []);
      setAllLeaves(Array.isArray(all) ? all : []);

      // 2. Fetch strictly this manager's department stats
      const statsRes = await axios.get(
        `https://localhost:7013/api/ManagerInsights/my-department-stats?date=${today}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (statsRes.data) {
        setDeptStats({
          department: statsRes.data.department || "My Department",
          totalWorkforce: statsRes.data.totalWorkforce ?? 0,
          presentToday: statsRes.data.presentToday ?? 0,
          absentToday: statsRes.data.absentToday ?? 0,
        });
      }
    } catch (error) {
      console.error("Failed to load department-specific stats:", error);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveLeave(id);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectLeave(id);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const { totalWorkforce, presentToday, absentToday, department } = deptStats;
  const attendanceRate = totalWorkforce > 0 ? Math.round((presentToday / totalWorkforce) * 100) : 0;

  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (attendanceRate / 100) * circumference;

  const kpis = [
    {
      label: "Pending Requests",
      value: leaves.length,
      color: "#FF9800",
      bg: "#FFF8ED",
      border: "rgba(255, 152, 0, 0.2)",
      icon: <PendingActionsOutlinedIcon sx={{ color: "#FF9800", fontSize: 26 }} />,
    },
    {
      label: `Present Today (${department || "Dept"})`,
      value: `${presentToday} / ${totalWorkforce}`,
      color: "#00B5B8",
      bg: "#E6F8F8",
      border: "rgba(0, 181, 184, 0.2)",
      icon: <CheckCircleOutlineRoundedIcon sx={{ color: "#00B5B8", fontSize: 26 }} />,
    },
    {
      label: "Absent Today",
      value: absentToday,
      color: absentToday > 0 ? "#DC2626" : "#64748B",
      bg: absentToday > 0 ? "#FEE2E2" : "#F1F5F9",
      border: absentToday > 0 ? "rgba(220, 38, 38, 0.2)" : "#E2E8F0",
      icon: <EventBusyOutlinedIcon sx={{ color: absentToday > 0 ? "#DC2626" : "#64748B", fontSize: 26 }} />,
    },
    {
      label: "Total Records",
      value: allLeaves.length,
      color: "#0F173B",
      bg: "#EEF2F6",
      border: "#E2E8F0",
      icon: <AssessmentOutlinedIcon sx={{ color: "#0F173B", fontSize: 26 }} />,
    },
  ];

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", backgroundColor: "#F8FAFC", p: { xs: 2.5, md: 4 } }}>
      <Typography
        sx={{
          fontSize: { xs: "36px", md: "52px" },
          fontWeight: 700,
          color: "#0F173B",
          lineHeight: 1.1,
        }}
      >
        Manager Dashboard
      </Typography>
      <Typography sx={{ color: "#667085", mb: 4, mt: 1 }}>
        Real-time workforce availability, department presence, and pending leave authorizations.
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
            {department ? `${department} Division` : "Operational Management"}
          </Typography>
          <Typography sx={{ fontSize: { xs: 30, md: 46 }, fontWeight: 800, mt: 1.2 }}>
            Workforce Command Center
          </Typography>
          <Typography sx={{ opacity: 0.85, mt: 1, mb: 4, maxWidth: 650 }}>
            Monitor team operations, manage daily absence schedules, and respond promptly to employee leave requests.
          </Typography>

          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
            <Button
              variant="contained"
              startIcon={<InsightsIcon />}
              onClick={() => navigate("/absence-insights")}
              sx={{
                backgroundColor: "#00B5B8",
                fontWeight: 700,
                borderRadius: "14px",
                textTransform: "none",
                px: 3.5,
                py: 1.4,
                fontSize: "15px",
                boxShadow: "0 6px 18px rgba(0,181,184,0.35)",
                "&:hover": { backgroundColor: "#009EA0" },
              }}
            >
              View Daily Insights
            </Button>
            <Button
              variant="outlined"
              startIcon={<PersonAddAlt1Icon />}
              onClick={() => navigate("/register-employee")}
              sx={{
                color: "#FFFFFF",
                borderColor: "rgba(255,255,255,0.45)",
                fontWeight: 700,
                borderRadius: "14px",
                textTransform: "none",
                px: 3.5,
                py: 1.4,
                fontSize: "15px",
                "&:hover": {
                  borderColor: "#FFFFFF",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Register Member
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 4 KPI Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        {kpis.map((kpi, index) => (
          <Card
            key={index}
            sx={{
              borderRadius: "20px",
              p: 3,
              backgroundColor: "#FFFFFF",
              boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
              border: `1px solid ${kpi.border}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography sx={{ color: "#667085", fontSize: 14, fontWeight: 600 }}>
                {kpi.label}
              </Typography>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  backgroundColor: kpi.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {kpi.icon}
              </Box>
            </Box>
            <Typography sx={{ color: kpi.color, fontSize: 34, fontWeight: 800, mt: 2 }}>
              {kpi.value}
            </Typography>
          </Card>
        ))}
      </Box>

      {/* Middle Section */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.3fr 1fr" },
          gap: 4,
          mb: 4,
          alignItems: "stretch",
        }}
      >
        {/* Attendance Donut */}
        <Card
          sx={{
            borderRadius: "24px",
            p: { xs: 3, md: 4 },
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} color="#0F173B" mb={0.5}>
              {department ? `${department} Attendance Today` : "Workforce Attendance Today"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Real-time attendance ratio for {department || "your team"}.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              gap: 3,
              my: 3,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ position: "relative", width: 170, height: 170, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="170" height="170" viewBox="0 0 170 170" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="85" cy="85" r={radius} stroke="#E2E8F0" strokeWidth="14" fill="transparent" />
                <circle
                  cx="85"
                  cy="85"
                  r={radius}
                  stroke="#00B5B8"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <Box sx={{ position: "absolute", textAlign: "center" }}>
                <Typography sx={{ fontSize: 32, fontWeight: 800, color: "#0F173B", lineHeight: 1 }}>
                  {attendanceRate}%
                </Typography>
                <Typography variant="caption" sx={{ color: "#667085", fontWeight: 700, mt: 0.5, display: "block" }}>
                  Present
                </Typography>
              </Box>
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              <Box sx={{ p: 1.8, px: 2.5, borderRadius: "16px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 2, minWidth: 190 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#00B5B8" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>On Duty</Typography>
                  <Typography variant="body1" fontWeight={800} color="#0F173B">{presentToday} Members</Typography>
                </Box>
              </Box>

              <Box sx={{ p: 1.8, px: 2.5, borderRadius: "16px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 2, minWidth: 190 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#140F35" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>On Leave</Typography>
                  <Typography variant="body1" fontWeight={800} color="#0F173B">{absentToday} Members</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Typography variant="caption" color="text.secondary" textAlign="center">
            Filtered exclusively for {department || "your department"} active staff.
          </Typography>
        </Card>

        {/* Action Checklist */}
        <Card
          sx={{
            borderRadius: "24px",
            p: { xs: 3, md: 3.5 },
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="h6" fontWeight={700} color="#0F173B">
                Manager Action Checklist
              </Typography>
              <Chip
                label="Daily Routine"
                size="small"
                sx={{ backgroundColor: "#F1F5F9", color: "#475569", fontWeight: 700, fontSize: "11px", borderRadius: "8px" }}
              />
            </Box>

            <Box>
              <Box sx={{ mb: 2, p: 2, borderRadius: "16px", backgroundColor: "#FAFBFC", border: "1px solid #E2E8F0", borderLeft: "5px solid #00B5B8", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700} color="#0F173B" fontSize={14} sx={{ mb: 0.5 }}>
                    Review Pending Leaves
                  </Typography>
                  <Typography variant="body2" color="#64748B" sx={{ fontSize: "12.5px", lineHeight: 1.4 }}>
                    Resolve new requests within 24–48 hours before the start date.
                  </Typography>
                </Box>
                <Chip label="Urgent" size="small" sx={{ backgroundColor: "#E6F8F8", color: "#00B5B8", fontWeight: 700, fontSize: "10.5px", height: 24, borderRadius: "6px" }} />
              </Box>

              <Box sx={{ mb: 2, p: 2, borderRadius: "16px", backgroundColor: "#FAFBFC", border: "1px solid #E2E8F0", borderLeft: "5px solid #FF9800", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700} color="#0F173B" fontSize={14} sx={{ mb: 0.5 }}>
                    Verify Shift Coverage
                  </Typography>
                  <Typography variant="body2" color="#64748B" sx={{ fontSize: "12.5px", lineHeight: 1.4 }}>
                    Cross-check absence insights to prevent {department || "departmental"} coverage gaps.
                  </Typography>
                </Box>
                <Chip label="Daily" size="small" sx={{ backgroundColor: "#FFF3E0", color: "#FF9800", fontWeight: 700, fontSize: "10.5px", height: 24, borderRadius: "6px" }} />
              </Box>

              <Box sx={{ p: 2, borderRadius: "16px", backgroundColor: "#FAFBFC", border: "1px solid #E2E8F0", borderLeft: "5px solid #7C4DFF", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700} color="#0F173B" fontSize={14} sx={{ mb: 0.5 }}>
                    Audit Historical Records
                  </Typography>
                  <Typography variant="body2" color="#64748B" sx={{ fontSize: "12.5px", lineHeight: 1.4 }}>
                    Ensure manager remarks are logged for all decisions.
                  </Typography>
                </Box>
                <Chip label="Log" size="small" sx={{ backgroundColor: "#F3EFFF", color: "#7C4DFF", fontWeight: 700, fontSize: "10.5px", height: 24, borderRadius: "6px" }} />
              </Box>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 2, display: "block", fontSize: 11.5 }}>
            Checklist updates dynamically based on active department workflows.
          </Typography>
        </Card>
      </Box>

      {/* Pending Leave Requests Table */}
      <Card
        sx={{
          borderRadius: "24px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#0F173B">
                Pending Leave Requests
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Authorizations awaiting your managerial decision.
              </Typography>
            </Box>
            <Chip
              label={`${leaves.length} Awaiting Decision`}
              sx={{
                backgroundColor: leaves.length > 0 ? "#FFF3E0" : "#E6F8F8",
                color: leaves.length > 0 ? "#FF9800" : "#00B5B8",
                fontWeight: 700,
                borderRadius: "10px",
                px: 1,
              }}
            />
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Leave Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Dates</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.map((leave) => {
                  const sDate = leave.startDate ? leave.startDate.split("T")[0] : "-";
                  const eDate = leave.endDate ? leave.endDate.split("T")[0] : "-";

                  return (
                    <TableRow key={leave.id} hover sx={{ transition: "0.2s" }}>
                      <TableCell sx={{ fontWeight: 600, color: "#64748B" }}>
                        #{leave.id}
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={700} color="#0F173B">
                          {leave.employeeName || `Employee #${leave.employeeId}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {leave.employeeEmail || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={leave.leaveType}
                          size="small"
                          sx={{ fontWeight: 600, backgroundColor: "#F1F5F9", color: "#1E293B", borderRadius: "8px" }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#334155", fontWeight: 500 }}>
                        {sDate} to {eDate}
                      </TableCell>
                      <TableCell sx={{ color: "#64748B", maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {leave.reason || "No reason provided"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleApprove(leave.id)}
                          sx={{
                            mr: 1.5,
                            backgroundColor: "#00B5B8",
                            fontWeight: 700,
                            borderRadius: "8px",
                            textTransform: "none",
                            boxShadow: "none",
                            "&:hover": { backgroundColor: "#009EA0", boxShadow: "none" },
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleReject(leave.id)}
                          sx={{
                            fontWeight: 700,
                            borderRadius: "8px",
                            textTransform: "none",
                          }}
                        >
                          Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {leaves.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                        <DoneAllRoundedIcon sx={{ fontSize: 40, color: "#00B5B8" }} />
                        <Typography fontWeight={700} color="#0F173B" fontSize={16}>
                          All requests reviewed!
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          No pending leave applications requiring attention at this moment.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ManagerDashboard;