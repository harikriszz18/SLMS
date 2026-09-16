import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  Divider,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import { getBalance, getUnreadCount } from "../services/dashboardService";

function Dashboard() {
  const navigate = useNavigate();

  const [balance, setBalance] = useState<any>();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    loadBalance();
    loadNotifications();
  }, []);

  const loadBalance = async () => {
    try {
      const data = await getBalance();
      setBalance(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getUnreadCount();
      setNotificationCount(data.count);
    } catch (error) {
      console.error(error);
    }
  };

  const usagePercentage =
    balance?.totalLeaves > 0
      ? (balance.usedLeaves / balance.totalLeaves) * 100
      : 0;

  const chartData = [
    {
      name: "Used",
      value: balance?.usedLeaves ?? 0,
    },
    {
      name: "Remaining",
      value: balance?.remainingLeaves ?? 0,
    },
  ];

  const statsCard = {
    borderRadius: "20px",
    p: 3,
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  };

  const cardLabel = {
    color: "#667085",
    fontSize: 14,
    fontWeight: 600,
  };

  const cardValue = {
    mt: 1,
    color: "#0F173B",
    fontSize: 32,
    fontWeight: 800,
  };

  return (
    <Box
      sx={{
        width: "100%",
        p: 4,
      }}
    >
      {/* HEADER */}

      <Typography
        sx={{
          fontSize: {
            xs: "40px",
            md: "58px",
          },
          fontWeight: 700,
          color: "#0F173B",
          lineHeight: 1.1,
        }}
      >
        Dashboard
      </Typography>

      <Typography
        sx={{
          color: "#667085",
          mb: 4,
          mt: 1,
        }}
      >
        Track leave balances, requests and approvals.
      </Typography>

      {/* HERO */}

      <Card
        sx={{
          mb: 4,
          borderRadius: "22px",
          color: "#FFFFFF",
          background:
            "linear-gradient(90deg,#140F35 0%,#171044 50%,#1A1450 100%)",
          boxShadow: "0 12px 28px rgba(20,15,53,0.28)",
        }}
      >
        <CardContent
          sx={{
            p: 5,
          }}
        >
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            Available Leave Balance
          </Typography>

          <Typography
            sx={{
              fontSize: 80,
              fontWeight: 800,
              mt: 2,
              mb: 1,
            }}
          >
            {balance?.remainingLeaves ?? 0}
          </Typography>

          <Typography
            sx={{
              opacity: 0.85,
              mb: 4,
            }}
          >
            Days Available
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/apply-leave")}
            sx={{
              backgroundColor: "#FFFFFF",
              color: "#140F35",
              fontWeight: 700,
              px: 3,

              "&:hover": {
                backgroundColor: "#F5F5F5",
              },
            }}
          >
            APPLY LEAVE
          </Button>
        </CardContent>
      </Card>

      {/* KPI SECTION */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={statsCard}>
            <Typography sx={cardLabel}>Total Leave</Typography>
            <Typography sx={cardValue}>{balance?.totalLeaves ?? 0}</Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={statsCard}>
            <Typography sx={cardLabel}>Used Leave</Typography>
            <Typography sx={cardValue}>{balance?.usedLeaves ?? 0}</Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={statsCard}>
            <Typography sx={cardLabel}>Remaining</Typography>
            <Typography
              sx={{
                ...cardValue,
                color: "#00B5B8",
              }}
            >
              {balance?.remainingLeaves ?? 0}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card sx={statsCard}>
            <Typography sx={cardLabel}>Requests</Typography>
            <Typography sx={cardValue}>{notificationCount}</Typography>
          </Card>
        </Grid>
      </Grid>
      {/* CHART + RECENT ACTIVITY */}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            sx={{
              borderRadius: "20px",
              height: "100%",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#0F173B",
                  mb: 3,
                }}
              >
                Leave Usage
              </Typography>

              <Box
                sx={{
                  height: 520,
                  position: "relative",
                }}
              >
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      innerRadius={140}
                      outerRadius={210}
                    >
                      <Cell fill="#140F35" />
                      <Cell fill="#D7DEEA" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "58px",
                      fontWeight: 800,
                      color: "#140F35",
                    }}
                  >
                    {usagePercentage.toFixed(0)}%
                  </Typography>

                  <Typography
                    sx={{
                      color: "#667085",
                    }}
                  >
                    Utilized
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            sx={{
              borderRadius: "20px",
              height: "100%",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 700,
                  mb: 3,
                }}
              >
                Recent Activity
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: "14px",
                  }}
                >
                  <CardContent>
                    <Typography fontWeight={600}>Leave Balance</Typography>

                    <Typography color="text.secondary">
                      Remaining {balance?.remainingLeaves ?? 0} days
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: "14px",
                  }}
                >
                  <CardContent>
                    <Typography fontWeight={600}>Notifications</Typography>

                    <Typography color="text.secondary">
                      {notificationCount} unread notifications
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: "14px",
                  }}
                >
                  <CardContent>
                    <Typography fontWeight={600}>Leave Usage</Typography>

                    <Typography color="text.secondary">
                      {usagePercentage.toFixed(0)}% utilized
                    </Typography>
                  </CardContent>
                </Card>

                <Divider />

                <Typography
                  sx={{
                    color: "#667085",
                    mt: 2,
                  }}
                >
                  Latest updates regarding leave requests and approvals will
                  appear here.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
