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
  createTraining,
  getTrainingById,
  registerForTraining,
  recordTrainingAttendance,
  submitTrainingFeedback,
  listKPIs,
  listOKRs,
  listPerformanceReviews,
  listOnboardingPlans,
  createOnboardingPlan,
  listOffboardingChecklists,
  listPerformanceHighlights,
  getAllLeaveBalances
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
router.get('/leave-balances', getAllLeaveBalances);
router.get('/leave-balances/:employeeId', getLeaveBalances);

// Attendance
router.get('/attendance-records', listAttendanceRecords);
router.get('/attendance-summaries', getAttendanceSummary);

// Trainings, KPIs, OKRs, Performance Reviews
router.get('/trainings', listTrainings);
router.post('/trainings', createTraining);
router.get('/trainings/:id', getTrainingById);
router.post('/trainings/:id/register', registerForTraining);
router.post('/trainings/:id/attendance', recordTrainingAttendance);
router.post('/trainings/:id/feedback', submitTrainingFeedback);
router.get('/kpis', listKPIs);
router.get('/okrs', listOKRs);
router.get('/performance-reviews', listPerformanceReviews);

// Onboarding, Offboarding, Highlights
router.get('/onboarding-plans', listOnboardingPlans);
router.post('/onboarding-plans', createOnboardingPlan);
router.get('/offboarding-checklists', listOffboardingChecklists);
router.get('/performance-highlights', listPerformanceHighlights);

export default router;
