import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const listEmployees = async (req: Request, res: Response) => {
  const { department, position, search } = req.query as {
    department?: string;
    position?: string;
    search?: string;
  };

  const where: {
    department?: string;
    position?: string;
    OR?: Array<Record<string, unknown>>;
  } = {};

  if (department) where.department = department;
  if (position) where.position = position;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const employees = await prisma.employee.findMany({
    where,
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' }
  });

  res.json({ data: employees });
};

export const getEmployeeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: { user: { select: { email: true } } }
  });

  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  return res.json(employee);
};

export const createEmployee = async (req: Request, res: Response) => {
  const { userId, firstName, lastName, position, department, hireDate, salary, phone, avatarUrl } =
    req.body;

  const employee = await prisma.employee.create({
    data: {
      userId,
      firstName,
      lastName,
      position,
      department,
      hireDate: hireDate ? new Date(hireDate) : undefined,
      salary,
      phone,
      avatarUrl
    },
    include: { user: { select: { email: true } } }
  });

  res.status(201).json(employee);
};

export const updateEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, firstName, lastName, position, department, hireDate, salary, phone, avatarUrl } =
    req.body;

  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  const employee = await prisma.employee.update({
    where: { id },
    data: {
      userId,
      firstName,
      lastName,
      position,
      department,
      hireDate: hireDate ? new Date(hireDate) : undefined,
      salary,
      phone,
      avatarUrl
    },
    include: { user: { select: { email: true } } }
  });

  return res.json(employee);
};

export const deleteEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.employee.delete({ where: { id } });
  res.status(204).send();
};
