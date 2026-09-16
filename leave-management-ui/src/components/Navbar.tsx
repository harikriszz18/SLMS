import { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Avatar,
  Tooltip,
  Chip,
} from "@mui/material";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/SE White bg.png";
import { ProfilePasswordDialog } from "./ProfilePasswordDialog";
import { getNotifications } from "../services/notificationService";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const name = localStorage.getItem("name") || "Team Member";
  const email = localStorage.getItem("email") || "Current User";
  const role = localStorage.getItem("role") || "Employee";

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = async () => {
    try {
      const data = await getNotifications();
      let dismissed: number[] = [];
      try {
        const stored = localStorage.getItem("dismissed_notifications");
        dismissed = stored ? JSON.parse(stored) : [];
      } catch {
        dismissed = [];
      }

      const activeUnread = (Array.isArray(data) ? data : []).filter(
        (n: any) => !n.isRead && !dismissed.includes(n.id)
      );
      setUnreadCount(activeUnread.length);
    } catch {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: "linear-gradient(90deg, #100C2E 0%, #160F45 50%, #1C1454 100%)",
          borderBottom: "3px solid #00B5B8",
          boxShadow: "0 10px 30px rgba(16, 12, 46, 0.35)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: "84px", md: "92px" },
            px: { xs: 3, md: 5.5 },
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* LEFT: Brand Logo & Title */}
          <Box
            onClick={handleLogoClick}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              cursor: "pointer",
              userSelect: "none",
              transition: "opacity 0.2s ease, transform 0.15s ease",
              "&:hover": { opacity: 0.94 },
              "&:active": { transform: "scale(0.99)" },
            }}
          >
            <img
              src={logo}
              alt="Siemens Energy"
              style={{
                height: "44px",
                display: "block",
                objectFit: "contain",
              }}
            />

            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                borderLeft: "2px solid rgba(255, 255, 255, 0.22)",
                pl: 3,
              }}
            >
              <Typography
                sx={{
                  color: "#FFFFFF",
                  fontSize: { sm: "22px", md: "25px" },
                  fontWeight: 700,
                  letterSpacing: "-0.4px",
                  fontFamily:
                    "'Plus Jakarta Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
                  lineHeight: 1.15,
                }}
              >
                Leave Management Portal
              </Typography>
            </Box>
          </Box>

          {/* RIGHT: Notifications & User Profile */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 2.2,
              flexShrink: 0,
              flexWrap: "nowrap",
            }}
          >
            {/* Notification Icon */}
            <Tooltip title={unreadCount > 0 ? `${unreadCount} unread notices` : "Notifications"}>
              <IconButton
                onClick={() => navigate("/notifications")}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.16)",
                  color: "#FFFFFF",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.18)",
                    borderColor: "rgba(0, 181, 184, 0.7)",
                  },
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  invisible={unreadCount === 0}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "#FF5252",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      fontSize: "11px",
                      minWidth: "19px",
                      height: "19px",
                      borderRadius: "10px",
                      boxShadow: "0 0 0 2px #160F45",
                    },
                  }}
                >
                  <NotificationsNoneRoundedIcon sx={{ fontSize: 24 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Profile Avatar */}
            <Avatar
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                width: 48,
                height: 48,
                bgcolor: "#00B5B8",
                color: "#FFFFFF",
                cursor: "pointer",
                fontWeight: 800,
                fontSize: "18px",
                boxShadow: "0 4px 16px rgba(0, 181, 184, 0.4)",
                border: "2px solid rgba(255, 255, 255, 0.35)",
                borderRadius: "14px",
                flexShrink: 0,
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 6px 20px rgba(0, 181, 184, 0.55)",
                },
              }}
            >
              {(name || email).charAt(0).toUpperCase()}
            </Avatar>

            {/* User Dropdown Menu with Name, Email & Role */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  borderRadius: "20px",
                  mt: 1.5,
                  minWidth: 260,
                  p: 1.2,
                  boxShadow: "0 16px 40px rgba(15, 23, 59, 0.18)",
                  border: "1px solid #E2E8F0",
                },
              }}
            >
              {/* Identity Header */}
              <Box sx={{ px: 2, py: 1.5 }}>
                <Box display="flex" alignItems="center" gap={1.2}>
                  <PersonOutlineRoundedIcon sx={{ color: "#00B5B8", fontSize: 21 }} />
                  <Typography fontWeight={700} color="#0F173B" fontSize={15.5}>
                    {name}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1.2} mt={0.8}>
                  <EmailOutlinedIcon sx={{ color: "#64748B", fontSize: 17 }} />
                  <Typography variant="body2" color="#64748B" fontSize={13}>
                    {email}
                  </Typography>
                </Box>

                <Box mt={1.6}>
                  <Chip
                    label={role}
                    size="small"
                    sx={{
                      backgroundColor: role === "Manager" ? "#F3EFFF" : "#E6F8F8",
                      color: role === "Manager" ? "#7C4DFF" : "#00B5B8",
                      fontWeight: 700,
                      borderRadius: "6px",
                      fontSize: "11px",
                      height: 22,
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setOpenPasswordDialog(true);
                }}
                sx={{ borderRadius: "10px", py: 1 }}
              >
                <LockResetRoundedIcon sx={{ mr: 1.5, fontSize: 21, color: "#00B5B8" }} />
                <Typography fontSize="13.5px" fontWeight={600} color="#0F173B">
                  Change Password
                </Typography>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  setOpenLogoutDialog(true);
                }}
                sx={{ borderRadius: "10px", py: 1, color: "#DC2626" }}
              >
                <LogoutRoundedIcon sx={{ mr: 1.5, fontSize: 21, color: "#DC2626" }} />
                <Typography fontSize="13.5px" fontWeight={600} color="#DC2626">
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile / Change Password Dialog */}
      <ProfilePasswordDialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
      />

      {/* Logout Dialog */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#0F173B" }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "14px", color: "#64748B" }}>
            Are you sure you want to log out of your session?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenLogoutDialog(false)}
            sx={{ color: "#64748B", fontWeight: 600, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            sx={{ borderRadius: "10px", fontWeight: 700, textTransform: "none", px: 3 }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Navbar;