// src/app/api/v1/users/account/update/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const updateProfileSchema = z.object({
    fullName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phonenumber: z.string().optional(), // Added phonenumber

});

export async function PUT(request: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validatedData = updateProfileSchema.parse(body);

        // Update only the provided fields, using Prisma's `data` object.
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: validatedData, // Prisma handles partial updates nicely.
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.format() }, { status: 400 });
          }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (error instanceof Error && typeof (error as any).code === 'string' && (error as any).code === 'P2002') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}