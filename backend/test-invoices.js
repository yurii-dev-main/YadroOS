const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const user = await prisma.user.findFirst({ include: { memberships: true } });
  if (!user) return console.log('No user found');
  
  const token = jwt.sign(
    { userId: user.id, organizationId: user.memberships[0].organizationId, role: user.memberships[0].role },
    process.env.JWT_ACCESS_SECRET || 'dev-access-secret'
  );
  
  const res = await fetch('http://localhost:3000/api/finance/invoices', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  const text = await res.text();
  console.log('STATUS:', res.status);
  console.log('RESPONSE:', text);
}
test().catch(console.error);
