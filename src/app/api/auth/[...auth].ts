// app/api/auth/[...auth]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePasswords } from '@/lib/auth';
import { generateToken } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { action, ...data } = await req.json();

  if (action === 'register') {
    const { username, password, correo, nombre, rol } = data;
    const hashedPassword = await hashPassword(password);

    try {
      const user = await prisma.user.create({
        data: { 
          username, 
          password: hashedPassword, 
          correo, 
          nombre, 
          rol,
          estado: true, // default active state
          bloqueado: false // default unblocked state
        },
      });
      return NextResponse.json({ message: 'User registered successfully', user });
    } catch (error) {
      return NextResponse.json({ error: 'Error registering user' }, { status: 500 });
    }
  } else if (action === 'login') {
    const { username, password } = data;

    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid)
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });

      const token = generateToken({ id: user.id, username: user.username, rol: user.rol });
      return NextResponse.json({ message: 'Login successful', token });
    } catch (error) {
      return NextResponse.json({ error: 'Error logging in' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}