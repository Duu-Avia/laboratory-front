# Laboratory Management System - Frontend

A full-featured laboratory management web application for managing lab test reports, employees, and approval workflows. Built with **Next.js 16** and **React 19**.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Standalone mode)
- **Language:** TypeScript 5
- **Styling:** TailwindCSS 4, shadcn/ui (Radix UI)
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Animations:** Motion / Framer Motion
- **Drag & Drop:** @hello-pangea/dnd
- **PDF Export:** html2pdf.js

## Features

- **Reports Management** — Create, edit, view, approve, sign, reject, and archive lab test reports
- **Approval Workflow** — Multi-stage pipeline: Draft → Pending → Tested → Signed → Approved
- **Employee Management** — CRUD operations for users with role & lab type assignment
- **Lab Specifications** — Manage lab types and their associated indicators
- **Locations & Samples** — Track sample storage locations
- **PDF & Excel Export** — Generate and download reports
- **Real-time Notifications** — Server-sent events for report assignments, approvals, rejections
- **Activity Logging** — Full audit trail of user actions
- **Role-Based Access** — `superadmin`, `senior_engineer/admin`, `engineer`,

## Project Structure

```
app/
├── (auth)/login/             # Login page
├── (main)/                   # Authenticated routes
│   ├── reports/              # Reports dashboard & detail view
│   ├── approve/              # Report approval queue
│   ├── archive/              # Archived reports
│   ├── employees/            # Employee management (admin)
│   ├── lab-spec/             # Lab type & indicator management (admin)
│   ├── locations/            # Sample location management (admin)
│   └── priv-log/             # Activity logs (admin)
├── _components/              # Shared app-level components
└── utils/                    # Utility functions

lib/
├── api/                      # API client, endpoint definitions
├── config/                   # Environment config
├── constants/                # App-wide constants
├── hooks/                    # Custom hooks (useUser, useAuth, useNotifications)
├── validators/               # Zod schemas
└── routes.ts                 # Route path definitions

components/ui/                # shadcn/ui components
types/                        # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running (default: `http://localhost:8000`)

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENV=development
```

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Script             | Description                  |
| ------------------ | ---------------------------- |
| `npm run dev`      | Start development server     |
| `npm run build`    | Build for production         |
| `npm run start`    | Start production server      |
| `npm run lint`     | Run ESLint                   |
| `npm run format`   | Format code with Prettier    |
| `npm run format:check` | Check formatting         |

## Deployment (Docker + K3s)

```bash
# 1. Build Docker image
docker build . -f Dockerfile -t laboratory-fe:v0.0.3

# 2. Save image as tar
docker save -o laboratory_fe_v003.tar laboratory-fe:v0.0.3

# 3. Transfer tar to server (e.g. via FileZilla to /root/Downloads)

# 4. Import image on server
k3s ctr --namespace k8s.io images import Downloads/laboratory_fe_v003.tar

# 5. Update image version in deployment config
nano deployment-laboratory.yaml
# Change the image tag to match the new build version (e.g. laboratory-fe:v0.0.3)

# 6. Apply deployment
kubectl apply -f deployment-laboratory.yaml
```
