import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { login } from "../services/authService";
import logo from "../assets/siemens-energy-logo.png";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleLogin = async () => {
    try {
      const result = await login(email, password);

      const token = result.token || result.Token || "";
      const role = result.role || result.Role || "Employee";
      const userName = result.name || result.Name || email.split("@")[0];

      // Decode department from JWT if not explicitly returned in the payload
      let department = result.department || result.Department || "";
      if (!department && token) {
        try {
          const payloadBase64 = token.split(".")[1];
          const decodedJson = JSON.parse(atob(payloadBase64));
          department = decodedJson.Department || decodedJson.department || "";
        } catch {
          // ignore decoding failure
        }
      }

      // Save session credentials
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("email", email.trim());
      localStorage.setItem("name", userName);
      localStorage.setItem("department", department || "Electrification");

      setOpenSnackbar(true);
      setTimeout(() => {
        if (role === "Manager") {
          navigate("/manager-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 400);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Login Failed. Please verify your credentials.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#140A33 0%,#241253 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: {
            xs: "100%",
            sm: 500,
            md: 550,
          },
          maxWidth: "100%",
          borderRadius: "24px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
        }}
      >
        <CardContent
          sx={{
            p: 5,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 4,
            }}
          >
            <img
              src={logo}
              alt="Siemens Energy"
              style={{
                width: "220px",
                maxWidth: "100%",
              }}
            />
          </Box>
          <Typography
            sx={{
              fontSize: "34px",
              fontWeight: 700,
              color: "#0F173B",
              mb: 1,
            }}
          >
            Leave Management Portal
          </Typography>
          <Typography
            sx={{
              color: "#667085",
              fontSize: "16px",
              mb: 4,
            }}
          >
            Welcome Back
          </Typography>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            sx={{
              mb: 4,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
              },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            sx={{
              py: 1.7,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "16px",
              fontWeight: 600,
              background: "linear-gradient(90deg,#7B2CF5,#5B21B6)",
              "&:hover": {
                background: "linear-gradient(90deg,#6D28D9,#4C1D95)",
              },
            }}
          >
            Sign In
          </Button>
          <Snackbar
            open={openSnackbar}
            autoHideDuration={2500}
            anchorOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
          >
            <Alert
              severity="success"
              variant="filled"
              sx={{
                width: "100%",
                borderRadius: "12px",
              }}
            >
              Login Successful
            </Alert>
          </Snackbar>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;