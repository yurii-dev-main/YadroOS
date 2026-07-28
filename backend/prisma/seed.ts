import {
  PrismaClient,
  OrgRole,
  ClientStatus,
  DealStage,
  ActivityType,
  AccountType,
  TransactionType,
  InvoiceStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const fakerModule = await new Function("return import('@faker-js/faker')")();
  const { faker } = fakerModule;
  console.log('Starting data seeding with faker...');

  // Clean up existing data
  console.log('Cleaning up existing data...');
  await prisma.$transaction([
    prisma.activity.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.deal.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.budget.deleteMany(),
    prisma.category.deleteMany(),
    prisma.account.deleteMany(),
    prisma.client.deleteMany(),
    prisma.payrollRecord.deleteMany(),
    prisma.leaveBalance.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.leaveRequest.deleteMany(),
    prisma.kPI.deleteMany(),
    prisma.oKR.deleteMany(),
    prisma.performanceHighlight.deleteMany(),
    prisma.offboardingChecklist.deleteMany(),
    prisma.autoResponder.deleteMany(),
    prisma.cannedResponse.deleteMany(),
    prisma.training.deleteMany(),
    prisma.performanceReview.deleteMany(),
    prisma.onboardingPlan.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.department.deleteMany(),
    prisma.organizationMember.deleteMany(),
    prisma.user.deleteMany(),
    prisma.organization.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash('Password123!', 10);

  console.log('Creating Organization...');
  const org = await prisma.organization.create({
    data: {
      name: faker.company.name(),
      slug: faker.helpers.slugify(faker.company.name()).toLowerCase() + '-' + faker.string.alphanumeric(4),
      industry: faker.company.buzzNoun(),
    },
  });

  console.log('Creating Users and Employees...');
  const employees = [];
  const roles = [OrgRole.OWNER, OrgRole.ADMIN, OrgRole.SALES, OrgRole.ACCOUNTANT, OrgRole.HR_SPECIALIST];

  for (let i = 0; i < 5; i++) {
    const isFirst = i === 0;
    const user = await prisma.user.create({
      data: {
        email: isFirst ? 'parker_simonis95@yahoo.com' : faker.internet.email().toLowerCase(),
        passwordHash,
        name: isFirst ? 'Parker Simonis' : faker.person.fullName(),
        company: org.name,
      },
    });

    await prisma.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: roles[i],
      },
    });

    const employee = await prisma.employee.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        firstName: user.name!.split(' ')[0],
        lastName: user.name!.split(' ').slice(1).join(' ') || 'Smith',
        position: faker.person.jobTitle(),
        salary: faker.number.int({ min: 40000, max: 120000 }),
        hireDate: faker.date.past({ years: 3 }),
      },
    });
    employees.push(employee);
  }

  console.log('Creating CRM Data (Clients, Deals, Activities)...');
  const clients = [];
  for (let i = 0; i < 20; i++) {
    const client = await prisma.client.create({
      data: {
        organizationId: org.id,
        name: faker.company.name(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        company: faker.company.name(),
        industry: faker.company.buzzNoun(),
        status: faker.helpers.arrayElement(Object.values(ClientStatus)),
        assignedTo: faker.helpers.arrayElement(employees).id,
      },
    });
    clients.push(client);
  }

  const deals = [];
  for (let i = 0; i < 40; i++) {
    const deal = await prisma.deal.create({
      data: {
        organizationId: org.id,
        clientId: faker.helpers.arrayElement(clients).id,
        title: faker.commerce.productName() + ' Deal',
        value: faker.number.int({ min: 1000, max: 50000 }),
        stage: faker.helpers.arrayElement(Object.values(DealStage)),
        assignedTo: faker.helpers.arrayElement(employees).id,
      },
    });
    deals.push(deal);
  }

  for (let i = 0; i < 50; i++) {
    await prisma.activity.create({
      data: {
        organizationId: org.id,
        clientId: faker.helpers.arrayElement(clients).id,
        dealId: faker.helpers.arrayElement(deals).id,
        type: faker.helpers.arrayElement(Object.values(ActivityType)),
        subject: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        date: faker.date.recent({ days: 30 }),
        duration: faker.number.int({ min: 15, max: 120 }),
        createdBy: faker.helpers.arrayElement(employees).id,
      },
    });
  }

  console.log('Creating Accounting Data (Accounts, Categories, Transactions, Budgets, Invoices)...');
  const accounts = [];
  const accountTypes = [AccountType.bank, AccountType.cash, AccountType.card];
  for (let i = 0; i < 3; i++) {
    const acc = await prisma.account.create({
      data: {
        organizationId: org.id,
        name: `Account ${i + 1} - ${faker.finance.accountName()}`,
        type: accountTypes[i],
        balance: faker.number.int({ min: 10000, max: 100000 }),
        currency: 'USD',
      },
    });
    accounts.push(acc);
  }

  const invoices = [];
  for (let i = 0; i < 15; i++) {
    const amount = faker.number.int({ min: 500, max: 15000 });
    const taxRate = 0.2;
    const taxAmount = amount * taxRate;
    const totalAmount = amount + taxAmount;
    const status = faker.helpers.arrayElement(Object.values(InvoiceStatus));
    
    const invoice = await prisma.invoice.create({
      data: {
        organizationId: org.id,
        invoiceNumber: `INV-${faker.number.int({ min: 1000, max: 9999 })}`,
        clientId: faker.helpers.arrayElement(clients).id,
        amount,
        taxRate,
        taxAmount,
        totalAmount,
        currency: 'USD',
        status,
        issueDate: faker.date.recent({ days: 60 }),
        dueDate: status === 'overdue' ? faker.date.recent({ days: 30 }) : faker.date.soon({ days: 30 }),
        paidDate: status === 'paid' ? faker.date.recent({ days: 10 }) : null,
        createdBy: faker.helpers.arrayElement(employees).id,
      },
    });
    invoices.push(invoice);
  }

  const categories = [];
  for (let i = 0; i < 10; i++) {
    const cat = await prisma.category.create({
      data: {
        organizationId: org.id,
        name: faker.commerce.department(),
        type: faker.helpers.arrayElement([TransactionType.income, TransactionType.expense]),
      },
    });
    categories.push(cat);
  }

  for (let i = 0; i < 100; i++) {
    const cat = faker.helpers.arrayElement(categories);
    await prisma.transaction.create({
      data: {
        organizationId: org.id,
        accountId: faker.helpers.arrayElement(accounts).id,
        type: cat.type,
        amount: faker.number.int({ min: 10, max: 5000 }),
        currency: 'USD',
        categoryId: cat.id,
        date: faker.date.recent({ days: 30 }),
        description: faker.lorem.words(3),
      },
    });
  }

  for (let i = 0; i < 5; i++) {
    await prisma.budget.create({
      data: {
        organizationId: org.id,
        name: faker.finance.accountName() + ' Budget',
        amount: faker.number.int({ min: 5000, max: 20000 }),
        period: 'monthly',
        startDate: new Date('2026-07-01'),
        endDate: new Date('2026-07-31'),
        categoryId: faker.helpers.arrayElement(categories).id,
      },
    });
  }

  console.log('Creating HR Data (PayrollRecords, LeaveBalances)...');
  for (let i = 0; i < 10; i++) {
    const emp = faker.helpers.arrayElement(employees);
    await prisma.payrollRecord.create({
      data: {
        organizationId: org.id,
        employeeId: emp.id,
        period: 'July 2026',
        baseSalary: emp.salary || 5000,
        grossSalary: Number(emp.salary || 5000) + faker.number.int({ min: 0, max: 1000 }),
        netSalary: Number(emp.salary || 5000) * 0.8,
        status: 'paid',
      },
    });
  }

  for (let i = 0; i < 10; i++) {
    const emp = faker.helpers.arrayElement(employees);
    await prisma.leaveBalance.create({
      data: {
        organizationId: org.id,
        employeeId: emp.id,
        type: faker.helpers.arrayElement(['vacation', 'sick', 'personal']),
        total: 20,
        used: faker.number.int({ min: 0, max: 15 }),
      },
    });
  }

  console.log('Creating New HR and Communications Data (Trainings, KPIs, OKRs, Reviews, Attendance, Highlights, CannedResponses)...');

  // Trainings
  for (let i = 0; i < 5; i++) {
    await prisma.training.create({
      data: {
        organizationId: org.id,
        title: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        type: faker.helpers.arrayElement(['workshop', 'webinar', 'course']),
        startDate: faker.date.soon({ days: 30 }),
        endDate: faker.date.soon({ days: 37 }),
        instructor: faker.person.fullName(),
        location: faker.location.city(),
        capacity: faker.number.int({ min: 5, max: 30 }),
        status: faker.helpers.arrayElement(['scheduled', 'ongoing', 'completed']),
      }
    });
  }

  // KPIs
  for (const emp of employees) {
    await prisma.kPI.create({
      data: {
        organizationId: org.id,
        employeeId: emp.id,
        name: faker.lorem.words(2),
        target: faker.number.int({ min: 80, max: 100 }),
        current: faker.number.int({ min: 60, max: 99 }),
        unit: faker.helpers.arrayElement(['%', 'count', 'USD']),
        period: 'Q2 2026',
      }
    });
  }

  // OKRs
  for (const emp of employees.slice(0, 3)) {
    await prisma.oKR.create({
      data: {
        organizationId: org.id,
        employeeId: emp.id,
        objective: faker.lorem.sentence(),
        progress: faker.number.int({ min: 10, max: 90 }),
        period: 'Q2 2026',
      }
    });
  }

  // Performance Reviews
  for (const emp of employees) {
    await prisma.performanceReview.create({
      data: {
        organizationId: org.id,
        employeeId: emp.id,
        reviewerId: employees[0].id,
        rating: faker.number.int({ min: 3, max: 5 }),
        comments: faker.lorem.paragraph(),
        date: faker.date.recent({ days: 30 }),
      }
    });
  }

  // Attendance
  for (const emp of employees) {
    for (let d = 0; d < 20; d++) {
      const date = faker.date.recent({ days: 30 });
      await prisma.attendance.create({
        data: {
          organizationId: org.id,
          employeeId: emp.id,
          date,
          clockIn: new Date(date.setHours(9, 0, 0)),
          clockOut: new Date(date.setHours(17, 30, 0)),
          status: faker.helpers.arrayElement(['present', 'late', 'absent']),
        }
      });
    }
  }

  // Performance Highlights
  for (const emp of employees) {
    await prisma.performanceHighlight.create({
      data: {
        organizationId: org.id, 
        employeeId: emp.id, 
        title: faker.lorem.words(3), 
        score: faker.number.int({ min: 60, max: 100 }) 
      }
    });
  }

  // Canned Responses
  await prisma.cannedResponse.createMany({
    data: [
      { organizationId: org.id, title: 'Greeting', content: 'Hello! How can I help you today?', category: 'support' },
      { organizationId: org.id, title: 'Thank you', content: 'Thank you for reaching out. We will get back to you shortly.', category: 'support' },
      { organizationId: org.id, title: 'Follow-up', content: 'Just following up on our previous conversation. Do you have any questions?', category: 'sales' },
    ]
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
