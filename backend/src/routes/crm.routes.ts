import { Router } from 'express';
import multer from 'multer';
import {
  createClient,
  createDeal,
  deleteClient,
  deleteDeal,
  listClients,
  listDeals,
  updateClient,
  updateDeal,
  getClientDetail,
  getCRMAnalytics,
  listEmailTemplates,
  listCampaigns,
  bulkUpdateClients,
  bulkDeleteClients,
  exportClients,
  importClients,
  createCampaign,
  sendCampaign
} from '../controllers/crm.controller';
import { authMiddleware, checkRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(checkRole(['ADMIN', 'MANAGER', 'MEMBER']));
router.get('/clients', listClients);
router.post('/clients', createClient);
router.patch('/clients/bulk', bulkUpdateClients);
router.delete('/clients/bulk', bulkDeleteClients);
router.get('/clients/export', exportClients);

const upload = multer({ storage: multer.memoryStorage() });
router.post('/clients/import', upload.single('file'), importClients);
router.put('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);
router.get('/clients/:id', getClientDetail);

router.get('/analytics', getCRMAnalytics);
router.get('/email-templates', listEmailTemplates);
router.get('/campaigns', listCampaigns);
router.post('/campaigns', createCampaign);
router.post('/campaigns/:id/send', sendCampaign);

router.get('/deals', listDeals);
router.post('/deals', createDeal);
router.put('/deals/:id', updateDeal);
router.delete('/deals/:id', deleteDeal);

export default router;
