// src/app/api/v1/users/[id]/block/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { isBlocked: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error blocking user:", error);
    return NextResponse.json(
      { error: "Failed to block user" },
      { status: 500 }
    );
  }
}
