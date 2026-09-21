import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import TodayRoundedIcon from "@mui/icons-material/TodayRounded";
import DateRangeRoundedIcon from "@mui/icons-material/DateRangeRounded";
import CelebrationRoundedIcon from "@mui/icons-material/CelebrationRounded";
import BookmarkAddedRoundedIcon from "@mui/icons-material/BookmarkAddedRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import CloseIcon from "@mui/icons-material/Close";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import { getAllLeaves } from "../services/managerService";
import { getLeaveHistory } from "../services/leaveService";

interface Holiday {
  date: string;
  title: string;
  type: "Fixed" | "Optional";
}

interface LeaveRecord {
  id: number;
  employeeId?: number;
  EmployeeId?: number;
  employeeEmail?: string;
  EmployeeEmail?: string;
  employeeName?: string;
  EmployeeName?: string;
  name?: string;
  Name?: string;
  leaveType: string;
  LeaveType?: string;
  startDate: string;
  StartDate?: string;
  endDate: string;
  EndDate?: string;
  reason?: string;
  Reason?: string;
  status: string;
  Status?: string;
}

function CalendarPage() {
  const role = localStorage.getItem("role") || "Employee";
  const userEmail = (localStorage.getItem("email") || "").trim().toLowerCase();
  const isManager = role === "Manager";

  const [currentMonth, setCurrentMonth] = useState(8); // September
  const currentYear = 2026;
  const [allDbLeaves, setAllDbLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    day: number;
    holiday?: Holiday;
    leaves: LeaveRecord[];
  } | null>(null);

  const getEmployeeDisplayName = (leave?: any): string => {
    if (!leave) return "Team Member";

    const name =
      leave.employeeName ||
      leave.EmployeeName ||
      leave.name ||
      leave.Name ||
      leave.userName ||
      leave.UserName;

    if (
      name &&
      typeof name === "string" &&
      name.trim() !== "" &&
      !name.startsWith("Employee #") &&
      !name.startsWith("Member #")
    ) {
      return name;
    }

    const email = leave.employeeEmail || leave.EmployeeEmail || leave.email || leave.Email;
    if (email && typeof email === "string" && email.includes("@")) {
      const prefix = email.split("@")[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }

    const id = leave.employeeId ?? leave.EmployeeId ?? leave.id;
    return id ? `Member #${id}` : "Team Member";
  };

  const holidays: Holiday[] = useMemo(
    () => [
      { date: "2026-01-01", title: "New Year", type: "Optional" },
      { date: "2026-01-15", title: "Makara Sankranti", type: "Fixed" },
      { date: "2026-01-26", title: "Republic Day", type: "Fixed" },
      { date: "2026-03-19", title: "Ugadi", type: "Fixed" },
      { date: "2026-04-03", title: "Good Friday", type: "Optional" },
      { date: "2026-04-14", title: "Ambedkar Jayanti", type: "Optional" },
      { date: "2026-04-20", title: "Basava Jayanti", type: "Optional" },
      { date: "2026-05-01", title: "May Day", type: "Fixed" },
      { date: "2026-05-28", title: "Bakrid", type: "Optional" },
      { date: "2026-09-14", title: "Ganesh Chaturthi", type: "Fixed" },
      { date: "2026-10-02", title: "Gandhi Jayanti", type: "Fixed" },
      { date: "2026-10-20", title: "Mahanavami", type: "Optional" },
      { date: "2026-10-21", title: "Vijayadashami", type: "Fixed" },
      { date: "2026-11-10", title: "Deepavali", type: "Fixed" },
      { date: "2026-12-25", title: "Christmas", type: "Optional" },
    ],
    []
  );

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  useEffect(() => {
    loadBackendData();
  }, []);

  const loadBackendData = async () => {
    setLoading(true);
    try {
      if (isManager) {
        const data = await getAllLeaves();
        setAllDbLeaves(Array.isArray(data) ? data : []);
      } else {
        const data = await getLeaveHistory();
        setAllDbLeaves(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to load leaves:", error);
      try {
        const fallbackData = await getLeaveHistory();
        setAllDbLeaves(Array.isArray(fallbackData) ? fallbackData : []);
      } catch {
        setAllDbLeaves([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const userScopedLeaves = useMemo(() => {
    if (isManager) {
      return allDbLeaves;
    }
    return allDbLeaves.filter((l) => {
      const email = (l.employeeEmail || l.EmployeeEmail || "").trim().toLowerCase();
      if (email && userEmail) {
        return email === userEmail;
      }
      return true;
    });
  }, [allDbLeaves, isManager, userEmail]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const days = [];
    const adjustedStart = startDay === 0 ? 6 : startDay - 1;

    for (let i = 0; i < adjustedStart; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  }, [currentMonth]);

  const monthHolidays = useMemo(() => {
    return holidays.filter((h) => {
      const d = new Date(h.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [holidays, currentMonth]);

  const currentMonthLeaves = useMemo(() => {
    return userScopedLeaves.filter((l) => {
      const startStr = l.startDate || l.StartDate || "";
      const endStr = l.endDate || l.EndDate || "";
      if (!startStr || !endStr) return false;

      const s = new Date(startStr.split("T")[0]);
      const e = new Date(endStr.split("T")[0]);
      const monthStart = new Date(currentYear, currentMonth, 1);
      const monthEnd = new Date(currentYear, currentMonth + 1, 0);

      return s <= monthEnd && e >= monthStart;
    });
  }, [userScopedLeaves, currentMonth]);

  const nextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
  };

  const previousMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
  };

  const findHoliday = (day: number) => {
    return holidays.find((h) => {
      const d = new Date(h.date);
      return (
        d.getDate() === day &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });
  };

  const getLeavesForDay = (day: number): LeaveRecord[] => {
    const targetDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return userScopedLeaves.filter((l) => {
      const startRaw = l.startDate || l.StartDate || "";
      const endRaw = l.endDate || l.EndDate || "";
      if (!startRaw || !endRaw) return false;

      const s = startRaw.split("T")[0];
      const e = endRaw.split("T")[0];
      return targetDateStr >= s && targetDateStr <= e;
    });
  };

  const handleCellClick = (day: number) => {
    const holiday = findHoliday(day);
    const dayLeaves = getLeavesForDay(day);
    if (holiday || dayLeaves.length > 0) {
      setSelectedDayInfo({ day, holiday, leaves: dayLeaves });
    }
  };

  const kpis = [
    {
      label: "Annual Company Holidays",
      value: `${holidays.length} Days`,
      color: "#00B5B8",
      bg: "#E6FBFB",
      icon: <CelebrationRoundedIcon sx={{ color: "#00B5B8", fontSize: 22 }} />,
    },
    {
      label: "This Month Holidays",
      value: `${monthHolidays.length} Events`,
      color: "#0F173B",
      bg: "#F1F5F9",
      icon: <TodayRoundedIcon sx={{ color: "#0F173B", fontSize: 22 }} />,
    },
    {
      label: isManager ? "Total Team Applications" : "My Total Requests",
      value: `${userScopedLeaves.length} Total`,
      color: "#F59E0B",
      bg: "#FFFBEB",
      icon: <DateRangeRoundedIcon sx={{ color: "#F59E0B", fontSize: 22 }} />,
    },
    {
      label: isManager ? "Active Leaves This Month" : "My Leaves This Month",
      value: `${currentMonthLeaves.length} Active`,
      color: "#7C4DFF",
      bg: "#F3EFFF",
      icon: <EventAvailableRoundedIcon sx={{ color: "#7C4DFF", fontSize: 22 }} />,
    },
  ];

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", backgroundColor: "#F8FAFC", p: { xs: 2.5, md: 4, xl: 5 }, boxSizing: "border-box" }}>
      <Typography sx={{ fontSize: { xs: "34px", md: "48px" }, fontWeight: 700, color: "#0F173B", lineHeight: 1.1 }}>
        {isManager ? "Workforce Calendar" : "My Schedule & Holidays"}
      </Typography>
      <Typography sx={{ color: "#667085", mb: 4, mt: 0.8 }}>
        {isManager
          ? "Real-time workforce availability, department leaves, and official Siemens Energy holidays."
          : "Track company holidays and view your approved absence schedule."}
      </Typography>

      {/* Hero Banner */}
      <Card
        sx={{
          width: "100%",
          mb: 4,
          borderRadius: "24px",
          color: "#FFFFFF",
          background: "linear-gradient(90deg, #140F35 0%, #171044 50%, #1A1450 100%)",
          boxShadow: "0 12px 28px rgba(20, 15, 53, 0.28)",
          boxSizing: "border-box",
        }}
      >
        <CardContent sx={{ p: { xs: 3.5, md: 5 } }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#00B5B8", textTransform: "uppercase", letterSpacing: "1.2px" }}>
            {isManager ? "Enterprise Operations Calendar" : "Personal Time-Off Planner"}
          </Typography>
          <Typography sx={{ fontSize: { xs: 32, md: 50 }, fontWeight: 800, mt: 1 }}>
            {monthNames[currentMonth]} {currentYear}
          </Typography>
          <Typography sx={{ opacity: 0.85, mt: 1, mb: 4, maxWidth: 620 }}>
            {isManager
              ? "Live view of team coverage mapped against mandatory company closures. Click any active date to view employee leave details."
              : "Overview of your approved time-off and upcoming India public holidays. Click marked days to review schedule details."}
          </Typography>

          <Box sx={{ display: "flex", gap: 2.5, alignItems: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<ChevronLeftRoundedIcon />}
              onClick={previousMonth}
              sx={{
                backgroundColor: "#FFFFFF",
                color: "#140F35",
                fontWeight: 700,
                borderRadius: "12px",
                px: 3.2,
                py: 1.2,
                textTransform: "none",
                fontSize: "14px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                "&:hover": { backgroundColor: "#F1F5F9" },
              }}
            >
              Previous
            </Button>

            <Button
              variant="contained"
              endIcon={<ChevronRightRoundedIcon />}
              onClick={nextMonth}
              sx={{
                backgroundColor: "#00B5B8",
                color: "#FFFFFF",
                fontWeight: 700,
                borderRadius: "12px",
                px: 3.6,
                py: 1.2,
                textTransform: "none",
                fontSize: "14px",
                boxShadow: "0 6px 20px rgba(0, 181, 184, 0.35)",
                "&:hover": { backgroundColor: "#009EA0" },
              }}
            >
              Next
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 4 Stat Cards */}
      <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 3, mb: 4, boxSizing: "border-box" }}>
        {kpis.map((kpi, idx) => (
          <Card
            key={idx}
            sx={{
              borderRadius: "20px",
              p: 2.8,
              backgroundColor: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              border: "1px solid #E2E8F0",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography sx={{ color: "#64748B", fontSize: 13.5, fontWeight: 600 }}>{kpi.label}</Typography>
              <Box sx={{ width: 40, height: 40, borderRadius: "12px", backgroundColor: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {kpi.icon}
              </Box>
            </Box>
            <Typography sx={{ color: kpi.color, fontSize: 30, fontWeight: 800, mt: 1.8 }}>{kpi.value}</Typography>
          </Card>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Card
        sx={{
          width: "100%",
          borderRadius: "24px",
          mb: 4.5,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          p: { xs: 2.5, md: 4 },
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 3.5 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" color="#0F173B">
              Monthly Timeline
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
              Viewing schedule for {monthNames[currentMonth]} {currentYear} • Click highlighted dates for details
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: { xs: "flex-start", sm: "flex-end" } }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.2, whiteSpace: "nowrap" }}>
              <Box sx={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: "#00B5B8", flexShrink: 0 }} />
              <Typography variant="caption" fontWeight={700} color="#475569" sx={{ fontSize: "12px", lineHeight: 1 }}>
                Fixed Holiday
              </Typography>
            </Box>

            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.2, whiteSpace: "nowrap" }}>
              <Box sx={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: "#F59E0B", flexShrink: 0 }} />
              <Typography variant="caption" fontWeight={700} color="#475569" sx={{ fontSize: "12px", lineHeight: 1 }}>
                Optional Holiday
              </Typography>
            </Box>

            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.2, whiteSpace: "nowrap" }}>
              <Box sx={{ width: 9, height: 9, borderRadius: "50%", backgroundColor: "#7C4DFF", flexShrink: 0 }} />
              <Typography variant="caption" fontWeight={700} color="#475569" sx={{ fontSize: "12px", lineHeight: 1 }}>
                {isManager ? "Team Member Leave" : "My Scheduled Leave"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Days Header */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1.5, mb: 1.5 }}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
            <Box
              key={day}
              sx={{
                textAlign: "center",
                py: 1,
                fontWeight: 700,
                fontSize: "12.5px",
                color: idx >= 5 ? "#94A3B8" : "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {day}
            </Box>
          ))}
        </Box>

        {/* Days Grid */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1.5 }}>
          {calendarDays.map((day, index) => {
            if (!day) {
              return (
                <Box
                  key={`empty-${index}`}
                  sx={{
                    minHeight: 115,
                    borderRadius: "16px",
                    backgroundColor: "#FAFBFC",
                    border: "1px dashed #E2E8F0",
                  }}
                />
              );
            }

            const holiday = findHoliday(day);
            const activeLeaves = getLeavesForDay(day);
            const hasLeaves = activeLeaves.length > 0;
            const isWeekend = index % 7 === 5 || index % 7 === 6;
            const isFixed = holiday?.type === "Fixed";
            const isInteractive = Boolean(holiday || hasLeaves);

            return (
              <Box
                key={day}
                onClick={() => isInteractive && handleCellClick(day)}
                sx={{
                  minHeight: 115,
                  p: 1.6,
                  borderRadius: "16px",
                  cursor: isInteractive ? "pointer" : "default",
                  backgroundColor: holiday
                    ? isFixed ? "#F0FDFA" : "#FFFBEB"
                    : hasLeaves ? "#F8F5FF"
                    : isWeekend ? "#F8FAFC" : "#FFFFFF",
                  border: holiday
                    ? isFixed ? "1.8px solid #00B5B8" : "1.8px solid #F59E0B"
                    : hasLeaves ? "1.8px solid #7C4DFF"
                    : "1px solid #E2E8F0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: isInteractive ? "translateY(-3px)" : "none",
                    boxShadow: isInteractive ? "0 8px 22px rgba(0, 0, 0, 0.08)" : "0 2px 8px rgba(0,0,0,0.02)",
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography
                    fontWeight={800}
                    fontSize={14}
                    color={
                      holiday
                        ? isFixed ? "#007A7C" : "#B45309"
                        : hasLeaves ? "#6D28D9"
                        : isWeekend ? "#94A3B8" : "#0F173B"
                    }
                  >
                    {day}
                  </Typography>

                  {holiday && (
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: isFixed ? "#00B5B8" : "#F59E0B" }} />
                  )}
                  {!holiday && hasLeaves && (
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#7C4DFF" }} />
                  )}
                </Box>

                {/* Holiday Badge */}
                {holiday && (
                  <Box sx={{ mt: 1 }}>
                    <Typography sx={{ fontSize: "12px", fontWeight: 700, color: isFixed ? "#005E60" : "#92400E", lineHeight: 1.3 }}>
                      {holiday.title}
                    </Typography>
                    <Chip
                      size="small"
                      label={holiday.type}
                      sx={{
                        mt: 0.8,
                        height: 20,
                        fontSize: "10px",
                        fontWeight: 700,
                        backgroundColor: isFixed ? "#CCFBF1" : "#FEF3C7",
                        color: isFixed ? "#0F766E" : "#B45309",
                        borderRadius: "6px",
                      }}
                    />
                  </Box>
                )}

                {/* Leaves Display */}
                {!holiday && hasLeaves && (
                  <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#5B21B6", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {isManager
                        ? getEmployeeDisplayName(activeLeaves[0])
                        : "Scheduled Leave"}
                    </Typography>

                    <Box display="flex" alignItems="center" gap={0.5} flexWrap="wrap">
                      <Chip
                        size="small"
                        label={activeLeaves[0].leaveType || activeLeaves[0].LeaveType}
                        sx={{ height: 18, fontSize: "9px", fontWeight: 700, backgroundColor: "#EDE9FE", color: "#6D28D9", borderRadius: "4px" }}
                      />
                      {isManager && activeLeaves.length > 1 && (
                        <Chip
                          size="small"
                          label={`+${activeLeaves.length - 1} more`}
                          sx={{ height: 18, fontSize: "9px", fontWeight: 800, backgroundColor: "#7C4DFF", color: "#FFFFFF", borderRadius: "4px" }}
                        />
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Card>

      {/* Bottom 3 Cards */}
      <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" }, gap: 3.5, alignItems: "stretch", boxSizing: "border-box" }}>
        {/* Card 1: Holidays */}
        <Card sx={{ borderRadius: "24px", p: 3.5, boxShadow: "0 4px 18px rgba(0,0,0,0.05)", background: "#FFFFFF", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column" }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <Box sx={{ width: 38, height: 38, borderRadius: "10px", backgroundColor: "#E6FBFB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CelebrationRoundedIcon sx={{ color: "#00B5B8", fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} color="#0F173B">Upcoming Holidays</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Official non-working days for {monthNames[currentMonth]}.
          </Typography>

          {monthHolidays.map((holiday) => {
            const isFixed = holiday.type === "Fixed";
            return (
              <Box key={holiday.date} sx={{ mb: 2, p: 2, borderRadius: "14px", backgroundColor: "#FAFBFC", border: "1px solid #E2E8F0", borderLeft: `4px solid ${isFixed ? "#00B5B8" : "#F59E0B"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography fontWeight={700} color="#0F173B" fontSize={14}>{holiday.title}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "12px", display: "block", mt: 0.3 }}>
                    {new Date(holiday.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                  </Typography>
                </Box>
                <Chip label={holiday.type} size="small" sx={{ backgroundColor: isFixed ? "#E6FBFB" : "#FFFBEB", color: isFixed ? "#00B5B8" : "#B45309", fontWeight: 700, borderRadius: "8px", fontSize: "11px" }} />
              </Box>
            );
          })}
        </Card>

        {/* Card 2: Quotas */}
        <Card sx={{ borderRadius: "24px", p: 3.5, boxShadow: "0 4px 18px rgba(0,0,0,0.05)", background: "#FFFFFF", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column" }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <Box sx={{ width: 38, height: 38, borderRadius: "10px", backgroundColor: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CategoryRoundedIcon sx={{ color: "#6366F1", fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} color="#0F173B">Leave Classifications</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={3}>Standard annual workforce entitlement quotas.</Typography>

          {[
            { label: "Fixed Holidays", subtext: "Mandatory corporate closures across India operations", quota: "10 Days / Year", color: "#00B5B8", bg: "#E6FBFB", borderColor: "#00B5B8" },
            { label: "Optional Holidays", subtext: "Cultural, festival & elective floating holidays", quota: "5 Days (Select 2)", color: "#F59E0B", bg: "#FFFBEB", borderColor: "#F59E0B" },
          ].map((item, i) => (
            <Box key={i} sx={{ mb: 2.2, p: 2.2, borderRadius: "14px", backgroundColor: "#FAFBFC", border: "1px solid #E2E8F0", borderLeft: `4px solid ${item.borderColor}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography fontWeight={700} fontSize={14} color="#0F173B">{item.label}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.3 }}>{item.subtext}</Typography>
              </Box>
              <Chip label={item.quota} size="small" sx={{ backgroundColor: item.bg, color: item.color, fontWeight: 700, borderRadius: "8px", fontSize: "11px", ml: 1.5 }} />
            </Box>
          ))}
        </Card>

        {/* Card 3: Live Leaves */}
        <Card sx={{ borderRadius: "24px", p: 3.5, boxShadow: "0 4px 18px rgba(0,0,0,0.05)", background: "#FFFFFF", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column" }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
            <Box sx={{ width: 38, height: 38, borderRadius: "10px", backgroundColor: "#F3EFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookmarkAddedRoundedIcon sx={{ color: "#7C4DFF", fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} color="#0F173B">
              {isManager ? "Upcoming Team Leaves" : "My Scheduled Leaves"}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {isManager ? "Live schedules from database records." : "Your authorized requests in the system."}
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress size={30} sx={{ color: "#00B5B8" }} />
            </Box>
          ) : currentMonthLeaves.length === 0 ? (
            <Box sx={{ py: 6, textAlign: "center", color: "#94A3B8" }}>
              <Typography variant="body2">No leaves scheduled for this month.</Typography>
            </Box>
          ) : (
            <Box>
              {currentMonthLeaves.map((leave) => {
                const isApproved = (leave.status || leave.Status) === "Approved";
                const borderCol = isApproved ? "#00B5B8" : "#F59E0B";
                const chipBg = isApproved ? "#E6FBFB" : "#FFFBEB";
                const chipCol = isApproved ? "#00B5B8" : "#B45309";
                const startRaw = leave.startDate || leave.StartDate || "";
                const endRaw = leave.endDate || leave.EndDate || "";
                const lType = leave.leaveType || leave.LeaveType;
                const lStatus = leave.status || leave.Status;

                return (
                  <Box
                    key={leave.id}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: "14px",
                      backgroundColor: "#FAFBFC",
                      border: "1px solid #E2E8F0",
                      borderLeft: `4px solid ${borderCol}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography fontWeight={700} color="#0F173B" fontSize={14}>
                        {isManager ? getEmployeeDisplayName(leave) : lType}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "12px", display: "block", mt: 0.3 }}>
                        {startRaw.split("T")[0]} to {endRaw.split("T")[0]}
                        {isManager ? ` (${lType})` : ""}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={lStatus}
                      sx={{ backgroundColor: chipBg, color: chipCol, fontWeight: 700, borderRadius: "8px", fontSize: "11px" }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </Card>
      </Box>

      {/* Date Details Modal */}
      <Dialog
        open={Boolean(selectedDayInfo)}
        onClose={() => setSelectedDayInfo(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "24px",
            p: 1.5,
            backgroundColor: "#FFFFFF",
            boxShadow: "0 20px 48px rgba(15, 23, 59, 0.25)",
          },
        }}
      >
        <DialogTitle sx={{ p: 2.5, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box display="flex" alignItems="center" gap={1.8}>
            <Avatar sx={{ bgcolor: "#E6F8F8", color: "#00B5B8", width: 46, height: 46 }}>
              <EventNoteRoundedIcon />
            </Avatar>
            <Box>
              <Typography fontWeight={900} fontSize={22} color="#0F173B" lineHeight={1.2}>
                {selectedDayInfo?.day} {monthNames[currentMonth]} {currentYear}
              </Typography>
              <Typography variant="body2" color="#334155" fontWeight={600} sx={{ mt: 0.4 }}>
                {isManager ? "Workforce Presence & Holiday Details" : "Your Absence & Holiday Status"}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setSelectedDayInfo(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5 }}>
          {selectedDayInfo?.holiday && (
            <Box
              sx={{
                mb: 2.5,
                p: 2,
                borderRadius: "16px",
                backgroundColor: selectedDayInfo.holiday.type === "Fixed" ? "#F0FDFA" : "#FFFBEB",
                border: `1.5px solid ${selectedDayInfo.holiday.type === "Fixed" ? "#00B5B8" : "#F59E0B"}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography fontWeight={800} color="#0F173B" fontSize={15}>
                  {selectedDayInfo.holiday.title}
                </Typography>
                <Typography variant="caption" color="#475569" fontWeight={600}>
                  Official Company Holiday
                </Typography>
              </Box>
              <Chip
                label={selectedDayInfo.holiday.type}
                size="small"
                sx={{
                  backgroundColor: selectedDayInfo.holiday.type === "Fixed" ? "#00B5B8" : "#F59E0B",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  borderRadius: "6px",
                }}
              />
            </Box>
          )}

          <Typography variant="subtitle1" fontWeight={800} color="#0F173B" mb={1.8}>
            {isManager
              ? `Employees on Leave (${selectedDayInfo?.leaves.length || 0}):`
              : "Your Leave Status on this day:"}
          </Typography>

          {selectedDayInfo?.leaves.length === 0 ? (
            <Typography variant="body2" color="#64748B" fontWeight={500}>
              {isManager
                ? "No team members on leave for this day. Full shift presence expected."
                : "You have no leaves scheduled on this day."}
            </Typography>
          ) : (
            <Box display="flex" flexDirection="column" gap={1.8}>
              {selectedDayInfo?.leaves.map((leave) => {
                const lStatus = leave.status || leave.Status || "Approved";
                const isApproved = lStatus === "Approved";
                const startRaw = leave.startDate || leave.StartDate || "";
                const endRaw = leave.endDate || leave.EndDate || "";
                const lReason = leave.reason || leave.Reason;
                const lType = leave.leaveType || leave.LeaveType;

                return (
                  <Box
                    key={leave.id}
                    sx={{
                      p: 2,
                      borderRadius: "16px",
                      backgroundColor: "#FAFBFC",
                      border: "1px solid #E2E8F0",
                      borderLeft: `5px solid ${isApproved ? "#00B5B8" : "#FF9800"}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar sx={{ bgcolor: "#EDE9FE", color: "#6D28D9", width: 38, height: 38 }}>
                        <PersonRoundedIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography fontWeight={800} color="#0F173B" fontSize={15}>
                          {isManager ? getEmployeeDisplayName(leave) : lType}
                        </Typography>
                        <Typography variant="caption" color="#475569" fontWeight={600} display="block">
                          {startRaw.split("T")[0]} to {endRaw.split("T")[0]}
                          {lReason ? ` • Reason: ${lReason}` : ""}
                        </Typography>
                      </Box>
                    </Box>

                    <Chip
                      label={lStatus}
                      size="small"
                      sx={{
                        backgroundColor: isApproved ? "#E6F8F8" : "#FFF3E0",
                        color: isApproved ? "#00B5B8" : "#FF9800",
                        fontWeight: 800,
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={() => setSelectedDayInfo(null)}
            variant="contained"
            sx={{
              backgroundColor: "#140F35",
              color: "#FFFFFF",
              borderRadius: "12px",
              fontWeight: 700,
              textTransform: "none",
              px: 3.5,
              py: 1,
              "&:hover": { backgroundColor: "#00B5B8" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CalendarPage;