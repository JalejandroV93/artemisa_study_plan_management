// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth';
import { verifyToken } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await verifyToken(token);
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await verifyToken(token);
    const { nombre, username, password, correo, rol } = await req.json();
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { 
        nombre, 
        username, 
        password: hashedPassword, 
        correo, 
        rol,
        estado: true, // default active state
        bloqueado: false // default unblocked state
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
}