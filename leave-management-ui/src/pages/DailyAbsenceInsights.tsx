import { useState, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { getAbsencesByDate } from "../services/employeeService";

export default function DailyAbsenceInsights() {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [absentEmployees, setAbsentEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (selectedDate) {
      loadAbsences(selectedDate.format("YYYY-MM-DD"));
    }
  }, [selectedDate]);

  const loadAbsences = async (dateStr: string) => {
    try {
      const data = await getAbsencesByDate(dateStr);
      setAbsentEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAbsentEmployees([]);
    }
  };

  const statsCard = {
    borderRadius: "22px",
    p: 3.5,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    border: "1px solid #E2E8F0",
  };

  const casualCount = absentEmployees.filter((e) =>
    (e?.leaveType || "").toLowerCase().includes("casual")
  ).length;

  const sickCount = absentEmployees.filter((e) =>
    (e?.leaveType || "").toLowerCase().includes("sick")
  ).length;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: "100%", minHeight: "100vh", backgroundColor: "#F8FAFC", p: { xs: 2.5, md: 4 } }}>
        <Typography
          sx={{
            fontSize: { xs: "36px", md: "52px" },
            fontWeight: 700,
            color: "#0F173B",
            lineHeight: 1.1,
          }}
        >
          Manager Attendance Insights
        </Typography>
        <Typography sx={{ color: "#667085", mb: 4, mt: 1 }}>
          Check daily attendance records, team absence schedules, and workforce availability by date.
        </Typography>

        <Card
          sx={{
            p: 3,
            px: 4,
            borderRadius: "22px",
            mb: 4,
            background: "#FFFFFF",
            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
            border: "1px solid #E2E8F0",
          }}
        >
          <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
            <Typography fontWeight={700} color="#0F173B" sx={{ fontSize: 16 }}>
              Select Attendance Date:
            </Typography>
            <DatePicker
              value={selectedDate}
              onChange={(newVal) => setSelectedDate(newVal)}
              slotProps={{
                textField: {
                  sx: {
                    minWidth: 260,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      backgroundColor: "#FAFBFC",
                    },
                  },
                },
              }}
            />
          </Box>
        </Card>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
            gap: 3,
            mb: 4,
          }}
        >
          <Card sx={statsCard}>
            <Typography sx={{ color: "#667085", fontSize: 14, fontWeight: 600 }}>
              Total Absent on Date
            </Typography>
            <Typography sx={{ color: "#DC2626", fontSize: 36, fontWeight: 800, mt: 1 }}>
              {absentEmployees.length}
            </Typography>
          </Card>

          <Card sx={statsCard}>
            <Typography sx={{ color: "#667085", fontSize: 14, fontWeight: 600 }}>
              Casual / Planned
            </Typography>
            <Typography sx={{ color: "#00B5B8", fontSize: 36, fontWeight: 800, mt: 1 }}>
              {casualCount}
            </Typography>
          </Card>

          <Card sx={statsCard}>
            <Typography sx={{ color: "#667085", fontSize: 14, fontWeight: 600 }}>
              Medical / Sick
            </Typography>
            <Typography sx={{ color: "#FF9800", fontSize: 36, fontWeight: 800, mt: 1 }}>
              {sickCount}
            </Typography>
          </Card>
        </Box>

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
                Employees on Leave on {selectedDate ? selectedDate.format("DD MMMM YYYY") : ""}
              </Typography>
              <Chip
                label={`${absentEmployees.length} Employees Absent`}
                sx={{ backgroundColor: "#F1F5F9", color: "#475569", fontWeight: 700 }}
              />
            </Box>

            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden" }}
            >
              <Table>
                <TableHead sx={{ backgroundColor: "#F8FAFC" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, py: 2.2 }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 2.2 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 2.2 }}>Leave Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 2.2 }}>Leave Period</TableCell>
                    <TableCell sx={{ fontWeight: 700, py: 2.2 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {absentEmployees.map((emp, i) => (
                    <TableRow key={i} hover sx={{ transition: "0.2s" }}>
                      <TableCell sx={{ fontWeight: 600, color: "#0F173B" }}>
                        {emp.employeeName || `Employee #${emp.employeeId}`}
                      </TableCell>
                      <TableCell sx={{ color: "#64748B" }}>{emp.department || "General"}</TableCell>
                      <TableCell>
                        <Chip
                          label={emp.leaveType}
                          size="small"
                          sx={{ fontWeight: 600, backgroundColor: "#F1F5F9" }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#334155" }}>
                        {dayjs(emp.startDate).format("DD/MM/YYYY")} -{" "}
                        {dayjs(emp.endDate).format("DD/MM/YYYY")}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={emp.status}
                          size="small"
                          sx={{
                            backgroundColor: "#E6F8F8",
                            color: "#00B5B8",
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {absentEmployees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: "#64748B" }}>
                        All team members are present on this day.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
}