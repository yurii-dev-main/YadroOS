import { Request, Response } from 'express';
import { DealStage } from '@prisma/client';
import { prisma } from '../lib/prisma';

const getActorName = async (userId?: string) => {
  if (!userId) return 'System';
  const employee = await prisma.employee.findFirst({ where: { userId } });
  if (!employee) return 'System';
  return `${employee.firstName} ${employee.lastName}`;
};

export const listClients = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const search = req.query.search as string;
  const filters = (req.query.filters as any) || {};
  const sort = (req.query.sort as any) || { field: 'createdAt', direction: 'desc' };

  const where: any = { organizationId: req.user!.organizationId };
  
  if (filters.status && filters.status !== 'all') where.status = filters.status;
  if (filters.industry && filters.industry !== 'all') where.industry = filters.industry;
  if (filters.assignedTo && filters.assignedTo !== 'all') {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(filters.assignedTo);
    if (isUUID) {
      where.assignedTo = filters.assignedTo;
    } else {
      const parts = filters.assignedTo.split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      where.assignedEmployee = {
        is: {
          firstName: { contains: firstName, mode: 'insensitive' },
          ...(lastName ? { lastName: { contains: lastName, mode: 'insensitive' } } : {})
        }
      };
    }
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } }
    ];
  }

  const isCustomSort = ['revenue', 'manager', 'status'].includes(sort.field);
  const orderBy = !isCustomSort && sort.field ? { [sort.field]: sort.direction || 'asc' } : { createdAt: 'desc' };

  let total = await prisma.client.count({ where });
  let clients = [];

  if (isCustomSort) {
    // For calculated or complex relation fields, sort in memory
    clients = await prisma.client.findMany({
      where,
      include: { assignedEmployee: true, deals: true }
    });
  } else {
    clients = await prisma.client.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { assignedEmployee: true, deals: true }
    });
  }

  let formattedClients = clients.map(client => ({
    ...client,
    revenue: client.deals.reduce((sum: number, deal: any) => sum + (deal.stage === 'closed_won' ? Number(deal.value || 0) : 0), 0),
    assignedTo: client.assignedEmployee 
      ? `${client.assignedEmployee.firstName} ${client.assignedEmployee.lastName}`
      : client.assignedTo
  }));

  if (isCustomSort) {
    if (sort.field === 'revenue') {
      formattedClients.sort((a, b) => sort.direction === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue);
    } else if (sort.field === 'manager') {
      formattedClients.sort((a, b) => {
        const nameA = a.assignedTo || '';
        const nameB = b.assignedTo || '';
        return sort.direction === 'desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
      });
    } else if (sort.field === 'status') {
      formattedClients.sort((a, b) => sort.direction === 'desc' ? b.status.localeCompare(a.status) : a.status.localeCompare(b.status));
    }
    
    // Slice for pagination
    formattedClients = formattedClients.slice((page - 1) * pageSize, page * pageSize);
  }

  res.json({ data: formattedClients, total });
};

export const createClient = async (req: Request, res: Response) => {
  const { assignedTo, ...rest } = req.body;
  const data: any = { ...rest, organizationId: req.user!.organizationId };
  if (assignedTo && typeof assignedTo === 'string' && assignedTo.trim() !== '') {
    data.assignedTo = assignedTo;
  }
  const clientRecord = await prisma.client.create({ data });
  res.status(201).json(clientRecord);
};

export const updateClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { assignedTo, ...rest } = req.body;
  const data: any = { ...rest };
  if (assignedTo && typeof assignedTo === 'string' && assignedTo.trim() !== '') {
    data.assignedTo = assignedTo;
  } else if (assignedTo === null || assignedTo === '') {
    data.assignedTo = null;
  }
  const updated = await prisma.client.update({ where: { id }, data });
  res.json(updated);
};

export const bulkUpdateClients = async (req: Request, res: Response) => {
  const { ids, updates } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Missing ids' });
  const result = await prisma.client.updateMany({
    where: { id: { in: ids }, organizationId: req.user!.organizationId },
    data: updates
  });
  res.json({ message: 'Updated successfully', count: result.count });
};

export const bulkDeleteClients = async (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: 'Missing ids' });
  const result = await prisma.client.deleteMany({
    where: { id: { in: ids }, organizationId: req.user!.organizationId }
  });
  res.json({ message: 'Deleted successfully', count: result.count });
};

export const deleteClient = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.client.delete({ where: { id } });
  res.status(204).send();
};

export const exportClients = async (req: Request, res: Response) => {
  const clients = await prisma.client.findMany({
    where: { organizationId: req.user!.organizationId }
  });

  const header = ['name', 'company', 'email', 'phone', 'status', 'industry'].join(',');
  const rows = clients.map(c => [c.name, c.company, c.email, c.phone, c.status, c.industry].map(v => `"${v || ''}"`).join(','));
  const csv = [header, ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=clients.csv');
  res.send(csv);
};

export const importClients = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const csv = req.file.buffer.toString('utf-8');
  const lines = csv.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) {
    return res.status(400).json({ message: 'Invalid CSV format' });
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const orgId = req.user!.organizationId;

  let importedCount = 0;
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    if (values.length !== headers.length) continue;

    const clientData: any = { organizationId: orgId };
    headers.forEach((h, idx) => {
      if (h !== 'id' && values[idx]) {
        clientData[h] = values[idx];
      }
    });

    if (clientData.name && clientData.email) {
      clientData.status = clientData.status || 'lead';
      clientData.industry = clientData.industry || 'Unknown';
      clientData.company = clientData.company || 'Unknown';
      clientData.phone = clientData.phone || '';
      clientData.size = Number(clientData.size) || 1;
      clientData.revenue = Number(clientData.revenue) || 0;

      await prisma.client.create({ data: clientData });
      importedCount++;
    }
  }

  res.json({ message: `Successfully imported ${importedCount} clients`, count: importedCount });
};

export const listDeals = async (req: Request, res: Response) => {
  const { search, stage, assignedTo, minValue, maxValue } = req.query as any;
  const where: any = { organizationId: req.user!.organizationId };
  
  if (stage) where.stage = stage;
  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }
  
  if (assignedTo && assignedTo !== 'all') {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignedTo);
    if (isUUID) {
      where.assignedTo = assignedTo;
    } else {
      const parts = assignedTo.split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      where.assignedEmployee = {
        is: {
          firstName: { contains: firstName, mode: 'insensitive' },
          ...(lastName ? { lastName: { contains: lastName, mode: 'insensitive' } } : {})
        }
      };
    }
  }

  if (minValue || maxValue) {
    where.value = {};
    if (minValue) where.value.gte = Number(minValue);
    if (maxValue) where.value.lte = Number(maxValue);
  }

  const deals = await prisma.deal.findMany({
    where,
    include: { client: true, assignedEmployee: true }
  });

  const formattedDeals = deals.map(deal => ({
    ...deal,
    assignedTo: deal.assignedEmployee
      ? `${deal.assignedEmployee.firstName} ${deal.assignedEmployee.lastName}`
      : deal.assignedTo
  }));

  res.json({ data: formattedDeals });
};

export const createDeal = async (req: Request, res: Response) => {
  const { assignedTo, ...rest } = req.body;
  const data: any = { ...rest, organizationId: req.user!.organizationId };
  if (assignedTo && typeof assignedTo === 'string' && assignedTo.trim() !== '') {
    data.assignedTo = assignedTo;
  }

  const deal = await prisma.deal.create({ data });
  res.status(201).json(deal);
};

export const updateDeal = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { assignedTo, ...rest } = req.body;
  const data: any = { ...rest };
  
  if (assignedTo && typeof assignedTo === 'string' && assignedTo.trim() !== '') {
    data.assignedTo = assignedTo;
  } else if (assignedTo === null || assignedTo === '') {
    data.assignedTo = null;
  }

  const existing = await prisma.deal.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Deal not found' });
  }

  const updated = await prisma.deal.update({ where: { id }, data });

  if (data.stage && data.stage !== existing.stage) {
    if (data.stage === DealStage.closed_won) {
      await prisma.client.update({
        where: { id: existing.clientId },
        data: { status: 'active' }
      });
      const actorName = await getActorName(req.user?.userId);
      await prisma.auditLog.create({
        data: {
          organizationId: req.user!.organizationId,
          userId: req.user?.userId,
          entityType: 'deal',
          entityId: updated.id,
          action: 'deal_closed',
          description: `Manager ${actorName} closed deal ${updated.title}`
        }
      });
    } else if (data.stage === DealStage.closed_lost) {
      await prisma.client.update({
        where: { id: existing.clientId },
        data: { status: 'lost' }
      });
    } else {
      await prisma.client.update({
        where: { id: existing.clientId },
        data: { status: 'lead' }
      });
    }
  }

  res.json(updated);
};

export const deleteDeal = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.deal.delete({ where: { id } });
  res.status(204).send();
};

export const getClientDetail = async (req: Request, res: Response) => {
  const { id } = req.params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      deals: true,
      activities: { orderBy: { createdAt: 'desc' } },
      assignedEmployee: true
    }
  });
  if (!client) return res.status(404).json({ message: 'Client not found' });
  
  const formattedClient = {
    ...client,
    revenue: client.deals.reduce((sum: number, deal: any) => sum + (deal.stage === 'closed_won' ? Number(deal.value || 0) : 0), 0),
    assignedTo: client.assignedEmployee 
      ? `${client.assignedEmployee.firstName} ${client.assignedEmployee.lastName}`
      : client.assignedTo,
    assignedToAvatar: client.assignedEmployee?.avatarUrl || null,
    tags: [],
    notes: []
  };

  res.json(formattedClient);
};

export const getCRMAnalytics = async (req: Request, res: Response) => {
  const orgId = req.user!.organizationId;
  const allDeals = await prisma.deal.findMany({ where: { organizationId: orgId }, include: { assignedEmployee: true } });
  const allClients = await prisma.client.findMany({ where: { organizationId: orgId } });

  const totalDeals = allDeals.length;
  const wonDeals = allDeals.filter((d) => d.stage === DealStage.closed_won);
  const winRate = totalDeals > 0 ? Math.round((wonDeals.length / totalDeals) * 100) : 0;
  
  const revenue = wonDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
  const averageDealSize = wonDeals.length > 0 ? revenue / wonDeals.length : 0;
  
  const ltv = allClients.length > 0 ? revenue / allClients.length : 0;

  const funnelData = [
    { stage: 'Lead', value: allDeals.filter(d => d.stage === DealStage.lead).length },
    { stage: 'Contact Made', value: allDeals.filter(d => d.stage === DealStage.contact_made).length },
    { stage: 'Qualification', value: allDeals.filter(d => d.stage === DealStage.qualification).length },
    { stage: 'Proposal', value: allDeals.filter(d => d.stage === DealStage.proposal).length },
    { stage: 'Negotiation', value: allDeals.filter(d => d.stage === DealStage.negotiation).length },
    { stage: 'Closed Won', value: wonDeals.length },
    { stage: 'Closed Lost', value: allDeals.filter(d => d.stage === DealStage.closed_lost).length }
  ];

  const activeClients = allClients.filter(c => c.status === 'active').length;
  const inactiveClients = allClients.filter(c => c.status === 'inactive').length;
  const leadClients = allClients.filter(c => c.status === 'lead').length;
  const statusDistribution = [
    { status: 'Active', value: activeClients },
    { status: 'Inactive', value: inactiveClients },
    { status: 'Lead', value: leadClients }
  ];

  const managersMap: Record<string, { deals: number, won: number, revenue: number }> = {};
  allDeals.forEach(d => {
    const managerName = d.assignedEmployee ? `${d.assignedEmployee.firstName} ${d.assignedEmployee.lastName}` : 'Unassigned';
    if (!managersMap[managerName]) {
      managersMap[managerName] = { deals: 0, won: 0, revenue: 0 };
    }
    managersMap[managerName].deals += 1;
    if (d.stage === DealStage.closed_won) {
      managersMap[managerName].won += 1;
      managersMap[managerName].revenue += Number(d.value || 0);
    }
  });
  
  const managerPerformance = Object.entries(managersMap).map(([manager, stats]) => ({
    manager,
    ...stats
  }));

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const now = new Date();
  const newClients = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = months[d.getMonth()];
    const count = allClients.filter(c => {
      const cd = new Date(c.createdAt);
      return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
    }).length;
    newClients.push({ period: monthStr, value: count });
  }

  const revenueForecast = [];
  const openDeals = allDeals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
  const openValue = openDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
  
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthStr = months[d.getMonth()];
    let forecastVal = 0;
    if (i === 1) forecastVal = Math.round(openValue * 0.3);
    else if (i === 2) forecastVal = Math.round(openValue * 0.2);
    else forecastVal = Math.round(openValue * 0.1);
    revenueForecast.push({ month: monthStr, value: forecastVal });
  }

  res.json({
    data: {
      totalDeals,
      winRate,
      averageDealSize,
      ltv,
      funnel: funnelData,
      statusDistribution,
      managerPerformance,
      newClients,
      revenueForecast
    }
  });
};

export const listEmailTemplates = async (req: Request, res: Response) => {
  const templates = await prisma.emailTemplate.findMany({
    where: { organizationId: req.user!.organizationId }
  });
  res.json({ data: templates });
};

export const listCampaigns = async (req: Request, res: Response) => {
  const campaigns = await prisma.campaign.findMany({
    where: { organizationId: req.user!.organizationId },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ data: campaigns });
};

export const createCampaign = async (req: Request, res: Response) => {
  const { name, status } = req.body;
  const campaign = await prisma.campaign.create({
    data: {
      name: name || 'Untitled Campaign',
      status: status || 'draft',
      organizationId: req.user!.organizationId,
    }
  });
  res.status(201).json(campaign);
};

export const sendCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  const campaign = await prisma.campaign.findUnique({
    where: { id, organizationId: req.user!.organizationId }
  });
  
  if (!campaign) {
    return res.status(404).json({ message: 'Campaign not found' });
  }
  
  const updated = await prisma.campaign.update({
    where: { id },
    data: {
      status: 'sent',
      sentCount: { increment: 15 } // Mockup for sent count
    }
  });
  
  res.json({ message: 'Campaign sent successfully', data: updated });
};
