import { Router } from 'express';
import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  listEmployees,
  updateEmployee
} from '../controllers/hr.controller';
import {
  listDepartments,
  getOrgChart,
  getHrStats,
  listLeaveRequests,
  createLeaveRequest,
  getLeaveBalances,
  listAttendanceRecords,
  getAttendanceSummary,
  listTrainings,
  listKPIs,
  listOKRs,
  listPerformanceReviews
} from '../controllers/hr-extended.controller';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(checkRole(['ADMIN', 'MANAGER', 'MEMBER']));

// Employees
router.get('/employees', listEmployees);
router.get('/employees/:id', getEmployeeById);
router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);
router.delete('/employees/:id', deleteEmployee);

// Departments
router.get('/departments', listDepartments);

// Org-chart
router.get('/org-chart', getOrgChart);

// HR Stats
router.get('/statistics', getHrStats);
router.get('/stats', getHrStats);

// Leave Management
router.get('/leave-requests', listLeaveRequests);
router.post('/leave-requests', createLeaveRequest);
router.get('/leave-balances/:employeeId', getLeaveBalances);

// Attendance
router.get('/attendance-records', listAttendanceRecords);
router.get('/attendance-summaries', getAttendanceSummary);

// Trainings, KPIs, OKRs, Performance Reviews
router.get('/trainings', listTrainings);
router.get('/kpis', listKPIs);
router.get('/okrs', listOKRs);
router.get('/performance-reviews', listPerformanceReviews);

export default router;
