// src/app/api/v1/users/[id]/unblock/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    try {
        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: { isBlocked: false },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error unblocking user:", error);
        return NextResponse.json({ error: 'Failed to unblock user' }, { status: 500 });
    }
}