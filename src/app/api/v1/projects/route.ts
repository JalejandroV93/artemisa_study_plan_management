// src/app/api/v1/projects/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        name: 'asc', // Order alphabetically
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}