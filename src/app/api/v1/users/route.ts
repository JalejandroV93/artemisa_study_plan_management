/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/v1/users/route.ts (GET and POST)
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth';
import { getCurrentUser } from '@/lib/auth';

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  document: z.string().min(1),  // Assuming 'document' can be a variety of identifiers. Adjust as needed.
  fullName: z.string().min(1),
  email: z.string().email().optional(),
  password: z.string().min(8), // Enforce minimum password length
  role: z.enum(['ADMIN', 'TEACHER']),
});

export async function GET(request: Request) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const searchTerm = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const isBlocked = searchParams.get('isBlocked');
  
    // NUEVO: Lectura de parámetros de ordenamiento
    const sortColumn = searchParams.get('sortColumn');
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
    const allowedSortColumns = ['username', 'fullName', 'email', 'document', 'role', 'createdAt'];
    let orderBy: any = {};
    if (sortColumn && allowedSortColumns.includes(sortColumn)) {
      orderBy[sortColumn] = sortOrder;
    } else {
      orderBy = { createdAt: 'desc' };
    }
  
    const skip = (page - 1) * limit;
  
    const where: any = {
      AND: [
        {
          OR: [
            { username: { contains: searchTerm, mode: 'insensitive' } },
            { fullName: { contains: searchTerm, mode: 'insensitive' } },
            { document: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
      ],
    };
  
    if (role) {
      where.AND.push({ role });
    }
    if (isBlocked) {
      where.AND.push({ isBlocked: isBlocked === 'true' });
    }
  
    try {
      const users = await prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy, // Se utiliza el objeto dinámico de ordenamiento
        select: {
          id: true,
          username: true,
          document: true,
          fullName: true,
          email: true,
          role: true,
          lastLogin: true,
          isBlocked: true,
          createdAt: true,
          updatedAt: true,
        },
      });
  
      const totalUsers = await prisma.user.count({ where });
  
      return NextResponse.json({
        users,
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
  }

export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    try {
        const body = await request.json();
        const validatedData = createUserSchema.parse(body); // Validate data
        const hashedPassword = await hashPassword(validatedData.password);

        const newUser = await prisma.user.create({
            data: {
                ...validatedData,
                password: hashedPassword,
            },
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.format() }, { status: 400 });
          }
          // Check for unique constraint violation (PostgreSQL specific)
          if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            return NextResponse.json({ error: 'Username or document already exists.' }, { status: 409 });  // 409 Conflict
          }
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}