import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import { getNotifications, markAsRead } from "../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [viewFilter, setViewFilter] = useState<"All" | "Unread" | "Read">("All");
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest">("Newest");

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const role = localStorage.getItem("role") || "Employee";

  useEffect(() => {
    loadNotifications();
  }, []);

  const getClearedIds = (): number[] => {
    try {
      const stored = localStorage.getItem("cleared_notifications");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveClearedId = (id: number) => {
    const current = getClearedIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem("cleared_notifications", JSON.stringify(current));
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      const cleared = getClearedIds();

      // Filter out permanently cleared notices & restrict by role
      const valid = (Array.isArray(data) ? data : []).filter((n) => {
        if (cleared.includes(n.id)) return false;

        const msg = (n.message || "").toLowerCase();
        if (role === "Manager") {
          return msg.startsWith("new leave request");
        } else {
          return msg.startsWith("your ");
        }
      });

      setNotifications(valid);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkSingleRead = async (id: number) => {
    try {
      await markAsRead(id);
    } catch (e) {
      console.error(e);
    }
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    window.dispatchEvent(new Event("notifications_updated"));
  };

  const handleMarkAllRead = async () => {
    setMenuAnchorEl(null);
    for (const notif of notifications) {
      if (!notif.isRead) {
        try {
          await markAsRead(notif.id);
        } catch (e) {
          console.error(e);
        }
      }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    window.dispatchEvent(new Event("notifications_updated"));
  };

  const handleClearAll = () => {
    setMenuAnchorEl(null);
    notifications.forEach((n) => saveClearedId(n.id));
    setNotifications([]);
    window.dispatchEvent(new Event("notifications_updated"));
  };

  const filteredAndSorted = useMemo(() => {
    return notifications
      .filter((item) => {
        if (viewFilter === "Unread") return !item.isRead;
        if (viewFilter === "Read") return item.isRead;
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return sortBy === "Newest" ? timeB - timeA : timeA - timeB;
      });
  }, [notifications, viewFilter, sortBy]);

  const getStatusProps = (message: string) => {
    const text = message.toLowerCase();
    if (text.includes("approved")) {
      return {
        icon: <CheckCircleRoundedIcon sx={{ color: "#00B5B8", fontSize: 22 }} />,
        bg: "#E6F8F8",
      };
    }
    if (text.includes("rejected")) {
      return {
        icon: <CancelRoundedIcon sx={{ color: "#DC2626", fontSize: 22 }} />,
        bg: "#FEE2E2",
      };
    }
    return {
      icon: <AccessTimeFilledRoundedIcon sx={{ color: "#FF9800", fontSize: 22 }} />,
      bg: "#FFF3E0",
    };
  };

  const dropdownSx = {
    height: "44px",
    backgroundColor: "#FFFFFF",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#334155",
    "& fieldset": {
      borderColor: "#E2E8F0",
    },
    "&:hover fieldset": {
      borderColor: "#CBD5E1",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#00B5B8",
    },
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", backgroundColor: "#F8FAFC", p: { xs: 2.5, md: 4 } }}>
      {/* Header */}
      <Typography
        sx={{
          fontSize: { xs: "36px", md: "52px" },
          fontWeight: 700,
          color: "#0F173B",
          lineHeight: 1.1,
        }}
      >
        Notifications
      </Typography>
      <Typography sx={{ color: "#667085", mb: 4, mt: 1 }}>
        Review your leave decisions, manager notices, and workflow status alerts.
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
            Alerts & Updates
          </Typography>
          <Typography sx={{ fontSize: { xs: 30, md: 46 }, fontWeight: 800, mt: 1.2, mb: 1.5 }}>
            Activity Feed
          </Typography>
          <Typography sx={{ opacity: 0.85, maxWidth: 650 }}>
            Stay updated with real-time approvals, manager remarks, and administrative time-off communications.
          </Typography>
        </CardContent>
      </Card>

      {/* Filter and Controls Toolbar matching screenshot */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1.5, mb: 2.5 }}>
        {/* Viewing Selector */}
        <Select
          value={viewFilter}
          onChange={(e) => setViewFilter(e.target.value as any)}
          sx={{ ...dropdownSx, minWidth: 160 }}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", gap: 0.6 }}>
              <Typography sx={{ color: "#64748B", fontSize: "14px" }}>Viewing:</Typography>
              <Typography sx={{ fontWeight: 700, color: "#0F173B", fontSize: "14px" }}>{selected}</Typography>
            </Box>
          )}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Unread">Unread</MenuItem>
          <MenuItem value="Read">Read</MenuItem>
        </Select>

        {/* Sort By Selector */}
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          sx={{ ...dropdownSx, minWidth: 170 }}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", gap: 0.6 }}>
              <Typography sx={{ color: "#64748B", fontSize: "14px" }}>Sort By:</Typography>
              <Typography sx={{ fontWeight: 700, color: "#0F173B", fontSize: "14px" }}>{selected}</Typography>
            </Box>
          )}
        >
          <MenuItem value="Newest">Newest</MenuItem>
          <MenuItem value="Oldest">Oldest</MenuItem>
        </Select>

        {/* Three Dots Button */}
        <IconButton
          onClick={(e) => setMenuAnchorEl(e.currentTarget)}
          sx={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            color: "#64748B",
            "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#F8FAFC" },
          }}
        >
          <MoreVertRoundedIcon fontSize="small" />
        </IconButton>

        {/* Action Dropdown Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
          PaperProps={{
            sx: {
              borderRadius: "14px",
              boxShadow: "0 10px 25px rgba(15, 23, 59, 0.12)",
              border: "1px solid #E2E8F0",
              minWidth: 180,
              mt: 1,
            },
          }}
        >
          <MenuItem onClick={handleMarkAllRead} sx={{ py: 1.2 }}>
            <ListItemIcon>
              <DoneAllRoundedIcon fontSize="small" sx={{ color: "#00B5B8" }} />
            </ListItemIcon>
            <ListItemText primary="Mark all as read" primaryTypographyProps={{ fontSize: "13.5px", fontWeight: 600 }} />
          </MenuItem>
          <MenuItem onClick={handleClearAll} sx={{ py: 1.2, color: "#DC2626" }}>
            <ListItemIcon>
              <DeleteSweepRoundedIcon fontSize="small" sx={{ color: "#DC2626" }} />
            </ListItemIcon>
            <ListItemText primary="Clear all alerts" primaryTypographyProps={{ fontSize: "13.5px", fontWeight: 600 }} />
          </MenuItem>
        </Menu>
      </Box>

      {/* Main Notification Card List */}
      <Card
        sx={{
          borderRadius: "24px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
        }}
      >
        {filteredAndSorted.length === 0 ? (
          <Box
            sx={{
              py: 9,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "#E6F8F8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <NotificationsOffOutlinedIcon sx={{ fontSize: 32, color: "#00B5B8" }} />
            </Box>
            <Typography variant="h6" fontWeight={700} color="#0F173B">
              No notifications found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {viewFilter === "All"
                ? "You have no notifications or pending status alerts."
                : `There are no ${viewFilter.toLowerCase()} notifications to display.`}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ divideY: "1px solid #F1F5F9" }}>
            {filteredAndSorted.map((n) => {
              const style = getStatusProps(n.message);
              return (
                <Box
                  key={n.id}
                  sx={{
                    px: { xs: 2.5, md: 4 },
                    py: 2.2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2.5,
                    borderBottom: "1px solid #F1F5F9",
                    backgroundColor: n.isRead ? "#FFFFFF" : "#F7FBFC",
                    transition: "0.2s background-color",
                    "&:hover": {
                      backgroundColor: "#FAFBFC",
                    },
                    "&:last-child": {
                      borderBottom: "none",
                    },
                  }}
                >
                  {/* Left: Icon & Description */}
                  <Box display="flex" alignItems="center" gap={2.5}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "12px",
                        backgroundColor: style.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        opacity: n.isRead ? 0.75 : 1,
                      }}
                    >
                      {style.icon}
                    </Box>

                    <Box>
                      <Box display="flex" alignItems="center" gap={1.2}>
                        <Typography
                          fontWeight={n.isRead ? 600 : 750}
                          color={n.isRead ? "#475569" : "#0F173B"}
                          fontSize={15}
                        >
                          {n.message}
                        </Typography>
                        {!n.isRead && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor: "#00B5B8",
                            }}
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : "Just now"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right: Mark Read button if still unread */}
                  {!n.isRead ? (
                    <Tooltip title="Mark as read">
                      <IconButton
                        size="small"
                        onClick={() => handleMarkSingleRead(n.id)}
                        sx={{
                          color: "#94A3B8",
                          border: "1px solid #E2E8F0",
                          borderRadius: "10px",
                          p: 0.8,
                          "&:hover": {
                            color: "#00B5B8",
                            borderColor: "#00B5B8",
                            backgroundColor: "#E6F8F8",
                          },
                        }}
                      >
                        <CheckRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Typography
                      variant="caption"
                      sx={{ color: "#94A3B8", fontWeight: 600, fontSize: "12px" }}
                    >
                      Read
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Card>
    </Box>
  );
}

export default Notifications;