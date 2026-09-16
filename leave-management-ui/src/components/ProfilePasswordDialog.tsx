import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Avatar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import KeyRoundedIcon from "@mui/icons-material/KeyRounded";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { changePassword } from "../services/employeeService";

interface ProfilePasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ProfilePasswordDialog({ open, onClose }: ProfilePasswordDialogProps) {
  const email = localStorage.getItem("email") || "";

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleResetForm = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMsg("");
    setSuccessMsg("");
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    handleResetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        email,
        oldPassword,
        newPassword,
      });

      setSuccessMsg("Password successfully updated!");
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || "Failed to update password. Check your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    mb: 3, // Hard guaranteed spacing between fields
    "& .MuiOutlinedInput-root": {
      borderRadius: "16px",
      backgroundColor: "#FFFFFF",
      transition: "all 0.2s ease-in-out",
      boxShadow: "0 2px 8px rgba(15, 23, 59, 0.04)",
      "& fieldset": {
        borderColor: "#CBD5E1",
        borderWidth: "1.5px",
      },
      "&:hover fieldset": {
        borderColor: "#94A3B8",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#00B5B8",
        borderWidth: "2px",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#475569",
      fontWeight: 600,
      fontSize: "14px",
      "&.Mui-focused": {
        color: "#00B5B8",
      },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "28px",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(15, 23, 59, 0.35)",
          border: "1px solid #E2E8F0",
          backgroundColor: "#F8FAFC",
        },
      }}
    >
      {/* Top Banner Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #140F35 0%, #1A1450 60%, #00B5B8 100%)",
          color: "#FFFFFF",
          p: 3.5,
          position: "relative",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "rgba(255, 255, 255, 0.8)",
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.25)",
              color: "#FFFFFF",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Avatar
          sx={{
            width: 54,
            height: 54,
            bgcolor: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            border: "1.5px solid rgba(255, 255, 255, 0.3)",
            mb: 1.5,
          }}
        >
          <LockOutlinedIcon sx={{ color: "#00B5B8", fontSize: 30 }} />
        </Avatar>

        <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: "-0.2px" }}>
          Security & Password
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255, 255, 255, 0.85)",
            fontSize: "12.5px",
            mt: 0.5,
            wordBreak: "break-all",
          }}
        >
          Update your access credentials for <strong>{email}</strong>
        </Typography>
      </Box>

      {/* Form Content Area */}
      <DialogContent sx={{ p: { xs: 3, sm: 4 }, pt: 3.5, backgroundColor: "#FFFFFF" }}>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          {errorMsg && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: "14px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {errorMsg}
            </Alert>
          )}

          {successMsg && (
            <Alert
              severity="success"
              icon={<CheckCircleIcon />}
              sx={{
                mb: 3,
                borderRadius: "14px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {successMsg}
            </Alert>
          )}

          {/* Current Password Field */}
          <TextField
            label="Current Password"
            type={showOld ? "text" : "password"}
            fullWidth
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            sx={fieldStyle}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyRoundedIcon sx={{ color: "#00B5B8", fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowOld(!showOld)}
                    edge="end"
                    sx={{ color: "#64748B" }}
                  >
                    {showOld ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* New Password Field */}
          <TextField
            label="New Password"
            type={showNew ? "text" : "password"}
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={fieldStyle}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VpnKeyOutlinedIcon sx={{ color: "#00B5B8", fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowNew(!showNew)}
                    edge="end"
                    sx={{ color: "#64748B" }}
                  >
                    {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Confirm New Password Field */}
          <TextField
            label="Confirm New Password"
            type={showConfirm ? "text" : "password"}
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ ...fieldStyle, mb: 4 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <VerifiedUserOutlinedIcon sx={{ color: "#00B5B8", fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowConfirm(!showConfirm)}
                    edge="end"
                    sx={{ color: "#64748B" }}
                  >
                    {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Bottom Action Buttons (Horizontal Row with clear separation) */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              alignItems: "center",
              mt: 1,
            }}
          >
            <Button
              variant="outlined"
              fullWidth
              onClick={handleClose}
              sx={{
                py: 1.4,
                borderRadius: "14px",
                borderColor: "#CBD5E1",
                color: "#475569",
                fontWeight: 700,
                textTransform: "none",
                fontSize: "14px",
                "&:hover": {
                  borderColor: "#94A3B8",
                  backgroundColor: "#F1F5F9",
                },
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.4,
                borderRadius: "14px",
                backgroundColor: "#00B5B8",
                fontWeight: 700,
                textTransform: "none",
                fontSize: "14px",
                boxShadow: "0 6px 18px rgba(0, 181, 184, 0.35)",
                "&:hover": {
                  backgroundColor: "#009EA0",
                },
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Save Password"}
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}