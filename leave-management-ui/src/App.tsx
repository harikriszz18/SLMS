import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ApplyLeave from "./pages/ApplyLeave";
import LeaveHistory from "./pages/LeaveHistory";
import CalendarPage from "./pages/CalendarPage";
import Notifications from "./pages/Notifications";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerLeaveHistory from "./pages/ManagerLeaveHistory";
import Home from "./pages/Home";
import DailyAbsenceInsights from "./pages/DailyAbsenceInsights";
import RegisterEmployee from "./pages/RegisterEmployee";
import Layout from "./layouts/Layout";
import WorkforceRoster from "./pages/WorkforceRoster";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        {/* Layout Based Pages */}

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/manager-dashboard" element={<ManagerDashboard />} />

          <Route path="/apply-leave" element={<ApplyLeave />} />

          <Route path="/leave-history" element={<LeaveHistory />} />

          <Route path="/notifications" element={<Notifications />} />

          <Route path="/calendar" element={<CalendarPage />} />

          <Route path="/manager-history" element={<ManagerLeaveHistory />} />
          <Route path="/absence-insights" element={<DailyAbsenceInsights />} />
          <Route path="/register-employee" element={<RegisterEmployee />} />
          <Route path="/workforce-roster" element={<WorkforceRoster />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;