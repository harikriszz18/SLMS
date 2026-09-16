import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../assets/siemens-energy-logo.png";

function Home() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#140A33 0%,#241253 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: 650,
          maxWidth: "95%",
          borderRadius: "24px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
        }}
      >
        <CardContent
          sx={{
            py: 8,
            px: 5,
            textAlign: "center",
          }}
        >
          <Box sx={{ mb: 4 }}>
            <img
              src={logo}
              alt="Siemens Energy"
              style={{
                maxWidth: "260px",
                width: "100%",
                height: "auto",
              }}
            />
          </Box>

          <Typography
            variant="h4"
            sx={{
              color: "#101828",
              fontSize: "24px",
              fontWeight: 600,
              mb: 2,
            }}
          >
            Leave Management Portal
          </Typography>

          <Typography
            sx={{
              color: "#667085",
              fontSize: "18px",
              mb: 5,
            }}
          >
            Manage employee leave requests and approvals.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/login")}
            sx={{
              px: 5,
              py: 1.6,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "16px",
              fontWeight: 600,
              background:
                "linear-gradient(90deg,#7B2CF5,#5B21B6)",

              boxShadow:
                "0 8px 20px rgba(123,44,245,0.25)",

              "&:hover": {
                background:
                  "linear-gradient(90deg,#6D28D9,#4C1D95)",
              },
            }}
          >
            Access Portal
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Home;