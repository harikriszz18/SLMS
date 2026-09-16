import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import {
  getNotifications,
  markAsRead,
} from "../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const getDismissedIds = (): number[] => {
    try {
      const stored = localStorage.getItem("dismissed_notifications");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveDismissedId = (id: number) => {
    const current = getDismissedIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem("dismissed_notifications", JSON.stringify(current));
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      const dismissed = getDismissedIds();
      // Filter out notifications that are read in backend OR dismissed locally
      const active = (Array.isArray(data) ? data : []).filter(
        (n) => !n.isRead && !dismissed.includes(n.id)
      );
      setNotifications(active);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDismissSingle = async (id: number) => {
    try {
      await markAsRead(id);
    } catch (e) {
      console.error(e);
    }
    saveDismissedId(id);
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDismissAll = async () => {
    for (const notif of notifications) {
      try {
        await markAsRead(notif.id);
      } catch (e) {
        console.error(e);
      }
      saveDismissedId(notif.id);
    }
    setNotifications([]);
  };

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

      {/* Hero Banner with Action Button */}
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
          <Typography sx={{ opacity: 0.85, mb: 3.5, maxWidth: 650 }}>
            Stay updated with real-time approvals, manager remarks, and administrative time-off communications.
          </Typography>

          {notifications.length > 0 && (
            <Button
              variant="contained"
              startIcon={<DoneAllRoundedIcon />}
              onClick={handleDismissAll}
              sx={{
                backgroundColor: "#00B5B8",
                fontWeight: 700,
                borderRadius: "12px",
                textTransform: "none",
                px: 3,
                py: 1,
                fontSize: "14px",
                boxShadow: "0 6px 18px rgba(0,181,184,0.35)",
                "&:hover": { backgroundColor: "#009EA0" },
              }}
            >
              Dismiss All as Read
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Unified Compact Notification List Card */}
      <Card
        sx={{
          borderRadius: "24px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          overflow: "hidden",
        }}
      >
        {notifications.length === 0 ? (
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
              All caught up!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You have no unread notifications or pending status alerts.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ divideY: "1px solid #F1F5F9" }}>
            {notifications.map((n) => {
              const style = getStatusProps(n.message);
              return (
                <Box
                  key={n.id}
                  sx={{
                    px: { xs: 2.5, md: 4 },
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2.5,
                    borderBottom: "1px solid #F1F5F9",
                    transition: "0.2s background-color",
                    "&:hover": {
                      backgroundColor: "#FAFBFC",
                    },
                    "&:last-child": {
                      borderBottom: "none",
                    },
                  }}
                >
                  {/* Left: Icon & Text grouped closely */}
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
                      }}
                    >
                      {style.icon}
                    </Box>

                    <Box>
                      <Typography fontWeight={600} color="#0F173B" fontSize={15}>
                        {n.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : "Just now"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right: Quick Action to Mark this read */}
                  <Tooltip title="Dismiss">
                    <IconButton
                      size="small"
                      onClick={() => handleDismissSingle(n.id)}
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