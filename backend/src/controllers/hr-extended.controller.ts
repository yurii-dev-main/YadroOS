import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// 1. Departments
export const listDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      where: { organizationId: req.user!.organizationId },
      include: { manager: true, _count: { select: { employees: true } } },
    });
    res.json({ data: departments });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Org-chart
export const getOrgChart = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { organizationId: req.user!.organizationId },
      include: { departmentRef: true, manager: true },
    });

    const buildNode = (emp: any): any => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      title: emp.position || 'Employee',
      department: emp.department || emp.departmentRef?.name,
      avatarUrl: emp.avatarUrl,
      children: employees
        .filter(e => e.managerId === emp.id)
        .map(buildNode)
    });
    
    const roots = employees.filter(e => !e.managerId);
    const tree = roots.length === 1 ? buildNode(roots[0]) : { id: 'root', name: 'Organization', title: '', children: roots.map(buildNode) };
    
    res.json(tree);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 3. HR Stats
export const getHrStats = async (req: Request, res: Response) => {
  try {
    const orgId = req.user!.organizationId;

    const totalEmployees = await prisma.employee.count({ where: { organizationId: orgId } });
    const departmentsCount = await prisma.department.count({ where: { organizationId: orgId } });
    const openLeaveRequests = await prisma.leaveRequest.count({ where: { organizationId: orgId, status: 'pending' } });
    const activeTrainings = await prisma.training.count({ 
      where: { 
        organizationId: orgId,
        endDate: { gte: new Date() } 
      } 
    });
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
          title: `${emp.firstName} ${emp.lastName}`,
          score: 98 - (index * 2)
        }))
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Leave Management
export const listLeaveRequests = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.leaveRequest.findMany({
      where: { organizationId: req.user!.organizationId },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: requests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createLeaveRequest = async (req: Request, res: Response) => {
  try {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeaveBalances = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const leaves = await prisma.leaveRequest.findMany({
      where: { organizationId: req.user!.organizationId, employeeId, status: 'approved' },
    });
    res.json({ data: leaves });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllLeaveBalances = async (req: Request, res: Response) => {
  try {
    const balances = await prisma.leaveBalance.findMany({
      where: { organizationId: req.user!.organizationId },
      include: { employee: true }
    });
    res.json({ data: balances });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Attendance
export const listAttendanceRecords = async (req: Request, res: Response) => {
  try {
    const records = await prisma.attendance.findMany({
      where: { organizationId: req.user!.organizationId },
      include: { employee: true },
      orderBy: { date: 'desc' },
    });
    res.json({ data: records });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAttendanceSummary = async (req: Request, res: Response) => {
  try {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Trainings, KPIs, OKRs, Performance Reviews
export const listTrainings = async (req: Request, res: Response) => {
  try {
    const trainings = await prisma.training.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: trainings });
  } catch (error: any) {
    res.status(500).json({ error: e.message });
  }
};

export const createTraining = async (req: Request, res: Response) => {
  try {
    const training = await prisma.training.create({
      data: { organizationId: req.user!.organizationId, ...req.body }
    });
    res.status(201).json(training);
  } catch(e: any) { res.status(500).json({ error: e.message }); }
};

export const getTrainingById = async (req: Request, res: Response) => {
  try {
    const training = await prisma.training.findUnique({ where: { id: req.params.id } });
    if (!training) return res.status(404).json({ message: 'Not found' });
    res.json(training);
  } catch(e: any) { res.status(500).json({ error: e.message }); }
};

export const registerForTraining = async (req: Request, res: Response) => {
  try {
    const training = await prisma.training.findUnique({ where: { id: req.params.id } });
    if (!training) return res.status(404).json({ message: 'Not found' });
    const participants = (training.participants as any[]) || [];
    if (!participants.find(p => p.employeeId === req.body.employeeId)) {
      participants.push({ employeeId: req.body.employeeId, attended: false, feedbackSubmitted: false });
    }
    const updated = await prisma.training.update({
      where: { id: req.params.id },
      data: { participants: participants as any }
    });
    res.json(updated);
  } catch(e: any) { res.status(500).json({ error: e.message }); }
};

export const recordTrainingAttendance = async (req: Request, res: Response) => {
  try {
    const training = await prisma.training.findUnique({ where: { id: req.params.id } });
    if (!training) return res.status(404).json({ message: 'Not found' });
    const participants = ((training.participants as any[]) || []).map(p =>
      p.employeeId === req.body.employeeId ? { ...p, attended: req.body.attended } : p
    );
    const updated = await prisma.training.update({ where: { id: req.params.id }, data: { participants: participants as any } });
    res.json(updated);
  } catch(e: any) { res.status(500).json({ error: e.message }); }
};

export const submitTrainingFeedback = async (req: Request, res: Response) => {
  try {
    const training = await prisma.training.findUnique({ where: { id: req.params.id } });
    if (!training) return res.status(404).json({ message: 'Not found' });
    const feedback = ((training.feedback as any[]) || []);
    feedback.push(req.body);
    const participants = ((training.participants as any[]) || []).map(p =>
      p.employeeId === req.body.employeeId ? { ...p, feedbackSubmitted: true } : p
    );
    const updated = await prisma.training.update({
      where: { id: req.params.id },
      data: { feedback: feedback as any, participants: participants as any }
    });
    res.json(updated);
  } catch(e: any) { res.status(500).json({ error: e.message }); }
};

export const listKPIs = async (req: Request, res: Response) => {
  try {
    const kpis = await prisma.kPI.findMany({
      where: { organizationId: req.user!.organizationId },
      include: { employee: true }
    });
    res.json({ data: kpis.map(k => ({ ...k, title: k.name, role: k.period || 'General' })) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listOKRs = async (req: Request, res: Response) => {
  try {
    const okrs = await prisma.oKR.findMany({
      where: { organizationId: req.user!.organizationId }
    });
    res.json({ data: okrs });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listPerformanceReviews = async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.performanceReview.findMany({
      where: { organizationId: req.user!.organizationId },
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: reviews });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 7. Onboarding, Offboarding, Highlights
export const listOnboardingPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.onboardingPlan.findMany({
      where: { organizationId: req.user!.organizationId },
      include: { employee: true }
    });
    res.json({ data: plans });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createOnboardingPlan = async (req: Request, res: Response) => {
  try {
    const { employeeId, buddyId, startDate, title, tasks } = req.body;
    const plan = await prisma.onboardingPlan.create({
      data: {
        organizationId: req.user!.organizationId,
        employeeId,
        buddyId,
        startDate: startDate ? new Date(startDate) : new Date(),
        title: title || 'Onboarding Plan',
        tasks: tasks || []
      }
    });
    res.status(201).json({ data: plan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listOffboardingChecklists = async (req: Request, res: Response) => {
  try {
    const checklists = await prisma.offboardingChecklist.findMany({
      where: { organizationId: req.user!.organizationId },
      include: { employee: true }
    });
    res.json({ data: checklists });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listPerformanceHighlights = async (req: Request, res: Response) => {
  try {
    const highlights = await prisma.performanceHighlight.findMany({
      where: { organizationId: req.user!.organizationId },
      include: { employee: true },
      orderBy: { score: 'desc' }
    });
    res.json({ data: highlights });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
