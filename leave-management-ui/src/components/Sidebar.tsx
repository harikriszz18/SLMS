import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventNoteIcon from "@mui/icons-material/EventNote";
import HistoryIcon from "@mui/icons-material/History";
import AssignmentIcon from "@mui/icons-material/Assignment";
import InsightsIcon from "@mui/icons-material/Insights";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import { useLocation, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role") || "Employee";

  // Menu items visible to all managers
  const managerMenuItems = [
    { text: "Dashboard", path: "/manager-dashboard", icon: <DashboardIcon /> },
    { text: "Calendar", path: "/calendar", icon: <CalendarMonthIcon /> },
    { text: "Leave Records", path: "/manager-history", icon: <AssignmentIcon /> },
    { text: "Daily Absence Insights", path: "/absence-insights", icon: <InsightsIcon /> },
    { text: "Workforce Roster", path: "/workforce-roster", icon: <HubRoundedIcon /> },
    { text: "Register Employee", path: "/register-employee", icon: <PersonAddIcon /> },
  ];

  // Menu items visible to employees
  const employeeMenuItems = [
    { text: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { text: "Calendar", path: "/calendar", icon: <CalendarMonthIcon /> },
    { text: "Apply Leave", path: "/apply-leave", icon: <EventNoteIcon /> },
    { text: "Leave History", path: "/leave-history", icon: <HistoryIcon /> },
  ];

  const menuItems = role === "Manager" ? managerMenuItems : employeeMenuItems;

  return (
    <Box
      sx={{
        width: 240,
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid #D9E2EC",
        minHeight: "100vh",
      }}
    >
      <List sx={{ px: 2, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{
              mb: 1,
              borderRadius: "10px",
              minHeight: 50,
              "&.Mui-selected": {
                backgroundColor: "#E9FAFA",
                borderLeft: "4px solid #00B5B8",
                "& .MuiListItemIcon-root": { color: "#001B41" },
                "& .MuiListItemText-primary": { color: "#001B41", fontWeight: 700 },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: "#6B7280" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

export default Sidebar;