import { useState, useRef, useEffect } from "react";
import {
  Box,
  IconButton,
  Card,
  Typography,
  TextField,
  Paper,
  Chip,
  Button,
  Avatar,
  Divider,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  details?: string[];
  actionUrl?: string;
  actionLabel?: string;
  timestamp: string;
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Retrieve current user name & role dynamically from session
  const userName = localStorage.getItem("name") || (localStorage.getItem("email") ? localStorage.getItem("email")!.split("@")[0] : "Team Member");
  const role = localStorage.getItem("role") || "Employee";
  const isManager = role === "Manager";

  const [messages, setMessages] = useState<Message[]>([]);

  // Initialize greeting with the user's specific name
  useEffect(() => {
    setMessages([
      {
        id: "1",
        sender: "bot",
        text: isManager
          ? `Hello ${userName}! I am your Operations Assistant. Ask me about workforce presence, daily absence schedules, pending approvals, or onboarding!`
          : `Hello ${userName}! I am your Siemens Energy Assistant. Ask me anything about holidays, your leave balance, rules, or application status!`,
        timestamp: "Just now",
      },
    ]);
  }, [userName, isManager]);

  // Role-specific quick chips
  const quickPrompts = isManager
    ? [
        "Review pending approvals",
        "Check team absences",
        "Register new member",
        "Holidays this month",
      ]
    : [
        "How to apply for leave?",
        "Check leave balance",
        "Holidays this month",
        "Track leave status",
      ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [open, messages]);

  const getBotResponse = (userText: string) => {
    const q = userText.toLowerCase();

    // 1. APPLY LEAVE
    if (
      q.includes("apply") ||
      q.includes("take leave") ||
      q.includes("want a leave") ||
      q.includes("need leave") ||
      q.includes("request")
    ) {
      if (isManager) {
        return {
          text: `As a Manager, ${userName}, your portal is designated for reviewing and authorizing employee time-off requests.`,
          details: [
            "• You can approve or decline leave submissions directly from your Pending Requests queue.",
            "• For personal administrative inquiries, please contact Human Resources.",
          ],
          actionUrl: "/manager-dashboard",
          actionLabel: "View Pending Approvals",
        };
      }

      return {
        text: `Here is how you can submit a leave request, ${userName}:`,
        details: [
          "1. Submit your request at least 3 business days in advance for planned time-off.",
          "2. Choose your category: Annual, Casual, Sick, or Medical.",
          "3. Select start & end dates and provide a brief reason for your manager.",
          "4. Once submitted, your manager will review it in their approval queue.",
        ],
        actionUrl: "/apply-leave",
        actionLabel: "Go to Leave Request Form",
      };
    }

    // 2. TEAM ATTENDANCE & ABSENCES
    if (
      q.includes("absent") ||
      q.includes("attendance") ||
      q.includes("team") ||
      q.includes("who is off") ||
      q.includes("coverage")
    ) {
      if (isManager) {
        return {
          text: "You can track real-time departmental attendance and absence coverage by date:",
          details: [
            "• Use the Attendance Insights date filter to view upcoming shift absences.",
            "• Verify coverage in Grid Operations and Power Systems before approving new leaves.",
            "• Today's live presence rate is displayed on your Manager Dashboard.",
          ],
          actionUrl: "/absence-insights",
          actionLabel: "Open Attendance Insights",
        };
      }

      return {
        text: `${userName}, your approved time-off dates are marked on the company calendar. For team-wide shift availability, consult your supervisor.`,
        actionUrl: "/calendar",
        actionLabel: "View Holiday Calendar",
      };
    }

    // 3. APPROVALS / PENDING QUEUE
    if (
      q.includes("pending") ||
      q.includes("approval") ||
      q.includes("review") ||
      q.includes("decision")
    ) {
      if (isManager) {
        return {
          text: "You have leave requests awaiting your decision in your Command Center:",
          details: [
            "• Review submission dates, reasons, and employee details.",
            "• Approve or reject with a single click to update the employee's portal immediately.",
          ],
          actionUrl: "/manager-dashboard",
          actionLabel: "Open Pending Requests",
        };
      }

      return {
        text: `${userName}, you can track the status of all your submitted leave applications:`,
        details: [
          "• Approved: Marked with a teal badge and deducted from your balance.",
          "• Pending: Currently in your manager's review queue.",
          "• Rejected: Check remarks under your Leave History table.",
        ],
        actionUrl: "/leave-history",
        actionLabel: "View Leave History",
      };
    }

    // 4. ONBOARDING / REGISTER EMPLOYEE
    if (
      q.includes("register") ||
      q.includes("onboard") ||
      q.includes("add employee") ||
      q.includes("new member") ||
      q.includes("credential")
    ) {
      if (isManager) {
        return {
          text: "You can onboard new workforce members and generate initial credentials:",
          details: [
            "• Enter official details, select department, and assign Role.",
            "• Use the Auto-Generate tool to issue secure initial passwords.",
            "• The employee can change their password on initial login.",
          ],
          actionUrl: "/register-employee",
          actionLabel: "Go to Register Employee",
        };
      }

      return {
        text: "Employee onboarding and registration is restricted to managers and HR personnel.",
      };
    }

    // 5. HOLIDAYS & CALENDAR
    if (
      q.includes("holiday") ||
      q.includes("calendar") ||
      q.includes("off day") ||
      q.includes("september") ||
      q.includes("festival")
    ) {
      return {
        text: "Here is what is scheduled on the Siemens Energy holiday planner for September 2026:",
        details: [
          "• Ganesh Chaturthi - 14 Sep 2026 (Fixed Holiday)",
          "• Mahanavami - 20 Oct 2026 (Optional Holiday)",
          "• Vijayadashami - 21 Oct 2026 (Fixed Holiday)",
          "Annual quota includes 15 holidays (10 Fixed + 5 Optional).",
        ],
        actionUrl: "/calendar",
        actionLabel: "Open Full Holiday Calendar",
      };
    }

    // 6. LEAVE BALANCES
    if (
      q.includes("balance") ||
      q.includes("remaining") ||
      q.includes("quota") ||
      q.includes("how many") ||
      q.includes("days left")
    ) {
      if (isManager) {
        return {
          text: "Standard workforce leave quota is 24 paid days per calendar year. You can view individual allowances under Team Leave Records.",
          actionUrl: "/manager-history",
          actionLabel: "View Team Leave Records",
        };
      }

      return {
        text: `${userName}, your total annual quota is 24 paid days. You can check your exact remaining allowance and used days directly on the Dashboard or Apply Leave page.`,
        actionUrl: "/apply-leave",
        actionLabel: "Check My Leave Balance",
      };
    }

    // 7. SECURITY / PASSWORD
    if (
      q.includes("password") ||
      q.includes("profile") ||
      q.includes("security") ||
      q.includes("login")
    ) {
      return {
        text: `${userName}, you can change your password anytime:`,
        details: [
          "• Click your profile avatar at the top right of the navigation bar.",
          "• Select 'Change Password'.",
          "• Enter your current password and your new credential.",
        ],
      };
    }

    // Fallback
    return {
      text: isManager
        ? `Hello ${userName}, I am here to assist your supervisory tasks. You can ask me:`
        : `Hello ${userName}, I can assist you with your leave requests and schedule. You can ask me:`,
      details: isManager
        ? [
            "• 'Who is absent today?'",
            "• 'Review pending approvals'",
            "• 'How do I register a new employee?'",
            "• 'What holidays are scheduled this month?'",
          ]
        : [
            "• 'What holidays are in this month?'",
            "• 'How do I submit an annual leave?'",
            "• 'How many remaining leave days do I have?'",
            "• 'Where can I track my approval status?'",
          ],
    };
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const timeString = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: timeString,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const reply = getBotResponse(text);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: reply.text,
          details: reply.details,
          actionUrl: reply.actionUrl,
          actionLabel: reply.actionLabel,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 350);
  };

  return (
    <Box sx={{ position: "fixed", bottom: 25, right: 25, zIndex: 9999 }}>
      {/* Floating Launcher Button */}
      {!open && (
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            width: 62,
            height: 62,
            backgroundColor: "#00B5B8",
            color: "#FFF",
            boxShadow: "0 10px 28px rgba(0, 181, 184, 0.45)",
            transition: "all 0.25s ease",
            "&:hover": {
              backgroundColor: "#009EA0",
              transform: "scale(1.06)",
            },
          }}
        >
          <ChatIcon sx={{ fontSize: 28 }} />
        </IconButton>
      )}

      {/* Resizable Chat Window */}
      {open && (
        <Card
          sx={{
            width: { xs: 330, sm: 410 },
            height: 540,
            minWidth: 320,
            maxWidth: "92vw",
            minHeight: 440,
            maxHeight: "90vh",
            resize: "both",
            borderRadius: "24px",
            boxShadow: "0 24px 60px rgba(15, 23, 59, 0.28)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
          }}
        >
          {/* Header Bar */}
          <Box
            sx={{
              p: 2,
              px: 2.5,
              background:
                "linear-gradient(135deg, #140F35 0%, #1A1450 60%, #00B5B8 100%)",
              color: "#FFF",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                <SmartToyIcon sx={{ color: "#00B5B8", fontSize: 22 }} />
              </Avatar>

              <Box>
                <Typography fontWeight={700} fontSize={15} lineHeight={1.2}>
                  {isManager ? "Operations Assistant" : "Siemens Assistant"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.8)", fontSize: "11.5px" }}
                >
                  {isManager ? `Advising ${userName}` : `Assisting ${userName}`}
                </Typography>
              </Box>
            </Box>

            <IconButton
              size="small"
              onClick={() => setOpen(false)}
              sx={{
                color: "#FFFFFF",
                backgroundColor: "rgba(255,255,255,0.12)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              p: 2.2,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              backgroundColor: "#F8FAFC",
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#CBD5E1",
                borderRadius: "10px",
              },
            }}
          >
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: "flex",
                    gap: 1.2,
                    alignSelf: isBot ? "flex-start" : "flex-end",
                    maxWidth: isBot ? "92%" : "85%",
                    flexDirection: isBot ? "row" : "row-reverse",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: isBot ? "#E6F8F8" : "#00B5B8",
                      color: isBot ? "#00B5B8" : "#FFFFFF",
                      mt: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    {isBot ? (
                      <SmartToyIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <PersonIcon sx={{ fontSize: 16 }} />
                    )}
                  </Avatar>

                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems={isBot ? "flex-start" : "flex-end"}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.8,
                        px: 2,
                        borderRadius: isBot
                          ? "18px 18px 18px 4px"
                          : "18px 18px 4px 18px",
                        backgroundColor: isBot ? "#FFFFFF" : "#00B5B8",
                        color: isBot ? "#0F173B" : "#FFFFFF",
                        boxShadow: isBot
                          ? "0 4px 14px rgba(0,0,0,0.04)"
                          : "0 4px 14px rgba(0,181,184,0.3)",
                        border: isBot ? "1px solid #E2E8F0" : "none",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ lineHeight: 1.55, fontSize: "13.5px" }}
                      >
                        {msg.text}
                      </Typography>

                      {msg.details && (
                        <Box
                          sx={{
                            mt: 1.2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.6,
                          }}
                        >
                          {msg.details.map((point, idx) => (
                            <Typography
                              key={idx}
                              variant="body2"
                              sx={{
                                fontSize: "12.8px",
                                color: isBot
                                  ? "#334155"
                                  : "rgba(255,255,255,0.95)",
                                lineHeight: 1.45,
                              }}
                            >
                              {point}
                            </Typography>
                          ))}
                        </Box>
                      )}

                      {msg.actionUrl && (
                        <Box sx={{ mt: 1.8 }}>
                          <Divider
                            sx={{
                              mb: 1.2,
                              borderColor: isBot
                                ? "#F1F5F9"
                                : "rgba(255,255,255,0.2)",
                            }}
                          />
                          <Button
                            size="small"
                            variant="contained"
                            endIcon={
                              <ArrowForwardIcon
                                sx={{ fontSize: "14px !important" }}
                              />
                            }
                            onClick={() => {
                              navigate(msg.actionUrl!);
                              setOpen(false);
                            }}
                            sx={{
                              backgroundColor: "#140F35",
                              color: "#FFFFFF",
                              fontSize: "12px",
                              fontWeight: 700,
                              textTransform: "none",
                              borderRadius: "10px",
                              py: 0.7,
                              px: 1.8,
                              boxShadow: "none",
                              "&:hover": {
                                backgroundColor: "#009EA0",
                                boxShadow: "none",
                              },
                            }}
                          >
                            {msg.actionLabel || "Open Page"}
                          </Button>
                        </Box>
                      )}
                    </Paper>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "10px", mt: 0.4, px: 0.5 }}
                    >
                      {msg.timestamp}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Prompts Bar */}
          <Box
            sx={{
              p: 1.2,
              px: 2,
              backgroundColor: "#FFFFFF",
              borderTop: "1px solid #F1F5F9",
              display: "flex",
              gap: 1,
              overflowX: "auto",
              flexShrink: 0,
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {quickPrompts.map((prompt, idx) => (
              <Chip
                key={idx}
                label={prompt}
                size="small"
                onClick={() => handleSend(prompt)}
                sx={{
                  fontSize: "11.5px",
                  fontWeight: 600,
                  backgroundColor: "#F8FAFC",
                  color: "#475569",
                  border: "1px solid #E2E8F0",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: "#00B5B8",
                    color: "#FFFFFF",
                    borderColor: "#00B5B8",
                  },
                }}
              />
            ))}
          </Box>

          {/* Input Box */}
          <Box
            sx={{
              p: 1.6,
              px: 2,
              background: "#FFFFFF",
              borderTop: "1px solid #E2E8F0",
              display: "flex",
              gap: 1.2,
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder={
                isManager
                  ? "Ask about team attendance, approvals, policy..."
                  : "Ask about leaves, holidays, balance..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              InputProps={{
                sx: {
                  borderRadius: "14px",
                  fontSize: "13.5px",
                  backgroundColor: "#FAFBFC",
                  "& fieldset": { borderColor: "#E2E8F0" },
                  "&:hover fieldset": { borderColor: "#CBD5E1" },
                  "&.Mui-focused fieldset": { borderColor: "#00B5B8" },
                },
              }}
            />
            <IconButton
              onClick={() => handleSend()}
              disabled={!input.trim()}
              sx={{
                backgroundColor: input.trim() ? "#00B5B8" : "#E2E8F0",
                color: "#FFFFFF",
                borderRadius: "12px",
                p: 1.1,
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: input.trim() ? "#009EA0" : "#E2E8F0",
                },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Card>
      )}
    </Box>
  );
}