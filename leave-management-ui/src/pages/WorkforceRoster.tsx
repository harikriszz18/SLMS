import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
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
  TextField,
  InputAdornment,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import axios from "axios";

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  status: "Present" | "On Leave";
  leaveType?: string;
  leaveReason?: string;
  leavePeriod?: string;
}

interface DepartmentGroup {
  departmentName: string;
  total: number;
  present: number;
  onLeave: number;
  employees: Employee[];
}

export default function WorkforceRoster() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorNotice, setErrorNotice] = useState("");

  const [summary, setSummary] = useState({
    totalEmployees: 0,
    presentCount: 0,
    onLeaveCount: 0,
  });
  const [departments, setDepartments] = useState<DepartmentGroup[]>([]);

  useEffect(() => {
    if (selectedDate) {
      loadRoster(selectedDate.format("YYYY-MM-DD"));
    }
  }, [selectedDate]);

  const loadRoster = async (dateStr: string) => {
    setLoading(true);
    setErrorNotice("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`https://localhost:7013/api/ManagerInsights/roster?date=${dateStr}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.data) {
        setSummary({
          totalEmployees: res.data.summary?.totalEmployees ?? 0,
          presentCount: res.data.summary?.presentCount ?? 0,
          onLeaveCount: res.data.summary?.onLeaveCount ?? 0,
        });
        setDepartments(Array.isArray(res.data.departments) ? res.data.departments : []);
      }
    } catch (err: any) {
      console.error("Roster fetch error:", err);
      setErrorNotice(
        err.response?.data?.message ||
        "Could not load attendance roster. Please ensure the backend API is running and you are logged in as a Manager."
      );
    } finally {
      setLoading(false);
    }
  };

  const statsCard = {
    borderRadius: "20px",
    p: 3,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    border: "1px solid #E2E8F0",
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: "100%", minHeight: "100vh", backgroundColor: "#F8FAFC", p: { xs: 2.5, md: 4 } }}>
        <Typography
          sx={{
            fontSize: { xs: "34px", md: "48px" },
            fontWeight: 700,
            color: "#0F173B",
            lineHeight: 1.1,
          }}
        >
          Departmental Workforce Roster
        </Typography>
        <Typography sx={{ color: "#667085", mb: 4, mt: 0.8 }}>
          Multi-department attendance & presence dashboard for all operational divisions.
        </Typography>

        {/* Hero Banner */}
        <Card
          sx={{
            mb: 4,
            borderRadius: "24px",
            color: "#FFFFFF",
            background: "linear-gradient(90deg, #140F35 0%, #171044 50%, #1A1450 100%)",
            boxShadow: "0 12px 28px rgba(20, 15, 53, 0.28)",
          }}
        >
          <CardContent sx={{ p: { xs: 3.5, md: 5 } }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#00B5B8", textTransform: "uppercase", letterSpacing: "1.2px" }}>
              Cross-Department Governance
            </Typography>
            <Typography sx={{ fontSize: { xs: 28, md: 44 }, fontWeight: 800, mt: 1 }}>
              Department Presence Directory
            </Typography>
            <Typography sx={{ opacity: 0.85, mt: 1, maxWidth: 620 }}>
              Grouped view of all organization departments. Inspect operational capacity, active leaves, and reasons by department.
            </Typography>
          </CardContent>
        </Card>

        {errorNotice && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: "14px", fontWeight: 600 }}>
            {errorNotice}
          </Alert>
        )}

        {/* KPI Summary Cards */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 3, mb: 4 }}>
          <Card sx={statsCard}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography sx={{ color: "#64748B", fontSize: 14, fontWeight: 600 }}>Total Company Staff</Typography>
              <Box sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GroupsRoundedIcon sx={{ color: "#6366F1" }} />
              </Box>
            </Box>
            <Typography sx={{ color: "#0F173B", fontSize: 34, fontWeight: 800, mt: 1 }}>
              {summary.totalEmployees}
            </Typography>
          </Card>

          <Card sx={statsCard}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography sx={{ color: "#64748B", fontSize: 14, fontWeight: 600 }}>Present & On Duty</Typography>
              <Box sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: "#E6F8F8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircleRoundedIcon sx={{ color: "#00B5B8" }} />
              </Box>
            </Box>
            <Typography sx={{ color: "#00B5B8", fontSize: 34, fontWeight: 800, mt: 1 }}>
              {summary.presentCount}
            </Typography>
          </Card>

          <Card sx={statsCard}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography sx={{ color: "#64748B", fontSize: 14, fontWeight: 600 }}>On Approved Leave</Typography>
              <Box sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CancelRoundedIcon sx={{ color: "#DC2626" }} />
              </Box>
            </Box>
            <Typography sx={{ color: "#DC2626", fontSize: 34, fontWeight: 800, mt: 1 }}>
              {summary.onLeaveCount}
            </Typography>
          </Card>
        </Box>

        {/* Date & Search Filter Toolbar */}
        <Card
          sx={{
            p: 3,
            px: { xs: 2.5, md: 4 },
            borderRadius: "22px",
            mb: 4,
            background: "#FFFFFF",
            boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
            border: "1px solid #E2E8F0",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: { xs: 2.5, md: 4 }, // Distinct spacious gap between Date and Search
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Left: Date Picker */}
            <Box sx={{ minWidth: { xs: "100%", sm: 260 } }}>
              <DatePicker
                label="Select Attendance Date"
                value={selectedDate}
                onChange={(newVal) => setSelectedDate(newVal)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "14px",
                        backgroundColor: "#FAFBFC",
                        "&:hover fieldset": {
                          borderColor: "#00B5B8",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#00B5B8",
                          borderWidth: "1.5px",
                        },
                      },
                    },
                  },
                }}
              />
            </Box>

            {/* Right: Modern Polished Search Box */}
            <Box sx={{ flexGrow: 1, minWidth: { xs: "100%", sm: 320 } }}>
              <TextField
                fullWidth
                placeholder="Search employees by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ ml: 0.5, mr: 1 }}>
                      <SearchRoundedIcon sx={{ color: "#00B5B8", fontSize: 22 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    backgroundColor: "#FAFBFC",
                    transition: "all 0.25s ease-in-out",
                    "& fieldset": {
                      borderColor: "#E2E8F0",
                    },
                    "&:hover": {
                      backgroundColor: "#FFFFFF",
                      "& fieldset": {
                        borderColor: "#00B5B8",
                      },
                      boxShadow: "0 2px 8px rgba(0, 181, 184, 0.08)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "#FFFFFF",
                      boxShadow: "0 0 0 4px rgba(0, 181, 184, 0.12)",
                      "& fieldset": {
                        borderColor: "#00B5B8",
                        borderWidth: "1.5px",
                      },
                    },
                    "& input": {
                      py: 1.8,
                      fontSize: "14.5px",
                      fontWeight: 500,
                      color: "#0F173B",
                      "&::placeholder": {
                        color: "#94A3B8",
                        opacity: 1,
                      },
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Card>
        {/* Grouped Department Tables */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={38} sx={{ color: "#00B5B8" }} />
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={4}>
            {departments.map((deptGroup) => {
              const employeeList = Array.isArray(deptGroup?.employees) ? deptGroup.employees : [];
              const filteredEmployees = employeeList.filter((emp) =>
                (emp?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (emp?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
              );

              if (filteredEmployees.length === 0 && searchTerm.trim() !== "") {
                return null;
              }

              return (
                <Card
                  key={deptGroup.departmentName}
                  sx={{
                    borderRadius: "24px",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    overflow: "hidden",
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                    {/* Department Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} mb={2.5}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: "#E6FBFB", color: "#00B5B8", width: 40, height: 40 }}>
                          <BusinessRoundedIcon fontSize="small" />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={800} color="#0F173B">
                            {deptGroup.departmentName || "General Department"}
                          </Typography>
                          <Typography variant="caption" color="#64748B">
                            {deptGroup.present ?? 0} Present • {deptGroup.onLeave ?? 0} On Leave • {deptGroup.total ?? 0} Total Staff
                          </Typography>
                        </Box>
                      </Box>

                      <Box display="flex" gap={1}>
                        <Chip
                          label={`${deptGroup.present ?? 0} Present`}
                          size="small"
                          sx={{ bgcolor: "#E6F8F8", color: "#00B5B8", fontWeight: 700 }}
                        />
                        {(deptGroup.onLeave ?? 0) > 0 && (
                          <Chip
                            label={`${deptGroup.onLeave} On Leave`}
                            size="small"
                            sx={{ bgcolor: "#FEE2E2", color: "#DC2626", fontWeight: 700 }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <TableContainer component={Paper} elevation={0} sx={{ borderRadius: "14px", border: "1px solid #E2E8F0" }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, py: 1.8 }}>Employee</TableCell>
                            <TableCell sx={{ fontWeight: 700, py: 1.8 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700, py: 1.8 }}>Leave Details</TableCell>
                            <TableCell sx={{ fontWeight: 700, py: 1.8 }}>Reason for Leave</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredEmployees.map((emp) => {
                            const isPresent = emp?.status === "Present";
                            const empName = emp?.name || `Employee #${emp?.id}`;

                            return (
                              <TableRow key={emp.id} hover sx={{ transition: "0.2s" }}>
                                <TableCell>
                                  <Box display="flex" alignItems="center" gap={1.5}>
                                    <Avatar
                                      sx={{
                                        width: 34,
                                        height: 34,
                                        bgcolor: isPresent ? "#E6F8F8" : "#FEE2E2",
                                        color: isPresent ? "#00B5B8" : "#DC2626",
                                        fontWeight: 700,
                                        fontSize: 13,
                                      }}
                                    >
                                      {empName.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                      <Typography fontWeight={700} color="#0F173B" fontSize={14}>
                                        {empName}
                                      </Typography>
                                      <Typography variant="caption" color="#64748B">
                                        {emp?.email}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>

                                <TableCell>
                                  <Chip
                                    label={emp?.status || "Present"}
                                    size="small"
                                    sx={{
                                      backgroundColor: isPresent ? "#E6F8F8" : "#FEE2E2",
                                      color: isPresent ? "#00B5B8" : "#DC2626",
                                      fontWeight: 700,
                                      borderRadius: "8px",
                                    }}
                                  />
                                </TableCell>

                                <TableCell>
                                  {isPresent ? (
                                    <Typography variant="body2" color="#64748B">
                                       Working
                                    </Typography>
                                  ) : (
                                    <Box display="flex" flexDirection="column" gap={0.3}>
                                      <Chip
                                        label={emp?.leaveType || "Leave"}
                                        size="small"
                                        sx={{
                                          width: "fit-content",
                                          height: 20,
                                          fontSize: "10px",
                                          fontWeight: 700,
                                          bgcolor: "#EDE9FE",
                                          color: "#6D28D9",
                                        }}
                                      />
                                      {emp?.leavePeriod && (
                                        <Typography variant="caption" color="text.secondary">
                                          {emp.leavePeriod}
                                        </Typography>
                                      )}
                                    </Box>
                                  )}
                                </TableCell>

                                <TableCell sx={{ color: isPresent ? "#94A3B8" : "#334155", fontStyle: isPresent ? "italic" : "normal" }}>
                                  {isPresent ? "—" : (emp?.leaveReason || "No reason specified")}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              );
            })}

            {departments.length === 0 && (
              <Box sx={{ py: 6, textAlign: "center", color: "#64748B" }}>
                <Typography>No employee records found in users.json.</Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
}