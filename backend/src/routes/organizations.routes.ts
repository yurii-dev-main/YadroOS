import { Router } from 'express';
import { OrgRole } from '@prisma/client';
import { authMiddleware, checkRole } from '../middleware/auth';
import {
  createOrganization,
  listMyOrganizations,
  switchOrganization,
  getOrganizationMembers,
  addOrganizationMember,
  removeOrganizationMember
} from '../controllers/organizations.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', createOrganization);
router.get('/', listMyOrganizations);

// Member management
router.get('/:id/members', checkRole([OrgRole.OWNER, OrgRole.ADMIN]), getOrganizationMembers);
router.post('/:id/members', checkRole([OrgRole.OWNER, OrgRole.ADMIN]), addOrganizationMember);
router.delete(
  '/:id/members/:userId',
  checkRole([OrgRole.OWNER, OrgRole.ADMIN]),
  removeOrganizationMember
);

export default router;
