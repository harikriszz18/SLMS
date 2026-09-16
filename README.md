# Smart Leave Management System (SLMS)

An enterprise-grade Leave Management Portal designed for corporate workforce planning, leave lifecycle automation, and real-time operational continuity monitoring.

---

## 📌 Features

### 👤 Employee Self-Service
- **Dynamic Leave Applications**: Apply for various leave categories (Annual, Casual, Sick, Maternity/Paternity, Emergency, WFH) with validation rules.
- **Entitlement Tracking**: Real-time KPI summaries for available quota, consumed allowances, and pending manager reviews.
- **Workforce Calendar**: Interactive monthly timeline with color-coded national/regional corporate holidays and personal time-off schedules.
- **Leave History**: Filterable ledger showing complete audit trails, date intervals, and manager decisions.
- **In-App Notification Feed**: Live status alerts on approvals, rejections, and review notes with one-click dismiss synchronization.

### 👔 Manager Supervisory Command Center
- **Operational Command Center**: Real-time workforce attendance donut visualization tracking shift coverage and daily presence.
- **One-Click Leave Authorizations**: Approve or reject pending applications instantly with automated employee notification triggers.
- **Department Attendance Roster**: Daily roster view showing live presence versus approved leaves, categorized by leave type and reason.
- **Manager Action Checklist**: Workflow reminders to mitigate grid coverage gaps and maintain operational continuity.
- **Workforce Registration**: Integrated portal to onboard and configure department team members.

---

## 🛠️ Tech Stack

### Frontend (`leave-management-ui`)
- **Core**: React 18+ with TypeScript & Vite
- **UI Components**: Material-UI (MUI v5/v6)
- **Date Pickers & Time**: `@mui/x-date-pickers`, Day.js
- **Icons**: `@mui/icons-material`
- **Routing**: React Router DOM (Role-based Protected Routes)
- **HTTP Client**: Axios with JWT Authorization Interceptors

### Backend (`LeaveManagement.API`)
- **Runtime**: ASP.NET Core Web API (.NET 8)
- **Security**: JWT Bearer Authentication & Role-Based Authorization (`Manager`, `Employee`)
- **Data Persistence**: Asynchronous File-Based JSON Data Repository Pattern
- **API Documentation**: Swagger / OpenAPI Specification

---

## 📁 Repository Structure

```text
SLMS/
├── LeaveManagement.API/           # ASP.NET Core Web API
│   ├── Controllers/               # Auth, Leave, Report, ManagerInsights
│   ├── Data/                      # Persistence files (users.json, leaves.json, etc.)
│   ├── DTOs/                      # Data Transfer Objects
│   ├── Interfaces/                # Repository & service contracts
│   ├── Models/                    # Domain models (User, Leave, Notification)
│   ├── Services/                  # Business logic & notification orchestrators
│   └── appsettings.json
│
└── leave-management-ui/           # React + Vite TypeScript Frontend
    ├── src/
    │   ├── assets/                # Corporate assets and branding
    │   ├── components/            # Sidebar, Navbar, Widgets, Dialogs
    │   ├── layouts/               # Dashboard layouts & shell wrappers
    │   ├── pages/                 # Calendar, Dashboard, ApplyLeave, Roster, History
    │   ├── services/              # API client integration modules
    │   └── App.tsx                # App routing & context initialization
    ├── package.json
    └── vite.config.ts
