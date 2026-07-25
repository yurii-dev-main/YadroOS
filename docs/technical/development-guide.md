# Development Guide

## Prerequisites

### Required Software

- Node.js 20+ ([download](https://nodejs.org))
- PostgreSQL 15+ ([download](https://www.postgresql.org/download/))
- Redis 7+ ([download](https://redis.io/download))
- Git ([download](https://git-scm.com))
- Code editor (VS Code recommended)

### Recommended VS Code Extensions

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense
- GitLens
- Thunder Client (API testing)

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/yourcompany/crm-platform.git
cd crm-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
# Copy example env file
cp .env.example .env

# Edit with your values
nano .env
```

Required environment variables:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/crm_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-change-this

# OpenAI (optional for dev)
OPENAI_API_KEY=sk-...
```

### 4. Setup Database

```bash
# Create database
npm run db:create

# Run migrations
npm run db:migrate

# Seed with test data
npm run db:seed
```

This will create:

- Admin user (admin@test.com / password123)
- 10 test clients
- 5 test employees
- Sample deals and activities

### 5. Start Development Server

```bash
# Start all services
npm run dev
```

This starts:

- Frontend dev server: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432
- Redis: localhost:6379

### 6. Login

Navigate to http://localhost:3000 and login:

- Email: admin@test.com
- Password: password123

## Project Structure

```
crm-platform/
├── src/
│   ├── components/          # Shared UI components
│   │   ├── ui/              # Base components (Button, Input, etc.)
│   │   ├── layout/          # Layout components (Sidebar, Header)
│   │   └── common/          # Common components (LoadingSpinner, etc.)
│   │
│   ├── modules/             # Feature modules
│   │   ├── crm/
│   │   │   ├── components/  # CRM-specific components
│   │   │   ├── pages/       # CRM pages
│   │   │   ├── hooks/       # CRM hooks
│   │   │   ├── services/    # API calls
│   │   │   ├── types/       # TypeScript types
│   │   │   └── utils/       # Utility functions
│   │   │
│   │   ├── communications/
│   │   ├── hr/
│   │   ├── accounting/
│   │   └── ai/
│   │
│   ├── hooks/               # Global hooks
│   ├── services/            # Global services
│   ├── store/               # State management
│   ├── types/               # Global types
│   ├── utils/               # Global utilities
│   ├── config/              # Configuration
│   └── App.tsx              # Root component
│
├── server/                  # Backend code
│   ├── routes/              # API routes
│   ├── controllers/         # Business logic
│   ├── services/            # Services
│   ├── middleware/          # Middleware
│   ├── models/              # Database models
│   └── utils/               # Utilities
│
├── prisma/                  # Database
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration files
│
├── tests/                   # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
└── public/                  # Static assets
```

## Code Style Guide

### TypeScript

- Use strict mode
- No `any` types (use `unknown` if needed)
- Prefer interfaces over types for objects
- Use enums for constants

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ Bad
type User = {
  id: any;
  name: any;
};
```

### React Components

- Functional components with hooks
- Use TypeScript for props
- Destructure props
- Use meaningful component names

```typescript
// ✅ Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}

// ❌ Bad
export function Btn(props: any) {
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

### Naming Conventions

- Components: PascalCase (UserProfile.tsx)
- Functions: camelCase (getUserById)
- Constants: UPPER_SNAKE_CASE (API_BASE_URL)
- Files: kebab-case or PascalCase (user-profile.tsx or UserProfile.tsx)
- CSS classes: kebab-case (btn-primary)

### File Organization

- One component per file
- Co-locate related files
- Index files for barrel exports
- Separate types into .types.ts files

## Git Workflow

### Branch Strategy

```
main          - Production-ready code
develop       - Development branch
feature/*     - New features
bugfix/*      - Bug fixes
hotfix/*      - Emergency fixes
```

### Commit Messages

Follow Conventional Commits:

```bash
feat(crm): add client search functionality
fix(auth): resolve token refresh issue
docs(api): update endpoint documentation
refactor(hr): optimize employee query
test(accounting): add invoice tests
```

### Pull Request Process

1. Create feature branch from develop
2. Make changes
3. Write/update tests
4. Run linter: `npm run lint`
5. Run tests: `npm run test`
6. Push and create PR to develop
7. Wait for code review
8. Address feedback
9. Merge after approval

## Testing

### Unit Tests (Jest)

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Example test:

```typescript
import { calculateBonus } from './bonus.utils';

describe('calculateBonus', () => {
  it('should calculate bonus correctly', () => {
    const salary = 1000;
    const performanceCoefficient = 1.2;

    const result = calculateBonus(salary, performanceCoefficient);

    expect(result).toBe(1200);
  });
});
```

### Integration Tests (Supertest)

```bash
npm run test:integration
```

### E2E Tests (Playwright)

```bash
# Install browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# UI mode
npm run test:e2e:ui
```

## Common Tasks

### Adding a New Feature

1. Create feature branch
2. Create module structure
3. Define TypeScript types
4. Create components
5. Add API endpoints
6. Connect frontend to backend
7. Write tests
8. Update documentation

### Creating API Endpoint

```typescript
// server/routes/clients.routes.ts
import { Router } from 'express';
import { getClients } from '../controllers/clients.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getClients);

export default router;
```

### Adding Database Migration

```bash
# Create migration
npx prisma migrate dev --name add_user_phone

# Run migrations
npm run db:migrate

# Reset database (DEV ONLY!)
npm run db:reset
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection
psql -U postgres -d crm_dev
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Node Modules Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
# Clear build cache
rm -rf dist .vite

# Rebuild
npm run build
```

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format with Prettier
npm run type-check       # Check TypeScript

# Testing
npm run test             # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests
```

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express Guide](https://expressjs.com/en/guide/routing.html)
