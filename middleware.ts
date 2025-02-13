//middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export function middleware(req: NextRequest) {
  const publicPaths = ['/login'];

  if (publicPaths.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    verifyToken(token);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}