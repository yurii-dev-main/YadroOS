import {
  CRMActivity,
  CRMClient,
  CRMDeal,
  CRMAnalyticsSummary,
  ClientStatus,
  DealStage
} from '../types/crm.types';

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);

export const formatNumber = (value: number) => new Intl.NumberFormat('uk-UA').format(value);

export const statusLabels: Record<ClientStatus, string> = {
  lead: 'Lead',
  active: 'Active',
  inactive: 'Inactive',
  lost: 'Lost'
};

export const statusBadgeStyles: Record<ClientStatus, string> = {
  lead: 'bg-secondary/10 text-secondary border border-secondary/20',
  active: 'bg-primary/10 text-primary border border-primary/20',
  inactive: 'bg-muted text-muted-foreground border border-border',
  lost: 'bg-destructive/10 text-destructive border border-destructive/20'
};

export const stageLabels: DealStage[] = [
  'Lead',
  'Contact Made',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
];

export const groupDealsByStage = (deals: CRMDeal[]) => {
  return stageLabels.reduce<Record<DealStage, CRMDeal[]>>(
    (acc, stage) => {
      acc[stage] = deals.filter((deal) => deal.stage === stage);
      return acc;
    },
    {
      Lead: [],
      'Contact Made': [],
      Qualification: [],
      Proposal: [],
      Negotiation: [],
      'Closed Won': [],
      'Closed Lost': []
    }
  );
};

export const calculateConversionRates = (
  deals: CRMDeal[]
): Array<{ from: DealStage; to: DealStage; rate: number }> => {
  const grouped = groupDealsByStage(deals);
  const stages = stageLabels;
  const result: Array<{ from: DealStage; to: DealStage; rate: number }> = [];
  stages.forEach((stage, index) => {
    const nextStage = stages[index + 1];
    if (!nextStage) return;
    const currentCount = grouped[stage].length || 1;
    const nextCount = grouped[nextStage].length || 0;
    result.push({
      from: stage,
      to: nextStage,
      rate: Math.min(100, Math.round((nextCount / currentCount) * 100))
    });
  });
  return result;
};

export const getRecentActivities = (activities: CRMActivity[], limit = 5) =>
  [...activities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

export const buildAnalyticsSnapshot = (
  clients: CRMClient[],
  deals: CRMDeal[]
): CRMAnalyticsSummary => {
  const newClients = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthYear = d.toLocaleString('en-US', { month: 'short' });
    const count = clients.filter((c) => {
      const cDate = new Date(c.createdAt);
      return cDate.getMonth() === d.getMonth() && cDate.getFullYear() === d.getFullYear();
    }).length;
    return { period: monthYear, value: count };
  });

  const funnel = stageLabels.map((stage) => ({
    stage,
    value: deals.filter((deal) => deal.stage === stage).length
  }));

  const closedDeals = deals.filter((deal) => deal.stage === 'Closed Won');
  const totalClosed = closedDeals.reduce((acc, deal) => acc + deal.value, 0);
  const averageDealSize = closedDeals.length ? totalClosed / closedDeals.length : 0;
  const ltv = averageDealSize * 5;

  const wonCount = closedDeals.length;
  const winRate = deals.length ? Math.round((wonCount / deals.length) * 100) : 0;

  const revenueForecast = Array.from({ length: 4 }).map((_, index) => {
    const month = new Date();
    month.setMonth(month.getMonth() + index + 1);
    return {
      month: month.toLocaleString('en-US', { month: 'short' }),
      value: totalClosed > 0 ? Math.round(totalClosed * (1 + index * 0.1)) : 0
    };
  });

  const managerGroups = deals.reduce<
    Record<string, { deals: number; won: number; revenue: number }>
  >((acc, deal) => {
    const manager = deal.assignedTo;
    if (!acc[manager]) {
      acc[manager] = { deals: 0, won: 0, revenue: 0 };
    }
    acc[manager].deals += 1;
    if (deal.stage === 'Closed Won') {
      acc[manager].won += 1;
      acc[manager].revenue += deal.value;
    }
    return acc;
  }, {});

  const managerPerformance = Object.entries(managerGroups).map(([manager, stats]) => ({
    manager,
    ...stats
  }));

  const statusDistribution = ['lead', 'active', 'inactive', 'lost'].map((status) => ({
    status: status as ClientStatus,
    value: clients.filter((client) => client.status === status).length
  }));

  return {
    newClients,
    funnel,
    averageDealSize,
    ltv,
    winRate,
    revenueForecast,
    managerPerformance,
    statusDistribution
  };
};

export const downloadBlob = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const toCSV = (clients: CRMClient[]) => {
  const header = [
    'ID',
    'Name',
    'Company',
    'Email',
    'Phone',
    'Website',
    'Industry',
    'Size',
    'Revenue',
    'Status',
    'AssignedTo',
    'Tags'
  ];
  const rows = clients.map((client) => [
    client.id,
    client.name,
    client.company,
    client.email,
    client.phone,
    client.website ?? '',
    client.industry,
    client.size,
    client.revenue,
    client.status,
    client.assignedTo,
    client.tags.map((tag) => tag.label).join('|')
  ]);
  return [header, ...rows].map((row) => row.join(',')).join('\n');
};
