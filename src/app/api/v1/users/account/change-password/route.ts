// src/app/api/v1/users/account/change-password/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser, hashPassword, validateCredentials } from '@/lib/auth';

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    // Validate the current password.
    await validateCredentials(user.username, currentPassword);

    // Hash the new password.
    const hashedNewPassword = await hashPassword(newPassword);

    // Update the password.
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
      if (error instanceof z.ZodError) {
          return NextResponse.json({ error: error.format() }, { status: 400 });
      }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to change password' }, { status: 500 }); // Return specific error message.
  }
}