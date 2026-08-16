# ReqruitBook
<div align="center">

**The Modern Recruitment & Talent Operating System**

A full-stack, enterprise-grade Applicant Tracking System (ATS) and Recruitment Management Platform designed to streamline the entire hiring lifecycle — from requisition planning and candidate sourcing to panel interview evaluation, offer generation, and HRM onboarding synchronization.


[![Next.js](https://img.shields.io/badge/Next.js-16.3^-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2^-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0^-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0^-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45^-C5F74F?style=flat&logo=drizzle)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16^-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
</div>


<img width="1674" height="788" alt="Screenshot 2026-08-16 at 2 01 17 PM" src="https://github.com/user-attachments/assets/4df6e515-bd8c-4375-802a-a2be654d2901" />


---

## Features

- **ATS Pipeline & Kanban**: 8-stage visual recruitment pipeline with drag-and-drop workflow.
- **Dynamic Database RBAC**: Fully customizable roles and permissions with root administrator safeguards.
- **Requisition Management**: Complete job vacancy lifecycle with automated publishing to the careers portal.
- **Candidate Talent Pool**: Sourcing directory, resume management, and candidate profile tracking.
- **Interview Scheduling**: Multi-round panel interview scheduling with structured scorecards and rubrics.
- **Offer Management & HRM Bridge**: Compensation package generation and one-click employee sync to HRM.
- **Communications**: Automated email templates and message delivery audit history.
- **Public Careers Portal**: Mobile-responsive job discovery and direct application portal.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Server Actions)
- **UI**: React 19, Radix UI Primitives, Lucide Icons
- **Styling**: Tailwind CSS v4
- **Database & ORM**: PostgreSQL (Neon Serverless) with Drizzle ORM
- **Validation**: Zod

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-org/reqruitbook.git
cd reqruitbook
npm install
```

### 2. Environment Setup

Create `.env` based on `.env.example`:

```bash
cp .env.example .env
```

Configure your PostgreSQL database connection:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/reqruitbook"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SESSION_SECRET="your-secure-random-secret-key"
```

### 3. Database Migration & Seed

```bash
npm run db:push
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the platform.

---

## Demo Accounts

All demo accounts share the password: `Admin@123456`

| Role | Email | Privileges |
| :--- | :--- | :--- |
| **System Administrator** | `admin@myorganisation.com` | Root Administrator (Full RBAC Management) |
| **HR Manager** | `sarah.jenkins@myorganisation.com` | Requisitions, Offers, Candidates, HRM Sync |
| **Lead Recruiter** | `alex.chen@myorganisation.com` | Sourcing, Pipeline Advancement, Interviews |
| **Hiring Manager** | `david.kim@myorganisation.com` | Requisitions, Shortlisting, Scorecards |
| **Interviewer** | `elena.rostova@myorganisation.com` | Panel Evaluations & Scorecards |

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Run production server
npm run typecheck    # Run TypeScript compiler checks
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed database with initial records
npm run db:studio    # Open Drizzle Studio database viewer
```

---

## License

[Proprietary License](LICENSE) · [Code of Conduct](CODE_OF_CONDUCT.md)
