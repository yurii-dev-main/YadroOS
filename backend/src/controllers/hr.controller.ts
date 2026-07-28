import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const listEmployees = async (req: Request, res: Response) => {
  try {
    const { department, position, search } = req.query as {
      department?: string;
      position?: string;
      search?: string;
    };

    const where: {
      organizationId: string;
      department?: string;
      position?: string;
      OR?: Array<Record<string, unknown>>;
    } = { organizationId: req.user!.organizationId };

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
      include: {},
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: employees });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {}
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    return res.json(employee);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { userId, firstName, lastName, position, department, hireDate, salary, phone, avatarUrl } = req.body;

    const employee = await prisma.employee.create({
      data: {
        organizationId: req.user!.organizationId,
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
      include: {}
    });

    res.status(201).json(employee);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, firstName, lastName, position, department, hireDate, salary, phone, avatarUrl } = req.body;

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
      include: {}
    });

    return res.json(employee);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.employee.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
