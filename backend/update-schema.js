const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// Append relations to Organization
schema = schema.replace(
  /transactions Transaction\[\]\s+invoices\s+Invoice\[\]\s+messages\s+UnifiedMessage\[\]/g,
  `transactions Transaction[]
  invoices     Invoice[]
  messages     UnifiedMessage[]
  categories   Category[]
  budgets      Budget[]
  departments  Department[]
  attendances  Attendance[]
  leaveRequests LeaveRequest[]
  trainings    Training[]
  kpis         KPI[]
  okrs         OKR[]
  reviews      PerformanceReview[]
  onboardings  OnboardingPlan[]
  canned       CannedResponse[]
  emails       EmailMessage[]
  apiKeys      ApiKey[]
  campaigns    Campaign[]
  emailTemplates EmailTemplate[]`
);

// Append relations to Employee
schema = schema.replace(
  /invoices\s+Invoice\[\]\s+@relation\("InvoiceCreator"\)/g,
  `invoices       Invoice[]    @relation("InvoiceCreator")
  departmentRef  Department?  @relation("DepartmentEmployees", fields: [departmentId], references: [id])
  departmentId   String?      @db.Uuid
  managedDept    Department[] @relation("DepartmentManager")
  attendances    Attendance[]
  leaveRequests  LeaveRequest[]
  kpis           KPI[]
  reviews        PerformanceReview[]
  managerId      String?      @db.Uuid
  manager        Employee?    @relation("ManagerSubordinates", fields: [managerId], references: [id])
  subordinates   Employee[]   @relation("ManagerSubordinates")`
);

// Append relations to User
schema = schema.replace(
  /auditLogs\s+AuditLog\[\]/g,
  `auditLogs    AuditLog[]
  apiKeys      ApiKey[]`
);

const newModels = `

// --- ACCOUNTING EXTENSIONS ---

model Category {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  type           TransactionType
  color          String?
  createdAt      DateTime      @default(now())

  @@index([organizationId])
}

model Budget {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  amount         Decimal
  currency       String        @default("USD")
  period         String        // monthly, yearly
  startDate      DateTime      @db.Date
  endDate        DateTime      @db.Date
  categoryId     String?       @db.Uuid
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([organizationId])
}

// --- HR EXTENSIONS ---

model Department {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  managerId      String?       @db.Uuid
  manager        Employee?     @relation("DepartmentManager", fields: [managerId], references: [id])
  employees      Employee[]    @relation("DepartmentEmployees")
  createdAt      DateTime      @default(now())

  @@index([organizationId])
}

model Attendance {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  employeeId     String        @db.Uuid
  employee       Employee      @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  date           DateTime      @db.Date
  clockIn        DateTime?
  clockOut       DateTime?
  status         String        @default("present") // present, absent, late
  notes          String?
  createdAt      DateTime      @default(now())

  @@index([organizationId, employeeId, date])
}

model LeaveRequest {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  employeeId     String        @db.Uuid
  employee       Employee      @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  type           String        // vacation, sick, unpaid
  startDate      DateTime      @db.Date
  endDate        DateTime      @db.Date
  status         String        @default("pending") // pending, approved, rejected
  reason         String?
  approverId     String?       @db.Uuid
  createdAt      DateTime      @default(now())

  @@index([organizationId, employeeId])
}

model Training {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  title          String
  description    String?
  startDate      DateTime?     @db.Date
  endDate        DateTime?     @db.Date
  instructor     String?
  createdAt      DateTime      @default(now())
}

model KPI {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  employeeId     String        @db.Uuid
  employee       Employee      @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  name           String
  target         Decimal
  current        Decimal       @default(0)
  unit           String?
  period         String
  createdAt      DateTime      @default(now())
}

model OKR {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  objective      String
  progress       Int           @default(0)
  period         String
  createdAt      DateTime      @default(now())
}

model PerformanceReview {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  employeeId     String        @db.Uuid
  employee       Employee      @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  reviewerId     String?       @db.Uuid
  rating         Int
  comments       String?
  date           DateTime      @db.Date
  createdAt      DateTime      @default(now())
}

model OnboardingPlan {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  title          String
  role           String?
  tasks          Json          @default("[]")
  createdAt      DateTime      @default(now())
}

// --- COMMUNICATIONS & CRM EXTENSIONS ---

model CannedResponse {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  title          String
  content        String
  category       String?
  createdAt      DateTime      @default(now())
}

model EmailMessage {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  subject        String
  body           String
  from           String
  to             String
  status         String        @default("sent")
  createdAt      DateTime      @default(now())
}

model EmailTemplate {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  subject        String
  body           String
  createdAt      DateTime      @default(now())
}

model Campaign {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  name           String
  status         String        @default("draft")
  sentCount      Int           @default(0)
  createdAt      DateTime      @default(now())
}

// --- AUTH EXTENSIONS ---

model ApiKey {
  id             String        @id @default(uuid()) @db.Uuid
  organizationId String        @db.Uuid
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userId         String        @db.Uuid
  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  name           String
  key            String        @unique
  lastUsedAt     DateTime?
  expiresAt      DateTime?
  createdAt      DateTime      @default(now())
}

`;

fs.writeFileSync(schemaPath, schema + newModels);
console.log('Schema updated successfully!');
