import { Router } from 'express';
import {
  createClient,
  createDeal,
  deleteClient,
  deleteDeal,
  listClients,
  listDeals,
  updateClient,
  updateDeal
} from '../controllers/crm.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.get('/clients', listClients);
router.post('/clients', createClient);
router.put('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);

router.get('/deals', listDeals);
router.post('/deals', createDeal);
router.put('/deals/:id', updateDeal);
router.delete('/deals/:id', deleteDeal);

export default router;
