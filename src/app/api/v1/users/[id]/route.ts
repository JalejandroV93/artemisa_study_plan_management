// src/app/api/v1/users/[id]/route.ts (GET, PUT, DELETE)
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";

const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "TEACHER"]).optional(), // Allow role updates by admins
});

// GET /api/users/[id] - Get a single user by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  // Only admins can get any user, otherwise users can only get their own data
  if (user.role !== "ADMIN" && user.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const fetchedUser = await prisma.user.findUnique({
      where: { id: id },
      select: {
        // Select only necessary fields
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

    if (!fetchedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(fetchedUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const validatedData = updateUserSchema.parse(body); //Validate

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: validatedData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.format() }, { status: 400 });
    }
    // Check for unique constraint violation (PostgreSQL specific)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Username or document already exists." },
        { status: 409 }
      ); // 409 Conflict
    }
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete a user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  console.log("id" , id);
  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    await prisma.user.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
