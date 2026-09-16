import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TableContainer,
  Paper,
  Avatar,
} from "@mui/material";

export default function ManagerLeaveHistory() {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://localhost:7013/api/Leave/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load records", err);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Chip
            label="Approved"
            size="small"
            sx={{
              backgroundColor: "#E6F8F8",
              color: "#00B5B8",
              fontWeight: 700,
              borderRadius: "8px",
            }}
          />
        );
      case "Rejected":
        return (
          <Chip
            label="Rejected"
            size="small"
            sx={{
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              fontWeight: 700,
              borderRadius: "8px",
            }}
          />
        );
      default:
        return (
          <Chip
            label="Pending"
            size="small"
            sx={{
              backgroundColor: "#FFF3E0",
              color: "#FF9800",
              fontWeight: 700,
              borderRadius: "8px",
            }}
          />
        );
    }
  };

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
        Leave Records
      </Typography>
      <Typography sx={{ color: "#667085", mb: 4, mt: 1 }}>
        Audit and inspect department time-off schedules, approvals, and employee histories.
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
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#00B5B8", textTransform: "uppercase", letterSpacing: "1px" }}>
            Audit & Compliance
          </Typography>
          <Typography sx={{ fontSize: { xs: 30, md: 46 }, fontWeight: 800, mt: 1 }}>
            Master Workforce Records
          </Typography>
          <Typography sx={{ opacity: 0.85, mt: 1, maxWidth: 640 }}>
            Inspect past leaves, verify employee names, and cross-reference dates with departmental requirements.
          </Typography>
        </CardContent>
      </Card>

      {/* Main Table Card */}
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
            <Typography variant="h6" fontWeight={700} color="#0F173B">
              Employee Leave Records
            </Typography>
            <Chip
              label={`${records.length} Total Records`}
              sx={{ backgroundColor: "#F1F5F9", color: "#475569", fontWeight: 700 }}
            />
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "16px", border: "1px solid #E2E8F0" }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Leave Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 2 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record, index) => {
                  // Direct name fallback logic
                  const empName =
                    record.employeeName ||
                    record.EmployeeName ||
                    `Employee #${record.employeeId || record.EmployeeId}`;

                  const empEmail = record.employeeEmail || record.EmployeeEmail || record.department || "";

                  return (
                    <TableRow key={record.id ?? index} hover sx={{ transition: "0.2s" }}>
                      <TableCell sx={{ fontWeight: 600, color: "#64748B" }}>
                        #{record.id ?? index + 1}
                      </TableCell>

                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              bgcolor: "#F3E8FF",
                              color: "#7C3AED",
                              fontWeight: 700,
                              fontSize: 14,
                            }}
                          >
                            {empName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={700} color="#0F173B" fontSize={14}>
                              {empName}
                            </Typography>
                            {empEmail && (
                              <Typography variant="caption" color="#64748B">
                                {empEmail}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={record.leaveType || record.LeaveType}
                          size="small"
                          sx={{ fontWeight: 600, backgroundColor: "#F1F5F9" }}
                        />
                      </TableCell>

                      <TableCell sx={{ color: "#334155", fontWeight: 500 }}>
                        {record.startDate || record.StartDate} to {record.endDate || record.EndDate}
                      </TableCell>

                      <TableCell sx={{ color: "#64748B" }}>
                        {record.reason || record.Reason || "-"}
                      </TableCell>

                      <TableCell>{getStatusChip(record.status || record.Status)}</TableCell>
                    </TableRow>
                  );
                })}

                {records.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: "#64748B" }}>
                      No employee leave records found.
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