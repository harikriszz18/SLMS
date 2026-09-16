import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
  TableContainer,
  Paper,
  Grid,
} from "@mui/material";

import { getLeaveHistory } from "../services/leaveService";

function LeaveHistory() {
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getLeaveHistory();
      setLeaves(data);
    } catch (error) {
      console.error(error);
    }
  };

  const approvedCount = leaves.filter((x) => x.status === "Approved").length;
  const pendingCount = leaves.filter((x) => x.status === "Pending").length;
  const rejectedCount = leaves.filter((x) => x.status === "Rejected").length;

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
              px: 1,
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
              px: 1,
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
              px: 1,
            }}
          />
        );
    }
  };

  const statsCard = {
    borderRadius: "20px",
    p: 3,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
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

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        p: 4,
      }}
    >
      {/* Page Header */}
      <Typography
        sx={{
          fontSize: {
            xs: "40px",
            md: "58px",
          },
          fontWeight: 700,
          color: "#0F173B",
          lineHeight: 1.1,
        }}
      >
        Leave History
      </Typography>

      <Typography
        sx={{
          color: "#667085",
          mb: 4,
          mt: 1,
        }}
      >
        View, filter, and track all submitted leave applications and approvals.
      </Typography>

      {/* Hero Banner Card */}
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
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            Leave Application Archives
          </Typography>

          <Typography
            sx={{
              fontSize: {
                xs: 34,
                md: 56,
              },
              fontWeight: 800,
              mt: 2,
            }}
          >
            Activity & Records
          </Typography>

          <Typography
            sx={{
              opacity: 0.85,
              mt: 1,
              mb: 4,
            }}
          >
            Review all previous requests, manager decisions, and time-off timelines.
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              label={`${leaves.length} Total Applications`}
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontWeight: 700,
              }}
            />
            <Chip
              label={`${approvedCount} Approved`}
              sx={{
                bgcolor: "#00B5B8",
                color: "#fff",
                fontWeight: 700,
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* KPI Cards — matching Calendar & Apply Leave format */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={statsCard}>
            <Typography sx={cardLabel}>Total Requests</Typography>
            <Typography sx={cardValue}>{leaves.length}</Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={statsCard}>
            <Typography sx={cardLabel}>Approved Leaves</Typography>
            <Typography sx={{ ...cardValue, color: "#00B5B8" }}>
              {approvedCount}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={statsCard}>
            <Typography sx={cardLabel}>Pending Review</Typography>
            <Typography sx={{ ...cardValue, color: "#FF9800" }}>
              {pendingCount}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={statsCard}>
            <Typography sx={cardLabel}>Rejected</Typography>
            <Typography sx={{ ...cardValue, color: "#DC2626" }}>
              {rejectedCount}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table Card */}
      <Card
        sx={{
          borderRadius: "22px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          background: "#FFFFFF",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 700,
                color: "#0F173B",
              }}
            >
              Leave Records
            </Typography>

            <Chip
              label={`${leaves.length} Entries`}
              size="small"
              sx={{
                fontWeight: 700,
                backgroundColor: "#F1F5F9",
                color: "#475569",
              }}
            />
          </Box>

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F8FAFC" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#475569", py: 2 }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569", py: 2 }}>
                    Leave Type
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569", py: 2 }}>
                    Start Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569", py: 2 }}>
                    End Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569", py: 2 }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {leaves.map((leave) => (
                  <TableRow
                    key={leave.id}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      transition: "0.2s ease",
                      "&:hover": {
                        backgroundColor: "#F8FAFC",
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#64748B" }}>
                      #{leave.id}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={leave.leaveType}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          backgroundColor: "#F1F5F9",
                          color: "#1E293B",
                          borderRadius: "8px",
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: "#334155", fontWeight: 500 }}>
                      {new Date(leave.startDate).toLocaleDateString()}
                    </TableCell>

                    <TableCell sx={{ color: "#334155", fontWeight: 500 }}>
                      {new Date(leave.endDate).toLocaleDateString()}
                    </TableCell>

                    <TableCell>{getStatusChip(leave.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {leaves.length === 0 && (
            <Box
              sx={{
                py: 8,
                textAlign: "center",
              }}
            >
              <Typography color="text.secondary" fontWeight={500}>
                No leave records found.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default LeaveHistory;