import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatbotWidget from "../components/ChatbotWidget";

function Layout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F5F7FA",
      }}
    >
      {/* Header */}
      <Navbar />

      {/* Content Area */}
      <Box
        sx={{
          display: "flex",
          minHeight: "calc(100vh - 82px)",
        }}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            width: "100%",
            px: {
              xs: 2,
              sm: 3,
              md: 4,
              lg: 5,
            },
            py: 4,
            overflowY: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Floating AI Chatbot Widget */}
      <ChatbotWidget />
    </Box>
  );
}

export default Layout;