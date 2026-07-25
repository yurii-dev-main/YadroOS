'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const client_1 = require('@prisma/client');
const bcrypt_1 = __importDefault(require('bcrypt'));
const prisma = new client_1.PrismaClient();
async function main() {
  console.log('Seeding database...');
  const adminPassword = await bcrypt_1.default.hash('Admin123!', 10);
  const managerPassword = await bcrypt_1.default.hash('Manager123!', 10);
  const accountantPassword = await bcrypt_1.default.hash('Account123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@crm.local' },
    update: {},
    create: {
      email: 'admin@crm.local',
      passwordHash: adminPassword,
      role: client_1.Role.ADMIN
    }
  });
  const manager = await prisma.user.upsert({
    where: { email: 'manager@crm.local' },
    update: {},
    create: {
      email: 'manager@crm.local',
      passwordHash: managerPassword,
      role: client_1.Role.MANAGER
    }
  });
  const accountant = await prisma.user.upsert({
    where: { email: 'accountant@crm.local' },
    update: {},
    create: {
      email: 'accountant@crm.local',
      passwordHash: accountantPassword,
      role: client_1.Role.ACCOUNTANT
    }
  });
  const adminEmployee = await prisma.employee.upsert({
    where: { id: admin.id },
    update: {},
    create: {
      id: admin.id,
      userId: admin.id,
      firstName: 'Olena',
      lastName: 'Ivanenko',
      position: 'Administrator',
      department: 'Operations',
      hireDate: new Date('2022-01-10')
    }
  });
  const managerEmployee = await prisma.employee.upsert({
    where: { id: manager.id },
    update: {},
    create: {
      id: manager.id,
      userId: manager.id,
      firstName: 'Andrii',
      lastName: 'Shevchenko',
      position: 'Sales Manager',
      department: 'Sales',
      hireDate: new Date('2023-03-15')
    }
  });
  const accountantEmployee = await prisma.employee.upsert({
    where: { id: accountant.id },
    update: {},
    create: {
      id: accountant.id,
      userId: accountant.id,
      firstName: 'Iryna',
      lastName: 'Koval',
      position: 'Accountant',
      department: 'Finance',
      hireDate: new Date('2022-07-01')
    }
  });
  const clientA = await prisma.client.create({
    data: {
      name: 'TechNova LLC',
      company: 'TechNova',
      email: 'contact@technova.com',
      phone: '+380671234567',
      industry: 'Software',
      website: 'https://technova.example.com',
      size: 120,
      revenue: 1500000,
      status: client_1.ClientStatus.active,
      assignedTo: managerEmployee.id
    }
  });
  const clientB = await prisma.client.create({
    data: {
      name: 'GreenFarm',
      company: 'GreenFarm',
      email: 'info@greenfarm.com',
      phone: '+380931112233',
      industry: 'Agriculture',
      size: 80,
      revenue: 950000,
      status: client_1.ClientStatus.lead,
      assignedTo: managerEmployee.id
    }
  });
  const deal = await prisma.deal.create({
    data: {
      clientId: clientA.id,
      title: 'CRM Implementation',
      value: 50000,
      currency: 'USD',
      stage: client_1.DealStage.negotiation,
      probability: 70,
      expectedCloseDate: new Date(),
      assignedTo: managerEmployee.id
    }
  });
  await prisma.activity.create({
    data: {
      clientId: clientA.id,
      dealId: deal.id,
      type: 'call',
      subject: 'Initial requirements',
      description: 'Discussed CRM rollout phases',
      date: new Date(),
      duration: 45,
      createdBy: managerEmployee.id
    }
  });
  const bankAccount = await prisma.account.create({
    data: {
      name: 'Main Bank',
      type: client_1.AccountType.bank,
      currency: 'USD',
      balance: 250000,
      bankName: 'MonoBank'
    }
  });
  const cashAccount = await prisma.account.create({
    data: {
      name: 'Cash Desk',
      type: client_1.AccountType.cash,
      currency: 'USD',
      balance: 15000
    }
  });
  await prisma.transaction.createMany({
    data: [
      {
        accountId: bankAccount.id,
        type: client_1.TransactionType.income,
        amount: 20000,
        currency: 'USD',
        category: 'Implementation',
        description: 'Upfront payment from TechNova',
        date: new Date(),
        clientId: clientA.id,
        status: 'completed'
      },
      {
        accountId: bankAccount.id,
        type: client_1.TransactionType.expense,
        amount: 5000,
        currency: 'USD',
        category: 'Salaries',
        description: 'Monthly payroll',
        date: new Date(),
        status: 'completed'
      },
      {
        accountId: cashAccount.id,
        type: client_1.TransactionType.expense,
        amount: 1200,
        currency: 'USD',
        category: 'Office',
        description: 'Supplies',
        date: new Date(),
        status: 'completed'
      }
    ]
  });
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-1001',
      clientId: clientA.id,
      amount: 50000,
      currency: 'USD',
      taxRate: 0.2,
      taxAmount: 10000,
      totalAmount: 60000,
      status: client_1.InvoiceStatus.sent,
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdBy: accountantEmployee.id
    }
  });
  await prisma.auditLog.create({
    data: {
      userId: manager.id,
      entityType: 'deal',
      entityId: deal.id,
      action: 'deal_created',
      description: `Manager ${managerEmployee.firstName} ${managerEmployee.lastName} created deal ${deal.title}`,
      metadata: { clientId: clientA.id }
    }
  });
  await prisma.auditLog.create({
    data: {
      userId: accountant.id,
      entityType: 'invoice',
      entityId: invoice.id,
      action: 'invoice_sent',
      description: 'Finance department sent invoice to client',
      metadata: { client: clientA.name }
    }
  });
  console.log('Seeding completed');
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
