# System Architecture

## Overview

Integrated CRM platform for decentralized organizations with modules:

- CRM (Client Relationship Management)
- Communications (Unified inbox)
- HR (Human Resources)
- Accounting (Financial management)
- AI Analytics

## High-Level Architecture

```
┌─────────────┐
│   Users     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Load Balancer   │
│    (Nginx)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌─────┐
│App  │   │App  │
│Srv 1│   │Srv 2│
└──┬──┘   └──┬──┘
   │         │
   └────┬────┘
        │
   ┌────┴─────┬─────────┬────────┐
   ▼          ▼         ▼        ▼
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│ DB   │  │Redis │  │  S3  │  │ AI   │
│(PG)  │  │Cache │  │Files │  │ API  │
└──────┘  └──────┘  └──────┘  └──────┘
```

## Technology Stack

### Frontend

- React 18.2+ (UI library)
- TypeScript 5.3+ (Type safety)
- Vite 5+ (Build tool)
- Tailwind CSS 3+ (Styling)
- Zustand / Redux Toolkit (State management)
- React Router v6 (Routing)
- React Query (Server state)
- Shadcn/ui (Component library)
- Framer Motion (Animations)

### Backend

- Node.js 20+ (Runtime)
- Express 4+ (Web framework)
- TypeScript (Type safety)
- PostgreSQL 15+ (Database)
- Redis 7+ (Caching)
- Prisma / TypeORM (ORM)
- JWT (Authentication)

### Infrastructure

- Nginx (Reverse proxy)
- PM2 (Process manager)
- Docker (Containerization - optional)
- AWS S3 / Cloudflare R2 (File storage)
- Let's Encrypt (SSL)

### External Services

- OpenAI API / Claude API (AI)
- Sentry (Error tracking)
- UptimeRobot (Monitoring)

## Module Architecture

### 1. CRM Module

- Client management
- Deal pipeline (Kanban)
- Activity tracking
- Analytics dashboard

### 2. Communications Module

- Email client (IMAP/SMTP)
- Internal messenger (WebSocket)
- Telegram integration
- Unified inbox

### 3. HR Module

- Employee database
- Training system
- Time tracking
- Performance management

### 4. Accounting Module

- Account management
- Transactions
- Invoicing
- Payroll (AI-driven bonuses)

### 5. AI Module

- Lead scoring
- Performance analysis
- Bonus calculation
- Predictive analytics

## Database Schema

### Core Tables

- users (authentication, roles)
- employees (HR data)
- clients (CRM)
- deals (sales pipeline)
- activities (interactions)
- accounts (financial)
- transactions (money flow)
- invoices (billing)
- messages (communications)

### Relationships

- Users 1:1 Employees
- Clients 1:N Deals
- Deals 1:N Activities
- Employees 1:N Deals (assignedTo)
- Accounts 1:N Transactions

See: docs/technical/database-schema.md for full ER diagram

## API Architecture

RESTful API at /api/v1/

### Endpoints Structure

```
/api/v1/auth          - Authentication
/api/v1/users         - User management
/api/v1/crm/clients   - Clients
/api/v1/crm/deals     - Deals
/api/v1/crm/activities - Activities
/api/v1/hr/employees  - Employees
/api/v1/hr/trainings  - Trainings
/api/v1/accounting/accounts - Accounts
/api/v1/accounting/transactions - Transactions
/api/v1/accounting/invoices - Invoices
/api/v1/communications/emails - Emails
/api/v1/communications/messages - Messages
/api/v1/ai/insights   - AI insights
```

### Authentication

- JWT tokens (access + refresh)
- 2FA support (TOTP)
- Role-based authorization

### Rate Limiting

- 100 requests/minute per user
- 500 requests/minute per IP

## Security Model

### Authentication & Authorization

- Password: bcrypt (12 rounds)
- JWT tokens (1h expiry)
- Refresh tokens (7 days)
- 2FA (Google Authenticator)
- RBAC (6 roles: Admin, Manager, Operator, Accountant, HR, Viewer)

### Data Protection

- Encryption at rest: AES-256-GCM
- Encryption in transit: TLS 1.3
- Sensitive data fields encrypted
- Audit logging for all operations

### Input Validation

- Backend validation (Zod schemas)
- SQL injection prevention (Prisma/parameterized queries)
- XSS protection (sanitization)
- CSRF tokens
- File upload restrictions

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────┐
│         Cloudflare CDN          │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│    Nginx (Load Balancer)        │
│    - SSL termination            │
│    - Rate limiting              │
│    - Static file serving        │
└────────────┬────────────────────┘
             │
      ┌──────┴──────┐
      │             │
┌─────▼─────┐ ┌────▼──────┐
│  App      │ │  App      │
│  Server 1 │ │  Server 2 │
│  (PM2)    │ │  (PM2)    │
└─────┬─────┘ └────┬──────┘
      │            │
      └──────┬─────┘
             │
      ┌──────┴──────────┬──────────┐
      │                 │          │
┌─────▼─────┐  ┌────────▼──┐  ┌───▼───┐
│PostgreSQL │  │   Redis   │  │  S3   │
│  Master   │  │   Cluster │  │ Files │
│     +     │  └───────────┘  └───────┘
│  Replica  │
└───────────┘
```

### Scaling Strategy

- Horizontal scaling (add more app servers)
- Database read replicas
- Redis clustering
- CDN for static assets
- Load balancing (round-robin)

## Performance Targets

- Page load: < 2 seconds
- API response: < 500ms (p95)
- Database queries: < 100ms
- Uptime: 99.9%
- Concurrent users: 500+

## Monitoring & Logging

- Application: Sentry
- Uptime: UptimeRobot
- Logs: Centralized (ELK stack or CloudWatch)
- Metrics: Custom dashboard
