import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Bouncer #1: validate the shape and content of the input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      // Security: don't reveal that the email exists.
      // Return the same generic message as a successful registration
      // would produce. This prevents attackers from discovering
      // which emails have accounts.
      return NextResponse.json(
        { error: "Registration failed. Please try again or use a different email." },
        { status: 400 }
      );
    }

    // Hash the password — cost factor 12 as required by the spec.
    // This is deliberately slow: it takes ~250ms to hash, which
    // makes brute-force attacks impractical.
    const passwordHash = await hash(password, 12);

    // Create the user in the filing cabinet
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
      },
    });

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
