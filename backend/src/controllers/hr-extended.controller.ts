import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// 1. Departments
export const listDepartments = async (req: Request, res: Response) => {
  const departments = await prisma.department.findMany({
    where: { organizationId: req.user!.organizationId },
    include: { manager: true, _count: { select: { employees: true } } },
  });
  res.json({ data: departments });
};

// 2. Org-chart
export const getOrgChart = async (req: Request, res: Response) => {
  const employees = await prisma.employee.findMany({
    where: { organizationId: req.user!.organizationId },
    include: { departmentRef: true, manager: true },
  });
  res.json({ data: employees });
};

// 3. HR Stats
export const getHrStats = async (req: Request, res: Response) => {
  const orgId = req.user!.organizationId;

  const totalEmployees = await prisma.employee.count({ where: { organizationId: orgId } });
  const departmentsCount = await prisma.department.count({ where: { organizationId: orgId } });
  const openLeaveRequests = await prisma.leaveRequest.count({ where: { organizationId: orgId, status: 'pending' } });
  const activeTrainings = await prisma.training.count({ where: { organizationId: orgId, status: { in: ['scheduled', 'ongoing'] } } });
  const employees = await prisma.employee.findMany({ where: { organizationId: orgId }, take: 3 });

  const attendances = await prisma.attendance.findMany({ where: { organizationId: orgId } });
  const totalAtt = attendances.length || 1;
  const present = attendances.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendanceRate = Math.round((present / totalAtt) * 100);

  res.json({
    data: {
      totalEmployees,
      departmentsCount,
      openLeaveRequests,
      activeTrainings,
      attendanceRate,
      topPerformers: employees.map((emp, index) => ({
        employeeId: emp.id,
        score: 98 - (index * 2)
      }))
    }
  });
};

// 4. Leave Management
export const listLeaveRequests = async (req: Request, res: Response) => {
  const requests = await prisma.leaveRequest.findMany({
    where: { organizationId: req.user!.organizationId },
    include: { employee: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: requests });
};

export const createLeaveRequest = async (req: Request, res: Response) => {
  const { employeeId, type, startDate, endDate, reason } = req.body;
  
  const request = await prisma.leaveRequest.create({
    data: {
      organizationId: req.user!.organizationId,
      employeeId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      status: 'pending',
    }
  });
  res.status(201).json(request);
};

export const getLeaveBalances = async (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const leaves = await prisma.leaveRequest.findMany({
    where: { organizationId: req.user!.organizationId, employeeId, status: 'approved' },
  });
  res.json({ data: leaves });
};

// 5. Attendance
export const listAttendanceRecords = async (req: Request, res: Response) => {
  const records = await prisma.attendance.findMany({
    where: { organizationId: req.user!.organizationId },
    include: { employee: true },
    orderBy: { date: 'desc' },
  });
  res.json({ data: records });
};

export const getAttendanceSummary = async (req: Request, res: Response) => {
  const orgId = req.user!.organizationId;

  const employees = await prisma.employee.findMany({ where: { organizationId: orgId } });
  const attendances = await prisma.attendance.findMany({ where: { organizationId: orgId } });

  const summary = employees.map(emp => {
    const empAtt = attendances.filter(a => a.employeeId === emp.id);
    const total = empAtt.length || 1;
    const present = empAtt.filter(a => a.status === 'present').length;
    const late = empAtt.filter(a => a.status === 'late').length;
    
    return {
      employeeId: emp.id,
      attendanceRate: Math.round(((present + late) / total) * 100),
      lateArrivals: late,
      absenteeismRate: Math.round(((total - present - late) / total) * 100)
    };
  });

  res.json({ data: summary });
};

// 6. Trainings, KPIs, OKRs, Performance Reviews
export const listTrainings = async (req: Request, res: Response) => {
  const trainings = await prisma.training.findMany({
    where: { organizationId: req.user!.organizationId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: trainings });
};

export const listKPIs = async (req: Request, res: Response) => {
  const kpis = await prisma.kPI.findMany({
    where: { organizationId: req.user!.organizationId },
    include: { employee: true }
  });
  res.json({ data: kpis });
};

export const listOKRs = async (req: Request, res: Response) => {
  const okrs = await prisma.oKR.findMany({
    where: { organizationId: req.user!.organizationId }
  });
  res.json({ data: okrs });
};

export const listPerformanceReviews = async (req: Request, res: Response) => {
  const reviews = await prisma.performanceReview.findMany({
    where: { organizationId: req.user!.organizationId },
    include: { employee: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ data: reviews });
};
