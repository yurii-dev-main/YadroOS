import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { switchOrganization as authSwitchOrg } from './auth.controller';
import { OrgRole } from '@prisma/client';

export const createOrganization = async (req: Request, res: Response) => {
  const { name, slug, industry } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ message: 'Name and slug are required' });
  }

  try {
    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        industry,
        members: {
          create: {
            userId: req.user!.userId,
            role: OrgRole.OWNER
          }
        }
      }
    });

    res.status(201).json(org);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create organization' });
  }
};

export const listMyOrganizations = async (req: Request, res: Response) => {
  const memberships = await prisma.organizationMember.findMany({
    where: { userId: req.user!.userId, isActive: true },
    include: { organization: true }
  });

  const orgs = memberships.map((m) => ({
    ...m.organization,
    myRole: m.role
  }));

  res.json({ data: orgs });
};

export const switchOrganization = authSwitchOrg;

export const getOrganizationMembers = async (req: Request, res: Response) => {
  const { id } = req.params;
  const members = await prisma.organizationMember.findMany({
    where: { organizationId: id },
    include: {
      user: {
        select: { id: true, email: true, name: true, avatarUrl: true }
      }
    }
  });

  res.json({ data: members });
};

export const addOrganizationMember = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, name, role } = req.body;
  
  if (!email || !name || !role) {
    return res.status(400).json({ message: 'Email, name and role are required' });
  }

  // Create user if not exists
  let user = await prisma.user.findUnique({ where: { email } });
  let inviteToken = null;
  
  if (!user) {
    // Generate a random password for now
    const passwordHash = 'placeholder'; 
    user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash, // in real app, we would send a set-password link
        isActive: true
      }
    });
    inviteToken = jwt.sign({ email, type: 'invite' }, env.jwtAccessSecret, { expiresIn: '7d' });
  }

  const member = await prisma.organizationMember.create({
    data: {
      organizationId: id,
      userId: user.id,
      role: role as OrgRole
    },
    include: {
      user: {
        select: { id: true, email: true, name: true, avatarUrl: true }
      }
    }
  });

  res.status(201).json({ ...member, inviteToken });
};

export const removeOrganizationMember = async (req: Request, res: Response) => {
  const { id, userId } = req.params;
  await prisma.organizationMember.delete({
    where: { organizationId_userId: { organizationId: id, userId } }
  });
  res.status(204).send();
};
